package store

import (
	"database/sql"
	"fmt"
	"log"
	"raceday/Server/Source/raceday/model"
	"time"

	"github.com/google/uuid"
)

type EventRetrievalCriteria struct {
	WindowStart float64

	// If -1, all events that start on or after WindowStart are retrieved.
	WindowEnd *float64

	// If not set, UTC is assumed
	TimeZone *time.Location
}

func (dh DatastoreHandle) CreateEvent(accessToken *AccessToken, name string, start time.Time, description, locationId, seriesId *string) (string, error) {
	eventId, err := uuid.NewRandom()
	if err != nil {
		return "", nil
	}

	_, err = dh.db.Exec(
		`INSERT INTO event
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		eventId,
		name,
		start.UTC(),
		description,
		locationId,
		seriesId,
	)
	if err != nil {
		return "", err
	}

	dh.auditEventAction(accessToken.UserID, eventId.String(), "added", nil)

	return eventId.String(), nil
}

func (dh DatastoreHandle) DeleteEvent(accessToken *AccessToken, id string) error {
	tx, err := dh.db.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	dh.auditEventAction(accessToken.UserID, id, "deleted", tx)

	result, err := tx.Exec(
		`DELETE FROM broadcast
          WHERE event_id = $1`,
		id,
	)
	if err != nil {
		return err
	}

	result, err = tx.Exec(
		`DELETE FROM event
          WHERE id = $1`,
		id,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return &EventNotFoundError{}
	}

	return nil
}

func (dh DatastoreHandle) GetEvent(id string) (*model.Event, error) {
	rows, err := dh.db.Query(
		`SELECT *
		   FROM events
		  WHERE event_id = $1`,
		id,
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	if rows.Next() {
		return newEventFromRow(rows)
	} else {
		return nil, nil
	}
}

func (dh DatastoreHandle) GetEvents(criteria EventRetrievalCriteria) ([]model.Event, error) {
	ret := make([]model.Event, 0)

	if criteria == (EventRetrievalCriteria{}) {
		return ret, nil
	}

	if criteria.TimeZone == nil {
		criteria.TimeZone = time.UTC
	}

	params := make([]interface{}, 0)

	comparison := "="
	if criteria.WindowEnd != nil {
		comparison = ">="
	}

	params = append(params, criteria.WindowStart)
	where := fmt.Sprintf("date_trunc('day', event_start AT TIME ZONE '%s') %s date_trunc('day', to_timestamp($%d) AT TIME ZONE '%s')", criteria.TimeZone.String(), comparison, len(params), criteria.TimeZone.String())

	if (criteria.WindowEnd != nil) && (*criteria.WindowEnd >= 0) {
		params = append(params, *criteria.WindowEnd)
		where += fmt.Sprintf(" AND date_trunc('day', event_start AT TIME ZONE '%s') <= date_trunc('day', to_timestamp($%d) AT TIME ZONE '%s')", criteria.TimeZone.String(), len(params), criteria.TimeZone.String())
	}

	rows, err := dh.db.Query(
		fmt.Sprintf(
			`SELECT *
			   FROM events
			  WHERE %s
			  ORDER BY event_start, series_name, event_name, location_name`,
			where,
		),
		params...,
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		event, err := newEventFromRow(rows)
		if err != nil {
			return nil, err
		}

		ret = append(ret, *event)
	}

	return ret, nil
}

func (dh DatastoreHandle) UpdateEvent(accessToken *AccessToken, id, name string, start time.Time, description, locationId, seriesId *string) error {
	result, err := dh.db.Exec(
		`UPDATE event
            SET name = $1,
                start = $2,
                description = $3,
                location_id = $4,
                series_id = $5
          WHERE id = $6`,
		name,
		start.UTC(),
		description,
		locationId,
		seriesId,
		id,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return &EventNotFoundError{}
	}

	dh.auditEventAction(accessToken.UserID, id, "updated", nil)

	return nil
}

func (dh DatastoreHandle) auditEventAction(userId, eventId, action string, tx *sql.Tx) {
	event, err := dh.GetEvent(eventId)
	if err != nil {
		log.Print(err)
		return
	}

	if event == nil {
		log.Printf("event with ID %s not found", eventId)
		return
	}

	itemDescription := event.Name
	if event.Series.Name != "" {
		itemDescription += " - " + event.Series.Name
	}
	if event.Location.Name != "" {
		itemDescription += " @ " + event.Location.Name
	}

	start := time.Unix(int64(event.Start), 0)
	itemDescription += " (" + start.UTC().Format("2006/01/02 15:04 MST") + ")"

	dh.auditAction(userId, "event", itemDescription, action, tx)
}

func newEventFromRow(rows *sql.Rows) (*model.Event, error) {
	var (
		eventIdVal             string
		eventNameVal           string
		eventStartVal          time.Time
		eventDescriptionVal    sql.NullString
		locationIdVal          sql.NullString
		locationNameVal        sql.NullString
		locationDescriptionVal sql.NullString
		seriesIdVal            sql.NullString
		seriesNameVal          sql.NullString
		seriesDescriptionVal   sql.NullString
	)

	err := rows.Scan(
		&eventIdVal,
		&eventNameVal,
		&eventStartVal,
		&eventDescriptionVal,
		&locationIdVal,
		&locationNameVal,
		&locationDescriptionVal,
		&seriesIdVal,
		&seriesNameVal,
		&seriesDescriptionVal,
	)
	if err != nil {
		return nil, err
	}

	ret := model.Event{
		Id:    eventIdVal,
		Name:  eventNameVal,
		Start: float64(eventStartVal.Unix()),
	}
	if eventDescriptionVal.Valid {
		ret.Description = eventDescriptionVal.String
	}

	location := model.Location{}
	if locationIdVal.Valid {
		location.Id = locationIdVal.String

		if locationNameVal.Valid {
			location.Name = locationNameVal.String
		}
		if locationDescriptionVal.Valid {
			location.Description = locationDescriptionVal.String
		}
	}

	if location != (model.Location{}) {
		ret.Location = location
	}

	series := model.Series{}
	if seriesIdVal.Valid {
		series.Id = seriesIdVal.String

		if seriesNameVal.Valid {
			series.Name = seriesNameVal.String
		}
		if seriesDescriptionVal.Valid {
			series.Description = seriesDescriptionVal.String
		}
	}

	if series != (model.Series{}) {
		ret.Series = series
	}

	return &ret, nil
}

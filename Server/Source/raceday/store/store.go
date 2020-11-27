package store

import (
	"database/sql"
	"fmt"
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/model"

	_ "github.com/lib/pq"
)

var Datastore DatastoreHandle

type DatastoreHandle struct {
	db *sql.DB
}

type BroadcastRetrievalCriteria struct {
	EventID    *string
	EventStart *float64
}

func Initialize(settings raceday.DatabaseSettings) (err error) {
	connStr := fmt.Sprintf(
		"host=%s port=%d dbname=%s user=%s password=%s",
		settings.DatabaseHost,
		settings.DatabasePort,
		settings.DatabaseName,
		settings.DatabaseUser,
		settings.DatabasePassword,
	)

	Datastore.db, err = sql.Open("postgres", connStr)
	return
}

func (dh DatastoreHandle) GetBroadcasts(criteria BroadcastRetrievalCriteria) ([]model.Broadcast, error) {
	ret := make([]model.Broadcast, 0)

	if criteria == (BroadcastRetrievalCriteria{}) {
		return ret, nil
	}

	if criteria.EventID != nil {
		event, err := dh.GetEvent(*criteria.EventID)
		if err != nil {
			return nil, err
		}

		if event == nil {
			return nil, &EventNotFoundError{}
		}
	}

	sql := ""
	params := make([]interface{}, 0)

	if criteria.EventID != nil {
		params = append(params, *criteria.EventID)
		sql += fmt.Sprintf("event_id = $%d", len(params))
	}
	if criteria.EventStart != nil {
		params = append(params, *criteria.EventStart)

		if sql != "" {
			sql += " AND "
		}
		sql += fmt.Sprintf("date_trunc(start, 'day') = date_trunc(to_timestamp($%d), 'day')", len(params))
	}

	rows, err := dh.db.Query(
		fmt.Sprintf(
			`SELECT id,
					type,
					url
			   FROM broadcast
			  WHERE %s
			  ORDER BY id ASC`,
			sql,
		),
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var (
			idVal  string
			urlVal string
		)

		err = rows.Scan(&idVal, &urlVal)
		if err != nil {
			return nil, err
		}

		thisStream := model.Broadcast{
			Id:  idVal,
			Url: urlVal,
		}
		ret = append(ret, thisStream)
	}

	return ret, nil
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

func (dh DatastoreHandle) GetEvents() ([]model.Event, error) {
	ret := make([]model.Event, 0)

	rows, err := dh.db.Query(
		`SELECT *
		   FROM events
		  ORDER BY event_name`,
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

func newEventFromRow(rows *sql.Rows) (*model.Event, error) {
	var (
		eventIdVal             string
		eventNameVal           string
		eventStartVal          float64
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
		Start: eventStartVal,
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
		ret.Location = &location
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
		ret.Series = &series
	}

	return &ret, nil
}

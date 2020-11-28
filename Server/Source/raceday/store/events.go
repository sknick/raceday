package store

import (
	"database/sql"
	"fmt"
	"raceday/Server/Source/raceday/model"
	"time"
)

type EventRetrievalCriteria struct {
	WindowStart float64
	WindowEnd   *float64
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

	params := make([]interface{}, 0)

	comparison := "="
	if criteria.WindowEnd != nil {
		comparison = ">="
	}

	params = append(params, criteria.WindowStart)
	where := fmt.Sprintf("date_trunc('day', event_start) %s date_trunc('day', to_timestamp($%d))", comparison, len(params))

	if criteria.WindowEnd != nil {
		params = append(params, *criteria.WindowEnd)
		where += fmt.Sprintf(" AND date_trunc('day', event_start) <= date_trunc('day', to_timestamp($%d))", len(params))
	}

	rows, err := dh.db.Query(
		fmt.Sprintf(
			`SELECT *
			   FROM events
			  WHERE %s
			  ORDER BY event_name`,
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

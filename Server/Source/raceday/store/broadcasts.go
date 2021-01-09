package store

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"raceday/Server/Source/raceday/model"
	"time"
)

type BroadcastRetrievalCriteria struct {
	EventID         *string
	EventStart      *float64
	IncludeAllAfter bool
}

func (dh DatastoreHandle) CreateBroadcast(type_ string, eventId string, url string) (string, error) {
	rows, err := dh.db.Query(
		`SELECT COUNT(id) AS num
           FROM event
          WHERE id = $1`,
		eventId,
	)
	if err != nil {
		return "", err
	}

	defer rows.Close()

	if rows.Next() {
		var num int

		err = rows.Scan(&num)
		if err != nil {
			return "", err
		}

		if num == 0 {
			return "", &EventNotFoundError{}
		}
	} else {
		return "", errors.New("unable to advance row set")
	}

	broadcastId, err := uuid.NewRandom()
	if err != nil {
		return "", nil
	}

	_, err = dh.db.Exec(
		`INSERT INTO broadcast
		 VALUES ($1, $2, $3, $4)`,
		broadcastId,
		type_,
		eventId,
		url,
	)
	if err != nil {
		return "", err
	}

	return broadcastId.String(), nil
}

func (dh DatastoreHandle) DeleteBroadcast(id string) error {
	result, err := dh.db.Exec(
		`DELETE FROM broadcast
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

	if rowsAffected == 0 {
		return &BroadcastNotFoundError{}
	}

	return nil
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

	where := ""
	params := make([]interface{}, 0)

	if criteria.EventID != nil {
		params = append(params, *criteria.EventID)
		where += fmt.Sprintf("event_id = $%d", len(params))
	}
	if criteria.EventStart != nil {
		operator := "="
		if criteria.IncludeAllAfter {
			operator = ">="
		}

		params = append(params, *criteria.EventStart)

		if where != "" {
			where += " AND "
		}
		where += fmt.Sprintf("date_trunc('day', event_start) %s date_trunc('day', to_timestamp($%d))", operator, len(params))
	}

	rows, err := dh.db.Query(
		fmt.Sprintf(
			`SELECT broadcast_id,
					broadcast_type,
					broadcast_url,
					event_id,
					event_name,
					event_start,
					event_description,
					location_id,
					location_name,
					location_description,
					series_id,
					series_name,
					series_description
			   FROM broadcasts
			  WHERE %s`,
			where,
		),
		params...,
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var (
			broadcastIdVal         string
			broadcastTypeVal       string
			broadcastUrlVal        sql.NullString
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

		err = rows.Scan(
			&broadcastIdVal,
			&broadcastTypeVal,
			&broadcastUrlVal,
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

		thisLocation := model.Location{}
		if locationIdVal.Valid {
			thisLocation = model.Location{
				Id:   locationIdVal.String,
				Name: locationNameVal.String,
			}
			if locationDescriptionVal.Valid {
				thisLocation.Description = locationDescriptionVal.String
			}
		}

		thisSeries := model.Series{}
		if seriesIdVal.Valid {
			thisSeries = model.Series{
				Id:   seriesIdVal.String,
				Name: seriesNameVal.String,
			}
			if seriesDescriptionVal.Valid {
				thisSeries.Description = seriesDescriptionVal.String
			}
		}

		thisEvent := model.Event{
			Id:       eventIdVal,
			Name:     eventNameVal,
			Start:    float64(eventStartVal.Unix()),
			Location: thisLocation,
			Series:   thisSeries,
		}
		if eventDescriptionVal.Valid {
			thisEvent.Description = eventDescriptionVal.String
		}

		thisBroadcast := model.Broadcast{
			Id:    broadcastIdVal,
			Type_: broadcastTypeVal,
			Event: thisEvent,
		}
		if broadcastUrlVal.Valid {
			thisBroadcast.Url = broadcastUrlVal.String
		}

		ret = append(ret, thisBroadcast)
	}

	return ret, nil
}

func (dh DatastoreHandle) UpdateBroadcast(id, type_, eventId string, url *string) error {
	rows, err := dh.db.Query(
		`SELECT COUNT(id) AS num
           FROM event
          WHERE id = $1`,
		eventId,
	)
	if err != nil {
		return nil
	}

	defer rows.Close()

	if rows.Next() {
		var num int

		err = rows.Scan(&num)
		if err != nil {
			return err
		}

		if num == 0 {
			return &EventNotFoundError{}
		}
	} else {
		return errors.New("unable to advance row set")
	}

	result, err := dh.db.Exec(
		`UPDATE broadcast
            SET type = $1,
                event_id = $2,
                url = $3
          WHERE id = $4`,
		type_,
		eventId,
		url,
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
		return &BroadcastNotFoundError{}
	}

	return nil
}

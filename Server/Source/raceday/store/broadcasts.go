package store

import (
	"database/sql"
	"errors"
	"fmt"
	"raceday/Server/Source/raceday/model"
	"time"

	"github.com/google/uuid"
)

type BroadcastRetrievalCriteria struct {
	EventID         *string
	EventStart      *float64
	IncludeAllAfter bool
}

func (dh DatastoreHandle) CreateBroadcast(type_ model.BroadcastType, eventId string, langIds []string, description, url *string, geoblocked, paid *bool) (string, error) {
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
		return "", err
	}

	_, err = dh.db.Exec(
		`INSERT INTO broadcast (id, type, event_id, lang_ids, description, url, geoblocked, paid)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		broadcastId,
		type_,
		eventId,
		langIds,
		dh.getNullString(description),
		dh.getNullString(url),
		dh.getNullBool(geoblocked),
		dh.getNullBool(paid),
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
					broadcast_lang_ids,
					broadcast_geoblocked,
					braodcast_paid,
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
			broadcastIdVal          string
			broadcastTypeVal        string
			broadcastDescriptionVal sql.NullString
			broadcastUrlVal         sql.NullString
			broadcastLangIdsVal     []string
			broadcastGeoBlockedVal  sql.NullBool
			broadcastPaidVal        sql.NullBool
			eventIdVal              string
			eventNameVal            string
			eventStartVal           time.Time
			eventDescriptionVal     sql.NullString
			locationIdVal           sql.NullString
			locationNameVal         sql.NullString
			locationDescriptionVal  sql.NullString
			seriesIdVal             sql.NullString
			seriesNameVal           sql.NullString
			seriesDescriptionVal    sql.NullString
		)

		err = rows.Scan(
			&broadcastIdVal,
			&broadcastTypeVal,
			&broadcastDescriptionVal,
			&broadcastUrlVal,
			&broadcastLangIdsVal,
			&broadcastGeoBlockedVal,
			&broadcastPaidVal,
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
			Id:      broadcastIdVal,
			Type_:   model.BroadcastTypeFromString(broadcastTypeVal),
			Event:   thisEvent,
			LangIds: broadcastLangIdsVal,
		}
		if broadcastDescriptionVal.Valid {
			thisBroadcast.Description = broadcastDescriptionVal.String
		}
		if broadcastUrlVal.Valid {
			thisBroadcast.Url = broadcastUrlVal.String
		}
		if broadcastGeoBlockedVal.Valid {
			thisBroadcast.Geoblocked = broadcastGeoBlockedVal.Bool
		}
		if broadcastPaidVal.Valid {
			thisBroadcast.Paid = broadcastPaidVal.Bool
		}

		ret = append(ret, thisBroadcast)
	}

	return ret, nil
}

func (dh DatastoreHandle) UpdateBroadcast(id string, type_ model.BroadcastType, eventId string, langIds []string, description, url *string, geoblocked, paid *bool) error {
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
				lang_ids = $3,
				description = $4,
                url = $5,
				geoblocked = $6,
				paid = $7
          WHERE id = $8`,
		type_,
		eventId,
		langIds,
		dh.getNullString(description),
		dh.getNullString(url),
		dh.getNullBool(geoblocked),
		dh.getNullBool(paid),
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

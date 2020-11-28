package store

import (
	"database/sql"
	"fmt"
	"raceday/Server/Source/raceday/model"
)

type BroadcastRetrievalCriteria struct {
	EventID    *string
	EventStart *float64
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
		params = append(params, *criteria.EventStart)

		if where != "" {
			where += " AND "
		}
		where += fmt.Sprintf("date_trunc('day', event_start) = date_trunc('day', to_timestamp($%d))", len(params))
	}

	rows, err := dh.db.Query(
		fmt.Sprintf(
			`SELECT broadcast_id,
					broadcast_type,
					broadcast_url
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
			idVal   string
			typeVal string
			urlVal  sql.NullString
		)

		err = rows.Scan(&idVal, &typeVal, &urlVal)
		if err != nil {
			return nil, err
		}

		thisStream := model.Broadcast{
			Id:    idVal,
			Type_: typeVal,
		}
		if urlVal.Valid {
			thisStream.Url = urlVal.String
		}

		ret = append(ret, thisStream)
	}

	return ret, nil
}

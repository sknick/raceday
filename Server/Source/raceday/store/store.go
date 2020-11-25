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

func (dh DatastoreHandle) GetEvent(id string) (*model.Event, error) {
	row := dh.db.QueryRow(
		`SELECT id,
				name,
				description
		   FROM event
		  WHERE id = $1`,
		id,
	)

	var (
		idVal          string
		nameVal        string
		descriptionVal string
	)

	err := row.Scan(&idVal, &nameVal, &descriptionVal)
	if err != nil {
		return nil, err
	}

	ret := model.Event{
		Id:          idVal,
		Name:        nameVal,
		Description: descriptionVal,
	}

	return &ret, nil
}

func (dh DatastoreHandle) GetEvents() ([]model.Event, error) {
	ret := make([]model.Event, 0)

	rows, err := dh.db.Query(
		`SELECT id,
				name,
				description
		   FROM event
		  ORDER BY name ASC`,
	)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var (
			idVal          string
			nameVal        string
			descriptionVal string
		)

		err = rows.Scan(&idVal, &nameVal, &descriptionVal)
		if err != nil {
			return nil, err
		}

		thisEvent := model.Event{
			Id:          idVal,
			Name:        nameVal,
			Description: descriptionVal,
		}
		ret = append(ret, thisEvent)
	}

	return ret, nil
}

func (dh DatastoreHandle) GetStreams(eventId string) ([]model.Stream, error) {
	ret := make([]model.Stream, 0)

	event, err := dh.GetEvent(eventId)
	if err != nil {
		return nil, err
	}

	if event == nil {
		return nil, &EventNotFoundError{}
	}

	rows, err := dh.db.Query(
		`SELECT id,
				url
		   FROM stream
		  WHERE event_id = $1
		  ORDER BY id ASC`,
		eventId,
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

		thisStream := model.Stream{
			Id:  idVal,
			Url: urlVal,
		}
		ret = append(ret, thisStream)
	}

	return ret, nil
}

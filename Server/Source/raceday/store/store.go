package store

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"raceday/Server/Source/raceday"
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

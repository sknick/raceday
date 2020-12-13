package store

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"net"
	"raceday/Server/Source/raceday"
)

var Datastore DatastoreHandle

type DatastoreHandle struct {
	db *sql.DB
}

type AccessToken struct {
	ID          string
	WhenCreated int
	UserID      string
	IPAddress   string
}

// Returns a new access token.
func NewAccessToken(id string, whenCreated int, userId string, ipAddress string) AccessToken {
	return AccessToken{
		ID:          id,
		WhenCreated: whenCreated,
		UserID:      userId,
		IPAddress:   ipAddress,
	}
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

// Retrieves the access token with the specified ID or nil if no such token exists.
func (dh DatastoreHandle) GetAccessToken(id string) (*AccessToken, error) {
	var whenCreated int
	var userId string
	var inet net.IPNet

	rows, err := dh.db.Query(
		`SELECT id,
			    ROUND(EXTRACT(epoch FROM when_created)) AS when_created,
				user_id,
				ip_address
		   FROM access_token
          WHERE id = $1`,
		id,
	)
	if err != nil {
		return nil, err
	}

	if rows.Next() {
		err = rows.Scan(&id, &whenCreated, &userId, &inet)
	} else {
		return nil, nil
	}

	ret := NewAccessToken(id, whenCreated, userId, inet.IP.String())
	return &ret, nil
}

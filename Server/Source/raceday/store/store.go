package store

import (
	"crypto"
	"database/sql"
	"encoding/hex"
	"fmt"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"net"
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/model"
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

// Creates and saves an access token, returning its unique ID.
func (dh DatastoreHandle) CreateAccessToken(username string, host string) (*string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	idStr := id.String()

	_, err = dh.db.Exec(
		`INSERT INTO access_token (id, when_created, user_id, ip_address)
         VALUES ($1, NOW(), $2, $3)`,
		idStr,
		username,
		host,
	)
	if err != nil {
		return nil, err
	}

	return &idStr, nil
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

func (dh DatastoreHandle) GetSystemUser(id string) (*model.SystemUser, error) {
	var firstNameVal *string
	var lastNameVal *string
	var emailVal *string
	var whenCreatedVal int
	var whoCreatedVal *string
	var whenUpdatedVal *int
	var whoUpdatedVal *string
	var enabledVal bool

	rows, err := dh.db.Query(
		`SELECT first_name,
			    last_name,
                email,
                ROUND(EXTRACT(epoch FROM when_created)) AS when_created,
				who_created,
				ROUND(EXTRACT(epoch FROM when_updated)) AS when_updated,
				who_updated,
				enabled
           FROM system_user
          WHERE id = $1`,
		id,
	)
	if err != nil {
		return nil, err
	}

	if rows.Next() {
		err = rows.Scan(&firstNameVal, &lastNameVal, &emailVal, &whenCreatedVal, &whoCreatedVal, &whenUpdatedVal, &whoUpdatedVal, &enabledVal)
		if err != nil {
			return nil, err
		}
	}

	firstName := ""
	if firstNameVal != nil {
		firstName = *firstNameVal
	}

	lastName := ""
	if lastNameVal != nil {
		lastName = *lastNameVal
	}

	email := ""
	if emailVal != nil {
		email = *emailVal
	}

	whoCreated := ""
	if whoCreatedVal != nil {
		whoCreated = *whoCreatedVal
	}

	whenUpdated := -1
	if whenUpdatedVal != nil {
		whenUpdated = *whenUpdatedVal
	}

	whoUpdated := ""
	if whoUpdatedVal != nil {
		whoUpdated = *whoUpdatedVal
	}

	ret := model.NewSystemUser(id, firstName, lastName, email, int32(whenCreatedVal), whoCreated, int32(whenUpdated), whoUpdated, enabledVal)
	return &ret, nil
}

// Returns whether or not the specified credentials refer to a defined user.
func (dh DatastoreHandle) IsUserValid(username string, password string) (bool, error) {
	var salt string

	rows, err := dh.db.Query(
		`SELECT salt
           FROM system_user
          WHERE id = $1`,
		username,
	)
	if err != nil {
		return false, err
	}

	if rows.Next() {
		err = rows.Scan(&salt)
		if err != nil {
			return false, err
		}
	} else {
		return false, nil
	}

	hasher := crypto.BLAKE2s_256.New()
	hasher.Write([]byte(password + salt))

	passwordHash := hex.EncodeToString(hasher.Sum(nil))

	var num int

	rows, err = dh.db.Query(
		`SELECT COUNT(id) AS num
           FROM system_user
          WHERE id = $1
            AND password_hash = $2
            AND enabled = TRUE`,
		username,
		passwordHash,
	)
	if err != nil {
		return false, err
	}

	if rows.Next() {
		err = rows.Scan(&num)
		if err != nil {
			return false, err
		}
	} else {
		return false, nil
	}

	if num == 1 {
		return true, nil
	} else {
		return false, nil
	}
}

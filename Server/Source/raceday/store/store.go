package store

import (
	"crypto"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/model"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
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
		"host=%s port=%d dbname=%s user=%s password=%s sslmode=disable",
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
	var whenCreated float64
	var userId string
	var inet string

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

	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&id, &whenCreated, &userId, &inet)
		if err != nil {
			return nil, err
		}
	} else {
		return nil, nil
	}

	ret := NewAccessToken(id, int(whenCreated), userId, inet)
	return &ret, nil
}

func (dh DatastoreHandle) GetLangs() ([]model.Lang, error) {
	ret := make([]model.Lang, 0)

	var id string
	var htmlCode string
	var countryCode string
	var priorityListing bool

	rows, err := dh.db.Query(
		`SELECT id,
				html_code,
				country_code,
				priority_listing
		   FROM lang
		  ORDER BY id ASC`,
	)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&id, &htmlCode, &countryCode, &priorityListing)
		if err != nil {
			return nil, err
		}

		ret = append(ret, model.NewLang(id, htmlCode, countryCode, priorityListing))
	}

	return ret, nil
}

func (dh DatastoreHandle) GetSystemUser(id string) (*model.SystemUser, error) {
	var firstNameVal *string
	var lastNameVal *string
	var emailVal *string
	var whenCreatedVal int
	var whoCreatedVal *string
	var whenUpdatedVal *int32
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

	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&firstNameVal, &lastNameVal, &emailVal, &whenCreatedVal, &whoCreatedVal, &whenUpdatedVal, &whoUpdatedVal, &enabledVal)
		if err != nil {
			return nil, err
		}
	}

	ret := model.NewSystemUser(id, firstNameVal, lastNameVal, emailVal, int32(whenCreatedVal), whoCreatedVal, whenUpdatedVal, whoUpdatedVal, enabledVal)
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

	defer rows.Close()

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

func (dh DatastoreHandle) auditAction(userId, tableName, itemDescription, action string, tx *sql.Tx) {
	id, err := uuid.NewRandom()
	if err != nil {
		log.Print(err)
		return
	}

	if tx == nil {
		_, err = dh.db.Exec(
			`INSERT INTO audit_log
			VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)`,
			id,
			userId,
			tableName,
			itemDescription,
			action,
		)
	} else {
		_, err = tx.Exec(
			`INSERT INTO audit_log
			VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)`,
			id,
			userId,
			tableName,
			itemDescription,
			action,
		)
	}

	if err != nil {
		log.Print(err)
		return
	}
}

func (dh DatastoreHandle) getNullBool(value *bool) sql.NullBool {
	ret := sql.NullBool{
		Valid: false,
	}
	if value != nil {
		ret.Valid = true
		ret.Bool = *value
	}

	return ret
}

func (dh DatastoreHandle) getNullString(value *string) sql.NullString {
	ret := sql.NullString{
		Valid: false,
	}
	if value != nil {
		ret.Valid = true
		ret.String = *value
	}

	return ret
}

package store

import (
	"database/sql"
	"raceday/Server/Source/raceday/model"

	"github.com/google/uuid"
)

func (dh DatastoreHandle) CreateLocation(name string, description *string) (string, error) {
	locationId, err := uuid.NewRandom()
	if err != nil {
		return "", nil
	}

	_, err = dh.db.Exec(
		`INSERT INTO location
		 VALUES ($1, $2, $3)`,
		locationId,
		name,
		description,
	)
	if err != nil {
		return "", err
	}

	return locationId.String(), nil
}

func (dh DatastoreHandle) GetLocations() ([]model.Location, error) {
	ret := make([]model.Location, 0)

	rows, err := dh.db.Query(
		`SELECT *
		   FROM location
		  ORDER BY name`,
	)
	if err != nil {
		return ret, err
	}

	defer rows.Close()

	for rows.Next() {
		location, err := newLocationFromRow(rows)
		if err != nil {
			return nil, err
		}

		ret = append(ret, *location)
	}

	return ret, nil
}

func (dh DatastoreHandle) UpdateLocation(id, name string, description *string) error {
	result, err := dh.db.Exec(
		`UPDATE location
            SET name = $1,
                description = $2
          WHERE id = $3`,
		name,
		description,
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
		return &LocationNotFoundError{}
	}

	return nil
}

func newLocationFromRow(rows *sql.Rows) (*model.Location, error) {
	var (
		idVal          string
		nameVal        string
		descriptionVal sql.NullString
	)

	err := rows.Scan(
		&idVal,
		&nameVal,
		&descriptionVal,
	)
	if err != nil {
		return nil, err
	}

	ret := model.Location{
		Id:   idVal,
		Name: nameVal,
	}
	if descriptionVal.Valid {
		ret.Description = &descriptionVal.String
	}

	return &ret, nil
}

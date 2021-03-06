package store

import (
	"database/sql"
	"raceday/Server/Source/raceday/model"

	"github.com/google/uuid"
)

func (dh DatastoreHandle) CreateSeries(name string, description *string) (string, error) {
	seriesId, err := uuid.NewRandom()
	if err != nil {
		return "", nil
	}

	_, err = dh.db.Exec(
		`INSERT INTO series
		 VALUES ($1, $2, $3)`,
		seriesId,
		name,
		description,
	)
	if err != nil {
		return "", err
	}

	return seriesId.String(), nil
}

func (dh DatastoreHandle) GetSeries() ([]model.Series, error) {
	ret := make([]model.Series, 0)

	rows, err := dh.db.Query(
		`SELECT *
		   FROM series
		  ORDER BY name`,
	)
	if err != nil {
		return ret, err
	}

	defer rows.Close()

	for rows.Next() {
		series, err := newSeriesFromRow(rows)
		if err != nil {
			return nil, err
		}

		ret = append(ret, *series)
	}

	return ret, nil
}

func (dh DatastoreHandle) UpdateSeries(id, name string, description *string) error {
	result, err := dh.db.Exec(
		`UPDATE series
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
		return &SeriesNotFoundError{}
	}

	return nil
}

func newSeriesFromRow(rows *sql.Rows) (*model.Series, error) {
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

	ret := model.Series{
		Id:   idVal,
		Name: nameVal,
	}
	if descriptionVal.Valid {
		ret.Description = &descriptionVal.String
	}

	return &ret, nil
}

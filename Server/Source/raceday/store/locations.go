package store

import "github.com/google/uuid"

func (dh DatastoreHandle) CreateLocation(name string, description *string) (string, error) {
	locationId, err := uuid.NewRandom()
	if err != nil {
		return "", nil
	}

	descriptionParam := "NULL"
	if description != nil {
		descriptionParam = *description
	}

	_, err = dh.db.Exec(
		`INSERT INTO location
		 VALUES ($1, $2, $3)`,
		locationId,
		name,
		descriptionParam,
	)
	if err != nil {
		return "", err
	}

	return locationId.String(), nil
}

func (dh DatastoreHandle) DeleteLocation(id string) error {
	result, err := dh.db.Exec(
		`DELETE FROM location
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
		return &LocationNotFoundError{}
	}

	return nil
}

func (dh DatastoreHandle) UpdateLocation(id, name string, description *string) error {
	descriptionParam := "NULL"
	if description != nil {
		descriptionParam = *description
	}

	result, err := dh.db.Exec(
		`UPDATE location
            SET name = $1,
                description = $2
          WHERE id = $3`,
		name,
		descriptionParam,
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

package formats

import "errors"

type GoogleDoc struct {
	GoogleServiceAccountKeyFile string
}

func (gd GoogleDoc) GetName() string {
	return "Google Doc"
}

func (gd GoogleDoc) Export() error {
	if gd.GoogleServiceAccountKeyFile == "" {
		return errors.New("service account key file not set")
	}

	return nil
}

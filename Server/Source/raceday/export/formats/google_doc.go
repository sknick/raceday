package formats

import (
	"context"
	"errors"

	docs "google.golang.org/api/docs/v1"
	"google.golang.org/api/option"
)

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

	ctx := context.Background()

	googleService, err := docs.NewService(ctx, option.WithCredentialsFile(gd.GoogleServiceAccountKeyFile))
	if err != nil {
		return err
	}

	docsService := docs.NewDocumentsService(googleService)

	newDoc := docs.Document{
		Title: "Race Day Export",
	}

	req := docsService.Create(&newDoc)

	_, err = req.Do()
	if err != nil {
		return err
	}

	return nil
}

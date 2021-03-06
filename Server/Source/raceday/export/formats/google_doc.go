package formats

import (
	"context"
	"errors"
	"log"

	docs "google.golang.org/api/docs/v1"
	drive "google.golang.org/api/drive/v3"
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

	// Get service instances so we can communicate with the Google Drives and Docs APIs:
	drivesApi, err := drive.NewService(ctx, option.WithCredentialsFile(gd.GoogleServiceAccountKeyFile))
	if err != nil {
		return err
	}

	docsApi, err := docs.NewService(ctx, option.WithCredentialsFile(gd.GoogleServiceAccountKeyFile))
	if err != nil {
		return err
	}

	// For updating our new document's permissions and getting a link to it
	permissionsService := drive.NewPermissionsService(drivesApi)
	// filesService := drive.NewFilesService(drivesApi)

	// For creating the new document
	docsService := docs.NewDocumentsService(docsApi)

	// First create the document:
	newDoc := docs.Document{
		Title: "Race Day Export",
	}

	docsCreateReq := docsService.Create(&newDoc)

	doc, err := docsCreateReq.Do()
	if err != nil {
		return err
	}

	// Now update the document's permissions so it's viewable by anyone:
	permCreateReq := permissionsService.Create(
		doc.DocumentId,
		&drive.Permission{
			Role: "writer",
			Type: "anyone",
		},
	)

	_, err = permCreateReq.Do()
	if err != nil {
		return err
	}

	log.Printf("Created document with ID: %s", doc.DocumentId)

	// // Finally, figure out the link to the new document:
	// filesGetReq := filesService.Get(doc.DocumentId)

	// f, err := filesGetReq.Do()
	// if err != nil {
	// 	return err
	// }

	log.Printf("Document available at: https://docs.google.com/document/d/%s", doc.DocumentId)

	return nil
}

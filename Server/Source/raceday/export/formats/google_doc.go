package formats

import (
	"context"
	"errors"
	"fmt"
	"log"
	"raceday/Server/Source/raceday/model"
	"raceday/Server/Source/raceday/store"
	"time"

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

	// For updating our new document's permissions
	permissionsService := drive.NewPermissionsService(drivesApi)

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

	now := time.Now()
	windowEnd := float64(now.Unix() + 86400)

	criteria := store.EventRetrievalCriteria{
		WindowStart: float64(now.Unix()),
		WindowEnd:   &windowEnd,
	}

	events, err := store.Datastore.GetEvents(criteria)
	if err != nil {
		return err
	}

	batchUpdateRequests := make([]*docs.Request, 0)

	for _, event := range events {
		req := docs.Request{
			InsertText: &docs.InsertTextRequest{
				EndOfSegmentLocation: &docs.EndOfSegmentLocation{
					SegmentId: "",
				},
				Text: eventToString(event),
			},
		}

		batchUpdateRequests = append(batchUpdateRequests, &req)
	}

	batchUpdate := docs.BatchUpdateDocumentRequest{
		Requests: batchUpdateRequests,
	}

	batchUpdateCall := docsService.BatchUpdate(doc.DocumentId, &batchUpdate)

	_, err = batchUpdateCall.Do()
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

	log.Printf("Document available at: https://docs.google.com/document/d/%s", doc.DocumentId)

	return nil
}

func eventToString(event model.Event) string {
	ret := fmt.Sprintf("%s\r\n", event.Name)
	return ret
}

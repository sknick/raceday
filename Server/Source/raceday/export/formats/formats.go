package formats

import (
	"net/http"
	"raceday/Server/Source/raceday/store"
)

type ExportFormat interface {
	GetName() string
	Export(criteria store.EventRetrievalCriteria, w http.ResponseWriter) error
}

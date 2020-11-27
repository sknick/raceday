package web

import (
	"encoding/json"
	"log"
	"net/http"
	"raceday/Server/Source/raceday/store"
	"runtime"
	"strconv"
)

func BroadcastsGet(w http.ResponseWriter, r *http.Request) {
	eventIdParam := r.URL.Query().Get("event_id")
	eventStartParam := r.URL.Query().Get("event_start")

	criteria := store.BroadcastRetrievalCriteria{}

	if eventIdParam != "" {
		criteria.EventID = &eventIdParam
	}
	if eventStartParam != "" {
		eventStart, err := strconv.ParseFloat(eventStartParam, 64)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.EventStart = &eventStart
	}

	streams, err := store.Datastore.GetBroadcasts(criteria)
	if err != nil {
		switch err.(type) {
		case *store.EventNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(streams, w)
}

func EventsGet(w http.ResponseWriter, r *http.Request) {
	events, err := store.Datastore.GetEvents()
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(events, w)
}

func encodeAndSend(obj interface{}, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	err := json.NewEncoder(w).Encode(obj)
	if err != nil {
		log.Printf("error while encoding response: %v", err)
	}
}

func handleInternalServerError(w http.ResponseWriter, err error) {
	_, file, line, ok := runtime.Caller(1)
	if ok {
		log.Printf("%v (%s: Line %d)", err, file, line)
	} else {
		log.Print(err)
	}

	w.WriteHeader(http.StatusInternalServerError)
}

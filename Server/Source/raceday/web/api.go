package web

import (
	"encoding/json"
	"log"
	"net/http"
	"raceday/Server/Source/raceday/store"
	"runtime"
)

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

package web

import (
	"encoding/json"
	"log"
	"net/http"
	"raceday/Server/Source/raceday/store"
	"runtime"
	"strconv"
)

func BroadcastDelete(w http.ResponseWriter, r *http.Request) {
	err := store.Datastore.DeleteBroadcast(r.URL.Query().Get("id"))
	if err != nil {
		switch err.(type) {
		case *store.BroadcastNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func BroadcastPost(w http.ResponseWriter, r *http.Request) {
	id, err := store.Datastore.CreateBroadcast(
		r.URL.Query().Get("type"),
		r.URL.Query().Get("event_id"),
		r.URL.Query().Get("url"),
	)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(id, w)
}

func BroadcastPut(w http.ResponseWriter, r *http.Request) {

}

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

func EventDelete(w http.ResponseWriter, r *http.Request) {

}

func EventPost(w http.ResponseWriter, r *http.Request) {

}

func EventPut(w http.ResponseWriter, r *http.Request) {

}

func EventsGet(w http.ResponseWriter, r *http.Request) {
	windowStartParam := r.URL.Query().Get("window_start")
	windowEndParam := r.URL.Query().Get("window_end")

	criteria := store.EventRetrievalCriteria{}

	if windowStartParam != "" {
		windowStart, err := strconv.ParseFloat(windowStartParam, 64)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.WindowStart = windowStart
	}

	if windowEndParam != "" {
		windowEnd, err := strconv.ParseFloat(windowEndParam, 64)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.WindowEnd = &windowEnd
	}

	events, err := store.Datastore.GetEvents(criteria)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(events, w)
}

func LocationDelete(w http.ResponseWriter, r *http.Request) {

}

func LocationPost(w http.ResponseWriter, r *http.Request) {

}

func LocationPut(w http.ResponseWriter, r *http.Request) {

}

func LocationsGet(w http.ResponseWriter, r *http.Request) {

}

func SeriesDelete(w http.ResponseWriter, r *http.Request) {

}

func SeriesGet(w http.ResponseWriter, r *http.Request) {

}

func SeriesPost(w http.ResponseWriter, r *http.Request) {

}

func SeriesPut(w http.ResponseWriter, r *http.Request) {

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

package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"raceday/Server/Source/raceday/export"
	"raceday/Server/Source/raceday/export/formats"
	"raceday/Server/Source/raceday/model"
	"raceday/Server/Source/raceday/store"
	"runtime"
	"strconv"
	"strings"
	"time"

	_ "golang.org/x/crypto/blake2s"
)

func AccessTokenGet(w http.ResponseWriter, r *http.Request) {
	valid, err := store.Datastore.IsUserValid(r.Header.Get("Username"), r.Header.Get("Password"))
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	if valid {
		accessToken, err := store.Datastore.CreateAccessToken(r.Header.Get("Username"), getIpFromRemoteAddr(r.RemoteAddr))
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		encodeAndSend(*accessToken, w)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}
}

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
	decoder := json.NewDecoder(r.Body)
	var broadcast model.UnsavedBroadcast

	err := decoder.Decode(&broadcast)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	id, err := store.Datastore.CreateBroadcast(
		model.BroadcastTypeFromString(broadcast.Type_),
		broadcast.EventId,
		broadcast.LangIds,
		broadcast.Description,
		broadcast.Url,
		broadcast.Geoblocked,
		broadcast.Paid,
	)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(id, w)
}

func BroadcastPut(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var broadcast model.Broadcast

	err := decoder.Decode(&broadcast)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	err = store.Datastore.UpdateBroadcast(
		broadcast.Id,
		model.BroadcastTypeFromString(broadcast.Type_),
		broadcast.Event.Id,
		broadcast.LangIds,
		broadcast.Description,
		broadcast.Url,
		broadcast.Geoblocked,
		broadcast.Paid,
	)
	if err != nil {
		switch err.(type) {
		case *store.BroadcastNotFoundError:
		case *store.EventNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func BroadcastsDelete(w http.ResponseWriter, r *http.Request) {
	ids := make([]string, 0)

	idsParam := r.URL.Query().Get("ids")
	if idsParam != "" {
		for _, s := range strings.Split(idsParam, ",") {
			ids = append(ids, s)
		}
	}

	for _, id := range ids {
		err := store.Datastore.DeleteBroadcast(id)
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
}

func BroadcastsGet(w http.ResponseWriter, r *http.Request) {
	eventIdParam := r.URL.Query().Get("event_id")
	eventStartParam := r.URL.Query().Get("event_start")
	includeAllAfterParam := r.URL.Query().Get("include_all_after")

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
	if includeAllAfterParam != "" {
		includeAllAfter, err := strconv.ParseBool(includeAllAfterParam)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.IncludeAllAfter = includeAllAfter
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

func BroadcastsPost(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var broadcasts []model.UnsavedBroadcast

	err := decoder.Decode(&broadcasts)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	ids := make([]string, 0)

	for _, broadcast := range broadcasts {
		id, err := store.Datastore.CreateBroadcast(
			model.BroadcastTypeFromString(broadcast.Type_),
			broadcast.EventId,
			broadcast.LangIds,
			broadcast.Description,
			broadcast.Url,
			broadcast.Geoblocked,
			broadcast.Paid,
		)
		if err != nil {
			switch err.(type) {
			case *store.EventNotFoundError:
				w.WriteHeader(http.StatusNotFound)
				return
			}

			handleInternalServerError(w, err)
			return
		}

		ids = append(ids, id)
	}

	encodeAndSend(ids, w)
}

func BroadcastsPut(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var broadcasts []model.Broadcast

	err := decoder.Decode(&broadcasts)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	for _, broadcast := range broadcasts {
		err := store.Datastore.UpdateBroadcast(
			broadcast.Id,
			model.BroadcastTypeFromString(broadcast.Type_),
			broadcast.Event.Id,
			broadcast.LangIds,
			broadcast.Description,
			broadcast.Url,
			broadcast.Geoblocked,
			broadcast.Paid,
		)
		if err != nil {
			switch err.(type) {
			case *store.BroadcastNotFoundError:
			case *store.EventNotFoundError:
				w.WriteHeader(http.StatusNotFound)
				return
			}

			handleInternalServerError(w, err)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func EventDelete(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(r.Header.Get("AccessToken"))
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	err = store.Datastore.DeleteEvent(accessToken, r.URL.Query().Get("id"))
	if err != nil {
		switch err.(type) {
		case *store.EventNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func EventPost(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(r.Header.Get("AccessToken"))
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	var event model.UnsavedEvent

	err = decoder.Decode(&event)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	var locationId *string
	if event.Location != nil {
		locationId = &event.Location.Id
	}

	var seriesId *string
	if event.Series != nil {
		seriesId = &event.Series.Id
	}

	id, err := store.Datastore.CreateEvent(
		accessToken,
		event.Name,
		time.Unix(int64(event.Start), 0),
		event.Description,
		locationId,
		seriesId,
	)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(id, w)
}

func EventPut(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(r.Header.Get("AccessToken"))
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	var event model.Event

	err = decoder.Decode(&event)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	var locationId *string
	if event.Location != nil {
		locationId = &event.Location.Id
	}

	var seriesId *string
	if event.Series != nil {
		seriesId = &event.Series.Id
	}

	err = store.Datastore.UpdateEvent(
		accessToken,
		event.Id,
		event.Name,
		time.Unix(int64(event.Start), 0),
		event.Description,
		locationId,
		seriesId,
	)
	if err != nil {
		switch err.(type) {
		case *store.EventNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func EventsGet(w http.ResponseWriter, r *http.Request) {
	windowStartParam := r.URL.Query().Get("window_start")
	windowEndParam := r.URL.Query().Get("window_end")
	timeZoneParam := r.URL.Query().Get("time_zone")

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

	if timeZoneParam != "" {
		timeZone, err := time.LoadLocation(timeZoneParam)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.TimeZone = timeZone
	}

	events, err := store.Datastore.GetEvents(criteria)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(events, w)
}

func ExportGet(w http.ResponseWriter, r *http.Request) {
	exportType := r.URL.Query().Get("export_type")

	var format formats.ExportFormat
	for _, t := range export.ExportFormats {
		if t.GetName() == exportType {
			format = t
			break
		}
	}

	if format == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	windowStartParam := r.URL.Query().Get("window_start")
	windowEndParam := r.URL.Query().Get("window_end")
	timeZoneParam := r.URL.Query().Get("time_zone")

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

	if timeZoneParam != "" {
		timeZone, err := time.LoadLocation(timeZoneParam)
		if err != nil {
			handleInternalServerError(w, err)
			return
		}

		criteria.TimeZone = timeZone
	}

	err := format.Export(criteria, w)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}
}

func ExportTypesGet(w http.ResponseWriter, r *http.Request) {
	names := make([]string, 0)

	for _, t := range export.ExportFormats {
		names = append(names, t.GetName())
	}

	encodeAndSend(names, w)
}

func LangsGet(w http.ResponseWriter, r *http.Request) {
	langs, err := store.Datastore.GetLangs()
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(langs, w)
}

func LocationPost(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var location model.UnsavedLocation

	err := decoder.Decode(&location)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	id, err := store.Datastore.CreateLocation(
		location.Name,
		location.Description,
	)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(id, w)
}

func LocationPut(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var location model.Location

	err := decoder.Decode(&location)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	err = store.Datastore.UpdateLocation(
		location.Id,
		location.Name,
		location.Description,
	)
	if err != nil {
		switch err.(type) {
		case *store.LocationNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func LocationsGet(w http.ResponseWriter, r *http.Request) {
	locations, err := store.Datastore.GetLocations()
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(locations, w)
}

func SeriesGet(w http.ResponseWriter, r *http.Request) {
	series, err := store.Datastore.GetSeries()
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(series, w)
}

func SeriesPost(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var series model.UnsavedSeries

	err := decoder.Decode(&series)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	id, err := store.Datastore.CreateSeries(
		series.Name,
		series.Description,
	)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	encodeAndSend(id, w)
}

func SeriesPut(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var series model.Series

	err := decoder.Decode(&series)
	if err != nil {
		handleInternalServerError(w, err)
		return
	}

	err = store.Datastore.UpdateSeries(
		series.Id,
		series.Name,
		series.Description,
	)
	if err != nil {
		switch err.(type) {
		case *store.SeriesNotFoundError:
			w.WriteHeader(http.StatusNotFound)
			return
		}

		handleInternalServerError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func encodeAndSend(obj interface{}, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	err := json.NewEncoder(w).Encode(obj)
	if err != nil {
		log.Printf("error while encoding response: %v", err)
	}
}

func getAccessToken(accessTokenId string) (*store.AccessToken, error) {
	ret, err := store.Datastore.GetAccessToken(accessTokenId)
	if ret == nil || err != nil {
		if err == nil {
			err = errors.New(fmt.Sprintf("access token %s not found", accessTokenId))
		}

		return nil, err
	}

	return ret, nil
}

func getIpFromRemoteAddr(remoteAddr string) string {
	lastIndexOfColon := strings.LastIndex(remoteAddr, ":")
	if lastIndexOfColon == -1 {
		return remoteAddr
	}

	// In case the remote address is [::1] (IPv6 localhost), trim off the surrounding []
	return strings.Trim(remoteAddr[:lastIndexOfColon], "[]")
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

func isAuthorized(accessToken string, remoteAddress string, db *store.DatastoreHandle) (bool, error) {
	if accessToken != "" {
		accessTokenObj, err := db.GetAccessToken(accessToken)
		if err != nil {
			return false, err
		}

		if accessTokenObj == nil {
			return false, nil
		} else if time.Now().Unix()-int64(accessTokenObj.WhenCreated) > 84600 { // TODO: Pull expiration from config
			return false, nil
		} else if accessTokenObj.IPAddress != getIpFromRemoteAddr(remoteAddress) {
			return false, nil
		}

		return true, nil
	} else {
		return false, nil
	}
}

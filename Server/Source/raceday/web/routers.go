package web

import (
	"log"
	"net/http"
	"raceday/Server/Source/raceday/logging"
	"raceday/Server/Source/raceday/store"
	"strings"

	"github.com/gorilla/mux"
)

type route struct {
	name           string
	method         string
	pattern        string
	handler        http.HandlerFunc
	authRequired   bool
	disableLogging bool
}

var routes = []route{
	newUnguardedRoute("AccessTokenGet", "GET", "/access_token", AccessTokenGet),
	newGuardedRoute("BroadcastDelete", "DELETE", "/broadcast", BroadcastDelete),
	newGuardedRoute("BroadcastPost", "POST", "/broadcast", BroadcastPost),
	newGuardedRoute("BroadcastPut", "PUT", "/broadcast", BroadcastPut),
	newGuardedRoute("BroadcastsDelete", "DELETE", "/broadcasts", BroadcastsDelete),
	newUnguardedRoute("BroadcastsGet", "GET", "/broadcasts", BroadcastsGet),
	newGuardedRoute("BroadcastsPost", "POST", "/broadcasts", BroadcastsPost),
	newGuardedRoute("BroadcastsPut", "PUT", "/broadcasts", BroadcastsPut),
	newGuardedRoute("EventDelete", "DELETE", "/event", EventDelete),
	newGuardedRoute("EventPost", "POST", "/event", EventPost),
	newGuardedRoute("EventPut", "PUT", "/event", EventPut),
	newUnguardedRoute("EventsGet", "GET", "/events", EventsGet),
	newUnguardedRoute("ExportGet", "GET", "/export", ExportGet),
	newUnguardedRoute("ExportTypesGet", "GET", "/export_types", ExportTypesGet),
	newGuardedRoute("LocationDelete", "DELETE", "/location", LocationDelete),
	newGuardedRoute("LocationPost", "POST", "/location", LocationPost),
	newGuardedRoute("LocationPut", "PUT", "/location", LocationPut),
	newUnguardedRoute("LocationsGet", "GET", "/locations", LocationsGet),
	newGuardedRoute("SeriesDelete", "DELETE", "/series", SeriesDelete),
	newGuardedRoute("SeriesPost", "POST", "/series", SeriesPost),
	newGuardedRoute("SeriesPut", "PUT", "/series", SeriesPut),
	newUnguardedRoute("SeriesGet", "GET", "/series", SeriesGet),
}

func NewRouter(apiPathPrefix string) *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		var handler http.Handler
		if route.authRequired {
			if !route.disableLogging {
				handler = guard(logging.HTTPLogger(route.handler))
			} else {
				handler = guard(route.handler)
			}
		} else {
			if !route.disableLogging {
				handler = logging.HTTPLogger(route.handler)
			} else {
				handler = route.handler
			}
		}

		router.
			Methods(route.method).
			PathPrefix(apiPathPrefix).
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

// Checks for a valid access token.
func guard(inner http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if authorized, err := isAuthorized(r.Header.Get("AccessToken"), r.RemoteAddr, &store.Datastore); err == nil {
			if !authorized {
				w.WriteHeader(http.StatusForbidden)
				return
			}
		} else {
			log.Printf("unable to determine if access token is valid: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		inner.ServeHTTP(w, r)
	})
}

func newGuardedRoute(name string, method string, pattern string, handlerFunc http.HandlerFunc) route {
	return route{
		name:         name,
		method:       strings.ToUpper(method),
		pattern:      pattern,
		handler:      handlerFunc,
		authRequired: true,
	}
}

func newUnguardedRoute(name string, method string, pattern string, handlerFunc http.HandlerFunc) route {
	return route{
		name:         name,
		method:       strings.ToUpper(method),
		pattern:      pattern,
		handler:      handlerFunc,
		authRequired: false,
	}
}

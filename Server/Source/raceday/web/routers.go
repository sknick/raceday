package web

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"raceday/Server/Source/raceday/logging"
	"raceday/Server/Source/raceday/store"
	"strings"
)

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

type route struct {
	name           string
	method         string
	pattern        string
	handler        http.HandlerFunc
	authRequired   bool
	disableLogging bool
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

type Routes []route

func NewRouter() *mux.Router {
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
			Path(route.pattern).
			Name(route.name).
			Handler(handler)
	}

	return router
}

var routes = Routes{
	newGuardedRoute("BroadcastDelete", "DELETE", "/broadcast", BroadcastDelete),
	newGuardedRoute("BroadcastPost", "POST", "/broadcast", BroadcastPost),
	newGuardedRoute("BroadcastPut", "PUT", "/broadcast", BroadcastPut),
	newUnguardedRoute("BroadcastsGet", "GET", "/broadcasts", BroadcastsGet),
	newGuardedRoute("EventDelete", "DELETE", "/event", EventDelete),
	newGuardedRoute("EventPost", "POST", "/event", EventPost),
	newGuardedRoute("EventPut", "PUT", "/event", EventPut),
	newUnguardedRoute("EventsGet", "GET", "/events", EventsGet),
	newGuardedRoute("LocationDelete", "DELETE", "/location", LocationDelete),
	newGuardedRoute("LocationPost", "POST", "/location", LocationPost),
	newGuardedRoute("LocationPut", "PUT", "/location", LocationPut),
	newUnguardedRoute("LocationsGet", "GET", "/locations", LocationsGet),
	newGuardedRoute("SeriesDelete", "DELETE", "/series", SeriesDelete),
	newGuardedRoute("SeriesPost", "POST", "/series", SeriesPost),
	newGuardedRoute("SeriesPut", "PUT", "/series", SeriesPut),
	newUnguardedRoute("SeriesGet", "GET", "/series", SeriesGet),
}

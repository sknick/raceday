package web

import (
	"github.com/gorilla/mux"
	"net/http"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

func NewRoute(name, method, pattern string, handlerFunc http.HandlerFunc) Route {
	return Route{
		Name:        name,
		Method:      method,
		Pattern:     pattern,
		HandlerFunc: handlerFunc,
	}
}

type Routes []Route

func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		var handler http.Handler
		handler = route.HandlerFunc
		handler = Logger(handler, route.Name)

		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(handler)
	}

	return router
}

var routes = Routes{
	NewRoute("BroadcastDelete", "DELETE", "/broadcast", BroadcastDelete),
	NewRoute("BroadcastPost", "POST", "/broadcast", BroadcastPost),
	NewRoute("BroadcastPut", "PUT", "/broadcast", BroadcastPut),
	NewRoute("BroadcastsGet", "GET", "/broadcasts", BroadcastsGet),
	NewRoute("EventDelete", "DELETE", "/event", EventDelete),
	NewRoute("EventPost", "POST", "/event", EventPost),
	NewRoute("EventPut", "PUT", "/event", EventPut),
	NewRoute("EventsGet", "GET", "/events", EventsGet),
	NewRoute("LocationDelete", "DELETE", "/location", LocationDelete),
	NewRoute("LocationPost", "POST", "/location", LocationPost),
	NewRoute("LocationPut", "PUT", "/location", LocationPut),
	NewRoute("LocationsGet", "GET", "/locations", LocationsGet),
	NewRoute("SeriesDelete", "DELETE", "/series", SeriesDelete),
	NewRoute("SeriesPost", "POST", "/series", SeriesPost),
	NewRoute("SeriesPut", "PUT", "/series", SeriesPut),
	NewRoute("SeriesGet", "GET", "/series", SeriesGet),
}

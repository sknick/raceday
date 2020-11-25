package web

import (
	"net/http"
	"strings"

	"github.com/gorilla/mux"
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
	NewRoute("EventsGet", strings.ToUpper("Get"), "/events", EventsGet),
	NewRoute("StreamsGet", strings.ToUpper("Get"), "/streams", StreamsGet),
}

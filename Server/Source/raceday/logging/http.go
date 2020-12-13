package logging

import (
	"log"
	"net/http"
	"raceday/Server/Source/raceday/store"
	"time"
)

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(statusCode int) {
	lrw.statusCode = statusCode
	lrw.ResponseWriter.WriteHeader(statusCode)
}

func HTTPLogger(inner http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lrw := loggingResponseWriter{w, http.StatusOK}
		inner.ServeHTTP(&lrw, r)

		user := "-"

		accessTokenParam := r.Header.Get("AccessToken")
		if accessTokenParam != "" {
			accessToken, err := store.Datastore.GetAccessToken(accessTokenParam)
			if accessToken != nil && err == nil {
				user = accessToken.UserID
			}
		}

		log.Printf(
			"%s - %s [%s] \"%s %s %s\" %d -",
			r.RemoteAddr,
			user,
			time.Now().Format("2/Jan/2006:15:04:05 MST"),
			r.Method,
			r.RequestURI,
			r.Proto,
			lrw.statusCode,
		)
	})
}

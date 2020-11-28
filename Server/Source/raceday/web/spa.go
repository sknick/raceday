package web

import (
	"net/http"
	"os"
	"path/filepath"
)

// This code is taken from https://github.com/gorilla/mux#serving-single-page-applications.

type SPAHandler struct {
	StaticPath string
	IndexPath  string
}

func NewSPAHandler(staticPath string, indexPath string) SPAHandler {
	return SPAHandler{
		StaticPath: staticPath,
		IndexPath:  indexPath,
	}
}

func (h SPAHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	path = filepath.Join(h.StaticPath, path)

	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		http.ServeFile(w, r, filepath.Join(h.StaticPath, h.IndexPath))
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.FileServer(http.Dir(h.StaticPath)).ServeHTTP(w, r)
}

package main

import (
	"log"
	"net/http"
	"raceday/Server/Source/raceday/web"
)

func main() {
	log.Printf("Server started")

	router := web.NewRouter()

	log.Fatal(http.ListenAndServe(":8080", router))
}

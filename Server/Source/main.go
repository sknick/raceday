package main

import (
	"log"
	"raceday/Server/Source/cmd"

	_ "time/tzdata"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		log.Fatal(err)
	}
}

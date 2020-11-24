package main

import (
	"log"
	"raceday/Server/Source/cmd"
)

func main() {
	err := cmd.Execute()
	if err != nil {
		log.Fatal(err)
	}
}

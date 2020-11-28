package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"log"
	"net/http"
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/process"
	"raceday/Server/Source/raceday/store"
	"raceday/Server/Source/raceday/web"
)

const runCommand = "run"

var (
	runCmd = &cobra.Command{
		Use:   fmt.Sprintf("%s [config]", runCommand),
		Short: "Runs the server",
		Args:  cobra.ExactArgs(1),

		Run: func(cmd *cobra.Command, args []string) {
			r := process.AcquireProcessLock(fmt.Sprintf("raceday-%s", runCommand))
			defer r.Release()

			settings, err := raceday.NewConfig(args[0])
			if err != nil {
				log.Fatal(err)
			}

			err = store.Initialize(settings.DatabaseSettings)
			if err != nil {
				log.Fatal(err)
			}

			router := web.NewRouter()
			router.PathPrefix("/").Handler(web.NewSPAHandler(settings.UIRoot, "index.html"))

			server := http.Server{
				Addr:    fmt.Sprintf(":%d", settings.ListenPort),
				Handler: router,
			}
			defer server.Close()

			log.Printf("Starting server, listening on port %d...", settings.ListenPort)

			err = server.ListenAndServe()
			if err != nil && err != http.ErrServerClosed {
				log.Fatal(err)
			}
		},
	}
)

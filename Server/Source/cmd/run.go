package cmd

import (
	"fmt"
	"log"
	"net/http"
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/export"
	"raceday/Server/Source/raceday/process"
	"raceday/Server/Source/raceday/store"
	"raceday/Server/Source/raceday/web"

	"github.com/spf13/cobra"
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

			log.Print("Initializing export formats:")

			export.InitializeFormats(settings.ExportSettings)

			if len(export.ExportFormats) == 0 {
				log.Print("No export formats available!")
			} else {
				for _, format := range export.ExportFormats {
					log.Printf("Loaded %s.", format.GetName())
				}
			}

			router := web.NewRouter("/api/")
			router.PathPrefix("/admin/").Handler(web.NewSPAHandler(settings.AdminUIRoot, "index.html"))
			router.PathPrefix("/resource/").Handler(http.FileServer(http.Dir(settings.AdminUIRoot)))

			// If the dev flag is set, then we need to add the transpiled directory as the admin UI will be built in a
			// development mode that includes it
			if devFlag {
				router.PathPrefix("/transpiled/").Handler(http.FileServer(http.Dir(settings.AdminUIRoot)))
			}

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

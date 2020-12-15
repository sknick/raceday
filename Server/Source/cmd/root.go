package cmd

import "github.com/spf13/cobra"

var (
	devFlag bool

	rootCmd = &cobra.Command{
		Use:   "raceday",
		Short: "Provides commands for managing the Raceday server",
	}
)

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.PersistentFlags().BoolVar(&devFlag, "dev", false, "run in development mode")

	rootCmd.AddCommand(runCmd)
}

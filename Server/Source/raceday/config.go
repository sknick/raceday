package raceday

import (
	"fmt"

	"gopkg.in/ini.v1"
)

type Settings struct {
	// The port on which the server should listen.
	ListenPort int

	// The location of the web UI files.
	UIRoot string

	// The location of the administrative UI files.
	AdminUIRoot string

	// Database settings.
	DatabaseSettings DatabaseSettings

	// Export settings.
	ExportSettings ExportSettings
}

// Database / datastore-related settings.
type DatabaseSettings struct {
	// The database host to which to connect.
	DatabaseHost string

	// The database port to which to connect.
	DatabasePort int

	// The database name to which to connect.
	DatabaseName string

	// The username of the user by which to connect to the database.
	DatabaseUser string

	// The password of the user by which to connect to the database.
	DatabasePassword string
}

type ExportSettings struct {
	// The location of the image assets (e.g., broadcast type icons, etc.).
	ImagesDir string
}

// Provides an instance of Settings that is initialized from the specified configuration file.
func NewConfig(configFile string) (Settings, error) {
	config, err := ini.Load(configFile)
	if err != nil {
		return Settings{}, fmt.Errorf("unable to load the configuration file \"%v\": %v", configFile, err)
	}

	uiRoot := config.Section("").Key("ui_root").MustString("")
	if uiRoot == "" {
		return Settings{}, fmt.Errorf("ui_root not set in configuration file \"%v\"", configFile)
	}

	adminUiRoot := config.Section("").Key("admin_ui_root").MustString("")
	if adminUiRoot == "" {
		return Settings{}, fmt.Errorf("admin_ui_root not set in configuration file \"%v\"", configFile)
	}

	imagesDir := config.Section("export").Key("images_dir").MustString("")
	if imagesDir == "" {
		return Settings{}, fmt.Errorf("images_dir not set in configuration file \"%v\"", configFile)
	}

	return Settings{
		ListenPort:  config.Section("").Key("listen_port").MustInt(8080),
		UIRoot:      uiRoot,
		AdminUIRoot: adminUiRoot,

		DatabaseSettings: DatabaseSettings{
			DatabaseHost:     config.Section("database").Key("host").MustString("localhost"),
			DatabasePort:     config.Section("database").Key("port").MustInt(5432),
			DatabaseName:     config.Section("database").Key("name").MustString("raceday"),
			DatabaseUser:     config.Section("database").Key("user").MustString("postgres"),
			DatabasePassword: config.Section("database").Key("password").MustString(""),
		},

		ExportSettings: ExportSettings{
			ImagesDir: imagesDir,
		},
	}, nil
}

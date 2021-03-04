package export

import "raceday/Server/Source/raceday/export/formats"

func GetExportTypes() []formats.ExportFormat {
	return []formats.ExportFormat{
		formats.GoogleDoc{},
	}
}

package export

import (
	"raceday/Server/Source/raceday"
	"raceday/Server/Source/raceday/export/formats"
)

var ExportFormats []formats.ExportFormat

func InitializeFormats(settings raceday.ExportSettings) {
	ExportFormats = make([]formats.ExportFormat, 0)

	ExportFormats = append(ExportFormats, formats.ExcelExport{})
}

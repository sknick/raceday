package formats

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"raceday/Server/Source/raceday/model"
	"raceday/Server/Source/raceday/store"
	"time"

	excelize "github.com/360EntSecGroup-Skylar/excelize/v2"
)

const Sheet = "Sheet1"

type ExcelExport struct {
}

func (ee ExcelExport) GetName() string {
	return "Excel Spreadsheet"
}

func (ee ExcelExport) Export(criteria store.EventRetrievalCriteria, w http.ResponseWriter) error {
	// Get the events that match the criteria from the store
	events, err := store.Datastore.GetEvents(criteria)
	if err != nil {
		return err
	}

	// Get the start and end (if present) times into a native Go time.Time structure
	start := time.Unix(int64(criteria.WindowStart), 0)

	var end *time.Time
	if criteria.WindowEnd != nil {
		endTime := time.Unix(int64(*criteria.WindowEnd), 0)
		end = &endTime
	}

	// Create the new Excel file
	ss := excelize.NewFile()

	// Set up the header row
	headers := make([]string, 0)
	headers = append(headers, "Date/Time")
	headers = append(headers, "Event")
	headers = append(headers, "Series")
	headers = append(headers, "Location")

	broadcastCols := []model.BroadcastType{
		model.YOU_TUBE,
		model.FACEBOOK,
		model.MOTOR_TREND,
		model.CABLE,
		model.OTHER,
	}

	for _, broadcastCol := range broadcastCols {
		headers = append(headers, string(broadcastCol))
	}

	err = addHeader(
		ss,
		headers,
		[]float64{25.0, 50.0, 50.0, 50.0, 5.0, 5.0, 5.0, 5.0, 5.0},
		100.0,
		[]int{0, 0, 0, 0, 90, 90, 90, 90, 90},
	)
	if err != nil {
		return err
	}

	// Add the data rows
	for i, event := range events {
		// Get this event's broadcasts from the store
		broadcasts, err := store.Datastore.GetBroadcasts(store.BroadcastRetrievalCriteria{EventID: &event.Id})
		if err != nil {
			return err
		}

		// Figure out which broadcast types this event has to check off the those columns
		var broadcastSources [5]string
		for _, broadcast := range broadcasts {
			for j, type_ := range broadcastCols {
				if broadcast.Type_ == type_ {
					broadcastSources[j] = "X"
				}
			}
		}

		values := make([]string, 0)
		values = append(values, time.Unix(int64(event.Start), 0).Format("2006-01-02 15:04 -0700"))
		values = append(values, event.Name)
		values = append(values, event.Series.Name)
		values = append(values, event.Location.Name)

		for _, broadcastSource := range broadcastSources {
			values = append(values, broadcastSource)
		}

		err = addRow(
			ss,
			i+2,
			values,
			[]bool{false, false, false, false, true, true, true, true, true},
		)
		if err != nil {
			return err
		}
	}

	// Save the Excel file to a temp file so we can reopen it and stream it to the client
	tmpFile, err := ioutil.TempFile("", "*.xlsx")
	if err != nil {
		return err
	}

	defer deleteTmp(tmpFile.Name())
	_ = tmpFile.Close()

	ss.SaveAs(tmpFile.Name())

	tmpFile, err = os.Open(tmpFile.Name())
	if err != nil {
		return err
	}

	dateStr := start.Format("2006-01-02")
	if end != nil {
		dateStr = fmt.Sprintf("%s_-_%s", dateStr, end.Format("2006-01-02"))
	}

	filename := fmt.Sprintf("Race_Day_%s.xlsx", dateStr)

	w.Header().Set("Content-Type", "application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	w.WriteHeader(http.StatusOK)

	io.Copy(w, tmpFile)

	_ = tmpFile.Close()

	return nil
}

func addHeader(ss *excelize.File, labels []string, columnWidths []float64, rowHeight float64, textRotation []int) error {
	capA := int('A')

	var err error

	for i, label := range labels {
		styleId, err := getStyle(ss, textRotation[i])
		if err != nil {
			return err
		}

		cell := fmt.Sprintf("%c1", rune(capA+i))

		err = ss.SetCellValue(Sheet, cell, label)
		if err != nil {
			return err
		}

		ss.SetCellStyle(Sheet, cell, cell, styleId)
		if err != nil {
			return err
		}
	}

	for i, columnWidth := range columnWidths {
		cell := fmt.Sprintf("%c", rune(capA+i))

		err = ss.SetColWidth(Sheet, cell, cell, columnWidth)
		if err != nil {
			return err
		}
	}

	err = ss.SetRowHeight(Sheet, 1, rowHeight)
	if err != nil {
		return err
	}

	return nil
}

func addRow(ss *excelize.File, rowIndex int, values []string, centerColumns []bool) error {
	capA := int('A')

	for i, value := range values {
		cell := fmt.Sprintf("%c%d", rune(capA+i), rowIndex)

		err := ss.SetCellValue(Sheet, cell, value)
		if err != nil {
			return err
		}

		if centerColumns[i] {
			styleId, err := ss.NewStyle(
				&excelize.Style{
					Alignment: &excelize.Alignment{
						Horizontal: "center",
					},
				},
			)
			if err != nil {
				return err
			}

			err = ss.SetCellStyle(Sheet, cell, cell, styleId)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func deleteTmp(f string) {
	os.Remove(f)
}

func getStyle(ss *excelize.File, rotation int) (int, error) {
	style := excelize.Style{
		Alignment: &excelize.Alignment{
			Horizontal: "center",
		},
		Border: []excelize.Border{
			{
				Color: "000000",
				Style: 1,
				Type:  "top",
			},
			{
				Color: "000000",
				Style: 1,
				Type:  "left",
			},
			{
				Color: "000000",
				Style: 1,
				Type:  "right",
			},
			{
				Color: "000000",
				Style: 1,
				Type:  "bottom",
			},
		},
		Fill: excelize.Fill{
			Color: []string{
				"dddddd",
			},
			Pattern: 1,
			Type:    "pattern",
		},
		Font: &excelize.Font{
			Bold: true,
		},
	}

	if rotation != 0 {
		style.Alignment.TextRotation = rotation
	}

	return ss.NewStyle(&style)
}

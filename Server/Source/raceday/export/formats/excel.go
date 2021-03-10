package formats

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
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
	events, err := store.Datastore.GetEvents(criteria)
	if err != nil {
		return err
	}

	ss := excelize.NewFile()

	err = addHeader(
		ss,
		[]string{
			"Date/Time",
			"Event",
			"Series",
			"Location",
		},
		[]float64{
			25.0,
			50.0,
			50.0,
			50.0,
		},
	)
	if err != nil {
		return err
	}

	for i, event := range events {
		err = addRow(
			ss,
			i+2,
			[]string{
				time.Unix(int64(event.Start), 0).Format("02 Jan 06 15:04 -0700"),
				event.Name,
				event.Series.Name,
				event.Location.Name,
			},
		)
		if err != nil {
			return err
		}
	}

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

	w.Header().Set("Content-Type", "application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", "Race_Day_Export.xlsx"))
	w.WriteHeader(http.StatusOK)

	io.Copy(w, tmpFile)

	_ = tmpFile.Close()

	return nil
}

func addHeader(ss *excelize.File, labels []string, columnWidths []float64) error {
	headerStyle, err := ss.NewStyle(
		&excelize.Style{
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
		},
	)
	if err != nil {
		return err
	}

	capA := int('A')

	for i, label := range labels {
		cell := fmt.Sprintf("%c1", rune(capA+i))

		err = ss.SetCellValue(Sheet, cell, label)
		if err != nil {
			return err
		}

		ss.SetCellStyle(Sheet, cell, cell, headerStyle)
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

	return nil
}

func addRow(ss *excelize.File, rowIndex int, values []string) error {
	capA := int('A')

	for i, value := range values {
		cell := fmt.Sprintf("%c%d", rune(capA+i), rowIndex)

		err := ss.SetCellValue(Sheet, cell, value)
		if err != nil {
			return err
		}
	}

	return nil
}

func deleteTmp(f string) {
	os.Remove(f)
}

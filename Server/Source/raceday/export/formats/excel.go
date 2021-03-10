package formats

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"raceday/Server/Source/raceday/store"

	excelize "github.com/360EntSecGroup-Skylar/excelize/v2"
)

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

	for i, event := range events {
		ss.SetCellValue("Sheet1", fmt.Sprintf("A%d", i+1), event.Name)
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

func deleteTmp(f string) {
	os.Remove(f)
}

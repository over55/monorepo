package httptransport

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"net/http"

	"log/slog"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
)

// Handler Creates http request handler
type Handler struct {
	Logger     *slog.Logger
	Controller report_c.ReportController
}

// NewHandler Constructor
func NewHandler(loggerp *slog.Logger, c report_c.ReportController) *Handler {
	return &Handler{
		Logger:     loggerp,
		Controller: c,
	}
}

func RenderCSVStreamResponse(filename string, rows [][]string, r *http.Request, w http.ResponseWriter) {
	//
	// Convert into a downloadable CSV file.
	//

	b := new(bytes.Buffer)
	csvw := csv.NewWriter(b)
	csvw.WriteAll(rows)
	if err := csvw.Error(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Note: https://stackoverflow.com/a/24116517
	attch := fmt.Sprintf("attachment; filename=%v", filename)
	w.Header().Set("Content-Disposition", attch)
	w.Header().Set("Content-Type", r.Header.Get("Content-Type"))
	w.Write(b.Bytes())
}

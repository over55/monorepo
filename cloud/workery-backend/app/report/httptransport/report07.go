package httptransport

import (
	"fmt"
	"net/http"
	"strconv"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) DownloadReport07(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	//
	// Create the request paramenters.
	//

	stateParamString := r.FormValue("state")
	if stateParamString == "" {
		http.Error(w, "missing `state` parameter", http.StatusBadRequest)
		return
	}
	status, _ := strconv.ParseInt(stateParamString, 10, 64)

	f := &report_c.GenerateReport07Request{
		Status: int8(status),
	}

	//
	// Submit into our app to generate the report and return the CSV data of the
	// results computed by our app.
	//

	rows, err := h.Controller.GenerateReport007(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	//
	// Stream back from the server CSV content so the web-browser can parse the
	// data incrementally and generate a CSV file for the user to download onto
	// their respected computer.
	//

	RenderCSVStreamResponse(fmt.Sprintf("report_%v.csv", 7), rows, r, w)
}

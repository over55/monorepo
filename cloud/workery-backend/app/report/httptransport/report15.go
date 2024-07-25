package httptransport

import (
	"fmt"
	"net/http"
	"strconv"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) DownloadReport15(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	//
	// Create the request paramenters.
	//

	filterDateTypeParamString := r.FormValue("expiry_date_type")
	if filterDateTypeParamString == "" {
		http.Error(w, "missing `expiry_date_type` parameter", http.StatusBadRequest)
		return
	}
	dateType, _ := strconv.ParseInt(filterDateTypeParamString, 10, 64)

	filterDBEParamString := r.FormValue("days_before_expiry")
	if filterDBEParamString == "" {
		http.Error(w, "missing `days_before_expiry` parameter", http.StatusBadRequest)
		return
	}
	dbe, _ := strconv.ParseInt(filterDBEParamString, 10, 64)

	f := &report_c.GenerateReport15Request{
		ExpiryDateType:   int8(dateType),
		DaysBeforeExpiry: int(dbe),
	}

	//
	// Submit into our app to generate the report and return the CSV data of the
	// results computed by our app.
	//

	rows, err := h.Controller.GenerateReport015(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	//
	// Stream back from the server CSV content so the web-browser can parse the
	// data incrementally and generate a CSV file for the user to download onto
	// their respected computer.
	//

	RenderCSVStreamResponse(fmt.Sprintf("report_%v.csv", 15), rows, r, w)
}

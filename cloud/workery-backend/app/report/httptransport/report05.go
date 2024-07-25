package httptransport

import (
	"fmt"
	"net/http"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) DownloadReport05(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	//
	// Create the request paramenters.
	//

	f := &report_c.GenerateReport05Request{}

	//
	// Submit into our app to generate the report and return the CSV data of the
	// results computed by our app.
	//

	rows, err := h.Controller.GenerateReport005(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	//
	// Stream back from the server CSV content so the web-browser can parse the
	// data incrementally and generate a CSV file for the user to download onto
	// their respected computer.
	//

	RenderCSVStreamResponse(fmt.Sprintf("report_%v.csv", 5), rows, r, w)
}

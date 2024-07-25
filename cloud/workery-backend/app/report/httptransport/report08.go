package httptransport

import (
	"fmt"
	"net/http"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) DownloadReport08(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	//
	// Create the request paramenters.
	//

	var associateID primitive.ObjectID
	associateIDStr := r.FormValue("associate_id")
	if associateIDStr != "" {
		aid, err := primitive.ObjectIDFromHex(associateIDStr)
		if err != nil {
			httperror.ResponseError(w, err)
			return
		}
		associateID = aid
	} else {
		http.Error(w, "missing `associate_id` parameter", http.StatusBadRequest)
		return
	}

	f := &report_c.GenerateReport08Request{
		AssociateID: associateID,
	}

	//
	// Submit into our app to generate the report and return the CSV data of the
	// results computed by our app.
	//

	rows, err := h.Controller.GenerateReport008(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	//
	// Stream back from the server CSV content so the web-browser can parse the
	// data incrementally and generate a CSV file for the user to download onto
	// their respected computer.
	//

	RenderCSVStreamResponse(fmt.Sprintf("report_%v.csv", 8), rows, r, w)
}

package httptransport

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/bartmika/timekit"
	"go.mongodb.org/mongo-driver/bson/primitive"

	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) DownloadReport02(w http.ResponseWriter, r *http.Request) {
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

	stateParamString := r.FormValue("state")
	if stateParamString == "" {
		http.Error(w, "missing `state` parameter", http.StatusBadRequest)
		return
	}
	status, _ := strconv.ParseInt(stateParamString, 10, 64)

	fromDTParamString := r.FormValue("from_dt")
	if fromDTParamString == "" {
		http.Error(w, "missing `from_dt` parameter", http.StatusBadRequest)
		return
	}
	toDTParamString := r.FormValue("to_dt")
	if toDTParamString == "" {
		http.Error(w, "missing `to_dt` parameter", http.StatusBadRequest)
		return
	}

	fromDT, err := timekit.ParseJavaScriptTimeString(fromDTParamString)
	if err != nil {
		http.Error(w, "error `to_dt` parameter:"+err.Error(), http.StatusBadRequest)
		return
	}
	toDT, err := timekit.ParseJavaScriptTimeString(toDTParamString)
	if err != nil {
		http.Error(w, "error `to_dt` parameter"+err.Error(), http.StatusBadRequest)
		return
	}

	f := &report_c.GenerateReport02Request{
		AssociateID: associateID,
		Status:      int8(status),
		ToDT:        toDT,
		FromDT:      fromDT,
	}

	//
	// Submit into our app to generate the report and return the CSV data of the
	// results computed by our app.
	//

	rows, err := h.Controller.GenerateReport002(ctx, f)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	//
	// Stream back from the server CSV content so the web-browser can parse the
	// data incrementally and generate a CSV file for the user to download onto
	// their respected computer.
	//

	RenderCSVStreamResponse(fmt.Sprintf("report_%v.csv", 2), rows, r, w)
}

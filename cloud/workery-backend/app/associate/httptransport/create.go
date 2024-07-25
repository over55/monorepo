package httptransport

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/relvacode/iso8601"

	usr_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	usr_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

func (h *Handler) unmarshalCreateRequest(ctx context.Context, r *http.Request) (*usr_c.AssociateCreateRequestIDO, error) {
	// Initialize our array which will store all the results from the remote server.
	var requestData *usr_c.AssociateCreateRequestIDO

	defer r.Body.Close()

	var rawJSON bytes.Buffer
	teeReader := io.TeeReader(r.Body, &rawJSON) // TeeReader allows you to read the JSON and capture it

	// Read the JSON string and convert it into our golang stuct else we need
	// to send a `400 Bad Request` errror message back to the client,
	err := json.NewDecoder(teeReader).Decode(&requestData) // [1]
	if err != nil {
		h.Logger.Error("decoding error",
			slog.Any("err", err),
			slog.String("json", rawJSON.String()),
		)
		return nil, httperror.NewForSingleField(http.StatusBadRequest, "non_field_error", "payload structure is wrong")
	}

	// BirthDate

	if requestData.BirthDate != "" {
		birthDateDT, err := iso8601.ParseString(requestData.BirthDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("BirthDate", requestData.BirthDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "birth_date", "payload structure is wrong")
		}
		requestData.BirthDateDT = birthDateDT
	}

	// JoinDate

	if requestData.JoinDate != "" {
		joinDateDT, err := iso8601.ParseString(requestData.JoinDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("JoinDate", requestData.JoinDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "join_date", "payload structure is wrong")
		}
		requestData.JoinDateDT = joinDateDT
	}

	// DuesDate

	if requestData.DuesDate != "" {
		duesDateDT, err := iso8601.ParseString(requestData.DuesDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("DuesDate", requestData.DuesDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "dues_date", "payload structure is wrong")
		}
		requestData.DuesDateDT = duesDateDT
	}

	// CommercialInsuranceExpiryDate

	if requestData.CommercialInsuranceExpiryDate != "" {
		commercialInsuranceExpiryDateDT, err := iso8601.ParseString(requestData.CommercialInsuranceExpiryDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("CommercialInsuranceExpiryDate", requestData.CommercialInsuranceExpiryDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "commercial_insurance_expiry_date", "payload structure is wrong")
		}
		requestData.CommercialInsuranceExpiryDateDT = commercialInsuranceExpiryDateDT
	}

	// AutoInsuranceExpiryDate

	if requestData.AutoInsuranceExpiryDate != "" {
		autoInsuranceExpiryDateDT, err := iso8601.ParseString(requestData.AutoInsuranceExpiryDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("AutoInsuranceExpiryDate", requestData.AutoInsuranceExpiryDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "auto_insurance_expiry_date", "payload structure is wrong")
		}
		requestData.AutoInsuranceExpiryDateDT = autoInsuranceExpiryDateDT
	}

	// WsibInsuranceDate

	if requestData.WsibInsuranceDate != "" {
		wsibInsuranceDateDT, err := iso8601.ParseString(requestData.WsibInsuranceDate)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("WsibInsuranceDate", requestData.WsibInsuranceDate),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "wsib_insurance_date", "payload structure is wrong")
		}
		requestData.WsibInsuranceDateDT = wsibInsuranceDateDT
	}

	// PoliceCheck

	if requestData.PoliceCheck != "" {
		policeCheckDT, err := iso8601.ParseString(requestData.PoliceCheck)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("PoliceCheck", requestData.PoliceCheck),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "police_check", "payload structure is wrong")
		}
		requestData.PoliceCheckDT = policeCheckDT
	}

	// DateOfEntryIntoCountry

	if requestData.DateOfEntryIntoCountry != "" {
		dateOfEntryIntoCountryDT, err := iso8601.ParseString(requestData.DateOfEntryIntoCountry)
		if err != nil {
			h.Logger.Error("iso8601 parsing error",
				slog.Any("err", err),
				slog.String("DateOfEntryIntoCountry", requestData.DateOfEntryIntoCountry),
				slog.String("json", rawJSON.String()),
			)
			return nil, httperror.NewForSingleField(http.StatusBadRequest, "police_check", "payload structure is wrong")
		}
		requestData.DateOfEntryIntoCountryDT = dateOfEntryIntoCountryDT
	}

	return requestData, nil
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	data, err := h.unmarshalCreateRequest(ctx, r)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	user, err := h.Controller.Create(ctx, data)
	if err != nil {
		httperror.ResponseError(w, err)
		return
	}

	MarshalCreateResponse(user, w)
}

func MarshalCreateResponse(res *usr_s.Associate, w http.ResponseWriter) {
	if err := json.NewEncoder(w).Encode(&res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

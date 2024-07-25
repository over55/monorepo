package controller

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/pdfbuilder"
	o_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config/constants"
	"github.com/over55/monorepo/cloud/workery-backend/utils/httperror"
)

type OrderOperationGenerateInvoiceRequest struct {
	OrderID                        primitive.ObjectID `json:"order_id,omitempty"`
	InvoiceID                      string             `json:"invoice_id,omitempty"`
	InvoiceDate                    string             `json:"invoice_date,omitempty"`
	InvoiceDateFormatted           time.Time          `json:"-"`
	AssociateName                  string             `json:"associate_name,omitempty"`
	AssociatePhone                 string             `json:"associate_phone,omitempty"`
	ClientName                     string             `json:"client_name,omitempty"`
	ClientPhone                    string             `json:"client_phone,omitempty"`
	ClientEmail                    string             `json:"client_email,omitempty"`
	Line01Qty                      int64              `json:"line_01_quantity"`
	Line01Desc                     string             `json:"line_01_description,omitempty"`
	Line01Price                    float64            `json:"line_01_unit_price,omitempty"`
	Line01Amount                   float64            `json:"line_01_amount,omitempty"`
	Line02Qty                      int64              `json:"line_02_quantity,omitempty"`
	Line02Desc                     string             `json:"line_02_description,omitempty"`
	Line02Price                    float64            `json:"line_02_unit_price,omitempty"`
	Line02Amount                   float64            `json:"line_02_amount,omitempty"`
	Line03Qty                      int64              `json:"line_03_quantity,omitempty"`
	Line03Desc                     string             `json:"line_03_description,omitempty"`
	Line03Price                    float64            `json:"line_03_unit_price,omitempty"`
	Line03Amount                   float64            `json:"line_03_amount,omitempty"`
	Line04Qty                      int64              `json:"line_04_quantity,omitempty"`
	Line04Desc                     string             `json:"line_04_description,omitempty"`
	Line04Price                    float64            `json:"line_04_unit_price,omitempty"`
	Line04Amount                   float64            `json:"line_04_amount,omitempty"`
	Line05Qty                      int64              `json:"line_05_quantity,omitempty"`
	Line05Desc                     string             `json:"line_05_description,omitempty"`
	Line05Price                    float64            `json:"line_05_unit_price,omitempty"`
	Line05Amount                   float64            `json:"line_05_amount,omitempty"`
	Line06Qty                      int64              `json:"line_06_quantity,omitempty"`
	Line06Desc                     string             `json:"line_06_description,omitempty"`
	Line06Price                    float64            `json:"line_06_unit_price,omitempty"`
	Line06Amount                   float64            `json:"line_06_amount,omitempty"`
	Line07Qty                      int64              `json:"line_07_quantity,omitempty"`
	Line07Desc                     string             `json:"line_07_description,omitempty"`
	Line07Price                    float64            `json:"line_07_unit_price,omitempty"`
	Line07Amount                   float64            `json:"line_07_amount,omitempty"`
	Line08Qty                      int64              `json:"line_08_quantity,omitempty"`
	Line08Desc                     string             `json:"line_08_description,omitempty"`
	Line08Price                    float64            `json:"line_08_unit_price,omitempty"`
	Line08Amount                   float64            `json:"line_08_amount,omitempty"`
	Line09Qty                      int64              `json:"line_09_quantity,omitempty"`
	Line09Desc                     string             `json:"line_09_description,omitempty"`
	Line09Price                    float64            `json:"line_09_unit_price,omitempty"`
	Line09Amount                   float64            `json:"line_09_amount,omitempty"`
	Line10Qty                      int64              `json:"line_10_quantity,omitempty"`
	Line10Desc                     string             `json:"line_10_description,omitempty"`
	Line10Price                    float64            `json:"line_10_unit_price,omitempty"`
	Line10Amount                   float64            `json:"line_10_amount,omitempty"`
	Line11Qty                      int64              `json:"line_11_quantity,omitempty"`
	Line11Desc                     string             `json:"line_11_description,omitempty"`
	Line11Price                    float64            `json:"line_11_unit_price,omitempty"`
	Line11Amount                   float64            `json:"line_11_amount,omitempty"`
	Line12Qty                      int64              `json:"line_12_quantity,omitempty"`
	Line12Desc                     string             `json:"line_12_description,omitempty"`
	Line12Price                    float64            `json:"line_12_unit_price,omitempty"`
	Line12Amount                   float64            `json:"line_12_amount,omitempty"`
	Line13Qty                      int64              `json:"line_13_quantity,omitempty"`
	Line13Desc                     string             `json:"line_13_description,omitempty"`
	Line13Price                    float64            `json:"line_13_unit_price,omitempty"`
	Line13Amount                   float64            `json:"line_13_amount,omitempty"`
	Line14Qty                      int64              `json:"line_14_quantity,omitempty"`
	Line14Desc                     string             `json:"line_14_description,omitempty"`
	Line14Price                    float64            `json:"line_14_unit_price,omitempty"`
	Line14Amount                   float64            `json:"line_14_amount,omitempty"`
	Line15Qty                      int64              `json:"line_15_quantity,omitempty"`
	Line15Desc                     string             `json:"line_15_description,omitempty"`
	Line15Price                    float64            `json:"line_15_unit_price,omitempty"`
	Line15Amount                   float64            `json:"line_15_amount,omitempty"`
	InvoiceQuoteDays               int8               `json:"invoice_quote_days,omitempty"`
	InvoiceAssociateTax            string             `json:"invoice_associate_tax,omitempty"`
	InvoiceQuoteDate               string             `json:"invoice_quote_date,omitempty"`
	InvoiceQuoteDateFormatted      time.Time          `json:"-"`
	InvoiceCustomersApproval       string             `json:"invoice_customers_approval,omitempty"`
	Line01Notes                    string             `json:"line_01_notes,omitempty"`
	Line02Notes                    string             `json:"line_02_notes,omitempty"`
	TotalLabour                    float64            `json:"total_labour,omitempty"`
	TotalMaterials                 float64            `json:"total_materials,omitempty"`
	OtherCosts                     float64            `json:"other_costs,omitempty"`
	SubTotal                       float64            `json:"sub_total,omitempty"`
	Tax                            float64            `json:"tax,omitempty"`
	IsCustomTax                    bool               `bson:"is_custom_tax" json:"is_custom_tax,omitempty"`
	Total                          float64            `json:"total,omitempty"`
	PaymentAmount                  float64            `json:"payment_amount,omitempty"`
	DateClientPaidInvoice          string             `json:"date_client_paid_invoice,omitempty"`
	DateClientPaidInvoiceFormatted time.Time          `json:"-"`
	PaymentMethods                 []int8             `bson:"payment_methods" json:"payment_methods,omitempty"`
	ClientSignature                string             `json:"client_signature,omitempty"`
	AssociateSignDate              string             `json:"associate_sign_date,omitempty"`
	AssociateSignDateFormatted     time.Time          `json:"-"`
	AssociateSignature             string             `json:"associate_signature,omitempty"`
	WorkOrderId                    string             `json:"work_order_id,omitempty"`
	CreatedTime                    string             `json:"created_time,omitempty"`
	LastModifiedTime               string             `json:"last_modified_time,omitempty"`
	CreatedById                    string             `json:"created_by_id,omitempty"`
	CreatedByName                  string             `json:"created_by_name,omitempty"`
	LastModifiedById               string             `json:"last_modified_by_id,omitempty"`
	LastModifiedByName             string             `json:"last_modified_by_name,omitempty"`
	CreatedFrom                    string             `json:"created_from,omitempty"`
	CreatedFromIsPublic            string             `json:"created_from_is_public,omitempty"`
	LastModifiedFrom               string             `json:"last_modified_from,omitempty"`
	LastModifiedFromIsPublic       string             `json:"last_modified_from_is_public,omitempty"`
	ClientAddress                  string             `json:"client_address,omitempty"`
	RevisionVersion                string             `json:"revision_version,omitempty"`
	Deposit                        float64            `json:"deposit,omitempty"`
	AmountDue                      float64            `json:"amount_due,omitempty"`
	State                          string             `json:"state,omitempty"` // IsArchived string `json:"is_archived,omitempty"`
	OldId                          string             `json:"public_id,omitempty"`
}

func (impl *OrderControllerImpl) validateOperationGenerateInvoiceRequest(ctx context.Context, dirtyData *OrderOperationGenerateInvoiceRequest) error {
	e := make(map[string]string)

	if dirtyData.OrderID.IsZero() {
		e["order_id"] = "missing value"
	}
	if dirtyData.InvoiceID == "" {
		e["invoice_id"] = "missing value"
	}
	if dirtyData.InvoiceDate == "" {
		e["invoice_date"] = "missing value"
	}
	if dirtyData.AssociateName == "" {
		e["associate_name"] = "missing value"
	}
	if dirtyData.AssociatePhone == "" {
		e["associate_phone"] = "missing value"
	}
	if dirtyData.AssociateSignDate == "" {
		e["associate_sign_date"] = "missing value"
	}
	if dirtyData.ClientName == "" {
		e["client_name"] = "missing value"
	}
	if dirtyData.ClientAddress == "" {
		e["Client_address"] = "missing value"
	}
	if dirtyData.ClientPhone == "" {
		e["client_phone"] = "missing value"
	}
	if dirtyData.ClientSignature == "" {
		e["client_signature"] = "missing value"
	}
	if dirtyData.Line01Qty == 0 {
		e["line_01_quantity"] = "missing value"
	}
	if dirtyData.Line01Desc == "" {
		e["line_01_description"] = "missing value"
	}
	if dirtyData.Line01Price == 0 {
		e["line_01_unit_price"] = "missing value"
	}
	if dirtyData.Line01Amount == 0 {
		e["line_01_amount"] = "missing value"
	}
	if dirtyData.InvoiceQuoteDays == 0 {
		e["invoice_quote_days"] = "missing value"
	}
	if dirtyData.InvoiceQuoteDateFormatted.IsZero() {
		e["invoice_quote_date"] = "missing value"
	}
	if dirtyData.InvoiceCustomersApproval == "" {
		e["invoice_customers_approval"] = "missing value"
	}
	if dirtyData.Total == 0 {
		e["total"] = "missing value"
	}
	// if dirtyData.Line01Notes == "" {
	// 	e["line_01_notes"] = "missing value"
	// }
	if dirtyData.DateClientPaidInvoiceFormatted.IsZero() {
		e["date_client_paid_invoice"] = "missing value"
	}
	if dirtyData.ClientSignature == "" {
		e["client_signature"] = "missing value"
	}
	if dirtyData.AssociateSignDateFormatted.IsZero() {
		e["associate_sign_date"] = "missing value"
	}
	if dirtyData.AssociateSignature == "" {
		e["associate_signature"] = "missing value"
	}
	if len(dirtyData.PaymentMethods) == 0 {
		e["payment_methods"] = "missing value"
	}

	if len(e) != 0 {
		return httperror.NewForBadRequest(&e)
	}
	return nil
}

func (impl *OrderControllerImpl) GenerateInvoice(ctx context.Context, req *OrderOperationGenerateInvoiceRequest) (*o_s.Order, error) {
	//
	// Get variables from our user authenticated session.
	//

	tid, _ := ctx.Value(constants.SessionUserTenantID).(primitive.ObjectID)
	userRole, _ := ctx.Value(constants.SessionUserRole).(int8)
	userID, _ := ctx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := ctx.Value(constants.SessionUserName).(string)
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	//
	// Perform our validation and return validation error on any issues detected.
	//

	if err := impl.validateOperationGenerateInvoiceRequest(ctx, req); err != nil {
		impl.Logger.Warn("validation error", slog.Any("error", err))
		return nil, err
	}

	////
	//// Lock this task until completed (including errors as well).
	////

	impl.Kmutex.Lock(req.OrderID.Hex())
	defer impl.Kmutex.Unlock(req.OrderID.Hex())

	////
	//// Start the transaction.
	////

	session, err := impl.DbClient.StartSession()
	if err != nil {
		impl.Logger.Warn("start session error",
			slog.Any("order_id", req.OrderID),
			slog.Any("error", err))
		return nil, err
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

		////
		//// Fetch the order.
		////

		o, err := impl.OrderStorer.GetByID(sessCtx, req.OrderID)
		if err != nil {
			impl.Logger.Error("database get by id error",
				slog.Any("order_id", req.OrderID),
				slog.Any("error", err))
			return nil, err
		}
		if o == nil {
			err := fmt.Errorf("order does not exist for ID %v", req.OrderID)
			impl.Logger.Error("order does not exis",
				slog.Any("order_id", req.OrderID),
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Apply protection based on ownership and account role.
		////

		// Handle permissions based on roles.
		// (1) O55 staff gets full access
		// (2) Associates are only allowed to view the customers that the
		//     associate has done business with.
		// (3) Deny all other user role types.
		switch userRole {
		case user_s.UserRoleExecutive, user_s.UserRoleManagement, user_s.UserRoleStaff:
			if o.TenantID != tid {
				impl.Logger.Error("incorrect tenant membership error", slog.Any("tenant_id", tid))
				return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have organization membership to view")
			}
		case user_s.UserRoleAssociate:
			associateID, _ := ctx.Value(constants.SessionUserReferenceID).(primitive.ObjectID)
			if associateID != o.AssociateID {
				impl.Logger.Error("different associate order access error", slog.Any("associate_id", associateID))
				return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you did not do this order")
			}
		default:
			impl.Logger.Warn("user does not permission error", slog.Any("role", userRole))
			return nil, httperror.NewForForbiddenWithSingleField("forbidden", "you do not have the correct role")
		}

		////
		//// Update order.
		////

		o.PaymentMethods = req.PaymentMethods
		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("order update error",
				slog.Any("error", err))
			return nil, err
		}

		////
		//// Generate PDF.
		////

		dto := &pdfbuilder.AssociateInvoiceBuilderRequestDTO{
			ID:                       primitive.NewObjectID(),
			TenantID:                 tid,
			OrderID:                  req.OrderID,
			OrderWJID:                o.WJID,
			InvoiceID:                req.InvoiceID,
			InvoiceDate:              req.InvoiceDateFormatted,
			AssociateName:            req.AssociateName,
			AssociatePhone:           req.AssociatePhone,
			ClientName:               req.ClientName,
			ClientPhone:              req.ClientPhone,
			ClientEmail:              req.ClientEmail,
			Line01Qty:                req.Line01Qty,
			Line01Desc:               req.Line01Desc,
			Line01Price:              req.Line01Price,
			Line01Amount:             req.Line01Amount,
			Line02Qty:                req.Line02Qty,
			Line02Desc:               req.Line02Desc,
			Line02Price:              req.Line02Price,
			Line02Amount:             req.Line02Amount,
			Line03Qty:                req.Line03Qty,
			Line03Desc:               req.Line03Desc,
			Line03Price:              req.Line03Price,
			Line03Amount:             req.Line03Amount,
			Line04Qty:                req.Line04Qty,
			Line04Desc:               req.Line04Desc,
			Line04Price:              req.Line04Price,
			Line04Amount:             req.Line04Amount,
			Line05Qty:                req.Line05Qty,
			Line05Desc:               req.Line05Desc,
			Line05Price:              req.Line05Price,
			Line05Amount:             req.Line05Amount,
			Line06Qty:                req.Line06Qty,
			Line06Desc:               req.Line06Desc,
			Line06Price:              req.Line06Price,
			Line06Amount:             req.Line06Amount,
			Line07Qty:                req.Line07Qty,
			Line07Desc:               req.Line07Desc,
			Line07Price:              req.Line07Price,
			Line07Amount:             req.Line07Amount,
			Line08Qty:                req.Line08Qty,
			Line08Desc:               req.Line08Desc,
			Line08Price:              req.Line08Price,
			Line08Amount:             req.Line08Amount,
			Line09Qty:                req.Line09Qty,
			Line09Desc:               req.Line09Desc,
			Line09Price:              req.Line09Price,
			Line09Amount:             req.Line09Amount,
			Line10Qty:                req.Line10Qty,
			Line10Desc:               req.Line10Desc,
			Line10Price:              req.Line10Price,
			Line10Amount:             req.Line10Amount,
			Line11Qty:                req.Line11Qty,
			Line11Desc:               req.Line11Desc,
			Line11Price:              req.Line11Price,
			Line11Amount:             req.Line11Amount,
			Line12Qty:                req.Line12Qty,
			Line12Desc:               req.Line12Desc,
			Line12Price:              req.Line12Price,
			Line12Amount:             req.Line12Amount,
			Line13Qty:                req.Line13Qty,
			Line13Desc:               req.Line13Desc,
			Line13Price:              req.Line13Price,
			Line13Amount:             req.Line13Amount,
			Line14Qty:                req.Line14Qty,
			Line14Desc:               req.Line14Desc,
			Line14Price:              req.Line14Price,
			Line14Amount:             req.Line14Amount,
			Line15Qty:                req.Line15Qty,
			Line15Desc:               req.Line15Desc,
			Line15Price:              req.Line15Price,
			Line15Amount:             req.Line15Amount,
			InvoiceQuoteDays:         req.InvoiceQuoteDays,
			InvoiceAssociateTax:      req.InvoiceAssociateTax,
			InvoiceQuoteDate:         req.InvoiceQuoteDateFormatted,
			InvoiceCustomersApproval: req.InvoiceCustomersApproval,
			Line01Notes:              req.Line01Notes,
			Line02Notes:              req.Line02Notes,
			TotalLabour:              req.TotalLabour,
			TotalMaterials:           req.TotalMaterials,
			OtherCosts:               req.OtherCosts,
			Tax:                      req.Tax,
			IsCustomTax:              req.IsCustomTax,
			Total:                    req.Total,
			PaymentAmount:            req.PaymentAmount,
			DateClientPaidInvoice:    req.DateClientPaidInvoiceFormatted,
			PaymentMethods:           req.PaymentMethods,
			ClientSignature:          req.ClientSignature,
			AssociateSignDate:        req.AssociateSignDateFormatted,
			AssociateSignature:       req.AssociateSignature,
			CreatedById:              userID,
			CreatedByName:            userName,
			CreatedFrom:              ipAddress,
			LastModifiedById:         userID,
			LastModifiedByName:       userName,
			LastModifiedFrom:         ipAddress,
			ClientAddress:            req.ClientAddress,
			Version:                  1,
			Deposit:                  req.Deposit,
			AmountDue:                req.AmountDue,
			SubTotal:                 req.SubTotal,
		}

		pdfResponse, err := impl.AssociateInvoiceBuilder.GeneratePDF(dto)
		if err != nil {
			impl.Logger.Error("associate invoice generation error",
				slog.Any("error", err))
			return nil, err
		}
		if pdfResponse == nil {
			impl.Logger.Error("associate invoice pdf generation produced nothing")
			return nil, fmt.Errorf("associate invoice pdf did not generate")
		}

		// The next few lines will upload our PDF to our remote storage. Once the
		// file is saved remotely, we will have a connection to it through a "key"
		// unique reference to the uploaded file.
		path := fmt.Sprintf("uploads/%v", pdfResponse.FileName)

		////
		//// Upload to S3
		////

		impl.Logger.Debug("S3 will upload...",
			slog.String("path", path))

		err = impl.S3.UploadContent(sessCtx, path, pdfResponse.Content)
		if err != nil {
			impl.Logger.Error("s3 upload error", slog.Any("error", err))
			return nil, err
		}

		impl.Logger.Debug("S3 uploaded with success",
			slog.String("path", path))

		////
		//// Generate downloadable url
		////

		// The following will generate a pre-signed URL so user can download the file.
		expiryDate := time.Now().Add(time.Minute * 15)
		downloadableURL, err := impl.S3.GetDownloadablePresignedURL(sessCtx, path, time.Minute*15)
		if err != nil {
			impl.Logger.Error("s3 presign error", slog.Any("error", err))
			return nil, err
		}

		// Removing local file from the directory and don't do anything if we have errors.
		if err := os.Remove(pdfResponse.FilePath); err != nil {
			impl.Logger.Warn("removing local file error", slog.Any("error", err))
			// Just continue even if we get an error...
		}

		impl.Logger.Debug("local associate invoice pdf deleted",
			slog.String("filename", pdfResponse.FileName))

		////
		//// Attach to order
		////

		// Generate the revision version for any updates/create in which zero
		// means no previous revisions and any number afterwords indicates
		// a revision occured.
		var revisionVersion int8 = 0
		if o.PastInvoices != nil {
			if len(o.PastInvoices) > 0 {
				revisionVersion = int8(len(o.PastInvoices))
			}
		}

		invoice := &o_s.OrderInvoice{
			ID:                       primitive.NewObjectID(),
			OrderID:                  o.ID,
			OrderWJID:                o.WJID,
			OrderTenantIDWithWJID:    o.TenantIDWithWJID,
			TenantID:                 o.TenantID,
			CreatedAt:                o.CreatedAt,
			CreatedByUserID:          userID,
			CreatedByUserName:        userName,
			CreatedFromIPAddress:     ipAddress,
			ModifiedAt:               time.Now(),
			ModifiedByUserID:         userID,
			ModifiedByUserName:       userName,
			ModifiedFromIPAddress:    ipAddress,
			InvoiceID:                req.InvoiceID,
			InvoiceDate:              req.InvoiceDateFormatted,
			AssociateName:            req.AssociateName,
			AssociatePhone:           req.AssociatePhone,
			ClientName:               req.ClientName,
			ClientPhone:              req.ClientPhone,
			ClientEmail:              req.ClientEmail,
			Line01Qty:                req.Line01Qty,
			Line01Desc:               req.Line01Desc,
			Line01Price:              req.Line01Price,
			Line01Amount:             req.Line01Amount,
			Line02Qty:                req.Line02Qty,
			Line02Desc:               req.Line02Desc,
			Line02Price:              req.Line02Price,
			Line02Amount:             req.Line02Amount,
			Line03Qty:                req.Line03Qty,
			Line03Desc:               req.Line03Desc,
			Line03Price:              req.Line03Price,
			Line03Amount:             req.Line03Amount,
			Line04Qty:                req.Line04Qty,
			Line04Desc:               req.Line04Desc,
			Line04Price:              req.Line04Price,
			Line04Amount:             req.Line04Amount,
			Line05Qty:                req.Line05Qty,
			Line05Desc:               req.Line05Desc,
			Line05Price:              req.Line05Price,
			Line05Amount:             req.Line05Amount,
			Line06Qty:                req.Line06Qty,
			Line06Desc:               req.Line06Desc,
			Line06Price:              req.Line06Price,
			Line06Amount:             req.Line06Amount,
			Line07Qty:                req.Line07Qty,
			Line07Desc:               req.Line07Desc,
			Line07Price:              req.Line07Price,
			Line07Amount:             req.Line07Amount,
			Line08Qty:                req.Line08Qty,
			Line08Desc:               req.Line08Desc,
			Line08Price:              req.Line08Price,
			Line08Amount:             req.Line08Amount,
			Line09Qty:                req.Line09Qty,
			Line09Desc:               req.Line09Desc,
			Line09Price:              req.Line09Price,
			Line09Amount:             req.Line09Amount,
			Line10Qty:                req.Line10Qty,
			Line10Desc:               req.Line10Desc,
			Line10Price:              req.Line10Price,
			Line10Amount:             req.Line10Amount,
			Line11Qty:                req.Line11Qty,
			Line11Desc:               req.Line11Desc,
			Line11Price:              req.Line11Price,
			Line11Amount:             req.Line11Amount,
			Line12Qty:                req.Line12Qty,
			Line12Desc:               req.Line12Desc,
			Line12Price:              req.Line12Price,
			Line12Amount:             req.Line12Amount,
			Line13Qty:                req.Line13Qty,
			Line13Desc:               req.Line13Desc,
			Line13Price:              req.Line13Price,
			Line13Amount:             req.Line13Amount,
			Line14Qty:                req.Line14Qty,
			Line14Desc:               req.Line14Desc,
			Line14Price:              req.Line14Price,
			Line14Amount:             req.Line14Amount,
			Line15Qty:                req.Line15Qty,
			Line15Desc:               req.Line15Desc,
			Line15Price:              req.Line15Price,
			Line15Amount:             req.Line15Amount,
			InvoiceQuoteDays:         req.InvoiceQuoteDays,
			InvoiceAssociateTax:      req.InvoiceAssociateTax,
			InvoiceQuoteDate:         req.InvoiceQuoteDateFormatted,
			InvoiceCustomersApproval: req.InvoiceCustomersApproval,
			Line01Notes:              req.Line01Notes,
			Line02Notes:              req.Line02Notes,
			TotalLabour:              req.TotalLabour,
			TotalMaterials:           req.TotalMaterials,
			OtherCosts:               req.OtherCosts,
			Tax:                      req.Tax,
			Total:                    req.Total,
			PaymentAmount:            req.PaymentAmount,
			DateClientPaidInvoice:    req.DateClientPaidInvoiceFormatted,
			PaymentMethods:           req.PaymentMethods,
			ClientSignature:          req.ClientSignature,
			AssociateSignDate:        req.AssociateSignDateFormatted,
			AssociateSignature:       req.AssociateSignature,
			WorkOrderID:              o.WJID,
			ClientAddress:            req.ClientAddress,
			RevisionVersion:          revisionVersion,
			Deposit:                  req.Deposit,
			AmountDue:                req.AmountDue,
			SubTotal:                 req.SubTotal,
			FileObjectKey:            path,
			FileTitle:                pdfResponse.FileName,
			FileObjectURL:            downloadableURL,
			FileObjectExpiry:         expiryDate,
			Status:                   o_s.OrderStatusCompletedAndPaid,
		}
		// Case 1 of 2: Previous invoice already exists.
		if o.Invoice != nil {
			if o.PastInvoices == nil {
				o.PastInvoices = make([]*o_s.OrderInvoice, 0)
			}
			o.PastInvoices = append(o.PastInvoices, o.Invoice)
		}
		o.Invoice = invoice
		o.ModifiedAt = time.Now()
		o.ModifiedByUserID = userID
		o.ModifiedByUserName = userName
		o.ModifiedFromIPAddress = ipAddress

		if err := impl.OrderStorer.UpdateByID(sessCtx, o); err != nil {
			impl.Logger.Error("order update error",
				slog.Any("order_id", req.OrderID))
			return nil, err
		}

		impl.Logger.Debug("order updated due to generate invoice",
			slog.Any("order_id", req.OrderID))

		////
		//// Exit our transaction successfully.
		////

		// For development purposes only.
		// return nil, errors.New("halt because of programmer")

		return o, nil
	} // end transaction function.

	// Start a transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		impl.Logger.Error("transaction error",
			slog.Any("order_id", req.OrderID),
			slog.Any("error", err))
		return nil, err
	}
	return result.(*o_s.Order), nil
}

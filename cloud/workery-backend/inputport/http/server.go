package http

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/rs/cors"

	activitysheet_http "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/httptransport"
	associate_http "github.com/over55/monorepo/cloud/workery-backend/app/associate/httptransport"
	associateawaylog_http "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/httptransport"
	attachment_http "github.com/over55/monorepo/cloud/workery-backend/app/attachment/httptransport"
	bulletin_http "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/httptransport"
	comment_http "github.com/over55/monorepo/cloud/workery-backend/app/comment/httptransport"
	customer_http "github.com/over55/monorepo/cloud/workery-backend/app/customer/httptransport"
	dashboard_http "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/httptransport"
	gateway_http "github.com/over55/monorepo/cloud/workery-backend/app/gateway/httptransport"
	howhear_http "github.com/over55/monorepo/cloud/workery-backend/app/howhear/httptransport"
	insurancerequirement_http "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/httptransport"
	naics_http "github.com/over55/monorepo/cloud/workery-backend/app/naics/httptransport"
	noc_http "github.com/over55/monorepo/cloud/workery-backend/app/noc/httptransport"
	order_http "github.com/over55/monorepo/cloud/workery-backend/app/order/httptransport"
	orderincident_http "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/httptransport"
	report_http "github.com/over55/monorepo/cloud/workery-backend/app/report/httptransport"
	servicefee_http "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/httptransport"
	skillset_http "github.com/over55/monorepo/cloud/workery-backend/app/skillset/httptransport"
	staff_http "github.com/over55/monorepo/cloud/workery-backend/app/staff/httptransport"
	tag_http "github.com/over55/monorepo/cloud/workery-backend/app/tag/httptransport"
	taskitem_http "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/httptransport"
	tenant_http "github.com/over55/monorepo/cloud/workery-backend/app/tenant/httptransport"
	user_http "github.com/over55/monorepo/cloud/workery-backend/app/user/httptransport"
	vehicletype_http "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/httptransport"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/inputport/http/middleware"
)

type InputPortServer interface {
	Run()
	Shutdown()
}

type httpInputPort struct {
	Config                                    *config.Conf
	Logger                                    *slog.Logger
	Server                                    *http.Server
	Middleware                                middleware.Middleware
	Gateway                                   *gateway_http.Handler
	Tag                                       *tag_http.Handler
	SkillSet                                  *skillset_http.Handler
	InsuranceRequirement                      *insurancerequirement_http.Handler
	VehicleType                               *vehicletype_http.Handler
	NationalOccupationalClassification        *noc_http.Handler
	NorthAmericanIndustryClassificationSystem *naics_http.Handler
	HowHear                                   *howhear_http.Handler
	ServiceFee                                *servicefee_http.Handler
	User                                      *user_http.Handler
	Tenant                                    *tenant_http.Handler
	Associate                                 *associate_http.Handler
	Comment                                   *comment_http.Handler
	Staff                                     *staff_http.Handler
	Customer                                  *customer_http.Handler
	Attachment                                *attachment_http.Handler
	Order                                     *order_http.Handler
	ActivitySheet                             *activitysheet_http.Handler
	TaskItem                                  *taskitem_http.Handler
	Dashboard                                 *dashboard_http.Handler
	Bulletin                                  *bulletin_http.Handler
	AssociateAwayLog                          *associateawaylog_http.Handler
	OrderIncident                             *orderincident_http.Handler
	Report                                    *report_http.Handler
}

func NewInputPort(
	configp *config.Conf,
	loggerp *slog.Logger,
	mid middleware.Middleware,
	gh *gateway_http.Handler,
	cu *user_http.Handler,
	tag *tag_http.Handler,
	ss *skillset_http.Handler,
	vt *vehicletype_http.Handler,
	noc *noc_http.Handler,
	naics *naics_http.Handler,
	ireq *insurancerequirement_http.Handler,
	hh *howhear_http.Handler,
	sf *servicefee_http.Handler,
	a *associate_http.Handler,
	com *comment_http.Handler,
	staf *staff_http.Handler,
	org *tenant_http.Handler,
	cust *customer_http.Handler,
	att *attachment_http.Handler,
	ord *order_http.Handler,
	sh *activitysheet_http.Handler,
	ti *taskitem_http.Handler,
	dash *dashboard_http.Handler,
	bul *bulletin_http.Handler,
	aal *associateawaylog_http.Handler,
	orderincident *orderincident_http.Handler,
	report *report_http.Handler,
) InputPortServer {
	// Initialize the ServeMux.
	mux := http.NewServeMux()

	// cors.Default() setup the middleware with default options being
	// all origins accepted with simple methods (GET, POST). See
	// documentation via `https://github.com/rs/cors` for more options.
	handler := cors.AllowAll().Handler(mux)

	// Bind the HTTP server to the assigned address and port.
	addr := fmt.Sprintf("%s:%s", configp.AppServer.IP, configp.AppServer.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: handler,
	}

	// Create our HTTP server controller.
	p := &httpInputPort{
		Config:                             configp,
		Logger:                             loggerp,
		Middleware:                         mid,
		Gateway:                            gh,
		User:                               cu,
		Tag:                                tag,
		SkillSet:                           ss,
		InsuranceRequirement:               ireq,
		VehicleType:                        vt,
		NationalOccupationalClassification: noc,
		NorthAmericanIndustryClassificationSystem: naics,
		HowHear:          hh,
		ServiceFee:       sf,
		Tenant:           org,
		Customer:         cust,
		Staff:            staf,
		Associate:        a,
		Attachment:       att,
		Order:            ord,
		ActivitySheet:    sh,
		TaskItem:         ti,
		Dashboard:        dash,
		Bulletin:         bul,
		Comment:          com,
		AssociateAwayLog: aal,
		OrderIncident:    orderincident,
		Report:           report,
		Server:           srv,
	}

	// Attach the HTTP server controller to the ServerMux.
	mux.HandleFunc("/", mid.Attach(p.HandleRequests))

	return p
}

func (port *httpInputPort) Run() {
	port.Logger.Info("HTTP server running")
	if err := port.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		port.Logger.Error("listen failed", slog.Any("error", err))

		// DEVELOPERS NOTE: We terminate app here b/c dependency injection not allowed to fail, so fail here at startup of app.
		panic("failed running")
	}
}

func (port *httpInputPort) Shutdown() {
	port.Logger.Info("HTTP server shutdown")
}

func (port *httpInputPort) HandleRequests(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get our URL paths which are slash-seperated.
	ctx := r.Context()
	p := ctx.Value("url_split").([]string)
	n := len(p)
	// port.Logger.Debug("Handling request", // For debugging purposes only.
	// 	slog.Int("n", n),
	// 	slog.String("m", r.Method),
	// 	slog.Any("p", p),
	// )

	switch {
	// --- GATEWAY & PROFILE --- //
	case n == 3 && p[1] == "v1" && p[2] == "health-check" && r.Method == http.MethodGet:
		port.Gateway.HealthCheck(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "version" && r.Method == http.MethodGet:
		port.Gateway.Version(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "greeting" && r.Method == http.MethodPost:
		port.Gateway.Greet(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "login" && r.Method == http.MethodPost:
		port.Gateway.Login(w, r)
	// case n == 3 && p[1] == "v1" && p[2] == "register" && r.Method == http.MethodPost:
	// 	port.Gateway.Register(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "refresh-token" && r.Method == http.MethodPost:
		port.Gateway.RefreshToken(w, r)
	// case n == 3 && p[1] == "v1" && p[2] == "verify" && r.Method == http.MethodPost:
	// 	port.Gateway.Verify(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "logout" && r.Method == http.MethodPost:
		port.Gateway.Logout(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "profile" && r.Method == http.MethodGet:
		port.Gateway.Profile(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "profile" && r.Method == http.MethodPut:
		port.Gateway.ProfileUpdate(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "forgot-password" && r.Method == http.MethodPost:
		port.Gateway.ForgotPassword(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "password-reset" && r.Method == http.MethodPost:
		port.Gateway.PasswordReset(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "profile" && p[3] == "change-password" && r.Method == http.MethodPut:
		port.Gateway.ChangePassword(w, r)
		// case n == 3 && p[1] == "v1" && p[2] == "profile" && r.Method == http.MethodGet:
	case n == 3 && p[1] == "v1" && p[2] == "executive-visit-tenant" && r.Method == http.MethodPost:
		port.Gateway.ExecutiveVisitsTenant(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "dashboard" && r.Method == http.MethodGet:
		port.Dashboard.Dashboard(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "generate" && r.Method == http.MethodPost:
		port.Gateway.GenerateOTP(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "generate-qr-code" && r.Method == http.MethodPost:
		port.Gateway.GenerateOTPAndQRCodePNGImage(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "verify" && r.Method == http.MethodPost:
		port.Gateway.VerifyOTP(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "validate" && r.Method == http.MethodPost:
		port.Gateway.ValidateOTP(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "disable" && r.Method == http.MethodPost:
		port.Gateway.DisableOTP(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "otp" && p[3] == "recovery" && r.Method == http.MethodPost:
		port.Gateway.RecoveryOTP(w, r)

	// --- ORGANIZATION --- //
	case n == 3 && p[1] == "v1" && p[2] == "tenants" && r.Method == http.MethodGet:
		port.Tenant.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "tenants" && r.Method == http.MethodPost:
		port.Tenant.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "tenant" && r.Method == http.MethodGet:
		port.Tenant.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "tenant" && r.Method == http.MethodPut:
		port.Tenant.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "tenant" && r.Method == http.MethodDelete:
		port.Tenant.DeleteByID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "tenants" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.Tenant.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "tenants" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.Tenant.ListAsSelectOptionByFilter(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "tenants" && p[3] == "operations" && p[4] == "update-tax-rate" && r.Method == http.MethodPost:
		port.Tenant.UpdateTaxRateOperation(w, r)

	// --- CUSTOMERS --- //
	case n == 3 && p[1] == "v1" && p[2] == "customers" && r.Method == http.MethodGet:
		port.Customer.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "customers" && r.Method == http.MethodPost:
		port.Customer.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "customer" && r.Method == http.MethodGet:
		port.Customer.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "customer" && r.Method == http.MethodPut:
		port.Customer.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "customer" && r.Method == http.MethodDelete:
		port.Customer.DeleteByID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.Customer.OperationCreateComment(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "archive" && r.Method == http.MethodPost:
		port.Customer.OperationArchive(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "downgrade" && r.Method == http.MethodPost:
		port.Customer.OperationDowngrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "upgrade" && r.Method == http.MethodPost:
		port.Customer.OperationUpgrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "avatar" && r.Method == http.MethodPost:
		port.Customer.OperationAvatar(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "change-password" && r.Method == http.MethodPost:
		port.Customer.OperationChangePassword(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "change-2fa" && r.Method == http.MethodPost:
		port.Customer.OperationChangeTwoFactorAuthentication(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "ban" && r.Method == http.MethodPost:
		port.Customer.OperationBan(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "unban" && r.Method == http.MethodPost:
		port.Customer.OperationUnban(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "customers" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.Customer.ListAsSelectOptions(w, r)

	// --- ASSOCIATE --- //
	case n == 3 && p[1] == "v1" && p[2] == "associates" && r.Method == http.MethodGet:
		port.Associate.LiteList(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "associates" && r.Method == http.MethodPost:
		port.Associate.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "associate" && r.Method == http.MethodGet:
		port.Associate.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "associate" && r.Method == http.MethodPut:
		port.Associate.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "associate" && r.Method == http.MethodDelete:
		port.Associate.DeleteByID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.Associate.OperationCreateComment(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operation" && p[4] == "archive" && r.Method == http.MethodPost:
		port.Associate.OperationArchive(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operation" && p[4] == "downgrade" && r.Method == http.MethodPost:
		port.Associate.OperationDowngrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operation" && p[4] == "upgrade" && r.Method == http.MethodPost:
		port.Associate.OperationUpgrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operation" && p[4] == "avatar" && r.Method == http.MethodPost:
		port.Associate.OperationAvatar(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operations" && p[4] == "change-password" && r.Method == http.MethodPost:
		port.Associate.OperationChangePassword(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "associates" && p[3] == "operations" && p[4] == "change-2fa" && r.Method == http.MethodPost:
		port.Associate.OperationChangeTwoFactorAuthentication(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "associates" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.Associate.ListAsSelectOptions(w, r)

	// --- USERS --- //
	case n == 3 && p[1] == "v1" && p[2] == "users" && r.Method == http.MethodGet:
		port.User.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "users" && r.Method == http.MethodPost:
		port.User.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "user" && r.Method == http.MethodGet:
		port.User.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "user" && r.Method == http.MethodPut:
		port.User.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "user" && r.Method == http.MethodDelete:
		port.User.DeleteByID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.User.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "users" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.User.ListAsSelectOptions(w, r)

	// --- ATTACHMENTS --- //
	case n == 3 && p[1] == "v1" && p[2] == "attachments" && r.Method == http.MethodGet:
		port.Attachment.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "attachments" && r.Method == http.MethodPost:
		port.Attachment.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodGet:
		port.Attachment.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodPut:
		port.Attachment.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodDelete:
		port.Attachment.DeleteByID(w, r, p[3])

	// --- ORDER --- //
	case n == 3 && p[1] == "v1" && p[2] == "orders" && r.Method == http.MethodGet:
		port.Order.LiteList(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "orders" && r.Method == http.MethodPost:
		port.Order.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "order" && r.Method == http.MethodGet:
		port.Order.GetByWJID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "order" && r.Method == http.MethodPut:
		port.Order.UpdateByWJID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "order" && p[4] == "financial" && r.Method == http.MethodPut:
		port.Order.UpdateFinancialByWJID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "order" && r.Method == http.MethodDelete:
		port.Order.DeleteByWJID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.Order.OperationCreateComment(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "unassign" && r.Method == http.MethodPost:
		port.Order.OperationUnassign(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "transfer" && r.Method == http.MethodPost:
		port.Order.OperationTransfer(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "postpone" && r.Method == http.MethodPost:
		port.Order.OperationPostpone(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "close" && r.Method == http.MethodPost:
		port.Order.OperationClose(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "generate-invoice" && r.Method == http.MethodPost:
		port.Order.OperationGenerateInvoice(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "orders" && p[3] == "operation" && p[4] == "clone" && r.Method == http.MethodPost:
		port.Order.OperationClone(w, r)

	// --- ACTIVITY SHEETS --- //
	case n == 3 && p[1] == "v1" && p[2] == "activity-sheets" && r.Method == http.MethodGet:
		port.ActivitySheet.LiteList(w, r)
		// case n == 3 && p[1] == "v1" && p[2] == "attachments" && r.Method == http.MethodPost:
		// 	port.ActivitySheet.Create(w, r)
		// case n == 4 && p[1] == "v1" && p[2] == "order" && r.Method == http.MethodGet:
		// 	port.ActivitySheet.GetByID(w, r, p[3])
		// case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodPut:
		// 	port.ActivitySheet.UpdateByID(w, r, p[3])
		// case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodDelete:
		// 	port.ActivitySheet.DeleteByID(w, r, p[3])

	// --- TASK ITEMS --- //
	case n == 3 && p[1] == "v1" && p[2] == "tasks" && r.Method == http.MethodGet:
		port.TaskItem.List(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "tasks" && p[3] == "count" && r.Method == http.MethodGet:
		port.TaskItem.Count(w, r)
	// case n == 3 && p[1] == "v1" && p[2] == "attachments" && r.Method == http.MethodPost:
	// 	port.ActivitySheet.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "task" && r.Method == http.MethodGet:
		port.TaskItem.GetByID(w, r, p[3])
		// case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodPut:
		// 	port.ActivitySheet.UpdateByID(w, r, p[3])
		// case n == 4 && p[1] == "v1" && p[2] == "attachment" && r.Method == http.MethodDelete:
		// 	port.ActivitySheet.DeleteByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "task-operations" && p[3] == "assign-associate" && r.Method == http.MethodPost:
		port.TaskItem.AssignAssociateOperation(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "task-operations" && p[3] == "order-completion" && r.Method == http.MethodPost:
		port.TaskItem.OrderCompletionOperation(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "task-operations" && p[3] == "survey" && r.Method == http.MethodPost:
		port.TaskItem.SurveyOperation(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "task-operations" && p[3] == "postpone" && r.Method == http.MethodPost:
		port.TaskItem.PostponeOperation(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "task-operations" && p[3] == "close" && r.Method == http.MethodPost:
		port.TaskItem.CloseOperation(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "task" && p[4] == "assignable-associates" && r.Method == http.MethodGet:
		port.TaskItem.ListAssignableAssociatesByTaskID(w, r, p[3])

	// --- TAGS --- //
	case n == 3 && p[1] == "v1" && p[2] == "tags" && r.Method == http.MethodGet:
		port.Tag.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "tags" && r.Method == http.MethodPost:
		port.Tag.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "tag" && r.Method == http.MethodGet:
		port.Tag.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "tag" && r.Method == http.MethodPut:
		port.Tag.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "tag" && r.Method == http.MethodDelete:
		port.Tag.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.Tag.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "tags" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.Tag.ListAsSelectOptions(w, r)

	// --- INSURANCE REQUIREMENT --- //
	case n == 3 && p[1] == "v1" && p[2] == "insurance-requirements" && r.Method == http.MethodGet:
		port.InsuranceRequirement.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "insurance-requirements" && r.Method == http.MethodPost:
		port.InsuranceRequirement.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "insurance-requirement" && r.Method == http.MethodGet:
		port.InsuranceRequirement.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "insurance-requirement" && r.Method == http.MethodPut:
		port.InsuranceRequirement.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "insurance-requirement" && r.Method == http.MethodDelete:
		port.InsuranceRequirement.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.Tag.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "insurance-requirements" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.InsuranceRequirement.ListAsSelectOptions(w, r)

	// --- VEHICLE TYPE --- //
	case n == 3 && p[1] == "v1" && p[2] == "vehicle-types" && r.Method == http.MethodGet:
		port.VehicleType.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "vehicle-types" && r.Method == http.MethodPost:
		port.VehicleType.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "vehicle-type" && r.Method == http.MethodGet:
		port.VehicleType.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "vehicle-type" && r.Method == http.MethodPut:
		port.VehicleType.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "vehicle-type" && r.Method == http.MethodDelete:
		port.VehicleType.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.Tag.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "vehicle-types" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.VehicleType.ListAsSelectOptions(w, r)

	// --- HOW HEAR --- //
	case n == 3 && p[1] == "v1" && p[2] == "how-hear-about-us-items" && r.Method == http.MethodGet:
		port.HowHear.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "how-hear-about-us-items" && r.Method == http.MethodPost:
		port.HowHear.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "how-hear-about-us-item" && r.Method == http.MethodGet:
		port.HowHear.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "how-hear-about-us-item" && r.Method == http.MethodPut:
		port.HowHear.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "how-hear-about-us-item" && r.Method == http.MethodDelete:
		port.HowHear.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.Tag.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "how-hear-about-us-items" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.HowHear.ListAsSelectOptions(w, r)

	// --- SERVICE FEE --- //
	case n == 3 && p[1] == "v1" && p[2] == "service-fees" && r.Method == http.MethodGet:
		port.ServiceFee.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "service-fees" && r.Method == http.MethodPost:
		port.ServiceFee.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "service-fee" && r.Method == http.MethodGet:
		port.ServiceFee.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "service-fee" && r.Method == http.MethodPut:
		port.ServiceFee.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "service-fee" && r.Method == http.MethodDelete:
		port.ServiceFee.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "service-fees" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.ServiceFee.OperationCreateComment(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "service-fees" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.ServiceFee.ListAsSelectOptions(w, r)

	// --- BULLETIN --- //
	case n == 3 && p[1] == "v1" && p[2] == "bulletins" && r.Method == http.MethodGet:
		port.Bulletin.PaginatedList(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "bulletins" && r.Method == http.MethodPost:
		port.Bulletin.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "bulletin" && r.Method == http.MethodGet:
		port.Bulletin.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "bulletin" && r.Method == http.MethodPut:
		port.Bulletin.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "bulletin" && r.Method == http.MethodDelete:
		port.Bulletin.DeleteByID(w, r, p[3])
	// case n == 5 && p[1] == "v1" && p[2] == "users" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
	// 	port.Tag.OperationCreateComment(w, r)
	// case n == 4 && p[1] == "v1" && p[2] == "skill-sets" && p[3] == "select-options" && r.Method == http.MethodGet:
	// 	port.SkillSet.ListAsSelectOptions(w, r)

	// --- SKILL SET --- //
	case n == 3 && p[1] == "v1" && p[2] == "skill-sets" && r.Method == http.MethodGet:
		port.SkillSet.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "skill-sets" && r.Method == http.MethodPost:
		port.SkillSet.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "skill-set" && r.Method == http.MethodGet:
		port.SkillSet.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "skill-set" && r.Method == http.MethodPut:
		port.SkillSet.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "skill-set" && r.Method == http.MethodDelete:
		port.SkillSet.DeleteByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "skill-sets" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.SkillSet.ListAsSelectOptions(w, r)

	// --- ASSOCIATE AWAY LOG --- //
	case n == 3 && p[1] == "v1" && p[2] == "associate-away-logs" && r.Method == http.MethodGet:
		port.AssociateAwayLog.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "associate-away-logs" && r.Method == http.MethodPost:
		port.AssociateAwayLog.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "associate-away-log" && r.Method == http.MethodGet:
		port.AssociateAwayLog.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "associate-away-log" && r.Method == http.MethodPut:
		port.AssociateAwayLog.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "associate-away-log" && r.Method == http.MethodDelete:
		port.AssociateAwayLog.DeleteByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "associate-away-logs" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.AssociateAwayLog.ListAsSelectOptions(w, r)

	// --- STAFF --- //
	case n == 3 && p[1] == "v1" && p[2] == "staffs" && r.Method == http.MethodGet:
		port.Staff.LiteList(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "staffs" && r.Method == http.MethodPost:
		port.Staff.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "staff" && r.Method == http.MethodGet:
		port.Staff.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "staff" && r.Method == http.MethodPut:
		port.Staff.UpdateByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "staff" && r.Method == http.MethodDelete:
		port.Staff.DeleteByID(w, r, p[3])
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.Staff.OperationCreateComment(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operation" && p[4] == "archive" && r.Method == http.MethodPost:
		port.Staff.OperationArchive(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operation" && p[4] == "downgrade" && r.Method == http.MethodPost:
		port.Staff.OperationDowngrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operation" && p[4] == "upgrade" && r.Method == http.MethodPost:
		port.Staff.OperationUpgrade(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operation" && p[4] == "avatar" && r.Method == http.MethodPost:
		port.Staff.OperationAvatar(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operations" && p[4] == "change-password" && r.Method == http.MethodPost:
		port.Staff.OperationChangePassword(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "staffs" && p[3] == "operations" && p[4] == "change-2fa" && r.Method == http.MethodPost:
		port.Staff.OperationChangeTwoFactorAuthentication(w, r)
		// case n == 4 && p[1] == "v1" && p[2] == "staffs" && p[3] == "select-options" && r.Method == http.MethodGet:
		//     port.Staff.ListAsSelectOptions(w, r)

	// --- REPORTS --- //
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "1" && r.Method == http.MethodGet:
		port.Report.DownloadReport01(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "2" && r.Method == http.MethodGet:
		port.Report.DownloadReport02(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "3" && r.Method == http.MethodGet:
		port.Report.DownloadReport03(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "4" && r.Method == http.MethodGet:
		port.Report.DownloadReport04(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "5" && r.Method == http.MethodGet:
		port.Report.DownloadReport05(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "6" && r.Method == http.MethodGet:
		port.Report.DownloadReport06(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "7" && r.Method == http.MethodGet:
		port.Report.DownloadReport07(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "8" && r.Method == http.MethodGet:
		port.Report.DownloadReport08(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "9" && r.Method == http.MethodGet:
		port.Report.DownloadReport09(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "10" && r.Method == http.MethodGet:
		port.Report.DownloadReport10(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "11" && r.Method == http.MethodGet:
		port.Report.DownloadReport11(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "12" && r.Method == http.MethodGet:
		port.Report.DownloadReport12(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "13" && r.Method == http.MethodGet:
		port.Report.DownloadReport13(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "15" && r.Method == http.MethodGet:
		port.Report.DownloadReport15(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "16" && r.Method == http.MethodGet:
		port.Report.DownloadReport16(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "17" && r.Method == http.MethodGet:
		port.Report.DownloadReport17(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "19" && r.Method == http.MethodGet:
		port.Report.DownloadReport19(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "20" && r.Method == http.MethodGet:
		port.Report.DownloadReport20(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "21" && r.Method == http.MethodGet:
		port.Report.DownloadReport21(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "report" && p[3] == "22" && r.Method == http.MethodGet:
		port.Report.DownloadReport22(w, r)

	// --- COMMENTS --- //
	case n == 3 && p[1] == "v1" && p[2] == "comments" && r.Method == http.MethodGet:
		port.Comment.List(w, r)

		// --- INCIDENTS --- //
	case n == 3 && p[1] == "v1" && p[2] == "order-incidents" && r.Method == http.MethodGet:
		port.OrderIncident.List(w, r)
	case n == 3 && p[1] == "v1" && p[2] == "order-incidents" && r.Method == http.MethodPost:
		port.OrderIncident.Create(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "order-incident" && r.Method == http.MethodGet:
		port.OrderIncident.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "order-incident" && r.Method == http.MethodPut:
		port.OrderIncident.UpdateByID(w, r, p[3])
		// case n == 4 && p[1] == "v1" && p[2] == "customer" && r.Method == http.MethodDelete:
		// port.OrderIncident.DeleteByID(w, r, p[3])
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationCreateComment(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "archive" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationArchive(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "downgrade" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationDowngrade(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "upgrade" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationUpgrade(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operation" && p[4] == "avatar" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationAvatar(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "change-password" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationChangePassword(w, r)
		// case n == 5 && p[1] == "v1" && p[2] == "customers" && p[3] == "operations" && p[4] == "change-2fa" && r.Method == http.MethodPost:
		// port.OrderIncident.OperationChangeTwoFactorAuthentication(w, r)
		// case n == 4 && p[1] == "v1" && p[2] == "customers" && p[3] == "select-options" && r.Method == http.MethodGet:
		// port.OrderIncident.ListAsSelectOptions(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "order-incidents" && p[3] == "operation" && p[4] == "create-comment" && r.Method == http.MethodPost:
		port.OrderIncident.OperationCreateComment(w, r)
	case n == 5 && p[1] == "v1" && p[2] == "order-incidents" && p[3] == "operation" && p[4] == "create-attachment" && r.Method == http.MethodPost:
		port.OrderIncident.OperationCreateAttachment(w, r)

	// --- NATIONAL OCCUPATIONAL CLASSIFICATION --- //
	case n == 3 && p[1] == "v1" && p[2] == "national-occupational-classifications" && r.Method == http.MethodGet:
		port.NationalOccupationalClassification.List(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "national-occupational-classification" && r.Method == http.MethodGet:
		port.NationalOccupationalClassification.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "national-occupational-classifications" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.NationalOccupationalClassification.ListAsSelectOptions(w, r)

	// --- NORTH AMERICA INDUSTRY CLASSIFICATION SYSTEM --- //
	case n == 3 && p[1] == "v1" && p[2] == "north-america-industry-classification-systems" && r.Method == http.MethodGet:
		port.NorthAmericanIndustryClassificationSystem.List(w, r)
	case n == 4 && p[1] == "v1" && p[2] == "north-america-industry-classification-system" && r.Method == http.MethodGet:
		port.NorthAmericanIndustryClassificationSystem.GetByID(w, r, p[3])
	case n == 4 && p[1] == "v1" && p[2] == "north-america-industry-classification-systems" && p[3] == "select-options" && r.Method == http.MethodGet:
		port.NorthAmericanIndustryClassificationSystem.ListAsSelectOptions(w, r)

	// --- CATCH ALL: D.N.E. ---
	default:
		http.NotFound(w, r)
	}
}

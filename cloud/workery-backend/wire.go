//go:build wireinject
// +build wireinject

package main

import (
	"github.com/google/wire"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/cache/mongodbcache"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/emailer/mailgun"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/pdfbuilder"
	s3_storage "github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	activitysheet_c "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/controller"
	activitysheet_s "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	activitysheet_http "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/httptransport"
	associate_c "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	associate_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	associate_http "github.com/over55/monorepo/cloud/workery-backend/app/associate/httptransport"
	away_c "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/controller"
	away_s "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	away_http "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/httptransport"
	attachment_c "github.com/over55/monorepo/cloud/workery-backend/app/attachment/controller"
	attachment_s "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	attachment_http "github.com/over55/monorepo/cloud/workery-backend/app/attachment/httptransport"
	b_c "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/controller"
	b_s "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	b_http "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/httptransport"
	comm_c "github.com/over55/monorepo/cloud/workery-backend/app/comment/controller"
	comm_s "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	comment_http "github.com/over55/monorepo/cloud/workery-backend/app/comment/httptransport"
	customer_c "github.com/over55/monorepo/cloud/workery-backend/app/customer/controller"
	customer_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	customer_http "github.com/over55/monorepo/cloud/workery-backend/app/customer/httptransport"
	dash_c "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/controller"
	dash_http "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/httptransport"
	gateway_c "github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
	gateway_http "github.com/over55/monorepo/cloud/workery-backend/app/gateway/httptransport"
	howhear_c "github.com/over55/monorepo/cloud/workery-backend/app/howhear/controller"
	howhear_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	howhear_http "github.com/over55/monorepo/cloud/workery-backend/app/howhear/httptransport"
	insurance_c "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/controller"
	insurance_s "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	insurance_http "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/httptransport"
	order_c "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	order_s "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	order_http "github.com/over55/monorepo/cloud/workery-backend/app/order/httptransport"
	orderincident_c "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
	orderincident_d "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	orderincident_http "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/httptransport"
	report_c "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	report_http "github.com/over55/monorepo/cloud/workery-backend/app/report/httptransport"
	servicefee_c "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/controller"
	servicefee_s "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	servicefee_http "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/httptransport"
	skillset_c "github.com/over55/monorepo/cloud/workery-backend/app/skillset/controller"
	skillset_s "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	skillset_http "github.com/over55/monorepo/cloud/workery-backend/app/skillset/httptransport"
	staff_c "github.com/over55/monorepo/cloud/workery-backend/app/staff/controller"
	staff_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	staff_http "github.com/over55/monorepo/cloud/workery-backend/app/staff/httptransport"
	tag_c "github.com/over55/monorepo/cloud/workery-backend/app/tag/controller"
	tag_s "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	tag_http "github.com/over55/monorepo/cloud/workery-backend/app/tag/httptransport"
	taskitem_c "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/controller"
	taskitem_s "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	taskitem_http "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/httptransport"
	tenant_c "github.com/over55/monorepo/cloud/workery-backend/app/tenant/controller"
	tenant_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	tenant_http "github.com/over55/monorepo/cloud/workery-backend/app/tenant/httptransport"
	user_c "github.com/over55/monorepo/cloud/workery-backend/app/user/controller"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	user_http "github.com/over55/monorepo/cloud/workery-backend/app/user/httptransport"
	vehicle_c "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/controller"
	vehicle_s "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	vehicle_http "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/httptransport"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/inputport/http"
	"github.com/over55/monorepo/cloud/workery-backend/inputport/http/middleware"
	tq "github.com/over55/monorepo/cloud/workery-backend/inputport/taskqueue"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jobseekerid"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jwt"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/logger"
	"github.com/over55/monorepo/cloud/workery-backend/provider/mongodb"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/taskqueue"
	"github.com/over55/monorepo/cloud/workery-backend/provider/time"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
	"github.com/over55/monorepo/cloud/workery-backend/provider/blacklist"
)

func InitializeEvent() Application {
	// Our application is dependent on the following Golang packages. We need to
	// provide them to Google wire so it can sort out the dependency injection
	// at compile time.
	wire.Build(
		config.New,
		uuid.NewProvider,
		time.NewProvider,
		logger.NewProvider,
		jobseekerid.NewProvider,
		jwt.NewProvider,
		mailgun.NewEmailer,
		templatedemailer.NewTemplatedEmailer,
		password.NewProvider,
		kmutex.NewProvider,
		mongodb.NewProvider,
		taskqueue.NewProvider,
		blacklist.NewProvider,
		mongodbcache.NewCache,
		s3_storage.NewStorage,
		pdfbuilder.NewAssociateInvoiceBuilder,
		user_s.NewDatastore,
		user_c.NewController,
		tag_s.NewDatastore,
		tag_c.NewController,
		skillset_s.NewDatastore,
		skillset_c.NewController,
		vehicle_s.NewDatastore,
		vehicle_c.NewController,
		insurance_s.NewDatastore,
		insurance_c.NewController,
		howhear_s.NewDatastore,
		howhear_c.NewController,
		servicefee_s.NewDatastore,
		servicefee_c.NewController,
		b_s.NewDatastore,
		b_c.NewController,
		comm_s.NewDatastore,
		comm_c.NewController,
		customer_s.NewDatastore,
		customer_c.NewController,
		associate_s.NewDatastore,
		associate_c.NewController,
		staff_s.NewDatastore,
		staff_c.NewController,
		tenant_s.NewDatastore,
		tenant_c.NewController,
		gateway_c.NewController,
		attachment_s.NewDatastore,
		attachment_c.NewController,
		away_s.NewDatastore,
		away_c.NewController,
		order_s.NewDatastore,
		order_c.NewController,
		activitysheet_s.NewDatastore,
		activitysheet_c.NewController,
		taskitem_s.NewDatastore,
		taskitem_c.NewController,
		dash_c.NewController,
		orderincident_d.NewDatastore,
		orderincident_c.NewController,
		report_c.NewController,
		gateway_http.NewHandler,
		user_http.NewHandler,
		tag_http.NewHandler,
		skillset_http.NewHandler,
		vehicle_http.NewHandler,
		report_http.NewHandler,
		insurance_http.NewHandler,
		howhear_http.NewHandler,
		servicefee_http.NewHandler,
		customer_http.NewHandler,
		tenant_http.NewHandler,
		attachment_http.NewHandler,
		associate_http.NewHandler,
		staff_http.NewHandler,
		order_http.NewHandler,
		activitysheet_http.NewHandler,
		taskitem_http.NewHandler,
		b_http.NewHandler,
		away_http.NewHandler,
		comment_http.NewHandler,
		dash_http.NewHandler,
		orderincident_http.NewHandler,
		middleware.NewMiddleware,
		http.NewInputPort,
		tq.NewInputPort,
		NewApplication)
	return Application{}
}

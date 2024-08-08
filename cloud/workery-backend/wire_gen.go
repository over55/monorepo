// Code generated by Wire. DO NOT EDIT.

//go:generate go run -mod=mod github.com/google/wire/cmd/wire
//go:build !wireinject
// +build !wireinject

package main

import (
	"github.com/over55/monorepo/cloud/workery-backend/adapter/cache/mongodbcache"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/emailer/mailgun"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/pdfbuilder"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	controller16 "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/controller"
	datastore15 "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/datastore"
	httptransport16 "github.com/over55/monorepo/cloud/workery-backend/app/activitysheet/httptransport"
	controller9 "github.com/over55/monorepo/cloud/workery-backend/app/associate/controller"
	datastore2 "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	httptransport9 "github.com/over55/monorepo/cloud/workery-backend/app/associate/httptransport"
	controller20 "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/controller"
	datastore17 "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/datastore"
	httptransport20 "github.com/over55/monorepo/cloud/workery-backend/app/associateawaylog/httptransport"
	controller14 "github.com/over55/monorepo/cloud/workery-backend/app/attachment/controller"
	datastore16 "github.com/over55/monorepo/cloud/workery-backend/app/attachment/datastore"
	httptransport14 "github.com/over55/monorepo/cloud/workery-backend/app/attachment/httptransport"
	controller19 "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/controller"
	datastore18 "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/datastore"
	httptransport19 "github.com/over55/monorepo/cloud/workery-backend/app/bulletin/httptransport"
	controller10 "github.com/over55/monorepo/cloud/workery-backend/app/comment/controller"
	datastore14 "github.com/over55/monorepo/cloud/workery-backend/app/comment/datastore"
	httptransport10 "github.com/over55/monorepo/cloud/workery-backend/app/comment/httptransport"
	controller13 "github.com/over55/monorepo/cloud/workery-backend/app/customer/controller"
	datastore3 "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	httptransport13 "github.com/over55/monorepo/cloud/workery-backend/app/customer/httptransport"
	controller18 "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/controller"
	httptransport18 "github.com/over55/monorepo/cloud/workery-backend/app/dashboard/httptransport"
	"github.com/over55/monorepo/cloud/workery-backend/app/gateway/controller"
	"github.com/over55/monorepo/cloud/workery-backend/app/gateway/httptransport"
	controller7 "github.com/over55/monorepo/cloud/workery-backend/app/howhear/controller"
	datastore6 "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	httptransport7 "github.com/over55/monorepo/cloud/workery-backend/app/howhear/httptransport"
	controller6 "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/controller"
	datastore12 "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/datastore"
	httptransport6 "github.com/over55/monorepo/cloud/workery-backend/app/insurancerequirement/httptransport"
	controller15 "github.com/over55/monorepo/cloud/workery-backend/app/order/controller"
	datastore8 "github.com/over55/monorepo/cloud/workery-backend/app/order/datastore"
	httptransport15 "github.com/over55/monorepo/cloud/workery-backend/app/order/httptransport"
	controller21 "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/controller"
	datastore19 "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/datastore"
	httptransport21 "github.com/over55/monorepo/cloud/workery-backend/app/orderincident/httptransport"
	controller22 "github.com/over55/monorepo/cloud/workery-backend/app/report/controller"
	httptransport22 "github.com/over55/monorepo/cloud/workery-backend/app/report/httptransport"
	controller8 "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/controller"
	datastore13 "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/datastore"
	httptransport8 "github.com/over55/monorepo/cloud/workery-backend/app/servicefee/httptransport"
	controller4 "github.com/over55/monorepo/cloud/workery-backend/app/skillset/controller"
	datastore10 "github.com/over55/monorepo/cloud/workery-backend/app/skillset/datastore"
	httptransport4 "github.com/over55/monorepo/cloud/workery-backend/app/skillset/httptransport"
	controller11 "github.com/over55/monorepo/cloud/workery-backend/app/staff/controller"
	datastore4 "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	httptransport11 "github.com/over55/monorepo/cloud/workery-backend/app/staff/httptransport"
	controller3 "github.com/over55/monorepo/cloud/workery-backend/app/tag/controller"
	datastore7 "github.com/over55/monorepo/cloud/workery-backend/app/tag/datastore"
	httptransport3 "github.com/over55/monorepo/cloud/workery-backend/app/tag/httptransport"
	controller17 "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/controller"
	datastore9 "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/datastore"
	httptransport17 "github.com/over55/monorepo/cloud/workery-backend/app/taskitem/httptransport"
	controller12 "github.com/over55/monorepo/cloud/workery-backend/app/tenant/controller"
	datastore5 "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	httptransport12 "github.com/over55/monorepo/cloud/workery-backend/app/tenant/httptransport"
	controller2 "github.com/over55/monorepo/cloud/workery-backend/app/user/controller"
	"github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	httptransport2 "github.com/over55/monorepo/cloud/workery-backend/app/user/httptransport"
	controller5 "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/controller"
	datastore11 "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/datastore"
	httptransport5 "github.com/over55/monorepo/cloud/workery-backend/app/vehicletype/httptransport"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/inputport/http"
	"github.com/over55/monorepo/cloud/workery-backend/inputport/http/middleware"
	taskqueue2 "github.com/over55/monorepo/cloud/workery-backend/inputport/taskqueue"
	"github.com/over55/monorepo/cloud/workery-backend/provider/blacklist"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jobseekerid"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jwt"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/logger"
	"github.com/over55/monorepo/cloud/workery-backend/provider/mongodb"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/taskqueue"
	"github.com/over55/monorepo/cloud/workery-backend/provider/time"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

import (
	_ "go.uber.org/automaxprocs"
	_ "time/tzdata"
)

// Injectors from wire.go:

func InitializeEvent() Application {
	slogLogger := logger.NewProvider()
	conf := config.New()
	provider := uuid.NewProvider()
	timeProvider := time.NewProvider()
	jwtProvider := jwt.NewProvider(conf)
	blacklistProvider := blacklist.NewProvider()
	passwordProvider := password.NewProvider()
	kmutexProvider := kmutex.NewProvider()
	client := mongodb.NewProvider(conf, slogLogger)
	cacher := mongodbcache.NewCache(conf, slogLogger, client)
	stepper := taskqueue.NewProvider(conf, slogLogger)
	emailer := mailgun.NewEmailer(conf, slogLogger, provider)
	templatedEmailer := templatedemailer.NewTemplatedEmailer(conf, slogLogger, provider, emailer)
	userStorer := datastore.NewDatastore(conf, slogLogger, client)
	associateStorer := datastore2.NewDatastore(conf, slogLogger, client)
	customerStorer := datastore3.NewDatastore(conf, slogLogger, client)
	staffStorer := datastore4.NewDatastore(conf, slogLogger, client)
	tenantStorer := datastore5.NewDatastore(conf, slogLogger, client)
	howHearAboutUsItemStorer := datastore6.NewDatastore(conf, slogLogger, client)
	gatewayController := controller.NewController(conf, slogLogger, provider, jwtProvider, passwordProvider, kmutexProvider, cacher, stepper, templatedEmailer, client, userStorer, associateStorer, customerStorer, staffStorer, tenantStorer, howHearAboutUsItemStorer)
	middlewareMiddleware := middleware.NewMiddleware(conf, slogLogger, provider, timeProvider, jwtProvider, blacklistProvider, gatewayController)
	handler := httptransport.NewHandler(slogLogger, gatewayController)
	userController := controller2.NewController(conf, slogLogger, provider, passwordProvider, kmutexProvider, client, tenantStorer, userStorer, templatedEmailer)
	httptransportHandler := httptransport2.NewHandler(slogLogger, userController)
	s3Storager := s3.NewStorage(conf, slogLogger, provider)
	tagStorer := datastore7.NewDatastore(conf, slogLogger, client)
	orderStorer := datastore8.NewDatastore(conf, slogLogger, client)
	taskItemStorer := datastore9.NewDatastore(conf, slogLogger, client)
	tagController := controller3.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, client, templatedEmailer, userStorer, tagStorer, customerStorer, associateStorer, orderStorer, taskItemStorer)
	handler2 := httptransport3.NewHandler(slogLogger, tagController)
	skillSetStorer := datastore10.NewDatastore(conf, slogLogger, client)
	skillSetController := controller4.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, templatedEmailer, kmutexProvider, client, userStorer, skillSetStorer, associateStorer, orderStorer, taskItemStorer)
	handler3 := httptransport4.NewHandler(slogLogger, skillSetController)
	vehicleTypeStorer := datastore11.NewDatastore(conf, slogLogger, client)
	vehicleTypeController := controller5.NewController(conf, slogLogger, provider, kmutexProvider, s3Storager, passwordProvider, client, templatedEmailer, userStorer, customerStorer, associateStorer, staffStorer, orderStorer, taskItemStorer, vehicleTypeStorer)
	handler4 := httptransport5.NewHandler(slogLogger, vehicleTypeController)
	insuranceRequirementStorer := datastore12.NewDatastore(conf, slogLogger, client)
	insuranceRequirementController := controller6.NewController(conf, slogLogger, provider, s3Storager, kmutexProvider, passwordProvider, templatedEmailer, client, userStorer, associateStorer, orderStorer, taskItemStorer, insuranceRequirementStorer)
	handler5 := httptransport6.NewHandler(slogLogger, insuranceRequirementController)
	howHearAboutUsItemController := controller7.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, userStorer, customerStorer, associateStorer, staffStorer, howHearAboutUsItemStorer)
	handler6 := httptransport7.NewHandler(slogLogger, howHearAboutUsItemController)
	serviceFeeStorer := datastore13.NewDatastore(conf, slogLogger, client)
	serviceFeeController := controller8.NewController(conf, slogLogger, provider, s3Storager, kmutexProvider, passwordProvider, templatedEmailer, client, userStorer, orderStorer, taskItemStorer, serviceFeeStorer)
	handler7 := httptransport8.NewHandler(slogLogger, serviceFeeController)
	jobseekeridProvider := jobseekerid.NewProvider()
	commentStorer := datastore14.NewDatastore(conf, slogLogger, client)
	activitySheetStorer := datastore15.NewDatastore(conf, slogLogger, client)
	attachmentStorer := datastore16.NewDatastore(conf, slogLogger, client)
	associateController := controller9.NewController(conf, slogLogger, provider, jobseekeridProvider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, tenantStorer, commentStorer, activitySheetStorer, taskItemStorer, howHearAboutUsItemStorer, skillSetStorer, vehicleTypeStorer, serviceFeeStorer, insuranceRequirementStorer, userStorer, tagStorer, orderStorer, attachmentStorer, associateStorer)
	handler8 := httptransport9.NewHandler(slogLogger, associateController)
	commentController := controller10.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, commentStorer, activitySheetStorer, taskItemStorer, howHearAboutUsItemStorer, skillSetStorer, vehicleTypeStorer, serviceFeeStorer, insuranceRequirementStorer, userStorer, tagStorer, orderStorer, attachmentStorer, associateStorer)
	handler9 := httptransport10.NewHandler(slogLogger, commentController)
	staffController := controller11.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, tenantStorer, commentStorer, activitySheetStorer, taskItemStorer, howHearAboutUsItemStorer, skillSetStorer, vehicleTypeStorer, serviceFeeStorer, insuranceRequirementStorer, userStorer, tagStorer, orderStorer, attachmentStorer, staffStorer)
	handler10 := httptransport11.NewHandler(slogLogger, staffController)
	tenantController := controller12.NewController(conf, slogLogger, provider, kmutexProvider, s3Storager, emailer, client, tenantStorer, userStorer)
	handler11 := httptransport12.NewHandler(slogLogger, tenantController)
	customerController := controller13.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, tenantStorer, commentStorer, howHearAboutUsItemStorer, tagStorer, userStorer, attachmentStorer, customerStorer, orderStorer, taskItemStorer)
	handler12 := httptransport13.NewHandler(slogLogger, customerController)
	attachmentController := controller14.NewController(conf, slogLogger, provider, kmutexProvider, s3Storager, emailer, client, attachmentStorer, userStorer, customerStorer, associateStorer, orderStorer, staffStorer)
	handler13 := httptransport14.NewHandler(slogLogger, attachmentController)
	associateInvoiceBuilder := pdfbuilder.NewAssociateInvoiceBuilder(conf, slogLogger)
	orderController := controller15.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, associateInvoiceBuilder, tenantStorer, commentStorer, howHearAboutUsItemStorer, skillSetStorer, tagStorer, taskItemStorer, userStorer, customerStorer, associateStorer, orderStorer, serviceFeeStorer, activitySheetStorer, attachmentStorer)
	handler14 := httptransport15.NewHandler(slogLogger, orderController)
	activitySheetController := controller16.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, commentStorer, howHearAboutUsItemStorer, tagStorer, userStorer, customerStorer, activitySheetStorer)
	handler15 := httptransport16.NewHandler(slogLogger, activitySheetController)
	taskItemController := controller17.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, commentStorer, howHearAboutUsItemStorer, tagStorer, userStorer, activitySheetStorer, customerStorer, taskItemStorer, associateStorer, orderStorer, serviceFeeStorer)
	handler16 := httptransport17.NewHandler(slogLogger, taskItemController)
	associateAwayLogStorer := datastore17.NewDatastore(conf, slogLogger, client)
	bulletinStorer := datastore18.NewDatastore(conf, slogLogger, client)
	dashboardController := controller18.NewController(conf, slogLogger, provider, jwtProvider, passwordProvider, cacher, templatedEmailer, userStorer, tenantStorer, customerStorer, associateStorer, associateAwayLogStorer, orderStorer, taskItemStorer, bulletinStorer, commentStorer)
	handler17 := httptransport18.NewHandler(slogLogger, dashboardController)
	bulletinController := controller19.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, templatedEmailer, kmutexProvider, client, commentStorer, activitySheetStorer, taskItemStorer, howHearAboutUsItemStorer, skillSetStorer, vehicleTypeStorer, serviceFeeStorer, insuranceRequirementStorer, userStorer, tagStorer, orderStorer, attachmentStorer, associateStorer, bulletinStorer)
	handler18 := httptransport19.NewHandler(slogLogger, bulletinController)
	associateAwayLogController := controller20.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, client, templatedEmailer, userStorer, associateAwayLogStorer, customerStorer, associateStorer, orderStorer, taskItemStorer)
	handler19 := httptransport20.NewHandler(slogLogger, associateAwayLogController)
	orderIncidentStorer := datastore19.NewDatastore(conf, slogLogger, client)
	orderIncidentController := controller21.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, client, templatedEmailer, userStorer, orderIncidentStorer, customerStorer, associateStorer, orderStorer, taskItemStorer, commentStorer, attachmentStorer)
	handler20 := httptransport21.NewHandler(slogLogger, orderIncidentController)
	reportController := controller22.NewController(conf, slogLogger, provider, s3Storager, passwordProvider, kmutexProvider, templatedEmailer, client, associateInvoiceBuilder, commentStorer, howHearAboutUsItemStorer, skillSetStorer, tagStorer, taskItemStorer, userStorer, customerStorer, associateStorer, orderStorer, serviceFeeStorer, activitySheetStorer, attachmentStorer, staffStorer)
	handler21 := httptransport22.NewHandler(slogLogger, reportController)
	inputPortServer := http.NewInputPort(conf, slogLogger, middlewareMiddleware, handler, httptransportHandler, handler2, handler3, handler4, handler5, handler6, handler7, handler8, handler9, handler10, handler11, handler12, handler13, handler14, handler15, handler16, handler17, handler18, handler19, handler20, handler21)
	taskqueueInputPortServer := taskqueue2.NewInputPort(conf, slogLogger, stepper)
	application := NewApplication(slogLogger, inputPortServer, taskqueueInputPortServer)
	return application
}

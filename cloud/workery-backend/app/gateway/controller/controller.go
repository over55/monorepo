package controller

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"time"

	"github.com/matroskin13/stepper"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/cache/mongodbcache"
	"github.com/over55/monorepo/cloud/workery-backend/adapter/templatedemailer"
	a_s "github.com/over55/monorepo/cloud/workery-backend/app/associate/datastore"
	c_s "github.com/over55/monorepo/cloud/workery-backend/app/customer/datastore"
	gateway_s "github.com/over55/monorepo/cloud/workery-backend/app/gateway/datastore"
	howhear_s "github.com/over55/monorepo/cloud/workery-backend/app/howhear/datastore"
	s_s "github.com/over55/monorepo/cloud/workery-backend/app/staff/datastore"
	tenant_s "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	u_d "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	user_s "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/jwt"
	"github.com/over55/monorepo/cloud/workery-backend/provider/kmutex"
	"github.com/over55/monorepo/cloud/workery-backend/provider/password"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

type GatewayController interface {
	Login(ctx context.Context, email, password string) (*gateway_s.LoginResponseIDO, error)
	GetUserBySessionID(ctx context.Context, sessionID string) (*user_s.User, error)
	RefreshToken(ctx context.Context, value string) (*user_s.User, string, time.Time, string, time.Time, error)
	Logout(ctx context.Context) error
	ForgotPassword(ctx context.Context, email string) error
	PasswordReset(ctx context.Context, req *PasswordResetRequestIDO) error
	ChangePassword(ctx context.Context, req *ChangePasswordRequestIDO) error
	Profile(ctx context.Context) (*ProfileResponse, error)
	ProfileUpdate(ctx context.Context, req *ProfileUpdateRequestIDO) error
	ProfileChangePassword(ctx context.Context, req *ProfileChangePasswordRequestIDO) error
	ExecutiveVisitsTenant(ctx context.Context, req *ExecutiveVisitsTenantRequest) error
	Dashboard(ctx context.Context) (*DashboardResponseIDO, error)
	GenerateOTP(ctx context.Context) (*OTPGenerateResponseIDO, error)
	GenerateOTPAndQRCodePNGImage(ctx context.Context) ([]byte, error)
	VerifyOTP(ctx context.Context, req *VerificationTokenRequestIDO) (*VerificationTokenResponseIDO, error)
	ValidateOTP(ctx context.Context, req *ValidateTokenRequestIDO) (*ValidateTokenResponseIDO, error)
	DisableOTP(ctx context.Context) (*u_d.User, error)
	RecoveryOTP(ctx context.Context, req *RecoveryRequestIDO) (*gateway_s.LoginResponseIDO, error)
}

type GatewayControllerImpl struct {
	Config           *config.Conf
	Logger           *slog.Logger
	UUID             uuid.Provider
	JWT              jwt.Provider
	Password         password.Provider
	Kmutex           kmutex.Provider
	DbClient         *mongo.Client
	Cache            mongodbcache.Cacher
	TaskQueue        stepper.Stepper
	TemplatedEmailer templatedemailer.TemplatedEmailer
	UserStorer       user_s.UserStorer
	AssociateStorer  a_s.AssociateStorer
	CustomerStorer   c_s.CustomerStorer
	StaffStorer      s_s.StaffStorer
	TenantStorer     tenant_s.TenantStorer
	HowHearStorer    howhear_s.HowHearAboutUsItemStorer
}

func NewController(
	appCfg *config.Conf,
	loggerp *slog.Logger,
	uuidp uuid.Provider,
	jwtp jwt.Provider,
	passwordp password.Provider,
	kmux kmutex.Provider,
	cache mongodbcache.Cacher,
	tq stepper.Stepper,
	te templatedemailer.TemplatedEmailer,
	client *mongo.Client,
	usr_storer user_s.UserStorer,
	a_storer a_s.AssociateStorer,
	c_storer c_s.CustomerStorer,
	s_storer s_s.StaffStorer,
	org_storer tenant_s.TenantStorer,
	howhear_s howhear_s.HowHearAboutUsItemStorer,
) GatewayController {
	// loggerp.Debug("gateway controller initialization started...") // For debugging purposes only.
	s := &GatewayControllerImpl{
		Config:           appCfg,
		Logger:           loggerp,
		UUID:             uuidp,
		JWT:              jwtp,
		Kmutex:           kmux,
		Password:         passwordp,
		DbClient:         client,
		Cache:            cache,
		TaskQueue:        tq,
		TemplatedEmailer: te,
		UserStorer:       usr_storer,
		AssociateStorer:  a_storer,
		CustomerStorer:   c_storer,
		StaffStorer:      s_storer,
		TenantStorer:     org_storer,
		HowHearStorer:    howhear_s,
	}
	// s.Logger.Debug("gateway controller initialized")
	return s
}

func (impl *GatewayControllerImpl) GetUserBySessionID(ctx context.Context, sessionID string) (*user_s.User, error) {
	userBytes, err := impl.Cache.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if userBytes == nil {
		impl.Logger.Warn("record not found")
		return nil, errors.New("record not found")
	}
	var user user_s.User
	err = json.Unmarshal(userBytes, &user)
	if err != nil {
		impl.Logger.Error("unmarshalling failed", slog.Any("err", err))
		return nil, err
	}
	return &user, nil
}

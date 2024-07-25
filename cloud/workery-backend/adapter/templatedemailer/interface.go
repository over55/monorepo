package templatedemailer

import (
	"log/slog"

	mg "github.com/over55/monorepo/cloud/workery-backend/adapter/emailer/mailgun"

	c "github.com/over55/monorepo/cloud/workery-backend/config"
	"github.com/over55/monorepo/cloud/workery-backend/provider/uuid"
)

// TemplatedEmailer Is adapter for responsive HTML email templates sender.
type TemplatedEmailer interface {
	SendNewUserTemporaryPasswordEmail(email, firstName, temporaryPassword string) error
	SendVerificationEmail(email, verificationCode, firstName string) error
	SendForgotPasswordEmail(email, verificationCode, firstName string) error
	GetBackendDomainName() string
	GetFrontendDomainName() string
}

type templatedEmailer struct {
	UUID    uuid.Provider
	Logger  *slog.Logger
	Emailer mg.Emailer
}

func NewTemplatedEmailer(cfg *c.Conf, logger *slog.Logger, uuidp uuid.Provider, emailer mg.Emailer) TemplatedEmailer {
	// Defensive code: Make sure we have access to the file before proceeding any further with the code.
	logger.Debug("templated emailer initializing...")
	logger.Debug("templated emailer initialized")

	return &templatedEmailer{
		UUID:    uuidp,
		Logger:  logger,
		Emailer: emailer,
	}
}

func (impl *templatedEmailer) GetBackendDomainName() string {
	return impl.Emailer.GetBackendDomainName()
}

func (impl *templatedEmailer) GetFrontendDomainName() string {
	return impl.Emailer.GetFrontendDomainName()
}

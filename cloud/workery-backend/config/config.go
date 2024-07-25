package config

import (
	"log"
	"os"
	"strconv"
)

type Conf struct {
	AppServer  serverConf
	DB         dbConfig
	AWS        awsConfig
	Emailer    mailgunConfig
	PDFBuilder pdfBuilderConfig
}

type serverConf struct {
	Port                    string
	IP                      string
	HMACSecret              []byte
	HasDebugging            bool
	BackendDomainName       string
	FrontendDomainName      string
	Enable2FAOnRegistration bool
}

type dbConfig struct {
	URI  string
	Name string
}

type awsConfig struct {
	AccessKey      string
	SecretKey      string
	Endpoint       string
	Region         string
	BucketName     string
	ForcePathStyle bool
}

type mailgunConfig struct {
	APIKey      string
	Domain      string
	APIBase     string
	SenderEmail string
}

type pdfBuilderConfig struct {
	AssociateInvoiceTemplatePath string
	DataDirectoryPath            string
}

func New() *Conf {
	var c Conf
	c.AppServer.Port = getEnv("WORKERY_BACKEND_PORT", true)
	c.AppServer.IP = getEnv("WORKERY_BACKEND_IP", false)
	c.AppServer.HMACSecret = []byte(getEnv("WORKERY_BACKEND_HMAC_SECRET", true))
	c.AppServer.HasDebugging = getEnvBool("WORKERY_BACKEND_HAS_DEBUGGING", true, true)
	c.AppServer.BackendDomainName = getEnv("WORKERY_BACKEND_API_DOMAIN_NAME", true)
	c.AppServer.FrontendDomainName = getEnv("WORKERY_BACKEND_APP_DOMAIN_NAME", true)
	c.AppServer.Enable2FAOnRegistration = getEnvBool("WORKERY_BACKEND_APP_ENABLE_2FA_ON_REGISTRATION", false, false)

	c.DB.URI = getEnv("WORKERY_BACKEND_DB_URI", true)
	c.DB.Name = getEnv("WORKERY_BACKEND_DB_NAME", true)

	c.AWS.AccessKey = getEnv("WORKERY_BACKEND_AWS_ACCESS_KEY", true)
	c.AWS.SecretKey = getEnv("WORKERY_BACKEND_AWS_SECRET_KEY", true)
	c.AWS.Endpoint = getEnv("WORKERY_BACKEND_AWS_ENDPOINT", true)
	c.AWS.Region = getEnv("WORKERY_BACKEND_AWS_REGION", true)
	c.AWS.BucketName = getEnv("WORKERY_BACKEND_AWS_BUCKET_NAME", true)
	c.AWS.ForcePathStyle = getEnvBool("WORKERY_BACKEND_AWS_S3_FORCE_PATH_STYLE", false, false)

	c.Emailer.APIKey = getEnv("WORKERY_BACKEND_MAILGUN_API_KEY", true)
	c.Emailer.Domain = getEnv("WORKERY_BACKEND_MAILGUN_DOMAIN", true)
	c.Emailer.APIBase = getEnv("WORKERY_BACKEND_MAILGUN_API_BASE", true)
	c.Emailer.SenderEmail = getEnv("WORKERY_BACKEND_MAILGUN_SENDER_EMAIL", true)

	c.PDFBuilder.DataDirectoryPath = getEnv("WORKERY_BACKEND_PDF_BUILDER_DATA_DIRECTORY_PATH", true)
	c.PDFBuilder.AssociateInvoiceTemplatePath = getEnv("WORKERY_BACKEND_PDF_BUILDER_ASSOCIATE_INVOICE_PATH", true)

	return &c
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return value
}

func getEnvBool(key string, required bool, defaultValue bool) bool {
	valueStr := getEnv(key, required)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.ParseBool(valueStr)
	if err != nil {
		log.Fatalf("Invalid boolean value for environment variable %s", key)
	}
	return value
}

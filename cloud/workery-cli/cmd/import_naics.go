package cmd

import (
	"context"
	"log"
	"log/slog"

	"github.com/over55/monorepo/cloud/statcan"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	naics_ds "github.com/over55/monorepo/cloud/workery-cli/app/naics/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
)

func init() {
	rootCmd.AddCommand(importNAICSCmd)
}

var importNAICSCmd = &cobra.Command{
	Use:   "import_naics",
	Short: "Execute importing of NAICS into workery",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		naicsStorer := naics_ds.NewDatastore(cfg, defaultLogger, mc)
		tenant, err := tenantStorer.GetBySchemaName(context.Background(), cfg.PostgresDB.DatabaseLondonSchemaName)
		if err != nil {
			log.Fatal(err)
		}
		RunImportNAICS(cfg, defaultLogger, mc, tenantStorer, tenant, naicsStorer)
	},
}

func RunImportNAICS(
	cfg *config.Conf,
	loggerp *slog.Logger,
	mc *mongo.Client,
	tenantStorer tenant_ds.TenantStorer,
	tenant *tenant_ds.Tenant,
	naicsStorer naics_ds.NorthAmericanIndustryClassificationSystemStorer,
) {
	session, err := mc.StartSession()
	if err != nil {
		log.Fatal(err)
	}
	defer session.EndSession(context.Background())

	log.Println("starting up importer...")
	defer log.Println("closing importer")

	imp, err := statcan.NewNAICSImporterAtDataDir("./data")
	if err != nil {
		log.Fatalf("got error starting importer: %v", err)
	}
	if imp == nil {
		log.Fatal("no importer detected")
	}

	naicss, err := imp.ImportByVersion(context.Background(), statcan.VersionNAICSCanada2021V1Dot0)
	if err != nil {
		log.Fatalf("failed importing by version with error: %v", err)
	}
	if naicss == nil {
		log.Fatal("no naicss detected")
	}

	for _, naics := range naicss {

		// Define a transaction function with a series of operations
		transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {

			if err := runImportNAICS(sessCtx, tenantStorer, tenant, naicsStorer, naics); err != nil {
				loggerp.Error("failed importing naics", slog.Any("error", err))
				return nil, err
			}
			return nil, nil
		}

		// Start a transaction
		if _, err := session.WithTransaction(context.Background(), transactionFunc); err != nil {
			log.Fatal(err)
		}
	}
}

func runImportNAICS(
	sessCtx mongo.SessionContext,
	tenantStorer tenant_ds.TenantStorer,
	tenant *tenant_ds.Tenant,
	naicsStorer naics_ds.NorthAmericanIndustryClassificationSystemStorer,
	naics *statcan.NorthAmericanIndustryClassificationSystem,
) error {
	n, err := naicsStorer.GetByCode(sessCtx, naics.Code)
	if err != nil {
		return err
	}
	if n == nil {
		n = &naics_ds.NorthAmericanIndustryClassificationSystem{
			ID:                          primitive.NewObjectID(),
			TenantID:                    tenant.ID,
			Status:                      naics_ds.StatusActive,
			LanguageCode:                naics.LanguageCode,
			Version:                     naics.Version,
			Level:                       naics.Level,
			Code:                        naics.Code,
			CodeStr:                     naics.CodeStr,
			SectorCode:                  naics.SectorCode,
			SectorCodeStr:               naics.SectorCodeStr,
			SectorTitle:                 naics.SectorTitle,
			SectorDescription:           naics.SectorDescription,
			SubsectorCode:               naics.SubsectorCode,
			SubsectorCodeStr:            naics.SubsectorCodeStr,
			SubsectorTitle:              naics.SubsectorTitle,
			SubsectorDescription:        naics.SubsectorDescription,
			IndustryGroupCode:           naics.IndustryGroupCode,
			IndustryGroupCodeStr:        naics.IndustryGroupCodeStr,
			IndustryGroupTitle:          naics.IndustryGroupTitle,
			IndustryGroupDescription:    naics.IndustryGroupDescription,
			IndustryCode:                naics.IndustryCode,
			IndustryCodeStr:             naics.IndustryCodeStr,
			IndustryTitle:               naics.IndustryTitle,
			IndustryDescription:         naics.IndustryDescription,
			CanadianIndustryCode:        naics.CanadianIndustryCode,
			CanadianIndustryCodeStr:     naics.CanadianIndustryCodeStr,
			CanadianIndustryTitle:       naics.CanadianIndustryTitle,
			CanadianIndustryDescription: naics.CanadianIndustryDescription,
			Superscript:                 naics.Superscript,
			Elements: []*naics_ds.NorthAmericanIndustryClassificationSystemElement{
				{
					Type:        naics.ElementType,
					Description: naics.ElementDescription,
				},
			},
		}
		if err := naicsStorer.Create(sessCtx, n); err != nil {
			log.Println("failed creating naics:", naics.CodeStr)
			return err
		}
		log.Println("created naics:", naics.CodeStr)
		return nil
	}

	var exists bool = false
	for _, elem := range n.Elements {
		if elem.Type == naics.ElementType && elem.Description == naics.ElementDescription {
			exists = true
		}
	}
	if !exists {
		e := &naics_ds.NorthAmericanIndustryClassificationSystemElement{
			Type:        naics.ElementType,
			Description: naics.ElementDescription,
		}
		n.Elements = append(n.Elements, e)
		if err := naicsStorer.UpdateByID(sessCtx, n); err != nil {
			log.Println("failed updating naics:", naics.CodeStr)
			return err
		}
		log.Println("updating naics:", naics.CodeStr)
		return nil
	}

	log.Println("skipped naics:", naics.CodeStr)

	return nil
}

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
	noc_ds "github.com/over55/monorepo/cloud/workery-cli/app/noc/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
)

func init() {
	rootCmd.AddCommand(importNOCCmd)
}

var importNOCCmd = &cobra.Command{
	Use:   "import_noc",
	Short: "Execute importing of NOC into workery",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		nocStorer := noc_ds.NewDatastore(cfg, defaultLogger, mc)
		tenant, err := tenantStorer.GetBySchemaName(context.Background(), cfg.PostgresDB.DatabaseLondonSchemaName)
		if err != nil {
			log.Fatal(err)
		}
		RunImportNOC(cfg, defaultLogger, mc, tenantStorer, tenant, nocStorer)
	},
}

func RunImportNOC(
	cfg *config.Conf,
	loggerp *slog.Logger,
	mc *mongo.Client,
	tenantStorer tenant_ds.TenantStorer,
	tenant *tenant_ds.Tenant,
	nocStorer noc_ds.NationalOccupationalClassificationStorer,
) {
	session, err := mc.StartSession()
	if err != nil {
		log.Fatal(err)
	}
	defer session.EndSession(context.Background())

	log.Println("starting up importer...")
	defer log.Println("closing importer")

	imp, err := statcan.NewNOCImporterAtDataDir("./data")
	if err != nil {
		log.Fatalf("got error starting importer: %v", err)
	}
	if imp == nil {
		log.Fatal("no importer detected")
	}

	nocs, err := imp.ImportByVersion(context.Background(), statcan.VersionNOC2021V1Dot0)
	if err != nil {
		log.Fatalf("failed importing by version with error: %v", err)
	}
	if nocs == nil {
		log.Fatal("no nocs detected")
	}

	for _, noc := range nocs {
		// Define a transaction function with a series of operations
		transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
			if err := runImportNOC(sessCtx, tenantStorer, tenant, nocStorer, noc); err != nil {
				loggerp.Error("failed importing noc", slog.Any("error", err))
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

func runImportNOC(
	sessCtx mongo.SessionContext,
	tenantStorer tenant_ds.TenantStorer,
	tenant *tenant_ds.Tenant,
	nocStorer noc_ds.NationalOccupationalClassificationStorer,
	noc *statcan.NationalOccupationalClassification,
) error {
	n, err := nocStorer.GetByCode(sessCtx, noc.Code)
	if err != nil {
		return err
	}
	if n == nil {
		latest, err := nocStorer.GetLatestByTenantID(sessCtx, tenant.ID)
		if err != nil {
			return err
		}

		var publicID uint64
		if latest == nil {
			publicID = 1
		} else {
			publicID = latest.PublicID + 1
		}

		n = &noc_ds.NationalOccupationalClassification{
			ID:                       primitive.NewObjectID(),
			TenantID:                 tenant.ID,
			Status:                   noc_ds.StatusActive,
			PublicID:                 publicID,
			LanguageCode:             noc.LanguageCode,
			Version:                  noc.Version,
			Level:                    noc.Level,
			Code:                     noc.Code,
			CodeStr:                  noc.CodeStr,
			BroadCategoryCode:        noc.BroadCategoryCode,
			BroadCategoryCodeStr:     noc.BroadCategoryCodeStr,
			BroadCategoryTitle:       noc.BroadCategoryTitle,
			BroadCategoryDescription: noc.BroadCategoryDescription,
			MajorGroupCode:           noc.MajorGroupCode,
			MajorGroupCodeStr:        noc.MajorGroupCodeStr,
			MajorGroupTitle:          noc.MajorGroupTitle,
			MajorGroupDescription:    noc.MajorGroupDescription,
			SubMinorGroupCode:        noc.SubMinorGroupCode,
			SubMinorGroupCodeStr:     noc.SubMinorGroupCodeStr,
			SubMinorGroupTitle:       noc.SubMinorGroupTitle,
			SubMinorGroupDescription: noc.SubMinorGroupDescription,
			MinorGroupCode:           noc.MinorGroupCode,
			MinorGroupCodeStr:        noc.MinorGroupCodeStr,
			MinorGroupTitle:          noc.MinorGroupTitle,
			MinorGroupDescription:    noc.MinorGroupDescription,
			UnitGroupCode:            noc.UnitGroupCode,
			UnitGroupCodeStr:         noc.UnitGroupCodeStr,
			UnitGroupTitle:           noc.UnitGroupTitle,
			UnitGroupDescription:     noc.UnitGroupDescription,
			Elements: []*noc_ds.NationalOccupationalClassificationElement{
				{
					Type:        noc.ElementType,
					Description: noc.ElementDescription,
				},
			},
		}
		if err := nocStorer.Create(sessCtx, n); err != nil {
			log.Println("failed creating noc:", noc.CodeStr)
			return err
		}
		log.Println("created noc:", noc.CodeStr)
		return nil
	}

	var exists bool = false
	for _, elem := range n.Elements {
		if elem.Type == noc.ElementType && elem.Description == noc.ElementDescription {
			exists = true
		}
	}
	if !exists {
		e := &noc_ds.NationalOccupationalClassificationElement{
			Type:        noc.ElementType,
			Description: noc.ElementDescription,
		}
		n.Elements = append(n.Elements, e)
		if err := nocStorer.UpdateByID(sessCtx, n); err != nil {
			log.Println("failed updating noc:", noc.CodeStr)
			return err
		}
		log.Println("updating noc:", noc.CodeStr)
		return nil
	}

	log.Println("skipped noc:", noc.CodeStr)

	return nil
}

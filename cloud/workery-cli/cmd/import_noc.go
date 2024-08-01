package cmd

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/over55/monorepo/cloud/statcan"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	tenant_ds "github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
)

func init() {
	rootCmd.AddCommand(importNOCCmd)
}

var importNOCCmd = &cobra.Command{
	Use:   "import_noc",
	Short: "Execute importNOC",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("importNOC")

		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		tenant, err := tenantStorer.GetBySchemaName(context.Background(), cfg.PostgresDB.DatabaseLondonSchemaName)
		if err != nil {
			log.Fatal(err)
		}

		RunImportNOC(cfg, mc, tenantStorer, tenant)
	},
}

func RunImportNOC(
	cfg *config.Conf,
	mc *mongo.Client,
	tenantStorer tenant_ds.TenantStorer,
	tenant *tenant_ds.Tenant,
) {
	session, err := mc.StartSession()
	if err != nil {
		log.Fatal(err)
	}
	defer session.EndSession(context.Background())

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		log.Println("starting up importer...")

		imp, err := statcan.NewNOCImporterAtDataDir("./data")
		if err != nil {
			log.Fatalf("got error starting importer: %v", err)
		}
		if imp == nil {
			log.Fatal("no importer detected")
		}

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(context.Background(), transactionFunc); err != nil {
		log.Fatal(err)
	}
}

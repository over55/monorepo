package cmd

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	a_ds "github.com/over55/monorepo/cloud/workery-cli/app/associate/datastore"
	c_ds "github.com/over55/monorepo/cloud/workery-cli/app/customer/datastore"
	o_ds "github.com/over55/monorepo/cloud/workery-cli/app/order/datastore"
	s_ds "github.com/over55/monorepo/cloud/workery-cli/app/staff/datastore"
	ti_ds "github.com/over55/monorepo/cloud/workery-cli/app/taskitem/datastore"
	tenant_ds "github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	user_ds "github.com/over55/monorepo/cloud/workery-cli/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"
)

func init() {
	rootCmd.AddCommand(hotfix06Cmd)
}

var hotfix06Cmd = &cobra.Command{
	Use:   "hotfix06",
	Short: "Execute hotfix06",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("hotfix06")

		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		userStorer := user_ds.NewDatastore(cfg, defaultLogger, mc)
		cStorer := c_ds.NewDatastore(cfg, defaultLogger, mc)
		aStorer := a_ds.NewDatastore(cfg, defaultLogger, mc)
		sStorer := s_ds.NewDatastore(cfg, defaultLogger, mc)
		oStorer := o_ds.NewDatastore(cfg, defaultLogger, mc)
		tiStorer := ti_ds.NewDatastore(cfg, defaultLogger, mc)
		tenant, err := tenantStorer.GetBySchemaName(context.Background(), cfg.PostgresDB.DatabaseLondonSchemaName)
		if err != nil {
			log.Fatal(err)
		}

		runHotfix06(cfg, mc, tenantStorer, userStorer, cStorer, aStorer, sStorer, oStorer, tiStorer, tenant)

	},
}

func runHotfix06(
	cfg *config.Conf,
	mc *mongo.Client,
	tenantStorer tenant_ds.TenantStorer,
	userStorer user_ds.UserStorer,
	cStorer c_ds.CustomerStorer,
	aStorer a_ds.AssociateStorer,
	sStorer s_ds.StaffStorer,
	oStorer o_ds.OrderStorer,
	tiStorer ti_ds.TaskItemStorer,
	tenant *tenant_ds.Tenant,
) {
	session, err := mc.StartSession()
	if err != nil {
		log.Fatal(err)
	}
	defer session.EndSession(context.Background())

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		log.Println("fetching all associates...")
		oo, err := oStorer.ListAll(context.Background())
		if err != nil {
			log.Println("error:", err)
			return nil, err
		}
		log.Printf("iterating through %v orders...\n", len(oo.Results))
		for _, o := range oo.Results {
			o.TenantIDWithWJID = fmt.Sprintf("%v_%v", o.TenantID.Hex(), o.WJID)
			if err := oStorer.UpdateByID(context.Background(), o); err != nil {
				return nil, err
			}

			log.Println("updated order `tenant_id_with_wjid` with value:", o.TenantIDWithWJID)
		}

		log.Println("fetching all tasks...")
		titi, err := tiStorer.ListAll(context.Background())
		if err != nil {
			log.Println("error:", err)
			return nil, err
		}
		log.Printf("iterating through %v tasks...\n", len(titi.Results))
		for _, ti := range titi.Results {
			ti.OrderTenantIDWithWJID = fmt.Sprintf("%v_%v", ti.TenantID.Hex(), ti.OrderWJID)
			if err := tiStorer.UpdateByID(context.Background(), ti); err != nil {
				return nil, err
			}

			log.Println("updated task `tenant_id_with_wjid` with value:", ti.OrderTenantIDWithWJID)
		}
		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(context.Background(), transactionFunc); err != nil {
		log.Fatal(err)
	}
}

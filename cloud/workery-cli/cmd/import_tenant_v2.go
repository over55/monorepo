package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	"github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
)

var (
	// Flags for import_tenant_v2 command
	publicID           int64
	alternateName      string
	description        string
	name               string
	url                string
	status             int
	timezone           string
	createdAtStr       string
	modifiedAtStr      string
	addressCountry     string
	addressRegion      string
	addressLocality    string
	postalCode         string
	streetAddress      string
	streetAddressExtra string
	schemaName         string
)

func init() {
	// Bind flags to variables for the import_tenant_v2 command.
	importTenantV2Cmd.Flags().Int64Var(&publicID, "public-id", 0, "Public ID of the tenant")
	importTenantV2Cmd.Flags().StringVarP(&alternateName, "alternate-name", "a", "", "Alternate name of the tenant")
	importTenantV2Cmd.Flags().StringVarP(&description, "description", "d", "", "Description of the tenant")
	importTenantV2Cmd.Flags().StringVarP(&name, "name", "n", "", "Name of the tenant")
	importTenantV2Cmd.Flags().StringVarP(&url, "url", "u", "", "URL of the tenant")
	importTenantV2Cmd.Flags().IntVar(&status, "status", 1, "Status of the tenant (e.g., 1 for active)")
	importTenantV2Cmd.Flags().StringVarP(&timezone, "timezone", "t", "America/Toronto", "Timezone of the tenant")
	importTenantV2Cmd.Flags().StringVar(&createdAtStr, "created-at", "", "Creation timestamp in RFC3339 format (e.g., 2023-01-01T15:04:05Z)")
	importTenantV2Cmd.Flags().StringVar(&modifiedAtStr, "modified-at", "", "Last modified timestamp in RFC3339 format (e.g., 2023-01-01T15:04:05Z)")
	importTenantV2Cmd.Flags().StringVar(&addressCountry, "address-country", "", "Country of the tenant's address")
	importTenantV2Cmd.Flags().StringVar(&addressRegion, "address-region", "", "Region/State of the tenant's address")
	importTenantV2Cmd.Flags().StringVar(&addressLocality, "address-locality", "", "City/Locality of the tenant's address")
	importTenantV2Cmd.Flags().StringVar(&postalCode, "postal-code", "", "Postal code of the tenant's address")
	importTenantV2Cmd.Flags().StringVar(&streetAddress, "street-address", "", "Street address of the tenant")
	importTenantV2Cmd.Flags().StringVar(&streetAddressExtra, "street-address-extra", "", "Extra street address information")
	importTenantV2Cmd.Flags().StringVarP(&schemaName, "schema-name", "s", "", "Database schema name for the tenant")

	// Mark required flags.
	importTenantV2Cmd.MarkFlagRequired("name")
	importTenantV2Cmd.MarkFlagRequired("schema-name")

	rootCmd.AddCommand(importTenantV2Cmd)
}

var importTenantV2Cmd = &cobra.Command{
	Use:     "import_tenant_v2",
	Short:   "Create a new tenant using command-line arguments",
	Long:    `This command creates a new tenant in the database with details provided via flags.`,
	Example: `  workery-cli import_tenant_v2 --name "Example Corp" --schema-name "example_corp_db" -d "A sample tenant" -u "https://example.com"`,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := datastore.NewDatastore(cfg, defaultLogger, mc)
		ctx := context.Background()

		// Handle timestamps. If not provided, they will default to the current time.
		now := time.Now()
		createdAt := now
		modifiedAt := now

		if createdAtStr != "" {
			parsedTime, err := time.Parse(time.RFC3339, createdAtStr)
			if err != nil {
				log.Fatalf("Invalid 'created-at' format. Please use RFC3339 (e.g., 2023-01-01T15:04:05Z): %v", err)
			}
			createdAt = parsedTime
		}

		if modifiedAtStr != "" {
			parsedTime, err := time.Parse(time.RFC3339, modifiedAtStr)
			if err != nil {
				log.Fatalf("Invalid 'modified-at' format. Please use RFC3339 (e.g., 2023-01-01T15:04:05Z): %v", err)
			}
			modifiedAt = parsedTime
		}

		// Create tenant struct from flags.
		tenant := &datastore.Tenant{
			ID:                 primitive.NewObjectID(),
			PublicID:           uint64(publicID),
			AlternateName:      alternateName,
			Description:        description,
			Name:               name,
			Url:                url,
			Status:             datastore.TenantActiveStatus,
			Timezone:           timezone,
			CreatedAt:          createdAt,
			ModifiedAt:         modifiedAt,
			AddressCountry:     addressCountry,
			AddressRegion:      addressRegion,
			AddressLocality:    addressLocality,
			PostalCode:         postalCode,
			StreetAddress:      streetAddress,
			StreetAddressExtra: streetAddressExtra,
			SchemaName:         schemaName,
		}

		log.Println("Beginning creating tenant...")
		if err := tenantStorer.Create(ctx, tenant); err != nil {
			log.Panic(err)
		}
		log.Println("Finished creating tenant.")
		fmt.Println("Imported tenant ID#", tenant.ID.Hex())
	},
}

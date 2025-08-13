package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/over55/monorepo/cloud/workery-backend/adapter/storage/mongodb"
	"github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
)

var (
	// Flags for create_tenant command
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
	// Bind flags to variables for the create_tenant command.
	createTenantCmd.Flags().Int64Var(&publicID, "public-id", 0, "Public ID of the tenant")
	createTenantCmd.Flags().StringVarP(&alternateName, "alternate-name", "a", "", "Alternate name of the tenant")
	createTenantCmd.Flags().StringVarP(&description, "description", "d", "", "Description of the tenant")
	createTenantCmd.Flags().StringVarP(&name, "name", "n", "", "Name of the tenant")
	createTenantCmd.Flags().StringVarP(&url, "url", "u", "", "URL of the tenant")
	createTenantCmd.Flags().IntVar(&status, "status", 1, "Status of the tenant (e.g., 1 for active)")
	createTenantCmd.Flags().StringVarP(&timezone, "timezone", "t", "America/Toronto", "Timezone of the tenant")
	createTenantCmd.Flags().StringVar(&createdAtStr, "created-at", "", "Creation timestamp in RFC3339 format (e.g., 2023-01-01T15:04:05Z)")
	createTenantCmd.Flags().StringVar(&modifiedAtStr, "modified-at", "", "Last modified timestamp in RFC3339 format (e.g., 2023-01-01T15:04:05Z)")
	createTenantCmd.Flags().StringVar(&addressCountry, "address-country", "", "Country of the tenant's address")
	createTenantCmd.Flags().StringVar(&addressRegion, "address-region", "", "Region/State of the tenant's address")
	createTenantCmd.Flags().StringVar(&addressLocality, "address-locality", "", "City/Locality of the tenant's address")
	createTenantCmd.Flags().StringVar(&postalCode, "postal-code", "", "Postal code of the tenant's address")
	createTenantCmd.Flags().StringVar(&streetAddress, "street-address", "", "Street address of the tenant")
	createTenantCmd.Flags().StringVar(&streetAddressExtra, "street-address-extra", "", "Extra street address information")
	createTenantCmd.Flags().StringVarP(&schemaName, "schema-name", "s", "", "Database schema name for the tenant")

	// Mark required flags.
	createTenantCmd.MarkFlagRequired("name")
	createTenantCmd.MarkFlagRequired("schema-name")

	rootCmd.AddCommand(createTenantCmd)
}

var createTenantCmd = &cobra.Command{
	Use:     "create_tenant",
	Short:   "Create a new tenant using command-line arguments",
	Long:    `This command creates a new tenant in the database with details provided via flags.`,
	Example: `  workery-cli create_tenant --name "Example Corp" --schema-name "example_corp_db" -d "A sample tenant" -u "https://example.com"`,
	Run: func(cmd *cobra.Command, args []string) {
		logger := slog.Default()
		cfg := config.New()
		mc := mongodb.NewStorage(cfg, logger)
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
		fmt.Println("Created tenant ID#", tenant.ID.Hex())
	},
}

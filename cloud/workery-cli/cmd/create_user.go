package cmd

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	tenant_ds "github.com/over55/monorepo/cloud/workery-cli/app/tenant/datastore"
	user_ds "github.com/over55/monorepo/cloud/workery-cli/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
)

// Define package-level variables to hold the values from command-line flags.
var (
	flagPublicID      uint64
	flagFirstName     string
	flagLastName      string
	flagEmail         string
	flagTenantID      uint64
	flagIsActive      bool
	flagEmailVerified bool
)

func init() {
	// Setup the flags for the 'create_user' command.
	createUserCmd.Flags().Uint64Var(&flagPublicID, "public-id", 0, "The user's public ID from the previous system.")
	createUserCmd.Flags().StringVar(&flagFirstName, "first-name", "", "The user's first name.")
	createUserCmd.Flags().StringVar(&flagLastName, "last-name", "", "The user's last name.")
	createUserCmd.Flags().StringVar(&flagEmail, "email", "", "The user's email address.")
	createUserCmd.Flags().Uint64Var(&flagTenantID, "tenant-id", 2, "The public ID of the tenant to associate the user with. Defaults to 2.")
	createUserCmd.Flags().BoolVar(&flagIsActive, "active", false, "Set to true if the user is active.")
	createUserCmd.Flags().BoolVar(&flagEmailVerified, "verified", false, "Set to true if the user's email was already verified.")

	// Mark the essential flags as required.
	createUserCmd.MarkFlagRequired("public-id")
	createUserCmd.MarkFlagRequired("email")

	rootCmd.AddCommand(createUserCmd)
}

// How to run:
// go run main.go create_user --public-id=123 --first-name="John" --last-name="Doe" --email="john.doe@example.com" --active=true --verified=true
var createUserCmd = &cobra.Command{
	Use:   "create_user",
	Short: "Create a new user",
	Long:  `Creates a new user in the application using the provided details as command-line arguments.`,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		userStorer := user_ds.NewDatastore(cfg, defaultLogger, mc)
		// Pass the flag values to the creation logic.
		RunCreateUser(cfg, tenantStorer, userStorer, flagPublicID, flagFirstName, flagLastName, flagEmail, flagTenantID, flagIsActive, flagEmailVerified)
	},
}

func RunCreateUser(cfg *config.Conf, tenantStorer tenant_ds.TenantStorer, userStorer user_ds.UserStorer, publicID uint64, firstName, lastName, email string, tenantID uint64, isActive, wasEmailVerified bool) {
	fmt.Println("Beginning create users")
	createUser(context.Background(), tenantStorer, userStorer, publicID, firstName, lastName, email, tenantID, isActive, wasEmailVerified)
	fmt.Println("Finished create users")
}

func createUser(ctx context.Context, ts tenant_ds.TenantStorer, us user_ds.UserStorer, publicID uint64, firstName, lastName, email string, tenantID uint64, isActive, wasEmailVerified bool) {
	var state int8 = UserInactiveState
	if isActive == true {
		state = UserActiveState
	}

	// BUGFIX note from original: Default tenant ID is 2 (london). This is now handled by the flag's default value.
	tenant, err := ts.GetByPublicID(ctx, tenantID)
	if err != nil {
		log.Fatal(err)
	}
	if tenant == nil {
		log.Fatalf("missing tenant with public ID: %d", tenantID)
	}
	if !strings.Contains(tenant.SchemaName, "london") {
		fmt.Printf("Skipped imported non-london tenant user public ID# %d\n", publicID)
		return
	}

	name := strings.Replace(firstName+" "+lastName, "   ", "", 0)
	name = strings.Replace(name, "  ", "", 0)
	lexicalName := lastName + ", " + firstName
	lexicalName = strings.Replace(lexicalName, ", ,", ",", 0)
	lexicalName = strings.Replace(lexicalName, "  ", " ", 0)
	lexicalName = strings.Replace(lexicalName, ", , ", ", ", 0)
	lexicalName = strings.Replace(lexicalName, "   ", "", 0)

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	email = strings.ToLower(email)
	email = strings.ReplaceAll(email, " ", "")

	now := time.Now()

	m := &user_ds.User{
		PublicID:              publicID,
		ID:                    primitive.NewObjectID(),
		FirstName:             firstName,
		LastName:              lastName,
		Name:                  name,
		LexicalName:           lexicalName,
		Email:                 email,
		JoinedTime:            now,
		Status:                state,
		Timezone:              "America/Toronto",
		CreatedAt:             now,
		ModifiedAt:            now,
		Salt:                  "",
		WasEmailVerified:      wasEmailVerified,
		PrAccessCode:          "",
		PrExpiryTime:          time.Now(),
		TenantID:              tenant.ID,
		PasswordHashAlgorithm: primitive.NewObjectID().Hex(),
		PasswordHash:          "MongoDB Primitive",
	}
	if err := us.Create(ctx, m); err != nil {
		log.Panic(err)
	}
	fmt.Printf("Imported user with public ID #%d as new user ID %s\n", m.PublicID, m.ID.Hex())
}

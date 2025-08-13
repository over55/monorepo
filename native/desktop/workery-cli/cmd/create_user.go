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

	"github.com/over55/monorepo/cloud/workery-backend/adapter/storage/mongodb"
	tenant_ds "github.com/over55/monorepo/cloud/workery-backend/app/tenant/datastore"
	user_ds "github.com/over55/monorepo/cloud/workery-backend/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-backend/config"
	pass_p "github.com/over55/monorepo/cloud/workery-backend/provider/password"
)

// Define package-level variables to hold the values from command-line flags.
var (
	flagPublicID      uint64
	flagFirstName     string
	flagLastName      string
	flagEmail         string
	flagIsActive      bool
	flagEmailVerified bool
	flagRoleID        uint64
	flagPassword      string
)

func init() {
	// Setup the flags for the 'create_user' command.
	createUserCmd.Flags().Uint64Var(&flagPublicID, "public-id", 0, "The user's public ID from the previous system.")
	createUserCmd.Flags().StringVar(&flagFirstName, "first-name", "", "The user's first name.")
	createUserCmd.Flags().StringVar(&flagLastName, "last-name", "", "The user's last name.")
	createUserCmd.Flags().StringVar(&flagEmail, "email", "", "The user's email address.")
	createUserCmd.Flags().BoolVar(&flagIsActive, "active", false, "Set to true if the user is active.")
	createUserCmd.Flags().BoolVar(&flagEmailVerified, "verified", false, "Set to true if the user's email was already verified.")
	createUserCmd.Flags().Uint64Var(&flagRoleID, "role-id", 0, "The role ID to assign to the user")
	createUserCmd.Flags().StringVarP(&flagPassword, "password", "p", "", "Password of the user account")

	// Mark the essential flags as required.
	createUserCmd.MarkFlagRequired("public-id")
	createUserCmd.MarkFlagRequired("email")
	createUserCmd.MarkFlagRequired("role-id")
	createUserCmd.MarkFlagRequired("password")

	rootCmd.AddCommand(createUserCmd)
}

// How to run:
// go run main.go create_user --public-id=123 --first-name="John" --last-name="Doe" --email="john.doe@example.com" --active=true --verified=true --role-id=1
var createUserCmd = &cobra.Command{
	Use:   "create_user",
	Short: "Create a new user",
	Long:  `Creates a new user in the application using the provided details as command-line arguments.`,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		defaultLogger := slog.Default()
		mc := mongodb.NewStorage(cfg, defaultLogger)
		tenantStorer := tenant_ds.NewDatastore(cfg, defaultLogger, mc)
		userStorer := user_ds.NewDatastore(cfg, defaultLogger, mc)
		passwordProvider := pass_p.NewProvider()

		// Pass the flag values to the creation logic.
		RunCreateUser(cfg, tenantStorer, userStorer, passwordProvider, flagPublicID, flagFirstName, flagLastName, flagEmail, flagIsActive, flagEmailVerified, flagRoleID, flagPassword)
	},
}

func RunCreateUser(cfg *config.Conf, tenantStorer tenant_ds.TenantStorer, userStorer user_ds.UserStorer, pass pass_p.Provider, publicID uint64, firstName, lastName, email string, isActive, wasEmailVerified bool, roleID uint64, password string) {
	fmt.Println("Beginning creating user")
	createUser(context.Background(), tenantStorer, userStorer, pass, publicID, firstName, lastName, email, isActive, wasEmailVerified, roleID, password)
	fmt.Println("Finished creating user")
}

func createUser(ctx context.Context, ts tenant_ds.TenantStorer, us user_ds.UserStorer, pass pass_p.Provider, publicID uint64, firstName, lastName, email string, isActive, wasEmailVerified bool, roleID uint64, password string) {
	var state int8 = user_ds.UserStatusArchived
	if isActive == true {
		state = user_ds.UserStatusActive
	}

	// BUGFIX note from original: Default tenant ID is 2 (london). This is now handled by the flag's default value.
	tenant, err := ts.GetByPublicID(ctx, publicID)
	if err != nil {
		log.Fatal(err)
	}
	if tenant == nil {
		log.Fatalf("missing tenant with tenant public ID: %d", publicID)
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

	userRole := int8(roleID)
	hasStaffRole := false
	switch userRole {
	case user_ds.UserRoleExecutive, user_ds.UserRoleManagement, user_ds.UserRoleFrontlineStaff:
		hasStaffRole = true
		break
	default:
		hasStaffRole = false
		break
	}

	passwordHash, err := pass.GenerateHashFromPassword(password)
	if err != nil {
		log.Fatal("HashPassword:", err)
	}

	m := &user_ds.User{
		PublicID:              publicID,
		ID:                    primitive.NewObjectID(),
		FirstName:             firstName,
		LastName:              lastName,
		Name:                  name,
		LexicalName:           lexicalName,
		OrganizationName:      tenant.Name,
		OrganizationType:      tenant_ds.RootType,
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
		TenantName:            tenant.Name,
		PasswordHashAlgorithm: pass.AlgorithmName(),
		PasswordHash:          passwordHash,
		Role:                  userRole,
		HasStaffRole:          hasStaffRole,
	}
	if err := us.Create(ctx, m); err != nil {
		log.Panic(err)
	}
	fmt.Print("\033[H\033[2J")
	fmt.Printf("Created user with tenant public ID #%d as new user ID %s\n", m.PublicID, m.ID.Hex())
}

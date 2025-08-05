package cmd

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/over55/monorepo/cloud/workery-cli/adapter/storage/mongodb"
	user_ds "github.com/over55/monorepo/cloud/workery-cli/app/user/datastore"
	"github.com/over55/monorepo/cloud/workery-cli/config"
	"github.com/over55/monorepo/cloud/workery-cli/provider/password"
	p "github.com/over55/monorepo/cloud/workery-cli/provider/password"
	"github.com/spf13/cobra"
)

// ex:
// $ go run main.go change_password_v2 --email="b@b.com" --password="123"

func init() {
	changePasswordV2Cmd.Flags().StringVarP(&changePassEmail, "email", "e", "", "Email of the user account")
	changePasswordV2Cmd.MarkFlagRequired("email")
	changePasswordV2Cmd.Flags().StringVarP(&changePassPassword, "password", "p", "", "Password of the user account")
	changePasswordV2Cmd.MarkFlagRequired("password")
	rootCmd.AddCommand(changePasswordV2Cmd)
}

var changePasswordV2Cmd = &cobra.Command{
	Use:   "change_password_v2",
	Short: "Change user password",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		cfg := config.New()
		pass := password.NewProvider()
		mc := mongodb.NewStorage(cfg)
		defaultLogger := slog.Default()
		userStorer := user_ds.NewDatastore(cfg, defaultLogger, mc)
		runChangePasswordV2(cfg, pass, userStorer)
	},
}

func runChangePasswordV2(cfg *config.Conf, pass p.Provider, us user_ds.UserStorer) {
	ctx := context.Background()

	user, err := us.GetByEmail(context.Background(), changePassEmail)
	if err != nil {
		log.Fatal(err)
	}
	if user == nil {
		log.Fatal("User D.N.E.")
	}

	passwordHash, err := pass.GenerateHashFromPassword(changePassPassword)
	if err != nil {
		log.Fatal("HashPassword:", err)
	}
	user.PasswordHash = passwordHash

	us.UpdateByID(ctx, user)

	fmt.Print("\033[H\033[2J")
	fmt.Println("Password successfully changed")
}

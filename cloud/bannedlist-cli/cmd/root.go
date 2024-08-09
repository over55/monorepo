package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var ()

// Initialize function will be called when every command gets called.
func init() {
}

var rootCmd = &cobra.Command{
	Use:   "bannedlist-cli",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Do nothing.
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

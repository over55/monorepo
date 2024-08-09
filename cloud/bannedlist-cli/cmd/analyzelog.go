package cmd

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"

	"github.com/spf13/cobra"

	"github.com/over55/monorepo/cloud/bannedlist-cli/constants"
	filereader "github.com/over55/monorepo/cloud/bannedlist-cli/pkg"
)

func init() {
	rootCmd.AddCommand(analyzeLogCmd)
}

var analyzeLogCmd = &cobra.Command{
	Use:   "analyzelog",
	Short: "Read the `workery-backend` console log content and extract new urls and ip addressses to ban",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Check if the file exists
		if _, err := os.Stat(constants.WorkeryBackendConsoleLogFilePath); os.IsNotExist(err) {
			log.Fatalf("file %s does not exist", constants.WorkeryBackendConsoleLogFilePath)
		}

		lines, err := filereader.ReadLines(constants.WorkeryBackendConsoleLogFilePath)
		if err != nil {
			log.Fatalf("failed reading file contents with error: %v", err)
		}

		for _, line := range lines {
			// DEVELOPERS NOTE:
			// According to the `ProtectedURLsMiddleware` middleware in
			// `workery-backend` app, if the console log prints `unauthorized
			// api call` then we need to analyze the console line.
			if strings.Contains(line, "unauthorized api call") {
				runAnalyzeLogLine(line)
			}
		}
	},
}

func runAnalyzeLogLine(line string) {
	// Regular expression to extract the URL and IP address
	re := regexp.MustCompile(`url=([^ ]+) ip_address=([^ ]+)`)

	// FindStringSubmatch returns the slice of matched strings
	matches := re.FindStringSubmatch(line)

	if len(matches) >= 3 {
		url := matches[1]
		ipAddress := matches[2]

		// fmt.Println("Analyizing Line:", line)
		fmt.Println("Extracted URL:", url)
		fmt.Println("Extracted IP Address:", ipAddress)

		//TODO: Add to either `ips.json` and / or `urls.json` files.
	}
}

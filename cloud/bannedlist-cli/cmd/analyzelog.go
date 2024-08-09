package cmd

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"

	"golang.org/x/sync/errgroup"

	"github.com/spf13/cobra"

	"github.com/over55/monorepo/cloud/bannedlist-cli/constants"
	"github.com/over55/monorepo/cloud/bannedlist-cli/pkg"
)

func init() {
	rootCmd.AddCommand(analyzeLogCmd)
}

var analyzeLogCmd = &cobra.Command{
	Use:   "analyzelog",
	Short: "Read the `workery-backend` console log content and extract new urls and ip addressses to ban",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		log.Println("Started analyzing")

		// Check if the log file exists.
		if _, err := os.Stat(constants.WorkeryBackendConsoleLogFilePath); os.IsNotExist(err) {
			log.Fatalf("file %s does not exist", constants.WorkeryBackendConsoleLogFilePath)
		}

		// Open the log file, read the contents and get an array of lines per string.
		lines, err := pkg.ReadTextContent(constants.WorkeryBackendConsoleLogFilePath)
		if err != nil {
			log.Fatalf("failed reading file contents with error: %v", err)
		}

		// Variables to track the collected IPs and URLs which we found from
		// our analysis.
		bannedIPs := make([]string, 0)
		bannedURLs := make([]string, 0)

		for _, line := range lines {
			// DEVELOPERS NOTE:
			// According to the `ProtectedURLsMiddleware` middleware in
			// `workery-backend` app, if the console log prints `unauthorized
			// api call` or `rejected request` then we need to analyze
			// the console line.
			if strings.Contains(line, "unauthorized api call") || strings.Contains(line, "rejected request") {

				// There are a few URLs we consider safe and hence will ignore.
				for _, safeURL := range constants.GetWorkeryBackendIgnoreURLS() {
					if !strings.Contains(line, safeURL) {
						runAnalyzeLogLine(line, &bannedIPs, &bannedURLs)
					}
				}
			}
		}

		// Initialize errgroup
		var g errgroup.Group

		// Run the following functions as go routines powered by `errgroup`.
		g.Go(func() error {
			return updateBannedIPsList(&bannedIPs)
		})
		g.Go(func() error {
			return updateBannedURLsList(&bannedURLs)
		})

		// Wait for all goroutines to finish (note: powered by `errgroup`).
		if err := g.Wait(); err != nil {
			log.Fatalf("ferror in concurrent execution with error: %v", err)
		}

		log.Println("Finished analyzing")
	},
}

func runAnalyzeLogLine(line string, bannedIPs *[]string, bannedURLs *[]string) {
	// Regular expression to extract the URL and IP address
	re := regexp.MustCompile(`url=([^ ]+) ip_address=([^ ]+)`)

	// FindStringSubmatch returns the slice of matched strings
	matches := re.FindStringSubmatch(line)

	if len(matches) >= 3 {
		url := matches[1]
		ipAddress := matches[2]

		*bannedIPs = append(*bannedIPs, ipAddress)
		*bannedURLs = append(*bannedURLs, url)
	}
}

func updateBannedIPsList(newBannedIPs *[]string) error {
	// Open the current banned IPs file, read the contents.
	bannedIPs, err := pkg.ReadJSONContent(constants.BannedIPsFilePath)
	if err != nil {
		return fmt.Errorf("failed reading file contents with error: %v", err)
	}

	for _, newBannedIP := range *newBannedIPs {
		bannedIPs = append(bannedIPs, newBannedIP)
	}

	// Remove any duplicates.
	bannedIPs = pkg.UniqueStrings(bannedIPs)

	// Sort results.
	bannedIPs = pkg.SortStringsAscending(bannedIPs)

	// Save our banned file.
	if err := pkg.WriteJSONContent(constants.BannedIPsFilePath, bannedIPs); err != nil {
		return fmt.Errorf("failed writing json file contents with error: %v", err)
	}
	return nil
}

func updateBannedURLsList(newBannedURLs *[]string) error {
	// Open the current banned URLs file, read the contents.
	bannedURLs, err := pkg.ReadJSONContent(constants.BannedURLsFilePath)
	if err != nil {
		return fmt.Errorf("failed reading file contents with error: %v", err)
	}

	for _, newBannedURL := range *newBannedURLs {
		bannedURLs = append(bannedURLs, newBannedURL)
	}

	// Remove any duplicates.
	bannedURLs = pkg.UniqueStrings(bannedURLs)

	// Sort results.
	bannedURLs = pkg.SortStringsAscending(bannedURLs)

	// Save our banned file.
	if err := pkg.WriteJSONContent(constants.BannedURLsFilePath, bannedURLs); err != nil {
		return fmt.Errorf("failed writing json file contents with error: %v", err)
	}
	return nil
}

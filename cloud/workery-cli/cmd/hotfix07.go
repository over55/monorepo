package cmd

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	s3storage "github.com/over55/monorepo/cloud/workery-cli/adapter/storage/s3"
	"github.com/over55/monorepo/cloud/workery-cli/config"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(hotfix07Cmd)
}

var hotfix07Cmd = &cobra.Command{
	Use:   "hotfix07",
	Short: "Execute hotfix07",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("hotfix07")

		cfg := config.New()
		defaultLogger := slog.Default()
		newS3 := s3storage.NewStorage(cfg, defaultLogger)
		// oldS3 := s3storage.NewStorageWithCustom(defaultLogger, cfg.OldAWS.Endpoint, cfg.OldAWS.Region, cfg.OldAWS.AccessKey, cfg.OldAWS.SecretKey, cfg.OldAWS.BucketName, false)
		runHotfix07(cfg, newS3)

	},
}

func runHotfix07(
	cfg *config.Conf,
	s3 s3storage.S3Storager,
) {
	fmt.Println("beggining to download complete s3 bucket locally...")
	// Call function to download all files
	if err := s3.DownloadFilesIfNotExist(context.TODO(), "./data/digitalocean-s3-workery"); err != nil {
		log.Fatalf("Error downloading new s3 files: %v\n", err)
	}

	// keys, err := s3.ListAllObjectKeys(context.TODO())
	// if err != nil {
	// 	log.Fatalf("Error getting list of object keys: %v\n", err)
	// }
	// for _, key := range keys {
	// 	fmt.Println(key)
	// }
	//
	// key := "workery/static/rest_framework/js/prettify-min.js"
	//
	// fp, err := s3.DownloadToLocalfile(context.TODO(), key, "./data/prettify-min.js")
	// if err != nil {
	// 	log.Fatalf("Error getting object: %v\n", err)
	// }
	// fmt.Println("saved:", fp)

	fmt.Println("finished downloading complete s3 bucket locally!")
}

package naics

import (
	"context"
	"testing"
)

// TestNewNAICSImporterAtDataDir tests the NewNAICSImporterAtDataDir function
func TestNewNAICSImporterAtDataDir(t *testing.T) {
	t.Run("DataDirectoryIsCorrect", func(t *testing.T) {
		imp, err := NewNAICSImporterAtDataDir("../../data")
		if err != nil {
			t.Errorf("NewNAICSImporterAtDataDir(../../data) got error %v", err)
		}
		if imp == nil {
			t.Errorf("NewNAICSImporterAtDataDir(../../data) = %d; do not want nil", imp)
		}
	})
	t.Run("DataDirectoryIsIncorrect", func(t *testing.T) {
		_, err := NewNAICSImporterAtDataDir("./data")
		if err == nil {
			t.Errorf("NewNAICSImporterAtDataDir(../../data) got error %v when there should be non", err)
		}
	})
}

func TestImportByVersion(t *testing.T) {
	ctx := context.Background()
	imp, _ := NewNAICSImporterAtDataDir("../../data")

	t.Run("Pick Incorrect Version", func(t *testing.T) {
		_, err := imp.ImportByVersion(ctx, 123)
		if err == nil {
			t.Error("ImportByVersion(ctx, 123) did not return error when there should be an error")
		}
	})
	t.Run("Pick Correct Version", func(t *testing.T) {
		_, err := imp.ImportByVersion(ctx, VersionNAICSCanada2021V1Dot0)
		if err != nil {
			t.Errorf("ImportByVersion(ctx, VersionNAICSCanada2021V1Dot0) got error %v", err)
		}
	})
}

func TestImportByFiles(t *testing.T) {
	ctx := context.Background()
	t.Run("both files are missing", func(t *testing.T) {
		_, err := importByFiles(ctx, "x", "xx")
		if err == nil {
			t.Error("ImportByVersion(ctx, 123) did not return error when there should be an error")
		}
	})
	t.Run("one file exists while other file is missing", func(t *testing.T) {
		_, err := importByFiles(ctx, "../../data/naics-scian-2022-element-v1-eng.csv", "../../data/xxx.csv")
		if err == nil {
			t.Errorf("ImportByVersion(ctx, VersionNAICSCanada2021V1Dot0) did not get error")
		}
	})
	t.Run("both file exists and verify output", func(t *testing.T) {
		// STEP 1: Lookup correct files.
		naicss, err := importByFiles(ctx, "../../data/naics-scian-2022-element-v1-eng.csv", "../../data/naics-scian-2022-structure-v1-eng.csv")
		if err != nil {
			t.Errorf("ImportByVersion(ctx, VersionNAICSCanada2021V1Dot0) got error %v", err)
		}

		// STEP 2: Look through all the naicss imported and find a specific record.
		for _, naics := range naicss {

			// NOTE: The following unit test was checked via the following link:
			// https://www23.statcan.gc.ca/imdb/p3VD.pl?Function=getVD&TVD=1369825&CVD=1370970&CPV=111110&CST=27012022&CLV=5&MLV=5

			if naics.CodeStr == "111110" {
				if naics.CanadianIndustryTitle != "Soybean farming" {
					t.Errorf("CanadianIndustryTitle is incorrect. Want %s but got %s", "Soybean farming", naics.CanadianIndustryTitle)
				}
				if naics.IndustryTitle != "Soybean farming" {
					t.Errorf("IndustryTitle is incorrect %v", naics.IndustryTitle)
				}
				if naics.IndustryGroupTitle != "Oilseed and grain farming" {
					t.Errorf("IndustryGroupTitle is incorrect %v", naics.IndustryGroupTitle)
				}
				if naics.SubsectorTitle != "Crop production" {
					t.Errorf("SubsectorTitle is incorrect %v", naics.SubsectorTitle)
				}
				if naics.SectorTitle != "Agriculture, forestry, fishing and hunting" {
					t.Errorf("MinorGroupTitle is incorrect %v", naics.SectorTitle)
				}
				if naics.Superscript != "" {
					t.Errorf("Superscript is incorrect %v", naics.Superscript)
				}

				// For debugging purposes only:
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				// fmt.Println("naics.SectorCode", naics.SectorCode)
				// fmt.Println("naics.MajorGroupTitle", naics.MajorGroupTitle)
				// fmt.Println("naics.SubMinorGroupTitle", naics.SubMinorGroupTitle)
				// fmt.Println("naics.MinorGroupTitle", naics.MinorGroupTitle)
				// fmt.Println("naics.UnitGroupTitle", naics.UnitGroupTitle)
				// fmt.Println("--->STOP<---")
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

				return // Terminate this unit test with success.
			}
		}
	})
}

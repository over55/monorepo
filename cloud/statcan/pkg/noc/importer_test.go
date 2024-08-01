package noc

import (
	"context"
	"testing"
)

// TestNewNOCImporterAtDataDir tests the NewNOCImporterAtDataDir function
func TestNewNOCImporterAtDataDir(t *testing.T) {
	t.Run("DataDirectoryIsCorrect", func(t *testing.T) {
		imp, err := NewNOCImporterAtDataDir("../../data")
		if err != nil {
			t.Errorf("NewNOCImporterAtDataDir(../../data) got error %v", err)
		}
		if imp == nil {
			t.Errorf("NewNOCImporterAtDataDir(../../data) = %d; do not want nil", imp)
		}
	})
	t.Run("DataDirectoryIsIncorrect", func(t *testing.T) {
		_, err := NewNOCImporterAtDataDir("./data")
		if err == nil {
			t.Errorf("NewNOCImporterAtDataDir(../../data) got error %v when there should be non", err)
		}
	})
}

func TestImportByVersion(t *testing.T) {
	ctx := context.Background()
	imp, _ := NewNOCImporterAtDataDir("../../data")

	t.Run("Pick Incorrect Version", func(t *testing.T) {
		_, err := imp.ImportByVersion(ctx, 123)
		if err == nil {
			t.Error("ImportByVersion(ctx, 123) did not return error when there should be an error")
		}
	})
	t.Run("Pick Correct Version", func(t *testing.T) {
		_, err := imp.ImportByVersion(ctx, VersionNOC2021V1Dot0)
		if err != nil {
			t.Errorf("ImportByVersion(ctx, VersionNOC2021V1Dot0) got error %v", err)
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
		_, err := importByFiles(ctx, "../../data/noc_2021_version_1.0_-_elements.csv", "../../data/xxx.csv")
		if err == nil {
			t.Errorf("ImportByVersion(ctx, VersionNOC2021V1Dot0) did not get error")
		}
	})
	t.Run("both file exists and verify output", func(t *testing.T) {
		// STEP 1: Lookup correct files.
		nocs, err := importByFiles(ctx, "../../data/noc_2021_version_1.0_-_elements.csv", "../../data/noc_2021_version_1.0_-_classification_structure.csv")
		if err != nil {
			t.Errorf("ImportByVersion(ctx, VersionNOC2021V1Dot0) got error %v", err)
		}

		// STEP 2: Look through all the nocs imported and find a specific record.
		for _, noc := range nocs {

			// NOTE: According to the "Introduction to the National Occupational
			// Classification (NOC) 2021 Version 1.0" page via this link:
			// https://www.statcan.gc.ca/en/subjects/standard/noc/2021/introductionV1
			// There is an example called "Example of coding in NOC 2021 Version
			// 1.0: Judges, lawyers and Quebec notaries", the following should
			// be returned.

			if noc.CodeStr == "41101" {
				if noc.BroadCategoryTitle != "Occupations in education, law and social, community and government services" {
					t.Errorf("BroadCategoryTitle is incorrect %v", noc.BroadCategoryTitle)
				}
				if noc.MajorGroupTitle != "Professional occupations in law, education, social, community and government services" {
					t.Errorf("MajorGroupTitle is incorrect %v", noc.MajorGroupTitle)
				}
				if noc.SubMinorGroupTitle != "Professional occupations in law" {
					t.Errorf("SubMinorGroupTitle is incorrect %v", noc.SubMinorGroupTitle)
				}
				if noc.MinorGroupTitle != "Judges, lawyers and Quebec notaries" {
					t.Errorf("MinorGroupTitle is incorrect %v", noc.MinorGroupTitle)
				}
				if noc.UnitGroupTitle != "Lawyers and Quebec notaries" {
					t.Errorf("MinorGroupTitle is incorrect %v", noc.UnitGroupTitle)
				}

				// For debugging purposes only:
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				// fmt.Println("noc.BroadCategoryTitle", noc.BroadCategoryTitle)
				// fmt.Println("noc.MajorGroupTitle", noc.MajorGroupTitle)
				// fmt.Println("noc.SubMinorGroupTitle", noc.SubMinorGroupTitle)
				// fmt.Println("noc.MinorGroupTitle", noc.MinorGroupTitle)
				// fmt.Println("noc.UnitGroupTitle", noc.UnitGroupTitle)
				// fmt.Println("--->STOP<---")
				//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				break
			}
		}
	})
}

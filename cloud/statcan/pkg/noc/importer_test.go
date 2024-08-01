package noc

import (
	"context"
	"io/ioutil"
	"os"
	"strings"
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

func TestReadCsvFile(t *testing.T) {
	// Create temporary files for testing
	t.Run("Test valid CSV file", func(t *testing.T) {
		content := `header1,header2,header3
row1col1,row1col2,row1col3
row2col1,row2col2,row2col3`

		tmpFile, err := ioutil.TempFile("", "valid.csv")
		if err != nil {
			t.Fatalf("Unable to create temporary file: %v", err)
		}
		defer os.Remove(tmpFile.Name())

		if _, err := tmpFile.Write([]byte(content)); err != nil {
			t.Fatalf("Unable to write to temporary file: %v", err)
		}
		tmpFile.Close()

		records, err := readCsvFile(tmpFile.Name())
		if err != nil {
			t.Fatalf("Expected no error, but got %v", err)
		}

		expected := [][]string{
			{"row1col1", "row1col2", "row1col3"},
			{"row2col1", "row2col2", "row2col3"},
		}

		for i, row := range expected {
			for j, col := range row {
				if records[i][j] != col {
					t.Errorf("Expected %v, but got %v", col, records[i][j])
				}
			}
		}
	})

	t.Run("Test non-existent file", func(t *testing.T) {
		_, err := readCsvFile("nonexistent.csv")
		if err == nil {
			t.Fatalf("Expected an error, but got none")
		}
		expectedError := "Unable to read input file nonexistent.csv"
		if !strings.Contains(err.Error(), expectedError) {
			t.Errorf("Expected error containing %v, but got %v", expectedError, err.Error())
		}
	})

	t.Run("Test empty file after header", func(t *testing.T) {
		content := `header1,header2,header3
`

		tmpFile, err := ioutil.TempFile("", "empty.csv")
		if err != nil {
			t.Fatalf("Unable to create temporary file: %v", err)
		}
		defer os.Remove(tmpFile.Name())

		if _, err := tmpFile.Write([]byte(content)); err != nil {
			t.Fatalf("Unable to write to temporary file: %v", err)
		}
		tmpFile.Close()

		records, err := readCsvFile(tmpFile.Name())
		if err != nil {
			t.Fatalf("Expected no error, but got %v", err)
		}

		if len(records) != 0 {
			t.Errorf("Expected empty result, but got %v", records)
		}
	})

	t.Run("Test invalid CSV content", func(t *testing.T) {
		content := `header1,header2,header3
row1col1,row1col2,"unclosed_quote
row2col1,row2col2,row2col3`

		tmpFile, err := ioutil.TempFile("", "invalid.csv")
		if err != nil {
			t.Fatalf("Unable to create temporary file: %v", err)
		}
		defer os.Remove(tmpFile.Name())

		if _, err := tmpFile.Write([]byte(content)); err != nil {
			t.Fatalf("Unable to write to temporary file: %v", err)
		}
		tmpFile.Close()

		_, err = readCsvFile(tmpFile.Name())
		if err == nil {
			t.Fatalf("Expected an error, but got none")
		}
		expectedError := "Unable to parse file as CSV"
		if !strings.Contains(err.Error(), expectedError) {
			t.Errorf("Expected error containing %v, but got %v", expectedError, err.Error())
		}
	})
}
func TestPadZeroes(t *testing.T) {
	// Test case 1: String length is less than target size
	t.Run("Test with smaller string", func(t *testing.T) {
		result := padZeroes("23", 5)
		expected := "00023"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 2: String length is equal to target size
	t.Run("Test with equal size string", func(t *testing.T) {
		result := padZeroes("12345", 5)
		expected := "12345"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 3: String length is greater than target size
	t.Run("Test with larger string", func(t *testing.T) {
		result := padZeroes("123456", 5)
		expected := "123456"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 4: Empty string with non-zero size
	t.Run("Test with empty string", func(t *testing.T) {
		result := padZeroes("", 5)
		expected := "00000"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 5: Target size is zero
	t.Run("Test with zero size", func(t *testing.T) {
		result := padZeroes("123", 0)
		expected := "123"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 6: Empty string with zero size
	t.Run("Test with empty string and zero size", func(t *testing.T) {
		result := padZeroes("", 0)
		expected := ""
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
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
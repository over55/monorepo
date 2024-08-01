package csvreader

import (
	"io/ioutil"
	"os"
	"strings"
	"testing"
)

func TestReadCsvFile(t *testing.T) {
	// Create temporary files for testing
	t.Run("Test valid CSV file", func(t *testing.T) {
		content := `
        header1,header2,header3
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

		records, err := ReadCsvFile(tmpFile.Name())
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
		_, err := ReadCsvFile("nonexistent.csv")
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

		records, err := ReadCsvFile(tmpFile.Name())
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

		_, err = ReadCsvFile(tmpFile.Name())
		if err == nil {
			t.Fatalf("Expected an error, but got none")
		}
		expectedError := "Unable to parse file as CSV"
		if !strings.Contains(err.Error(), expectedError) {
			t.Errorf("Expected error containing %v, but got %v", expectedError, err.Error())
		}
	})
}

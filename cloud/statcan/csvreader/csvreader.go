package csvreader

import (
	"encoding/csv"
	"fmt"
	"os"
)

func ReadCsvFile(filePath string) ([][]string, error) {
	// Open the CSV file
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("Unable to read input file %v: %v", filePath, err)
	}
	defer f.Close()

	// Create a new CSV reader
	csvReader := csv.NewReader(f)

	// Skip the first line
	csvReader.Read() // Note: Hide error returns here.

	// Read the remaining records
	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("Unable to parse file as CSV for %v: %v", filePath, err)
	}

	return records, nil
}

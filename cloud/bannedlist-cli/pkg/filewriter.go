package pkg

import (
	"encoding/json"
	"os"
)

// WriteJSONContent will take an array of strings and save them in a JSON file
// with structure of a string array.
func WriteJSONContent(filePath string, content []string) error {
	// Create or open the file for writing
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	// Create a JSON encoder and encode the content into the file
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ") // Optional: makes the JSON output more readable with indentation
	if err := encoder.Encode(content); err != nil {
		return err
	}

	return nil
}

package pkg

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

// ReadTextContent reads a file and returns each line as an element in a slice of strings.
func ReadTextContent(filePath string) ([]string, error) {
	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %v", filePath, err)
	}
	defer file.Close()

	// Initialize a slice to hold the lines
	var lines []string

	// Create a new scanner to read the file line by line
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		// Append each line to the slice
		lines = append(lines, scanner.Text())
	}

	// Check for errors encountered by the scanner
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file %s: %v", filePath, err)
	}

	return lines, nil
}

// ReadJSONContent function opens a JSON file which is structured as an array
// of strings and then parses the data to return a Golang structured array
// of strings.
func ReadJSONContent(filePath string) ([]string, error) {
	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file %s does not exist", filePath)
	}

	// Read the file contents
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %v", filePath, err)
	}

	// Parse the JSON content as a list of text.
	var text []string
	if err := json.Unmarshal(data, &text); err != nil {
		return nil, fmt.Errorf("failed to parse JSON file %s: %v", filePath, err)
	}

	return text, nil
}

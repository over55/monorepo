package pkg

import "sort"

// UniqueStrings takes an array of strings and returns a new array containing only the unique strings.
func UniqueStrings(input []string) []string {
	// Create a map to track unique strings
	uniqueMap := make(map[string]bool)
	uniqueList := []string{}

	// Iterate through the input array
	for _, str := range input {
		// Check if the string is already in the map
		if _, exists := uniqueMap[str]; !exists {
			// If not, add it to the map and the unique list
			uniqueMap[str] = true
			uniqueList = append(uniqueList, str)
		}
	}

	return uniqueList
}

// SortStringsAscending takes an array of strings and sorts them in ascending alphabetical order.
func SortStringsAscending(input []string) []string {
	// Make a copy of the input slice to avoid modifying the original slice
	sortedStrings := make([]string, len(input))
	copy(sortedStrings, input)

	// Sort the slice in ascending order
	sort.Strings(sortedStrings)

	return sortedStrings
}

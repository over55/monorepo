package padzero

import "strings"

// padZeroes function appends zero strings as prefix based on a string size of 5. So for example:
//
// 0 => 00000
// 23 => 00023
// 120 => 00120
// 10000 => 10000
func PadZeroes(s string, size int) string {
	// Calculate how many zeroes to add
	prefixLength := size - len(s)

	// If the length of the string is already equal or greater than the target size, return the string
	if prefixLength <= 0 {
		return s
	}

	// Generate the zeroes prefix
	prefix := strings.Repeat("0", prefixLength)

	// Return the string with the zeroes prefix
	return prefix + s
}

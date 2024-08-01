package padzero

import "testing"

func TestPadZeroes(t *testing.T) {
	// Test case 1: String length is less than target size
	t.Run("Test with smaller string", func(t *testing.T) {
		result := PadZeroes("23", 5)
		expected := "00023"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 2: String length is equal to target size
	t.Run("Test with equal size string", func(t *testing.T) {
		result := PadZeroes("12345", 5)
		expected := "12345"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 3: String length is greater than target size
	t.Run("Test with larger string", func(t *testing.T) {
		result := PadZeroes("123456", 5)
		expected := "123456"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 4: Empty string with non-zero size
	t.Run("Test with empty string", func(t *testing.T) {
		result := PadZeroes("", 5)
		expected := "00000"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 5: Target size is zero
	t.Run("Test with zero size", func(t *testing.T) {
		result := PadZeroes("123", 0)
		expected := "123"
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})

	// Test case 6: Empty string with zero size
	t.Run("Test with empty string and zero size", func(t *testing.T) {
		result := PadZeroes("", 0)
		expected := ""
		if result != expected {
			t.Errorf("Expected %v, but got %v", expected, result)
		}
	})
}

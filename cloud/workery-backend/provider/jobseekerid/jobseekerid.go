package jobseekerid

import (
	"errors"
	"fmt"
)

// Provider provides interface for abstracting UUID generation.
type Provider interface {
	Generate(firstName string, lastName string, totalJobSeekersCountInSystem uint64) (string, error)
}

type jsProvider struct{}

// NewProvider constructor that returns the default UUID generator.
func NewProvider() Provider {
	return jsProvider{}
}

// Generate generates a new job seeker ID. The operands are defined as follows:
//
// Where X = Initial of First name
// Where Y = Initial of Last Name
//
// Where xyz = an increasing number sequence, beginning at 100. So, if the first participant was Rodolfo Martinez, then the generated ID would be RM-100. Once it hits 999, it can roll over to 0001 (increase the ID by 1 digit) and continue to 9999, then roll over to 00001, to go 99999 etc and keep rolling on indefinitely by adding an extra digit at the end
func (u jsProvider) Generate(firstName string, lastName string, totalJobSeekersCountInSystem uint64) (string, error) {
	// Defensive code.
	if firstName == "" {
		return "", errors.New("missing first name")
	}
	if lastName == "" {
		return "", errors.New("missing last name")
	}

	// Generate initials.
	initials := fmt.Sprintf("%c%c", firstName[0], lastName[0])

	// Handle all ID's between zero to 900.
	if totalJobSeekersCountInSystem < 900 {
		return fmt.Sprintf("%s-%03d", initials, 100+totalJobSeekersCountInSystem), nil
	}
	if totalJobSeekersCountInSystem < 10899 {
		totalJobSeekersCountInSystem -= 899
		return fmt.Sprintf("%s-%04d", initials, totalJobSeekersCountInSystem), nil
	}
	if totalJobSeekersCountInSystem < 110899 {
		totalJobSeekersCountInSystem -= 10898
		return fmt.Sprintf("%s-%05d", initials, totalJobSeekersCountInSystem), nil
	}
	if totalJobSeekersCountInSystem < 1110898 {
		totalJobSeekersCountInSystem -= 110898
		return fmt.Sprintf("%s-%06d", initials, totalJobSeekersCountInSystem), nil
	}
	if totalJobSeekersCountInSystem < 11110897 {
		totalJobSeekersCountInSystem -= 1110897
		return fmt.Sprintf("%s-%07d", initials, totalJobSeekersCountInSystem), nil
	}
	if totalJobSeekersCountInSystem < 111110896 {
		totalJobSeekersCountInSystem -= 11110896
		return fmt.Sprintf("%s-%08d", initials, totalJobSeekersCountInSystem), nil
	}

	// DEVELOPERS NOTE: The maximum cannot be greater then `211110896` or we
	// get a compiler error; therefore, we stop at this range.
	if totalJobSeekersCountInSystem < 211110896 {
		totalJobSeekersCountInSystem -= 111110895
		return fmt.Sprintf("%s-%09d", initials, totalJobSeekersCountInSystem), nil
	}

	return "", errors.New("Unsupported range")
}

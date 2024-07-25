package jobseekerid

import (
	"fmt"
	"testing"

	"github.com/over55/monorepo/cloud/workery-backend/provider/jobseekerid"
)

// go test -v provider/jobseekerid/jobseekerid_test.go;

func TestNewID(t *testing.T) {
	p := jobseekerid.NewProvider()

	// ----------------------------------------
	// People    | Range        | Formula
	// ----------------------------------------
	// 0         | XX-100       | c + 100
	// 1         | XX-101       | c + 100
	// 899       | XX-999       | c + 100
	// 900       | XX-0001      | c - 899
	// 10898     | XX-9999      | c - 899
	// 10899     | XX-00001     | c - 10898
	// 110899    | XX-99999     | c - 10898
	// 110899    | xx-000001    | c - 110898
	// 1110897   | XX-999999    | c - 110898
	// 1110898   | XX-0000001   | c - 1110897
	// 11110896  | XX-9999999   | c - 1110897
	// 11110897  | XX-00000001  | c - 11110896
	// 111110895 | XX-99999999  | c - 11110896
	// 111110896 | XX-000000001 | c - 111110895
	// ----------------------------------------

	t.Run("verify the `XX-999` range", func(t *testing.T) {
		// Examples: XX-100, XX-101, ..., XX-998, XX-999
		for i := uint64(0); i <= 899; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			want := fmt.Sprintf("%s-%03d", "FH", (i + 100))
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}
			// t.Log("in -->", i, " out -->", want) // For debugging purposes only.
		}
	})
	t.Run("verify the `XX-9,999` range", func(t *testing.T) {
		// The count range should be between 900 people to
		for i := uint64(900); i <= 10898; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			j := i - 899
			want := fmt.Sprintf("%s-%04d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}
			// t.Log("in -->", i, " out -->", want)
		}
	})
	t.Run("verify the `XX-99,999` range", func(t *testing.T) {
		// The count range should be between 900 people to
		for i := uint64(10899); i <= 110898; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			j := i - 10898
			want := fmt.Sprintf("%s-%05d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}
			// t.Log("in -->", i, " out -->", want)
		}
	})
	t.Run("verify the `XX-999,999` range", func(t *testing.T) {
		// The count range should be between 900 people to
		for i := uint64(110899); i <= 1110897; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			j := i - 110898
			want := fmt.Sprintf("%s-%06d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}
			// log.Print("-->", i, "-->", want)
		}
	})
	t.Run("verify the `XX-9,999,999` range", func(t *testing.T) {
		// The count range should be between 900 people to
		for i := uint64(1110898); i <= 11110896; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			j := i - 1110897
			want := fmt.Sprintf("%s-%07d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}
			// log.Print("-->", i, "-->", want)
		}
	})
	t.Run("verify the `XX-99,999,999` range", func(t *testing.T) {
		// The count range should be between 900 people to
		for i := uint64(11110897); i <= 111110895; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v", err)
				break
			}
			j := i - 11110896
			want := fmt.Sprintf("%s-%08d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}

			// // For debugging purposes only.
			// if i > 101110895 { // This is done to shorten down the validation.
			// 	log.Print("-->", i, " -->", want)
			// }
		}
	})
	t.Run("verify the `XX-999,999,999` range", func(t *testing.T) {
		// DEVELOPERS NOTE:
		// Cannot be greater then `211110896`.

		for i := uint64(111110897); i <= 211110895; i++ {
			got, err := p.Generate("Frank", "Herbert", i)
			if err != nil {
				t.Errorf("got error %v using i %d", err, i)
				break
			}
			j := i - 111110895
			want := fmt.Sprintf("%s-%09d", "FH", j)
			if got != want {
				t.Errorf("got %q want %q", got, want)
				break
			}

			// // For debugging purposes only.
			// if i > 201110896 { // This is done to shorten down the validation.
			// 	log.Print("-->", i, " -->", want)
			// }
		}
	})
	t.Run("verify we cannot go more then `211110896`.", func(t *testing.T) {
		_, err := p.Generate("Frank", "Herbert", 211110896)
		if err == nil {
			t.Fail()
		}
	})
	t.Run("verify defensive code", func(t *testing.T) {
		if _, err := p.Generate("", "Herbert", 211110896); err == nil {
			t.Fail()
		}

		if _, err := p.Generate("Frank", "", 211110896); err == nil {
			t.Fail()
		}
	})
}

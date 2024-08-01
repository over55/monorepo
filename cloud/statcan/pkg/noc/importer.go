package noc

import (
	"context"
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type NOCVersion int

const (
	VersionNOC2021V1Dot0 = iota
)

type NOCImporter interface {
	ImportByVersion(ctx context.Context, version NOCVersion) ([]*NationalOccupationalClassification, error)
}

type nocImporter struct {
	dirPath string
}

func NewNOCImporterAtDataDir(dirPath string) (NOCImporter, error) {
	filePaths := []string{"noc_2021_version_1.0_-_elements.csv", "noc_2021_version_1.0_-_classification_structure.csv"}
	for _, filePath := range filePaths {
		f, err := os.Open(dirPath + "/" + filePath)
		defer f.Close()
		if err != nil {
			return nil, err
		}
	}
	return &nocImporter{
		dirPath: dirPath,
	}, nil
}

func (imp *nocImporter) ImportByVersion(ctx context.Context, version NOCVersion) ([]*NationalOccupationalClassification, error) {
	switch version {
	case VersionNOC2021V1Dot0:
		return importByFiles(ctx, imp.dirPath+"/"+"noc_2021_version_1.0_-_elements.csv", imp.dirPath+"/"+"noc_2021_version_1.0_-_classification_structure.csv")
	default:
		return nil, fmt.Errorf("unsupported version: %v", version)
	}
}

func readCsvFile(filePath string) ([][]string, error) {
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

// padZeroes function appends zero strings as prefix based on a string size of 5. So for example:
//
// 0 => 00000
// 23 => 00023
// 120 => 00120
// 10000 => 10000
func padZeroes(s string, size int) string {
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

func importByFiles(ctx context.Context, elementFilePath string, structFilePath string) ([]*NationalOccupationalClassification, error) {
	nocs := make([]*NationalOccupationalClassification, 0)
	ee, readCsvFileErr := readCsvFile(elementFilePath)
	if readCsvFileErr != nil {
		return nil, readCsvFileErr
	}
	ss, readCsvFileErr := readCsvFile(structFilePath)
	if readCsvFileErr != nil {
		return nil, readCsvFileErr
	}

	for _, e := range ee {
		level, _ := strconv.ParseUint(e[0], 10, 8)
		code, _ := strconv.ParseUint(e[1], 10, 32)
		noc := &NationalOccupationalClassification{
			LanguageCode:       "en",
			Version:            "NOC 2021 V1.0",
			Level:              uint8(level),
			Code:               uint(code),
			CodeStr:            padZeroes(e[1], 5),
			ElementType:        e[3],
			ElementDescription: e[4],
		}

		broadCategory := noc.CodeStr[0:1]
		majorGroup := noc.CodeStr[0:2]
		subMajorGroup := noc.CodeStr[0:3]
		minorGroup := noc.CodeStr[0:4]
		unitGroup := noc.CodeStr[0:5]

		for _, s := range ss {
			// sLevel := s[0]
			// sHierarchicalStructure := s[1]
			sCodeStr := s[2]
			sClassTitle := s[3]
			sClassDefinition := s[4]

			sCodeInt, _ := strconv.ParseUint(sCodeStr, 10, 32)

			if broadCategory == sCodeStr {
				noc.BroadCategoryCode = uint(sCodeInt)
				noc.BroadCategoryCodeStr = sCodeStr
				noc.BroadCategoryTitle = sClassTitle
				noc.BroadCategoryDescription = sClassDefinition
			}
			if majorGroup == sCodeStr {
				noc.MajorGroupCode = uint(sCodeInt)
				noc.MajorGroupCodeStr = sCodeStr
				noc.MajorGroupTitle = sClassTitle
				noc.MajorGroupDescription = sClassDefinition
			}
			if subMajorGroup == sCodeStr {
				noc.SubMinorGroupCode = uint(sCodeInt)
				noc.SubMinorGroupCodeStr = sCodeStr
				noc.SubMinorGroupTitle = sClassTitle
				noc.SubMinorGroupDescription = sClassDefinition
			}
			if minorGroup == sCodeStr {
				noc.MinorGroupCode = uint(sCodeInt)
				noc.MinorGroupCodeStr = sCodeStr
				noc.MinorGroupTitle = sClassTitle
				noc.MinorGroupDescription = sClassDefinition
			}
			if unitGroup == sCodeStr {
				noc.UnitGroupCode = uint(sCodeInt)
				noc.UnitGroupCodeStr = sCodeStr
				noc.UnitGroupTitle = sClassTitle
				noc.UnitGroupDescription = sClassDefinition
			}
		}

		nocs = append(nocs, noc)
	}

	return nocs, nil
}

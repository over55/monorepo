package statcan

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/over55/monorepo/cloud/statcan/csvreader"
	"github.com/over55/monorepo/cloud/statcan/padzero"
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
		return importNOCByFiles(ctx, imp.dirPath+"/"+"noc_2021_version_1.0_-_elements.csv", imp.dirPath+"/"+"noc_2021_version_1.0_-_classification_structure.csv")
	default:
		return nil, fmt.Errorf("unsupported version: %v", version)
	}
}

func importNOCByFiles(ctx context.Context, elementFilePath string, structFilePath string) ([]*NationalOccupationalClassification, error) {
	nocs := make([]*NationalOccupationalClassification, 0)
	ee, readCsvFileErr := csvreader.ReadCsvFile(elementFilePath)
	if readCsvFileErr != nil {
		return nil, readCsvFileErr
	}
	ss, readCsvFileErr := csvreader.ReadCsvFile(structFilePath)
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
			CodeStr:            padzero.PadZeroes(e[1], 5),
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

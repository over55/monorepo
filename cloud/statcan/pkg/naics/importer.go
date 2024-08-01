package naics

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/over55/monorepo/cloud/statcan/pkg/csvreader"
	"github.com/over55/monorepo/cloud/statcan/pkg/padzero"
)

type NAICSVersion int

const (
	VersionNAICSCanada2021V1Dot0 = iota
)

type NAICSImporter interface {
	ImportByVersion(ctx context.Context, version NAICSVersion) ([]*NorthAmericanIndustryClassificationSystem, error)
}

type naicsImporter struct {
	dirPath string
}

func NewNAICSImporterAtDataDir(dirPath string) (NAICSImporter, error) {
	filePaths := []string{"naics-scian-2022-element-v1-eng.csv", "naics-scian-2022-structure-v1-eng.csv"}
	for _, filePath := range filePaths {
		f, err := os.Open(dirPath + "/" + filePath)
		defer f.Close()
		if err != nil {
			return nil, err
		}
	}
	return &naicsImporter{
		dirPath: dirPath,
	}, nil
}

func (imp *naicsImporter) ImportByVersion(ctx context.Context, version NAICSVersion) ([]*NorthAmericanIndustryClassificationSystem, error) {
	switch version {
	case VersionNAICSCanada2021V1Dot0:
		return importByFiles(ctx, imp.dirPath+"/"+"naics-scian-2022-element-v1-eng.csv", imp.dirPath+"/"+"naics-scian-2022-structure-v1-eng.csv")
	default:
		return nil, fmt.Errorf("unsupported version: %v", version)
	}
}

func importByFiles(ctx context.Context, elementFilePath string, structFilePath string) ([]*NorthAmericanIndustryClassificationSystem, error) {
	naicss := make([]*NorthAmericanIndustryClassificationSystem, 0)
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
		naics := &NorthAmericanIndustryClassificationSystem{
			LanguageCode:       "en",
			Version:            "Canada 2022 V1.0",
			Level:              uint8(level),
			Code:               uint(code),
			CodeStr:            padzero.PadZeroes(e[1], 6),
			ElementType:        e[3],
			ElementDescription: e[4],
		}

		// // For debugging purposes only.
		// fmt.Println("1 -->", e[0]) // Level
		// fmt.Println("2 -->", e[1]) // Code
		// fmt.Println("3 -->", e[2]) // Class Title
		// fmt.Println("4 -->", e[3]) // Element Type
		// fmt.Println("5 -->", e[4]) // Element Desc

		sector := naics.CodeStr[0:2]
		subsector := naics.CodeStr[0:3]
		industryGroup := naics.CodeStr[0:4]
		industry := naics.CodeStr[0:5]
		canadianIndustry := naics.CodeStr[0:6]

		for _, s := range ss {
			// sLevel := s[0]
			// sHierarchicalStructure := s[1]
			sCodeStr := s[2]
			sCodeInt, _ := strconv.ParseUint(sCodeStr, 10, 32)
			// sParent := s[3]
			sClassTitle := s[4]
			sSuperscript := s[5]
			sClassDefinition := s[6]

			// // For debugging purposes only.
			// fmt.Println("sector -->", sector)
			// fmt.Println("sCodeStr -->", sCodeStr)
			// fmt.Println("sClassTitle -->", sClassTitle)
			// fmt.Println("sCodeInt -->", sCodeInt)
			// fmt.Println("")

			if sector == sCodeStr {
				naics.SectorCode = uint(sCodeInt)
				naics.SectorCodeStr = sCodeStr
				naics.SectorTitle = sClassTitle
				naics.SectorDescription = sClassDefinition
				if sSuperscript != "" {
					naics.Superscript = sSuperscript
				}
			}
			if subsector == sCodeStr {
				naics.SubsectorCode = uint(sCodeInt)
				naics.SubsectorCodeStr = sCodeStr
				naics.SubsectorTitle = sClassTitle
				naics.SubsectorDescription = sClassDefinition
				if sSuperscript != "" {
					naics.Superscript = sSuperscript
				}
			}
			if industryGroup == sCodeStr {
				naics.IndustryGroupCode = uint(sCodeInt)
				naics.IndustryGroupCodeStr = sCodeStr
				naics.IndustryGroupTitle = sClassTitle
				naics.IndustryGroupDescription = sClassDefinition
				if sSuperscript != "" {
					naics.Superscript = sSuperscript
				}
			}
			if industry == sCodeStr {
				naics.IndustryCode = uint(sCodeInt)
				naics.IndustryCodeStr = sCodeStr
				naics.IndustryTitle = sClassTitle
				naics.IndustryDescription = sClassDefinition
				if sSuperscript != "" {
					naics.Superscript = sSuperscript
				}
			}
			if canadianIndustry == sCodeStr {
				naics.CanadianIndustryCode = uint(sCodeInt)
				naics.CanadianIndustryCodeStr = sCodeStr
				naics.CanadianIndustryTitle = sClassTitle
				naics.CanadianIndustryDescription = sClassDefinition
				if sSuperscript != "" {
					naics.Superscript = sSuperscript
				}
			}

			// return nil, nil // HALT for debugging purposes only. Uncomment if you'd like to run this loop once.
		}

		naicss = append(naicss, naics)
	}

	return naicss, nil
}

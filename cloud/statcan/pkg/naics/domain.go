package naics

type NorthAmericanIndustryClassificationSystem struct {
	LanguageCode                string `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version                     string `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	Level                       uint8  `bson:"level" json:"level"`                 // Ex: 1
	Code                        uint   `bson:"code" json:"code"`                   // Ex: 1
	CodeStr                     string `bson:"code_str" json:"code_str"`           // Ex: 00001
	SectorCode                  uint   `bson:"sector_code" json:"sector_code"`
	SectorCodeStr               string `bson:"sector_code_str" json:"sector_code_str"`
	SectorTitle                 string `bson:"sector_title" json:"sector_title"`
	SectorDescription           string `bson:"sector_description" json:"sector_description"`
	SubsectorCode               uint   `bson:"subsector_code" json:"subsector_code"`
	SubsectorCodeStr            string `bson:"subsector_code_str" json:"subsector_code_str"`
	SubsectorTitle              string `bson:"subsector_title" json:"subsector_title"`
	SubsectorDescription        string `bson:"subsector_description" json:"subsector_description"`
	IndustryGroupCode           uint   `bson:"industry_group_code" json:"industry_group_code"`
	IndustryGroupCodeStr        string `bson:"industry_group_code_str" json:"industry_group_code_str"`
	IndustryGroupTitle          string `bson:"industry_group_title" json:"industry_group_title"`
	IndustryGroupDescription    string `bson:"industry_group_description" json:"industry_group_description"`
	IndustryCode                uint   `bson:"industry_code" json:"industry_code"`
	IndustryCodeStr             string `bson:"industry_code_str" json:"industry_code_str"`
	IndustryTitle               string `bson:"industry_title" json:"industry_title"`
	IndustryDescription         string `bson:"industry_description" json:"industry_description"`
	CanadianIndustryCode        uint   `bson:"canadian_industry_code" json:"canadian_industry_code"`
	CanadianIndustryCodeStr     string `bson:"canadian_industry_code_str" json:"canadian_industry_code_str"`
	CanadianIndustryTitle       string `bson:"canadian_industry_title" json:"canadian_industry_title"`
	CanadianIndustryDescription string `bson:"canadian_industry_description" json:"canadian_industry_description"`
	Superscript                 string `bson:"superscript" json:"superscript"`
	ElementType                 string `bson:"element_type" json:"element_type"`
	ElementDescription          string `bson:"element_description" json:"element_description"`
}

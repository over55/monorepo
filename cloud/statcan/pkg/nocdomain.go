package pkg

type CanadianNationalOccupationalClassification struct {
	LanguageCode         string `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version              string `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	Level                uint8  `bson:"level" json:"level"`                 // Ex: 1
	Code                 uint   `bson:"code" json:"code"`                   // Ex: 1
	CodeStr              string `bson:"code_str" json:"code_str"`           // Ex: 00001
	BroadCategoryCodeStr string `bson:"broad_category_code_str" json:"broad_category_code_str"`
	BroadCategoryTitle   string `bson:"broad_category_title" json:"broad_category_title"`
	MajorGroupCodeStr    string `bson:"major_group_code_str" json:"major_group_code_str"`
	MajorGroupTitle      string `bson:"major_group_title" json:"major_group_title"`
	SubMinorGroupCodeStr string `bson:"sub_minor_group_code_str" json:"sub_minor_group_code_str"`
	SubMinorGroupTitle   string `bson:"sub_minor_group_title" json:"sub_minor_group_title"`
	MinorGroupCodeStr    string `bson:"minor_group_code_str" json:"minor_group_code_str"`
	MinorGroupTitle      string `bson:"minor_group_title" json:"minor_group_title"`
	UnitGroupCodeStr     string `bson:"unit_group_code_str" json:"unit_group_code_str"`
	UnitGroupTitle       string `bson:"unit_group_title" json:"unit_group_title"`
}

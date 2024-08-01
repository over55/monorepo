package noc

type NationalOccupationalClassification struct {
	LanguageCode             string `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version                  string `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	Level                    uint8  `bson:"level" json:"level"`                 // Ex: 1
	Code                     uint   `bson:"code" json:"code"`                   // Ex: 1
	CodeStr                  string `bson:"code_str" json:"code_str"`           // Ex: 00001
	BroadCategoryCode        uint   `bson:"broad_category_code" json:"broad_category_code"`
	BroadCategoryCodeStr     string `bson:"broad_category_code_str" json:"broad_category_code_str"`
	BroadCategoryTitle       string `bson:"broad_category_title" json:"broad_category_title"`
	BroadCategoryDescription string `bson:"broad_category_description" json:"broad_category_description"`
	MajorGroupCode           uint   `bson:"major_group_code" json:"major_group_code"`
	MajorGroupCodeStr        string `bson:"major_group_code_str" json:"major_group_code_str"`
	MajorGroupTitle          string `bson:"major_group_title" json:"major_group_title"`
	MajorGroupDescription    string `bson:"major_group_description" json:"major_group_description"`
	SubMinorGroupCode        uint   `bson:"sub_minor_group_code" json:"sub_minor_group_code"`
	SubMinorGroupCodeStr     string `bson:"sub_minor_group_code_str" json:"sub_minor_group_code_str"`
	SubMinorGroupTitle       string `bson:"sub_minor_group_title" json:"sub_minor_group_title"`
	SubMinorGroupDescription string `bson:"sub_minor_group_description" json:"sub_minor_group_description"`
	MinorGroupCode           uint   `bson:"minor_group_code" json:"minor_group_code"`
	MinorGroupCodeStr        string `bson:"minor_group_code_str" json:"minor_group_code_str"`
	MinorGroupTitle          string `bson:"minor_group_title" json:"minor_group_title"`
	MinorGroupDescription    string `bson:"minor_group_description" json:"minor_group_description"`
	UnitGroupCode            uint   `bson:"unit_group_code" json:"unit_group_code"`
	UnitGroupCodeStr         string `bson:"unit_group_code_str" json:"unit_group_code_str"`
	UnitGroupTitle           string `bson:"unit_group_title" json:"unit_group_title"`
	UnitGroupDescription     string `bson:"unit_group_description" json:"unit_group_description"`
	ElementType              string `bson:"element_type" json:"element_type"`
	ElementDescription       string `bson:"element_description" json:"element_description"`
}

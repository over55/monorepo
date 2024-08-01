package noc

type NorthAmericanIndustryClassificationSystem struct {
	LanguageCode string `bson:"language_code" json:"language_code"` // Please use `ISO 639-1` (https://en.wikipedia.org/wiki/ISO_639-1).
	Version      string `bson:"version" json:"version"`             // Ex: "NOC 2021 V1.0"
	// ... TODO
}

package datastore

const (
	AssociateStatusActive   = 1
	AssociateStatusArchived = 2

	AssociateDeactivationReasonNotSpecified  = 0
	AssociateDeactivationReasonOther         = 1
	AssociateDeactivationReasonBlacklisted   = 2
	AssociateDeactivationReasonMoved         = 3
	AssociateDeactivationReasonDeceased      = 4
	AssociateDeactivationReasonDoNotConstact = 5

	AssociateTypeUnassigned  = 1
	AssociateTypeResidential = 2
	AssociateTypeCommercial  = 3

	AssociatePhoneTypeLandline = 1
	AssociatePhoneTypeMobile   = 2
	AssociatePhoneTypeWork     = 3

	AssociateGenderOther          = 1
	AssociateGenderMale           = 2
	AssociateGenderFemale         = 3
	AssociateGenderTransgender    = 4
	AssociateGenderNonBinary      = 5
	AssociateGenderTwoSpirit      = 6
	AssociateGenderPreferNotToSay = 7
	AssociateGenderDoNotKnow      = 8

	AssociateIdentifyAsOther                = 1
	AssociateIdentifyAsPreferNotToSay       = 2
	AssociateIdentifyAsWomen                = 3
	AssociateIdentifyAsNewcomer             = 4
	AssociateIdentifyAsRacializedPerson     = 5
	AssociateIdentifyAsVeteran              = 6
	AssociateIdentifyAsFrancophone          = 7
	AssociateIdentifyAsPersonWithDisability = 8
	AssociateIdentifyAsInuit                = 9
	AssociateIdentifyAsFirstNations         = 10
	AssociateIdentifyAsMetis                = 11

	AssociateIsJobSeekerYes = 1
	AssociateIsJobSeekerNo  = 2

	StatusInCountryOther                      = 1
	StatusInCountryCanadaCitizen              = 2
	StatusInCountryPermanentResident          = 3
	StatusInCountryNaturalizedCanadianCitizen = 4
	StatusInCountryProtectedPersons           = 5
	StatusInCountryPreferNotToSay             = 6
)

var AssociateStateLabels = map[int8]string{
	AssociateStatusActive:   "Active",
	AssociateStatusArchived: "Archived",
}

var AssociateTypeLabels = map[int8]string{
	AssociateTypeResidential: "Residential",
	AssociateTypeCommercial:  "Commercial",
	AssociateTypeUnassigned:  "Unassigned",
}

var AssociateDeactivationReasonLabels = map[int8]string{
	AssociateDeactivationReasonNotSpecified:  "Not Specified",
	AssociateDeactivationReasonOther:         "Other",
	AssociateDeactivationReasonBlacklisted:   "Blacklisted",
	AssociateDeactivationReasonMoved:         "Moved",
	AssociateDeactivationReasonDeceased:      "Deceased",
	AssociateDeactivationReasonDoNotConstact: "Do not contact",
}

var AssociateTelephoneTypeLabels = map[int8]string{
	1: "Landline",
	2: "Mobile",
	3: "Work",
}

var AssociateOrganizationTypeLabels = map[int8]string{
	1: "Unknown",
	2: "Private",
	3: "Non-Profit",
	4: "Government",
}

var AssociateGenderLabels = map[int8]string{
	AssociateGenderOther:          "Other",
	AssociateGenderMale:           "Male",
	AssociateGenderFemale:         "Female",
	AssociateGenderNonBinary:      "Non-Binary",
	AssociateGenderTwoSpirit:      "Two Spirit",
	AssociateGenderPreferNotToSay: "Prefer Not To Say",
	AssociateGenderDoNotKnow:      "Do Not Know",
}

const (
	MaritalStatusOther          = 1
	MaritalStatusMarried        = 2
	MaritalStatusCommonLaw      = 3
	MaritalStatusDivorced       = 4
	MaritalStatusSeparated      = 5
	MaritalStatusWidowed        = 6
	MaritalStatusSingle         = 7
	MaritalStatusPreferNotToSay = 8
)

var AssociateMaritalStatusLabels = map[int8]string{
	MaritalStatusOther:          "Other",
	MaritalStatusMarried:        "Married",
	MaritalStatusCommonLaw:      "Common Law",
	MaritalStatusDivorced:       "Divorced",
	MaritalStatusSeparated:      "Separated",
	MaritalStatusWidowed:        "Widowed",
	MaritalStatusSingle:         "Single",
	MaritalStatusPreferNotToSay: "Prefer not to say",
}

const (
	AccomplishedEducationOther                       = 1
	AccomplishedEducationGrade0To8                   = 2
	AccomplishedEducationGrade9                      = 3
	AccomplishedEducationGrade10                     = 4
	AccomplishedEducationGrade11                     = 5
	AccomplishedEducationGrade12OrEquivalent         = 6
	AccomplishedEducationOAC                         = 7
	AccomplishedEducationCertificateOfApprenticeship = 8
	AccomplishedEducationJourneyperson               = 9
	AccomplishedEducationCertificateOrDiploma        = 10
	AccomplishedEducationBachelorsDegree             = 11
	AccomplishedEducationPostGraduate                = 12
)

var AccomplishedEducationLabels = map[int8]string{
	AccomplishedEducationOther:                       "Other",
	AccomplishedEducationGrade0To8:                   "Grade 0-8",
	AccomplishedEducationGrade9:                      "Grade 9",
	AccomplishedEducationGrade10:                     "Grade 10",
	AccomplishedEducationGrade11:                     "Grade 11",
	AccomplishedEducationGrade12OrEquivalent:         "Grade 12 (or equivalent)",
	AccomplishedEducationOAC:                         "OAC",
	AccomplishedEducationCertificateOfApprenticeship: "Certificate of Apprenticeship",
	AccomplishedEducationJourneyperson:               "Journeyperson",
	AccomplishedEducationCertificateOrDiploma:        "Certificate/Diploma",
	AccomplishedEducationBachelorsDegree:             "Bachelor’s Degree",
	AccomplishedEducationPostGraduate:                "Post graduate",
}

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  TextArea,
  FormGroup,
} from "../../../../components/UI";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/Form";
import {
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_IS_JOB_SEEKER_NO,
  ASSOCIATE_GENDER_OTHER,
  ASSOCIATE_GENDER_MALE,
  ASSOCIATE_GENDER_FEMALE,
  ASSOCIATE_GENDER_PREFER_NOT_TO_SAY,
  ASSOCIATE_IDENTIFY_AS_OTHER,
  ASSOCIATE_IDENTIFY_AS_PREFER_NOT_TO_SAY,
  ASSOCIATE_IDENTIFY_AS_WOMEN,
  ASSOCIATE_IDENTIFY_AS_NEWCOMER,
  ASSOCIATE_IDENTIFY_AS_RACIALIZED_PERSON,
  ASSOCIATE_IDENTIFY_AS_VETERAN,
  ASSOCIATE_IDENTIFY_AS_FRANCOPHONE,
  ASSOCIATE_IDENTIFY_AS_PERSON_WITH_DISABILITY,
  ASSOCIATE_IDENTIFY_AS_INUIT,
  ASSOCIATE_IDENTIFY_AS_FIRST_NATIONS,
  ASSOCIATE_IDENTIFY_AS_METIS,
  ASSOCIATE_STATUS_IN_COUNTRY_CANADIAN_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_MARITAL_STATUS_SINGLE,
  ASSOCIATE_MARITAL_STATUS_MARRIED,
  ASSOCIATE_MARITAL_STATUS_DIVORCED,
  ASSOCIATE_MARITAL_STATUS_WIDOWED,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_EDUCATION_ELEMENTARY,
  ASSOCIATE_EDUCATION_HIGH_SCHOOL,
  ASSOCIATE_EDUCATION_COLLEGE,
  ASSOCIATE_EDUCATION_UNIVERSITY,
  ASSOCIATE_EDUCATION_POST_GRADUATE,
  ASSOCIATE_EDUCATION_OTHER,
} from "../../../../constants/Associate";

function AdminAssociateAddStep6Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Job seeker and metrics form data
  const [isJobSeeker, setIsJobSeeker] = useState(ASSOCIATE_IS_JOB_SEEKER_NO);
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] =
    useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [gender, setGender] = useState(0);
  const [genderOther, setGenderOther] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [identifyAs, setIdentifyAs] = useState([]);
  const [statusInCountry, setStatusInCountry] = useState("");
  const [statusInCountryOther, setStatusInCountryOther] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [dateOfEntryIntoCountry, setDateOfEntryIntoCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [maritalStatusOther, setMaritalStatusOther] = useState("");
  const [accomplishedEducation, setAccomplishedEducation] = useState("");
  const [accomplishedEducationOther, setAccomplishedEducationOther] =
    useState("");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        const associateState = JSON.parse(existing);

        setIsJobSeeker(
          associateState.isJobSeeker || ASSOCIATE_IS_JOB_SEEKER_NO,
        );
        setTags(associateState.tags || []);
        setHowDidYouHearAboutUsID(associateState.howDidYouHearAboutUsID || "");
        setIsHowDidYouHearAboutUsOther(
          associateState.isHowDidYouHearAboutUsOther || false,
        );
        setHowDidYouHearAboutUsOther(
          associateState.howDidYouHearAboutUsOther || "",
        );
        setBirthDate(associateState.birthDate || "");
        setJoinDate(
          associateState.joinDate || new Date().toISOString().split("T")[0],
        );
        setGender(associateState.gender || 0);
        setGenderOther(associateState.genderOther || "");
        setAdditionalComment(associateState.additionalComment || "");
        setIdentifyAs(associateState.identifyAs || []);
        setStatusInCountry(associateState.statusInCountry || "");
        setStatusInCountryOther(associateState.statusInCountryOther || "");
        setCountryOfOrigin(associateState.countryOfOrigin || "");
        setDateOfEntryIntoCountry(associateState.dateOfEntryIntoCountry || "");
        setMaritalStatus(associateState.maritalStatus || "");
        setMaritalStatusOther(associateState.maritalStatusOther || "");
        setAccomplishedEducation(associateState.accomplishedEducation || "");
        setAccomplishedEducationOther(
          associateState.accomplishedEducationOther || "",
        );
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Basic validation
    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "Please specify how you heard about us";
      hasErrors = true;
    } else if (
      isHowDidYouHearAboutUsOther &&
      !howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
      hasErrors = true;
    }

    if (gender === 0) {
      newErrors.gender = "Gender is required";
      hasErrors = true;
    } else if (gender === ASSOCIATE_GENDER_OTHER && !genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
      hasErrors = true;
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
      hasErrors = true;
    }

    if (!isJobSeeker) {
      newErrors.isJobSeeker = "Please specify if this is a job seeker";
      hasErrors = true;
    }

    // Job seeker specific validation
    if (isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES) {
      if (!statusInCountry) {
        newErrors.statusInCountry = "Status in country is required";
        hasErrors = true;
      } else if (
        statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER &&
        !statusInCountryOther.trim()
      ) {
        newErrors.statusInCountryOther = "Please specify other status";
        hasErrors = true;
      }

      if (
        statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
        statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
        statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON
      ) {
        if (!countryOfOrigin) {
          newErrors.countryOfOrigin = "Country of origin is required";
          hasErrors = true;
        }
        if (!dateOfEntryIntoCountry) {
          newErrors.dateOfEntryIntoCountry =
            "Date of entry into country is required";
          hasErrors = true;
        }
      }

      if (!maritalStatus) {
        newErrors.maritalStatus = "Marital status is required";
        hasErrors = true;
      } else if (
        maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER &&
        !maritalStatusOther.trim()
      ) {
        newErrors.maritalStatusOther = "Please specify other marital status";
        hasErrors = true;
      }

      if (!accomplishedEducation) {
        newErrors.accomplishedEducation = "Education level is required";
        hasErrors = true;
      } else if (
        accomplishedEducation === ASSOCIATE_EDUCATION_OTHER &&
        !accomplishedEducationOther.trim()
      ) {
        newErrors.accomplishedEducationOther =
          "Please specify other education level";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      // Scroll to top to show errors
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage
    const associateState = {
      ...getExistingState(),
      isJobSeeker,
      tags,
      howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther,
      birthDate,
      joinDate,
      gender,
      genderOther,
      additionalComment,
      identifyAs,
      statusInCountry,
      statusInCountryOther,
      countryOfOrigin,
      dateOfEntryIntoCountry,
      maritalStatus,
      maritalStatusOther,
      accomplishedEducation,
      accomplishedEducationOther,
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-7");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ general: "Failed to save data. Please try again." });
    }
  };

  const getExistingState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      return existing ? JSON.parse(existing) : {};
    } catch (error) {
      return {};
    }
  };

  const handleHowHearChange = (value) => {
    setHowDidYouHearAboutUsID(value);
    // Clear error when user selects a value
    if (errors.howDidYouHearAboutUsID) {
      setErrors({ ...errors, howDidYouHearAboutUsID: null });
    }
  };

  const handleHowHearOtherDetected = (isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther(""); // Clear other field if not "Other"
    }
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    { label: "New", icon: "➕" },
  ];

  const genderOptions = [
    { value: 0, label: "Please select" },
    { value: ASSOCIATE_GENDER_MALE, label: "Male" },
    { value: ASSOCIATE_GENDER_FEMALE, label: "Female" },
    { value: ASSOCIATE_GENDER_OTHER, label: "Other" },
    { value: ASSOCIATE_GENDER_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
  ];

  const identifyAsOptions = [
    { value: ASSOCIATE_IDENTIFY_AS_WOMEN, label: "Women" },
    { value: ASSOCIATE_IDENTIFY_AS_NEWCOMER, label: "Newcomer" },
    {
      value: ASSOCIATE_IDENTIFY_AS_RACIALIZED_PERSON,
      label: "Racialized Person",
    },
    { value: ASSOCIATE_IDENTIFY_AS_VETERAN, label: "Veteran" },
    { value: ASSOCIATE_IDENTIFY_AS_FRANCOPHONE, label: "Francophone" },
    {
      value: ASSOCIATE_IDENTIFY_AS_PERSON_WITH_DISABILITY,
      label: "Person with Disability",
    },
    { value: ASSOCIATE_IDENTIFY_AS_INUIT, label: "Inuit" },
    { value: ASSOCIATE_IDENTIFY_AS_FIRST_NATIONS, label: "First Nations" },
    { value: ASSOCIATE_IDENTIFY_AS_METIS, label: "Métis" },
    { value: ASSOCIATE_IDENTIFY_AS_OTHER, label: "Other" },
    {
      value: ASSOCIATE_IDENTIFY_AS_PREFER_NOT_TO_SAY,
      label: "Prefer not to say",
    },
  ];

  const statusInCountryOptions = [
    { value: "", label: "Please select" },
    {
      value: ASSOCIATE_STATUS_IN_COUNTRY_CANADIAN_CITIZEN,
      label: "Canadian Citizen",
    },
    {
      value: ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
      label: "Permanent Resident",
    },
    {
      value: ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
      label: "Naturalized Canadian Citizen",
    },
    {
      value: ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON,
      label: "Protected Person",
    },
    { value: ASSOCIATE_STATUS_IN_COUNTRY_OTHER, label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "", label: "Please select" },
    { value: ASSOCIATE_MARITAL_STATUS_SINGLE, label: "Single" },
    { value: ASSOCIATE_MARITAL_STATUS_MARRIED, label: "Married" },
    { value: ASSOCIATE_MARITAL_STATUS_DIVORCED, label: "Divorced" },
    { value: ASSOCIATE_MARITAL_STATUS_WIDOWED, label: "Widowed" },
    { value: ASSOCIATE_MARITAL_STATUS_OTHER, label: "Other" },
  ];

  const educationOptions = [
    { value: "", label: "Please select" },
    { value: ASSOCIATE_EDUCATION_ELEMENTARY, label: "Elementary School" },
    { value: ASSOCIATE_EDUCATION_HIGH_SCHOOL, label: "High School" },
    { value: ASSOCIATE_EDUCATION_COLLEGE, label: "College" },
    { value: ASSOCIATE_EDUCATION_UNIVERSITY, label: "University" },
    { value: ASSOCIATE_EDUCATION_POST_GRADUATE, label: "Post Graduate" },
    { value: ASSOCIATE_EDUCATION_OTHER, label: "Other" },
  ];

  const countryOptions = [
    { value: "", label: "Please select" },
    { value: "Canada", label: "Canada" },
    { value: "United States", label: "United States" },
    { value: "Mexico", label: "Mexico" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "India", label: "India" },
    { value: "China", label: "China" },
    { value: "Philippines", label: "Philippines" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div style={globalStyles.section}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          👷 Associates
        </h1>
        <h2 style={{ fontSize: "1.5rem", color: "#666", marginBottom: "2rem" }}>
          ➕ New Associate
        </h2>
        <hr style={{ marginBottom: "2rem" }} />
      </div>

      {/* Progress Wizard */}
      <Card
        style={{ backgroundColor: theme.colors.light, marginBottom: "2rem" }}
      >
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Step 6 of 7
        </h3>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "86%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          86%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          💼 Job Seeker
        </h2>

        <FormGroup>
          <label
            style={{
              fontWeight: "600",
              fontSize: "1rem",
              marginBottom: "1rem",
              display: "block",
            }}
          >
            Is this Associate also a Job Seeker?
          </label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="radio"
                name="isJobSeeker"
                value={ASSOCIATE_IS_JOB_SEEKER_YES}
                checked={isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES}
                onChange={(e) => setIsJobSeeker(parseInt(e.target.value))}
              />
              Yes
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="radio"
                name="isJobSeeker"
                value={ASSOCIATE_IS_JOB_SEEKER_NO}
                checked={isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_NO}
                onChange={(e) => setIsJobSeeker(parseInt(e.target.value))}
              />
              No
            </label>
          </div>
          {errors.isJobSeeker && (
            <div
              style={{
                color: theme.colors.error,
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.isJobSeeker}
            </div>
          )}
        </FormGroup>

        {/* Job Seeker specific fields */}
        {isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
          <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
            <Select
              label="Status in Country"
              name="statusInCountry"
              value={statusInCountry}
              onChange={(e) => setStatusInCountry(e.target.value)}
              options={statusInCountryOptions}
              error={errors.statusInCountry}
              required
            />

            {statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
              <Input
                label="Status in Country (Other)"
                name="statusInCountryOther"
                placeholder="Please specify"
                value={statusInCountryOther}
                onChange={(e) => setStatusInCountryOther(e.target.value)}
                error={errors.statusInCountryOther}
                required
              />
            )}

            {(statusInCountry ===
              ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
              statusInCountry ===
                ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
              statusInCountry ===
                ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON) && (
              <>
                <Select
                  label="Country of Origin"
                  name="countryOfOrigin"
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  options={countryOptions}
                  error={errors.countryOfOrigin}
                  required
                />

                <Input
                  label="Date of Entry into Country"
                  name="dateOfEntryIntoCountry"
                  type="date"
                  value={dateOfEntryIntoCountry}
                  onChange={(e) => setDateOfEntryIntoCountry(e.target.value)}
                  error={errors.dateOfEntryIntoCountry}
                  required
                />
              </>
            )}

            <Select
              label="Marital Status"
              name="maritalStatus"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              options={maritalStatusOptions}
              error={errors.maritalStatus}
              required
            />

            {maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
              <Input
                label="Marital Status (Other)"
                name="maritalStatusOther"
                placeholder="Please specify"
                value={maritalStatusOther}
                onChange={(e) => setMaritalStatusOther(e.target.value)}
                error={errors.maritalStatusOther}
                required
              />
            )}

            <Select
              label="Accomplished Level of Education"
              name="accomplishedEducation"
              value={accomplishedEducation}
              onChange={(e) => setAccomplishedEducation(e.target.value)}
              options={educationOptions}
              error={errors.accomplishedEducation}
              required
            />

            {accomplishedEducation === ASSOCIATE_EDUCATION_OTHER && (
              <Input
                label="Education Level (Other)"
                name="accomplishedEducationOther"
                placeholder="Please specify"
                value={accomplishedEducationOther}
                onChange={(e) => setAccomplishedEducationOther(e.target.value)}
                error={errors.accomplishedEducationOther}
                required
              />
            )}
          </div>
        )}

        <h2
          style={{
            fontSize: "1.5rem",
            marginTop: "2rem",
            marginBottom: "1rem",
          }}
        >
          📊 Metrics
        </h2>

        {isLoading ? (
          <Loading message="Submitting..." />
        ) : (
          <>
            {errors.general && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {errors.general}
              </Alert>
            )}

            <form onSubmit={onSubmitClick}>
              <div style={{ display: "grid", gap: "1rem", maxWidth: "800px" }}>
                {/* Tags - Using Reusable Component */}
                <div>
                  <TagsMultiSelect
                    value={tags}
                    onChange={setTags}
                    error={errors.tags}
                    required={false}
                    label="Tags (Optional)"
                    helperText="Select tags to categorize this associate"
                    onUnauthorized={onUnauthorized}
                  />
                </div>

                {/* Identity */}
                <div>
                  <label
                    style={{
                      fontWeight: "600",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    Do you identify as belonging to any of the following groups?
                    (Optional)
                  </label>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {identifyAsOptions.map((option) => (
                      <label
                        key={option.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={identifyAs.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIdentifyAs([
                                ...identifyAs,
                                parseInt(e.target.value),
                              ]);
                            } else {
                              setIdentifyAs(
                                identifyAs.filter(
                                  (id) => id !== parseInt(e.target.value),
                                ),
                              );
                            }
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* How did you hear about us - Using Reusable Component */}
                <HowHearAboutUsSelect
                  value={howDidYouHearAboutUsID}
                  onChange={handleHowHearChange}
                  onOtherDetected={handleHowHearOtherDetected}
                  error={errors.howDidYouHearAboutUsID}
                  required={true}
                  helperText="Tell us how you discovered our organization"
                  onUnauthorized={onUnauthorized}
                />

                {/* Show additional input field if "Other" is selected */}
                {isHowDidYouHearAboutUsOther && (
                  <Input
                    label="How did you hear about us? (Other)"
                    name="howDidYouHearAboutUsOther"
                    placeholder="Please specify"
                    value={howDidYouHearAboutUsOther}
                    onChange={(e) =>
                      setHowDidYouHearAboutUsOther(e.target.value)
                    }
                    error={errors.howDidYouHearAboutUsOther}
                    required
                  />
                )}

                <Select
                  label="Gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(parseInt(e.target.value))}
                  options={genderOptions}
                  error={errors.gender}
                  required
                />

                {gender === ASSOCIATE_GENDER_OTHER && (
                  <Input
                    label="Gender (Other)"
                    name="genderOther"
                    placeholder="Please specify"
                    value={genderOther}
                    onChange={(e) => setGenderOther(e.target.value)}
                    error={errors.genderOther}
                    required
                  />
                )}

                <Input
                  label="Birth Date"
                  name="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  error={errors.birthDate}
                  required
                />

                <Input
                  label="Join Date"
                  name="joinDate"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  error={errors.joinDate}
                  helperText="The date this associate joined the organization"
                />

                <TextArea
                  label="Additional Comment (Optional)"
                  name="additionalComment"
                  placeholder="Enter any additional comments or notes about this associate"
                  value={additionalComment}
                  onChange={(e) => setAdditionalComment(e.target.value)}
                  error={errors.additionalComment}
                  rows={4}
                  maxLength={638}
                  helperText="Any additional information that might be relevant"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/admin/associates/add/step-5"
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  <Button type="button" variant="secondary" fullWidth>
                    ← Back
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  Next →
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateAddStep6Page;

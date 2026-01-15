// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step6Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep6Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChartPieIcon,
  BriefcaseIcon,
  UserIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  IdentificationIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  FlagIcon,
  GlobeAltIcon,
  HeartIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  RadioGroup,
  DatePicker,
  Textarea,
  CheckboxGroup,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/business/selects";
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
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_EDUCATION_OTHER,
  ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../constants/Associate";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

// Gender options
const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: ASSOCIATE_GENDER_MALE, label: "Male" },
  { value: ASSOCIATE_GENDER_FEMALE, label: "Female" },
  { value: ASSOCIATE_GENDER_OTHER, label: "Other" },
  { value: ASSOCIATE_GENDER_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

// Job seeker options for RadioGroup
const JOB_SEEKER_OPTIONS = [
  { value: String(ASSOCIATE_IS_JOB_SEEKER_YES), label: "Yes" },
  { value: String(ASSOCIATE_IS_JOB_SEEKER_NO), label: "No" },
];

// Identity group options for CheckboxGroup
const IDENTITY_OPTIONS = [
  { value: ASSOCIATE_IDENTIFY_AS_WOMEN, label: "Women" },
  { value: ASSOCIATE_IDENTIFY_AS_NEWCOMER, label: "Newcomer" },
  { value: ASSOCIATE_IDENTIFY_AS_RACIALIZED_PERSON, label: "Racialized Person" },
  { value: ASSOCIATE_IDENTIFY_AS_VETERAN, label: "Veteran" },
  { value: ASSOCIATE_IDENTIFY_AS_FRANCOPHONE, label: "Francophone" },
  { value: ASSOCIATE_IDENTIFY_AS_PERSON_WITH_DISABILITY, label: "Person with Disability" },
  { value: ASSOCIATE_IDENTIFY_AS_INUIT, label: "Inuit" },
  { value: ASSOCIATE_IDENTIFY_AS_FIRST_NATIONS, label: "First Nations" },
  { value: ASSOCIATE_IDENTIFY_AS_METIS, label: "Métis" },
  { value: ASSOCIATE_IDENTIFY_AS_OTHER, label: "Other" },
  { value: ASSOCIATE_IDENTIFY_AS_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

// Country options
const COUNTRY_OPTIONS = [
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

// Memoized content component
const Step6Content = memo(function Step6Content() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Get existing associate data from sessionStorage
  const [associateData, setAssociateData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form data
  const [isJobSeeker, setIsJobSeeker] = useState(associateData.isJobSeeker || ASSOCIATE_IS_JOB_SEEKER_NO);
  const [tags, setTags] = useState(associateData.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(associateData.howDidYouHearAboutUsID || "");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] = useState(associateData.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(associateData.howDidYouHearAboutUsOther || "");
  const [birthDate, setBirthDate] = useState(associateData.birthDate || "");
  const [joinDate, setJoinDate] = useState(associateData.joinDate || new Date().toISOString().split("T")[0]);
  const [gender, setGender] = useState(associateData.gender || 0);
  const [genderOther, setGenderOther] = useState(associateData.genderOther || "");
  const [additionalComment, setAdditionalComment] = useState(associateData.additionalComment || "");
  const [identifyAs, setIdentifyAs] = useState(associateData.identifyAs || []);

  // Job seeker specific fields
  const [statusInCountry, setStatusInCountry] = useState(associateData.statusInCountry || 0);
  const [statusInCountryOther, setStatusInCountryOther] = useState(associateData.statusInCountryOther || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(associateData.countryOfOrigin || "");
  const [dateOfEntryIntoCountry, setDateOfEntryIntoCountry] = useState(associateData.dateOfEntryIntoCountry || "");
  const [maritalStatus, setMaritalStatus] = useState(associateData.maritalStatus || 0);
  const [maritalStatusOther, setMaritalStatusOther] = useState(associateData.maritalStatusOther || "");
  const [accomplishedEducation, setAccomplishedEducation] = useState(associateData.accomplishedEducation || 0);
  const [accomplishedEducationOther, setAccomplishedEducationOther] = useState(associateData.accomplishedEducationOther || "");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    if (!saved) {
      navigate("/admin/associates/add/step-1-search");
    }
  }, [authManager, navigate]);

  // Check if country/entry fields are required
  const requiresCountryInfo = useMemo(() => {
    return (
      statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
      statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
      statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON
    );
  }, [statusInCountry]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // How did you hear about us validation
    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID = "Please specify how you heard about us";
    } else if (isHowDidYouHearAboutUsOther && !howDidYouHearAboutUsOther.trim()) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }

    // Gender validation
    if (gender === 0) {
      newErrors.gender = "Gender is required";
    } else if (gender === ASSOCIATE_GENDER_OTHER && !genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
    }

    // Birth date validation
    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    // Job seeker validation
    if (isJobSeeker !== ASSOCIATE_IS_JOB_SEEKER_YES && isJobSeeker !== ASSOCIATE_IS_JOB_SEEKER_NO) {
      newErrors.isJobSeeker = "Please specify if this is a job seeker";
    }

    // Job seeker specific validation
    if (isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES) {
      if (statusInCountry === 0) {
        newErrors.statusInCountry = "Status in country is required";
      } else if (statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && !statusInCountryOther.trim()) {
        newErrors.statusInCountryOther = "Please specify other status";
      }

      if (requiresCountryInfo) {
        if (!countryOfOrigin) {
          newErrors.countryOfOrigin = "Country of origin is required";
        }
        if (!dateOfEntryIntoCountry) {
          newErrors.dateOfEntryIntoCountry = "Date of entry into country is required";
        }
      }

      if (maritalStatus === 0) {
        newErrors.maritalStatus = "Marital status is required";
      } else if (maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && !maritalStatusOther.trim()) {
        newErrors.maritalStatusOther = "Please specify other marital status";
      }

      if (accomplishedEducation === 0) {
        newErrors.accomplishedEducation = "Education level is required";
      } else if (accomplishedEducation === ASSOCIATE_EDUCATION_OTHER && !accomplishedEducationOther.trim()) {
        newErrors.accomplishedEducationOther = "Please specify other education level";
      }
    }

    return newErrors;
  }, [
    howDidYouHearAboutUsID, isHowDidYouHearAboutUsOther, howDidYouHearAboutUsOther,
    gender, genderOther, birthDate, isJobSeeker, statusInCountry, statusInCountryOther,
    requiresCountryInfo, countryOfOrigin, dateOfEntryIntoCountry,
    maritalStatus, maritalStatusOther, accomplishedEducation, accomplishedEducationOther
  ]);

  // Handle form submission
  const handleNext = useCallback(() => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      return;
    }

    setErrors({});

    // Save data to sessionStorage
    const updatedAssociateData = {
      ...associateData,
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

    sessionStorage.setItem("WORKERY_ASSOCIATE_CREATION_STATE", JSON.stringify(updatedAssociateData));
    setAssociateData(updatedAssociateData);
    navigate("/admin/associates/add/step-7");
  }, [
    validateForm, associateData, isJobSeeker, tags, howDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther, howDidYouHearAboutUsOther, birthDate, joinDate,
    gender, genderOther, additionalComment, identifyAs, statusInCountry,
    statusInCountryOther, countryOfOrigin, dateOfEntryIntoCountry,
    maritalStatus, maritalStatusOther, accomplishedEducation, accomplishedEducationOther, navigate
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-5");
  }, [navigate]);

  // Stable onChange handlers
  const handleJobSeekerChange = useCallback((value) => setIsJobSeeker(parseInt(value)), []);
  const handleGenderChange = useCallback((value) => setGender(parseInt(value)), []);
  const handleGenderOtherChange = useCallback((value) => setGenderOther(value), []);
  const handleBirthDateChange = useCallback((value) => setBirthDate(value), []);
  const handleJoinDateChange = useCallback((value) => setJoinDate(value), []);
  const handleAdditionalCommentChange = useCallback((value) => setAdditionalComment(value), []);
  const handleHowHearOtherChange = useCallback((value) => setHowDidYouHearAboutUsOther(value), []);

  // Job seeker field handlers
  const handleStatusInCountryChange = useCallback((value) => setStatusInCountry(parseInt(value)), []);
  const handleStatusInCountryOtherChange = useCallback((value) => setStatusInCountryOther(value), []);
  const handleCountryOfOriginChange = useCallback((value) => setCountryOfOrigin(value), []);
  const handleDateOfEntryChange = useCallback((value) => setDateOfEntryIntoCountry(value), []);
  const handleMaritalStatusChange = useCallback((value) => setMaritalStatus(parseInt(value)), []);
  const handleMaritalStatusOtherChange = useCallback((value) => setMaritalStatusOther(value), []);
  const handleEducationChange = useCallback((value) => setAccomplishedEducation(parseInt(value)), []);
  const handleEducationOtherChange = useCallback((value) => setAccomplishedEducationOther(value), []);

  const handleHowHearChange = useCallback((value) => {
    setHowDidYouHearAboutUsID(value);
    if (errors.howDidYouHearAboutUsID) {
      setErrors((prev) => ({ ...prev, howDidYouHearAboutUsID: null }));
    }
  }, [errors.howDidYouHearAboutUsID]);

  const handleHowHearOtherDetected = useCallback((isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther("");
    }
  }, []);

  const handleIdentifyAsChange = useCallback((values) => {
    setIdentifyAs(values.map(v => parseInt(v)));
  }, []);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: isLoading ? "Saving..." : "Next",
      variant: "primary",
      onClick: handleNext,
      disabled: isLoading,
      loading: isLoading,
    },
  ], [handleCancel, handleNext, isLoading]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={6}
        wizardTitle="Add New Associate"
        wizardIcon={UserPlusIcon}
        stepTitle="Metrics & Demographics"
        stepSubtitle="Provide metrics and demographic information for the associate"
        stepIcon={ChartPieIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={isLoading}
        actions={actions}
        onCancel={handleCancel}
        onBack={handleBack}
        actionLayout="end"
      >
        <div className="space-y-8">
          {/* Job Seeker Section */}
          <FormCard
            title="Job Seeker Information"
            subtitle="Specify if this associate is seeking employment opportunities"
            icon={BriefcaseIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              <RadioGroup
                id="isJobSeeker"
                label="Is this Associate also a Job Seeker?"
                name="isJobSeeker"
                value={String(isJobSeeker)}
                onChange={handleJobSeekerChange}
                options={JOB_SEEKER_OPTIONS}
                icon={BriefcaseIcon}
                required
                error={errors.isJobSeeker}
                layout="horizontal"
              />

              {/* Conditional Job Seeker Fields */}
              {isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                <div className="mt-4 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Status in Country"
                      value={statusInCountry}
                      onChange={handleStatusInCountryChange}
                      options={ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS}
                      icon={FlagIcon}
                      required
                      error={errors.statusInCountry}
                    />

                    {statusInCountry === ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                      <Input
                        label="Status in Country (Other)"
                        value={statusInCountryOther}
                        onChange={handleStatusInCountryOtherChange}
                        placeholder="Please specify"
                        required
                        error={errors.statusInCountryOther}
                      />
                    )}
                  </div>

                  {requiresCountryInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Country of Origin"
                        value={countryOfOrigin}
                        onChange={handleCountryOfOriginChange}
                        options={COUNTRY_OPTIONS}
                        icon={GlobeAltIcon}
                        required
                        error={errors.countryOfOrigin}
                      />

                      <DatePicker
                        label="Date of Entry into Country"
                        value={dateOfEntryIntoCountry}
                        onChange={handleDateOfEntryChange}
                        placeholder="Select date"
                        required
                        error={errors.dateOfEntryIntoCountry}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Marital Status"
                      value={maritalStatus}
                      onChange={handleMaritalStatusChange}
                      options={ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS}
                      icon={HeartIcon}
                      required
                      error={errors.maritalStatus}
                    />

                    {maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                      <Input
                        label="Marital Status (Other)"
                        value={maritalStatusOther}
                        onChange={handleMaritalStatusOtherChange}
                        placeholder="Please specify"
                        required
                        error={errors.maritalStatusOther}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Accomplished Level of Education"
                      value={accomplishedEducation}
                      onChange={handleEducationChange}
                      options={ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS}
                      icon={AcademicCapIcon}
                      required
                      error={errors.accomplishedEducation}
                    />

                    {accomplishedEducation === ASSOCIATE_EDUCATION_OTHER && (
                      <Input
                        label="Education Level (Other)"
                        value={accomplishedEducationOther}
                        onChange={handleEducationOtherChange}
                        placeholder="Please specify"
                        required
                        error={errors.accomplishedEducationOther}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormCard>

          {/* Personal Information Section */}
          <FormCard
            title="Personal Information"
            subtitle="Demographic and personal details"
            icon={UserIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              {/* Tags */}
              <TagsMultiSelect
                value={tags}
                onChange={setTags}
                error={errors.tags}
                required={false}
                label="Tags (Optional)"
                helperText="Select tags to categorize this associate"
                onUnauthorized={() => navigate("/login?unauthorized=true")}
              />

              {/* How did you hear about us */}
              <HowHearAboutUsSelect
                value={howDidYouHearAboutUsID}
                onChange={handleHowHearChange}
                onOtherDetected={handleHowHearOtherDetected}
                error={errors.howDidYouHearAboutUsID}
                required={true}
                label="How did you hear about us?"
                helperText="Tell us how you discovered our organization"
                onUnauthorized={() => navigate("/login?unauthorized=true")}
              />

              {/* Show additional input field if "Other" is selected */}
              {isHowDidYouHearAboutUsOther && (
                <Input
                  label="How did you hear about us? (Other)"
                  value={howDidYouHearAboutUsOther}
                  onChange={handleHowHearOtherChange}
                  placeholder="Please specify"
                  required
                  error={errors.howDidYouHearAboutUsOther}
                />
              )}

              {/* Identity Groups */}
              <CheckboxGroup
                id="identifyAs"
                label="Do you identify as belonging to any of the following groups? (Optional)"
                options={IDENTITY_OPTIONS}
                value={identifyAs}
                onChange={handleIdentifyAsChange}
                icon={IdentificationIcon}
              />

              {/* Gender and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Gender"
                  value={gender}
                  onChange={handleGenderChange}
                  options={GENDER_OPTIONS}
                  icon={UserIcon}
                  required
                  error={errors.gender}
                />

                {gender === ASSOCIATE_GENDER_OTHER && (
                  <Input
                    label="Gender (Other)"
                    value={genderOther}
                    onChange={handleGenderOtherChange}
                    placeholder="Please specify"
                    icon={UserIcon}
                    required
                    error={errors.genderOther}
                  />
                )}

                <DatePicker
                  label="Birth Date"
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  placeholder="Select date"
                  required
                  error={errors.birthDate}
                />

                <DatePicker
                  label="Join Date"
                  value={joinDate}
                  onChange={handleJoinDateChange}
                  placeholder="Select date"
                  helperText="The date this associate joined the organization"
                />
              </div>

              {/* Additional Comments */}
              <Textarea
                label="Additional Comment (Optional)"
                value={additionalComment}
                onChange={handleAdditionalCommentChange}
                placeholder="Enter any additional comments or notes about this associate"
                maxLength={638}
                rows={4}
                helperText={`${additionalComment.length}/638 characters`}
                icon={ChatBubbleBottomCenterTextIcon}
              />
            </div>
          </FormCard>
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Your Associate record will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Step6Content.displayName = 'Step6Content';

function AdminAssociateAddStep6Page() {
  return (
    <UIXThemeProvider>
      <Step6Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep6Page;

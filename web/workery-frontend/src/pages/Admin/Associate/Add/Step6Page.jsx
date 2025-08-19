// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  TagIcon,
  IdentificationIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  HeartIcon,
  FlagIcon,
  QuestionMarkCircleIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
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
  const [showCancelWarning, setShowCancelWarning] = useState(false);

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
  const [statusInCountry, setStatusInCountry] = useState(0);
  const [statusInCountryOther, setStatusInCountryOther] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [dateOfEntryIntoCountry, setDateOfEntryIntoCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState(0);
  const [maritalStatusOther, setMaritalStatusOther] = useState("");
  const [accomplishedEducation, setAccomplishedEducation] = useState(0);
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
        // Ensure numeric values are parsed as integers
        setStatusInCountry(
          associateState.statusInCountry
            ? parseInt(associateState.statusInCountry)
            : 0,
        );
        setStatusInCountryOther(associateState.statusInCountryOther || "");
        setCountryOfOrigin(associateState.countryOfOrigin || "");
        setDateOfEntryIntoCountry(associateState.dateOfEntryIntoCountry || "");
        setMaritalStatus(
          associateState.maritalStatus
            ? parseInt(associateState.maritalStatus)
            : 0,
        );
        setMaritalStatusOther(associateState.maritalStatusOther || "");
        setAccomplishedEducation(
          associateState.accomplishedEducation
            ? parseInt(associateState.accomplishedEducation)
            : 0,
        );
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

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates");
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
      if (!statusInCountry || statusInCountry === 0) {
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

      if (!maritalStatus || maritalStatus === 0) {
        newErrors.maritalStatus = "Marital status is required";
        hasErrors = true;
      } else if (
        maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER &&
        !maritalStatusOther.trim()
      ) {
        newErrors.maritalStatusOther = "Please specify other marital status";
        hasErrors = true;
      }

      if (!accomplishedEducation || accomplishedEducation === 0) {
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
    { value: 0, label: "Please select" },
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
    { value: 0, label: "Please select" },
    { value: ASSOCIATE_MARITAL_STATUS_SINGLE, label: "Single" },
    { value: ASSOCIATE_MARITAL_STATUS_MARRIED, label: "Married" },
    { value: ASSOCIATE_MARITAL_STATUS_DIVORCED, label: "Divorced" },
    { value: ASSOCIATE_MARITAL_STATUS_WIDOWED, label: "Widowed" },
    { value: ASSOCIATE_MARITAL_STATUS_OTHER, label: "Other" },
  ];

  const educationOptions = [
    { value: 0, label: "Please select" },
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/associates"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Associates
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-7 h-7 mr-3 text-blue-600" />
            Add New Associate
          </h1>
        </div>

        {/* Wizard Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-5 Complete */}
              {[1, 2, 3, 4, 5].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                        {step === 4 && "Address"}
                        {step === 5 && "Account"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 6 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Metrics</p>
                  <p className="text-xs text-gray-500">Performance</p>
                </div>
              </div>

              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {errors.general}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Metrics Information
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-3xl mx-auto">
                <div className="space-y-8">
                  {/* Job Seeker Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Job Seeker Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Is this Associate also a Job Seeker?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="isJobSeeker"
                              value={ASSOCIATE_IS_JOB_SEEKER_YES}
                              checked={
                                isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES
                              }
                              onChange={(e) =>
                                setIsJobSeeker(parseInt(e.target.value))
                              }
                              className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Yes
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="isJobSeeker"
                              value={ASSOCIATE_IS_JOB_SEEKER_NO}
                              checked={
                                isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_NO
                              }
                              onChange={(e) =>
                                setIsJobSeeker(parseInt(e.target.value))
                              }
                              className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              No
                            </span>
                          </label>
                        </div>
                        {errors.isJobSeeker && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.isJobSeeker}
                          </p>
                        )}
                      </div>

                      {/* Conditional Job Seeker Fields */}
                      {isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <FlagIcon className="w-4 h-4 inline mr-1" />
                              Status in Country{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={statusInCountry}
                              onChange={(e) =>
                                setStatusInCountry(
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.statusInCountry
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {statusInCountryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {errors.statusInCountry && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.statusInCountry}
                              </p>
                            )}
                          </div>

                          {statusInCountry ===
                            ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status in Country (Other){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={statusInCountryOther}
                                onChange={(e) =>
                                  setStatusInCountryOther(e.target.value)
                                }
                                placeholder="Please specify"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.statusInCountryOther
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.statusInCountryOther && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.statusInCountryOther}
                                </p>
                              )}
                            </div>
                          )}

                          {(statusInCountry ===
                            ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                            statusInCountry ===
                              ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
                            statusInCountry ===
                              ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON) && (
                            <>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                                  Country of Origin{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={countryOfOrigin}
                                  onChange={(e) =>
                                    setCountryOfOrigin(e.target.value)
                                  }
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.countryOfOrigin
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {countryOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                {errors.countryOfOrigin && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.countryOfOrigin}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                                  Date of Entry into Country{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  value={dateOfEntryIntoCountry}
                                  onChange={(e) =>
                                    setDateOfEntryIntoCountry(e.target.value)
                                  }
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.dateOfEntryIntoCountry
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {errors.dateOfEntryIntoCountry && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors.dateOfEntryIntoCountry}
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <HeartIcon className="w-4 h-4 inline mr-1" />
                              Marital Status{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={maritalStatus}
                              onChange={(e) =>
                                setMaritalStatus(parseInt(e.target.value) || 0)
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.maritalStatus
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {maritalStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {errors.maritalStatus && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.maritalStatus}
                              </p>
                            )}
                          </div>

                          {maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Marital Status (Other){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={maritalStatusOther}
                                onChange={(e) =>
                                  setMaritalStatusOther(e.target.value)
                                }
                                placeholder="Please specify"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.maritalStatusOther
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.maritalStatusOther && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.maritalStatusOther}
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                              Accomplished Level of Education{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={accomplishedEducation}
                              onChange={(e) =>
                                setAccomplishedEducation(
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.accomplishedEducation
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {educationOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {errors.accomplishedEducation && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.accomplishedEducation}
                              </p>
                            )}
                          </div>

                          {accomplishedEducation ===
                            ASSOCIATE_EDUCATION_OTHER && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Education Level (Other){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={accomplishedEducationOther}
                                onChange={(e) =>
                                  setAccomplishedEducationOther(e.target.value)
                                }
                                placeholder="Please specify"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.accomplishedEducationOther
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.accomplishedEducationOther && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.accomplishedEducationOther}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Personal Information
                    </h3>

                    <div className="space-y-4">
                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <TagIcon className="w-4 h-4 inline mr-1" />
                          Tags (Optional)
                        </label>
                        <TagsMultiSelect
                          value={tags}
                          onChange={setTags}
                          error={errors.tags}
                          required={false}
                          helperText="Select tags to categorize this associate"
                          onUnauthorized={onUnauthorized}
                        />
                      </div>

                      {/* Identity Groups */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IdentificationIcon className="w-4 h-4 inline mr-1" />
                          Do you identify as belonging to any of the following
                          groups? (Optional)
                        </label>
                        <div className="space-y-2 ml-6">
                          {identifyAsOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center text-sm text-gray-700"
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
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* How did you hear about us */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <QuestionMarkCircleIcon className="w-4 h-4 inline mr-1" />
                          How did you hear about us?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <HowHearAboutUsSelect
                          value={howDidYouHearAboutUsID}
                          onChange={handleHowHearChange}
                          onOtherDetected={handleHowHearOtherDetected}
                          error={errors.howDidYouHearAboutUsID}
                          required={true}
                          helperText="Tell us how you discovered our organization"
                          onUnauthorized={onUnauthorized}
                        />
                      </div>

                      {/* Show additional input field if "Other" is selected */}
                      {isHowDidYouHearAboutUsOther && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            How did you hear about us? (Other){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={howDidYouHearAboutUsOther}
                            onChange={(e) =>
                              setHowDidYouHearAboutUsOther(e.target.value)
                            }
                            placeholder="Please specify"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.howDidYouHearAboutUsOther
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.howDidYouHearAboutUsOther && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.howDidYouHearAboutUsOther}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <UserIcon className="w-4 h-4 inline mr-1" />
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.gender ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.gender}
                          </p>
                        )}
                      </div>

                      {gender === ASSOCIATE_GENDER_OTHER && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender (Other){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={genderOther}
                            onChange={(e) => setGenderOther(e.target.value)}
                            placeholder="Please specify"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.genderOther
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.genderOther && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.genderOther}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Birth Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Birth Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.birthDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.birthDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.birthDate}
                          </p>
                        )}
                      </div>

                      {/* Join Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Join Date
                        </label>
                        <input
                          type="date"
                          value={joinDate}
                          onChange={(e) => setJoinDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          The date this associate joined the organization
                        </p>
                      </div>

                      {/* Additional Comments */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <ChatBubbleBottomCenterTextIcon className="w-4 h-4 inline mr-1" />
                          Additional Comment (Optional)
                        </label>
                        <textarea
                          value={additionalComment}
                          onChange={(e) => setAdditionalComment(e.target.value)}
                          placeholder="Enter any additional comments or notes about this associate"
                          rows={4}
                          maxLength={638}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {additionalComment.length}/638 characters
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex gap-3">
                  <Link
                    to="/admin/associates/add/step-5"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Your Associate record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssociateAddStep6Page;

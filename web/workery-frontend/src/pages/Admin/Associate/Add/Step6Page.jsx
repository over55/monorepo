// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
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

// Section Component with Dark Header Pattern - Moved outside to prevent re-creation
const DetailSection = ({ title, icon: Icon, children, description }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-gray-300">{description}</p>
      )}
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

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
    window.scrollTo(0, 0);
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

        setStatusInCountry(
          associateState.statusInCountry !== undefined &&
            associateState.statusInCountry !== null
            ? parseInt(associateState.statusInCountry)
            : 0,
        );
        setStatusInCountryOther(associateState.statusInCountryOther || "");
        setCountryOfOrigin(associateState.countryOfOrigin || "");
        setDateOfEntryIntoCountry(associateState.dateOfEntryIntoCountry || "");
        setMaritalStatus(
          associateState.maritalStatus !== undefined &&
            associateState.maritalStatus !== null
            ? parseInt(associateState.maritalStatus)
            : 0,
        );
        setMaritalStatusOther(associateState.maritalStatusOther || "");
        setAccomplishedEducation(
          associateState.accomplishedEducation !== undefined &&
            associateState.accomplishedEducation !== null
            ? parseInt(associateState.accomplishedEducation)
            : 0,
        );
        setAccomplishedEducationOther(
          associateState.accomplishedEducationOther || "",
        );
      } else {
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

    if (
      isJobSeeker !== ASSOCIATE_IS_JOB_SEEKER_YES &&
      isJobSeeker !== ASSOCIATE_IS_JOB_SEEKER_NO
    ) {
      newErrors.isJobSeeker = "Please specify if this is a job seeker";
      hasErrors = true;
    }

    // Job seeker specific validation
    if (isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES) {
      if (statusInCountry === 0) {
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
        if (!countryOfOrigin || countryOfOrigin === "") {
          newErrors.countryOfOrigin = "Country of origin is required";
          hasErrors = true;
        }
        if (!dateOfEntryIntoCountry) {
          newErrors.dateOfEntryIntoCountry =
            "Date of entry into country is required";
          hasErrors = true;
        }
      }

      if (maritalStatus === 0) {
        newErrors.maritalStatus = "Marital status is required";
        hasErrors = true;
      } else if (
        maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER &&
        !maritalStatusOther.trim()
      ) {
        newErrors.maritalStatusOther = "Please specify other marital status";
        hasErrors = true;
      }

      if (accomplishedEducation === 0) {
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
    if (errors.howDidYouHearAboutUsID) {
      setErrors({ ...errors, howDidYouHearAboutUsID: null });
    }
  };

  const handleHowHearOtherDetected = (isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther("");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <Link
                  to="/admin/associates"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Associates</span>
                    <span className="sm:hidden">Assoc</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Associate
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Provide metrics and demographic information for the associate
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 6: Metrics
                  </p>
                  <p className="text-xs text-gray-500">Performance Data</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">6 of 7</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "86%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-5 Complete */}
              {[1, 2, 3, 4, 5].map((step) => (
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
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
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
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={onSubmitClick}>
          {isLoading ? (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Job Seeker Section */}
              <DetailSection
                title="Job Seeker Information"
                icon={BriefcaseIcon}
                description="Specify if this associate is seeking employment opportunities"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Is this Associate also a Job Seeker?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isJobSeeker"
                          value={ASSOCIATE_IS_JOB_SEEKER_YES}
                          checked={isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES}
                          onChange={(e) =>
                            setIsJobSeeker(parseInt(e.target.value))
                          }
                          className="form-radio h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700">
                          Yes
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isJobSeeker"
                          value={ASSOCIATE_IS_JOB_SEEKER_NO}
                          checked={isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_NO}
                          onChange={(e) =>
                            setIsJobSeeker(parseInt(e.target.value))
                          }
                          className="form-radio h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.isJobSeeker && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.isJobSeeker}
                      </p>
                    )}
                  </div>

                  {/* Conditional Job Seeker Fields */}
                  {isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES && (
                    <div className="mt-4 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            <FlagIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                            Status in Country{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={statusInCountry}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              setStatusInCountry(value);
                              if (value !== 0 && errors.statusInCountry) {
                                const newErrors = { ...errors };
                                delete newErrors.statusInCountry;
                                setErrors(newErrors);
                              }
                            }}
                            className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white ${
                              errors.statusInCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            {ASSOCIATE_STATUS_IN_COUNTRY_OPTIONS_WITH_EMPTY_OPTIONS.map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>
                          {errors.statusInCountry && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.statusInCountry}
                            </p>
                          )}
                        </div>

                        {statusInCountry ===
                          ASSOCIATE_STATUS_IN_COUNTRY_OTHER && (
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                              className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                                errors.statusInCountryOther
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.statusInCountryOther && (
                              <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.statusInCountryOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {(statusInCountry ===
                        ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT ||
                        statusInCountry ===
                          ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN ||
                        statusInCountry ===
                          ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              <GlobeAltIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                              Country of Origin{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={countryOfOrigin}
                              onChange={(e) =>
                                setCountryOfOrigin(e.target.value)
                              }
                              className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white ${
                                errors.countryOfOrigin
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {countryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {errors.countryOfOrigin && (
                              <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.countryOfOrigin}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                              Date of Entry into Country{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={dateOfEntryIntoCountry}
                              onChange={(e) =>
                                setDateOfEntryIntoCountry(e.target.value)
                              }
                              className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                                errors.dateOfEntryIntoCountry
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.dateOfEntryIntoCountry && (
                              <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.dateOfEntryIntoCountry}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            <HeartIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                            Marital Status{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={maritalStatus}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              setMaritalStatus(value);
                              if (value !== 0 && errors.maritalStatus) {
                                const newErrors = { ...errors };
                                delete newErrors.maritalStatus;
                                setErrors(newErrors);
                              }
                            }}
                            className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white ${
                              errors.maritalStatus
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            {ASSOCIATE_MARITAL_STATUS_OPTIONS_WITH_EMPTY_OPTIONS.map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>
                          {errors.maritalStatus && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.maritalStatus}
                            </p>
                          )}
                        </div>

                        {maritalStatus === ASSOCIATE_MARITAL_STATUS_OTHER && (
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                              className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                                errors.maritalStatusOther
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.maritalStatusOther && (
                              <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.maritalStatusOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            <AcademicCapIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                            Accomplished Level of Education{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={accomplishedEducation}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              setAccomplishedEducation(value);
                              if (value !== 0 && errors.accomplishedEducation) {
                                const newErrors = { ...errors };
                                delete newErrors.accomplishedEducation;
                                setErrors(newErrors);
                              }
                            }}
                            className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white ${
                              errors.accomplishedEducation
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            {ASSOCIATE_ACCOMPLISHED_EDUCATION_OPTIONS_WITH_EMPTY_OPTIONS.map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>
                          {errors.accomplishedEducation && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.accomplishedEducation}
                            </p>
                          )}
                        </div>

                        {accomplishedEducation ===
                          ASSOCIATE_EDUCATION_OTHER && (
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                              className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                                errors.accomplishedEducationOther
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.accomplishedEducationOther && (
                              <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.accomplishedEducationOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Personal Information Section */}
              <DetailSection
                title="Personal Information"
                icon={UserIcon}
                description="Demographic and personal details"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Tags */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <TagIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
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

                  {/* How did you hear about us */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <QuestionMarkCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
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

                  {isHowDidYouHearAboutUsOther && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                          errors.howDidYouHearAboutUsOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.howDidYouHearAboutUsOther && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.howDidYouHearAboutUsOther}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Identity Groups */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <IdentificationIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                      Do you identify as belonging to any of the following
                      groups? (Optional)
                    </label>
                    <div className="space-y-2 ml-2 sm:ml-6">
                      {identifyAsOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center text-xs sm:text-sm text-gray-700"
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
                            className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gender and Birth Date Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={String(gender)}
                        onChange={(e) => setGender(parseInt(e.target.value))}
                        className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white ${
                          errors.gender ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {genderOptions.map((option) => (
                          <option
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    {gender === ASSOCIATE_GENDER_OTHER && (
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Gender (Other) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={genderOther}
                          onChange={(e) => setGenderOther(e.target.value)}
                          placeholder="Please specify"
                          className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                            errors.genderOther
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.genderOther && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.genderOther}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                        Birth Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                          errors.birthDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.birthDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.birthDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                        Join Date
                      </label>
                      <input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The date this associate joined the organization
                      </p>
                    </div>
                  </div>

                  {/* Additional Comments */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <ChatBubbleBottomCenterTextIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                      Additional Comment (Optional)
                    </label>
                    <textarea
                      value={additionalComment}
                      onChange={(e) => setAdditionalComment(e.target.value)}
                      placeholder="Enter any additional comments or notes about this associate"
                      rows={4}
                      maxLength={638}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {additionalComment.length}/638 characters
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/associates/add/step-5" className="flex-1">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Cancel Confirmation Modal - Responsive */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-sm sm:text-base text-gray-600">
                Your Associate record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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

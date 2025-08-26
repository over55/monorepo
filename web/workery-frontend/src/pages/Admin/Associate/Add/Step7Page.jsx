// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step7Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  HomeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
  ServiceFeeDisplay,
  InsuranceRequirementsDisplay,
} from "../../../../components/business/displays";
import {
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_IS_JOB_SEEKER_NO,
  ASSOCIATE_GENDER_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_OTHER,
  ASSOCIATE_STATUS_IN_COUNTRY_PERMANENT_RESIDENT,
  ASSOCIATE_STATUS_IN_COUNTRY_NATURALIZED_CITIZEN,
  ASSOCIATE_STATUS_IN_COUNTRY_PROTECTED_PERSON,
  ASSOCIATE_MARITAL_STATUS_OTHER,
  ASSOCIATE_EDUCATION_OTHER,
} from "../../../../constants/Associate";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

// Section Component with Dark Header Pattern - Updated with error handling
const DetailSection = ({
  title,
  icon: Icon,
  children,
  description,
  onEdit,
  hasError = false,
}) => (
  <div
    className={`bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6 ${hasError ? "ring-2 ring-red-500" : ""}`}
  >
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Icon
              className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${hasError ? "text-red-300" : "text-blue-300"} flex-shrink-0`}
            />
            <span className="truncate">{title}</span>
            {hasError && (
              <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2 text-red-300" />
            )}
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              {description}
            </p>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className={`inline-flex items-center text-xs sm:text-sm ${hasError ? "text-red-300 hover:text-red-200" : "text-blue-300 hover:text-blue-100"} transition-colors`}
          >
            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            {hasError ? "Fix" : "Edit"}
          </button>
        )}
      </div>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminAssociateAddStep7Page() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [associateData, setAssociateData] = useState(null);

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
        setAssociateData(associateState);
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  // Map backend field errors to sections for highlighting
  const getSectionWithError = (fieldName) => {
    const contactFields = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "phoneType",
      "organizationName",
      "organizationType",
    ];
    const addressFields = [
      "addressLine1",
      "city",
      "region",
      "postalCode",
      "country",
    ];
    const shippingFields = [
      "shippingAddressLine1",
      "shippingCity",
      "shippingRegion",
      "shippingPostalCode",
      "shippingCountry",
      "shippingName",
      "shippingPhone",
    ];
    const accountFields = [
      "skillSets",
      "insuranceRequirements",
      "vehicleTypes",
      "serviceFeeId",
      "hourlySalaryDesired",
      "duesDate",
      "policeCheck",
      "commercialInsuranceExpiryDate",
      "preferredLanguage",
    ];
    const metricsFields = [
      "tags",
      "howDidYouHearAboutUsID",
      "gender",
      "birthDate",
      "joinDate",
      "isJobSeeker",
      "statusInCountry",
      "maritalStatus",
      "accomplishedEducation",
    ];

    if (contactFields.includes(fieldName)) return "contact";
    if (addressFields.includes(fieldName)) return "address";
    if (shippingFields.includes(fieldName)) return "shipping";
    if (accountFields.includes(fieldName)) return "account";
    if (metricsFields.includes(fieldName)) return "metrics";

    return null;
  };

  // Check if a section has errors
  const sectionHasErrors = (section) => {
    const fieldsInSection = {
      contact: [
        "email",
        "firstName",
        "lastName",
        "phone",
        "phoneType",
        "organizationName",
        "organizationType",
      ],
      address: ["addressLine1", "city", "region", "postalCode", "country"],
      shipping: [
        "shippingAddressLine1",
        "shippingCity",
        "shippingRegion",
        "shippingPostalCode",
        "shippingCountry",
        "shippingName",
        "shippingPhone",
      ],
      account: [
        "skillSets",
        "insuranceRequirements",
        "vehicleTypes",
        "serviceFeeId",
        "hourlySalaryDesired",
        "duesDate",
        "policeCheck",
        "commercialInsuranceExpiryDate",
        "preferredLanguage",
      ],
      metrics: [
        "tags",
        "howDidYouHearAboutUsID",
        "gender",
        "birthDate",
        "joinDate",
        "isJobSeeker",
        "statusInCountry",
        "maritalStatus",
        "accomplishedEducation",
      ],
    };

    return fieldsInSection[section]?.some((field) => fieldErrors[field]);
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setErrors({});
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (!associateData) {
        throw new Error("No associate data found");
      }

      // Process the data for API submission
      const processedData = processAssociateData(associateData);

      console.log("Submitting associate data:", processedData);

      // Submit to API
      const response = await associateManager.createAssociate(
        processedData,
        () => navigate("/login?unauthorized=true"),
      );

      console.log("Associate created successfully:", response);

      // Clear the session storage
      sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");

      // Show success message and redirect
      navigate(`/admin/associate/${response.id}`, {
        state: { successMessage: "Associate created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create associate:", error);

      // Handle different error formats
      let errorDetails = {};
      let generalError = null;

      if (error && typeof error === "object") {
        // Check for field-specific errors
        const errorFields = Object.keys(error);
        const knownFields = [
          "email",
          "firstName",
          "lastName",
          "phone",
          "phoneType",
          "addressLine1",
          "city",
          "region",
          "postalCode",
          "country",
          "shippingAddressLine1",
          "shippingCity",
          "shippingRegion",
          "shippingPostalCode",
          "shippingCountry",
          "shippingName",
          "shippingPhone",
          "skillSets",
          "insuranceRequirements",
          "vehicleTypes",
          "serviceFeeId",
          "hourlySalaryDesired",
          "duesDate",
          "policeCheck",
          "commercialInsuranceExpiryDate",
          "preferredLanguage",
          "tags",
          "howDidYouHearAboutUsID",
          "gender",
          "birthDate",
          "joinDate",
          "isJobSeeker",
          "organizationName",
          "organizationType",
        ];

        // Extract field errors
        errorFields.forEach((field) => {
          if (knownFields.includes(field)) {
            errorDetails[field] = Array.isArray(error[field])
              ? error[field].join(", ")
              : error[field];
          }
        });

        // Check for general error message
        if (error.message) {
          generalError = error.message;
        } else if (error.detail) {
          generalError = error.detail;
        } else if (error.error) {
          generalError = error.error;
        } else if (Object.keys(errorDetails).length === 0) {
          // If no field errors were found, treat entire error as general
          generalError =
            typeof error === "string"
              ? error
              : "An error occurred while creating the associate. Please review your information and try again.";
        }
      } else if (typeof error === "string") {
        generalError = error;
      } else {
        generalError = "An unexpected error occurred. Please try again.";
      }

      setFieldErrors(errorDetails);

      // Set general error only if we have one and no field errors
      if (generalError && Object.keys(errorDetails).length === 0) {
        setErrors({ general: generalError });
      } else if (Object.keys(errorDetails).length > 0) {
        // Create a helpful message when there are field errors
        const errorSections = new Set();
        Object.keys(errorDetails).forEach((field) => {
          const section = getSectionWithError(field);
          if (section) errorSections.add(section);
        });

        const sectionNames = {
          contact: "Contact Information",
          address: "Address Information",
          shipping: "Shipping Address",
          account: "Account Information",
          metrics: "Metrics Information",
        };

        const sectionsWithErrors = Array.from(errorSections)
          .map((s) => sectionNames[s])
          .filter(Boolean);

        const errorMessage =
          sectionsWithErrors.length > 0
            ? `Please fix the errors in the following sections: ${sectionsWithErrors.join(", ")}`
            : "Please fix the validation errors below";

        setErrors({ general: errorMessage });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const processAssociateData = (data) => {
    // Convert dates to proper ISO format and handle data transformation
    const processed = { ...data };

    // Handle date conversions - only convert if not already in ISO format
    if (processed.duesDate && !processed.duesDate.includes("T")) {
      processed.duesDate = new Date(processed.duesDate).toISOString();
    }
    if (processed.policeCheck && !processed.policeCheck.includes("T")) {
      processed.policeCheck = new Date(processed.policeCheck).toISOString();
    }
    if (processed.birthDate && !processed.birthDate.includes("T")) {
      processed.birthDate = new Date(processed.birthDate).toISOString();
    }
    if (processed.joinDate && !processed.joinDate.includes("T")) {
      processed.joinDate = new Date(processed.joinDate).toISOString();
    }
    if (
      processed.commercialInsuranceExpiryDate &&
      !processed.commercialInsuranceExpiryDate.includes("T")
    ) {
      processed.commercialInsuranceExpiryDate = new Date(
        processed.commercialInsuranceExpiryDate,
      ).toISOString();
    }
    if (
      processed.autoInsuranceExpiryDate &&
      !processed.autoInsuranceExpiryDate.includes("T")
    ) {
      processed.autoInsuranceExpiryDate = new Date(
        processed.autoInsuranceExpiryDate,
      ).toISOString();
    }
    if (
      processed.wsibInsuranceDate &&
      !processed.wsibInsuranceDate.includes("T")
    ) {
      processed.wsibInsuranceDate = new Date(
        processed.wsibInsuranceDate,
      ).toISOString();
    }
    if (
      processed.dateOfEntryIntoCountry &&
      !processed.dateOfEntryIntoCountry.includes("T")
    ) {
      processed.dateOfEntryIntoCountry = new Date(
        processed.dateOfEntryIntoCountry,
      ).toISOString();
    }

    // Convert string arrays to proper arrays
    if (typeof processed.skillSets === "string") {
      processed.skillSets = processed.skillSets
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.insuranceRequirements === "string") {
      processed.insuranceRequirements = processed.insuranceRequirements
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.vehicleTypes === "string") {
      processed.vehicleTypes = processed.vehicleTypes
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.tags === "string") {
      processed.tags = processed.tags
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.identifyAs === "string") {
      processed.identifyAs = processed.identifyAs
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter(Boolean);
    } else if (Array.isArray(processed.identifyAs)) {
      // Ensure identifyAs array contains integers
      processed.identifyAs = processed.identifyAs.map((id) =>
        typeof id === "string" ? parseInt(id) : id,
      );
    }

    // Convert numeric fields - IMPORTANT: Convert string values to integers
    if (processed.hourlySalaryDesired) {
      processed.hourlySalaryDesired = parseInt(processed.hourlySalaryDesired);
    }

    // Convert all int8 fields from strings/numbers to ensure they are integers
    if (
      processed.statusInCountry !== undefined &&
      processed.statusInCountry !== "" &&
      processed.statusInCountry !== 0
    ) {
      processed.statusInCountry = parseInt(processed.statusInCountry);
    }
    if (
      processed.maritalStatus !== undefined &&
      processed.maritalStatus !== "" &&
      processed.maritalStatus !== 0
    ) {
      processed.maritalStatus = parseInt(processed.maritalStatus);
    }
    if (
      processed.accomplishedEducation !== undefined &&
      processed.accomplishedEducation !== "" &&
      processed.accomplishedEducation !== 0
    ) {
      processed.accomplishedEducation = parseInt(
        processed.accomplishedEducation,
      );
    }
    if (processed.gender !== undefined && processed.gender !== 0) {
      processed.gender = parseInt(processed.gender);
    }
    if (processed.type !== undefined) {
      processed.type = parseInt(processed.type);
    }
    if (
      processed.organizationType !== undefined &&
      processed.organizationType !== 0
    ) {
      processed.organizationType = parseInt(processed.organizationType);
    }
    if (processed.phoneType !== undefined) {
      processed.phoneType = parseInt(processed.phoneType);
    }
    if (
      processed.otherPhoneType !== undefined &&
      processed.otherPhoneType !== 0
    ) {
      processed.otherPhoneType = parseInt(processed.otherPhoneType);
    }
    if (processed.isJobSeeker !== undefined) {
      processed.isJobSeeker = parseInt(processed.isJobSeeker);
    }

    // Handle conditional "other" fields - only remove them if they're empty or if the main field is not "Other"

    // Gender Other
    if (processed.gender !== ASSOCIATE_GENDER_OTHER) {
      delete processed.genderOther;
    } else if (!processed.genderOther || processed.genderOther.trim() === "") {
      processed.genderOther = "Not specified";
    }

    // Status in Country Other
    if (processed.statusInCountry !== ASSOCIATE_STATUS_IN_COUNTRY_OTHER) {
      delete processed.statusInCountryOther;
    } else if (
      !processed.statusInCountryOther ||
      processed.statusInCountryOther.trim() === ""
    ) {
      processed.statusInCountryOther = "Not specified";
    }

    // Marital Status Other
    if (processed.maritalStatus !== ASSOCIATE_MARITAL_STATUS_OTHER) {
      delete processed.maritalStatusOther;
    } else if (
      !processed.maritalStatusOther ||
      processed.maritalStatusOther.trim() === ""
    ) {
      processed.maritalStatusOther = "Not specified";
    }

    // Accomplished Education Other
    if (processed.accomplishedEducation !== ASSOCIATE_EDUCATION_OTHER) {
      delete processed.accomplishedEducationOther;
    } else if (
      !processed.accomplishedEducationOther ||
      processed.accomplishedEducationOther.trim() === ""
    ) {
      processed.accomplishedEducationOther = "Not specified";
    }

    // How Did You Hear About Us Other
    if (!processed.isHowDidYouHearAboutUsOther) {
      delete processed.howDidYouHearAboutUsOther;
      delete processed.isHowDidYouHearAboutUsOther;
    } else if (
      !processed.howDidYouHearAboutUsOther ||
      processed.howDidYouHearAboutUsOther.trim() === ""
    ) {
      processed.howDidYouHearAboutUsOther = "Not specified";
    }

    // Remove empty/zero values for optional numeric fields to avoid sending 0 when field should be null
    if (processed.statusInCountry === 0) delete processed.statusInCountry;
    if (processed.maritalStatus === 0) delete processed.maritalStatus;
    if (processed.accomplishedEducation === 0)
      delete processed.accomplishedEducation;
    if (processed.otherPhoneType === 0) delete processed.otherPhoneType;
    if (processed.organizationType === 0) delete processed.organizationType;

    // Remove empty string fields to avoid sending empty strings to the backend
    Object.keys(processed).forEach((key) => {
      if (
        processed[key] === "" ||
        processed[key] === null ||
        processed[key] === undefined
      ) {
        delete processed[key];
      }
    });

    return processed;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 2:
        return "Residential";
      case 3:
        return "Commercial";
      default:
        return "Unknown";
    }
  };

  const getPhoneTypeLabel = (phoneType) => {
    switch (phoneType) {
      case 1:
        return "Mobile";
      case 2:
        return "Work";
      case 3:
        return "Home";
      default:
        return "Unknown";
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 1:
        return "Other";
      case 2:
        return "Male";
      case 3:
        return "Female";
      default:
        return "Unknown";
    }
  };

  // Helper function to parse array values
  const parseArrayValue = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return [];
  };

  if (!associateData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

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
            Review and submit the new associate information
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 7: Review
                  </p>
                  <p className="text-xs text-gray-500">Submit Associate</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">7 of 7</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-6 Complete */}
              {[
                { num: 1, title: "Search", subtitle: "Complete" },
                { num: 2, title: "Type", subtitle: "Complete" },
                { num: 3, title: "Contact", subtitle: "Complete" },
                { num: 4, title: "Address", subtitle: "Complete" },
                { num: 5, title: "Account", subtitle: "Complete" },
                { num: 6, title: "Metrics", subtitle: "Complete" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                  {index < 5 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 7 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message - Enhanced with field errors */}
        {errors.general && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {errors.general}
                  </p>
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-xs sm:text-sm">
                      {Object.entries(fieldErrors).map(([field, error]) => (
                        <li key={field}>
                          <strong className="capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}:
                          </strong>{" "}
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setErrors({});
                  setFieldErrors({});
                }}
                className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Creating associate...</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Review Header Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-2">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Review and Submit
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Please carefully review the following associate details. If
                everything looks correct, click the <strong>Submit</strong>{" "}
                button to create the new associate.
              </p>
            </div>

            {/* Contact Information Section */}
            <DetailSection
              title="Contact Information"
              icon={UserIcon}
              description="Basic contact details and preferences"
              onEdit={() => navigate("/admin/associates/add/step-3")}
              hasError={sectionHasErrors("contact")}
            >
              <div className="space-y-4">
                {/* Type and Organization Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Type
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {getTypeLabel(associateData.type)}
                    </p>
                  </div>

                  {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                    <>
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Organization Name
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.organizationName}
                        </p>
                        {fieldErrors.organizationName && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                            {fieldErrors.organizationName}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Organization Type
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.organizationType}
                        </p>
                        {fieldErrors.organizationType && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                            {fieldErrors.organizationType}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Name and Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      First Name
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.firstName}
                    </p>
                    {fieldErrors.firstName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Last Name
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.lastName}
                    </p>
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </span>
                    <p className="text-sm sm:text-base text-gray-900 break-all">
                      {associateData.email}
                    </p>
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-2 rounded font-semibold">
                        <ExclamationTriangleIcon className="inline w-4 h-4 mr-1" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.phone} (
                      {getPhoneTypeLabel(associateData.phoneType)})
                    </p>
                    {(fieldErrors.phone || fieldErrors.phoneType) && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.phone || fieldErrors.phoneType}
                      </p>
                    )}
                  </div>

                  {associateData.phoneType === ASSOCIATE_PHONE_TYPE_WORK &&
                    associateData.phoneExtension && (
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Phone Extension
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.phoneExtension}
                        </p>
                      </div>
                    )}

                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      OK to Email
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.isOkToEmail ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      OK to Text
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.isOkToText ? "Yes" : "No"}
                    </p>
                  </div>

                  {associateData.otherPhone && (
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Other Phone
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.otherPhone} (
                        {getPhoneTypeLabel(associateData.otherPhoneType)})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DetailSection>

            {/* Address Information Section */}
            <DetailSection
              title={
                associateData.hasShippingAddress
                  ? "Billing Address"
                  : "Address Information"
              }
              icon={associateData.hasShippingAddress ? HomeIcon : MapPinIcon}
              description={
                associateData.hasShippingAddress
                  ? "Primary billing address"
                  : "Primary address for the associate"
              }
              onEdit={() => navigate("/admin/associates/add/step-4")}
              hasError={sectionHasErrors("address")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Address
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.addressLine1}
                    </p>
                    {fieldErrors.addressLine1 && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.addressLine1}
                      </p>
                    )}
                  </div>
                  {associateData.addressLine2 && (
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Address Line 2
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.addressLine2}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      City
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.city}
                    </p>
                    {fieldErrors.city && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Province/Territory
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.region}
                    </p>
                    {fieldErrors.region && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.region}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Postal Code
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.postalCode}
                    </p>
                    {fieldErrors.postalCode && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Country
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.country}
                    </p>
                    {fieldErrors.country && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Shipping Address Section (if applicable) */}
            {associateData.hasShippingAddress && (
              <DetailSection
                title="Shipping Address"
                icon={TruckIcon}
                description="Where materials and packages should be delivered"
                hasError={sectionHasErrors("shipping")}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Contact Name
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingName}
                      </p>
                      {fieldErrors.shippingName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingName}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Phone
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingPhone}
                      </p>
                      {fieldErrors.shippingPhone && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingPhone}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Address
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingAddressLine1}
                      </p>
                      {fieldErrors.shippingAddressLine1 && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingAddressLine1}
                        </p>
                      )}
                    </div>
                    {associateData.shippingAddressLine2 && (
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Address Line 2
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.shippingAddressLine2}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        City
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingCity}
                      </p>
                      {fieldErrors.shippingCity && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingCity}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Province/Territory
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingRegion}
                      </p>
                      {fieldErrors.shippingRegion && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingRegion}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Postal Code
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingPostalCode}
                      </p>
                      {fieldErrors.shippingPostalCode && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingPostalCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Country
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.shippingCountry}
                      </p>
                      {fieldErrors.shippingCountry && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.shippingCountry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Account Information Section */}
            <DetailSection
              title="Account Information"
              icon={ClipboardDocumentIcon}
              description="Skills, insurance, and service details"
              onEdit={() => navigate("/admin/associates/add/step-5")}
              hasError={sectionHasErrors("account")}
            >
              <div className="space-y-4">
                {/* Display Components */}
                {associateData.skillSets && (
                  <div>
                    <SkillSetsDisplay
                      values={parseArrayValue(associateData.skillSets)}
                      label="Skill Sets"
                      variant="primary"
                    />
                    {fieldErrors.skillSets && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.skillSets}
                      </p>
                    )}
                  </div>
                )}

                {associateData.insuranceRequirements && (
                  <div>
                    <InsuranceRequirementsDisplay
                      values={parseArrayValue(
                        associateData.insuranceRequirements,
                      )}
                      label="Insurance Requirements"
                      variant="info"
                    />
                    {fieldErrors.insuranceRequirements && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.insuranceRequirements}
                      </p>
                    )}
                  </div>
                )}

                {associateData.vehicleTypes &&
                  associateData.vehicleTypes.length > 0 && (
                    <div>
                      <VehicleTypesDisplay
                        values={parseArrayValue(associateData.vehicleTypes)}
                        label="Vehicle Types"
                        variant="warning"
                      />
                      {fieldErrors.vehicleTypes && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.vehicleTypes}
                        </p>
                      )}
                    </div>
                  )}

                {associateData.serviceFeeId && (
                  <div>
                    <ServiceFeeDisplay
                      value={associateData.serviceFeeId}
                      label="Service Fee"
                      showAmount={true}
                    />
                    {fieldErrors.serviceFeeId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.serviceFeeId}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {associateData.hourlySalaryDesired && (
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Hourly Rate
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        ${associateData.hourlySalaryDesired}/hr
                      </p>
                      {fieldErrors.hourlySalaryDesired && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                          {fieldErrors.hourlySalaryDesired}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Member Dues Date
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.duesDate}
                    </p>
                    {fieldErrors.duesDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.duesDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Police Check Expiry
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.policeCheck}
                    </p>
                    {fieldErrors.policeCheck && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.policeCheck}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Commercial Insurance Expiry
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.commercialInsuranceExpiryDate}
                    </p>
                    {fieldErrors.commercialInsuranceExpiryDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.commercialInsuranceExpiryDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Preferred Language
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.preferredLanguage}
                    </p>
                    {fieldErrors.preferredLanguage && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.preferredLanguage}
                      </p>
                    )}
                  </div>
                </div>

                {associateData.emergencyContactName && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm sm:text-base font-semibold text-gray-700 mb-3">
                      Emergency Contact
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Name
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.emergencyContactName}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Relationship
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.emergencyContactRelationship}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Phone
                        </span>
                        <p className="text-sm sm:text-base text-gray-900">
                          {associateData.emergencyContactTelephone}
                        </p>
                      </div>
                      {associateData.emergencyContactAlternativeTelephone && (
                        <div>
                          <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Alternative Phone
                          </span>
                          <p className="text-sm sm:text-base text-gray-900">
                            {associateData.emergencyContactAlternativeTelephone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Metrics Information Section */}
            <DetailSection
              title="Metrics Information"
              icon={ChartBarSquareIcon}
              description="Demographics and performance metrics"
              onEdit={() => navigate("/admin/associates/add/step-6")}
              hasError={sectionHasErrors("metrics")}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Is Job Seeker
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES
                        ? "Yes"
                        : "No"}
                    </p>
                    {fieldErrors.isJobSeeker && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.isJobSeeker}
                      </p>
                    )}
                  </div>

                  {associateData.isJobSeeker ===
                    ASSOCIATE_IS_JOB_SEEKER_YES && (
                    <>
                      {associateData.statusInCountry && (
                        <div>
                          <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Status in Country
                          </span>
                          <p className="text-sm sm:text-base text-gray-900">
                            {associateData.statusInCountry}
                          </p>
                          {fieldErrors.statusInCountry && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                              {fieldErrors.statusInCountry}
                            </p>
                          )}
                        </div>
                      )}
                      {associateData.maritalStatus && (
                        <div>
                          <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Marital Status
                          </span>
                          <p className="text-sm sm:text-base text-gray-900">
                            {associateData.maritalStatus}
                          </p>
                          {fieldErrors.maritalStatus && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                              {fieldErrors.maritalStatus}
                            </p>
                          )}
                        </div>
                      )}
                      {associateData.accomplishedEducation && (
                        <div>
                          <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                            Education Level
                          </span>
                          <p className="text-sm sm:text-base text-gray-900">
                            {associateData.accomplishedEducation}
                          </p>
                          {fieldErrors.accomplishedEducation && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                              {fieldErrors.accomplishedEducation}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Gender
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {getGenderLabel(associateData.gender)}
                    </p>
                    {fieldErrors.gender && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.gender}
                      </p>
                    )}
                  </div>
                  {associateData.gender === 1 && (
                    <div>
                      <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Gender (Other)
                      </span>
                      <p className="text-sm sm:text-base text-gray-900">
                        {associateData.genderOther}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Birth Date
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.birthDate}
                    </p>
                    {fieldErrors.birthDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.birthDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Join Date
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.joinDate}
                    </p>
                    {fieldErrors.joinDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.joinDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* How Heard About Us Display */}
                {associateData.howDidYouHearAboutUsID && (
                  <div className="mt-4">
                    <HowHearAboutUsDisplay
                      value={associateData.howDidYouHearAboutUsID}
                      label="How did you hear about us?"
                    />
                    {fieldErrors.howDidYouHearAboutUsID && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.howDidYouHearAboutUsID}
                      </p>
                    )}
                  </div>
                )}

                {/* Tags Display */}
                {associateData.tags && associateData.tags.length > 0 && (
                  <div className="mt-4">
                    <TagsDisplay
                      values={parseArrayValue(associateData.tags)}
                      label="Tags"
                      variant="success"
                    />
                    {fieldErrors.tags && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 bg-red-50 p-1 rounded">
                        {fieldErrors.tags}
                      </p>
                    )}
                  </div>
                )}

                {associateData.additionalComment && (
                  <div className="mt-4">
                    <span className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Additional Comments
                    </span>
                    <p className="text-sm sm:text-base text-gray-900">
                      {associateData.additionalComment}
                    </p>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Form Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/admin/associates/add/step-6" className="flex-1">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Back
                </button>
              </Link>
              <button
                onClick={onSubmitClick}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {isLoading ? "Submitting..." : "Submit Associate"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateAddStep7Page;

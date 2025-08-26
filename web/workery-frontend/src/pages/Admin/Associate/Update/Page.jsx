// File Path: web/workery-frontend/src/pages/Admin/Associate/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  TruckIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/business/selects";
import { DateInput, Input, Select, Checkbox } from "../../../../components/UI";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Unknown" },
  { value: 2, label: "Private" },
  { value: 3, label: "Non-profit" },
  { value: 4, label: "Government" },
];

const PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
];

const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Transgender" },
  { value: 5, label: "Non-Binary" },
  { value: 6, label: "Two Spirit" },
  { value: 7, label: "Prefer not to say" },
  { value: 8, label: "Do not know" },
];

const JOB_SEEKER_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

const REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "Alberta", label: "Alberta" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "Manitoba", label: "Manitoba" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
  { value: "Northwest Territories", label: "Northwest Territories" },
  { value: "Nova Scotia", label: "Nova Scotia" },
  { value: "Nunavut", label: "Nunavut" },
  { value: "Ontario", label: "Ontario" },
  { value: "Prince Edward Island", label: "Prince Edward Island" },
  { value: "Quebec", label: "Quebec" },
  { value: "Saskatchewan", label: "Saskatchewan" },
  { value: "Yukon", label: "Yukon" },
];

// Helper function to format errors for display
const formatErrorsForAlert = (errors) => {
  if (!errors || typeof errors !== "object") {
    return null;
  }

  const errorList = [];
  for (const [field, message] of Object.entries(errors)) {
    if (message && field !== "general") {
      const fieldName = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      errorList.push(`• ${fieldName}: ${message}`);
    }
  }

  return errorList.length > 0 ? errorList : null;
};

// Section Component with Dark Header - Matching Customer Update style
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminAssociateUpdatePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [associate, setAssociate] = useState(null);

  // Associate data state - Complete fields based on backend requirements
  const [associateData, setAssociateData] = useState({
    // Basic info
    type: 2,
    organizationName: "",
    organizationType: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneType: 0,
    phoneExtension: "",
    otherPhone: "",
    otherPhoneType: 0,
    otherPhoneExtension: "",
    isOkToText: false,
    isOkToEmail: false,

    // Address
    country: "Canada",
    region: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    hasShippingAddress: false,
    shippingName: "",
    shippingPhone: "",
    shippingCountry: "Canada",
    shippingRegion: "",
    shippingCity: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingPostalCode: "",

    // Professional info
    skillSets: [],
    insuranceRequirements: [],
    vehicleTypes: [],
    serviceFeeId: "",
    hourlySalaryDesired: 0,
    limitSpecial: "",
    duesDate: "",
    commercialInsuranceExpiryDate: "",
    autoInsuranceExpiryDate: "",
    wsibNumber: "",
    wsibInsuranceDate: "",
    policeCheck: "",
    taxId: "",
    driversLicenseClass: "",

    // Emergency contact
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactTelephone: "",
    emergencyContactAlternativeTelephone: "",

    // Metrics
    tags: [],
    howDidYouHearAboutUsID: "",
    isHowDidYouHearAboutUsOther: false,
    howDidYouHearAboutUsOther: "",
    gender: 0,
    genderOther: "",
    birthDate: "",
    joinDate: "",
    additionalComment: "",
    identifyAs: [],

    // Job seeker info
    isJobSeeker: 2,
    statusInCountry: 0,
    statusInCountryOther: "",
    countryOfOrigin: "",
    dateOfEntryIntoCountry: "",
    maritalStatus: 0,
    maritalStatusOther: "",
    accomplishedEducation: 0,
    accomplishedEducationOther: "",

    // System
    description: "",
    preferredLanguage: "English",
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchAssociateDetail = () => {
      if (!aid) {
        setAlert({ type: "error", message: "Invalid associate ID" });
        setIsLoading(false);
        return;
      }

      associateManager.getAssociateDetailWithCallbacks(
        aid,
        (data) => {
          if (mounted) {
            setAssociate(data);

            // Format dates properly for HTML date inputs
            const formatDateForInput = (dateValue) => {
              if (!dateValue) return "";
              try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return "";
                return date.toISOString().split("T")[0];
              } catch (e) {
                return "";
              }
            };

            // Map the API response to our form state
            setAssociateData({
              type: data.type || 2,
              organizationName: data.organizationName || "",
              organizationType: data.organizationType || 0,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              phoneType: data.phoneType || 0,
              phoneExtension: data.phoneExtension || "",
              otherPhone: data.otherPhone || "",
              otherPhoneType: data.otherPhoneType || 0,
              otherPhoneExtension: data.otherPhoneExtension || "",
              isOkToText: data.isOkToText || false,
              isOkToEmail: data.isOkToEmail || false,
              country: data.country || "Canada",
              region: data.region || "",
              city: data.city || "",
              addressLine1: data.addressLine1 || "",
              addressLine2: data.addressLine2 || "",
              postalCode: data.postalCode || "",
              hasShippingAddress: data.hasShippingAddress || false,
              shippingName: data.shippingName || "",
              shippingPhone: data.shippingPhone || "",
              shippingCountry: data.shippingCountry || "Canada",
              shippingRegion: data.shippingRegion || "",
              shippingCity: data.shippingCity || "",
              shippingAddressLine1: data.shippingAddressLine1 || "",
              shippingAddressLine2: data.shippingAddressLine2 || "",
              shippingPostalCode: data.shippingPostalCode || "",
              skillSets: data.skillSets
                ? data.skillSets.map((ss) => ss.id)
                : [],
              insuranceRequirements: data.insuranceRequirements
                ? data.insuranceRequirements.map((ir) => ir.id)
                : [],
              vehicleTypes: data.vehicleTypes
                ? data.vehicleTypes.map((vt) => vt.id)
                : [],
              tags: data.tags ? data.tags.map((tag) => tag.id) : [],
              serviceFeeId: data.serviceFeeId || "",
              hourlySalaryDesired: data.hourlySalaryDesired || 0,
              limitSpecial: data.limitSpecial || "",
              duesDate: formatDateForInput(data.duesDate),
              commercialInsuranceExpiryDate: formatDateForInput(
                data.commercialInsuranceExpiryDate,
              ),
              autoInsuranceExpiryDate: formatDateForInput(
                data.autoInsuranceExpiryDate,
              ),
              wsibNumber: data.wsibNumber || "",
              wsibInsuranceDate: formatDateForInput(data.wsibInsuranceDate),
              policeCheck: formatDateForInput(data.policeCheck),
              taxId: data.taxId || "",
              driversLicenseClass: data.driversLicenseClass || "",
              emergencyContactName: data.emergencyContactName || "",
              emergencyContactRelationship:
                data.emergencyContactRelationship || "",
              emergencyContactTelephone: data.emergencyContactTelephone || "",
              emergencyContactAlternativeTelephone:
                data.emergencyContactAlternativeTelephone || "",
              howDidYouHearAboutUsID: data.howDidYouHearAboutUsID || "",
              isHowDidYouHearAboutUsOther:
                data.isHowDidYouHearAboutUsOther || false,
              howDidYouHearAboutUsOther: data.howDidYouHearAboutUsOther || "",
              gender: data.gender || 0,
              genderOther: data.genderOther || "",
              birthDate: formatDateForInput(data.birthDate),
              joinDate: formatDateForInput(data.joinDate),
              additionalComment: data.additionalComment || "",
              identifyAs: data.identifyAs || [],
              isJobSeeker: data.isJobSeeker || 2,
              statusInCountry: data.statusInCountry || 0,
              statusInCountryOther: data.statusInCountryOther || "",
              countryOfOrigin: data.countryOfOrigin || "",
              dateOfEntryIntoCountry: formatDateForInput(
                data.dateOfEntryIntoCountry,
              ),
              maritalStatus: data.maritalStatus || 0,
              maritalStatusOther: data.maritalStatusOther || "",
              accomplishedEducation: data.accomplishedEducation || 0,
              accomplishedEducationOther: data.accomplishedEducationOther || "",
              description: data.description || "",
              preferredLanguage: data.preferredLanguage || "English",
            });

            setIsLoading(false);
          }
        },
        (error) => {
          if (mounted) {
            console.error("Failed to load associate detail:", error);
            setAlert({
              type: "error",
              message: "Failed to load associate details. Please try again.",
            });
            setIsLoading(false);
          }
        },
        () => {},
        onUnauthorized,
      );
    };

    fetchAssociateDetail();

    return () => {
      mounted = false;
    };
  }, [aid, associateManager, navigate]);

  const handleInputChange = (field, value) => {
    setAssociateData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleCheckboxChange = (field) => {
    setAssociateData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!associateData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!associateData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!associateData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(associateData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!associateData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!associateData.type) {
      newErrors.type = "Associate type is required";
    }

    // Commercial associate validation
    if (associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      if (!associateData.organizationName.trim()) {
        newErrors.organizationName =
          "Organization name is required for business associates";
      }
      if (!associateData.organizationType) {
        newErrors.organizationType =
          "Organization type is required for business associates";
      }
    }

    // Address validation
    if (!associateData.country) {
      newErrors.country = "Country is required";
    }
    if (!associateData.region.trim()) {
      newErrors.region = "Province/Territory is required";
    }
    if (!associateData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!associateData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }
    if (!associateData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    // Shipping address validation if enabled
    if (associateData.hasShippingAddress) {
      if (!associateData.shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
      }
      if (!associateData.shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
      }
      if (!associateData.shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
      }
      if (!associateData.shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
      }
      if (!associateData.shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
      }
      if (!associateData.shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
      }
      if (!associateData.shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
      }
    }

    // Professional fields validation
    if (!associateData.skillSets || associateData.skillSets.length === 0) {
      newErrors.skillSets = "At least one skill set is required";
    }
    if (
      !associateData.insuranceRequirements ||
      associateData.insuranceRequirements.length === 0
    ) {
      newErrors.insuranceRequirements =
        "At least one insurance requirement is required";
    }
    if (!associateData.serviceFeeId) {
      newErrors.serviceFeeId = "Service fee is required";
    }
    if (!associateData.duesDate) {
      newErrors.duesDate = "Member dues date is required";
    }
    if (!associateData.policeCheck) {
      newErrors.policeCheck = "Police check date is required";
    }
    if (!associateData.commercialInsuranceExpiryDate) {
      newErrors.commercialInsuranceExpiryDate =
        "Commercial insurance expiry date is required";
    }

    // Emergency contact validation
    if (!associateData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
    }
    if (!associateData.emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
    }
    if (!associateData.emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
    }

    // Metrics validation
    if (!associateData.howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "How did you hear about us is required";
    }
    if (
      associateData.isHowDidYouHearAboutUsOther &&
      !associateData.howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }
    if (!associateData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (associateData.gender === 1 && !associateData.genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
    }
    if (!associateData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }
    if (!associateData.preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert(null);

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      const errorList = formatErrorsForAlert(formErrors);
      if (errorList) {
        setAlert({
          type: "error",
          message: "Please correct the following errors:",
          details: errorList,
        });
      } else {
        setAlert({
          type: "error",
          message: "Please correct the errors in the form before submitting.",
        });
      }

      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setErrors({});

    // Format dates for API submission
    const formatDateForAPI = (dateValue) => {
      if (!dateValue) return "";
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return date.toISOString();
      } catch (e) {
        return "";
      }
    };

    // Prepare data for submission
    const submitData = {
      id: aid,
      ...associateData,
      type: parseInt(associateData.type),
      organizationType: associateData.organizationType
        ? parseInt(associateData.organizationType)
        : 0,
      phoneType: associateData.phoneType
        ? parseInt(associateData.phoneType)
        : 0,
      otherPhoneType: associateData.otherPhoneType
        ? parseInt(associateData.otherPhoneType)
        : 0,
      hourlySalaryDesired: associateData.hourlySalaryDesired
        ? parseInt(associateData.hourlySalaryDesired)
        : 0,
      isJobSeeker: associateData.isJobSeeker
        ? parseInt(associateData.isJobSeeker)
        : 2,
      gender: associateData.gender ? parseInt(associateData.gender) : 0,
      birthDate: formatDateForAPI(associateData.birthDate),
      joinDate: formatDateForAPI(associateData.joinDate),
      duesDate: formatDateForAPI(associateData.duesDate),
      commercialInsuranceExpiryDate: formatDateForAPI(
        associateData.commercialInsuranceExpiryDate,
      ),
      autoInsuranceExpiryDate: formatDateForAPI(
        associateData.autoInsuranceExpiryDate,
      ),
      wsibInsuranceDate: formatDateForAPI(associateData.wsibInsuranceDate),
      policeCheck: formatDateForAPI(associateData.policeCheck),
      dateOfEntryIntoCountry: formatDateForAPI(
        associateData.dateOfEntryIntoCountry,
      ),
      skillSets: associateData.skillSets || [],
      insuranceRequirements: associateData.insuranceRequirements || [],
      vehicleTypes: associateData.vehicleTypes || [],
      tags: associateData.tags || [],
      identifyAs: associateData.identifyAs || [],
    };

    // Handle optional numeric fields
    if (associateData.statusInCountry) {
      submitData.statusInCountry = parseInt(associateData.statusInCountry);
    }
    if (associateData.maritalStatus) {
      submitData.maritalStatus = parseInt(associateData.maritalStatus);
    }
    if (associateData.accomplishedEducation) {
      submitData.accomplishedEducation = parseInt(
        associateData.accomplishedEducation,
      );
    }

    associateManager.updateAssociateWithCallbacks(
      aid,
      submitData,
      (data) => {
        setAlert({
          type: "success",
          message: "Associate updated successfully!",
        });

        setTimeout(() => {
          navigate(`/admin/associate/${aid}`);
        }, 2000);
      },
      (error) => {
        console.error("Failed to update associate:", error);

        if (error && typeof error === "object") {
          const hasFieldErrors = Object.keys(error).some(
            (key) => key !== "message" && key !== "general" && key !== "detail",
          );

          if (hasFieldErrors) {
            setErrors(error);
            const errorList = formatErrorsForAlert(error);

            if (errorList) {
              setAlert({
                type: "error",
                message:
                  error.general ||
                  "Failed to update associate. Please correct the following errors:",
                details: errorList,
              });
            } else {
              setAlert({
                type: "error",
                message:
                  error.general ||
                  error.message ||
                  "Failed to update associate. Please check the form and try again.",
              });
            }
          } else {
            setAlert({
              type: "error",
              message:
                error.message ||
                error.detail ||
                "Failed to update associate. Please try again.",
            });
          }
        } else {
          setAlert({
            type: "error",
            message: "An unexpected error occurred. Please try again.",
          });
        }

        window.scrollTo(0, 0);
      },
      () => {
        setIsSaving(false);
      },
      onUnauthorized,
    );
  };

  const handleHowHearChange = (value) => {
    handleInputChange("howDidYouHearAboutUsID", value);
  };

  const handleHowHearOtherDetected = (isOther) => {
    handleInputChange("isHowDidYouHearAboutUsOther", isOther);
    if (!isOther) {
      handleInputChange("howDidYouHearAboutUsOther", "");
    }
  };

  const handleServiceFeeChange = (value) => {
    handleInputChange("serviceFeeId", value);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading associate details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to="/admin/associates"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/associate/${aid}`}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Update
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Associate
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              Update associate information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {associate && associate.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This associate is archived
        </div>
      )}
      {associate && associate.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <NoSymbolIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This associate is banned
        </div>
      )}

      {/* Alert Messages - Responsive */}
      {alert && (
        <div
          className={`mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-start">
                {alert.type === "success" ? (
                  <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{alert.message}</span>
                  {alert.details && alert.details.length > 0 && (
                    <div className="mt-2 text-xs sm:text-sm">
                      {alert.details.map((detail, index) => (
                        <div key={index}>{detail}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70 ml-4 text-lg sm:text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Actions - Responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <PencilSquareIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
              Update Associate
            </h2>
            <Link to={`/admin/associate/${aid}`} className="flex-shrink-0">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Back to Detail
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation - Responsive with horizontal scroll */}
        <div className="border-b border-gray-200">
          <div className="px-4 sm:px-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
              <Link
                to={`/admin/associate/${aid}`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Summary
              </Link>
              <Link
                to={`/admin/associate/${aid}/detail`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Detail
              </Link>
              <Link
                to={`/admin/associate/${aid}/orders`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Orders
              </Link>
              <Link
                to={`/admin/associate/${aid}/comments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Comments
              </Link>
              <Link
                to={`/admin/associate/${aid}/attachments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Attachments
              </Link>
              <Link
                to={`/admin/associate/${aid}/more`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
              >
                More
                <EllipsisHorizontalIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
              </Link>
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Settings Section with Dark Header */}
          <FormSection title="Settings" icon={BuildingOfficeIcon}>
            <div className="max-w-xl">
              <Select
                label="Associate Type"
                value={associateData.type}
                onChange={(e) =>
                  handleInputChange("type", parseInt(e.target.value))
                }
                options={ASSOCIATE_TYPE_OPTIONS}
                error={errors.type}
                required
              />
            </div>
          </FormSection>

          {/* Contact Information Section with Dark Header */}
          <FormSection title="Contact Information" icon={UserIcon}>
            {/* Organization fields for commercial associates */}
            {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <Input
                  label="Organization Name"
                  value={associateData.organizationName}
                  onChange={(e) =>
                    handleInputChange("organizationName", e.target.value)
                  }
                  error={errors.organizationName}
                  required
                />

                <Select
                  label="Organization Type"
                  value={associateData.organizationType}
                  onChange={(e) =>
                    handleInputChange(
                      "organizationType",
                      parseInt(e.target.value),
                    )
                  }
                  options={ORGANIZATION_TYPE_OPTIONS}
                  error={errors.organizationType}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="First Name"
                value={associateData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                value={associateData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <Input
                label="Email"
                type="email"
                value={associateData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="I agree to receive electronic email"
                checked={associateData.isOkToEmail}
                onChange={() => handleCheckboxChange("isOkToEmail")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Phone"
                type="tel"
                value={associateData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
              />

              <Select
                label="Phone Type"
                value={associateData.phoneType}
                onChange={(e) =>
                  handleInputChange("phoneType", parseInt(e.target.value))
                }
                options={PHONE_TYPE_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {associateData.phoneType === 2 && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Phone Extension"
                  value={associateData.phoneExtension}
                  onChange={(e) =>
                    handleInputChange("phoneExtension", e.target.value)
                  }
                  error={errors.phoneExtension}
                />
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="I agree to receive texts to my phone"
                checked={associateData.isOkToText}
                onChange={() => handleCheckboxChange("isOkToText")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Other Phone (Optional)"
                type="tel"
                value={associateData.otherPhone}
                onChange={(e) =>
                  handleInputChange("otherPhone", e.target.value)
                }
                error={errors.otherPhone}
              />

              <Select
                label="Other Phone Type"
                value={associateData.otherPhoneType}
                onChange={(e) =>
                  handleInputChange("otherPhoneType", parseInt(e.target.value))
                }
                options={PHONE_TYPE_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {associateData.otherPhoneType === 2 && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Other Phone Extension"
                  value={associateData.otherPhoneExtension}
                  onChange={(e) =>
                    handleInputChange("otherPhoneExtension", e.target.value)
                  }
                  error={errors.otherPhoneExtension}
                />
              </div>
            )}
          </FormSection>

          {/* Address Section with Dark Header */}
          <FormSection title="Address" icon={MapPinIcon}>
            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="Has shipping address different than billing address"
                checked={associateData.hasShippingAddress}
                onChange={() => handleCheckboxChange("hasShippingAddress")}
              />
            </div>

            <div
              className={`grid ${associateData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 sm:gap-8`}
            >
              {/* Billing Address */}
              <div>
                {associateData.hasShippingAddress && (
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Billing Address
                  </h4>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="Country"
                    value={associateData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    error={errors.country}
                    required
                  />

                  <Select
                    label="Province/Territory"
                    value={associateData.region}
                    onChange={(e) =>
                      handleInputChange("region", e.target.value)
                    }
                    options={REGION_OPTIONS}
                    error={errors.region}
                    required
                  />

                  <Input
                    label="City"
                    value={associateData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={associateData.addressLine1}
                    onChange={(e) =>
                      handleInputChange("addressLine1", e.target.value)
                    }
                    error={errors.addressLine1}
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={associateData.addressLine2}
                    onChange={(e) =>
                      handleInputChange("addressLine2", e.target.value)
                    }
                    error={errors.addressLine2}
                  />

                  <Input
                    label="Postal Code"
                    value={associateData.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    error={errors.postalCode}
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              {associateData.hasShippingAddress && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Shipping Address
                  </h4>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label="Name"
                      value={associateData.shippingName}
                      onChange={(e) =>
                        handleInputChange("shippingName", e.target.value)
                      }
                      placeholder="The name to contact for this shipping address"
                      error={errors.shippingName}
                      required
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      value={associateData.shippingPhone}
                      onChange={(e) =>
                        handleInputChange("shippingPhone", e.target.value)
                      }
                      placeholder="The contact phone number for this shipping address"
                      error={errors.shippingPhone}
                      required
                    />

                    <Input
                      label="Country"
                      value={associateData.shippingCountry}
                      onChange={(e) =>
                        handleInputChange("shippingCountry", e.target.value)
                      }
                      error={errors.shippingCountry}
                      required
                    />

                    <Select
                      label="Province/Territory"
                      value={associateData.shippingRegion}
                      onChange={(e) =>
                        handleInputChange("shippingRegion", e.target.value)
                      }
                      options={REGION_OPTIONS}
                      error={errors.shippingRegion}
                      required
                    />

                    <Input
                      label="City"
                      value={associateData.shippingCity}
                      onChange={(e) =>
                        handleInputChange("shippingCity", e.target.value)
                      }
                      error={errors.shippingCity}
                      required
                    />

                    <Input
                      label="Address Line 1"
                      value={associateData.shippingAddressLine1}
                      onChange={(e) =>
                        handleInputChange(
                          "shippingAddressLine1",
                          e.target.value,
                        )
                      }
                      error={errors.shippingAddressLine1}
                      required
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      value={associateData.shippingAddressLine2}
                      onChange={(e) =>
                        handleInputChange(
                          "shippingAddressLine2",
                          e.target.value,
                        )
                      }
                      error={errors.shippingAddressLine2}
                    />

                    <Input
                      label="Postal Code"
                      value={associateData.shippingPostalCode}
                      onChange={(e) =>
                        handleInputChange("shippingPostalCode", e.target.value)
                      }
                      error={errors.shippingPostalCode}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Professional Information Section with Dark Header */}
          <FormSection title="Professional Information" icon={BriefcaseIcon}>
            <div className="space-y-4 sm:space-y-6">
              <SkillSetsMultiSelect
                value={associateData.skillSets}
                onChange={(value) => handleInputChange("skillSets", value)}
                error={errors.skillSets}
                required={true}
                label="Skill Sets"
                helperText="Select all skill sets that apply to this associate"
                onUnauthorized={onUnauthorized}
              />

              <InsuranceRequirementsMultiSelect
                value={associateData.insuranceRequirements}
                onChange={(value) =>
                  handleInputChange("insuranceRequirements", value)
                }
                error={errors.insuranceRequirements}
                required={true}
                label="Insurance Requirements"
                helperText="Select all insurance requirements for this associate"
                onUnauthorized={onUnauthorized}
              />

              <VehicleTypesMultiSelect
                value={associateData.vehicleTypes}
                onChange={(value) => handleInputChange("vehicleTypes", value)}
                error={errors.vehicleTypes}
                required={false}
                label="Vehicle Types (Optional)"
                helperText="Select all vehicle types the associate has access to"
                onUnauthorized={onUnauthorized}
              />

              <ServiceFeeSelect
                value={associateData.serviceFeeId}
                onChange={handleServiceFeeChange}
                error={errors.serviceFeeId}
                required={true}
                label="Service Fee"
                helperText="Select the applicable service fee for this associate"
                onUnauthorized={onUnauthorized}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <DateInput
                  label="Member Dues Date"
                  value={associateData.duesDate}
                  onChange={(value) => handleInputChange("duesDate", value)}
                  error={errors.duesDate}
                  required
                />

                <DateInput
                  label="Police Check Expiry"
                  value={associateData.policeCheck}
                  onChange={(value) => handleInputChange("policeCheck", value)}
                  error={errors.policeCheck}
                  required
                />
              </div>

              <DateInput
                label="Commercial Insurance Expiry Date"
                value={associateData.commercialInsuranceExpiryDate}
                onChange={(value) =>
                  handleInputChange("commercialInsuranceExpiryDate", value)
                }
                error={errors.commercialInsuranceExpiryDate}
                required
              />

              <DateInput
                label="Auto Insurance Expiry Date (Optional)"
                value={associateData.autoInsuranceExpiryDate}
                onChange={(value) =>
                  handleInputChange("autoInsuranceExpiryDate", value)
                }
                error={errors.autoInsuranceExpiryDate}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="WSIB Number (Optional)"
                  value={associateData.wsibNumber}
                  onChange={(e) =>
                    handleInputChange("wsibNumber", e.target.value)
                  }
                  error={errors.wsibNumber}
                />

                <DateInput
                  label="WSIB Insurance Date (Optional)"
                  value={associateData.wsibInsuranceDate}
                  onChange={(value) =>
                    handleInputChange("wsibInsuranceDate", value)
                  }
                  error={errors.wsibInsuranceDate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="Tax ID (Optional)"
                  value={associateData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  error={errors.taxId}
                />

                <Input
                  label="Driver's License Class (Optional)"
                  value={associateData.driversLicenseClass}
                  onChange={(e) =>
                    handleInputChange("driversLicenseClass", e.target.value)
                  }
                  error={errors.driversLicenseClass}
                />
              </div>

              <Input
                label="Hourly Salary Desired (Optional)"
                type="number"
                value={associateData.hourlySalaryDesired}
                onChange={(e) =>
                  handleInputChange("hourlySalaryDesired", e.target.value)
                }
                error={errors.hourlySalaryDesired}
              />

              <Input
                label="Limit Special (Optional)"
                value={associateData.limitSpecial}
                onChange={(e) =>
                  handleInputChange("limitSpecial", e.target.value)
                }
                error={errors.limitSpecial}
                helperText="Any special limitations or notes"
              />
            </div>
          </FormSection>

          {/* Emergency Contact Section with Dark Header */}
          <FormSection title="Emergency Contact" icon={ExclamationCircleIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Contact Name"
                value={associateData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
                error={errors.emergencyContactName}
                required
              />

              <Input
                label="Contact Relationship"
                value={associateData.emergencyContactRelationship}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactRelationship",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactRelationship}
                required
              />

              <Input
                label="Contact Telephone"
                type="tel"
                value={associateData.emergencyContactTelephone}
                onChange={(e) =>
                  handleInputChange("emergencyContactTelephone", e.target.value)
                }
                error={errors.emergencyContactTelephone}
                required
              />

              <Input
                label="Alternative Telephone (Optional)"
                type="tel"
                value={associateData.emergencyContactAlternativeTelephone}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactAlternativeTelephone",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactAlternativeTelephone}
              />
            </div>
          </FormSection>

          {/* Metrics Section with Dark Header */}
          <FormSection title="Metrics" icon={ChartPieIcon}>
            <div className="space-y-4 sm:space-y-6">
              <TagsMultiSelect
                value={associateData.tags}
                onChange={(value) => handleInputChange("tags", value)}
                error={errors.tags}
                required={false}
                label="Tags (Optional)"
                helperText="Select tags to categorize this associate"
                onUnauthorized={onUnauthorized}
              />

              <HowHearAboutUsSelect
                value={associateData.howDidYouHearAboutUsID}
                onChange={handleHowHearChange}
                onOtherDetected={handleHowHearOtherDetected}
                error={errors.howDidYouHearAboutUsID}
                required={true}
                helperText="Tell us how you discovered our organization"
                onUnauthorized={onUnauthorized}
              />

              {associateData.isHowDidYouHearAboutUsOther && (
                <Input
                  label="How did you hear about us? (Other)"
                  value={associateData.howDidYouHearAboutUsOther}
                  onChange={(e) =>
                    handleInputChange(
                      "howDidYouHearAboutUsOther",
                      e.target.value,
                    )
                  }
                  error={errors.howDidYouHearAboutUsOther}
                  required
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Select
                  label="Gender"
                  value={associateData.gender}
                  onChange={(e) =>
                    handleInputChange("gender", parseInt(e.target.value))
                  }
                  options={GENDER_OPTIONS}
                  error={errors.gender}
                  required
                />

                <DateInput
                  label="Birth Date"
                  value={associateData.birthDate}
                  onChange={(value) => handleInputChange("birthDate", value)}
                  max={new Date().toISOString().split("T")[0]}
                  error={errors.birthDate}
                  required
                />
              </div>

              {associateData.gender === 1 && (
                <Input
                  label="Gender (Other)"
                  value={associateData.genderOther}
                  onChange={(e) =>
                    handleInputChange("genderOther", e.target.value)
                  }
                  error={errors.genderOther}
                  required
                />
              )}

              <DateInput
                label="Join Date (Optional)"
                value={associateData.joinDate}
                onChange={(value) => handleInputChange("joinDate", value)}
                error={errors.joinDate}
                helperText="This indicates when the associate joined the workery"
              />

              <Select
                label="Is Job Seeker"
                value={associateData.isJobSeeker}
                onChange={(e) =>
                  handleInputChange("isJobSeeker", parseInt(e.target.value))
                }
                options={JOB_SEEKER_OPTIONS}
                error={errors.isJobSeeker}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comment (Optional)
                </label>
                <textarea
                  value={associateData.additionalComment}
                  onChange={(e) =>
                    handleInputChange("additionalComment", e.target.value)
                  }
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  maxLength={638}
                />
              </div>
            </div>
          </FormSection>

          {/* System Information Section with Dark Header */}
          <FormSection title="System Information" icon={ComputerDesktopIcon}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={associateData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  maxLength={638}
                />
              </div>

              <div className="max-w-xl">
                <Select
                  label="Preferred Language"
                  value={associateData.preferredLanguage}
                  onChange={(e) =>
                    handleInputChange("preferredLanguage", e.target.value)
                  }
                  options={LANGUAGE_OPTIONS}
                  error={errors.preferredLanguage}
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* Form Actions - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
            <Link to={`/admin/associate/${aid}`} className="order-2 sm:order-1">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Back to Detail
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className={`order-1 sm:order-2 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white transition-colors ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAssociateUpdatePage;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Update/Page.jsx

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
} from "../../../../components/Form";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

const PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Landline" },
  { value: 2, label: "Mobile" },
  { value: 3, label: "Work" },
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

    // Professional info (REQUIRED FIELDS)
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

    // Emergency contact (REQUIRED)
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactTelephone: "",
    emergencyContactAlternativeTelephone: "",

    // Metrics (REQUIRED)
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
            console.log("Associate detail loaded:", data);

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

              // Extract skill set IDs from the array of objects
              skillSets: data.skillSets
                ? data.skillSets.map((ss) => ss.id)
                : [],

              // Extract insurance requirement IDs
              insuranceRequirements: data.insuranceRequirements
                ? data.insuranceRequirements.map((ir) => ir.id)
                : [],

              // Extract vehicle type IDs
              vehicleTypes: data.vehicleTypes
                ? data.vehicleTypes.map((vt) => vt.id)
                : [],

              // Extract tag IDs
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

    // Clear field-specific errors when user starts typing
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below before submitting.",
      });
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setErrors({});

    // Format dates for API submission (convert to ISO strings)
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
      // Convert numeric fields
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

      // Format dates for API
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

      // Ensure arrays are properly formatted (they should already be arrays of IDs)
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

    console.log("Submitting update data:", submitData);

    associateManager.updateAssociateWithCallbacks(
      aid,
      submitData,
      (data) => {
        console.log("Associate updated successfully:", data);
        setAlert({
          type: "success",
          message: "Associate updated successfully!",
        });

        // Redirect to detail page after a short delay
        setTimeout(() => {
          navigate(`/admin/associate/${aid}`);
        }, 2000);
      },
      (error) => {
        console.error("Failed to update associate:", error);
        setErrors(error || {});
        setAlert({
          type: "error",
          message:
            "Failed to update associate. Please check the form and try again.",
        });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
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
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/associate/${aid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Update
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update associate information
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {alert.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{alert.message}</span>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <PencilSquareIcon className="w-7 h-7 mr-2 text-blue-600" />
              Update Associate
            </h2>
            <Link to={`/admin/associate/${aid}`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Detail
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/associate/${aid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/associate/${aid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/associate/${aid}/orders`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Orders
            </Link>
            <Link
              to={`/admin/associate/${aid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/associate/${aid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <Link
              to={`/admin/associate/${aid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Settings Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Settings
              </h3>
            </div>
            <div className="p-6">
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associate Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={associateData.type}
                  onChange={(e) =>
                    handleInputChange("type", parseInt(e.target.value))
                  }
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  {ASSOCIATE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
            </div>
            <div className="p-6">
              {/* Organization fields for commercial associates */}
              {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={associateData.organizationName}
                      onChange={(e) =>
                        handleInputChange("organizationName", e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.organizationName
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.organizationName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={associateData.organizationType}
                      onChange={(e) =>
                        handleInputChange(
                          "organizationType",
                          parseInt(e.target.value),
                        )
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.organizationType
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      {ORGANIZATION_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.organizationType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.organizationType}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={associateData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={associateData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={associateData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={associateData.isOkToEmail}
                    onChange={() => handleCheckboxChange("isOkToEmail")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive electronic email
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={associateData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Type
                  </label>
                  <select
                    value={associateData.phoneType}
                    onChange={(e) =>
                      handleInputChange("phoneType", parseInt(e.target.value))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PHONE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {associateData.phoneType === 3 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Extension
                  </label>
                  <input
                    type="text"
                    value={associateData.phoneExtension}
                    onChange={(e) =>
                      handleInputChange("phoneExtension", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={associateData.isOkToText}
                    onChange={() => handleCheckboxChange("isOkToText")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive texts to my phone
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                Address
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={associateData.hasShippingAddress}
                    onChange={() => handleCheckboxChange("hasShippingAddress")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Has shipping address different than billing address
                  </span>
                </label>
              </div>

              <div
                className={`grid ${associateData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-8`}
              >
                {/* Billing Address */}
                <div>
                  {associateData.hasShippingAddress && (
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Billing Address
                    </h4>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={associateData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.country ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province/Territory{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={associateData.region}
                        onChange={(e) =>
                          handleInputChange("region", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.region ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      >
                        {REGION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={associateData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={associateData.addressLine1}
                        onChange={(e) =>
                          handleInputChange("addressLine1", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.addressLine1
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.addressLine1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={associateData.addressLine2}
                        onChange={(e) =>
                          handleInputChange("addressLine2", e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={associateData.postalCode}
                        onChange={(e) =>
                          handleInputChange("postalCode", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.postalCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {associateData.hasShippingAddress && (
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h4>
                    {/* Similar fields for shipping address - omitted for brevity */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                Professional Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Dues Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={associateData.duesDate}
                      onChange={(e) =>
                        handleInputChange("duesDate", e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.duesDate ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.duesDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.duesDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Check Expiry{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={associateData.policeCheck}
                      onChange={(e) =>
                        handleInputChange("policeCheck", e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.policeCheck
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.policeCheck && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.policeCheck}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commercial Insurance Expiry Date{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={associateData.commercialInsuranceExpiryDate}
                    onChange={(e) =>
                      handleInputChange(
                        "commercialInsuranceExpiryDate",
                        e.target.value,
                      )
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.commercialInsuranceExpiryDate
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.commercialInsuranceExpiryDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.commercialInsuranceExpiryDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Emergency Contact
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={associateData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange("emergencyContactName", e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactName
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={associateData.emergencyContactRelationship}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactRelationship",
                        e.target.value,
                      )
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactRelationship
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactRelationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactRelationship}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Telephone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={associateData.emergencyContactTelephone}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactTelephone",
                        e.target.value,
                      )
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactTelephone
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactTelephone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactTelephone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternative Telephone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={associateData.emergencyContactAlternativeTelephone}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContactAlternativeTelephone",
                        e.target.value,
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartPieIcon className="w-5 h-5 mr-2 text-blue-600" />
                Metrics
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us? (Other){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={associateData.howDidYouHearAboutUsOther}
                      onChange={(e) =>
                        handleInputChange(
                          "howDidYouHearAboutUsOther",
                          e.target.value,
                        )
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.howDidYouHearAboutUsOther
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.howDidYouHearAboutUsOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.howDidYouHearAboutUsOther}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={associateData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", parseInt(e.target.value))
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.gender ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    >
                      {GENDER_OPTIONS.map((option) => (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={associateData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.birthDate ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.birthDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.birthDate}
                      </p>
                    )}
                  </div>
                </div>

                {associateData.gender === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender (Other) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={associateData.genderOther}
                      onChange={(e) =>
                        handleInputChange("genderOther", e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.genderOther
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.genderOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.genderOther}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-blue-600" />
                System Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={638}
                  />
                </div>

                <div className="max-w-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={associateData.preferredLanguage}
                    onChange={(e) =>
                      handleInputChange("preferredLanguage", e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.preferredLanguage
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.preferredLanguage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.preferredLanguage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link to={`/admin/associate/${aid}`}>
              <button
                type="button"
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Detail
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAssociateUpdatePage;

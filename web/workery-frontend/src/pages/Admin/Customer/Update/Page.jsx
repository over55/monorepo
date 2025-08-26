// File Path: web/workery-frontend/src/pages/Admin/Customer/Update/Page.jsx

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
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../services/Services";
import {
  HowHearAboutUsSelect,
  TagsMultiSelect,
} from "../../../../components/business/selects";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
} from "../../../../constants/Customer";
import { DateInput, Input, Select, Checkbox } from "../../../../components/UI";

// Option configurations
const CLIENT_TYPE_OPTIONS = [
  { value: RESIDENTIAL_CUSTOMER_TYPE_OF_ID, label: "Residential" },
  { value: COMMERCIAL_CUSTOMER_TYPE_OF_ID, label: "Commercial" },
];

const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Unknown" },
  { value: 2, label: "Private" },
  { value: 3, label: "Non-profit" },
  { value: 4, label: "Government" },
];

const CLIENT_PHONE_TYPE_OPTIONS = [
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

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
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

// Section Component with Dark Header - Matching FullPage.jsx style
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

function AdminCustomerUpdatePage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Form state
  const [customerData, setCustomerData] = useState({
    type: RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
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
    tags: [],
    howDidYouHearAboutUsID: "",
    isHowDidYouHearAboutUsOther: false,
    howDidYouHearAboutUsOther: "",
    gender: 0,
    genderOther: "",
    birthDate: "",
    joinDate: "",
    preferredLanguage: "English",
  });

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer details
  useEffect(() => {
    let mounted = true;

    const fetchCustomerDetail = async () => {
      if (!cid) {
        setAlert({ type: "error", message: "Invalid customer ID" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const response = await customerManager.getCustomerDetail(
          cid,
          onUnauthorized,
        );

        if (mounted) {
          setCustomer(response);

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

          setCustomerData({
            type: response.type || RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
            organizationName: response.organizationName || "",
            organizationType: response.organizationType || 0,
            firstName: response.firstName || "",
            lastName: response.lastName || "",
            email: response.email || "",
            phone: response.phone || "",
            phoneType: response.phoneType || 0,
            phoneExtension: response.phoneExtension || "",
            otherPhone: response.otherPhone || "",
            otherPhoneType: response.otherPhoneType || 0,
            otherPhoneExtension: response.otherPhoneExtension || "",
            isOkToText: response.isOkToText || false,
            isOkToEmail: response.isOkToEmail || false,
            country: response.country || "Canada",
            region: response.region || "",
            city: response.city || "",
            addressLine1: response.addressLine1 || "",
            addressLine2: response.addressLine2 || "",
            postalCode: response.postalCode || "",
            hasShippingAddress: response.hasShippingAddress || false,
            shippingName: response.shippingName || "",
            shippingPhone: response.shippingPhone || "",
            shippingCountry: response.shippingCountry || "Canada",
            shippingRegion: response.shippingRegion || "",
            shippingCity: response.shippingCity || "",
            shippingAddressLine1: response.shippingAddressLine1 || "",
            shippingAddressLine2: response.shippingAddressLine2 || "",
            shippingPostalCode: response.shippingPostalCode || "",
            tags: response.tags
              ? response.tags.map((tag) => {
                  if (typeof tag === "object" && tag !== null) {
                    return tag.id || tag.value || tag;
                  }
                  return tag;
                })
              : [],
            howDidYouHearAboutUsID:
              response.howDidYouHearAboutUsID ||
              response.howDidYouHearAboutUsId ||
              "",
            isHowDidYouHearAboutUsOther:
              response.howDidYouHearAboutUsText === "Other" ||
              response.isHowDidYouHearAboutUsOther ||
              false,
            howDidYouHearAboutUsOther: response.howDidYouHearAboutUsOther || "",
            gender: response.gender || 0,
            genderOther: response.genderOther || "",
            birthDate: formatDateForInput(response.birthDate),
            joinDate: formatDateForInput(response.joinDate),
            preferredLanguage: response.preferredLanguage || "English",
          });

          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch customer details:", error);
          setAlert({
            type: "error",
            message: "Failed to load customer details. Please try again.",
          });
          setIsLoading(false);
        }
      }
    };

    fetchCustomerDetail();

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, navigate]);

  const handleInputChange = (field, value) => {
    setCustomerData((prev) => ({
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
    setCustomerData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!customerData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!customerData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!customerData.type) {
      newErrors.type = "Customer type is required";
    }

    if (customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      if (!customerData.organizationName.trim()) {
        newErrors.organizationName =
          "Organization name is required for commercial customers";
      }
    }

    if (!customerData.country) {
      newErrors.country = "Country is required";
    }
    if (!customerData.region.trim()) {
      newErrors.region = "Province/Territory is required";
    }
    if (!customerData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!customerData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }
    if (!customerData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    if (customerData.hasShippingAddress) {
      if (!customerData.shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
      }
      if (!customerData.shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
      }
      if (!customerData.shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
      }
      if (!customerData.shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
      }
      if (!customerData.shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
      }
      if (!customerData.shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
      }
      if (!customerData.shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
      }
    }

    if (!customerData.howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "How did you hear about us is required";
    }
    if (
      customerData.isHowDidYouHearAboutUsOther &&
      !customerData.howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }
    if (customerData.gender === 1 && !customerData.genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert(null);

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

    const submitData = {
      id: cid,
      type: customerData.type,
      organizationName: customerData.organizationName,
      organizationType: customerData.organizationType
        ? parseInt(customerData.organizationType)
        : null,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      phoneType: customerData.phoneType
        ? parseInt(customerData.phoneType)
        : null,
      phoneExtension: customerData.phoneExtension,
      otherPhone: customerData.otherPhone,
      otherPhoneExtension: customerData.otherPhoneExtension,
      otherPhoneType: customerData.otherPhoneType
        ? parseInt(customerData.otherPhoneType)
        : null,
      isOkToText: customerData.isOkToText,
      isOkToEmail: customerData.isOkToEmail,
      postalCode: customerData.postalCode,
      addressLine1: customerData.addressLine1,
      addressLine2: customerData.addressLine2,
      city: customerData.city,
      region: customerData.region,
      country: customerData.country,
      hasShippingAddress: customerData.hasShippingAddress,
      shippingName: customerData.shippingName,
      shippingPhone: customerData.shippingPhone,
      shippingCountry: customerData.shippingCountry,
      shippingRegion: customerData.shippingRegion,
      shippingCity: customerData.shippingCity,
      shippingAddressLine1: customerData.shippingAddressLine1,
      shippingAddressLine2: customerData.shippingAddressLine2,
      shippingPostalCode: customerData.shippingPostalCode,
      tags: customerData.tags.filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          tag !== "" &&
          tag !== "0" &&
          tag !== 0,
      ),
      gender: customerData.gender ? parseInt(customerData.gender) : null,
      genderOther: customerData.genderOther,
      joinDate: customerData.joinDate,
      birthDate: customerData.birthDate,
      howDidYouHearAboutUsID: customerData.howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther: customerData.isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther: customerData.howDidYouHearAboutUsOther,
      preferredLanguage: customerData.preferredLanguage,
    };

    try {
      await customerManager.updateCustomer(cid, submitData, onUnauthorized);

      setAlert({
        type: "success",
        message: "Customer updated successfully!",
      });

      setTimeout(() => {
        navigate(`/admin/customer/${cid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update customer:", error);

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
                "Failed to update customer. Please correct the following errors:",
              details: errorList,
            });
          } else {
            setAlert({
              type: "error",
              message:
                error.general ||
                error.message ||
                "Failed to update customer. Please check the form and try again.",
            });
          }
        } else {
          setAlert({
            type: "error",
            message:
              error.message ||
              error.detail ||
              "Failed to update customer. Please try again.",
          });
        }
      } else {
        setAlert({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading customer details...
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
                to="/admin/customers"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Customers
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/customer/${cid}`}
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
              Customer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              Update customer information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {customer && customer.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This customer is archived
        </div>
      )}
      {customer && customer.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <NoSymbolIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This customer is banned
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
              Update Customer
            </h2>
            <Link to={`/admin/customer/${cid}`} className="flex-shrink-0">
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
                to={`/admin/customer/${cid}`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Summary
              </Link>
              <Link
                to={`/admin/customer/${cid}/detail`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Detail
              </Link>
              <Link
                to={`/admin/customer/${cid}/orders`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Orders
              </Link>
              <Link
                to={`/admin/customer/${cid}/comments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Comments
              </Link>
              <Link
                to={`/admin/customer/${cid}/attachments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Attachments
              </Link>
              <Link
                to={`/admin/customer/${cid}/more`}
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
                label="Customer Type"
                value={customerData.type}
                onChange={(e) =>
                  handleInputChange("type", parseInt(e.target.value))
                }
                options={CLIENT_TYPE_OPTIONS}
                error={errors.type}
                required
              />
            </div>
          </FormSection>

          {/* Contact Information Section with Dark Header */}
          <FormSection title="Contact Information" icon={UserIcon}>
            {/* Organization fields for commercial customers */}
            {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <Input
                  label="Organization Name"
                  value={customerData.organizationName}
                  onChange={(e) =>
                    handleInputChange("organizationName", e.target.value)
                  }
                  error={errors.organizationName}
                  required
                />

                <Select
                  label="Organization Type"
                  value={customerData.organizationType}
                  onChange={(e) =>
                    handleInputChange(
                      "organizationType",
                      parseInt(e.target.value),
                    )
                  }
                  options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
                  error={errors.organizationType}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="First Name"
                value={customerData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                value={customerData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <Input
                label="Email"
                type="email"
                value={customerData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                helperText="Optional - a temporary email will be generated if not provided"
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="I agree to receive electronic email"
                checked={customerData.isOkToEmail}
                onChange={() => handleCheckboxChange("isOkToEmail")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Phone"
                type="tel"
                value={customerData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
              />

              <Select
                label="Phone Type"
                value={customerData.phoneType}
                onChange={(e) =>
                  handleInputChange("phoneType", parseInt(e.target.value))
                }
                options={CLIENT_PHONE_TYPE_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {customerData.phoneType == CLIENT_PHONE_TYPE_WORK && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Phone Extension"
                  value={customerData.phoneExtension}
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
                checked={customerData.isOkToText}
                onChange={() => handleCheckboxChange("isOkToText")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Other Phone (Optional)"
                type="tel"
                value={customerData.otherPhone}
                onChange={(e) =>
                  handleInputChange("otherPhone", e.target.value)
                }
                error={errors.otherPhone}
              />

              <Select
                label="Other Phone Type"
                value={customerData.otherPhoneType}
                onChange={(e) =>
                  handleInputChange("otherPhoneType", parseInt(e.target.value))
                }
                options={CLIENT_PHONE_TYPE_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {customerData.otherPhoneType == CLIENT_PHONE_TYPE_WORK && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Other Phone Extension"
                  value={customerData.otherPhoneExtension}
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
                checked={customerData.hasShippingAddress}
                onChange={() => handleCheckboxChange("hasShippingAddress")}
              />
            </div>

            <div
              className={`grid ${customerData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 sm:gap-8`}
            >
              {/* Billing Address */}
              <div>
                {customerData.hasShippingAddress && (
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Billing Address
                  </h4>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="Country"
                    value={customerData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    error={errors.country}
                    required
                  />

                  <Select
                    label="Province/Territory"
                    value={customerData.region}
                    onChange={(e) =>
                      handleInputChange("region", e.target.value)
                    }
                    options={REGION_OPTIONS}
                    error={errors.region}
                    required
                  />

                  <Input
                    label="City"
                    value={customerData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={customerData.addressLine1}
                    onChange={(e) =>
                      handleInputChange("addressLine1", e.target.value)
                    }
                    error={errors.addressLine1}
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={customerData.addressLine2}
                    onChange={(e) =>
                      handleInputChange("addressLine2", e.target.value)
                    }
                    error={errors.addressLine2}
                  />

                  <Input
                    label="Postal Code"
                    value={customerData.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    error={errors.postalCode}
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              {customerData.hasShippingAddress && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Shipping Address
                  </h4>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label="Name"
                      value={customerData.shippingName}
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
                      value={customerData.shippingPhone}
                      onChange={(e) =>
                        handleInputChange("shippingPhone", e.target.value)
                      }
                      placeholder="The contact phone number for this shipping address"
                      error={errors.shippingPhone}
                      required
                    />

                    <Input
                      label="Country"
                      value={customerData.shippingCountry}
                      onChange={(e) =>
                        handleInputChange("shippingCountry", e.target.value)
                      }
                      error={errors.shippingCountry}
                      required
                    />

                    <Select
                      label="Province/Territory"
                      value={customerData.shippingRegion}
                      onChange={(e) =>
                        handleInputChange("shippingRegion", e.target.value)
                      }
                      options={REGION_OPTIONS}
                      error={errors.shippingRegion}
                      required
                    />

                    <Input
                      label="City"
                      value={customerData.shippingCity}
                      onChange={(e) =>
                        handleInputChange("shippingCity", e.target.value)
                      }
                      error={errors.shippingCity}
                      required
                    />

                    <Input
                      label="Address Line 1"
                      value={customerData.shippingAddressLine1}
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
                      value={customerData.shippingAddressLine2}
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
                      value={customerData.shippingPostalCode}
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

          {/* Metrics Section with Dark Header */}
          <FormSection title="Metrics" icon={ChartPieIcon}>
            <div className="space-y-4 sm:space-y-6">
              <TagsMultiSelect
                value={customerData.tags}
                onChange={(value) => handleInputChange("tags", value)}
                error={errors.tags}
                required={false}
                label="Tags (Optional)"
                helperText="Select tags to categorize this customer"
                onUnauthorized={onUnauthorized}
              />

              <HowHearAboutUsSelect
                value={customerData.howDidYouHearAboutUsID}
                onChange={handleHowHearChange}
                onOtherDetected={handleHowHearOtherDetected}
                error={errors.howDidYouHearAboutUsID}
                required={true}
                helperText="Tell us how you discovered our organization"
                onUnauthorized={onUnauthorized}
              />

              {customerData.isHowDidYouHearAboutUsOther && (
                <Input
                  label="How did you hear about us? (Other)"
                  value={customerData.howDidYouHearAboutUsOther}
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
                  value={customerData.gender}
                  onChange={(e) =>
                    handleInputChange("gender", parseInt(e.target.value))
                  }
                  options={GENDER_OPTIONS}
                  error={errors.gender}
                />

                <DateInput
                  label="Birth Date (Optional)"
                  value={customerData.birthDate}
                  onChange={(value) => handleInputChange("birthDate", value)}
                  max={new Date().toISOString().split("T")[0]}
                  error={errors.birthDate}
                  disabled={false}
                  required={false}
                />
              </div>

              {customerData.gender === 1 && (
                <Input
                  label="Gender (Other)"
                  value={customerData.genderOther}
                  onChange={(e) =>
                    handleInputChange("genderOther", e.target.value)
                  }
                  error={errors.genderOther}
                  required
                />
              )}

              <DateInput
                label="Join Date (Optional)"
                value={customerData.joinDate}
                onChange={(value) => handleInputChange("joinDate", value)}
                error={errors.joinDate}
                helperText="This indicates when the user joined the workery"
                disabled={false}
                required={false}
              />
            </div>
          </FormSection>

          {/* System Information Section with Dark Header */}
          <FormSection title="System Information" icon={ComputerDesktopIcon}>
            <div className="max-w-xl">
              <Select
                label="Preferred Language"
                value={customerData.preferredLanguage}
                onChange={(e) =>
                  handleInputChange("preferredLanguage", e.target.value)
                }
                options={LANGUAGE_OPTIONS}
                error={errors.preferredLanguage}
              />
            </div>
          </FormSection>

          {/* Form Actions - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
            <Link to={`/admin/customer/${cid}`} className="order-2 sm:order-1">
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

export default AdminCustomerUpdatePage;

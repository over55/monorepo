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
import { DateInput } from "../../../../components/UI";

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
    // Settings
    type: RESIDENTIAL_CUSTOMER_TYPE_OF_ID,

    // Contact
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

    // Metrics
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
          console.log("Customer detail fetched:", response);
          setCustomer(response);

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

            // Extract tag IDs from tag objects
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

    // Clear field-specific errors when user starts typing
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

    // Required fields validation
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

    // Commercial customer validation
    if (customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      if (!customerData.organizationName.trim()) {
        newErrors.organizationName =
          "Organization name is required for commercial customers";
      }
    }

    // Address validation
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

    // Shipping address validation if enabled
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

    // Metrics validation
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
    console.log("onSubmitClick: Beginning...");

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

    // Prepare data for submission
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

    console.log("Submitting data:", submitData);

    try {
      const response = await customerManager.updateCustomer(
        cid,
        submitData,
        onUnauthorized,
      );
      console.log("Customer updated successfully:", response);

      setAlert({
        type: "success",
        message: "Customer updated successfully!",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update customer:", error);
      setErrors(error || {});
      setAlert({
        type: "error",
        message:
          "Failed to update customer. Please check the form and try again.",
      });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
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
                to="/admin/customers"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Customers
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/customer/${cid}`}
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
              Customer
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update customer information
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

      {/* Status Alert for Archived Customer */}
      {customer && customer.status === 2 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
          <div className="flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            <span>This customer is archived</span>
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
              Update Customer
            </h2>
            <Link to={`/admin/customer/${cid}`}>
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
              to={`/admin/customer/${cid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/customer/${cid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/customer/${cid}/orders`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Orders
            </Link>
            <Link
              to={`/admin/customer/${cid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/customer/${cid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <Link
              to={`/admin/customer/${cid}/more`}
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
                  Customer Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerData.type}
                  onChange={(e) =>
                    handleInputChange("type", parseInt(e.target.value))
                  }
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                >
                  {CLIENT_TYPE_OPTIONS.map((option) => (
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
              {/* Organization fields for commercial customers */}
              {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.organizationName}
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
                      Organization Type
                    </label>
                    <select
                      value={customerData.organizationType}
                      onChange={(e) =>
                        handleInputChange(
                          "organizationType",
                          parseInt(e.target.value),
                        )
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CLIENT_ORGANIZATION_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                    value={customerData.firstName}
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
                    value={customerData.lastName}
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
                  Email
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional - a temporary email will be generated if not provided"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional field if not set then workery will generate a
                  temporary email.
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customerData.isOkToEmail}
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
                    value={customerData.phone}
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
                    value={customerData.phoneType}
                    onChange={(e) =>
                      handleInputChange("phoneType", parseInt(e.target.value))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {customerData.phoneType == CLIENT_PHONE_TYPE_WORK && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Extension
                  </label>
                  <input
                    type="text"
                    value={customerData.phoneExtension}
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
                    checked={customerData.isOkToText}
                    onChange={() => handleCheckboxChange("isOkToText")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive texts to my phone
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.otherPhone}
                    onChange={(e) =>
                      handleInputChange("otherPhone", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone Type
                  </label>
                  <select
                    value={customerData.otherPhoneType}
                    onChange={(e) =>
                      handleInputChange(
                        "otherPhoneType",
                        parseInt(e.target.value),
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {customerData.otherPhoneType == CLIENT_PHONE_TYPE_WORK && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone Extension
                  </label>
                  <input
                    type="text"
                    value={customerData.otherPhoneExtension}
                    onChange={(e) =>
                      handleInputChange("otherPhoneExtension", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
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
                    checked={customerData.hasShippingAddress}
                    onChange={() => handleCheckboxChange("hasShippingAddress")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Has shipping address different than billing address
                  </span>
                </label>
              </div>

              <div
                className={`grid ${customerData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-8`}
              >
                {/* Billing Address */}
                <div>
                  {customerData.hasShippingAddress && (
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
                        value={customerData.country}
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
                        value={customerData.region}
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
                        value={customerData.city}
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
                        value={customerData.addressLine1}
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
                        value={customerData.addressLine2}
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
                        value={customerData.postalCode}
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
                {customerData.hasShippingAddress && (
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerData.shippingName}
                          onChange={(e) =>
                            handleInputChange("shippingName", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingName
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="The name to contact for this shipping address"
                          required
                        />
                        {errors.shippingName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerData.shippingPhone}
                          onChange={(e) =>
                            handleInputChange("shippingPhone", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingPhone
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="The contact phone number for this shipping address"
                          required
                        />
                        {errors.shippingPhone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerData.shippingCountry}
                          onChange={(e) =>
                            handleInputChange("shippingCountry", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingCountry
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.shippingCountry && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingCountry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Province/Territory{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={customerData.shippingRegion}
                          onChange={(e) =>
                            handleInputChange("shippingRegion", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingRegion
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required
                        >
                          {REGION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.shippingRegion && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingRegion}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerData.shippingCity}
                          onChange={(e) =>
                            handleInputChange("shippingCity", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingCity
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.shippingCity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerData.shippingAddressLine1}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingAddressLine1",
                              e.target.value,
                            )
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingAddressLine1
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.shippingAddressLine1 && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingAddressLine1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={customerData.shippingAddressLine2}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingAddressLine2",
                              e.target.value,
                            )
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
                          value={customerData.shippingPostalCode}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingPostalCode",
                              e.target.value,
                            )
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingPostalCode
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us? (Other){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.howDidYouHearAboutUsOther}
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
                      Gender
                    </label>
                    <select
                      value={customerData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", parseInt(e.target.value))
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Date (Optional)
                    </label>
                    <DateInput
                      value={customerData.birthDate}
                      onChange={(value) =>
                        handleInputChange("birthDate", value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      error={errors.birthDate}
                      disabled={false}
                      required={false}
                    />
                  </div>
                </div>

                {customerData.gender === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender (Other) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.genderOther}
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

                <div>
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
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={customerData.preferredLanguage}
                  onChange={(e) =>
                    handleInputChange("preferredLanguage", e.target.value)
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link to={`/admin/customer/${cid}`}>
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

export default AdminCustomerUpdatePage;

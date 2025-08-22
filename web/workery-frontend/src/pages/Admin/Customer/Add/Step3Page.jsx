// File Path: monorepo/web/workery-frontend/src/pages/Admin/Customer/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  CUSTOMER_PHONE_TYPE_WORK,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

function AdminCustomerAddStep3Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [customerType, setCustomerType] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(1);
  const [phoneExtension, setPhoneExtension] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToText, setIsOkToText] = useState(true);
  const [isOkToEmail, setIsOkToEmail] = useState(true);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Load existing customer creation state
    loadCustomerState();
  }, [authManager, navigate]);

  const loadCustomerState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_CUSTOMER_CREATION_STATE",
      );
      if (existing) {
        const customerState = JSON.parse(existing);

        setCustomerType(customerState.type || null);
        setOrganizationName(customerState.organizationName || "");
        setOrganizationType(customerState.organizationType || 0);
        setEmail(customerState.email || "");
        setPhone(customerState.phone || "");
        setPhoneType(customerState.phoneType || 1);
        setPhoneExtension(customerState.phoneExtension || "");
        setFirstName(customerState.firstName || "");
        setLastName(customerState.lastName || "");
        setOtherPhone(customerState.otherPhone || "");
        setOtherPhoneType(customerState.otherPhoneType || 0);
        setOtherPhoneExtension(customerState.otherPhoneExtension || "");
        setIsOkToText(
          customerState.isOkToText !== undefined
            ? customerState.isOkToText
            : true,
        );
        setIsOkToEmail(
          customerState.isOkToEmail !== undefined
            ? customerState.isOkToEmail
            : true,
        );
      } else {
        // No state found, redirect back to step 2
        navigate("/admin/customers/add/step-2");
      }
    } catch (error) {
      console.error("Error loading customer state:", error);
      navigate("/admin/customers/add/step-2");
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Validation for commercial customers
    if (customerType === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      if (!organizationName.trim()) {
        newErrors.organizationName = "Organization name is required";
        hasErrors = true;
      }
      if (organizationType === 0) {
        newErrors.organizationType = "Organization type is required";
        hasErrors = true;
      }
    }

    // General validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors.phoneType = "Phone type is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Save to session storage
    const customerState = {
      type: customerType,
      organizationName,
      organizationType,
      firstName,
      lastName,
      email,
      phone,
      phoneType,
      phoneExtension,
      otherPhone,
      otherPhoneType,
      otherPhoneExtension,
      isOkToText,
      isOkToEmail,
      // Keep any existing data from previous steps
      ...getExistingState(),
    };

    try {
      sessionStorage.setItem(
        "WORKERY_CUSTOMER_CREATION_STATE",
        JSON.stringify(customerState),
      );
      navigate("/admin/customers/add/step-4");
    } catch (error) {
      console.error("Error saving customer state:", error);
      setErrors({ general: "Failed to save data. Please try again." });
    }
  };

  const getExistingState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_CUSTOMER_CREATION_STATE",
      );
      return existing ? JSON.parse(existing) : {};
    } catch (error) {
      return {};
    }
  };

  if (customerType === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

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
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/customers"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Customers
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Add New Customer
          </h1>
        </div>

        {/* Wizard Steps - Responsive Version */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {/* Mobile/Tablet View (< 1920px) */}
            <div className="xl:hidden w-full overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Search
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600"></div>

                {/* Step 2 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Type
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Contact
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Basic Info
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Address
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Location
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 5 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      5
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Account
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Settings
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 6 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      6
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Metrics
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Performance
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 7 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      7
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Comments
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Notes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View (≥ 1920px) - Original Layout */}
            <div className="hidden xl:flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Contact</p>
                  <p className="text-xs text-gray-500">Basic Info</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-xs text-gray-400">Location</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Account</p>
                  <p className="text-xs text-gray-400">Settings</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 6 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Metrics</p>
                  <p className="text-xs text-gray-400">Performance</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 - Inactive */}
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
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <IdentificationIcon className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {/* Commercial Customer Fields */}
                  {customerType === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 flex items-center">
                          <BuildingOfficeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span>
                            Commercial Customer - Additional Information
                            Required
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Organization Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={organizationName}
                            onChange={(e) =>
                              setOrganizationName(e.target.value)
                            }
                            placeholder="Enter organization name"
                            className={`w-full pl-10 pr-3 py-2 border ${
                              errors.organizationName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.organizationName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.organizationName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Organization Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            value={organizationType}
                            onChange={(e) =>
                              setOrganizationType(parseInt(e.target.value))
                            }
                            className={`w-full pl-10 pr-3 py-2 border ${
                              errors.organizationType
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                          >
                            <option value={0}>Please select</option>
                            <option value={1}>Private</option>
                            <option value={2}>Non-profit</option>
                            <option value={3}>Government</option>
                          </select>
                        </div>
                        {errors.organizationType && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.organizationType}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter first name"
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter last name"
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Email Consent */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOkToEmail"
                      checked={isOkToEmail}
                      onChange={(e) => setIsOkToEmail(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isOkToEmail"
                      className="ml-2 text-sm font-semibold text-gray-700"
                    >
                      I agree to receive electronic email
                    </label>
                  </div>

                  {/* Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={phoneType}
                          onChange={(e) =>
                            setPhoneType(parseInt(e.target.value))
                          }
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.phoneType
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                        >
                          <option value={0}>Please select</option>
                          <option value={1}>Mobile</option>
                          <option value={2}>Work</option>
                          <option value={3}>Home</option>
                        </select>
                      </div>
                      {errors.phoneType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phoneType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone Extension - Only show for Work phone */}
                  {phoneType === CUSTOMER_PHONE_TYPE_WORK && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Extension (Optional)
                      </label>
                      <input
                        type="text"
                        value={phoneExtension}
                        onChange={(e) => setPhoneExtension(e.target.value)}
                        placeholder="Enter extension"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Text Consent */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOkToText"
                      checked={isOkToText}
                      onChange={(e) => setIsOkToText(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isOkToText"
                      className="ml-2 text-sm font-semibold text-gray-700"
                    >
                      I agree to receive texts to my phone
                    </label>
                  </div>

                  {/* Other Phone (Optional) */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Other Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={otherPhone}
                            onChange={(e) => setOtherPhone(e.target.value)}
                            placeholder="Enter other phone number"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {otherPhone && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Other Phone Type
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              value={otherPhoneType}
                              onChange={(e) =>
                                setOtherPhoneType(parseInt(e.target.value))
                              }
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                              <option value={0}>Please select</option>
                              <option value={1}>Mobile</option>
                              <option value={2}>Work</option>
                              <option value={3}>Home</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Other Phone Extension - Only show for Work phone */}
                    {otherPhoneType === CUSTOMER_PHONE_TYPE_WORK &&
                      otherPhone && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Other Phone Extension (Optional)
                          </label>
                          <input
                            type="text"
                            value={otherPhoneExtension}
                            onChange={(e) =>
                              setOtherPhoneExtension(e.target.value)
                            }
                            placeholder="Enter extension"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/customers/add/step-2"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
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
    </div>
  );
}

export default AdminCustomerAddStep3Page;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

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

function AdminAssociateAddStep3Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [associateType, setAssociateType] = useState(null);
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

    // Load existing associate creation state
    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        const associateState = JSON.parse(existing);

        setAssociateType(associateState.type || null);
        setOrganizationName(associateState.organizationName || "");
        setOrganizationType(associateState.organizationType || 0);
        setEmail(associateState.email || "");
        setPhone(associateState.phone || "");
        setPhoneType(associateState.phoneType || 1);
        setPhoneExtension(associateState.phoneExtension || "");
        setFirstName(associateState.firstName || "");
        setLastName(associateState.lastName || "");
        setOtherPhone(associateState.otherPhone || "");
        setOtherPhoneType(associateState.otherPhoneType || 0);
        setOtherPhoneExtension(associateState.otherPhoneExtension || "");
        setIsOkToText(
          associateState.isOkToText !== undefined
            ? associateState.isOkToText
            : true,
        );
        setIsOkToEmail(
          associateState.isOkToEmail !== undefined
            ? associateState.isOkToEmail
            : true,
        );
      } else {
        // No state found, redirect back to step 2
        navigate("/admin/associates/add/step-2");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-2");
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Validation for commercial associates
    if (associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
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
    // FIXED: Spread existing state FIRST, then override with new values
    const associateState = {
      // Keep any existing data from previous steps
      ...getExistingState(),
      // Then override with current form values
      type: associateType,
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
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-4");
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

  if (associateType === null) {
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
            Enter contact information for the new associate
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 3: Contact
                  </p>
                  <p className="text-xs text-gray-500">Basic Information</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">3 of 7</div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-2 Complete */}
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 ? "Search" : "Type"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

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

              {/* Remaining Steps */}
              {[
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold">
                        {step.num}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
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

        {/* Main Form - UPDATED: Removed max-w-3xl mx-auto constraint */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Submitting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitClick}>
            <div className="space-y-0">
              {/* Commercial Associate Section */}
              {associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                <DetailSection
                  title="Organization Information"
                  icon={BuildingOfficeIcon}
                  description="Commercial associate details"
                >
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Enter organization name"
                          className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                            errors.organizationName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                      </div>
                      {errors.organizationName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.organizationName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Organization Type{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={organizationType}
                          onChange={(e) =>
                            setOrganizationType(parseInt(e.target.value))
                          }
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                            errors.organizationType
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base transition-colors`}
                        >
                          <option value={0}>Please select</option>
                          <option value={1}>Private</option>
                          <option value={2}>Non-profit</option>
                          <option value={3}>Government</option>
                        </select>
                      </div>
                      {errors.organizationType && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.organizationType}
                        </p>
                      )}
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Personal Information Section */}
              <DetailSection
                title="Personal Information"
                icon={UserIcon}
                description="Associate contact details"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter first name"
                          className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter last name"
                          className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Email Consent */}
                  <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isOkToEmail"
                      checked={isOkToEmail}
                      onChange={(e) => setIsOkToEmail(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isOkToEmail"
                      className="ml-2 text-xs sm:text-sm font-semibold text-gray-700"
                    >
                      I agree to receive electronic email
                    </label>
                  </div>
                </div>
              </DetailSection>

              {/* Phone Information Section */}
              <DetailSection
                title="Phone Information"
                icon={PhoneIcon}
                description="Primary and alternative contact numbers"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Primary Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                          className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Phone Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={phoneType}
                          onChange={(e) =>
                            setPhoneType(parseInt(e.target.value))
                          }
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                            errors.phoneType
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base transition-colors`}
                        >
                          <option value={0}>Please select</option>
                          <option value={1}>Mobile</option>
                          <option value={2}>Work</option>
                          <option value={3}>Home</option>
                        </select>
                      </div>
                      {errors.phoneType && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.phoneType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone Extension - Only show for Work phone */}
                  {phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Phone Extension (Optional)
                      </label>
                      <input
                        type="text"
                        value={phoneExtension}
                        onChange={(e) => setPhoneExtension(e.target.value)}
                        placeholder="Enter extension"
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>
                  )}

                  {/* Text Consent */}
                  <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isOkToText"
                      checked={isOkToText}
                      onChange={(e) => setIsOkToText(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isOkToText"
                      className="ml-2 text-xs sm:text-sm font-semibold text-gray-700"
                    >
                      I agree to receive texts to my phone
                    </label>
                  </div>

                  {/* Alternative Phone Section */}
                  <div className="border-t pt-4 sm:pt-6">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">
                      Alternative Phone (Optional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Other Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={otherPhone}
                            onChange={(e) => setOtherPhone(e.target.value)}
                            placeholder="Enter other phone number"
                            className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                          />
                        </div>
                      </div>

                      {otherPhone && (
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Other Phone Type
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                            </div>
                            <select
                              value={otherPhoneType}
                              onChange={(e) =>
                                setOtherPhoneType(parseInt(e.target.value))
                              }
                              className="w-full pl-10 pr-8 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base transition-colors"
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

                    {/* Other Phone Extension */}
                    {otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK &&
                      otherPhone && (
                        <div className="mt-4">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Other Phone Extension (Optional)
                          </label>
                          <input
                            type="text"
                            value={otherPhoneExtension}
                            onChange={(e) =>
                              setOtherPhoneExtension(e.target.value)
                            }
                            placeholder="Enter extension"
                            className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                          />
                        </div>
                      )}
                  </div>
                </div>
              </DetailSection>

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/associates/add/step-2" className="flex-1">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </button>
                </Link>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateAddStep3Page;

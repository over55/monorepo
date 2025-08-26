// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/Staff";

// DetailSection Component with Dark Header
const DetailSection = ({ title, icon: Icon, children }) => (
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

function AdminStaffAddStep3Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const wizardState = wizardStorage.getWizardState();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState(wizardState.email || "");
  const [phone, setPhone] = useState(wizardState.phone || "");
  const [phoneType, setPhoneType] = useState(wizardState.phoneType || 0);
  const [phoneExtension, setPhoneExtension] = useState(
    wizardState.phoneExtension || "",
  );
  const [firstName, setFirstName] = useState(wizardState.firstName || "");
  const [lastName, setLastName] = useState(wizardState.lastName || "");
  const [otherPhone, setOtherPhone] = useState(wizardState.otherPhone || "");
  const [otherPhoneType, setOtherPhoneType] = useState(
    wizardState.otherPhoneType || 0,
  );
  const [otherPhoneExtension, setOtherPhoneExtension] = useState(
    wizardState.otherPhoneExtension || "",
  );
  const [isOkToText, setIsOkToText] = useState(wizardState.isOkToText || false);
  const [isOkToEmail, setIsOkToEmail] = useState(
    wizardState.isOkToEmail || false,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

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
      window.scrollTo(0, 0);
      return;
    }

    // Save to wizard storage
    wizardStorage.updateWizardState({
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
    });

    navigate("/admin/staff/add/step-4");
  };

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
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to="/admin/staff"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Staff
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Staff Member
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Enter contact information
          </p>
        </div>

        {/* Wizard Steps - Mobile Simplified */}
        <div className="mb-4 sm:mb-6">
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

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-2 Complete */}
              {[1, 2].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
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

              {[
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Comments", subtitle: "Notes" },
                { num: 7, title: "Complete", subtitle: "Finish" },
              ].map((step) => (
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

        {/* Error Message - Responsive */}
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center break-words">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                {errors.general}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Submitting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitClick} className="max-w-4xl mx-auto">
            <div className="space-y-0">
              {/* Personal Information Section */}
              <DetailSection title="Personal Information" icon={UserIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </DetailSection>

              {/* Contact Information Section */}
              <DetailSection title="Contact Information" icon={PhoneIcon}>
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
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
                      className="ml-2 text-xs sm:text-sm font-semibold text-gray-700"
                    >
                      I agree to receive electronic email
                    </label>
                  </div>

                  {/* Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.phoneType
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base`}
                        >
                          {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.map(
                            (option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ),
                          )}
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
                  {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
                    (opt) => opt.value === phoneType,
                  )?.label === "Work" && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Phone Extension (Optional)
                      </label>
                      <input
                        type="text"
                        value={phoneExtension}
                        onChange={(e) => setPhoneExtension(e.target.value)}
                        placeholder="Enter extension"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                      className="ml-2 text-xs sm:text-sm font-semibold text-gray-700"
                    >
                      I agree to receive texts to my phone
                    </label>
                  </div>

                  {/* Other Phone (Optional) */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Alternative Contact (Optional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {otherPhone && (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base"
                            >
                              {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Other Phone Extension */}
                    {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
                      (opt) => opt.value === otherPhoneType,
                    )?.label === "Work" &&
                      otherPhone && (
                        <div className="mt-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Other Phone Extension
                          </label>
                          <input
                            type="text"
                            value={otherPhoneExtension}
                            onChange={(e) =>
                              setOtherPhoneExtension(e.target.value)
                            }
                            placeholder="Enter extension"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      )}
                  </div>
                </div>
              </DetailSection>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/staff/add/step-2"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-1 sm:order-2"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminStaffAddStep3Page;

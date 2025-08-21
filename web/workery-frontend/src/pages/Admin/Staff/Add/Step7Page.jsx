// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step7Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useStaffManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  TagsDisplay,
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
} from "../../../../components/Display";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import {
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";

function AdminStaffAddStep7Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const staffManager = useStaffManager();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare the payload
      const payload = { ...wizardState };

      // Call the API to create staff
      const response = await staffManager.createStaff(payload, onUnauthorized);

      // Clear wizard state
      wizardStorage.clearWizardState();

      // Navigate to the new staff detail page with success message
      navigate(`/admin/staff/${response.id}`, {
        state: { successMessage: "Staff member created successfully!" },
      });
    } catch (error) {
      console.error("Error creating staff:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneType = (typeValue) => {
    const option = STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
      (opt) => opt.value === typeValue,
    );
    return option ? option.label : "-";
  };

  const formatGender = (genderValue) => {
    const option = GENDER_OPTIONS_WITH_EMPTY_OPTION.find(
      (opt) => opt.value === genderValue,
    );
    return option ? option.label : "-";
  };

  const formatIdentifyAs = (values) => {
    if (!values || values.length === 0) return "-";
    return values
      .map((val) => {
        const option = IDENTIFY_AS_OPTIONS.find((opt) => opt.value === val);
        return option ? option.label : val;
      })
      .join(", ");
  };

  const formatStaffType = (typeValue) => {
    const option = STAFF_TYPE_FILTER_OPTIONS.find(
      (opt) => opt.value === typeValue,
    );
    return option ? option.label : "-";
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

  if (!wizardState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
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
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/staff"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Staff</span>
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
            <UserPlusIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Add New Staff Member
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-6 Complete */}
              {[1, 2, 3, 4, 5, 6].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                        {step === 4 && "Address"}
                        {step === 5 && "Account"}
                        {step === 6 && "Metrics"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 7 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    7
                  </span>
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Review
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Submit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View (below 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 7 of 7
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Review and Submit
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following staff details. If everything
              looks correct, click the <strong>Submit</strong> button to create
              the new staff member.
            </p>

            {errors.message && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.message}</span>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Creating staff member...
                </span>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6 sm:space-y-8">
                  {/* Contact Information Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h3>
                      <Link
                        to="/admin/staff/add/step-3"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Type:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatStaffType(wizardState.type)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            First Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.firstName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Last Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 break-all">
                            {wizardState.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Phone:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.phone} (
                            {formatPhoneType(wizardState.phoneType)})
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.isOkToEmail ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Text:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.isOkToText ? "Yes" : "No"}
                          </p>
                        </div>

                        {wizardState.otherPhone && (
                          <>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Other Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.otherPhone} (
                                {formatPhoneType(wizardState.otherPhoneType)})
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                        Address Information
                      </h3>
                      <Link
                        to="/admin/staff/add/step-4"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Address:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.addressLine1}
                          </p>
                        </div>
                        {wizardState.addressLine2 && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Address Line 2:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {wizardState.addressLine2}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            City:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.city}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Province/Territory:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.region}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Postal Code:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.postalCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Country:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.country}
                          </p>
                        </div>
                      </div>

                      {wizardState.hasShippingAddress && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Shipping Address
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Name:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingPhone}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Address:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingAddressLine1}
                              </p>
                            </div>
                            {wizardState.shippingAddressLine2 && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Address Line 2:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {wizardState.shippingAddressLine2}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                City:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingCity}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Province/Territory:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingRegion}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Postal Code:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingPostalCode}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Country:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.shippingCountry}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <ClipboardDocumentIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-purple-600" />
                        Account Information
                      </h3>
                      <Link
                        to="/admin/staff/add/step-5"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      {/* Vehicle Types Display */}
                      {wizardState.vehicleTypes &&
                        wizardState.vehicleTypes.length > 0 && (
                          <div className="mb-2">
                            <VehicleTypesDisplay
                              values={parseArrayValue(wizardState.vehicleTypes)}
                              label="Vehicle Types"
                              variant="warning"
                              onUnauthorized={onUnauthorized}
                            />
                          </div>
                        )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        {wizardState.limitSpecial && (
                          <div className="sm:col-span-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Limitations/Special Considerations:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900 mt-1">
                              {wizardState.limitSpecial}
                            </p>
                          </div>
                        )}
                        {wizardState.policeCheck && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Police Check Expiry:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {wizardState.policeCheck}
                            </p>
                          </div>
                        )}
                        {wizardState.driversLicenseClass && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Drivers License Class:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {wizardState.driversLicenseClass}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Preferred Language:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {wizardState.preferredLanguage}
                          </p>
                        </div>
                      </div>

                      {wizardState.emergencyContactName && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Emergency Contact
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Name:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.emergencyContactName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Relationship:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.emergencyContactRelationship}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.emergencyContactTelephone}
                              </p>
                            </div>
                            {wizardState.emergencyContactAlternativeTelephone && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Alternative Phone:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {
                                    wizardState.emergencyContactAlternativeTelephone
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {wizardState.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            System
                          </p>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Description:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900 mt-1">
                              {wizardState.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Information Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <ChartBarSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-orange-600" />
                        Metrics Information
                      </h3>
                      <Link
                        to="/admin/staff/add/step-6"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        {wizardState.identifyAs &&
                          wizardState.identifyAs.length > 0 && (
                            <div className="sm:col-span-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Identifies As:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {formatIdentifyAs(wizardState.identifyAs)}
                              </p>
                            </div>
                          )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Gender:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {formatGender(wizardState.gender)}
                          </p>
                        </div>
                        {wizardState.gender === STAFF_GENDER_OTHER &&
                          wizardState.genderOther && (
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Gender (Other):
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {wizardState.genderOther}
                              </p>
                            </div>
                          )}

                        {wizardState.birthDate && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Birth Date:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {wizardState.birthDate}
                            </p>
                          </div>
                        )}

                        {wizardState.joinDate && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Join Date:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {wizardState.joinDate}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* How Heard About Us Display */}
                      {wizardState.howDidYouHearAboutUsID && (
                        <div className="mt-3">
                          <HowHearAboutUsDisplay
                            value={wizardState.howDidYouHearAboutUsID}
                            label="How did you hear about us?"
                            onUnauthorized={onUnauthorized}
                          />
                        </div>
                      )}

                      {wizardState.howDidYouHearAboutUsOther && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            How did you hear about us (Other):
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 mt-1">
                            {wizardState.howDidYouHearAboutUsOther}
                          </p>
                        </div>
                      )}

                      {/* Tags Display */}
                      {wizardState.tags && wizardState.tags.length > 0 && (
                        <div className="mt-3">
                          <TagsDisplay
                            values={parseArrayValue(wizardState.tags)}
                            label="Tags"
                            variant="success"
                            onUnauthorized={onUnauthorized}
                          />
                        </div>
                      )}

                      {wizardState.additionalComment && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Additional Comments:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 mt-1">
                            {wizardState.additionalComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/staff/add/step-6"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    onClick={onSubmitClick}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStaffAddStep7Page;

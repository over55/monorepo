// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/Display";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
} from "../../../../constants/Customer";

// Options for display
const CLIENT_TYPE_OPTIONS = [
  { value: 1, label: "Unassigned" },
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: 1, label: "Work" },
  { value: 2, label: "Home" },
  { value: 3, label: "Mobile" },
];

const GENDER_OPTIONS = [
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
];

function AdminCustomerAddStep6Page() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadCustomerState();
  }, [authManager, navigate]);

  const loadCustomerState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_CUSTOMER_CREATION_STATE",
      );
      if (existing) {
        const customerState = JSON.parse(existing);
        setCustomerData(customerState);
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/customers/add/step-1");
      }
    } catch (error) {
      console.error("Error loading customer state:", error);
      navigate("/admin/customers/add/step-1");
    }
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (!customerData) {
        throw new Error("No customer data found");
      }

      // Process the data for API submission
      const processedData = processCustomerData(customerData);

      console.log("Submitting customer data:", processedData);

      // Submit to API
      const response = await customerManager.createCustomer(processedData, () =>
        navigate("/login?unauthorized=true"),
      );

      console.log("Customer created successfully:", response);

      // Clear the session storage
      sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");

      // Show success message and redirect
      navigate(`/admin/customer/${response.id}`, {
        state: { successMessage: "Customer created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create customer:", error);
      const errorMessage =
        error.message ||
        "An unexpected error occurred while creating the customer.";
      setErrors({ message: errorMessage });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const processCustomerData = (data) => {
    // Create a payload with the customer data
    const payload = { ...data };

    // Clean up tags - ensure they are valid MongoDB ObjectID strings
    if (payload.tags && Array.isArray(payload.tags)) {
      payload.tags = payload.tags.filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          tag !== "" &&
          tag !== "0" &&
          tag !== 0 &&
          typeof tag === "string" &&
          tag.length === 24, // MongoDB ObjectIDs are 24 characters
      );

      // If no valid tags remain, set to empty array
      if (payload.tags.length === 0) {
        payload.tags = [];
      }
    } else {
      payload.tags = [];
    }

    // Format join date for API
    if (payload.joinDate) {
      const joinDateObject = new Date(payload.joinDate);
      payload.joinDate = joinDateObject.toISOString();
    }

    // Format birth date if present
    if (payload.birthDate && !payload.birthDate.includes("T")) {
      payload.birthDate = new Date(payload.birthDate).toISOString();
    }

    // Convert numeric fields to ensure they are integers
    if (payload.type !== undefined) {
      payload.type = parseInt(payload.type);
    }
    if (
      payload.organizationType !== undefined &&
      payload.organizationType !== 0
    ) {
      payload.organizationType = parseInt(payload.organizationType);
    }
    if (payload.phoneType !== undefined) {
      payload.phoneType = parseInt(payload.phoneType);
    }
    if (payload.otherPhoneType !== undefined && payload.otherPhoneType !== 0) {
      payload.otherPhoneType = parseInt(payload.otherPhoneType);
    }
    if (payload.gender !== undefined && payload.gender !== 0) {
      payload.gender = parseInt(payload.gender);
    }
    if (payload.genderOther === undefined) {
      payload.genderOther = "";
    }

    // IMPORTANT: Keep howDidYouHearAboutUsID as a string (MongoDB ObjectID)
    // DO NOT convert to integer!
    // The backend expects this to be a MongoDB ObjectID string
    if (payload.howDidYouHearAboutUsID) {
      // Ensure it's a string
      payload.howDidYouHearAboutUsID = String(payload.howDidYouHearAboutUsID);
    }

    // Remove the isHowDidYouHearAboutUsOther field if it's false
    if (payload.isHowDidYouHearAboutUsOther === false) {
      delete payload.isHowDidYouHearAboutUsOther;
    }

    // Remove empty/zero values for optional numeric fields
    if (payload.organizationType === 0) delete payload.organizationType;
    if (payload.otherPhoneType === 0) delete payload.otherPhoneType;

    return payload;
  };

  const getTypeLabel = (type) => {
    const option = CLIENT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option ? option.label : "Unknown";
  };

  const getOrganizationTypeLabel = (type) => {
    const option = CLIENT_ORGANIZATION_TYPE_OPTIONS.find(
      (opt) => opt.value === type,
    );
    return option ? option.label : "Unknown";
  };

  const getPhoneTypeLabel = (phoneType) => {
    const option = CLIENT_PHONE_TYPE_OPTIONS.find(
      (opt) => opt.value === phoneType,
    );
    return option ? option.label : "Unknown";
  };

  const getGenderLabel = (gender) => {
    const option = GENDER_OPTIONS.find((opt) => opt.value === gender);
    return option ? option.label : "Unknown";
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

  if (!customerData) {
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
                  to="/admin/customers"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Customers</span>
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
            Add New Customer
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-5 Complete */}
              {[1, 2, 3, 4, 5].map((step, index) => (
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
                        {step === 5 && "Metrics"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 5 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 6 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    6
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
                  <span className="text-white font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 6 of 6
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((step) => (
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
              Please carefully review the following customer details. If
              everything looks correct, click the <strong>Submit</strong> button
              to create the new customer.
            </p>

            {errors.message && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.message}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Creating customer...</span>
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
                        to="/admin/customers/add/step-3"
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
                            {getTypeLabel(customerData.type)}
                          </p>
                        </div>

                        {customerData.type ===
                          COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                          <>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Organization Name:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.organizationName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Organization Type:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {getOrganizationTypeLabel(
                                  customerData.organizationType,
                                )}
                              </p>
                            </div>
                          </>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            First Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.firstName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Last Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 break-all">
                            {customerData.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Phone:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.phone} (
                            {getPhoneTypeLabel(customerData.phoneType)})
                          </p>
                        </div>

                        {customerData.phoneType === CLIENT_PHONE_TYPE_WORK &&
                          customerData.phoneExtension && (
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone Extension:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.phoneExtension}
                              </p>
                            </div>
                          )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.isOkToEmail ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Text:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.isOkToText ? "Yes" : "No"}
                          </p>
                        </div>

                        {customerData.otherPhone && (
                          <>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Other Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.otherPhone} (
                                {getPhoneTypeLabel(customerData.otherPhoneType)}
                                )
                              </p>
                            </div>
                            {customerData.otherPhoneType ===
                              CLIENT_PHONE_TYPE_WORK &&
                              customerData.otherPhoneExtension && (
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Other Phone Extension:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {customerData.otherPhoneExtension}
                                  </p>
                                </div>
                              )}
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
                        to="/admin/customers/add/step-4"
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
                            {customerData.addressLine1}
                          </p>
                        </div>
                        {customerData.addressLine2 && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Address Line 2:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {customerData.addressLine2}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            City:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.city}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Province/Territory:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.region}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Postal Code:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.postalCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Country:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.country}
                          </p>
                        </div>
                      </div>

                      {customerData.hasShippingAddress && (
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
                                {customerData.shippingName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingPhone}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Address:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingAddressLine1}
                              </p>
                            </div>
                            {customerData.shippingAddressLine2 && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Address Line 2:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {customerData.shippingAddressLine2}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                City:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingCity}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Province/Territory:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingRegion}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Postal Code:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingPostalCode}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Country:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.shippingCountry}
                              </p>
                            </div>
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
                        to="/admin/customers/add/step-5"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      {/* Tags Display */}
                      {customerData.tags && customerData.tags.length > 0 && (
                        <div className="mb-2">
                          <TagsDisplay
                            values={parseArrayValue(customerData.tags)}
                            label="Tags"
                            variant="success"
                          />
                        </div>
                      )}

                      {/* How Heard About Us Display */}
                      {customerData.howDidYouHearAboutUsID && (
                        <div className="mb-2">
                          <HowHearAboutUsDisplay
                            value={customerData.howDidYouHearAboutUsID}
                            label="How did you hear about us?"
                          />
                        </div>
                      )}

                      {/* Other Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        {customerData.howDidYouHearAboutUsOther && (
                          <div className="sm:col-span-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              How did you hear about us? (Other):
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {customerData.howDidYouHearAboutUsOther}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Gender:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {getGenderLabel(customerData.gender)}
                          </p>
                        </div>

                        {customerData.gender === 1 &&
                          customerData.genderOther && (
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Gender (Other):
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {customerData.genderOther}
                              </p>
                            </div>
                          )}

                        {customerData.birthDate && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Birth Date:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {customerData.birthDate}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Join Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.joinDate}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Preferred Language:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {customerData.preferredLanguage}
                          </p>
                        </div>
                      </div>

                      {customerData.additionalComment && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Additional Comments:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 mt-1">
                            {customerData.additionalComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/customers/add/step-5"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    onClick={onSubmitClick}
                    disabled={isLoading}
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

export default AdminCustomerAddStep6Page;

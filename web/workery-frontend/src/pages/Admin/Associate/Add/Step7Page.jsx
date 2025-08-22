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
} from "@heroicons/react/24/outline";
import {
  InsuranceRequirementsDisplay,
  ServiceFeeDisplay,
} from "../../../../components/Display";
import {
  HowHearAboutUsDisplay,
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
const ASSOCIATE_IS_JOB_SEEKER_NO = 2;

function AdminAssociateAddStep7Page() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
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

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setErrors({});
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
      setErrors(error);
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

    // Remove empty/zero values for optional numeric fields to avoid sending 0 when field should be null
    if (processed.statusInCountry === 0) delete processed.statusInCountry;
    if (processed.maritalStatus === 0) delete processed.maritalStatus;
    if (processed.accomplishedEducation === 0)
      delete processed.accomplishedEducation;
    if (processed.otherPhoneType === 0) delete processed.otherPhoneType;
    if (processed.organizationType === 0) delete processed.organizationType;

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
                  to="/admin/associates"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Associates</span>
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
            Add New Associate
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
              Please carefully review the following associate details. If
              everything looks correct, click the <strong>Submit</strong> button
              to create the new associate.
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
                <span className="ml-3 text-gray-600">
                  Creating associate...
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
                        to="/admin/associates/add/step-3"
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
                            {getTypeLabel(associateData.type)}
                          </p>
                        </div>

                        {associateData.type ===
                          COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                          <>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Organization Name:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.organizationName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Organization Type:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.organizationType}
                              </p>
                            </div>
                          </>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            First Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.firstName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Last Name:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 break-all">
                            {associateData.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Phone:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.phone} (
                            {getPhoneTypeLabel(associateData.phoneType)})
                          </p>
                        </div>

                        {associateData.phoneType ===
                          ASSOCIATE_PHONE_TYPE_WORK &&
                          associateData.phoneExtension && (
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone Extension:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.phoneExtension}
                              </p>
                            </div>
                          )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Email:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.isOkToEmail ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            OK to Text:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.isOkToText ? "Yes" : "No"}
                          </p>
                        </div>

                        {associateData.otherPhone && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Other Phone:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {associateData.otherPhone} (
                              {getPhoneTypeLabel(associateData.otherPhoneType)})
                            </p>
                          </div>
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
                        to="/admin/associates/add/step-4"
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
                            {associateData.addressLine1}
                          </p>
                        </div>
                        {associateData.addressLine2 && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Address Line 2:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {associateData.addressLine2}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            City:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.city}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Province/Territory:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.region}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Postal Code:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.postalCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Country:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.country}
                          </p>
                        </div>
                      </div>

                      {associateData.hasShippingAddress && (
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
                                {associateData.shippingName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingPhone}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Address:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingAddressLine1}
                              </p>
                            </div>
                            {associateData.shippingAddressLine2 && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Address Line 2:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {associateData.shippingAddressLine2}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                City:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingCity}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Province/Territory:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingRegion}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Postal Code:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingPostalCode}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Country:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.shippingCountry}
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
                        to="/admin/associates/add/step-5"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      {/* Skill Sets Display */}
                      {associateData.skillSets && (
                        <div className="mb-2">
                          <SkillSetsDisplay
                            values={parseArrayValue(associateData.skillSets)}
                            label="Skill Sets"
                            variant="primary"
                          />
                        </div>
                      )}

                      {/* Insurance Requirements Display */}
                      {associateData.insuranceRequirements && (
                        <div className="mb-2">
                          <InsuranceRequirementsDisplay
                            values={parseArrayValue(
                              associateData.insuranceRequirements,
                            )}
                            label="Insurance Requirements"
                            variant="info"
                          />
                        </div>
                      )}

                      {/* Vehicle Types Display */}
                      {associateData.vehicleTypes &&
                        associateData.vehicleTypes.length > 0 && (
                          <div className="mb-2">
                            <VehicleTypesDisplay
                              values={parseArrayValue(
                                associateData.vehicleTypes,
                              )}
                              label="Vehicle Types"
                              variant="warning"
                            />
                          </div>
                        )}

                      {/* Service Fee Display */}
                      {associateData.serviceFeeId && (
                        <div className="mb-2">
                          <ServiceFeeDisplay
                            value={associateData.serviceFeeId}
                            label="Service Fee"
                            showAmount={true}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        {associateData.hourlySalaryDesired && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Hourly Rate:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              ${associateData.hourlySalaryDesired}/hr
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Member Dues Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.duesDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Police Check Expiry:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.policeCheck}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Commercial Insurance Expiry:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.commercialInsuranceExpiryDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Preferred Language:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.preferredLanguage}
                          </p>
                        </div>
                      </div>

                      {associateData.emergencyContactName && (
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
                                {associateData.emergencyContactName}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Relationship:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.emergencyContactRelationship}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Phone:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {associateData.emergencyContactTelephone}
                              </p>
                            </div>
                            {associateData.emergencyContactAlternativeTelephone && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Alternative Phone:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {
                                    associateData.emergencyContactAlternativeTelephone
                                  }
                                </p>
                              </div>
                            )}
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
                        to="/admin/associates/add/step-6"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Is Job Seeker:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.isJobSeeker ===
                            ASSOCIATE_IS_JOB_SEEKER_YES
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>

                        {associateData.isJobSeeker ===
                          ASSOCIATE_IS_JOB_SEEKER_YES && (
                          <>
                            {associateData.statusInCountry && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Status in Country:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {associateData.statusInCountry}
                                </p>
                              </div>
                            )}
                            {associateData.maritalStatus && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Marital Status:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {associateData.maritalStatus}
                                </p>
                              </div>
                            )}
                            {associateData.accomplishedEducation && (
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Education Level:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {associateData.accomplishedEducation}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Gender:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {getGenderLabel(associateData.gender)}
                          </p>
                        </div>
                        {associateData.gender === 1 && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Gender (Other):
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {associateData.genderOther}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Birth Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.birthDate}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Join Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {associateData.joinDate}
                          </p>
                        </div>
                      </div>

                      {/* How Heard About Us Display */}
                      {associateData.howDidYouHearAboutUsID && (
                        <div className="mt-3">
                          <HowHearAboutUsDisplay
                            value={associateData.howDidYouHearAboutUsID}
                            label="How did you hear about us?"
                          />
                        </div>
                      )}

                      {/* Tags Display */}
                      {associateData.tags && associateData.tags.length > 0 && (
                        <div className="mt-3">
                          <TagsDisplay
                            values={parseArrayValue(associateData.tags)}
                            label="Tags"
                            variant="success"
                          />
                        </div>
                      )}

                      {associateData.additionalComment && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Additional Comments:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 mt-1">
                            {associateData.additionalComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/associates/add/step-6"
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

export default AdminAssociateAddStep7Page;

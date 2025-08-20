// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  HomeIcon,
  TruckIcon,
  PhoneIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AdminAssociateAddStep4Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Address form data
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Ontario");
  const [country, setCountry] = useState("Canada");
  const [hasShippingAddress, setHasShippingAddress] = useState(false);

  // Shipping address data
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Canada");
  const [shippingRegion, setShippingRegion] = useState("Ontario");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

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

        // Load billing address
        setPostalCode(associateState.postalCode || "");
        setAddressLine1(associateState.addressLine1 || "");
        setAddressLine2(associateState.addressLine2 || "");
        setCity(associateState.city || "");
        setRegion(associateState.region || "Ontario");
        setCountry(associateState.country || "Canada");
        setHasShippingAddress(associateState.hasShippingAddress || false);

        // Load shipping address
        setShippingName(associateState.shippingName || "");
        setShippingPhone(associateState.shippingPhone || "");
        setShippingCountry(associateState.shippingCountry || "Canada");
        setShippingRegion(associateState.shippingRegion || "Ontario");
        setShippingCity(associateState.shippingCity || "");
        setShippingAddressLine1(associateState.shippingAddressLine1 || "");
        setShippingAddressLine2(associateState.shippingAddressLine2 || "");
        setShippingPostalCode(associateState.shippingPostalCode || "");
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Billing address validation
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
      hasErrors = true;
    }
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
      hasErrors = true;
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!region.trim()) {
      newErrors.region = "Province/Territory is required";
      hasErrors = true;
    }
    if (!country.trim()) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }

    // Shipping address validation (if enabled)
    if (hasShippingAddress) {
      if (!shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
        hasErrors = true;
      }
      if (!shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
        hasErrors = true;
      }
      if (!shippingCountry.trim()) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
        hasErrors = true;
      }
      if (!shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
        hasErrors = true;
      }
      if (!shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
        hasErrors = true;
      }
      if (!shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Save to session storage
    const associateState = {
      ...getExistingState(),
      postalCode,
      addressLine1,
      addressLine2,
      city,
      region,
      country,
      hasShippingAddress,
      shippingName,
      shippingPhone,
      shippingCountry,
      shippingRegion,
      shippingCity,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingPostalCode,
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-5");
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

  const countryOptions = [
    { value: "Canada", label: "Canada" },
    { value: "United States", label: "United States" },
    { value: "Mexico", label: "Mexico" },
  ];

  const regionOptions = [
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
                <span className="sm:hidden">Dash</span>
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
                    Associates
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
            <UserPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Add New Associate
          </h1>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-6 relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max lg:justify-center">
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
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-green-600"></div>

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
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-green-600"></div>

              {/* Step 3 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Contact
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    4
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Address
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Location
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
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
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 6 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
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
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
                    7
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Comments
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">Notes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator for mobile/tablet */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none lg:hidden"></div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {errors.general}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Address Information
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
                {/* Billing Address */}
                <div>
                  {hasShippingAddress && (
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                      Billing Address
                    </h3>
                  )}

                  <div className="space-y-4">
                    {/* Country and Province in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Province/Territory{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.region ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          {regionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.region}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* City and Postal Code in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city"
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.city && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="Enter postal code"
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.postalCode
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Line 1 and Line 2 in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="Enter street address"
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.addressLine1
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.addressLine1 && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.addressLine1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Apartment, suite, etc."
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {hasShippingAddress && (
                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                      Shipping Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={shippingName}
                            onChange={(e) => setShippingName(e.target.value)}
                            placeholder="Contact name for shipping"
                            className={`w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.shippingName && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            placeholder="Contact phone for shipping"
                            className={`w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingPhone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.shippingPhone && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>

                      {/* Country and Province in same row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={shippingCountry}
                            onChange={(e) => setShippingCountry(e.target.value)}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          >
                            {countryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.shippingCountry && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.shippingCountry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Province/Territory{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={shippingRegion}
                            onChange={(e) => setShippingRegion(e.target.value)}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingRegion
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          >
                            {regionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.shippingRegion && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.shippingRegion}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* City and Postal Code in same row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            placeholder="Enter city"
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingCity
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.shippingCity && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.shippingCity}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingPostalCode}
                            onChange={(e) =>
                              setShippingPostalCode(e.target.value)
                            }
                            placeholder="Enter postal code"
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingPostalCode
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.shippingPostalCode && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.shippingPostalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address Line 1 and Line 2 in same row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Address Line 1{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddressLine1}
                            onChange={(e) =>
                              setShippingAddressLine1(e.target.value)
                            }
                            placeholder="Enter street address"
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingAddressLine1
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.shippingAddressLine1 && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                              {errors.shippingAddressLine1}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={shippingAddressLine2}
                            onChange={(e) =>
                              setShippingAddressLine2(e.target.value)
                            }
                            placeholder="Apartment, suite, etc."
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address Toggle */}
                <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasShippingAddress"
                      checked={hasShippingAddress}
                      onChange={(e) => setHasShippingAddress(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hasShippingAddress"
                      className="ml-2 text-xs sm:text-sm font-semibold text-gray-700"
                    >
                      Has shipping address different from billing address
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                  <Link
                    to="/admin/associates/add/step-3"
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Back
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
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

export default AdminAssociateAddStep4Page;

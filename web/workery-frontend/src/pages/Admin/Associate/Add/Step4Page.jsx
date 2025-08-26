// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step4Page.jsx

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
  MapPinIcon,
  HomeIcon,
  TruckIcon,
  PhoneIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
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
      // Scroll to top to show errors
      window.scrollTo(0, 0);
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

  // Section Component with Dark Header Pattern
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

  // Copy billing to shipping helper
  const copyBillingToShipping = () => {
    const existingState = getExistingState();
    const fullName =
      `${existingState.firstName || ""} ${existingState.lastName || ""}`.trim();

    setShippingName(fullName);
    setShippingPhone(existingState.phone || "");
    setShippingCountry(country);
    setShippingRegion(region);
    setShippingCity(city);
    setShippingAddressLine1(addressLine1);
    setShippingAddressLine2(addressLine2);
    setShippingPostalCode(postalCode);
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
            Enter the address information for the new associate
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 4: Address
                  </p>
                  <p className="text-xs text-gray-500">Location Information</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">4 of 7</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "57%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-xs text-gray-500">Location</p>
                </div>
              </div>

              {/* Remaining Steps */}
              {[
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
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

        {/* Main Form */}
        <form onSubmit={onSubmitClick} className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Billing Address Section */}
              <DetailSection
                title={
                  hasShippingAddress ? "Billing Address" : "Address Information"
                }
                icon={hasShippingAddress ? BuildingOfficeIcon : HomeIcon}
                description={
                  hasShippingAddress
                    ? "Primary billing address for invoices"
                    : "Primary address for the associate"
                }
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Country and Province Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <GlobeAltIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white`}
                        >
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.country && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Province/Territory{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                            errors.region ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white`}
                        >
                          {regionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.region && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.region}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City and Postal Code Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        className={`w-full px-3 py-2 sm:py-2.5 border ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Enter postal code"
                        className={`w-full px-3 py-2 sm:py-2.5 border ${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Lines */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Enter street address"
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.addressLine1
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                  </div>
                </div>
              </DetailSection>

              {/* Shipping Address Toggle */}
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasShippingAddress"
                      checked={hasShippingAddress}
                      onChange={(e) => setHasShippingAddress(e.target.checked)}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                    />
                    <label
                      htmlFor="hasShippingAddress"
                      className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold text-gray-700"
                    >
                      Different shipping address
                    </label>
                  </div>
                  {hasShippingAddress && (
                    <button
                      type="button"
                      onClick={copyBillingToShipping}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Copy from billing
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 ml-6 sm:ml-8">
                  Check this if materials should be shipped to a different
                  address
                </p>
              </div>

              {/* Shipping Address Section */}
              {hasShippingAddress && (
                <DetailSection
                  title="Shipping Address"
                  icon={TruckIcon}
                  description="Where materials and packages should be delivered"
                >
                  <div className="space-y-4 sm:space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Contact Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={shippingName}
                            onChange={(e) => setShippingName(e.target.value)}
                            placeholder="Contact name for shipping"
                            className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                              errors.shippingName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                          />
                        </div>
                        {errors.shippingName && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            placeholder="Contact phone for shipping"
                            className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                              errors.shippingPhone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                          />
                        </div>
                        {errors.shippingPhone && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Country and Province */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GlobeAltIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <select
                            value={shippingCountry}
                            onChange={(e) => setShippingCountry(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                              errors.shippingCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white`}
                          >
                            {countryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.shippingCountry && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingCountry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Province/Territory{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <select
                            value={shippingRegion}
                            onChange={(e) => setShippingRegion(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                              errors.shippingRegion
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white`}
                          >
                            {regionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.shippingRegion && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingRegion}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="Enter city"
                          className={`w-full px-3 py-2 sm:py-2.5 border ${
                            errors.shippingCity
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                        {errors.shippingCity && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingPostalCode}
                          onChange={(e) =>
                            setShippingPostalCode(e.target.value)
                          }
                          placeholder="Enter postal code"
                          className={`w-full px-3 py-2 sm:py-2.5 border ${
                            errors.shippingPostalCode
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Lines */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddressLine1}
                        onChange={(e) =>
                          setShippingAddressLine1(e.target.value)
                        }
                        placeholder="Enter street address"
                        className={`w-full px-3 py-2 sm:py-2.5 border ${
                          errors.shippingAddressLine1
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                      {errors.shippingAddressLine1 && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.shippingAddressLine1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={shippingAddressLine2}
                        onChange={(e) =>
                          setShippingAddressLine2(e.target.value)
                        }
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/associates/add/step-3" className="flex-1">
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
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminAssociateAddStep4Page;

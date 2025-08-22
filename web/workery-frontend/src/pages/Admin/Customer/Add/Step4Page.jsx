// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  HomeIcon,
  TruckIcon,
  PhoneIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// Country options
const COUNTRY_OPTIONS = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Region options for Canada
const CANADA_REGION_OPTIONS = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "YT", label: "Yukon" },
];

// Complete region options for US (all 50 states + DC + territories)
const US_REGION_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "PR", label: "Puerto Rico" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

// Region options for Mexico (31 states + Mexico City)
const MEXICO_REGION_OPTIONS = [
  { value: "AGU", label: "Aguascalientes" },
  { value: "BCN", label: "Baja California" },
  { value: "BCS", label: "Baja California Sur" },
  { value: "CAM", label: "Campeche" },
  { value: "CHP", label: "Chiapas" },
  { value: "CHH", label: "Chihuahua" },
  { value: "CMX", label: "Ciudad de México" },
  { value: "COA", label: "Coahuila" },
  { value: "COL", label: "Colima" },
  { value: "DUR", label: "Durango" },
  { value: "GUA", label: "Guanajuato" },
  { value: "GRO", label: "Guerrero" },
  { value: "HID", label: "Hidalgo" },
  { value: "JAL", label: "Jalisco" },
  { value: "MEX", label: "México" },
  { value: "MIC", label: "Michoacán" },
  { value: "MOR", label: "Morelos" },
  { value: "NAY", label: "Nayarit" },
  { value: "NLE", label: "Nuevo León" },
  { value: "OAX", label: "Oaxaca" },
  { value: "PUE", label: "Puebla" },
  { value: "QUE", label: "Querétaro" },
  { value: "ROO", label: "Quintana Roo" },
  { value: "SLP", label: "San Luis Potosí" },
  { value: "SIN", label: "Sinaloa" },
  { value: "SON", label: "Sonora" },
  { value: "TAB", label: "Tabasco" },
  { value: "TAM", label: "Tamaulipas" },
  { value: "TLA", label: "Tlaxcala" },
  { value: "VER", label: "Veracruz" },
  { value: "YUC", label: "Yucatán" },
  { value: "ZAC", label: "Zacatecas" },
];

function AdminCustomerAddStep4Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Address form data
  const [postalCode, setPostalCode] = useState(customerData.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(
    customerData.addressLine1 || "",
  );
  const [addressLine2, setAddressLine2] = useState(
    customerData.addressLine2 || "",
  );
  const [city, setCity] = useState(customerData.city || "");
  const [region, setRegion] = useState(customerData.region || "ON");
  const [country, setCountry] = useState(customerData.country || "CA");
  const [hasShippingAddress, setHasShippingAddress] = useState(
    customerData.hasShippingAddress || false,
  );

  // Shipping address data
  const [shippingName, setShippingName] = useState(
    customerData.shippingName || "",
  );
  const [shippingPhone, setShippingPhone] = useState(
    customerData.shippingPhone || "",
  );
  const [shippingCountry, setShippingCountry] = useState(
    customerData.shippingCountry || "CA",
  );
  const [shippingRegion, setShippingRegion] = useState(
    customerData.shippingRegion || "ON",
  );
  const [shippingCity, setShippingCity] = useState(
    customerData.shippingCity || "",
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    customerData.shippingAddressLine1 || "",
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    customerData.shippingAddressLine2 || "",
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    customerData.shippingPostalCode || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check if we have customer data, if not redirect to step 1
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    if (!saved) {
      navigate("/admin/customers/add/step-1");
    }
  }, [navigate]);

  // Get region options based on selected country
  const getRegionOptions = (selectedCountry) => {
    switch (selectedCountry) {
      case "CA":
        return CANADA_REGION_OPTIONS;
      case "US":
        return US_REGION_OPTIONS;
      case "MX":
        return MEXICO_REGION_OPTIONS;
      default:
        return CANADA_REGION_OPTIONS; // Fallback to Canada regions
    }
  };

  // Get region label based on country
  const getRegionLabel = (selectedCountry) => {
    switch (selectedCountry) {
      case "CA":
        return "Province/Territory";
      case "US":
        return "State";
      case "MX":
        return "State";
      default:
        return "Province/Territory";
    }
  };

  // Handle country change - reset region to first available option
  const handleCountryChange = (e, isShipping = false) => {
    const newCountry = e.target.value;
    const regionOptions = getRegionOptions(newCountry);

    if (isShipping) {
      setShippingCountry(newCountry);
      // Reset region to first available option for the new country
      if (regionOptions.length > 0) {
        setShippingRegion(regionOptions[0].value);
      }
    } else {
      setCountry(newCountry);
      // Reset region to first available option for the new country
      if (regionOptions.length > 0) {
        setRegion(regionOptions[0].value);
      }
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("handleSubmit: Beginning...");
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Billing address validation
    if (!country) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }
    if (!region) {
      newErrors.region = `${getRegionLabel(country)} is required`;
      hasErrors = true;
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
      hasErrors = true;
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal/ZIP code is required";
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
      if (!shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion) {
        newErrors.shippingRegion = `Shipping ${getRegionLabel(shippingCountry)} is required`;
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
        newErrors.shippingPostalCode = "Shipping postal/ZIP code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      console.log("handleSubmit: Ending with error.");
      return;
    }

    // Save to session storage
    const updatedCustomerData = {
      ...customerData,
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
        "WORKERY_CUSTOMER_CREATION_STATE",
        JSON.stringify(updatedCustomerData),
      );
      setCustomerData(updatedCustomerData);
      console.log("handleSubmit: Ending with success.");
      navigate("/admin/customers/add/step-5");
    } catch (error) {
      console.error("Error saving customer state:", error);
      setErrors({ general: "Failed to save data. Please try again." });
    }
  };

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
            <UserPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Add New Customer
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
                    Review
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Confirm
                  </p>
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
                          onChange={(e) => handleCountryChange(e, false)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          {COUNTRY_OPTIONS.map((option) => (
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
                          {getRegionLabel(country)}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                            errors.region ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <option value="">
                            Select {getRegionLabel(country)}
                          </option>
                          {getRegionOptions(country).map((option) => (
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
                          {country === "US" ? "ZIP Code" : "Postal Code"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder={
                            country === "US"
                              ? "Enter ZIP code"
                              : "Enter postal code"
                          }
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
                            onChange={(e) => handleCountryChange(e, true)}
                            className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${
                              errors.shippingCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          >
                            {COUNTRY_OPTIONS.map((option) => (
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
                            {getRegionLabel(shippingCountry)}{" "}
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
                            <option value="">
                              Select {getRegionLabel(shippingCountry)}
                            </option>
                            {getRegionOptions(shippingCountry).map((option) => (
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
                            {shippingCountry === "US"
                              ? "ZIP Code"
                              : "Postal Code"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingPostalCode}
                            onChange={(e) =>
                              setShippingPostalCode(e.target.value)
                            }
                            placeholder={
                              shippingCountry === "US"
                                ? "Enter ZIP code"
                                : "Enter postal code"
                            }
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
                    to="/admin/customers/add/step-3"
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

export default AdminCustomerAddStep4Page;

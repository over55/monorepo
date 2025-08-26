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
  GlobeAltIcon,
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

// US region options
const US_REGION_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
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

// Mexico region options
const MEXICO_REGION_OPTIONS = [
  { value: "AGU", label: "Aguascalientes" },
  { value: "BCN", label: "Baja California" },
  { value: "BCS", label: "Baja California Sur" },
  { value: "CAM", label: "Campeche" },
  { value: "CHP", label: "Chiapas" },
  { value: "CHH", label: "Chihuahua" },
  { value: "COA", label: "Coahuila" },
  { value: "COL", label: "Colima" },
  { value: "DIF", label: "Ciudad de México" },
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

// Section Component with Dark Header
const AddressSection = ({ title, icon: Icon, children, description }) => (
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
        return CANADA_REGION_OPTIONS;
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
      if (regionOptions.length > 0) {
        setShippingRegion(regionOptions[0].value);
      }
    } else {
      setCountry(newCountry);
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
                  to="/admin/customers"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Customers</span>
                    <span className="sm:hidden">Cust</span>
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
            Add New Customer
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <MapPinIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Step 4: Enter address information
          </p>
        </div>

        {/* Wizard Steps */}
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
                  <p className="text-xs text-gray-500">Location Info</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">4 of 7</div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-3 Complete */}
              {[
                { num: 1, title: "Search", subtitle: "Complete" },
                { num: 2, title: "Type", subtitle: "Complete" },
                { num: 3, title: "Contact", subtitle: "Complete" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  {index > 0 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
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
                { num: 5, title: "Comments", subtitle: "Notes" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Review", subtitle: "Confirm" },
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

        {/* Main Content */}
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
              {/* Billing Address */}
              <AddressSection
                title={
                  hasShippingAddress ? "Billing Address" : "Address Information"
                }
                icon={HomeIcon}
                description={
                  hasShippingAddress
                    ? "Primary billing address"
                    : "Customer address details"
                }
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Country and Province in same row */}
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
                          onChange={(e) => handleCountryChange(e, false)}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 text-sm sm:text-base border ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors`}
                        >
                          {COUNTRY_OPTIONS.map((option) => (
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
                        {getRegionLabel(country)}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 text-sm sm:text-base border ${
                            errors.region ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors`}
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
                      </div>
                      {errors.region && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.region}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City and Postal Code in same row */}
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
                        className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Line 1 and Line 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Enter street address"
                        className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                          errors.addressLine1
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                        placeholder="Apartment, suite, etc."
                        className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </AddressSection>

              {/* Shipping Address Toggle */}
              <div className="px-4 sm:px-6 py-4">
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

              {/* Shipping Address */}
              {hasShippingAddress && (
                <AddressSection
                  title="Shipping Address"
                  icon={TruckIcon}
                  description="Alternative shipping location"
                >
                  <div className="space-y-4 sm:space-y-6">
                    {/* Shipping Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
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
                            className={`w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                              errors.shippingName
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                            className={`w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                              errors.shippingPhone
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                          />
                        </div>
                        {errors.shippingPhone && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Country and Region */}
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
                            onChange={(e) => handleCountryChange(e, true)}
                            className={`w-full pl-10 pr-8 py-2 sm:py-2.5 text-sm sm:text-base border ${
                              errors.shippingCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors`}
                          >
                            {COUNTRY_OPTIONS.map((option) => (
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
                          {getRegionLabel(shippingCountry)}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <select
                            value={shippingRegion}
                            onChange={(e) => setShippingRegion(e.target.value)}
                            className={`w-full pl-10 pr-8 py-2 sm:py-2.5 text-sm sm:text-base border ${
                              errors.shippingRegion
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-colors`}
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
                        </div>
                        {errors.shippingRegion && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingRegion}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping City and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="Enter shipping city"
                          className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                            errors.shippingCity
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        />
                        {errors.shippingCity && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                          className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                            errors.shippingPostalCode
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address Lines */}
                    <div className="space-y-4">
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
                          placeholder="Enter shipping street address"
                          className={`w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border ${
                            errors.shippingAddressLine1
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
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
                          placeholder="Apartment, suite, etc."
                          className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </AddressSection>
              )}

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/customers/add/step-3" className="flex-1">
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

export default AdminCustomerAddStep4Page;

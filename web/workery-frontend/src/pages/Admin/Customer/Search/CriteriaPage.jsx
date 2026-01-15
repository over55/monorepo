// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner, etc.)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronRightIcon,
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

function AdminCustomerSearchCriteriaPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoized theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  // Form states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", path: "/admin/dashboard", icon: "chart-bar" },
      { label: "Customers", path: "/admin/customers", icon: "users" },
      { label: "Search", icon: "magnifying-glass" },
    ],
    [],
  );

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Handle form submission
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Validation
    if (
      firstName === "" &&
      lastName === "" &&
      email === "" &&
      phone === "" &&
      organizationName === ""
    ) {
      setErrors({
        message: "Please enter at least one search field",
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append("fn", firstName);
    if (lastName) queryParams.append("ln", lastName);
    if (email) queryParams.append("e", email);
    if (phone) queryParams.append("p", phone);
    if (organizationName) queryParams.append("on", organizationName);
    queryParams.append("active", showOnlyActive ? "1" : "0");

    // Navigate to results page with query params
    const searchUrl = `/admin/customers/search-result?${queryParams.toString()}`;

    console.log("Navigating to:", searchUrl);
    navigate(searchUrl);
  };

  // Handle cancel
  const onCancelClick = (e) => {
    e.preventDefault();
    navigate("/admin/customers");
  };

  // Handle clear form
  const handleClearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setOrganizationName("");
    setShowOnlyActive(true);
    setErrors({});
  };

  // Handle key press for Enter key submission
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Customers
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Find existing customers in your database
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/customers")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Customers
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setErrors({})}
                  className="inline-flex text-red-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Search Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-600" />
              Search Criteria
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter one or more search criteria to find customers
            </p>
          </div>

          <form onSubmit={onSubmitClick} className="p-6">
            {/* Name Fields */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-gray-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter first name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter last name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter email address"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter phone number"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <BuildingOffice2Icon className="h-4 w-4 mr-2 text-gray-600" />
                Organization
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter organization name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  For commercial customers
                </p>
              </div>
            </div>

            {/* Filter Options */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FunnelIcon className="h-4 w-4 mr-2 text-gray-600" />
                Filter Options
              </h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Search active customers only
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500 ml-6">
                When checked, only active customers will be included in search
                results. Uncheck to search all customers including archived
                ones.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancelClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>

              <button
                type="submit"
                disabled={isFetching}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Tips - Moved below the form */}
        <div className="mt-6 bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Search Tips
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Enter partial names for broader results</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Use email for exact customer match</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Phone numbers can be partial</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Combine multiple fields for precise search</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCustomerSearchCriteriaPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerSearchCriteriaPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerSearchCriteriaPageWithProvider;

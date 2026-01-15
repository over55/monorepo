// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

function AdminCustomerAddStep1PartAPage() {
  const customerManager = useCustomerManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Clear form data on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  // Event handlers
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search value",
      });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Navigate to results page with search parameters
    const searchParams = new URLSearchParams();
    if (firstName) searchParams.append("fn", firstName);
    if (lastName) searchParams.append("ln", lastName);
    if (email) searchParams.append("e", email);
    if (phone) searchParams.append("p", phone);

    navigate(`/admin/customers/add/step-1-results?${searchParams.toString()}`);
  };

  const onAddCustomerClick = (e) => {
    e.preventDefault();
    console.log("Creating new customer");

    // Clear any existing customer creation state
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");

    // Navigate directly to step 2
    navigate("/admin/customers/add/step-2");
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData = firstName || lastName || email || phone;
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/customers");
    }
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate("/admin/customers");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/customers"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Customers
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Customer
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <MagnifyingGlassIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Step 1: Search for existing customers
          </p>
        </div>

        {/* Wizard Steps - Mobile Responsive */}
        <div className="mb-6">
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 1: Search
                  </p>
                  <p className="text-xs text-gray-500">
                    Check for existing customers
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">1 of 6</div>
            </div>
          </div>

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Check Existing</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Steps 2-6 - Inactive */}
              {[
                { num: 2, title: "Type", subtitle: "Select Type" },
                { num: 3, title: "Contact", subtitle: "Basic Info" },
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Comments", subtitle: "Notes" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
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
                  {index < 4 && (
                    <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Dark Header */}
          <div className="bg-gray-700 rounded-t-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <MagnifyingGlassIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
                Search for Existing Customer
              </h2>
            </div>
          </div>

          {/* Form Content with Border */}
          <div className="border-x-2 border-b-2 border-gray-700 rounded-b-lg">
            {isLoading ? (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 text-sm sm:text-base">
                    Searching...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={onSubmitClick} className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                        <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Enter at least one search criteria to check for
                          existing customers. This helps prevent duplicate
                          records in the system.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Search Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <XMarkIcon className="w-4 h-4 inline mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                      Search
                    </button>
                  </div>
                </form>

                {/* OR Divider */}
                <div className="relative px-4 sm:px-6 py-3">
                  <div className="absolute inset-0 flex items-center px-4 sm:px-6">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm font-medium text-gray-500">
                      OR
                    </span>
                  </div>
                </div>

                {/* Add New Customer */}
                <div className="px-4 sm:px-6 pb-5">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      If you're sure this is a new customer, skip the search and
                      proceed directly to creation
                    </p>
                    <button
                      onClick={onAddCustomerClick}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <UserPlusIcon className="w-5 h-5 mr-2" />
                      Add New Customer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/customers"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Customers List
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your Customer record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 order-1 sm:order-2"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminCustomerAddStep1PartAPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerAddStep1PartAPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep1PartAPageWithProvider;

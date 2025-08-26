// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  PlusCircleIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function AdminOrderAddStep1PartAPage() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Check authentication and initialize
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Clear any existing order creation state when starting fresh
      orderCreationStorage.clearOrderCreation();
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate, orderCreationStorage]);

  // Event handlers
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search criteria",
      });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Navigate to results page with search parameters
    const params = new URLSearchParams();
    if (firstName) params.append("fn", firstName);
    if (lastName) params.append("ln", lastName);
    if (email) params.append("e", email);
    if (phone) params.append("p", phone);

    navigate(`/admin/orders/add/step-1-results?${params.toString()}`);
  };

  const onCreateNewCustomerClick = (e) => {
    e.preventDefault();
    console.log("Creating new customer");

    // Navigate to customer creation in new tab as per original
    window.open("/admin/customers/add/step-2", "_blank", "noreferrer");
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData = firstName || lastName || email || phone;
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/orders");
    }
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate("/admin/orders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Enhanced Breadcrumb with better styling */}
        <nav
          className="flex mb-4 bg-white rounded-lg shadow-sm p-2 sm:p-3"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
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
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Orders
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PlusCircleIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  New
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Enhanced Page Title with gradient */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <PlusCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
                New Order
              </h1>
              <p className="mt-1 text-sm text-gray-600 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1" />
                Create a new work order for a customer
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Wizard Steps with dark theme */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          {/* Desktop/Laptop View (1920x1080 and above) */}
          <div className="hidden 2xl:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full shadow-lg">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Find Customer</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Details</p>
                  <p className="text-xs text-gray-400">Order Info</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <p className="text-xs text-gray-400">Requirements</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Confirm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Screens (1366x768 to 1919px) - Horizontal Scroll */}
          <div className="hidden lg:block 2xl:hidden">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-4">
                {/* Step 1 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-full shadow-lg">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-900">Search</p>
                    <p className="text-xs text-gray-500 hidden xl:block">
                      Find Customer
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 w-12 h-0.5 bg-gray-300"></div>

                {/* Step 2 */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-9 h-9 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold text-sm">
                      2
                    </span>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-500">Details</p>
                    <p className="text-xs text-gray-400 hidden xl:block">
                      Order Info
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-9 h-9 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold text-sm">
                      3
                    </span>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-500">Skills</p>
                    <p className="text-xs text-gray-400 hidden xl:block">
                      Requirements
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-9 h-9 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-500">Review</p>
                    <p className="text-xs text-gray-400 hidden xl:block">
                      Confirm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet View (md to lg screens) - Compact Horizontal Scroll */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {[
                  { num: 1, title: "Search", active: true },
                  { num: 2, title: "Details", active: false },
                  { num: 3, title: "Skills", active: false },
                  { num: 4, title: "Review", active: false },
                ].map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 ${step.active ? "bg-blue-600 shadow-lg" : "bg-gray-300"} rounded-full`}
                      >
                        <span
                          className={`${step.active ? "text-white" : "text-gray-600"} font-semibold text-xs`}
                        >
                          {step.num}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p
                          className={`text-xs font-medium ${step.active ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="mx-1 w-8 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View - Enhanced Current Step Display */}
          <div className="md:hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full shadow-lg">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 1: Search
                    </p>
                    <p className="text-xs text-gray-500">
                      Find existing customer
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-medium">1 of 4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message - Enhanced styling */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-800 px-3 sm:px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
            <span className="flex items-center text-sm">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content with dark header */}
        <div>
          <div>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
                <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Search for Existing Customer
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Find the customer you want to create an order for
                </p>
              </div>

              {isFetching ? (
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 text-sm sm:text-base">
                      Loading...
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
                            className="block text-sm font-medium text-gray-700 mb-2"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-2"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 mb-2"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info Note - Enhanced styling */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
                        <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                          <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Enter at least one search criteria to find existing
                            customers. This helps you select the right customer
                            for the order.
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Search Actions - Enhanced buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                      >
                        <XMarkIcon className="w-4 h-4 inline mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 shadow-lg"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                        Search
                      </button>
                    </div>
                  </form>

                  {/* OR Divider - Enhanced */}
                  <div className="relative px-4 sm:px-6 py-3">
                    <div className="absolute inset-0 flex items-center px-4 sm:px-6">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm font-medium text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Create New Customer - Enhanced section */}
                  <div className="px-4 sm:px-6 pb-5">
                    <div className="text-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <UserPlusIcon className="w-12 h-12 mx-auto text-green-600 mb-3" />
                      <p className="text-xs sm:text-sm text-gray-700 mb-4 font-medium">
                        Can't find the customer? Create a new one!
                      </p>
                      <p className="text-xs text-gray-600 mb-4">
                        This will open in a new window so you won't lose your
                        progress
                      </p>
                      <button
                        onClick={onCreateNewCustomerClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105 shadow-lg"
                      >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Create New Customer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Back Link - Enhanced */}
        <div className="mt-6">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Orders List
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal - Enhanced styling */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-xl">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your Order record will be cancelled and your work will be lost.
                This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1 transition-all transform hover:scale-105"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 order-1 sm:order-2 transition-all transform hover:scale-105 shadow-lg"
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

export default AdminOrderAddStep1PartAPage;

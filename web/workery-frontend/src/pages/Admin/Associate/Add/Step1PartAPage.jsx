// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

function AdminAssociateAddStep1PartAPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

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

    navigate(`/admin/associates/add/step-1-results?${searchParams.toString()}`);
  };

  const onAddAssociateClick = (e) => {
    e.preventDefault();
    console.log("Creating new associate");

    // Clear any existing associate creation state
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");

    // Navigate directly to step 2
    navigate("/admin/associates/add/step-2");
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData = firstName || lastName || email || phone;
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/associates");
    }
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate("/admin/associates");
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
                Dashboard
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-7 h-7 mr-3 text-blue-600" />
            Add New Associate
          </h1>
        </div>

        {/* Wizard Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center overflow-x-auto">
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

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-xs text-gray-400">Select Type</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-xs text-gray-400">Basic Info</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-xs text-gray-400">Location</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Account</p>
                  <p className="text-xs text-gray-400">Settings</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 6 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Metrics</p>
                  <p className="text-xs text-gray-400">Performance</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {errors.message}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div>
          <div>
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search for Existing Associate
                </h2>
              </div>

              {isLoading ? (
                <div className="p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Searching...</span>
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={onSubmitClick} className="p-6">
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info Note */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-start">
                          <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Enter at least one search criteria to check for
                            existing associates. This helps prevent duplicate
                            records in the system.
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Search Actions */}
                    <div className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <XMarkIcon className="w-4 h-4 inline mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                        Search
                      </button>
                    </div>
                  </form>

                  {/* OR Divider */}
                  <div className="relative px-6 py-3">
                    <div className="absolute inset-0 flex items-center px-6">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm font-medium text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Add New Associate */}
                  <div className="px-6 pb-5">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        If you're sure this is a new associate, skip the search
                        and proceed directly to creation
                      </p>
                      <button
                        onClick={onAddAssociateClick}
                        className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Add New Associate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/associates"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Associates List
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Your Associate record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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

export default AdminAssociateAddStep1PartAPage;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  AdjustmentsHorizontalIcon,
  ForwardIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

function AdminOrderDetailMoreTransferStep3Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  // Initialize from storage
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load previous state from storage
    const savedState = transferOperationStorage.getTransferOperation();
    setIsAdvancedFiltering(savedState.associateIsAdvancedFiltering);
    setActualSearchText(savedState.associateSearch);
    setAssociateEmail(savedState.associateEmail);
    setAssociatePhone(savedState.associatePhone);
    setAssociateFirstName(savedState.associateFirstName);
    setAssociateLastName(savedState.associateLastName);
  }, []);

  const handleSearch = () => {
    // Validate that at least one field has a value
    if (
      !associateFirstName &&
      !associateLastName &&
      !associateEmail &&
      !associatePhone &&
      !actualSearchText
    ) {
      setErrors({ message: "Please enter at least one search criteria" });
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    // Save search parameters
    const transferOp = transferOperationStorage.getTransferOperation();
    const newTransferOp = {
      ...transferOp,
      associateIsAdvancedFiltering: isAdvancedFiltering,
      associateSearch: actualSearchText,
      associateEmail: associateEmail,
      associatePhone: associatePhone,
      associateFirstName: associateFirstName,
      associateLastName: associateLastName,
      pickedAssociateID: "", // Reset selection
      pickedAssociateName: "",
    };
    transferOperationStorage.saveTransferOperation(newTransferOp);

    // Navigate to step 4 with search parameters
    const params = new URLSearchParams();
    if (associateFirstName) params.append("fn", associateFirstName);
    if (associateLastName) params.append("ln", associateLastName);
    if (associateEmail) params.append("e", associateEmail);
    if (associatePhone) params.append("p", associatePhone);
    if (actualSearchText) params.append("q", actualSearchText);

    navigate(`/admin/order/${oid}/more/transfer/step-4?${params.toString()}`);
  };

  const handleSkip = () => {
    // Clear associate selection and go to review
    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedAssociateID = "";
    transferOp.pickedAssociateName = "";
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-5`);
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
                <span className="sm:hidden">Home</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Orders
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}/more`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <EllipsisHorizontalIcon className="w-4 h-4 mr-2" />
                    More
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
                  Transfer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ArrowsRightLeftIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Transfer Order
          </h1>
        </div>

        {/* Wizard Steps - Responsive Version */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {/* Mobile/Tablet View (< lg) */}
            <div className="lg:hidden w-full overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Confirm
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600"></div>

                {/* Step 2 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Client
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Associate
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Search
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Select
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Associate
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 5 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      5
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

            {/* Desktop View (≥ lg) */}
            <div className="hidden lg:flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Confirm</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Client</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Associate</p>
                  <p className="text-xs text-gray-500">Search</p>
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
                  <p className="text-sm font-medium text-gray-500">Select</p>
                  <p className="text-xs text-gray-400">Associate</p>
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
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Confirm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{errors.message}</span>
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Search for Associate
              </h2>
              <button
                onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${
                  isAdvancedFiltering
                    ? "text-white bg-blue-600 hover:bg-blue-700"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                {isAdvancedFiltering ? "Clear Advanced" : "Advanced Filters"}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="max-w-2xl mx-auto"
              >
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please enter one or more of the following fields to begin
                    searching.
                  </p>

                  {/* Search Keywords */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Search Keywords
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={actualSearchText}
                        onChange={(e) => setActualSearchText(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Advanced Filtering Section */}
                  {isAdvancedFiltering && (
                    <>
                      <div className="flex items-center justify-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 font-medium">
                          OR
                        </span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                          Advanced Search
                        </h3>

                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Associate Information
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  value={associateFirstName}
                                  onChange={(e) =>
                                    setAssociateFirstName(e.target.value)
                                  }
                                  placeholder="Enter first name"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  value={associateLastName}
                                  onChange={(e) =>
                                    setAssociateLastName(e.target.value)
                                  }
                                  placeholder="Enter last name"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="email"
                                  value={associateEmail}
                                  onChange={(e) =>
                                    setAssociateEmail(e.target.value)
                                  }
                                  placeholder="Enter email"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="tel"
                                  value={associatePhone}
                                  onChange={(e) =>
                                    setAssociatePhone(e.target.value)
                                  }
                                  placeholder="Enter phone"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-2`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-50 border border-yellow-300 rounded-lg hover:bg-yellow-100"
                  >
                    Skip
                    <ForwardIcon className="w-4 h-4 ml-2" />
                  </button>

                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Search
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

export default AdminOrderDetailMoreTransferStep3Page;

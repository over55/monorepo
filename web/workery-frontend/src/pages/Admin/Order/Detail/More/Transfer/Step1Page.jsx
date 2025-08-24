// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

function AdminOrderDetailMoreTransferStep1Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Initialize from storage
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load previous state from storage
    const savedState = transferOperationStorage.getTransferOperation();
    setIsAdvancedFiltering(savedState.clientIsAdvancedFiltering);
    setActualSearchText(savedState.clientSearch);
    setCustomerEmail(savedState.clientEmail);
    setCustomerPhone(savedState.clientPhone);
    setCustomerFirstName(savedState.clientFirstName);
    setCustomerLastName(savedState.clientLastName);
  }, [authManager, navigate, transferOperationStorage]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("handleSearch: Beginning...");

    // Validate that at least one field has a value
    if (
      !customerFirstName &&
      !customerLastName &&
      !customerEmail &&
      !customerPhone &&
      !actualSearchText
    ) {
      setErrors({ message: "Please enter at least one search criteria" });
      return;
    }

    // Clear errors
    setErrors({});

    // Clear previous results and save search parameters
    const transferOp = transferOperationStorage.getTransferOperation();
    const newTransferOp = {
      ...transferOp,
      clientIsAdvancedFiltering: isAdvancedFiltering,
      clientSearch: actualSearchText,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      clientFirstName: customerFirstName,
      clientLastName: customerLastName,
      pickedClientID: "", // Reset selection
      pickedClientName: "",
    };
    transferOperationStorage.saveTransferOperation(newTransferOp);

    // Navigate to step 2 with search parameters
    const params = new URLSearchParams();
    if (customerFirstName) params.append("fn", customerFirstName);
    if (customerLastName) params.append("ln", customerLastName);
    if (customerEmail) params.append("e", customerEmail);
    if (customerPhone) params.append("p", customerPhone);
    if (actualSearchText) params.append("q", actualSearchText);

    navigate(`/admin/order/${oid}/more/transfer/step-2?${params.toString()}`);
  };

  const handleSkip = (e) => {
    e.preventDefault();
    console.log("Skipping client search");

    // Clear client selection and go to associate search
    const newTransferOp = transferOperationStorage.getTransferOperation();
    newTransferOp.pickedClientID = "";
    newTransferOp.pickedClientName = "";
    transferOperationStorage.saveTransferOperation(newTransferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData =
      customerFirstName ||
      customerLastName ||
      customerEmail ||
      customerPhone ||
      actualSearchText;

    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/order/${oid}/more`);
    }
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    // Clear transfer operation storage
    transferOperationStorage.clearTransferOperation();
    navigate(`/admin/order/${oid}/more`);
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
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Orders
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}/more`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <EllipsisHorizontalIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    More
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ArrowsRightLeftIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  Transfer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ArrowsRightLeftIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Transfer Order
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Search Client
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">
                    Pick Client
                  </p>
                  <p className="text-xs text-gray-400">Select Result</p>
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
                  <p className="text-sm font-medium text-gray-500">
                    Search Associate
                  </p>
                  <p className="text-xs text-gray-400">Find Worker</p>
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
                  <p className="text-sm font-medium text-gray-500">
                    Pick Associate
                  </p>
                  <p className="text-xs text-gray-400">Select Worker</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Confirm</p>
                  <p className="text-xs text-gray-400">Review Transfer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet View - Horizontal Scroll */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {[
                  { num: 1, title: "Search Client", active: true },
                  { num: 2, title: "Pick Client", active: false },
                  { num: 3, title: "Search Associate", active: false },
                  { num: 4, title: "Pick Associate", active: false },
                  { num: 5, title: "Confirm", active: false },
                ].map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 ${step.active ? "bg-blue-600" : "bg-gray-300"} rounded-full`}
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
                    {index < 4 && (
                      <div className="mx-1 w-8 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View - Simplified Current Step Display */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 1: Search Client
                    </p>
                    <p className="text-xs text-gray-500">
                      Find the customer for transfer
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">1 of 5</div>
              </div>
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Search for Client
              </h2>
              <button
                type="button"
                onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isAdvancedFiltering
                    ? "text-white bg-blue-600 hover:bg-blue-700"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1.5" />
                {isAdvancedFiltering ? "Clear Advanced" : "Advanced Filters"}
              </button>
            </div>
          </div>

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
              <form onSubmit={handleSearch} className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Search Keywords */}
                  {!isAdvancedFiltering && (
                    <div>
                      <label
                        htmlFor="actualSearchText"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Search Keywords
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="actualSearchText"
                          name="actualSearchText"
                          value={actualSearchText}
                          onChange={(e) => setActualSearchText(e.target.value)}
                          placeholder="Search by name, email, phone..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}

                  {/* Advanced Filtering */}
                  {isAdvancedFiltering && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-2" />
                          Customer Details
                        </h3>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label
                              htmlFor="customerFirstName"
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
                                id="customerFirstName"
                                name="customerFirstName"
                                value={customerFirstName}
                                onChange={(e) =>
                                  setCustomerFirstName(e.target.value)
                                }
                                placeholder="Enter first name"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="customerLastName"
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
                                id="customerLastName"
                                name="customerLastName"
                                value={customerLastName}
                                onChange={(e) =>
                                  setCustomerLastName(e.target.value)
                                }
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
                              htmlFor="customerEmail"
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
                                id="customerEmail"
                                name="customerEmail"
                                value={customerEmail}
                                onChange={(e) =>
                                  setCustomerEmail(e.target.value)
                                }
                                placeholder="Enter email address"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="customerPhone"
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
                                id="customerPhone"
                                name="customerPhone"
                                value={customerPhone}
                                onChange={(e) =>
                                  setCustomerPhone(e.target.value)
                                }
                                placeholder="Enter phone number"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Info Note */}
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                      <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        Search for the client you want to transfer this order
                        to. Enter at least one search criteria to find existing
                        clients in the system.
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
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Skip to Associate
                      <ArrowRightIcon className="w-4 h-4 inline ml-2" />
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/order/${oid}/more`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to More Options
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
                Your transfer operation will be cancelled and your search
                criteria will be lost. This cannot be undone. Do you want to
                continue?
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

export default AdminOrderDetailMoreTransferStep1Page;

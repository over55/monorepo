// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  HomeIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ForwardIcon,
} from "@heroicons/react/24/outline";

// Constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 2;

function AdminOrderDetailMoreTransferStep2Page() {
  const { oid } = useParams();
  const [searchParams] = useSearchParams();
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const actualSearchText = searchParams.get("q") || "";

  // State management
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState("last_name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // Add search parameters
      if (actualSearchText) params.search = actualSearchText;
      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (email) params.email = email;
      if (phone) params.phone = phone;

      const data = await customerManager.getCustomers(params, () =>
        navigate("/login?unauthorized=true"),
      );

      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors({ fetch: "Failed to load customers. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchCustomers();
  }, [page, pageSize, sortBy, sortOrder]);

  // Helper function to get customer display name
  const getCustomerDisplayName = (customer) => {
    if (customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      return (
        customer.organizationName ||
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      );
    }
    return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  };

  const handleSelectClient = (clientId, customer) => {
    // Construct the proper display name
    const clientName = getCustomerDisplayName(customer);

    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedClientID = clientId;
    transferOp.pickedClientName = clientName;
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

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
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Transfer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Transfer Order
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex items-center justify-start xl:justify-center min-w-max px-2">
              <div className="flex items-center">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Search
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Find Client
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">1</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-base">
                      2
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Select
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Choose Client
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">Select</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      3
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Associate
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Select Associate
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">3</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Confirm
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Review Transfer
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">4</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 5 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      5
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Complete
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Finish Transfer
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.fetch && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{errors.fetch}</span>
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
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Search Results
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Please select a client from the search results below
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {customers && customers.results && customers.results.length > 0 ? (
              <>
                {/* Customer Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {customers.results.map((customer) => {
                    const displayName = getCustomerDisplayName(customer);
                    const isCommercial =
                      customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID;

                    return (
                      <div
                        key={customer.id}
                        className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
                        onClick={() =>
                          handleSelectClient(customer.id, customer)
                        }
                      >
                        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all">
                          <div
                            className={`${isCommercial ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-green-500 to-green-600"} p-4 text-center`}
                          >
                            <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                              {isCommercial ? (
                                <BuildingOffice2Icon className="w-8 h-8 text-white" />
                              ) : (
                                <HomeIcon className="w-8 h-8 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                              {isCommercial ? (
                                <BuildingOffice2Icon className="w-4 h-4 mr-2 text-blue-600" />
                              ) : (
                                <HomeIcon className="w-4 h-4 mr-2 text-green-600" />
                              )}
                              {displayName}
                            </h3>
                            {(customer.addressLine1 || customer.city) && (
                              <p className="text-sm text-gray-600 mb-2 flex items-start">
                                <MapPinIcon className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span>
                                  {customer.addressLine1 && (
                                    <>
                                      {customer.addressLine1}
                                      <br />
                                    </>
                                  )}
                                  {customer.city &&
                                    customer.region &&
                                    `${customer.city}, ${customer.region}`}
                                </span>
                              </p>
                            )}
                            {customer.phone && (
                              <p className="text-sm text-gray-600 mb-1 flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                                {customer.phone}
                              </p>
                            )}
                            {customer.email && (
                              <p className="text-sm text-gray-600 mb-3 flex items-center truncate">
                                <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                                <span className="truncate">
                                  {customer.email}
                                </span>
                              </p>
                            )}
                            <button
                              className={`w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white ${isCommercial ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} rounded-lg transition-colors`}
                            >
                              Select
                              <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Show</label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(parseInt(e.target.value))}
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {page > 1 && (
                      <button
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-sm text-gray-700">Page {page}</span>
                    {customers.hasNextPage && (
                      <button
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No customers found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria
                </p>
                <div className="mt-6">
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-1`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Search
                  </Link>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
              <Link
                to={`/admin/order/${oid}/more/transfer/step-1`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Step 1
              </Link>

              <button
                onClick={handleSkip}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Skip This Step
                <ForwardIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/order/${oid}/more`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Order More Options
          </Link>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Skip Client Selection?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to skip selecting a client? You can
                proceed without selecting a client, but this information may be
                helpful for the transfer process.
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowSkipWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 w-full sm:w-auto"
              >
                Yes, Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep2Page;

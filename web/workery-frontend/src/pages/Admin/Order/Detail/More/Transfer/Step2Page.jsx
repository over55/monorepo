// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step2Page.jsx
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme)
// @uix-page: OrderTransferWizardStep2

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  useAuthManager,
  useCustomerManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import { formatPhoneNumber } from "../../../../../../utils/phoneFormat";
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
  CheckIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 2;

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

function AdminOrderDetailMoreTransferStep2Page() {
  const { oid } = useParams();
  const [searchParams] = useSearchParams();
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
    { label: `#${oid}`, to: `/admin/order/${oid}`, icon: ClipboardDocumentListIcon },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Transfer", icon: ArrowPathIcon, isActive: true },
  ], [oid]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
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

      const data = await customerManager.getCustomers(params, onUnauthorized);

      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors({ fetch: "Failed to load customers. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, actualSearchText, firstName, lastName, email, phone, customerManager, onUnauthorized]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      onUnauthorized();
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
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <ArrowPathIcon className={`w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 ${themeClasses.linkPrimary} flex-shrink-0`} />
            Transfer Order
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSecondary} flex items-center`}>
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Select a client from the search results to continue with the
            transfer
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 2: Select
                  </p>
                  <p className="text-xs text-gray-500">Choose Client</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">2 of 5</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Find Client</p>
                </div>
              </div>

              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Select</p>
                  <p className="text-xs text-gray-500">Choose Client</p>
                </div>
              </div>

              {/* Remaining Steps */}
              {[
                { num: 3, title: "Associate", subtitle: "Select Associate" },
                { num: 4, title: "Confirm", subtitle: "Review Transfer" },
                { num: 5, title: "Complete", subtitle: "Finish Transfer" },
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
        {errors.fetch && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.fetch}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content with Dark Header */}
        <DetailSection
          title="Search Results"
          icon={UserGroupIcon}
          description="Please select a client from the search results below"
        >
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
                      onClick={() => handleSelectClient(customer.id, customer)}
                    >
                      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <div
                          className={`${
                            isCommercial
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gradient-to-br from-green-500 to-green-600"
                          } p-4 text-center`}
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
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center">
                            {isCommercial ? (
                              <BuildingOffice2Icon className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                            ) : (
                              <HomeIcon className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                            )}
                            <span className="truncate">{displayName}</span>
                          </h3>
                          {(customer.addressLine1 || customer.city) && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-start">
                              <MapPinIcon className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span className="line-clamp-2">
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
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center">
                              <PhoneIcon className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{formatPhoneNumber(customer.phone)}</span>
                            </p>
                          )}
                          {customer.email && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 flex items-center">
                              <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{customer.email}</span>
                            </p>
                          )}
                          <button
                            className={`w-full inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white ${
                              isCommercial
                                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            } rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
                  <label className="text-xs sm:text-sm text-gray-700">
                    Show
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-xs sm:text-sm text-gray-700">
                    entries
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {page > 1 && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Page {page}
                  </span>
                  {customers.hasNextPage && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Search
                </Link>
              </div>
            </div>
          )}
        </DetailSection>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3">
          <Link
            to={`/admin/order/${oid}/more/transfer/step-1`}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            Back to Step 1
          </Link>

          <button
            onClick={handleSkip}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            Skip This Step
            <ForwardIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/order/${oid}/more`}
            className={`inline-flex items-center text-xs sm:text-sm ${themeClasses.linkPrimary} hover:opacity-80 transition-colors`}
          >
            <ArrowLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to Order More Options
          </Link>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-amber-600" />
                Skip Client Selection?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Are you sure you want to skip selecting a client? You can
                proceed without selecting a client, but this information may be
                helpful for the transfer process.
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowSkipWarning(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors w-full sm:w-auto"
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

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreTransferStep2PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreTransferStep2Page />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreTransferStep2PageWithProvider;

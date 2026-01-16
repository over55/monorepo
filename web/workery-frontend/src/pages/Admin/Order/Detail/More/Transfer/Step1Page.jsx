// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step1Page.jsx
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme)
// @uix-page: OrderTransferWizardStep1

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  useAuthManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ArrowsRightLeftIcon,
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
} from "@heroicons/react/24/outline";

// Section Component with Dark Header Pattern - Moved outside to prevent re-creation
const DetailSection = ({
  title,
  icon: Icon,
  children,
  description,
  actions,
}) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              {description}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminOrderDetailMoreTransferStep1Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
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
    { label: `#${oid}`, to: `/admin/order/${oid}`, icon: ClipboardDocumentIcon },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Transfer", icon: ArrowsRightLeftIcon, isActive: true },
  ], [oid]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Initialize from storage
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      onUnauthorized();
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
  }, [authManager, onUnauthorized, transferOperationStorage]);

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
      // Scroll to top to show errors
      window.scrollTo(0, 0);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <ArrowsRightLeftIcon className={`w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 ${themeClasses.linkPrimary} flex-shrink-0`} />
            Transfer Order
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSecondary} flex items-center`}>
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Search for the client to transfer this order to
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 1: Search Client
                  </p>
                  <p className="text-xs text-gray-500">Find Customer</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">1 of 5</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
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

              {/* Remaining Steps */}
              {[
                { num: 2, title: "Pick Client", subtitle: "Select Result" },
                { num: 3, title: "Search Associate", subtitle: "Find Worker" },
                { num: 4, title: "Pick Associate", subtitle: "Select Worker" },
                { num: 5, title: "Confirm", subtitle: "Review Transfer" },
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
        {errors.message && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSearch}>
          {isLoading ? (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="flex items-center justify-center">
                <Spinner size="lg" />
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Search Section with Dark Header */}
              <DetailSection
                title="Search for Client"
                icon={MagnifyingGlassIcon}
                description="Find the customer you want to transfer this order to"
                actions={
                  <button
                    type="button"
                    onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                    className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      isAdvancedFiltering
                        ? "text-white bg-blue-600 hover:bg-blue-700"
                        : "text-gray-300 bg-gray-600 hover:bg-gray-500"
                    }`}
                  >
                    <AdjustmentsHorizontalIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">
                      {isAdvancedFiltering
                        ? "Clear Advanced"
                        : "Advanced Filters"}
                    </span>
                    <span className="sm:hidden">
                      {isAdvancedFiltering ? "Clear" : "Advanced"}
                    </span>
                  </button>
                }
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Search Keywords */}
                  {!isAdvancedFiltering && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Search Keywords
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={actualSearchText}
                          onChange={(e) => setActualSearchText(e.target.value)}
                          placeholder="Search by name, email, phone..."
                          className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Advanced Filtering */}
                  {isAdvancedFiltering && (
                    <>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                          <UserGroupIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                          Customer Details
                        </h3>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              First Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={customerFirstName}
                                onChange={(e) =>
                                  setCustomerFirstName(e.target.value)
                                }
                                placeholder="Enter first name"
                                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Last Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={customerLastName}
                                onChange={(e) =>
                                  setCustomerLastName(e.target.value)
                                }
                                placeholder="Enter last name"
                                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) =>
                                  setCustomerEmail(e.target.value)
                                }
                                placeholder="Enter email address"
                                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) =>
                                  setCustomerPhone(e.target.value)
                                }
                                placeholder="Enter phone number"
                                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
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
                      <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        Search for the client you want to transfer this order
                        to. Enter at least one search criteria to find existing
                        clients in the system. You can also skip to associate
                        search if needed.
                      </span>
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Cancel
                </button>
                <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-initial sm:ml-auto">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Skip to Associate
                    <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MagnifyingGlassIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Back Link */}
        <div className="mt-6 sm:mt-8">
          <Link
            to={`/admin/order/${oid}/more`}
            className={`inline-flex items-center text-xs sm:text-sm ${themeClasses.linkPrimary} hover:opacity-80 transition-colors`}
          >
            <ArrowLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to More Options
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 sm:h-6 w-5 sm:w-6 mr-2 text-amber-600 flex-shrink-0" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm sm:text-base text-gray-600">
                Your transfer operation will be cancelled and your search
                criteria will be lost. This cannot be undone. Do you want to
                continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
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
function AdminOrderDetailMoreTransferStep1PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreTransferStep1Page />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreTransferStep1PageWithProvider;

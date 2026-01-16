// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step3Page.jsx
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme)
// @uix-page: OrderTransferWizardStep3

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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Section Component with Dark Header Pattern - Moved outside to prevent re-creation
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

function AdminOrderDetailMoreTransferStep3Page() {
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
    { label: `#${oid}`, to: `/admin/order/${oid}`, icon: ClipboardDocumentListIcon },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Transfer", icon: ArrowsRightLeftIcon, isActive: true },
  ], [oid]);

  // State management
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Initialize from storage
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      onUnauthorized();
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
            Search for an associate to transfer this order to
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 3: Associate
                  </p>
                  <p className="text-xs text-gray-500">Search</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">3 of 5</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-2 Complete */}
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Confirm"}
                        {step === 2 && "Client"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

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

              {/* Remaining Steps */}
              {[
                { num: 4, title: "Select", subtitle: "Associate" },
                { num: 5, title: "Review", subtitle: "Confirm" },
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          {isLoading ? (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="flex items-center justify-center">
                <Spinner size="lg" />
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Search Section */}
              <DetailSection
                title="Search for Associate"
                icon={MagnifyingGlassIcon}
                description="Enter one or more fields to begin searching for an associate"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Search Keywords */}
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
                        placeholder="Search by name, email, or other keywords..."
                        className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Advanced Filter Toggle */}
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="advancedFiltering"
                      checked={isAdvancedFiltering}
                      onChange={(e) => setIsAdvancedFiltering(e.target.checked)}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                    />
                    <label
                      htmlFor="advancedFiltering"
                      className="ml-2 sm:ml-3 text-sm sm:text-base font-semibold text-gray-700"
                    >
                      Use advanced filters
                    </label>
                  </div>
                  {isAdvancedFiltering && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdvancedFiltering(false);
                        setAssociateFirstName("");
                        setAssociateLastName("");
                        setAssociateEmail("");
                        setAssociatePhone("");
                      }}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 ml-6 sm:ml-8">
                  Enable to search by specific associate details like name,
                  email, or phone
                </p>
              </div>

              {/* Advanced Filtering Section */}
              {isAdvancedFiltering && (
                <DetailSection
                  title="Advanced Search"
                  icon={AdjustmentsHorizontalIcon}
                  description="Search by specific associate information"
                >
                  <div className="space-y-4 sm:space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                            value={associateFirstName}
                            onChange={(e) =>
                              setAssociateFirstName(e.target.value)
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
                            value={associateLastName}
                            onChange={(e) =>
                              setAssociateLastName(e.target.value)
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
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={associateEmail}
                            onChange={(e) => setAssociateEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={associatePhone}
                            onChange={(e) => setAssociatePhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/admin/order/${oid}/more/transfer/step-2`}
                  className="flex-1"
                >
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-yellow-50 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  Skip Associate
                  <ForwardIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>

                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search
                  <MagnifyingGlassIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreTransferStep3PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreTransferStep3Page />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreTransferStep3PageWithProvider;

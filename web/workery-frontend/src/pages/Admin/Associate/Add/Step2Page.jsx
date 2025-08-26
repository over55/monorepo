// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  UserGroupIcon,
  InformationCircleIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

function AdminAssociateAddStep2Page() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Fetch current user for country info
    fetchCurrentUser();
  }, [authManager, navigate]);

  const fetchCurrentUser = async () => {
    try {
      const user = await accountManager.getAccountDetail(() =>
        navigate("/login?unauthorized=true"),
      );
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const onSelectType = (typeId) => {
    // Set visual selection state
    setSelectedType(typeId);

    // Animate the selection before navigating
    setTimeout(() => {
      // Get existing associate creation state or create new one
      let associateState = {};
      try {
        const existing = sessionStorage.getItem(
          "WORKERY_ASSOCIATE_CREATION_STATE",
        );
        if (existing) {
          associateState = JSON.parse(existing);
        }
      } catch (error) {
        console.error("Error parsing associate state:", error);
      }

      // Set the type
      associateState.type = typeId;

      // Set default country based on current user's country
      if (currentUser?.country) {
        associateState.country = currentUser.country;
      } else {
        associateState.country = "Canada"; // Default fallback
      }

      // Save to session storage
      try {
        sessionStorage.setItem(
          "WORKERY_ASSOCIATE_CREATION_STATE",
          JSON.stringify(associateState),
        );
      } catch (error) {
        console.error("Error saving associate state:", error);
      }

      // Navigate to next step
      navigate("/admin/associates/add/step-3");
    }, 300);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate("/admin/associates/add/step-1-search");
  };

  // Section Component with Dark Header Pattern
  const DetailSection = ({ title, icon: Icon, children, description }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h2>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-gray-300">{description}</p>
        )}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <Link
                  to="/admin/associates"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Associates</span>
                    <span className="sm:hidden">Assoc</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Associate
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Select the type of associate you want to create
          </p>
        </div>

        {/* Wizard Steps - Mobile First Responsive Design */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View - Simplified */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 2: Type
                  </p>
                  <p className="text-xs text-gray-500">Select Associate Type</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">2 of 7</div>
            </div>
          </div>

          {/* Desktop View - Full Wizard */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-xs text-gray-500">Select Type</p>
                </div>
              </div>

              {/* Remaining Steps */}
              {[
                { num: 3, title: "Contact", subtitle: "Basic Info" },
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
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

        {/* Main Content with Dark Header */}
        <DetailSection
          title="Select Associate Type"
          icon={UserGroupIcon}
          description="Choose the appropriate category for this associate"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
              {/* Individual/Residential Card */}
              <div
                className={`relative group cursor-pointer transform transition-all duration-300 ${
                  selectedType === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID
                    ? "scale-105 ring-4 ring-green-500 ring-opacity-50"
                    : "hover:scale-105"
                }`}
                onClick={() => onSelectType(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID)}
              >
                <div
                  className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedType === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID
                      ? "border-green-500 shadow-2xl"
                      : "border-gray-200 hover:border-green-500 hover:shadow-xl"
                  }`}
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 sm:p-8 lg:p-10 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    {/* Icon Container */}
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <HomeIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                        <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                      <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600 flex-shrink-0" />
                      Individual
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
                      For individual contractors and service providers working
                      independently
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Personal profile management</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Direct client assignments</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Individual billing setup</span>
                      </div>
                    </div>

                    <button
                      className={`w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${
                        selectedType === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID
                          ? "text-white bg-green-600 hover:bg-green-700"
                          : "text-white bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Select Individual
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </button>
                  </div>

                  {/* Selected Indicator */}
                  {selectedType === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full animate-bounce">
                      <CheckIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial Card */}
              <div
                className={`relative group cursor-pointer transform transition-all duration-300 ${
                  selectedType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                    ? "scale-105 ring-4 ring-blue-500 ring-opacity-50"
                    : "hover:scale-105"
                }`}
                onClick={() => onSelectType(COMMERCIAL_ASSOCIATE_TYPE_OF_ID)}
              >
                <div
                  className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                      ? "border-blue-500 shadow-2xl"
                      : "border-gray-200 hover:border-blue-500 hover:shadow-xl"
                  }`}
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 sm:p-8 lg:p-10 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    {/* Icon Container */}
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <BuildingOffice2Icon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                        <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                      <BuildingOffice2Icon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600 flex-shrink-0" />
                      Commercial
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
                      For businesses, companies, and commercial service
                      providers
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span>Company profile setup</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span>Multiple employee management</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <CheckIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span>Business billing options</span>
                      </div>
                    </div>

                    <button
                      className={`w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${
                        selectedType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                          ? "text-white bg-blue-600 hover:bg-blue-700"
                          : "text-white bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      <BuildingOffice2Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Select Commercial
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </button>
                  </div>

                  {/* Selected Indicator */}
                  {selectedType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full animate-bounce">
                      <CheckIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Not sure which to choose?</strong> Select "Individual"
                  for independent contractors or sole proprietors. Select
                  "Commercial" for businesses with multiple employees or
                  corporate structures.
                </span>
              </p>
            </div>

            {/* Cancel Button */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </DetailSection>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/associates/add/step-1-search"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal with Dark Header */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationCircleIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-amber-400 flex-shrink-0" />
                <span className="truncate">Are you sure?</span>
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <p className="text-sm sm:text-base text-gray-600">
                Your Associate record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
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

export default AdminAssociateAddStep2Page;

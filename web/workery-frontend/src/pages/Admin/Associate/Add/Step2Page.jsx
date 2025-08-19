// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

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
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Select Associate Type
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Please select the type of associate this is
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Residential Card */}
              <div
                className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => onSelectType(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID)}
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                      <HomeIcon className="w-14 h-14 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center">
                      <HomeIcon className="w-5 h-5 mr-2 text-green-600" />
                      Individual
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      Add an Individual Associate
                    </p>
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      Select Individual
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Commercial Card */}
              <div
                className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
                onClick={() => onSelectType(COMMERCIAL_ASSOCIATE_TYPE_OF_ID)}
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                      <BuildingOffice2Icon className="w-14 h-14 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center">
                      <BuildingOffice2Icon className="w-5 h-5 mr-2 text-blue-600" />
                      Commercial
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      Add a Commercial Associate
                    </p>
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      Select Commercial
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/associates/add/step-1-search"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Search
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
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

// File Path: web/workery-frontend/src/pages/Admin/Setting/NAICS/Search/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  XMarkIcon,
  InformationCircleIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HashtagIcon,
  DocumentTextIcon,
  SparklesIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

function SettingNAICSSearchPage() {
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [code, setCode] = useState("");
  const [industryTitle, setIndustryTitle] = useState("");

  // Event handling
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (actualSearchText === "" && code === "" && industryTitle === "") {
      setErrors({
        message: "Please enter a value in at least one search field",
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Build search URL with parameters
    const searchParams = new URLSearchParams();
    if (actualSearchText.trim()) {
      searchParams.append("q", actualSearchText.trim());
    }
    if (code.trim()) {
      searchParams.append("c", code.trim());
    }
    if (industryTitle.trim()) {
      searchParams.append("it", industryTitle.trim());
    }

    const searchURL = `/admin/settings/naics/search-result?${searchParams.toString()}`;
    navigate(searchURL);
  };

  const handleClearForm = () => {
    setActualSearchText("");
    setCode("");
    setIndustryTitle("");
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  };

  useEffect(() => {
    // Reset loading state on mount
    setIsFetching(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <button
                  onClick={() => navigate("/admin/settings")}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2"
                >
                  Settings
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  NAICS Search
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <BuildingOffice2Icon className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  North American Industry Classification System
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Search for NAICS codes and industry classifications
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/settings")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Settings
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setErrors({})}
                  className="inline-flex text-red-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Search NAICS Database
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter one or more search criteria to find industry
                  classifications
                </p>
              </div>

              <form onSubmit={onSubmitClick} className="p-6">
                {/* Basic Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MagnifyingGlassIcon className="inline h-4 w-4 mr-1" />
                    Search Keywords
                  </label>
                  <input
                    type="text"
                    name="actualSearchText"
                    value={actualSearchText}
                    onChange={(e) => setActualSearchText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter industry, business type, or keywords..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Search across all NAICS fields including titles,
                    descriptions, and activities
                  </p>
                </div>

                {/* Advanced Search Toggle */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Advanced Search Options
                    {isAdvancedFiltering ? (
                      <ChevronUpIcon className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    )}
                  </button>
                </div>

                {/* Advanced Search Fields */}
                {isAdvancedFiltering && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      Advanced Search Criteria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <HashtagIcon className="inline h-4 w-4 mr-1" />
                          NAICS Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="e.g., 541710"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter specific 6-digit NAICS code
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DocumentTextIcon className="inline h-4 w-4 mr-1" />
                          Industry Title
                        </label>
                        <input
                          type="text"
                          name="industryTitle"
                          value={industryTitle}
                          onChange={(e) => setIndustryTitle(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="e.g., Software Publishers"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Search by industry classification name
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/settings")}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Clear
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isFetching}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetching ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Help & Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Tips */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  Search Tips
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use broad terms for general searches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Try industry names or business types</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use NAICS codes for precise results</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Combine criteria for refined searches</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Common Examples */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Popular Searches
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActualSearchText("software");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Software Publishers
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("construction");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Construction Services
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("retail");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Retail Trade
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("manufacturing");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Manufacturing Industries
                  </button>
                </div>
              </div>
            </div>

            {/* About NAICS */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  About NAICS
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    The North American Industry Classification System (NAICS) is
                    the standard used by Federal statistical agencies in
                    classifying business establishments.
                  </p>
                  <p>
                    It organizes economic data for the purpose of collecting,
                    analyzing, and publishing statistical data related to the
                    U.S. business economy:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Business analysis</li>
                    <li>Economic research</li>
                    <li>Statistical reporting</li>
                    <li>Industry comparisons</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-900">
                    Need Help?
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Visit the official{" "}
                    <a
                      href="https://www.census.gov/naics/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium hover:text-blue-800"
                    >
                      NAICS website
                    </a>{" "}
                    for detailed information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingNAICSSearchPage;

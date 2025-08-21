// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/Search/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
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

function SettingNOCSearchPage() {
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [code, setCode] = useState("");
  const [unitGroupTitle, setUnitGroupTitle] = useState("");

  // Event handling
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (actualSearchText === "" && code === "" && unitGroupTitle === "") {
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
    if (unitGroupTitle.trim()) {
      searchParams.append("ugt", unitGroupTitle.trim());
    }

    const searchURL = `/admin/settings/noc/search-result?${searchParams.toString()}`;
    navigate(searchURL);
  };

  const handleClearForm = () => {
    setActualSearchText("");
    setCode("");
    setUnitGroupTitle("");
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Reset loading state on mount
    setIsFetching(false);
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        minHeight: "100dvh",
        paddingBottom: "env(keyboard-inset-height, 0px)",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8"
        style={{
          paddingBottom:
            "max(1rem, env(safe-area-inset-bottom), env(keyboard-inset-height, 0px))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        {/* Breadcrumb - iOS & Android Optimized */}
        <nav
          className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto -webkit-overflow-scrolling-touch"
          aria-label="Breadcrumb"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 min-h-[48px] px-2 py-2 rounded-md touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "48px",
                  touchAction: "manipulation",
                }}
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
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2 transition-colors duration-200 min-h-[48px] px-2 py-2 rounded-md touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    touchAction: "manipulation",
                  }}
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
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2">
                  NOC Search
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section - Improved mobile layout */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                <AcademicCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    National Occupational Classification
                  </h1>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
                    Search for NOC codes and occupational classifications
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate("/admin/settings")}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 w-full sm:w-auto justify-center min-h-[48px] touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  minHeight: "48px",
                  touchAction: "manipulation",
                }}
              >
                <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Back to Settings
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert - Improved mobile layout */}
        {errors.message && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <p className="text-xs sm:text-sm text-red-800">
                  {errors.message}
                </p>
              </div>
              <div className="ml-auto pl-2 sm:pl-3">
                <button
                  onClick={() => setErrors({})}
                  className="inline-flex text-red-400 hover:text-red-500 transition-colors duration-200 p-2 min-h-[48px] min-w-[48px] items-center justify-center rounded-md touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    minHeight: "48px",
                    minWidth: "48px",
                    touchAction: "manipulation",
                  }}
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Search Form - Left Column */}
          <div className="xl:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-600" />
                  Search NOC Database
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Enter one or more search criteria to find occupational
                  classifications
                </p>
              </div>

              <form onSubmit={onSubmitClick} className="p-4 sm:p-6">
                {/* Basic Search */}
                <div className="mb-4 sm:mb-6">
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
                    placeholder="Enter occupation, job title, or keywords..."
                    className="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base min-h-[48px] touch-manipulation"
                    style={{
                      minHeight: "48px",
                      fontSize: "16px", // Prevents zoom on iOS
                      touchAction: "manipulation",
                      WebkitAppearance: "none",
                    }}
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Search across all NOC fields including titles, descriptions,
                    and tasks
                  </p>
                </div>

                {/* Advanced Search Toggle */}
                <div className="mb-4 sm:mb-6">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
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
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      Advanced Search Criteria
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <HashtagIcon className="inline h-4 w-4 mr-1" />
                          NOC Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="e.g., 1234"
                          className="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base min-h-[48px] touch-manipulation"
                          style={{
                            minHeight: "48px",
                            fontSize: "16px", // Prevents zoom on iOS
                            touchAction: "manipulation",
                            WebkitAppearance: "none",
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter specific 4-digit NOC code
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DocumentTextIcon className="inline h-4 w-4 mr-1" />
                          Unit Group Title
                        </label>
                        <input
                          type="text"
                          name="unitGroupTitle"
                          value={unitGroupTitle}
                          onChange={(e) => setUnitGroupTitle(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="e.g., Software Engineers"
                          className="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base min-h-[48px] touch-manipulation"
                          style={{
                            minHeight: "48px",
                            fontSize: "16px", // Prevents zoom on iOS
                            touchAction: "manipulation",
                            WebkitAppearance: "none",
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Search by occupation group name
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Improved mobile layout */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/settings")}
                      className="inline-flex items-center px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 justify-center min-h-[48px] touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        minHeight: "48px",
                        touchAction: "manipulation",
                      }}
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="inline-flex items-center px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 justify-center min-h-[48px] touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                        minHeight: "48px",
                        touchAction: "manipulation",
                      }}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Clear
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isFetching}
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 justify-center min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
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

          {/* Right Column - Help & Information - Better mobile spacing */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Quick Tips */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
                  Search Tips
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use broad terms for general searches</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Try job titles, industries, or skills</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use NOC codes for precise results</span>
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
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                  Popular Searches
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-1 sm:space-y-2">
                  <button
                    onClick={() => {
                      setActualSearchText("software");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
                  >
                    Software Developers
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("nurse");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
                  >
                    Registered Nurses
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("construction");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
                  >
                    Construction Trades
                  </button>
                  <button
                    onClick={() => {
                      setActualSearchText("manager");
                      setIsAdvancedFiltering(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      minHeight: "48px",
                      touchAction: "manipulation",
                    }}
                  >
                    Management Occupations
                  </button>
                </div>
              </div>
            </div>

            {/* About NOC */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  About NOC
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <p>
                    The National Occupational Classification (NOC) is Canada's
                    national system for describing occupations.
                  </p>
                  <p>
                    It organizes over 30,000 job titles into 500 unit groups,
                    providing a standardized framework for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Labor market analysis</li>
                    <li>Career planning</li>
                    <li>Immigration programs</li>
                    <li>Skills development</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex">
                <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900">
                    Need Help?
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-blue-700">
                    Visit the official{" "}
                    <a
                      href="https://noc.esdc.gc.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium hover:text-blue-800 transition-colors duration-200"
                    >
                      NOC website
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

export default SettingNOCSearchPage;

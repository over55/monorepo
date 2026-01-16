// File Path: src/pages/Admin/Report/10To19/17Page.jsx
// @uix-page: AdminReport17Page
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  HomeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  UsersIcon,
  UserGroupIcon,
  ChartPieIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// User type options matching the old implementation
const USER_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Client" },
  { value: 2, label: "Associate" },
  { value: 3, label: "Staff" },
];

function AdminReport17Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes for performance
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      bgHover: getThemeClasses("bg-hover"),
      borderPrimary: getThemeClasses("border-primary"),
      borderSecondary: getThemeClasses("border-secondary"),
      inputBg: getThemeClasses("input-bg"),
      inputBorder: getThemeClasses("input-border"),
      inputText: getThemeClasses("input-text"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
      { label: "Reports", to: "/admin/reports", icon: ChartBarIcon },
      {
        label: "How Users Find Us (Short)",
        icon: GlobeAltIcon,
        isActive: true,
      },
    ],
    [],
  );

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userType, setUserType] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setToDate(today.toISOString().split("T")[0]);

    // Load saved preferences
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report17) {
      if (preferences.report17.fromDate) {
        setFromDate(preferences.report17.fromDate);
      }
      if (preferences.report17.toDate) {
        setToDate(preferences.report17.toDate);
      }
      if (preferences.report17.userType) {
        setUserType(preferences.report17.userType);
      }
    }
  }, []);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate from date
    if (!fromDate || fromDate === "") {
      newErrors.fromDate = "From date is required";
      hasErrors = true;
    }

    // Validate to date
    if (!toDate || toDate === "") {
      newErrors.toDate = "To date is required";
      hasErrors = true;
    }

    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        newErrors.toDate = "To date must be after from date";
        hasErrors = true;
      }
    }

    // Validate user type
    if (!userType || userType === "") {
      newErrors.userType = "User type is required";
      hasErrors = true;
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport17Page: Submitting report", {
      fromDate,
      toDate,
      userType,
    });

    // Validate
    const validation = validateForm();
    if (validation.hasErrors) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Convert dates to timestamps (matching old implementation)
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      // Build parameters
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
        user_type: parseInt(userType),
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const userTypeName =
        USER_TYPE_OPTIONS.find(
          (opt) => opt.value === parseInt(userType),
        )?.label.toLowerCase() || "all";
      const filename = `how_users_find_us_short_${userTypeName}_${timestamp}.csv`;

      await reportManager.downloadReport(
        17, // Report ID for How Users Find Us (Short) Report
        params,
        filename,
        onUnauthorized,
      );

      // Show success message
      setShowSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      // Save preferences for next time
      reportManager.saveReportPreferences({
        report17: {
          fromDate: fromDate,
          toDate: toDate,
          userType: userType,
        },
      });

      console.log("AdminReport17Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport17Page: Error downloading report", error);

      // Handle errors
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to download report. Please try again.",
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle date change
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (errors.fromDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.fromDate;
        return newErrors;
      });
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (errors.toDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.toDate;
        return newErrors;
      });
    }
  };

  // Get recent downloads from history
  const recentDownloads = reportManager
    .getReportHistory()
    .filter(
      (item) =>
        item.reportId === 17 ||
        item.reportType === "How Users Find Us (Short)" ||
        item.filename?.includes("how_users_find_us_short"),
    )
    .slice(0, 5);

  if (isLoading) {
    return <Loading fullScreen message="Loading report settings..." />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full xl:max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6 lg:mb-8" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {/* Card Header */}
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <div className="flex items-center">
                <GlobeAltIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <div>
                  <h1 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
                    How Users Find Us (Short) Report
                  </h1>
                  <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                    Summary report on how users discovered us and referral
                    sources
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Success Message */}
              {showSuccess && (
                <Alert
                  type="success"
                  dismissible
                  onDismiss={() => setShowSuccess(false)}
                  className="mb-6 animate-fade-in"
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Report downloaded successfully! Check your downloads folder.
                  </div>
                </Alert>
              )}

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <Alert
                  type="error"
                  dismissible
                  onDismiss={() => setErrors({})}
                  className="mb-6 animate-shake"
                >
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        There were errors with your submission:
                      </p>
                      {errors.general ? (
                        <p className="mt-1">{errors.general}</p>
                      ) : (
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          {Object.entries(errors).map(([field, message]) => (
                            <li key={field} className="text-sm">
                              {message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert type="info" className="mb-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Report Information</p>
                    <p className="mt-1 text-sm">
                      This report generates a concise CSV file summarizing how
                      users discovered your services. It includes key referral
                      sources and marketing channels for the selected user type
                      and date range, perfect for quick analysis and
                      decision-making.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Range Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Date */}
                  <div>
                    <label
                      htmlFor="fromDate"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                    >
                      From Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className={`h-5 w-5 ${themeClasses.textMuted}`} />
                      </div>
                      <input
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        onChange={handleFromDateChange}
                        className={`
                          w-full pl-10 pr-3 py-2.5
                          border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${themeClasses.inputBg} ${themeClasses.inputText}
                          ${
                            errors.fromDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : `${themeClasses.inputBorder} focus:border-blue-500 focus:ring-blue-500/20`
                          }
                        `}
                        required
                      />
                    </div>
                    <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>
                      Refers to user join date
                    </p>
                    {errors.fromDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.fromDate}
                      </p>
                    )}
                  </div>

                  {/* To Date */}
                  <div>
                    <label
                      htmlFor="toDate"
                      className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                    >
                      To Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className={`h-5 w-5 ${themeClasses.textMuted}`} />
                      </div>
                      <input
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={handleToDateChange}
                        className={`
                          w-full pl-10 pr-3 py-2.5
                          border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${themeClasses.inputBg} ${themeClasses.inputText}
                          ${
                            errors.toDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : `${themeClasses.inputBorder} focus:border-blue-500 focus:ring-blue-500/20`
                          }
                        `}
                        required
                      />
                    </div>
                    <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>
                      Refers to user join date
                    </p>
                    {errors.toDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.toDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* User Type Selection */}
                <div>
                  <label
                    htmlFor="userType"
                    className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
                  >
                    What type of user to filter by?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UsersIcon className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                    <select
                      id="userType"
                      name="userType"
                      value={userType}
                      onChange={(e) => {
                        setUserType(e.target.value);
                        if (errors.userType) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.userType;
                            return newErrors;
                          });
                        }
                      }}
                      className={`
                        w-full pl-10 pr-10 py-2.5 border rounded-lg
                        transition-all duration-200 appearance-none
                        ${themeClasses.inputBg} ${themeClasses.inputText}
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${
                          errors.userType
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : `${themeClasses.inputBorder} focus:border-blue-500 focus:ring-blue-500/20`
                        }
                      `}
                      required
                    >
                      {USER_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className={`h-5 w-5 ${themeClasses.textMuted}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>
                    Select the user category to include in the report
                  </p>
                  {errors.userType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.userType}
                    </p>
                  )}
                </div>

                {/* Report Preview */}
                {fromDate &&
                  toDate &&
                  userType &&
                  !Object.keys(errors).length && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                      <h4 className={`text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                        Report Preview
                      </h4>
                      <div className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                        <p>
                          <span className="font-medium">Date Range:</span>{" "}
                          {new Date(fromDate).toLocaleDateString()} to{" "}
                          {new Date(toDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">User Type:</span>{" "}
                          {USER_TYPE_OPTIONS.find(
                            (opt) => opt.value === parseInt(userType),
                          )?.label || "All"}
                        </p>
                        <p>
                          <span className="font-medium">Report Type:</span>{" "}
                          Summary referral source analysis
                        </p>
                        <p>
                          <span className="font-medium">Format:</span> Condensed
                          CSV format
                        </p>
                      </div>
                    </div>
                  )}

                {/* Form Actions */}
                <div className={`flex items-center justify-between pt-6 border-t ${themeClasses.borderSecondary}`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/reports")}
                    icon={ArrowLeftIcon}
                  >
                    Back to Reports
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    icon={DocumentArrowDownIcon}
                  >
                    {isSubmitting ? "Generating..." : "Download Report"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Recent Downloads Card */}
          <Card>
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <div className="flex items-center">
                <ClockIcon className={`w-5 h-5 ${themeClasses.textSecondary} mr-2`} />
                <h2 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                  Recent Downloads
                </h2>
              </div>
            </div>
            <div className="p-6">
              {recentDownloads.length > 0 ? (
                <div className="space-y-3">
                  {recentDownloads.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 ${themeClasses.bgHover} rounded-lg hover:opacity-80 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${themeClasses.textPrimary} truncate`}>
                            {item.filename}
                          </p>
                          <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                            {new Date(item.downloadedAt).toLocaleString()}
                          </p>
                        </div>
                        <DocumentArrowDownIcon className={`w-4 h-4 ${themeClasses.textMuted} flex-shrink-0 ml-2`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentArrowDownIcon className={`mx-auto h-12 w-12 ${themeClasses.textMuted}`} />
                  <p className={`mt-2 text-sm ${themeClasses.textMuted}`}>
                    No recent downloads
                  </p>
                  <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                    Downloaded reports will appear here
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* What's Included Card */}
          <Card className="mt-6">
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                What's Included
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Summary Data
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Condensed view of key metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <GlobeAltIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Top Referral Sources
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Most common discovery channels
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartPieIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Percentage Breakdown
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Distribution across channels
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MagnifyingGlassIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Quick Insights
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Key trends and patterns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Report Comparison */}
          <Card className="mt-6">
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Short vs Long Report
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Short Report (Current)
                  </h4>
                  <ul className={`text-xs ${themeClasses.textSecondary} space-y-1`}>
                    <li>• Summary statistics</li>
                    <li>• Top referral sources</li>
                    <li>• Quick overview format</li>
                    <li>• Best for dashboards</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Long Report
                  </h4>
                  <ul className={`text-xs ${themeClasses.textSecondary} space-y-1`}>
                    <li>• Detailed user data</li>
                    <li>• Complete referral history</li>
                    <li>• Comprehensive format</li>
                    <li>• Best for deep analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Report Tips */}
          <Card className="mt-6">
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Report Tips
              </h3>
            </div>
            <div className="p-6">
              <ul className={`space-y-3 text-sm ${themeClasses.textSecondary}`}>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Use this report for quick executive summaries</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Perfect for monthly marketing performance reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Compare periods to identify trending channels</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Focus budget on highest-performing sources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Track ROI by comparing user types and sources</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminReport17PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminReport17Page />
    </UIXThemeProvider>
  );
}

export default AdminReport17PageWithProvider;

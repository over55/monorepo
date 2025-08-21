// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/03Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useReportManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

function AdminReport03Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences and set default dates on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate dates
    if (!fromDate) {
      newErrors.fromDate = "From date is required";
      hasErrors = true;
    }

    if (!toDate) {
      newErrors.toDate = "To date is required";
      hasErrors = true;
    }

    // Check date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        newErrors.toDate = "To date must be after from date";
        hasErrors = true;
      }

      // Check for future dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (to > today) {
        newErrors.toDate = "To date cannot be in the future";
        hasErrors = true;
      }

      // Check date range is not too large (optional - e.g., max 1 year)
      const daysDiff = Math.floor((to - from) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        newErrors.toDate = "Date range cannot exceed 1 year";
        hasErrors = true;
      }
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport03Page: Submitting report", {
      fromDate,
      toDate,
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
      // Convert dates to timestamps
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      // Download the report using generic downloadReport method
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `service_fees_by_types_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        3, // Report ID for Service Fees by Types Report
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
        lastServiceFeesByTypesReport: {
          // Could save date range preferences if needed
        },
      });

      console.log("AdminReport03Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport03Page: Error downloading report", error);

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

  // Get recent downloads from history
  const recentDownloads = reportManager
    .getReportHistory()
    .filter(
      (item) =>
        item.reportId === 3 || item.reportType === "Service Fees by Types",
    )
    .slice(0, 5);

  // Calculate summary statistics from date range
  const getDateRangeSummary = () => {
    if (!fromDate || !toDate) return null;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDiff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return {
      days: daysDiff,
      weeks: Math.floor(daysDiff / 7),
      months: Math.floor(daysDiff / 30),
    };
  };

  const dateRangeSummary = getDateRangeSummary();

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: ChartBarIcon,
    },
    {
      label: "Service Fees by Types",
      icon: CreditCardIcon,
    },
  ];

  if (isLoading) {
    return <Loading fullScreen message="Loading report settings..." />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full xl:max-w-7xl">
      {/* Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
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
              <Link
                to="/admin/reports"
                className="ml-1 text-xs sm:text-sm font-medium text-gray-700 md:ml-2 hover:text-blue-600"
              >
                Reports
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
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
                Service Fees by Types
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <CreditCardIcon className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Service Fees by Types Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a breakdown of revenue by service fee types
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
                      This report will generate a CSV file containing a
                      breakdown of all service fees collected within the
                      specified date range, grouped by service fee type. The
                      dates refer to the invoice service fee payment date.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Range Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Date Field */}
                  <div>
                    <label
                      htmlFor="fromDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      From Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          if (errors.fromDate) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.fromDate;
                              return newErrors;
                            });
                          }
                        }}
                        className={`
                          w-full pl-10 pr-3 py-2.5
                          border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${
                            errors.fromDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }
                        `}
                        required
                      />
                    </div>
                    {errors.fromDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.fromDate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Start date for invoice service fee payments
                    </p>
                  </div>

                  {/* To Date Field */}
                  <div>
                    <label
                      htmlFor="toDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      To Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          if (errors.toDate) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.toDate;
                              return newErrors;
                            });
                          }
                        }}
                        className={`
                          w-full pl-10 pr-3 py-2.5
                          border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${
                            errors.toDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }
                        `}
                        required
                      />
                    </div>
                    {errors.toDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.toDate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      End date for invoice service fee payments
                    </p>
                  </div>
                </div>

                {/* Date Range Summary */}
                {dateRangeSummary && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Date Range Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dateRangeSummary.days}
                        </p>
                        <p className="text-xs text-gray-500">Days</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dateRangeSummary.weeks}
                        </p>
                        <p className="text-xs text-gray-500">Weeks</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dateRangeSummary.months}
                        </p>
                        <p className="text-xs text-gray-500">Months</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/reports")}
                  >
                    ← Back to Reports
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
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
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
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.downloadedAt).toLocaleString()}
                          </p>
                        </div>
                        <DocumentArrowDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No recent downloads
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Downloaded reports will appear here
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Report Tips */}
          <Card className="mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Tips
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    This report provides a breakdown of revenue by service fee
                    category
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    Use this report to analyze which service types generate the
                    most revenue
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    The report includes totals and percentages for each service
                    fee type
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    Export to Excel for creating charts and further analysis
                  </span>
                </li>
              </ul>
            </div>
          </Card>

          {/* What's Included Card */}
          <Card className="mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                What's Included
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <ChartPieIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Fee Type Breakdown
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Revenue grouped by each service fee type
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Total Revenue
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sum of all service fees in the period
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartBarIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Percentage Analysis
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Each type's contribution to total revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport03Page;

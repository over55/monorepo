// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/20To29/20Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  CalendarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

function AdminReport20Page() {
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
    if (preferences?.report20) {
      if (preferences.report20.fromDate) {
        setFromDate(preferences.report20.fromDate);
      }
      if (preferences.report20.toDate) {
        setToDate(preferences.report20.toDate);
      }
    }
  }, []);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport20Page: Submitting report", {
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
      // Convert dates to timestamps (matching old implementation)
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      // Build parameters
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `payments_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        20, // Report ID for Payments Report
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
        report20: {
          fromDate: fromDate,
          toDate: toDate,
        },
      });

      console.log("AdminReport20Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport20Page: Error downloading report", error);

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

  // Calculate date range info
  const getDateRangeInfo = () => {
    if (!fromDate || !toDate) return null;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const dateRangeDays = getDateRangeInfo();

  // Get recent downloads from history
  const recentDownloads = reportManager
    .getReportHistory()
    .filter(
      (item) =>
        item.reportId === 20 ||
        item.reportType === "Payments Report" ||
        item.filename?.includes("payments_report"),
    )
    .slice(0, 5);

  if (isLoading) {
    return <Loading fullScreen text="Loading report settings..." />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full xl:max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex mb-4 sm:mb-6 lg:mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Dashboard
            </Link>
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
                Payments Report
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
                <CreditCardIcon className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Payments Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a comprehensive report of all payments received
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
                  className="mb-6"
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
                  className="mb-6"
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
                      This report generates a detailed CSV file containing all
                      payment transactions within the specified date range. It
                      includes invoice details, payment amounts, service fees,
                      customer information, and payment status.
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
                        onChange={handleFromDateChange}
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
                    <p className="mt-1 text-xs text-gray-500">
                      Refers to the invoice service fee payment date
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
                        onChange={handleToDateChange}
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
                    <p className="mt-1 text-xs text-gray-500">
                      Refers to the invoice service fee payment date
                    </p>
                    {errors.toDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.toDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Report Preview */}
                {fromDate && toDate && !Object.keys(errors).length && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Report Preview
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Date Range:</span>{" "}
                        {new Date(fromDate).toLocaleDateString()} to{" "}
                        {new Date(toDate).toLocaleDateString()}
                      </p>
                      {dateRangeDays !== null && (
                        <p>
                          <span className="font-medium">Period:</span>{" "}
                          {dateRangeDays} day{dateRangeDays !== 1 ? "s" : ""}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Report Type:</span>{" "}
                        Financial payment transactions
                      </p>
                      <p>
                        <span className="font-medium">Format:</span> CSV with
                        detailed payment data
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                  <BanknotesIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Payment Amounts
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total payments and breakdowns
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ReceiptPercentIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Service Fees
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied fees and calculations
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DocumentTextIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Invoice Details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Invoice numbers and dates
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Payment Methods
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Cash, credit, debit, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartPieIcon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Summary Statistics
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Totals and averages
                    </p>
                  </div>
                </div>
              </div>
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
                  <span className="text-green-500 mr-2">•</span>
                  <span>Run monthly for accounting reconciliation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Use for quarterly financial reporting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Track payment trends over time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Identify outstanding invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Analyze service fee collection rates</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Info
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Payment Date
                  </h4>
                  <p className="text-xs text-gray-600">
                    The date when the invoice service fee was actually paid, not
                    the invoice creation date.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Use Cases
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Cash flow analysis</li>
                    <li>• Revenue recognition</li>
                    <li>• Tax reporting</li>
                    <li>• Customer payment history</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport20Page;

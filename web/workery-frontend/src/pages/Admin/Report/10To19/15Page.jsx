// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/10To19/15Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
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
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Expiry date type options
const ASSOCIATE_EXPIRY_DATE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Commercial Insurance Expiry Date" },
  { value: 2, label: "Police Check" },
];

function AdminReport15Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [expiryDateType, setExpiryDateType] = useState(0);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    // Set default days
    setDaysBeforeExpiry("30");

    // Load saved preferences
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report15) {
      setExpiryDateType(preferences.report15.expiryDateType || 0);
      setDaysBeforeExpiry(preferences.report15.daysBeforeExpiry || "30");
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

    // Validate expiry date type
    if (!expiryDateType || expiryDateType <= 0) {
      newErrors.expiryDateType = "Please select an expiry date type";
      hasErrors = true;
    }

    // Validate days before expiry
    if (!daysBeforeExpiry || daysBeforeExpiry === "") {
      newErrors.daysBeforeExpiry = "Days before expiry is required";
      hasErrors = true;
    } else {
      const days = parseInt(daysBeforeExpiry);
      if (isNaN(days)) {
        newErrors.daysBeforeExpiry = "Please enter a valid number";
        hasErrors = true;
      } else if (days < 0) {
        newErrors.daysBeforeExpiry = "Days must be 0 or greater";
        hasErrors = true;
      } else if (days > 365) {
        newErrors.daysBeforeExpiry = "Days cannot exceed 365";
        hasErrors = true;
      }
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport15Page: Submitting report", {
      expiryDateType,
      daysBeforeExpiry,
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
      // Build parameters
      const params = {
        expiry_date_type: parseInt(expiryDateType),
        days_before_expiry: parseInt(daysBeforeExpiry),
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const expiryTypeName =
        expiryDateType === 1 ? "insurance" : "police_check";
      const filename = `associate_expiry_${expiryTypeName}_${timestamp}.csv`;

      await reportManager.downloadReport(
        15, // Report ID for Associate Expiry Dates Report
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
        report15: {
          expiryDateType: expiryDateType,
          daysBeforeExpiry: daysBeforeExpiry,
        },
      });

      console.log("AdminReport15Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport15Page: Error downloading report", error);

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
        item.reportId === 15 ||
        item.reportType === "Associate Expiry Dates" ||
        item.filename?.includes("associate_expiry"),
    )
    .slice(0, 5);

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
                Associate Expiry Dates
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
                <CalendarDaysIcon className="w-6 h-6 text-orange-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Associate Expiry Dates Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Track upcoming expiry dates for associate documents and
                    certifications
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
                      This report will generate a CSV file containing all
                      associates whose selected documents will expire within the
                      specified number of days. Use this to proactively manage
                      compliance and certification renewals for your associates.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Expiry Date Type Selection */}
                <div>
                  <label
                    htmlFor="expiryDateType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    What expiry date are you looking for?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="expiryDateType"
                      name="expiryDateType"
                      value={expiryDateType}
                      onChange={(e) => {
                        setExpiryDateType(parseInt(e.target.value));
                        if (errors.expiryDateType) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.expiryDateType;
                            return newErrors;
                          });
                        }
                      }}
                      className={`
                        w-full px-4 py-2.5 pr-10 border rounded-lg
                        transition-all duration-200 appearance-none bg-white
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${
                          errors.expiryDateType
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        }
                      `}
                      required
                    >
                      {ASSOCIATE_EXPIRY_DATE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                  {errors.expiryDateType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.expiryDateType}
                    </p>
                  )}
                </div>

                {/* Days Before Expiry Input */}
                <div>
                  <label
                    htmlFor="daysBeforeExpiry"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Days until expiry
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="daysBeforeExpiry"
                      name="daysBeforeExpiry"
                      value={daysBeforeExpiry}
                      onChange={(e) => {
                        setDaysBeforeExpiry(e.target.value);
                        if (errors.daysBeforeExpiry) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.daysBeforeExpiry;
                            return newErrors;
                          });
                        }
                      }}
                      min="0"
                      max="365"
                      className={`
                        w-full pl-10 pr-3 py-2.5
                        border rounded-lg
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${
                          errors.daysBeforeExpiry
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        }
                      `}
                      placeholder="e.g., 30"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Indicate how many days before the date will expire (0 to 365
                    days)
                  </p>
                  {errors.daysBeforeExpiry && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.daysBeforeExpiry}
                    </p>
                  )}
                </div>

                {/* Report Preview */}
                {expiryDateType > 0 &&
                  daysBeforeExpiry &&
                  !errors.daysBeforeExpiry && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Report Preview
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Document Type:</span>{" "}
                          {
                            ASSOCIATE_EXPIRY_DATE_TYPE_OPTIONS[expiryDateType]
                              ?.label
                          }
                        </p>
                        <p>
                          <span className="font-medium">Time Frame:</span>{" "}
                          Documents expiring within {daysBeforeExpiry} day
                          {daysBeforeExpiry !== "1" ? "s" : ""}
                        </p>
                        <p>
                          <span className="font-medium">Report Type:</span>{" "}
                          Associate compliance tracking
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
                  <UserIcon className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Associate Details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Name, contact, and ID information
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Expiry Dates
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Exact expiration dates for documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Days Remaining
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Countdown to expiration
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Compliance Status
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current certification status
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
                  <span className="text-orange-500 mr-2">•</span>
                  <span>
                    Run this report monthly to stay ahead of expirations
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Set days to 30-60 for adequate renewal time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Contact associates early about upcoming renewals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Track both insurance and police check separately</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Use for compliance audits and risk management</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport15Page;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/06Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useReportManager } from "../../../../services/Services";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

function AdminReport06Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    console.log("AdminReport06Page: Submitting report");

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // No parameters needed for this report
      const params = {};

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `associate_police_check_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        6, // Report ID for Associate Police Check Report
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
        lastAssociatePoliceCheckReport: {
          lastDownloaded: new Date().toISOString(),
        },
      });

      console.log("AdminReport06Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport06Page: Error downloading report", error);

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
        item.reportId === 6 || item.reportType === "Associate Police Check",
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
                Associate Police Check
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
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Associate Police Check Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a report of all associates' police check status
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
                        There was an error downloading the report:
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
                      This report will generate a CSV file containing the police
                      check status for all active associates. The report
                      includes police check dates, expiration dates, and
                      compliance status to help ensure all associates meet
                      safety requirements.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Simple Download Section */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Generate and Download Report
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  There are no fields to choose from. Simply click the button
                  below to generate and download the current associate police
                  check report.
                </p>

                {/* Download Button */}
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  icon={DocumentArrowDownIcon}
                  className="mx-auto"
                >
                  {isSubmitting ? "Generating Report..." : "Download Report"}
                </Button>
              </div>

              {/* Additional Information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Quick Tip:</p>
                    <p>
                      This report is automatically generated with the most
                      current data. It includes all active associates and their
                      police check status as of today's date. Use this report
                      for compliance auditing and safety verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/reports")}
                  icon={ArrowLeftIcon}
                >
                  Back to Reports
                </Button>
              </div>
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
                  <UserGroupIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Associate Information
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Name, ID, and contact details
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Police Check Status
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current status and verification dates
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDaysIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Expiration Dates
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Police check expiration and renewal requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Compliance Indicators
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Clear compliance status for each associate
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
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Review expired police checks to ensure compliance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Police checks typically need renewal every 1-3 years
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    The report includes only currently active associates
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Use this report for safety audits and regulatory compliance
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Export to Excel for additional sorting and filtering
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport06Page;

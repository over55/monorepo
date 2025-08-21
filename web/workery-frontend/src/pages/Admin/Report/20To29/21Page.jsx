// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/20To29/21Page.jsx

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
  EnvelopeIcon,
  PaperAirplaneIcon,
  AtSymbolIcon,
  ChartPieIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellAlertIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

function AdminReport21Page() {
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

    console.log("AdminReport21Page: Submitting report");

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // No parameters needed for this report
      const params = {};

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `marketing_emails_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        21, // Report ID for Marketing Emails Report
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

      // Save to history (no preferences needed for this report)
      console.log("AdminReport21Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport21Page: Error downloading report", error);

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
        item.reportId === 21 ||
        item.reportType === "Marketing Emails Report" ||
        item.filename?.includes("marketing_emails_report"),
    )
    .slice(0, 5);

  if (isLoading) {
    return <Loading fullScreen text="Loading report..." />;
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
                Marketing Emails Report
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
                <EnvelopeIcon className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Marketing Emails Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Export all users who have opted in to receive marketing
                    emails
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
                        There was an error downloading the report:
                      </p>
                      {errors.general && (
                        <p className="mt-1 text-sm">{errors.general}</p>
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
                      This report generates a CSV file containing all users who
                      have opted in to receive marketing emails. The export
                      includes email addresses, names, subscription preferences,
                      and signup dates.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* No Parameters Message */}
              <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
                <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Export
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  There are no parameters to configure for this report. Simply
                  click the download button below to generate and download the
                  complete marketing email list.
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Report Type:</span>{" "}
                      Marketing email list
                    </p>
                    <p>
                      <span className="font-medium">Format:</span> CSV (Excel
                      compatible)
                    </p>
                    <p>
                      <span className="font-medium">Content:</span> All opted-in
                      users
                    </p>
                  </div>
                </div>
              </div>

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
                  type="button"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  icon={DocumentArrowDownIcon}
                >
                  {isSubmitting ? "Generating..." : "Download Report"}
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
                  <AtSymbolIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Addresses
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Verified email addresses
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UserGroupIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      User Information
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Names and account types
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BellAlertIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Opt-in Status
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Marketing preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DocumentTextIcon className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Subscription Date
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      When users opted in
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartPieIcon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Segmentation Data
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      User categories and tags
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Usage Tips */}
          <Card className="mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Usage Tips
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Export regularly for email campaign management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Import into your email marketing platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Use for compliance and GDPR reporting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Track marketing list growth over time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Segment users for targeted campaigns</span>
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
                    Privacy Compliance
                  </h4>
                  <p className="text-xs text-gray-600">
                    This report only includes users who have explicitly opted in
                    to receive marketing communications.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Update Frequency
                  </h4>
                  <p className="text-xs text-gray-600">
                    The data is current as of the moment you generate the
                    report.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    File Format
                  </h4>
                  <p className="text-xs text-gray-600">
                    CSV format compatible with Excel, Google Sheets, and most
                    email marketing platforms.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport21Page;

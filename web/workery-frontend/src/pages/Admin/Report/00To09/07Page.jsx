// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/07Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  CakeIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  GiftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function AdminReport07Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [associateStatus, setAssociateStatus] = useState(0);

  // Handler for unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load saved preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report07) {
      setAssociateStatus(preferences.report07.associateStatus || 0);
    }
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Report07Page: Submitting report");

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Build parameters
      const params = {
        state: parseInt(associateStatus) || 0,
      };

      // Download report
      const reportId = 7;
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `associate_birthdays_report_${timestamp}.csv`;

      console.log("Report07Page: Downloading report with params:", params);

      await reportManager.downloadReport(
        reportId,
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
        report07: {
          associateStatus: associateStatus,
        },
      });

      console.log("Report07Page: Report downloaded successfully");

      // Optional: Close window after delay (matching old behavior)
      // setTimeout(() => {
      //   window.close();
      // }, 1000);
    } catch (error) {
      console.error("Report07Page: Error downloading report:", error);

      // Handle errors
      if (error && typeof error === "object") {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to download report. Please try again.",
        });
      }

      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Associate status filter options
  const associateStatusOptions = [
    { value: 0, label: "All Associates" },
    { value: 1, label: "Active Associates" },
    { value: 2, label: "Archived Associates" },
  ];

  // Get recent downloads from history
  const recentDownloads = reportManager
    .getReportHistory()
    .filter(
      (item) =>
        item.reportId === 7 || item.reportType === "Associate Birthdays",
    )
    .slice(0, 5);

  // Get status label helper
  const getStatusLabel = (status) => {
    const option = associateStatusOptions.find(
      (opt) => opt.value === parseInt(status),
    );
    return option ? option.label : "All Associates";
  };

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
                Associate Birthdays
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
                <CakeIcon className="w-6 h-6 text-pink-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Associate Birthdays Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a report of all associates' birthdays for
                    celebration planning
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
                      This report will generate a CSV file containing birthday
                      information for associates. Use this report to plan
                      celebrations, send birthday cards, or recognize your team
                      members on their special day. The report includes birth
                      dates sorted by month and day.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Associate Status Filter */}
                <div>
                  <label
                    htmlFor="associateStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Associate Status Filter
                  </label>
                  <div className="relative">
                    <select
                      id="associateStatus"
                      name="associateStatus"
                      value={associateStatus}
                      onChange={(e) =>
                        setAssociateStatus(parseInt(e.target.value))
                      }
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg
                        transition-all duration-200 appearance-none bg-white
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        focus:border-blue-500 focus:ring-blue-500/20"
                    >
                      {associateStatusOptions.map((option) => (
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
                  {errors.associateStatus && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.associateStatus}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Filter the report by associate status. Select "All
                    Associates" to include everyone.
                  </p>
                </div>

                {/* Fun Birthday Stats */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Birthday Fun Facts
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <GiftIcon className="w-8 h-8 text-pink-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Plan Celebrations</p>
                    </div>
                    <div>
                      <CalendarDaysIcon className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Monthly Reminders</p>
                    </div>
                    <div>
                      <UserGroupIcon className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Team Building</p>
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
                          {item.params?.state !== undefined && (
                            <p className="text-xs text-gray-400 mt-1">
                              Filter: {getStatusLabel(item.params.state)}
                            </p>
                          )}
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
                  <UserGroupIcon className="w-5 h-5 text-pink-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Associate Details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Name, ID, and contact information
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CakeIcon className="w-5 h-5 text-pink-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Birthday Information
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Birth date, age, and day of week
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDaysIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sorted by Calendar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Organized by month and day for easy planning
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <GiftIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Upcoming Birthdays
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Highlights birthdays in the next 30 days
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
                  <span className="text-pink-500 mr-2">•</span>
                  <span>
                    Use this report to create a birthday calendar for your team
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>
                    Set up monthly reminders to celebrate associates' birthdays
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>
                    Consider organizing team celebrations for birthday months
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>
                    Export to your calendar app for automatic reminders
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Filter by status to focus on active team members</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport07Page;

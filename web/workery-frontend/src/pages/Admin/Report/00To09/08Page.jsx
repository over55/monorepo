// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/08Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
import { AssociateSelect } from "../../../../components/business/selects";
import {
  HomeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  UserIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

function AdminReport08Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [associateId, setAssociateId] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report08) {
      setAssociateId(preferences.report08.lastAssociateId || "");
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

    // Validate associate selection
    if (!associateId || associateId === "" || associateId === "0") {
      newErrors.associateId = "Please select an associate";
      hasErrors = true;
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "AdminReport08Page: Submitting report for associate:",
      associateId,
    );

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
        associate_id: associateId,
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `associate_skill_sets_report_${associateId}_${timestamp}.csv`;

      await reportManager.downloadReport(
        8, // Report ID for Associate Skill Sets Report
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
        report08: {
          lastAssociateId: associateId,
        },
      });

      console.log("AdminReport08Page: Report downloaded successfully");

      // Optional: Close window after delay (matching old behavior)
      // setTimeout(() => {
      //   window.close();
      // }, 1000);
    } catch (error) {
      console.error("AdminReport08Page: Error downloading report", error);

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
        item.reportId === 8 || item.reportType === "Associate Skill Sets",
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
                Associate Skill Sets
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
                <AcademicCapIcon className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Associate Skill Sets Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a detailed report of skill sets for a specific
                    associate
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
                      This report will generate a CSV file containing all skill
                      sets and certifications for the selected associate. The
                      report includes skill categories, proficiency levels,
                      certification dates, and expiration information.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Associate Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Associate
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <AssociateSelect
                    value={associateId}
                    onChange={(value) => {
                      setAssociateId(value);
                      // Clear error when user selects an associate
                      if (errors.associateId) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.associateId;
                          return newErrors;
                        });
                      }
                    }}
                    error={errors.associateId}
                    required={true}
                    placeholder="Search and select an associate..."
                    helperText="Start typing to search for an associate by name or ID"
                    onUnauthorized={onUnauthorized}
                  />
                </div>

                {/* Selected Associate Info */}
                {associateId && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <UserIcon className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Selected Associate
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      The report will include all skill sets and certifications
                      for the selected associate.
                    </p>
                  </div>
                )}

                {/* Skill Categories Preview */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <SparklesIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Report Contents
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div>
                      <WrenchScrewdriverIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Technical Skills</p>
                    </div>
                    <div>
                      <AcademicCapIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Certifications</p>
                    </div>
                    <div>
                      <ClipboardDocumentCheckIcon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Proficiency</p>
                    </div>
                    <div>
                      <ClockIcon className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Expiry Dates</p>
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
                    disabled={isSubmitting || !associateId}
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
                          {item.params?.associate_id && (
                            <p className="text-xs text-gray-400 mt-1">
                              Associate ID: {item.params.associate_id}
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
                  <UserIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Associate Details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Name, ID, contact info, and status
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Skill Categories
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      All assigned skill sets and specializations
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AcademicCapIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Certifications
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Certification names, dates, and validity
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Proficiency Levels
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Skill proficiency ratings and experience
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
                  <span>
                    Use this report to verify associate qualifications
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>
                    Review certification expiry dates for renewal planning
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Match associate skills with job requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Identify training needs and skill gaps</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Export for performance reviews and evaluations</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport08Page;

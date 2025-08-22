// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/10To19/13Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";
import { SkillSetsMultiSelect } from "../../../../components/business/selects";
import { Card, Button, Alert, Loading } from "../../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  TagIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

function AdminReport13Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [skillSets, setSkillSets] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jobStatus, setJobStatus] = useState(0);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences and set default dates on mount
  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);

    // Load saved preferences
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report13) {
      setJobStatus(preferences.report13.jobStatus || 0);
      setSkillSets(preferences.report13.skillSets || []);
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

    // Validate skill sets
    if (!skillSets || skillSets.length === 0) {
      newErrors.skillSets = "Please select at least one skill set";
      hasErrors = true;
    }

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
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport13Page: Submitting report", {
      skillSets,
      fromDate,
      toDate,
      jobStatus,
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

      // Build parameters
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
        state: parseInt(jobStatus) || 0,
        skillset_ids: skillSets.join(","), // Convert array to comma-separated string
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `leads_by_skill_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        13, // Report ID for Leads by Skill Report
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
        report13: {
          jobStatus: jobStatus,
          skillSets: skillSets,
        },
      });

      console.log("AdminReport13Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport13Page: Error downloading report", error);

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
      (item) => item.reportId === 13 || item.reportType === "Leads by Skill",
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

  // Job status options
  const jobStatusOptions = [
    { value: 0, label: "All Statuses" },
    { value: 1, label: "New" },
    { value: 2, label: "In Progress" },
    { value: 3, label: "Completed" },
    { value: 4, label: "Cancelled" },
    { value: 5, label: "Pending" },
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
                Leads by Skill
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
                <TagIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Leads by Skill Report
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate a report of jobs filtered by specific skill sets
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
                      This report will generate a CSV file containing all jobs
                      that match the selected skill sets within the specified
                      date range. The dates refer to the assignment date of the
                      work orders. You can select multiple skill sets to include
                      jobs requiring any of those skills.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Skill Sets Selection */}
                <div>
                  <SkillSetsMultiSelect
                    value={skillSets}
                    onChange={setSkillSets}
                    error={errors.skillSets}
                    required={true}
                    label="Select Required Skill Sets"
                    helperText="Pick at least one skill set. The report will include jobs requiring any of the selected skills."
                    placeholder="Choose skill sets..."
                  />
                </div>

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
                      Refers to assignment date
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
                      Refers to assignment date
                    </p>
                  </div>
                </div>

                {/* Job Status Filter */}
                <div>
                  <label
                    htmlFor="jobStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Status Filter
                  </label>
                  <div className="relative">
                    <select
                      id="jobStatus"
                      name="jobStatus"
                      value={jobStatus}
                      onChange={(e) => setJobStatus(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg
                        transition-all duration-200 appearance-none bg-white
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        focus:border-blue-500 focus:ring-blue-500/20"
                    >
                      {jobStatusOptions.map((option) => (
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
                  <p className="mt-1 text-xs text-gray-500">
                    Filter by job status or select "All Statuses" to include
                    everything
                  </p>
                </div>

                {/* Date Range Summary */}
                {dateRangeSummary && skillSets.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Report Summary
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
                          {skillSets.length}
                        </p>
                        <p className="text-xs text-gray-500">Skill Sets</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {jobStatus === 0
                            ? "All"
                            : jobStatusOptions[jobStatus]?.label}
                        </p>
                        <p className="text-xs text-gray-500">Status</p>
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
                  <BriefcaseIcon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Filtered Jobs
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Jobs matching selected skill requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Associate Details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned associates and their skills
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Job Information
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Descriptions, status, and completion data
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AcademicCapIcon className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Skill Matching
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Skills required vs. skills available
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
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Identify skill-specific job demand patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Plan associate training based on skill gaps</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Optimize job assignments by skill matching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Track completion rates by skill category</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Forecast staffing needs for specific skills</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReport13Page;

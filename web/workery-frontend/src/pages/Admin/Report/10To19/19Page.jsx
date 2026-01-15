// File Path: src/pages/Admin/Report/10To19/19Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useReportManager } from "../../../../services/Services";
import { TagsMultiSelect } from "../../../../components/business/selects";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  Select,
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
  TagIcon,
  CalendarIcon,
  BriefcaseIcon,
  ChartPieIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

// Job status filter options matching the old implementation
const JOB_STATUS_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "New" },
  { value: 2, label: "Declined" },
  { value: 3, label: "Pending" },
  { value: 4, label: "Cancelled" },
  { value: 5, label: "Ongoing" },
  { value: 6, label: "In progress" },
  { value: 7, label: "Completed but unpaid" },
  { value: 8, label: "Completed and paid" },
  { value: 9, label: "Archived" },
];

function AdminReport19Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    bgCard: getThemeClasses("bg-card"),
    bgHover: getThemeClasses("bg-hover"),
    borderPrimary: getThemeClasses("border-primary"),
    borderSecondary: getThemeClasses("border-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Form state
  const [tags, setTags] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jobStatus, setJobStatus] = useState(0);

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
    if (preferences?.report19) {
      if (preferences.report19.tags) {
        setTags(preferences.report19.tags);
      }
      if (preferences.report19.fromDate) {
        setFromDate(preferences.report19.fromDate);
      }
      if (preferences.report19.toDate) {
        setToDate(preferences.report19.toDate);
      }
      if (preferences.report19.jobStatus !== undefined) {
        setJobStatus(preferences.report19.jobStatus);
      }
    }
  }, []);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
    { label: "Reports", to: "/admin/reports", icon: ChartBarIcon },
    { label: "Job Tags by Assignment Dates", icon: TagIcon, isActive: true },
  ], []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate tags
    if (!tags || tags.length === 0) {
      newErrors.tags = "At least one tag is required";
      hasErrors = true;
    }

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
    console.log("AdminReport19Page: Submitting report", {
      tags,
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
      // Convert dates to timestamps (matching old implementation)
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      // Build parameters with tag_ids as comma-separated string
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
        state: parseInt(jobStatus),
        tag_ids: tags.join(","), // Convert array to comma-separated string
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `job_tags_by_assignment_dates_${timestamp}.csv`;

      await reportManager.downloadReport(
        19, // Report ID for Job Tags by Assignment Dates Report
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
        report19: {
          tags: tags,
          fromDate: fromDate,
          toDate: toDate,
          jobStatus: jobStatus,
        },
      });

      console.log("AdminReport19Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport19Page: Error downloading report", error);

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

  // Handle tags change
  const handleTagsChange = (newTags) => {
    setTags(newTags);
    if (errors.tags) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tags;
        return newErrors;
      });
    }
  };

  // Get recent downloads from history
  const recentDownloads = reportManager
    .getReportHistory()
    .filter(
      (item) =>
        item.reportId === 19 ||
        item.reportType === "Job Tags by Assignment Dates" ||
        item.filename?.includes("job_tags_by_assignment_dates"),
    )
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading report settings...</p>
        </div>
      </div>
    );
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
                <TagIcon className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h1 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
                    Job Tags by Assignment Dates Report
                  </h1>
                  <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                    Generate a report of work orders filtered by tags and
                    assignment dates
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
                      This report generates a CSV file containing work orders
                      that match the selected tags and fall within the specified
                      assignment date range. Perfect for tracking work by
                      category and time period.
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tags Selection */}
                <div>
                  <TagsMultiSelect
                    value={tags}
                    onChange={handleTagsChange}
                    error={errors.tags}
                    required={true}
                    label="Tags"
                    placeholder="Select tags to filter by..."
                    helperText="Select one or more tags to include in the report"
                    onUnauthorized={onUnauthorized}
                  />
                </div>

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
                          ${themeClasses.textPrimary}
                          ${
                            errors.fromDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : `${themeClasses.borderSecondary} focus:border-blue-500 focus:ring-blue-500/20`
                          }
                        `}
                        required
                      />
                    </div>
                    <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>
                      Refers to assignment date
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
                          ${themeClasses.textPrimary}
                          ${
                            errors.toDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : `${themeClasses.borderSecondary} focus:border-blue-500 focus:ring-blue-500/20`
                          }
                        `}
                        required
                      />
                    </div>
                    <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>
                      Refers to assignment date
                    </p>
                    {errors.toDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.toDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Job Status Selection */}
                <div>
                  <Select
                    label="Job Status"
                    value={jobStatus}
                    onChange={(value) => setJobStatus(parseInt(value))}
                    options={JOB_STATUS_OPTIONS}
                    error={errors.jobStatus}
                    helperText="Filter by work order status"
                  />
                </div>

                {/* Report Preview */}
                {tags.length > 0 &&
                  fromDate &&
                  toDate &&
                  !Object.keys(errors).length && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className={`text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                        Report Preview
                      </h4>
                      <div className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                        <p>
                          <span className="font-medium">Tags:</span>{" "}
                          {tags.length} tag{tags.length !== 1 ? "s" : ""}{" "}
                          selected
                        </p>
                        <p>
                          <span className="font-medium">Date Range:</span>{" "}
                          {new Date(fromDate).toLocaleDateString()} to{" "}
                          {new Date(toDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Job Status:</span>{" "}
                          {JOB_STATUS_OPTIONS.find(
                            (opt) => opt.value === jobStatus,
                          )?.label || "All"}
                        </p>
                        <p>
                          <span className="font-medium">Report Type:</span>{" "}
                          Detailed work order analysis
                        </p>
                        <p>
                          <span className="font-medium">Format:</span> CSV with
                          full work order details
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
                  <TagIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Tag-Based Filtering
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Work orders matching selected tags
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Assignment Date Range
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Orders assigned within date range
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BriefcaseIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Job Details
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Complete work order information
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartPieIcon className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Status Breakdown
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Orders grouped by status
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                      Assignment Analytics
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                      Associate performance metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Filter Tips */}
          <Card className="mt-6">
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Filter Tips
              </h3>
            </div>
            <div className="p-6">
              <ul className={`space-y-3 text-sm ${themeClasses.textSecondary}`}>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Use multiple tags to track work across categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>
                    Assignment date is when work was assigned, not completed
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Select "All" status to see complete work flow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Use status filters to identify bottlenecks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Compare periods to track seasonal patterns</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Report Usage */}
          <Card className="mt-6">
            <div className={`px-6 py-4 border-b ${themeClasses.borderSecondary}`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                Report Usage
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Best For
                  </h4>
                  <ul className={`text-xs ${themeClasses.textSecondary} space-y-1`}>
                    <li>- Tracking work by service type</li>
                    <li>- Analyzing assignment patterns</li>
                    <li>- Resource allocation planning</li>
                    <li>- Performance reviews by category</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Common Use Cases
                  </h4>
                  <ul className={`text-xs ${themeClasses.textSecondary} space-y-1`}>
                    <li>- Monthly service reports</li>
                    <li>- Tag-based billing analysis</li>
                    <li>- Workload distribution review</li>
                    <li>- Quality assurance tracking</li>
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

// Wrapper with UIXThemeProvider
function AdminReport19PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminReport19Page />
    </UIXThemeProvider>
  );
}

export default AdminReport19PageWithProvider;

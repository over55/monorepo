// File: src/components/business/views/ReportMultiSelectDateRangeStatusView.jsx
// @uix-view: ReportMultiSelectDateRangeStatusView
// Template for reports with multi-select, date range, and status filter

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import { useReportManager } from "../../../services/Services";
import {
  Button,
  EntityReportDetail,
  Select,
  Input,
  UIXThemeProvider,
  useUIXTheme,
} from "../../UIX";
import { CalendarIcon } from "@heroicons/react/24/outline";

/**
 * ReportMultiSelectDateRangeStatusView - Template for reports with multi-select, date range, and status filter
 *
 * @param {Object} config - Configuration object
 * @param {number} config.reportId - Report ID for the API
 * @param {string} config.reportTitle - Title of the report
 * @param {string} config.reportDescription - Description of the report
 * @param {string} config.reportBreadcrumbLabel - Label for breadcrumb
 * @param {React.Component} config.icon - HeroIcon component for the report
 * @param {string} config.infoMessage - Info message to display
 * @param {string} config.filenamePrefix - Prefix for the downloaded filename
 * @param {React.Component} config.MultiSelectComponent - The multi-select component to render
 * @param {string} config.multiSelectLabel - Label for multi-select
 * @param {string} config.multiSelectHelperText - Helper text for multi-select
 * @param {string} config.multiSelectPlaceholder - Placeholder for multi-select
 * @param {string} config.multiSelectParamName - Parameter name for multi-select in API
 * @param {string} config.multiSelectErrorMessage - Error message when nothing selected
 * @param {string} config.fromDateLabel - Label for from date
 * @param {string} config.toDateLabel - Label for to date
 * @param {string} config.fromDateHelperText - Helper text for from date
 * @param {string} config.toDateHelperText - Helper text for to date
 * @param {string} config.statusLabel - Label for the status filter
 * @param {string} config.statusHelperText - Helper text for the status filter
 * @param {Array} config.statusOptions - Array of {value, label} for status options
 * @param {string} config.defaultStatus - Default status value
 * @param {number} config.defaultDaysBack - Default days back for from date
 * @param {boolean} config.showStatus - Whether to show status filter
 * @param {boolean} config.showSummary - Whether to show summary section
 * @param {Function} config.buildParams - Optional custom function to build API params
 */
function ReportMultiSelectDateRangeStatusView({ config }) {
  return (
    <UIXThemeProvider>
      <ReportMultiSelectDateRangeStatusViewContent config={config} />
    </UIXThemeProvider>
  );
}

const ReportMultiSelectDateRangeStatusViewContent = memo(function ReportMultiSelectDateRangeStatusViewContent({ config }) {
  const navigate = useNavigate();
  const reportManager = useReportManager();
  const { getThemeClasses } = useUIXTheme();

  const {
    reportId,
    reportTitle,
    reportDescription,
    reportBreadcrumbLabel,
    icon: IconComponent,
    infoMessage,
    filenamePrefix,
    MultiSelectComponent,
    multiSelectLabel = "Select Items",
    multiSelectHelperText = "Select one or more items",
    multiSelectPlaceholder = "Choose items...",
    multiSelectParamName = "ids",
    multiSelectErrorMessage = "Please select at least one item",
    fromDateLabel = "From Date",
    toDateLabel = "To Date",
    fromDateHelperText = "Start date for the report",
    toDateHelperText = "End date for the report",
    statusLabel = "Status Filter",
    statusHelperText = "Filter the report by status",
    statusOptions = [
      { value: "0", label: "All" },
      { value: "1", label: "Active" },
      { value: "2", label: "Archived" },
    ],
    defaultStatus = "0",
    defaultDaysBack = 30,
    showStatus = true,
    showSummary = true,
    buildParams,
  } = config;

  // Form state
  const [selectedItems, setSelectedItems] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState(defaultStatus);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences and set default dates on mount
  useEffect(() => {
    // Set default dates
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(daysAgo.getDate() - defaultDaysBack);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(daysAgo.toISOString().split("T")[0]);

    // Load saved preferences
    const preferences = reportManager.getReportPreferences();
    if (preferences?.[`report${reportId}`]) {
      if (preferences[`report${reportId}`].status !== undefined) {
        setStatus(String(preferences[`report${reportId}`].status));
      }
      if (preferences[`report${reportId}`].selectedItems) {
        setSelectedItems(preferences[`report${reportId}`].selectedItems);
      }
    }
  }, [reportId, defaultDaysBack, reportManager]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Calculate date range summary
  const dateRangeSummary = useMemo(() => {
    if (!fromDate || !toDate) return null;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDiff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    return {
      days: daysDiff,
      weeks: Math.floor(daysDiff / 7),
      months: Math.floor(daysDiff / 30),
    };
  }, [fromDate, toDate]);

  // Get status label for summary
  const statusLabelForSummary = useMemo(() => {
    const option = statusOptions.find(opt => String(opt.value) === status);
    return option?.label || "All";
  }, [status, statusOptions]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    if (!selectedItems || selectedItems.length === 0) {
      newErrors.selectedItems = multiSelectErrorMessage;
      hasErrors = true;
    }

    if (!fromDate) {
      newErrors.fromDate = "From date is required";
      hasErrors = true;
    }

    if (!toDate) {
      newErrors.toDate = "To date is required";
      hasErrors = true;
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        newErrors.toDate = "To date must be after from date";
        hasErrors = true;
      }
    }

    return { errors: newErrors, hasErrors };
  }, [selectedItems, fromDate, toDate, multiSelectErrorMessage]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (import.meta.env.DEV) {
      console.log(`ReportMultiSelectDateRangeStatusView: Submitting report ${reportId}`, {
        selectedItems,
        fromDate,
        toDate,
        status,
      });
    }

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

      // Build parameters - use custom function if provided
      let params;
      if (buildParams) {
        params = buildParams({ selectedItems, fromDate: fromDateObj, toDate: toDateObj, status });
      } else {
        params = {
          from_dt: fromDateObj.getTime(),
          to_dt: toDateObj.getTime(),
          state: parseInt(status) || 0,
          [multiSelectParamName]: selectedItems.join(","),
        };
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${filenamePrefix}_${timestamp}.csv`;

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
        [`report${reportId}`]: {
          status: parseInt(status),
          selectedItems: selectedItems,
        },
      });

      if (import.meta.env.DEV) {
        console.log(`ReportMultiSelectDateRangeStatusView: Report ${reportId} downloaded successfully`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`ReportMultiSelectDateRangeStatusView: Error downloading report ${reportId}`, error);
      }

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
  }, [reportId, selectedItems, fromDate, toDate, status, filenamePrefix, multiSelectParamName, validateForm, buildParams, reportManager, onUnauthorized]);

  // Get recent downloads from history
  const recentDownloads = reportManager.getReportHistory();

  return (
    <EntityReportDetail
      reportTitle={reportTitle}
      reportDescription={reportDescription}
      reportBreadcrumbLabel={reportBreadcrumbLabel}
      icon={IconComponent}
      showSuccess={showSuccess}
      errors={errors}
      infoMessage={infoMessage}
      recentDownloads={recentDownloads}
      reportId={reportId}
      reportType={reportTitle}
      onDismissSuccess={() => setShowSuccess(false)}
      onDismissErrors={() => setErrors({})}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Multi-Select Field */}
        <MultiSelectComponent
          value={selectedItems}
          onChange={(newItems) => {
            setSelectedItems(newItems);
            if (errors.selectedItems) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.selectedItems;
                return newErrors;
              });
            }
          }}
          error={errors.selectedItems}
          required={true}
          label={multiSelectLabel}
          helperText={multiSelectHelperText}
          placeholder={multiSelectPlaceholder}
          onUnauthorized={onUnauthorized}
        />

        {/* Date Range Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Date Field */}
          <Input
            label={fromDateLabel}
            name="fromDate"
            type="date"
            value={fromDate}
            onChange={(value) => {
              setFromDate(value);
              if (errors.fromDate) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.fromDate;
                  return newErrors;
                });
              }
            }}
            error={errors.fromDate}
            required
            icon={CalendarIcon}
            helperText={fromDateHelperText}
          />

          {/* To Date Field */}
          <Input
            label={toDateLabel}
            name="toDate"
            type="date"
            value={toDate}
            onChange={(value) => {
              setToDate(value);
              if (errors.toDate) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.toDate;
                  return newErrors;
                });
              }
            }}
            error={errors.toDate}
            required
            icon={CalendarIcon}
            helperText={toDateHelperText}
          />
        </div>

        {/* Status Filter */}
        {showStatus && (
          <Select
            label={statusLabel}
            value={status}
            onChange={(value) => setStatus(value)}
            options={statusOptions.map((opt) => ({
              value: String(opt.value),
              label: opt.label,
            }))}
            error={errors.status}
            helperText={statusHelperText}
          />
        )}

        {/* Report Summary */}
        {showSummary && dateRangeSummary && selectedItems.length > 0 && (
          <div className={`rounded-lg p-4 ${getThemeClasses("bg-info-subtle")}`}>
            <h4 className={`text-sm font-medium mb-2 ${getThemeClasses("text-primary")}`}>
              Report Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={`text-2xl font-bold ${getThemeClasses("text-primary")}`}>
                  {dateRangeSummary.days}
                </p>
                <p className={`text-xs ${getThemeClasses("text-secondary")}`}>Days</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getThemeClasses("text-primary")}`}>
                  {selectedItems.length}
                </p>
                <p className={`text-xs ${getThemeClasses("text-secondary")}`}>Items Selected</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getThemeClasses("text-primary")}`}>
                  {statusLabelForSummary}
                </p>
                <p className={`text-xs ${getThemeClasses("text-secondary")}`}>Status</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={`flex flex-col sm:flex-row items-center justify-between pt-6 border-t ${getThemeClasses("border-color")} gap-3`}>
          <Button
            onClick={() => navigate("/admin/reports")}
            variant="secondary"
          >
            Back to Reports
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText="Generating..."
          >
            Download Report
          </Button>
        </div>
      </form>
    </EntityReportDetail>
  );
});

ReportMultiSelectDateRangeStatusViewContent.displayName = "ReportMultiSelectDateRangeStatusViewContent";

export default ReportMultiSelectDateRangeStatusView;

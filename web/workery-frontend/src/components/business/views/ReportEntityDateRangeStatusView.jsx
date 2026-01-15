// File: src/components/business/views/ReportEntityDateRangeStatusView.jsx
// @uix-view: ReportEntityDateRangeStatusView
// Template for reports with entity selector, date range, and status filter

import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useReportManager } from "../../../services/Services";
import {
  Button,
  EntityReportDetail,
  Select,
  Input,
  Alert,
  UIXThemeProvider,
  useUIXTheme,
} from "../../UIX";
import { CalendarIcon } from "@heroicons/react/24/outline";

/**
 * ReportEntityDateRangeStatusView - Template for reports with entity selector, date range, and status filter
 *
 * @param {Object} config - Configuration object
 * @param {number} config.reportId - Report ID for the API
 * @param {string} config.reportTitle - Title of the report
 * @param {string} config.reportDescription - Description of the report
 * @param {string} config.reportBreadcrumbLabel - Label for breadcrumb
 * @param {React.Component} config.icon - HeroIcon component for the report
 * @param {string} config.infoMessage - Info message to display
 * @param {string} config.filenamePrefix - Prefix for the downloaded filename
 * @param {React.Component} config.EntitySelectComponent - The entity select component to render
 * @param {string} config.entityLabel - Label for entity select
 * @param {string} config.entityHelperText - Helper text for entity select
 * @param {string} config.entityPlaceholder - Placeholder for entity select
 * @param {string} config.entityParamName - Parameter name for entity ID in API
 * @param {number} config.entityStatusFilter - Status filter for entity select (e.g., 1 for active)
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
 * @param {boolean} config.showDateRangeWarning - Whether to show warning for large date ranges
 * @param {Function} config.buildParams - Optional custom function to build API params
 */
function ReportEntityDateRangeStatusView({ config }) {
  return (
    <UIXThemeProvider>
      <ReportEntityDateRangeStatusViewContent config={config} />
    </UIXThemeProvider>
  );
}

const ReportEntityDateRangeStatusViewContent = memo(function ReportEntityDateRangeStatusViewContent({ config }) {
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
    EntitySelectComponent,
    entityLabel = "Select Entity",
    entityHelperText = "Start typing to search",
    entityPlaceholder = "Please select",
    entityParamName = "entity_id",
    entityStatusFilter = 1,
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
    showDateRangeWarning = true,
    buildParams,
  } = config;

  // Form state
  const [entityID, setEntityID] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState(defaultStatus);

  // UI state
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
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
    }
  }, [reportId, defaultDaysBack, reportManager]);

  // Check for date range warnings when dates change
  useEffect(() => {
    if (showDateRangeWarning && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const daysDiff = Math.floor((to - from) / (1000 * 60 * 60 * 24));

      if (daysDiff > 365) {
        setWarnings((prev) => ({
          ...prev,
          dateRange: `Date range exceeds 1 year (${daysDiff} days). Large date ranges may take longer to process.`,
        }));
      } else {
        setWarnings((prev) => {
          const newWarnings = { ...prev };
          delete newWarnings.dateRange;
          return newWarnings;
        });
      }
    }
  }, [fromDate, toDate, showDateRangeWarning]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle entity selection change
  const handleEntityChange = useCallback((value) => {
    setEntityID(value);
    if (errors.entityID) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.entityID;
        return newErrors;
      });
    }
  }, [errors.entityID]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    if (!entityID) {
      newErrors.entityID = "Please select an option";
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

      // Check for future dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (to > today) {
        newErrors.toDate = "To date cannot be in the future";
        hasErrors = true;
      }
    }

    return { errors: newErrors, hasErrors };
  }, [entityID, fromDate, toDate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (import.meta.env.DEV) {
      console.log(`ReportEntityDateRangeStatusView: Submitting report ${reportId}`, {
        entityID,
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
        params = buildParams({ entityID, fromDate: fromDateObj, toDate: toDateObj, status });
      } else {
        params = {
          from_dt: fromDateObj.getTime(),
          to_dt: toDateObj.getTime(),
          state: parseInt(status) || 0,
          [entityParamName]: entityID,
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
        },
      });

      if (import.meta.env.DEV) {
        console.log(`ReportEntityDateRangeStatusView: Report ${reportId} downloaded successfully`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`ReportEntityDateRangeStatusView: Error downloading report ${reportId}`, error);
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
  }, [reportId, entityID, fromDate, toDate, status, filenamePrefix, entityParamName, validateForm, buildParams, reportManager, onUnauthorized]);

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
        {/* Warning Display for Date Range */}
        {warnings.dateRange && (
          <Alert
            type="warning"
            message={warnings.dateRange}
          />
        )}

        {/* Entity Selection Field */}
        <EntitySelectComponent
          value={entityID}
          onChange={handleEntityChange}
          error={errors.entityID}
          required={true}
          label={entityLabel}
          helperText={entityHelperText}
          onUnauthorized={onUnauthorized}
          placeholder={entityPlaceholder}
          statusFilter={entityStatusFilter}
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

ReportEntityDateRangeStatusViewContent.displayName = "ReportEntityDateRangeStatusViewContent";

export default ReportEntityDateRangeStatusView;

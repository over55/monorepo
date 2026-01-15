// File: src/components/business/views/ReportStatusFilterView.jsx
// @uix-view: ReportStatusFilterView
// Template for reports with a single status filter

import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useReportManager } from "../../../services/Services";
import {
  Button,
  EntityReportDetail,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../UIX";

/**
 * ReportStatusFilterView - Template for reports with a single status filter
 *
 * @param {Object} config - Configuration object
 * @param {number} config.reportId - Report ID for the API
 * @param {string} config.reportTitle - Title of the report
 * @param {string} config.reportDescription - Description of the report
 * @param {string} config.reportBreadcrumbLabel - Label for breadcrumb
 * @param {React.Component} config.icon - HeroIcon component for the report
 * @param {string} config.infoMessage - Info message to display
 * @param {string} config.filenamePrefix - Prefix for the downloaded filename
 * @param {string} config.statusLabel - Label for the status filter (default: "Status Filter")
 * @param {string} config.statusHelperText - Helper text for the status filter
 * @param {Array} config.statusOptions - Array of {value, label} for status options
 * @param {string} config.defaultStatus - Default status value (default: "0")
 * @param {string} config.statusParamName - Parameter name for status in API (default: "state")
 */
function ReportStatusFilterView({ config }) {
  return (
    <UIXThemeProvider>
      <ReportStatusFilterViewContent config={config} />
    </UIXThemeProvider>
  );
}

const ReportStatusFilterViewContent = memo(function ReportStatusFilterViewContent({ config }) {
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
    statusLabel = "Status Filter",
    statusHelperText = "Filter the report by status",
    statusOptions = [
      { value: "0", label: "All" },
      { value: "1", label: "Active" },
      { value: "2", label: "Archived" },
    ],
    defaultStatus = "0",
    statusParamName = "state",
  } = config;

  // Form state
  const [status, setStatus] = useState(defaultStatus);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.[`report${reportId}`]) {
      setStatus(String(preferences[`report${reportId}`].status || defaultStatus));
    }
  }, [reportId, defaultStatus, reportManager]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (import.meta.env.DEV) {
      console.log(`ReportStatusFilterView: Submitting report ${reportId}`, { status });
    }

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Build parameters
      const params = {
        [statusParamName]: parseInt(status) || 0,
      };

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
        console.log(`ReportStatusFilterView: Report ${reportId} downloaded successfully`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`ReportStatusFilterView: Error downloading report ${reportId}`, error);
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
  }, [reportId, status, filenamePrefix, statusParamName, reportManager, onUnauthorized]);

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
        {/* Status Filter */}
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

ReportStatusFilterViewContent.displayName = "ReportStatusFilterViewContent";

export default ReportStatusFilterView;

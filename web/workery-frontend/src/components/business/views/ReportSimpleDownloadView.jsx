// File: src/components/business/views/ReportSimpleDownloadView.jsx
// @uix-view: ReportSimpleDownloadView
// Template for reports with no form fields - just a download button

import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useReportManager } from "../../../services/Services";
import {
  Button,
  EntityReportDetail,
  UIXThemeProvider,
  useUIXTheme,
} from "../../UIX";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

/**
 * ReportSimpleDownloadView - Template for reports with no input parameters
 *
 * @param {Object} config - Configuration object
 * @param {number} config.reportId - Report ID for the API
 * @param {string} config.reportTitle - Title of the report
 * @param {string} config.reportDescription - Description of the report
 * @param {string} config.reportBreadcrumbLabel - Label for breadcrumb
 * @param {React.Component} config.icon - HeroIcon component for the report
 * @param {string} config.infoMessage - Info message to display
 * @param {string} config.filenamePrefix - Prefix for the downloaded filename
 * @param {string} config.tipTitle - Optional tip title
 * @param {string} config.tipMessage - Optional tip message
 * @param {string} config.downloadButtonText - Optional custom download button text
 * @param {string} config.downloadingText - Optional custom downloading text
 */
function ReportSimpleDownloadView({ config }) {
  return (
    <UIXThemeProvider>
      <ReportSimpleDownloadViewContent config={config} />
    </UIXThemeProvider>
  );
}

const ReportSimpleDownloadViewContent = memo(function ReportSimpleDownloadViewContent({ config }) {
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
    tipTitle = "Quick Tip:",
    tipMessage,
    downloadButtonText = "Download Report",
    downloadingText = "Generating Report...",
  } = config;

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (import.meta.env.DEV) {
      console.log(`ReportSimpleDownloadView: Submitting report ${reportId}`);
    }

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // No parameters needed for this report type
      const params = {};

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
          lastDownloaded: new Date().toISOString(),
        },
      });

      if (import.meta.env.DEV) {
        console.log(`ReportSimpleDownloadView: Report ${reportId} downloaded successfully`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`ReportSimpleDownloadView: Error downloading report ${reportId}`, error);
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
  }, [reportId, filenamePrefix, reportManager, onUnauthorized]);

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
      {/* Simple Download Section */}
      <div className={`rounded-lg p-6 text-center ${getThemeClasses("bg-subtle")}`}>
        <IconComponent className={`w-12 h-12 mx-auto mb-4 ${getThemeClasses("text-accent")}`} />
        <h3 className={`text-lg font-medium mb-2 ${getThemeClasses("text-primary")}`}>
          Generate and Download Report
        </h3>
        <p className={`text-sm mb-6 ${getThemeClasses("text-secondary")}`}>
          There are no fields to configure. Simply click the button below to generate and download the report.
        </p>

        {/* Download Button */}
        <Button
          onClick={handleSubmit}
          variant="success"
          size="lg"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText={downloadingText}
        >
          {downloadButtonText}
        </Button>
      </div>

      {/* Additional Information / Tip */}
      {tipMessage && (
        <div className={`mt-6 p-4 rounded-lg ${getThemeClasses("bg-info-subtle")}`}>
          <div className="flex">
            <InformationCircleIcon className={`w-5 h-5 mr-2 flex-shrink-0 ${getThemeClasses("text-info")}`} />
            <div className={`text-sm ${getThemeClasses("text-info")}`}>
              <p className="font-medium mb-1">{tipTitle}</p>
              <p>{tipMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className={`flex items-center justify-between pt-6 mt-6 border-t ${getThemeClasses("border-color")}`}>
        <Button
          onClick={() => navigate("/admin/reports")}
          variant="secondary"
        >
          Back to Reports
        </Button>
      </div>
    </EntityReportDetail>
  );
});

ReportSimpleDownloadViewContent.displayName = "ReportSimpleDownloadViewContent";

export default ReportSimpleDownloadView;

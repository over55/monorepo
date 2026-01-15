// File: src/components/UIX/EntityReportDetail/example-usage.jsx
// Example of how to use EntityReportDetail component in a report page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useReportManager } from "../../../services/Services";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../constants/FieldOptions";
import {
  EntityReportDetail,
  Button,
  Input,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../components/UIX";
import {
  BanknotesIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

function ExampleReportPage() {
  return (
    <UIXThemeProvider>
      <ExampleReportPageContent />
    </UIXThemeProvider>
  );
}

function ExampleReportPageContent() {
  const navigate = useNavigate();
  const reportManager = useReportManager();
  const { getThemeClasses } = useUIXTheme();

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jobStatus, setJobStatus] = useState("0");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.lastDueServiceFeesReport) {
      setJobStatus(String(preferences.lastDueServiceFeesReport.jobStatus || 0));
    }

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, [reportManager]);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (import.meta.env.DEV) {
      console.log("Submitting report", { fromDate, toDate, jobStatus });
    }

    // Convert string dates to Date objects
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    // Validate
    const validationErrors = reportManager.validateDueServiceFeesReportParams(
      fromDateObj,
      toDateObj,
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Clear errors and start submission
    setErrors({});
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Download the report
      await reportManager.downloadDueServiceFeesReport(
        fromDateObj,
        toDateObj,
        parseInt(jobStatus),
        onUnauthorized,
      );

      // Show success message
      setShowSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      if (import.meta.env.DEV) {
        console.log("Report downloaded successfully");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error downloading report", error);
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
  };

  // Get recent downloads from history
  const recentDownloads = reportManager.getReportHistory();

  return (
    <EntityReportDetail
      reportTitle="Due Service Fees Report"
      reportDescription="Generate a report of outstanding service fees for facilitators"
      reportBreadcrumbLabel="Due Service Fees"
      icon={BanknotesIcon}
      showSuccess={showSuccess}
      errors={errors}
      infoMessage="This report will generate a CSV file containing all work orders with outstanding service fees within the specified date range. The dates refer to the assignment date of the work orders."
      recentDownloads={recentDownloads}
      reportId={1}
      reportType="Due Service Fees"
      onDismissSuccess={() => setShowSuccess(false)}
      onDismissErrors={() => setErrors({})}
    >
      {/* Form content goes here as children */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="From Date"
            name="fromDate"
            type="date"
            value={fromDate}
            onChange={(value) => setFromDate(value)}
            error={errors.fromDate}
            required
            icon={CalendarIcon}
            helperText="Start date for the report (assignment date)"
          />

          <Input
            label="To Date"
            name="toDate"
            type="date"
            value={toDate}
            onChange={(value) => setToDate(value)}
            error={errors.toDate}
            required
            icon={CalendarIcon}
            helperText="End date for the report (assignment date)"
          />
        </div>

        {/* Job Status Field */}
        <Select
          label="Job Status Filter"
          value={jobStatus}
          onChange={(value) => setJobStatus(value)}
          options={ORDER_STATUS_FILTER_OPTIONS.map((opt) => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          error={errors.jobStatus}
          helperText="Filter the report by specific job status or select 'All' for all statuses"
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
}

export default ExampleReportPage;

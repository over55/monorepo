// File: src/components/business/views/ReportDateRangeUserTypeView.jsx
// @uix-view: ReportDateRangeUserTypeView
// Template for reports with date range and required user type select

import React, { useState, useEffect, useCallback, memo } from "react";
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
import { CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";

/**
 * ReportDateRangeUserTypeView - Template for reports with date range and required user type filter
 *
 * @param {Object} config - Configuration object
 * @param {number} config.reportId - Report ID for the API
 * @param {string} config.reportTitle - Title of the report
 * @param {string} config.reportDescription - Description of the report
 * @param {string} config.reportBreadcrumbLabel - Label for breadcrumb
 * @param {React.Component} config.icon - HeroIcon component for the report
 * @param {string} config.infoMessage - Info message to display
 * @param {string} config.filenamePrefix - Prefix for the downloaded filename
 * @param {string} config.fromDateHelperText - Helper text for from date
 * @param {string} config.toDateHelperText - Helper text for to date
 * @param {string} config.userTypeLabel - Label for user type select
 * @param {string} config.userTypeHelperText - Helper text for user type select
 * @param {Array} config.userTypeOptions - Array of {value, label} for user type options
 * @param {number} config.defaultDaysBack - Default days back for from date (default: 30)
 */
function ReportDateRangeUserTypeView({ config }) {
  return (
    <UIXThemeProvider>
      <ReportDateRangeUserTypeViewContent config={config} />
    </UIXThemeProvider>
  );
}

const ReportDateRangeUserTypeViewContent = memo(function ReportDateRangeUserTypeViewContent({ config }) {
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
    fromDateHelperText = "Refers to user join date",
    toDateHelperText = "Refers to user join date",
    userTypeLabel = "What type of user to filter by?",
    userTypeHelperText = "Select the user category to include in the report",
    userTypeOptions = [
      { value: "", label: "Please select" },
      { value: "1", label: "Client" },
      { value: "2", label: "Facilitator" },
      { value: "3", label: "Staff" },
    ],
    defaultDaysBack = 30,
  } = config;

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userType, setUserType] = useState("");

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
      if (preferences[`report${reportId}`].fromDate) {
        setFromDate(preferences[`report${reportId}`].fromDate);
      }
      if (preferences[`report${reportId}`].toDate) {
        setToDate(preferences[`report${reportId}`].toDate);
      }
      if (preferences[`report${reportId}`].userType) {
        setUserType(String(preferences[`report${reportId}`].userType));
      }
    }
  }, [reportId, defaultDaysBack, reportManager]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

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

    if (!userType || userType === "") {
      newErrors.userType = "User type is required";
      hasErrors = true;
    }

    return { errors: newErrors, hasErrors };
  }, [fromDate, toDate, userType]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (import.meta.env.DEV) {
      console.log(`ReportDateRangeUserTypeView: Submitting report ${reportId}`, {
        fromDate,
        toDate,
        userType,
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

      // Build parameters
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
        user_type: parseInt(userType),
      };

      // Generate filename with user type name
      const timestamp = new Date().toISOString().split("T")[0];
      const userTypeName = userTypeOptions.find(
        (opt) => String(opt.value) === String(userType),
      )?.label?.toLowerCase() || "all";
      const filename = `${filenamePrefix}_${userTypeName}_${timestamp}.csv`;

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
          fromDate: fromDate,
          toDate: toDate,
          userType: userType,
        },
      });

      if (import.meta.env.DEV) {
        console.log(`ReportDateRangeUserTypeView: Report ${reportId} downloaded successfully`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`ReportDateRangeUserTypeView: Error downloading report ${reportId}`, error);
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
  }, [reportId, fromDate, toDate, userType, filenamePrefix, userTypeOptions, validateForm, reportManager, onUnauthorized]);

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
        {/* Date Range Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Date Field */}
          <Input
            label="From Date"
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
            label="To Date"
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

        {/* User Type Select */}
        <Select
          label={userTypeLabel}
          value={userType}
          onChange={(value) => {
            setUserType(value);
            if (errors.userType) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.userType;
                return newErrors;
              });
            }
          }}
          options={userTypeOptions.map((opt) => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          error={errors.userType}
          required
          icon={UsersIcon}
          helperText={userTypeHelperText}
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

ReportDateRangeUserTypeViewContent.displayName = "ReportDateRangeUserTypeViewContent";

export default ReportDateRangeUserTypeView;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/01Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useReportManager } from "../../../../services/Services";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../constants/FieldOptions";

function AdminReport01Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jobStatus, setJobStatus] = useState(0);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.lastDueServiceFeesReport) {
      setJobStatus(preferences.lastDueServiceFeesReport.jobStatus || 0);
    }
  }, []);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport01Page: Submitting report", {
      fromDate,
      toDate,
      jobStatus,
    });

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

    try {
      // Download the report
      await reportManager.downloadDueServiceFeesReport(
        fromDateObj,
        toDateObj,
        parseInt(jobStatus),
        onUnauthorized,
      );

      // Optional: Show success message or close window
      console.log("AdminReport01Page: Report downloaded successfully");

      // If this was opened in a new window/tab, close it
      if (window.opener) {
        window.close();
      }
    } catch (error) {
      console.error("AdminReport01Page: Error downloading report", error);

      // Handle errors
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to download report. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb">
        <ol>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/reports">Reports</Link>
          </li>
          <li aria-current="page">Due Service Fees Report</li>
        </ol>
      </nav>

      {/* Page Header */}
      <h1>Due Service Fees Report</h1>
      <hr />

      {/* Report Form Container */}
      <div>
        <h2>Generate and Download Report</h2>
        <p>
          Please fill out all the required fields before submitting this form.
        </p>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div role="alert" aria-live="polite">
            <h3>Error</h3>
            {errors.general ? (
              <p>{errors.general}</p>
            ) : (
              <ul>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Form or Loading State */}
        {isSubmitting ? (
          <div>
            <p>Generating report...</p>
            <p>Please wait while we prepare your download.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* From Date Field */}
            <div>
              <label htmlFor="fromDate">
                From Date <span aria-label="required">*</span>
              </label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  // Clear error for this field
                  if (errors.fromDate) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.fromDate;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-required="true"
                aria-invalid={!!errors.fromDate}
                aria-describedby={
                  errors.fromDate ? "fromDate-error" : "fromDate-help"
                }
              />
              <small id="fromDate-help">Refers to assignment date</small>
              {errors.fromDate && (
                <span id="fromDate-error" role="alert">
                  {errors.fromDate}
                </span>
              )}
            </div>

            {/* To Date Field */}
            <div>
              <label htmlFor="toDate">
                To Date <span aria-label="required">*</span>
              </label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  // Clear error for this field
                  if (errors.toDate) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.toDate;
                      return newErrors;
                    });
                  }
                }}
                required
                aria-required="true"
                aria-invalid={!!errors.toDate}
                aria-describedby={
                  errors.toDate ? "toDate-error" : "toDate-help"
                }
              />
              <small id="toDate-help">Refers to assignment date</small>
              {errors.toDate && (
                <span id="toDate-error" role="alert">
                  {errors.toDate}
                </span>
              )}
            </div>

            {/* Job Status Field */}
            <div>
              <label htmlFor="jobStatus">Job Status</label>
              <select
                id="jobStatus"
                name="jobStatus"
                value={jobStatus}
                onChange={(e) => {
                  setJobStatus(e.target.value);
                  // Clear error for this field
                  if (errors.jobStatus) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.jobStatus;
                      return newErrors;
                    });
                  }
                }}
                aria-describedby="jobStatus-help"
                aria-invalid={!!errors.jobStatus}
              >
                {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small id="jobStatus-help">Filter by job status</small>
              {errors.jobStatus && <span role="alert">{errors.jobStatus}</span>}
            </div>

            {/* Form Actions */}
            <div>
              <Link to="/admin/reports">← Back</Link>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Downloading..." : "Download"}
              </button>
            </div>
          </form>
        )}

        {/* Report History Section (Optional) */}
        <details>
          <summary>Recent Downloads</summary>
          <div>
            {reportManager
              .getReportHistory()
              .filter(
                (item) =>
                  item.reportId === 1 || item.reportType === "Due Service Fees",
              )
              .slice(0, 5)
              .map((item, index) => (
                <div key={index}>
                  <span>{item.filename}</span>
                  <span>{new Date(item.downloadedAt).toLocaleString()}</span>
                </div>
              ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export default AdminReport01Page;

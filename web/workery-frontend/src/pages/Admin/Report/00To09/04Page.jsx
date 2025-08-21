// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/04Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useReportManager } from "../../../../services/Services";

function AdminReport04Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // Form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences and set default dates on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();

    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

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

      // Check for future dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (to > today) {
        newErrors.toDate = "To date cannot be in the future";
        hasErrors = true;
      }

      // Note: As per requirements, no range restrictions on the date range size
    }

    return { errors: newErrors, hasErrors };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AdminReport04Page: Submitting report", {
      fromDate,
      toDate,
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

      // Download the report using generic downloadReport method
      const params = {
        from_dt: fromDateObj.getTime(),
        to_dt: toDateObj.getTime(),
      };

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `cancelled_jobs_report_${timestamp}.csv`;

      await reportManager.downloadReport(
        4, // Report ID for Cancelled Jobs Report
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
        lastCancelledJobsReport: {
          // Could save date range preferences if needed
        },
      });

      console.log("AdminReport04Page: Report downloaded successfully");
    } catch (error) {
      console.error("AdminReport04Page: Error downloading report", error);

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
      (item) => item.reportId === 4 || item.reportType === "Cancelled Jobs",
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

  if (isLoading) {
    return <div>Loading report settings...</div>;
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/reports">Reports</Link>
          </li>
          <li aria-current="page">Cancelled Jobs Report</li>
        </ol>
      </nav>

      {/* Page Title */}
      <h1>Cancelled Jobs Report</h1>
      <p>Generate a report of cancelled jobs within a date range</p>
      <hr />

      {/* Main Content */}
      <div>
        {/* Success Message */}
        {showSuccess && (
          <div role="alert">
            <strong>Success!</strong> Report downloaded successfully! Check your
            downloads folder.
            <button onClick={() => setShowSuccess(false)}>×</button>
          </div>
        )}

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div role="alert">
            <strong>Error:</strong>
            {errors.general ? (
              <p>{errors.general}</p>
            ) : (
              <ul>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
            <button onClick={() => setErrors({})}>×</button>
          </div>
        )}

        {/* Info Alert */}
        <div role="alert">
          <strong>Report Information</strong>
          <p>
            This report will generate a CSV file containing all cancelled jobs
            within the specified date range. The dates refer to the assignment
            date of the work orders.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <h2>Generate and Download Report</h2>
          <p>
            Please fill out all the required fields before submitting this form.
          </p>

          {/* Date Range Fields */}
          <div>
            {/* From Date Field */}
            <div>
              <label htmlFor="fromDate">
                From Date <span>*</span>
              </label>
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
                required
              />
              {errors.fromDate && (
                <p style={{ color: "red" }}>{errors.fromDate}</p>
              )}
              <small>Start date for the report (assignment date)</small>
            </div>

            {/* To Date Field */}
            <div>
              <label htmlFor="toDate">
                To Date <span>*</span>
              </label>
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
                required
              />
              {errors.toDate && <p style={{ color: "red" }}>{errors.toDate}</p>}
              <small>End date for the report (assignment date)</small>
            </div>
          </div>

          {/* Date Range Summary */}
          {dateRangeSummary && (
            <div>
              <h3>Date Range Summary</h3>
              <div>
                <div>
                  <strong>{dateRangeSummary.days}</strong> Days
                </div>
                <div>
                  <strong>{dateRangeSummary.weeks}</strong> Weeks
                </div>
                <div>
                  <strong>{dateRangeSummary.months}</strong> Months
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div>
            <button type="button" onClick={() => navigate("/admin/reports")}>
              ← Back to Reports
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Download Report"}
            </button>
          </div>
        </form>

        {/* Recent Downloads Section */}
        <div>
          <h2>Recent Downloads</h2>
          {recentDownloads.length > 0 ? (
            <ul>
              {recentDownloads.map((item, index) => (
                <li key={index}>
                  <strong>{item.filename}</strong>
                  <br />
                  <small>{new Date(item.downloadedAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent downloads of this report</p>
          )}
        </div>

        {/* Report Tips */}
        <div>
          <h2>Report Tips</h2>
          <ul>
            <li>
              This report shows all jobs that were cancelled within the
              specified date range
            </li>
            <li>The date range is based on the work order assignment date</li>
            <li>
              The report includes cancellation reasons and details for each job
            </li>
            <li>
              The CSV file can be opened in Excel or Google Sheets for further
              analysis
            </li>
            <li>
              Use this report to analyze cancellation patterns and identify
              areas for improvement
            </li>
          </ul>
        </div>

        {/* What's Included */}
        <div>
          <h2>What's Included</h2>
          <ul>
            <li>
              <strong>Job Details</strong> - Order ID, customer information, and
              assignment date
            </li>
            <li>
              <strong>Cancellation Information</strong> - Date cancelled, reason
              for cancellation
            </li>
            <li>
              <strong>Associate Information</strong> - If an associate was
              assigned before cancellation
            </li>
            <li>
              <strong>Financial Impact</strong> - Any associated costs or lost
              revenue
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminReport04Page;

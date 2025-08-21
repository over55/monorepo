// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/00To09/07Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReportManager } from "../../../../services/Services";

function AdminReport07Page() {
  const navigate = useNavigate();
  const reportManager = useReportManager();

  // State
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associateStatus, setAssociateStatus] = useState(0);

  // Handler for unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load saved preferences on mount
  useEffect(() => {
    const preferences = reportManager.getReportPreferences();
    if (preferences?.report07) {
      setAssociateStatus(preferences.report07.associateStatus || 0);
    }
  }, []);

  // Submit handler
  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("Report07Page: onSubmitClick - Beginning...");

    // Clear previous errors
    setErrors({});

    // No validation needed - status filter is optional
    // The report can be generated with or without the filter

    try {
      setFetching(true);

      // Build parameters
      const params = {
        state: parseInt(associateStatus) || 0,
      };

      // Download report
      const reportId = 7;
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `report_07_associate_birthdays_${timestamp}.csv`;

      console.log("Report07Page: Downloading report with params:", params);

      await reportManager.downloadReport(
        reportId,
        params,
        filename,
        onUnauthorized,
      );

      // Save preferences for next time
      reportManager.saveReportPreferences({
        report07: {
          associateStatus: associateStatus,
        },
      });

      console.log("Report07Page: Report downloaded successfully");

      // Close the window after successful download (matching old behavior)
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error("Report07Page: Error downloading report:", error);

      // Handle errors
      if (error && typeof error === "object") {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to download report. Please try again.",
        });
      }

      // Scroll to top to show errors
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Associate status filter options (matching old ASSOCIATE_STATUS_FILTER_OPTIONS)
  const associateStatusOptions = [
    { value: 0, label: "All" },
    { value: 1, label: "Active" },
    { value: 2, label: "Archived" },
  ];

  return (
    <div>
      <section>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumbs">
          <ul>
            <li>
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/reports">Reports</Link>
            </li>
            <li>Associate Birthdays</li>
          </ul>
        </nav>

        {/* Page Title */}
        <div>
          <h1>Associate Birthdays</h1>
          <hr />
        </div>

        {/* Report Generation Form */}
        <div>
          <h2>Generate and Download Report</h2>
          <p>
            Please fill out all the required fields before submitting this form.
          </p>

          {isFetching ? (
            <div>
              <p>Submitting...</p>
              <p>Generating report, please wait...</p>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <div role="alert">
                  {errors.general && <p>{errors.general}</p>}
                  {Object.entries(errors).map(([key, value]) => {
                    if (key !== "general") {
                      return (
                        <p key={key}>
                          {key}: {value}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              <form onSubmit={onSubmitClick}>
                {/* Associate Status Filter */}
                <div>
                  <label htmlFor="associateStatus">Job Status</label>
                  <select
                    id="associateStatus"
                    name="associateStatus"
                    value={associateStatus}
                    onChange={(e) =>
                      setAssociateStatus(parseInt(e.target.value))
                    }
                  >
                    {associateStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.associateStatus && (
                    <p role="alert">{errors.associateStatus}</p>
                  )}
                  <p>
                    Filter the report by associate job status. Select "All" to
                    include all associates.
                  </p>
                </div>

                {/* Action Buttons */}
                <div>
                  <div>
                    <Link to="/admin/reports">Back</Link>
                  </div>
                  <div>
                    <button type="submit" disabled={isFetching}>
                      Download
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Report History Section */}
        <ReportHistorySection reportId={7} />
      </section>
    </div>
  );
}

// Report History Component
function ReportHistorySection({ reportId }) {
  const reportManager = useReportManager();
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Get report history
    const allHistory = reportManager.getReportHistory();

    // Filter for this report ID
    const reportHistory = allHistory
      .filter((item) => item.reportId === reportId)
      .slice(0, 10); // Show last 10 downloads

    setHistory(reportHistory);
  }, [reportId]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div>
      <hr />
      <h3>Download History</h3>
      <button onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Hide" : "Show"} History ({history.length} recent
        downloads)
      </button>

      {showHistory && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Filename</th>
                <th>Status Filter</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.downloadedAt).toLocaleString()}</td>
                  <td>{item.filename}</td>
                  <td>{getStatusLabel(item.params?.state)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length >= 10 && <p>Showing last 10 downloads</p>}

          <button
            onClick={() => {
              reportManager.clearReportHistory();
              setHistory([]);
            }}
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to get status label
function getStatusLabel(status) {
  switch (parseInt(status)) {
    case 1:
      return "Active";
    case 2:
      return "Archived";
    case 0:
    default:
      return "All";
  }
}

// Export the component
export default AdminReport07Page;

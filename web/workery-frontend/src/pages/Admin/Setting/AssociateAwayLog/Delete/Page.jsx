// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Policy check expired",
};

function SettingAssociateAwayLogDeletePage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [associateAwayLog, setAssociateAwayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate away log details
  const fetchAssociateAwayLogDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await associateAwayLogManager.getAssociateAwayLogDetail(
        id,
        onUnauthorized,
      );

      setAssociateAwayLog(response);
    } catch (err) {
      console.error("Failed to fetch associate away log detail:", err);
      setError(err.message || "Failed to load associate away log details");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);

      await associateAwayLogManager.deleteAssociateAwayLog(id, onUnauthorized);

      setSuccess("Associate away log deleted successfully!");

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate("/admin/settings/associate-away-logs");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete associate away log:", err);
      setError(err.message || "Failed to delete associate away log");
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/associate-away-log/${id}/detail`);
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchAssociateAwayLogDetail();
    } else {
      setError("No associate away log ID provided");
      setLoading(false);
    }
  }, [id]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format datetime helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Associate Away Logs",
      path: "/admin/settings/associate-away-logs",
      icon: "📅",
    },
    { label: "Delete", icon: "🗑️" },
  ];

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading associate away log details..." />
      </div>
    );
  }

  if (error && !associateAwayLog) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            onClick={() => navigate("/admin/settings/associate-away-logs")}
          >
            ← Back to Associate Away Logs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          🗑️ Delete Associate Away Log
        </h1>
      </div>

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Warning Alert */}
      <Alert type="warning">
        <strong>⚠️ Warning: This action cannot be undone!</strong>
        <br />
        You are about to permanently delete this associate away log. All data
        associated with this record will be lost.
      </Alert>

      {associateAwayLog && (
        <>
          {/* Confirmation Details */}
          <Card title="Confirm Deletion of Away Log">
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <h3 style={{ marginTop: 0, color: theme.colors.danger }}>
                You are about to delete the following associate away log:
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >
                <div>
                  <div style={{ marginBottom: "15px" }}>
                    <strong>Associate:</strong>
                    <div style={{ marginTop: "5px", fontSize: "16px" }}>
                      <Link
                        to={`/admin/associate/${associateAwayLog.associateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.colors.primary,
                          textDecoration: "none",
                        }}
                      >
                        {associateAwayLog.associateName ||
                          `Associate #${associateAwayLog.associateId}`}{" "}
                        🔗
                      </Link>
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>Reason:</strong>
                    <div style={{ marginTop: "5px", fontSize: "16px" }}>
                      {associateAwayLog.reason === 1 ? (
                        <span>
                          {REASON_MAP[1]} -{" "}
                          {associateAwayLog.reasonOther || "Not specified"}
                        </span>
                      ) : (
                        <span>
                          {REASON_MAP[associateAwayLog.reason] || "Unknown"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>Start Date:</strong>
                    <div style={{ marginTop: "5px", fontSize: "16px" }}>
                      {formatDate(associateAwayLog.startDate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: "15px" }}>
                    <strong>Until:</strong>
                    <div style={{ marginTop: "5px", fontSize: "16px" }}>
                      {associateAwayLog.untilFurtherNotice === 1 ? (
                        <span
                          style={{
                            color: theme.colors.warning,
                            fontWeight: "bold",
                          }}
                        >
                          Further Notice
                        </span>
                      ) : (
                        formatDate(associateAwayLog.untilDate)
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <strong>Created At:</strong>
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      {formatDateTime(associateAwayLog.createdAt)}
                    </div>
                  </div>

                  {associateAwayLog.createdByUserName && (
                    <div style={{ marginBottom: "15px" }}>
                      <strong>Created By:</strong>
                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        {associateAwayLog.createdByUserName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Question */}
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#fff5f5",
                border: "1px solid #f56565",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", color: theme.colors.danger }}>
                Are you absolutely sure?
              </h3>
              <p style={{ margin: "0", fontSize: "16px" }}>
                This will permanently delete the associate away log and cannot
                be undone. Type your confirmation below and click "Delete" to
                proceed.
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
            }}
          >
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={deleting}
              size="lg"
            >
              ← Cancel
            </Button>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              {deleting && (
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Deleting associate away log...
                </div>
              )}
              <Button
                onClick={handleDeleteConfirm}
                variant="danger"
                disabled={deleting}
                size="lg"
                style={{ minWidth: "150px" }}
              >
                {deleting ? (
                  <>
                    <span style={{ marginRight: "10px" }}>⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: "10px" }}>🗑️</span>
                    Delete Forever
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Additional Warning */}
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#fffbeb",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#92400e",
            }}
          >
            <strong>💡 Note:</strong> If you just want to temporarily disable
            this away log, consider editing it instead of deleting it
            permanently.
          </div>
        </>
      )}
    </div>
  );
}

export default SettingAssociateAwayLogDeletePage;

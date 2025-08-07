// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Detail/Page.jsx

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
  Modal,
} from "../../../../../components/UI";

const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Policy check expired",
};

function SettingAssociateAwayLogDetailPage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [associateAwayLog, setAssociateAwayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      await associateAwayLogManager.deleteAssociateAwayLog(id, onUnauthorized);

      setSuccess("Associate away log deleted successfully");
      setShowDeleteModal(false);

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate("/admin/settings/associate-away-logs");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete associate away log:", err);
      setError(err.message || "Failed to delete associate away log");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
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
    { label: "Details", icon: "👁️" },
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
          📅 Associate Away Log Details
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={() =>
              navigate(`/admin/settings/associate-away-log/${id}/update`)
            }
            variant="warning"
          >
            ✏️ Edit
          </Button>
          <Button onClick={() => setShowDeleteModal(true)} variant="danger">
            🗑️ Delete
          </Button>
        </div>
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

      {associateAwayLog && (
        <>
          <Card title="Away Log Information">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <h3
                  style={{ marginBottom: "15px", color: theme.colors.primary }}
                >
                  Associate Details
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Associate:</strong>
                  <br />
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

              <div>
                <h3
                  style={{ marginBottom: "15px", color: theme.colors.primary }}
                >
                  Away Details
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Reason:</strong>
                  <br />
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

                <div style={{ marginBottom: "10px" }}>
                  <strong>Start Date:</strong>
                  <br />
                  {formatDate(associateAwayLog.startDate)}
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <strong>Until:</strong>
                  <br />
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
            </div>
          </Card>

          <Card title="System Information">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <h3
                  style={{ marginBottom: "15px", color: theme.colors.primary }}
                >
                  Creation Info
                </h3>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Created At:</strong>
                  <br />
                  {formatDateTime(associateAwayLog.createdAt)}
                </div>

                {associateAwayLog.createdByUserName && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Created By:</strong>
                    <br />
                    {associateAwayLog.createdByUserName}
                  </div>
                )}

                {associateAwayLog.createdFromIpAddress && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Created From:</strong>
                    <br />
                    {associateAwayLog.createdFromIpAddress}
                  </div>
                )}
              </div>

              <div>
                <h3
                  style={{ marginBottom: "15px", color: theme.colors.primary }}
                >
                  Modification Info
                </h3>
                {associateAwayLog.modifiedAt && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Modified At:</strong>
                    <br />
                    {formatDateTime(associateAwayLog.modifiedAt)}
                  </div>
                )}

                {associateAwayLog.modifiedByUserName && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Modified By:</strong>
                    <br />
                    {associateAwayLog.modifiedByUserName}
                  </div>
                )}

                {associateAwayLog.modifiedFromIpAddress && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Modified From:</strong>
                    <br />
                    {associateAwayLog.modifiedFromIpAddress}
                  </div>
                )}
              </div>
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
              onClick={() => navigate("/admin/settings/associate-away-logs")}
              variant="outline"
            >
              ← Back to List
            </Button>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                onClick={() =>
                  navigate(`/admin/settings/associate-away-log/${id}/update`)
                }
                variant="warning"
              >
                ✏️ Edit
              </Button>
              <Button onClick={() => setShowDeleteModal(true)} variant="danger">
                🗑️ Delete
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="danger" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this associate away log? This action
          cannot be undone.
        </p>
        {associateAwayLog && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
            }}
          >
            <strong>Associate:</strong>{" "}
            {associateAwayLog.associateName ||
              `Associate #${associateAwayLog.associateId}`}
            <br />
            <strong>Reason:</strong>{" "}
            {associateAwayLog.reason === 1
              ? associateAwayLog.reasonOther
              : REASON_MAP[associateAwayLog.reason]}
            <br />
            <strong>Start Date:</strong>{" "}
            {formatDate(associateAwayLog.startDate)}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SettingAssociateAwayLogDetailPage;

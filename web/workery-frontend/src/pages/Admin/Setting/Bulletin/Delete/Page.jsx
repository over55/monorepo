// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

function SettingBulletinDeletePage() {
  const { id } = useParams();
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Component state
  const [bulletin, setBulletin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletin details
  const loadBulletin = async () => {
    if (!id) {
      setError("Bulletin ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const bulletinData = await bulletinManager.getBulletinDetail(
        id,
        onUnauthorized,
      );

      setBulletin(bulletinData);
    } catch (err) {
      console.error("Failed to load bulletin:", err);
      setError(err.message || "Failed to load bulletin details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadBulletin();
  }, [id]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!bulletin) return;

    // Require confirmation text
    if (confirmText.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await bulletinManager.deleteBulletin(bulletin.id, onUnauthorized);

      // Show success message and redirect
      alert("Bulletin deleted successfully!");
      navigate("/admin/settings/bulletins");
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/bulletin/${id}/detail`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading bulletin details..." />
      </div>
    );
  }

  // Error state
  if (error && !bulletin) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to="/admin/settings/bulletins">← Back to Bulletins</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          { path: "/admin/settings/bulletins", label: "Bulletins", icon: "📰" },
          {
            path: `/admin/settings/bulletin/${id}/detail`,
            label: "Detail",
            icon: "📋",
          },
          { label: "Delete", icon: "🗑️" },
        ]}
      />

      {bulletin && (
        <>
          {/* Warning Header */}
          <Alert type="error">
            <strong>⚠️ WARNING: This action cannot be undone!</strong>
            <br />
            You are about to permanently delete this bulletin from the system.
          </Alert>

          {/* Deletion Confirmation Card */}
          <Card title="🗑️ Delete Bulletin">
            {/* Error Messages */}
            {error && (
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Bulletin Details */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ color: theme.colors.danger, marginBottom: "15px" }}>
                Bulletin to be deleted:
              </h3>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fff5f5",
                  borderRadius: "8px",
                  border: `2px solid ${theme.colors.danger}`,
                  marginBottom: "20px",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <strong>Text:</strong>
                  <p
                    style={{
                      marginTop: "8px",
                      padding: "10px",
                      backgroundColor: "#ffffff",
                      borderRadius: "4px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {bulletin.text}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  <div>
                    <strong>ID:</strong> {bulletin.id}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {bulletin.createdAt
                      ? new Date(bulletin.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        backgroundColor:
                          bulletin.status === 1
                            ? theme.colors.successBg
                            : theme.colors.warningBg,
                        color:
                          bulletin.status === 1
                            ? theme.colors.success
                            : "#856404",
                      }}
                    >
                      {bulletin.status === 1 ? "Active" : "Archived"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Section */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef2f2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                marginBottom: "30px",
              }}
            >
              <h4 style={{ color: theme.colors.danger, marginBottom: "15px" }}>
                🔒 Confirmation Required
              </h4>

              <p style={{ marginBottom: "15px", fontSize: "14px" }}>
                This action will permanently remove the bulletin from the
                system. All associated data will be lost and cannot be
                recovered.
              </p>

              <p
                style={{
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                To confirm deletion, please type{" "}
                <code
                  style={{
                    backgroundColor: "#e2e8f0",
                    padding: "2px 4px",
                    borderRadius: "3px",
                  }}
                >
                  delete
                </code>{" "}
                in the box below:
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'delete' to confirm"
                style={{
                  ...globalStyles.input,
                  borderColor:
                    confirmText.toLowerCase() === "delete"
                      ? theme.colors.success
                      : theme.colors.danger,
                  backgroundColor:
                    confirmText.toLowerCase() === "delete"
                      ? "#f0fff4"
                      : "#fff5f5",
                }}
                disabled={isDeleting}
                autoFocus
              />
            </div>

            {/* Additional Warning */}
            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.warningBg,
                borderRadius: "8px",
                marginBottom: "30px",
                fontSize: "14px",
                color: "#856404",
              }}
            >
              <strong>⚠️ Consider These Alternatives:</strong>
              <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
                <li>Archive the bulletin instead of deleting it</li>
                <li>Edit the bulletin to update its content</li>
                <li>Export or backup the bulletin content before deletion</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                paddingTop: "20px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Link
                to={`/admin/settings/bulletin/${id}/detail`}
                style={{
                  textDecoration: "none",
                  color: theme.colors.secondary,
                  fontSize: "14px",
                }}
              >
                ← Back to Bulletin Detail
              </Link>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>

                <Button
                  variant="warning"
                  onClick={() =>
                    navigate(`/admin/settings/bulletin/${id}/update`)
                  }
                  disabled={isDeleting}
                >
                  ✏️ Edit Instead
                </Button>

                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={
                    isDeleting || confirmText.toLowerCase() !== "delete"
                  }
                >
                  {isDeleting ? "Deleting..." : "🗑️ Delete Permanently"}
                </Button>
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card title="📊 System Information" style={{ marginTop: "30px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong>Created At:</strong>
                <br />
                {bulletin.createdAt
                  ? new Date(bulletin.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <strong>Created By:</strong>
                <br />
                {bulletin.createdByUserName || "System"}
              </div>
              <div>
                <strong>Last Modified:</strong>
                <br />
                {bulletin.modifiedAt
                  ? new Date(bulletin.modifiedAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <strong>Modified By:</strong>
                <br />
                {bulletin.modifiedByUserName || "N/A"}
              </div>
              {bulletin.createdFromIpAddress && (
                <div>
                  <strong>Created From IP:</strong>
                  <br />
                  {bulletin.createdFromIpAddress}
                </div>
              )}
              {bulletin.modifiedFromIpAddress && (
                <div>
                  <strong>Modified From IP:</strong>
                  <br />
                  {bulletin.modifiedFromIpAddress}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Loading Overlay */}
      {isDeleting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <Loading message="Deleting bulletin..." />
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingBulletinDeletePage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Detail/Page.jsx

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
  Modal,
} from "../../../../../components/UI";

function SettingBulletinDetailPage() {
  const { id } = useParams();
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Component state
  const [bulletin, setBulletin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleDelete = async () => {
    if (!bulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.deleteBulletin(bulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin deleted successfully");
      setShowDeleteModal(false);

      // Redirect to list after deletion
      setTimeout(() => {
        navigate("/admin/settings/bulletins");
      }, 1000);
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!bulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.archiveBulletin(bulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin archived successfully");
      loadBulletin(); // Reload to show updated status
    } catch (err) {
      console.error("Failed to archive bulletin:", err);
      setError(err.message || "Failed to archive bulletin");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !bulletin) {
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
          { label: "Detail", icon: "📋" },
        ]}
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {bulletin && (
        <>
          {/* Main Details Card */}
          <Card
            title="📰 Bulletin Details"
            actions={
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button
                  variant="warning"
                  onClick={() =>
                    navigate(`/admin/settings/bulletin/${bulletin.id}/update`)
                  }
                  disabled={isLoading}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="info"
                  onClick={handleArchive}
                  disabled={isLoading}
                >
                  📦 Archive
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isLoading}
                >
                  🗑️ Delete
                </Button>
              </div>
            }
          >
            {/* Bulletin Content */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ marginBottom: "15px", color: theme.colors.dark }}>
                Bulletin Text
              </h3>
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${theme.colors.primary}`,
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                {bulletin.text}
              </div>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Creation Info */}
              <div>
                <h4 style={{ marginBottom: "10px", color: theme.colors.dark }}>
                  Creation Information
                </h4>
                <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Created At:</strong>
                    <br />
                    {bulletin.createdAt
                      ? new Date(bulletin.createdAt).toLocaleString()
                      : "N/A"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Created By:</strong>
                    <br />
                    {bulletin.createdByUserName || "System"}
                  </div>
                  {bulletin.createdFromIpAddress && (
                    <div style={{ marginBottom: "8px" }}>
                      <strong>Created From IP:</strong>
                      <br />
                      {bulletin.createdFromIpAddress}
                    </div>
                  )}
                </div>
              </div>

              {/* Modification Info */}
              <div>
                <h4 style={{ marginBottom: "10px", color: theme.colors.dark }}>
                  Modification Information
                </h4>
                <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Modified At:</strong>
                    <br />
                    {bulletin.modifiedAt
                      ? new Date(bulletin.modifiedAt).toLocaleString()
                      : "N/A"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Modified By:</strong>
                    <br />
                    {bulletin.modifiedByUserName || "N/A"}
                  </div>
                  {bulletin.modifiedFromIpAddress && (
                    <div style={{ marginBottom: "8px" }}>
                      <strong>Modified From IP:</strong>
                      <br />
                      {bulletin.modifiedFromIpAddress}
                    </div>
                  )}
                </div>
              </div>

              {/* System Info */}
              <div>
                <h4 style={{ marginBottom: "10px", color: theme.colors.dark }}>
                  System Information
                </h4>
                <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Bulletin ID:</strong>
                    <br />
                    {bulletin.id}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Status:</strong>
                    <br />
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
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
                  {bulletin.howDidYouHearAboutUsText && (
                    <div style={{ marginBottom: "8px" }}>
                      <strong>Source:</strong>
                      <br />
                      {bulletin.howDidYouHearAboutUsText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <Link
              to="/admin/settings/bulletins"
              style={{
                textDecoration: "none",
                color: theme.colors.primary,
                fontSize: "14px",
              }}
            >
              ← Back to Bulletins List
            </Link>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="warning"
                onClick={() =>
                  navigate(`/admin/settings/bulletin/${bulletin.id}/update`)
                }
                disabled={isLoading}
              >
                ✏️ Edit Bulletin
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/admin/settings/bulletin/create")}
              >
                ➕ Create New Bulletin
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="🗑️ Delete Bulletin"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Bulletin
            </Button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: "15px" }}>
            Are you sure you want to delete this bulletin? This action cannot be
            undone.
          </p>
          {bulletin && (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                borderLeft: `4px solid ${theme.colors.danger}`,
              }}
            >
              <strong>Bulletin to be deleted:</strong>
              <p style={{ marginTop: "8px", marginBottom: 0 }}>
                {bulletin.text}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default SettingBulletinDetailPage;

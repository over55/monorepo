// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTagManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../components/UI";

function SettingTagDetailPage() {
  const { id } = useParams();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tag, setTag] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTagDetail = async (tagId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const tagData = await tagManager.getTagDetail(tagId, onUnauthorized);

      setTag(tagData);

      console.log("TagDetailPage: Tag detail fetched successfully:", {
        id: tagData.id,
        text: tagData.text,
      });
    } catch (error) {
      console.error("TagDetailPage: Failed to fetch tag detail:", error);
      setErrors({
        fetch: error.message || "Failed to load tag details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);

    try {
      await tagManager.deleteTag(id, onUnauthorized);
      console.log("TagDetailPage: Tag deleted successfully");
      navigate("/admin/settings/tags");
    } catch (error) {
      console.error("TagDetailPage: Failed to delete tag:", error);
      setErrors({ delete: error.message || "Failed to delete tag" });
      window.scrollTo(0, 0);
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!id || typeof id !== "string" || id.trim() === "") {
        setErrors({ tagId: "Invalid tag ID" });
        return;
      }

      fetchTagDetail(id);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <Loading message="Loading Tag Details..." />;
  }

  const styles = {
    detailSection: {
      marginBottom: "30px",
    },
    sectionTitle: {
      fontSize: "18px",
      marginBottom: "15px",
      color: theme.colors.secondary,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    detailGrid: {
      display: "grid",
      gap: "15px",
      gridTemplateColumns: "1fr",
      maxWidth: "600px",
    },
    detailItem: {
      display: "flex",
      flexDirection: "column",
    },
    detailLabel: {
      fontWeight: "bold",
      marginBottom: "5px",
      fontSize: "14px",
      color: "#333",
    },
    detailValue: {
      padding: "10px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
      color: "#666",
      minHeight: "20px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "40px",
      flexWrap: "wrap",
      gap: "10px",
    },
    rightActions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Settings", path: "/admin/settings", icon: "⚙️" },
          {
            label: "Tags",
            path: "/admin/settings/tags",
            icon: "🏷️",
          },
          { label: "Detail", icon: "ℹ️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.delete && <Alert type="error">{errors.delete}</Alert>}
      {errors.tagId && <Alert type="error">{errors.tagId}</Alert>}

      {tag && (
        <Card
          title="🏷️ Tag Details"
          actions={
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/tag/${id}/update`}>
                <Button variant="warning">✏️ Edit</Button>
              </Link>
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
          {/* Tag Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🏷️ Tag Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Text:</label>
                <div style={styles.detailValue}>{tag.text || "N/A"}</div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Description:</label>
                <div style={styles.detailValue}>{tag.description || "N/A"}</div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Status:</label>
                <div style={styles.detailValue}>
                  {tag.status === 1 ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>⚙️ System Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created At:</label>
                <div style={styles.detailValue}>
                  {tag.createdAt
                    ? new Date(tag.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created By:</label>
                <div style={styles.detailValue}>
                  {tag.createdByUserName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created From:</label>
                <div style={styles.detailValue}>
                  {tag.createdFromIpAddress || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified At:</label>
                <div style={styles.detailValue}>
                  {tag.modifiedAt
                    ? new Date(tag.modifiedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified By:</label>
                <div style={styles.detailValue}>
                  {tag.modifiedByUserName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified From:</label>
                <div style={styles.detailValue}>
                  {tag.modifiedFromIpAddress || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/tags">
              <Button variant="secondary">← Back to List</Button>
            </Link>
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/tag/${id}/update`}>
                <Button variant="warning">✏️ Edit</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isLoading}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!tag && !isLoading && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Tag Not Found</h2>
            <p>The requested tag could not be found.</p>
            <Link to="/admin/settings/tags">
              <Button variant="primary">← Back to Tags List</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Confirm and Delete"}
            </Button>
          </>
        }
      >
        <div>
          <p>
            Are you sure you want to delete the tag "
            <strong>{tag?.text}</strong>"?
          </p>
          <p style={{ color: "#dc3545", fontWeight: "500" }}>
            This action cannot be undone and will permanently remove this tag
            from the system.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default SettingTagDetailPage;

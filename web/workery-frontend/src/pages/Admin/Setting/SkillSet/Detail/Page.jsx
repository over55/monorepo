// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../components/UI";

function SettingSkillSetDetailPage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [skillSet, setSkillSet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchSkillSetDetail = async (skillSetId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const skillSetData = await skillSetManager.getSkillSetDetail(
        skillSetId,
        onUnauthorized,
      );

      setSkillSet(skillSetData);

      console.log(
        "SkillSetDetailPage: Skill set detail fetched successfully:",
        {
          id: skillSetData.id,
          category: skillSetData.category,
          subCategory: skillSetData.subCategory,
        },
      );
    } catch (error) {
      console.error(
        "SkillSetDetailPage: Failed to fetch skill set detail:",
        error,
      );
      setErrors({
        fetch: error.message || "Failed to load skill set details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);

    try {
      await skillSetManager.deleteSkillSet(id, onUnauthorized);
      console.log("SkillSetDetailPage: Skill set deleted successfully");
      navigate("/admin/settings/skill-sets");
    } catch (error) {
      console.error("SkillSetDetailPage: Failed to delete skill set:", error);
      setErrors({ delete: error.message || "Failed to delete skill set" });
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
        setErrors({ skillSetId: "Invalid skill set ID" });
        return;
      }

      fetchSkillSetDetail(id);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <Loading message="Loading Skill Set Details..." />;
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
            label: "Skill Sets",
            path: "/admin/settings/skill-sets",
            icon: "🎓",
          },
          { label: "Detail", icon: "ℹ️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.delete && <Alert type="error">{errors.delete}</Alert>}
      {errors.skillSetId && <Alert type="error">{errors.skillSetId}</Alert>}

      {skillSet && (
        <Card
          title="🎓 Skill Set Details"
          actions={
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/skill-set/${id}/update`}>
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
          {/* Skill Set Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🎓 Skill Set Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Category:</label>
                <div style={styles.detailValue}>
                  {skillSet.category || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Sub-Category:</label>
                <div style={styles.detailValue}>
                  {skillSet.subCategory || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Description:</label>
                <div style={styles.detailValue}>
                  {skillSet.description || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Status:</label>
                <div style={styles.detailValue}>
                  {skillSet.status === 1 ? "Active" : "Inactive"}
                </div>
              </div>

              {skillSet.insuranceRequirement && (
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>
                    Insurance Requirement:
                  </label>
                  <div style={styles.detailValue}>
                    {skillSet.insuranceRequirement === 1 && "None"}
                    {skillSet.insuranceRequirement === 2 &&
                      "Commercial General Liability"}
                    {skillSet.insuranceRequirement === 3 && "WSIB"}
                    {skillSet.insuranceRequirement > 3 && "Other"}
                  </div>
                </div>
              )}
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
                  {skillSet.createdAt
                    ? new Date(skillSet.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created By:</label>
                <div style={styles.detailValue}>
                  {skillSet.createdByUserName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created From:</label>
                <div style={styles.detailValue}>
                  {skillSet.createdFromIpAddress || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified At:</label>
                <div style={styles.detailValue}>
                  {skillSet.modifiedAt
                    ? new Date(skillSet.modifiedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified By:</label>
                <div style={styles.detailValue}>
                  {skillSet.modifiedByUserName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified From:</label>
                <div style={styles.detailValue}>
                  {skillSet.modifiedFromIpAddress || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/skill-sets">
              <Button variant="secondary">← Back to List</Button>
            </Link>
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/skill-set/${id}/update`}>
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

      {!skillSet && !isLoading && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Skill Set Not Found</h2>
            <p>The requested skill set could not be found.</p>
            <Link to="/admin/settings/skill-sets">
              <Button variant="primary">← Back to Skill Sets List</Button>
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
            Are you sure you want to delete the skill set "
            <strong>
              {skillSet?.category} - {skillSet?.subCategory}
            </strong>
            "?
          </p>
          <p style={{ color: "#dc3545", fontWeight: "500" }}>
            This action cannot be undone and will permanently remove this skill
            set from the system.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default SettingSkillSetDetailPage;

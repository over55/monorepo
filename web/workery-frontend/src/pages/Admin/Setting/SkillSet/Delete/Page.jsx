// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Delete/Page.jsx

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
} from "../../../../../components/UI";

function SettingSkillSetDeletePage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [skillSet, setSkillSet] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchSkillSetDetail = async (skillSetId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const skillSetData = await skillSetManager.getSkillSetDetail(
        skillSetId,
        onUnauthorized,
      );

      setSkillSet(skillSetData);

      console.log("SkillSetDeletePage: Skill set detail loaded for deletion:", {
        id: skillSetData.id,
        category: skillSetData.category,
        subCategory: skillSetData.subCategory,
      });
    } catch (error) {
      console.error(
        "SkillSetDeletePage: Failed to fetch skill set detail:",
        error,
      );
      setErrors({
        fetch: error.message || "Failed to load skill set details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await skillSetManager.deleteSkillSet(id, onUnauthorized);

      console.log("SkillSetDeletePage: Skill set deleted successfully");
      navigate("/admin/settings/skill-sets");
    } catch (error) {
      console.error("SkillSetDeletePage: Failed to delete skill set:", error);
      setErrors({ delete: error.message || "Failed to delete skill set" });
      window.scrollTo(0, 0);
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

  if (isFetching) {
    return <Loading message="Loading Skill Set for Deletion..." />;
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
    },
    warningSection: {
      backgroundColor: "#fff3cd",
      border: "1px solid #ffeaa7",
      borderRadius: "4px",
      padding: "20px",
      marginBottom: "30px",
    },
    warningTitle: {
      color: "#856404",
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    warningText: {
      color: "#856404",
      lineHeight: "1.5",
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
          {
            label: "Detail",
            path: `/admin/settings/skill-set/${id}/detail`,
            icon: "ℹ️",
          },
          { label: "Delete", icon: "🗑️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.delete && <Alert type="error">{errors.delete}</Alert>}
      {errors.skillSetId && <Alert type="error">{errors.skillSetId}</Alert>}

      {skillSet && (
        <Card title="🗑️ Delete Skill Set">
          {/* Warning Section */}
          <div style={styles.warningSection}>
            <div style={styles.warningTitle}>
              ⚠️ Warning: Permanent Deletion
            </div>
            <div style={styles.warningText}>
              <p>
                You are about to permanently delete this skill set. This action
                cannot be undone.
              </p>
              <p>
                <strong>Important considerations:</strong>
              </p>
              <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                <li>
                  This skill set will be completely removed from the system
                </li>
                <li>
                  Any associates currently assigned to this skill set may be
                  affected
                </li>
                <li>
                  Work orders that reference this skill set may lose this
                  requirement information
                </li>
                <li>
                  Historical records referencing this skill set will still exist
                  but may show as "Deleted"
                </li>
                <li>
                  You will not be able to recover this skill set once deleted
                </li>
              </ul>
              <p>Please ensure you want to proceed with this deletion.</p>
            </div>
          </div>

          {/* Skill Set Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🎓 Skill Set to be Deleted</h2>
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

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Insurance Requirement:</label>
                <div style={styles.detailValue}>
                  {skillSet.insuranceRequirement === 1 && "None"}
                  {skillSet.insuranceRequirement === 2 &&
                    "Commercial General Liability"}
                  {skillSet.insuranceRequirement === 3 && "WSIB"}
                  {skillSet.insuranceRequirement > 3 && "Other"}
                </div>
              </div>

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
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to={`/admin/settings/skill-set/${id}/detail`}>
              <Button variant="secondary">← Cancel</Button>
            </Link>
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/skill-set/${id}/update`}>
                <Button variant="warning">✏️ Edit Instead</Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "🗑️ Confirm and Delete"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!skillSet && !isFetching && (
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
    </div>
  );
}

export default SettingSkillSetDeletePage;

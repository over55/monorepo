// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../components/UI";

function SettingInsuranceRequirementDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [insuranceRequirement, setInsuranceRequirement] = useState(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch insurance requirement details
  const fetchInsuranceRequirementDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await insuranceRequirementManager.getInsuranceRequirementDetail(
          id,
          onUnauthorized,
        );

      setInsuranceRequirement(response);
    } catch (err) {
      console.error("Failed to fetch insurance requirement detail:", err);
      setError(err.message || "Failed to load insurance requirement details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await insuranceRequirementManager.deleteInsuranceRequirement(
        id,
        onUnauthorized,
      );

      // Navigate back to list with success message
      navigate("/admin/settings/insurance-requirements", {
        state: { successMessage: "Insurance requirement deleted successfully" },
      });
    } catch (err) {
      console.error("Failed to delete insurance requirement:", err);
      setError(err.message || "Failed to delete insurance requirement");
      setIsDeleting(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchInsuranceRequirementDetail();
    } else {
      setError("Invalid insurance requirement ID");
      setIsLoading(false);
    }
  }, [id]);

  // Handle URL state (success message from other pages)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("success");
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Insurance Requirements",
      path: "/admin/settings/insurance-requirements",
      icon: "🛡️",
    },
    { label: insuranceRequirement?.name || "Details", icon: "📄" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading insurance requirement details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems.slice(0, -1)} />
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/insurance-requirements")}
          >
            ← Back to Insurance Requirements
          </Button>
        </div>
      </div>
    );
  }

  if (!insuranceRequirement) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems.slice(0, -1)} />
        <Alert type="error">Insurance requirement not found</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/insurance-requirements")}
          >
            ← Back to Insurance Requirements
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
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          🛡️ {insuranceRequirement.name}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/insurance-requirement/${id}/update`)
            }
          >
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Main Details Card */}
      <Card title="Insurance Requirement Details">
        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  fontSize: "18px",
                  color: theme.colors.dark,
                }}
              >
                Basic Information
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Name
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {insuranceRequirement.name}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Description
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                      minHeight: "60px",
                      lineHeight: "1.5",
                    }}
                  >
                    {insuranceRequirement.description ||
                      "No description provided"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  fontSize: "18px",
                  color: theme.colors.dark,
                }}
              >
                System Information
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Created At
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {insuranceRequirement.createdAt || "Not available"}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Created By
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {insuranceRequirement.createdByUserName || "Not available"}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Last Modified
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {insuranceRequirement.modifiedAt || "Not available"}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Modified By
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {insuranceRequirement.modifiedByUserName || "Not available"}
                  </div>
                </div>

                {insuranceRequirement.modifiedFromIpAddress && (
                  <div>
                    <label
                      style={{ ...globalStyles.label, marginBottom: "4px" }}
                    >
                      Modified From IP
                    </label>
                    <div
                      style={{
                        padding: "10px",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {insuranceRequirement.modifiedFromIpAddress}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/insurance-requirements")}
          >
            ← Back to List
          </Button>
          <Button
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/insurance-requirement/${id}/update`)
            }
          >
            ✏️ Edit Insurance Requirement
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete Insurance Requirement
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
        title="Delete Insurance Requirement"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <div>
          <p>Are you sure you want to delete this insurance requirement?</p>
          <div
            style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              margin: "15px 0",
            }}
          >
            <strong>Name:</strong> {insuranceRequirement.name}
            <br />
            {insuranceRequirement.description && (
              <>
                <strong>Description:</strong> {insuranceRequirement.description}
              </>
            )}
          </div>
          <p style={{ color: theme.colors.danger, fontSize: "14px" }}>
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default SettingInsuranceRequirementDetailPage;

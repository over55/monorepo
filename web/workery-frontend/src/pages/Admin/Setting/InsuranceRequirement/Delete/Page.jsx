// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

function SettingInsuranceRequirementDeletePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [insuranceRequirement, setInsuranceRequirement] = useState(null);

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

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

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

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/insurance-requirement/${id}/detail`);
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Insurance Requirements",
      path: "/admin/settings/insurance-requirements",
      icon: "🛡️",
    },
    {
      label: insuranceRequirement?.name || "Loading...",
      path: `/admin/settings/insurance-requirement/${id}/detail`,
      icon: "📄",
    },
    { label: "Delete", icon: "🗑️" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading insurance requirement details..." />
      </div>
    );
  }

  if (error && !insuranceRequirement) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems.slice(0, -2)} />
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
        <Breadcrumb items={breadcrumbItems.slice(0, -2)} />
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
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: theme.colors.danger,
          }}
        >
          🗑️ Delete Insurance Requirement
        </h1>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Warning Card */}
      <Card style={{ borderLeft: `4px solid ${theme.colors.danger}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: "0 0 15px 0",
                color: theme.colors.danger,
                fontSize: "20px",
              }}
            >
              Permanent Deletion Warning
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 15px 0",
              }}
            >
              You are about to permanently delete this insurance requirement.
              This action cannot be undone.
            </p>
            <div
              style={{
                background: "#ffebee",
                border: "1px solid #ffcdd2",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                  color: theme.colors.danger,
                }}
              >
                This will affect:
              </h3>
              <ul
                style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.6" }}
              >
                <li>
                  Any associates or jobs that reference this insurance
                  requirement
                </li>
                <li>
                  Historical records and reports that include this requirement
                </li>
                <li>
                  Any forms or workflows that depend on this insurance type
                </li>
              </ul>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              <strong>Alternative:</strong> Consider updating the requirement
              instead of deleting it to preserve historical data.
            </p>
          </div>
        </div>
      </Card>

      {/* Item Details Card */}
      <Card title="Insurance Requirement to be Deleted">
        <div
          style={{
            background: "#f8f9fa",
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "grid", gap: "15px" }}>
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Name
              </label>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: theme.colors.dark,
                  padding: "8px",
                  background: "white",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                }}
              >
                {insuranceRequirement.name}
              </div>
            </div>

            {insuranceRequirement.description && (
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Description
                </label>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "#495057",
                    padding: "8px",
                    background: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    minHeight: "50px",
                  }}
                >
                  {insuranceRequirement.description}
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Created
                </label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.createdAt || "Not available"}
                </div>
              </div>
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Created By
                </label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.createdByUserName || "Not available"}
                </div>
              </div>
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Last Modified
                </label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.modifiedAt || "Not available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Section */}
      <Card title="Confirm Deletion">
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p
            style={{
              fontSize: "16px",
              marginBottom: "30px",
              lineHeight: "1.5",
            }}
          >
            Type{" "}
            <strong style={{ color: theme.colors.danger }}>
              "{insuranceRequirement.name}"
            </strong>{" "}
            below to confirm deletion:
          </p>

          <div style={{ maxWidth: "400px", margin: "0 auto 30px" }}>
            <input
              type="text"
              placeholder={`Type "${insuranceRequirement.name}" here`}
              style={{
                ...globalStyles.input,
                textAlign: "center",
                fontSize: "16px",
                borderColor: theme.colors.danger,
              }}
              onChange={(e) => {
                const confirmButton =
                  document.getElementById("confirm-delete-btn");
                if (confirmButton) {
                  confirmButton.disabled =
                    e.target.value !== insuranceRequirement.name || isDeleting;
                }
              }}
              disabled={isDeleting}
            />
          </div>

          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-btn"
              variant="danger"
              onClick={handleDelete}
              disabled={true} // Initially disabled until name is typed
              size="lg"
            >
              {isDeleting ? (
                <>
                  <span style={{ marginRight: "8px" }}>Deleting...</span>⏳
                </>
              ) : (
                <>
                  <span style={{ marginRight: "8px" }}>Delete Permanently</span>
                  🗑️
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Show loading overlay when deleting */}
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
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              textAlign: "center",
              border: `3px solid ${theme.colors.danger}`,
            }}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "15px",
                color: theme.colors.danger,
              }}
            >
              🗑️ Deleting Insurance Requirement...
            </div>
            <div
              style={{ fontSize: "16px", color: "#666", marginBottom: "10px" }}
            >
              Please wait while we remove this item from the system.
            </div>
            <div style={{ fontSize: "14px", color: "#999" }}>
              This may take a few moments.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingInsuranceRequirementDeletePage;

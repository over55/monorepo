// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

function SettingInactiveClientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const customerManager = useCustomerManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [inactiveClient, setInactiveClient] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch inactive client details
  const fetchInactiveClientDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await customerManager.getCustomerDetail(
        id,
        onUnauthorized,
      );

      // Verify this is actually an inactive client (status=2)
      if (response.status !== 2) {
        setError("This client is not inactive");
        return;
      }

      setInactiveClient(response);
    } catch (err) {
      console.error("Failed to fetch inactive client detail:", err);
      setError(err.message || "Failed to load inactive client details");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchInactiveClientDetail();
    } else {
      setError("Invalid client ID");
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
      label: "Inactive Clients",
      path: "/admin/settings/inactive-clients",
      icon: "👤❌",
    },
    {
      label: inactiveClient
        ? `${inactiveClient.firstName} ${inactiveClient.lastName}`
        : "Details",
      icon: "📄",
    },
  ];

  // Format deactivation reason for display
  const getDeactivationReasonText = (reason, reasonOther) => {
    const reasonMap = {
      1: reasonOther || "Other",
      2: "Blacklisted",
      3: "Moved",
      4: "Deceased",
      5: "Do not contact",
      6: "Duplicate",
      7: "Other",
    };
    return reasonMap[reason] || "Not specified";
  };

  // Format gender for display
  const getGenderText = (gender, genderOther) => {
    const genderMap = {
      1: genderOther || "Other",
      2: "Male",
      3: "Female",
      4: "Prefer not to say",
    };
    return genderMap[gender] || "Not specified";
  };

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading inactive client details..." />
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
            onClick={() => navigate("/admin/settings/inactive-clients")}
          >
            ← Back to Inactive Clients
          </Button>
        </div>
      </div>
    );
  }

  if (!inactiveClient) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems.slice(0, -1)} />
        <Alert type="error">Inactive client not found</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/inactive-clients")}
          >
            ← Back to Inactive Clients
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
          👤❌ {inactiveClient.firstName} {inactiveClient.lastName}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/inactive-client/${id}/update`)
            }
          >
            ✏️ Edit Status
          </Button>
          <Button
            variant="info"
            onClick={() => navigate(`/admin/client/${id}`)}
          >
            👁️ View Full Profile
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

      {/* Status Alert */}
      <Alert type="warning">
        <strong>⚠️ Inactive Client:</strong> This client has been archived and
        is no longer active in the system.
      </Alert>

      {/* Basic Information Card */}
      <Card title="Basic Information">
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
                Personal Details
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    First Name
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
                    {inactiveClient.firstName || "—"}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Last Name
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
                    {inactiveClient.lastName || "—"}
                  </div>
                </div>

                {inactiveClient.birthDate && (
                  <div>
                    <label
                      style={{ ...globalStyles.label, marginBottom: "4px" }}
                    >
                      Date of Birth
                    </label>
                    <div
                      style={{
                        padding: "10px",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {new Date(inactiveClient.birthDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {inactiveClient.gender && (
                  <div>
                    <label
                      style={{ ...globalStyles.label, marginBottom: "4px" }}
                    >
                      Gender
                    </label>
                    <div
                      style={{
                        padding: "10px",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {getGenderText(
                        inactiveClient.gender,
                        inactiveClient.genderOther,
                      )}
                    </div>
                  </div>
                )}
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
                Contact Information
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Email
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {inactiveClient.email || "—"}
                  </div>
                </div>

                <div>
                  <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                    Phone
                  </label>
                  <div
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    {inactiveClient.phone || "—"}
                  </div>
                </div>

                {inactiveClient.joinDate && (
                  <div>
                    <label
                      style={{ ...globalStyles.label, marginBottom: "4px" }}
                    >
                      Join Date
                    </label>
                    <div
                      style={{
                        padding: "10px",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {new Date(inactiveClient.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Deactivation Information Card */}
      <Card
        title="Deactivation Information"
        style={{ borderLeft: `4px solid ${theme.colors.warning}` }}
      >
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
              Status
            </label>
            <div
              style={{
                padding: "10px",
                background: "#fff3cd",
                borderRadius: "4px",
                color: "#856404",
                fontWeight: "600",
              }}
            >
              🚫 Inactive (Archived)
            </div>
          </div>

          <div>
            <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
              Deactivation Reason
            </label>
            <div
              style={{
                padding: "10px",
                background: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              {getDeactivationReasonText(
                inactiveClient.deactivationReason,
                inactiveClient.deactivationReasonOther,
              )}
            </div>
          </div>

          {inactiveClient.description && (
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
                {inactiveClient.description}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* System Information Card */}
      <Card title="System Information">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
          }}
        >
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
              {inactiveClient.createdAt || "Not available"}
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
              {inactiveClient.createdByUserName || "Not available"}
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
              {inactiveClient.modifiedAt || "Not available"}
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
              {inactiveClient.modifiedByUserName || "Not available"}
            </div>
          </div>

          {inactiveClient.modifiedFromIpAddress && (
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                Modified From IP
              </label>
              <div
                style={{
                  padding: "10px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                {inactiveClient.modifiedFromIpAddress}
              </div>
            </div>
          )}

          {inactiveClient.createdFromIpAddress && (
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "4px" }}>
                Created From IP
              </label>
              <div
                style={{
                  padding: "10px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                {inactiveClient.createdFromIpAddress}
              </div>
            </div>
          )}
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
            onClick={() => navigate("/admin/settings/inactive-clients")}
          >
            ← Back to Inactive Clients
          </Button>
          <Button
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/inactive-client/${id}/update`)
            }
          >
            ✏️ Edit Status & Reason
          </Button>
          <Button
            variant="info"
            onClick={() => navigate(`/admin/client/${id}`)}
          >
            👁️ View Full Client Profile
          </Button>
          <Button
            variant="success"
            onClick={() => navigate(`/admin/client/${id}/edit`)}
          >
            ♻️ Reactivate Client
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingInactiveClientDetailPage;

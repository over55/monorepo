// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
} from "../../../../../components/UI";

function SettingServiceFeeDeletePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Component state
  const [serviceFee, setServiceFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchServiceFeeDetail = async () => {
    if (!id) {
      setError("Service fee ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceFeeManager.getServiceFeeDetail(
        id,
        onUnauthorized,
      );
      setServiceFee(response);
    } catch (err) {
      console.error("Failed to fetch service fee detail:", err);
      setError(err.message || "Failed to load service fee details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceFeeDetail();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await serviceFeeManager.deleteServiceFee(id, onUnauthorized);

      // Success - redirect to list page
      navigate("/admin/settings/service-fees", {
        state: {
          message: `Service fee "${serviceFee.name}" has been deleted successfully.`,
        },
      });
    } catch (err) {
      console.error("Failed to delete service fee:", err);
      setError(err.message || "Failed to delete service fee");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/settings/service-fee/${id}/detail`);
  };

  const isConfirmationValid = () => {
    return confirmationText.toLowerCase() === "delete";
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Service Fees", path: "/admin/settings/service-fees", icon: "💳" },
    {
      label: serviceFee?.name || "Delete",
      path: `/admin/settings/service-fee/${id}/detail`,
      icon: "🔍",
    },
    { label: "Delete", icon: "🗑️" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  };

  const getRateDisplay = () => {
    if (!serviceFee) return "Unknown";

    if (serviceFee.percentage && serviceFee.percentage > 0) {
      return `${serviceFee.percentage}% (Percentage-based)`;
    }
    if (serviceFee.amount && serviceFee.amount > 0) {
      return `${formatCurrency(serviceFee.amount)} (Fixed amount)`;
    }
    return "No rate set";
  };

  const getStatusDisplay = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading service fee details..." />
      </div>
    );
  }

  if (error && !serviceFee) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">
          {error}
          <div style={{ marginTop: "15px" }}>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/settings/service-fees")}
            >
              ← Back to Service Fees
            </Button>
          </div>
        </Alert>
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
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              fontWeight: "bold",
              color: theme.colors.danger,
            }}
          >
            🗑️ Delete Service Fee
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Permanently remove "{serviceFee?.name}" from the system
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
          ← Back to Details
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Warning Alert */}
      <Alert type="error">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ fontSize: "24px" }}>⚠️</div>
          <div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              Warning: This action cannot be undone
            </h3>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              Deleting this service fee will permanently remove it from the
              system. This action is irreversible and may affect historical data
              and reports. Please ensure you want to proceed before confirming
              the deletion.
            </p>
          </div>
        </div>
      </Alert>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Service Fee Details to be Deleted */}
        <Card title="📋 Service Fee Details">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Name
              </label>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                {serviceFee?.name || "Not specified"}
              </div>
            </div>

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Description
              </label>
              <div
                style={{ fontSize: "14px", lineHeight: "1.5", color: "#555" }}
              >
                {serviceFee?.description || "No description provided"}
              </div>
            </div>

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Rate
              </label>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: theme.colors.primary,
                }}
              >
                {getRateDisplay()}
              </div>
            </div>

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Status
              </label>
              <div>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor:
                      serviceFee?.status === 1
                        ? theme.colors.success
                        : theme.colors.secondary,
                  }}
                >
                  {getStatusDisplay(serviceFee?.status)}
                </span>
              </div>
            </div>

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Created
              </label>
              <div style={{ fontSize: "14px" }}>
                {formatDate(serviceFee?.createdAt)}
              </div>
            </div>
          </div>
        </Card>

        {/* Deletion Consequences */}
        <Card title="🚨 Deletion Impact">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.errorBg,
                borderRadius: "4px",
                border: `1px solid ${theme.colors.danger}`,
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                What will happen when you delete this service fee:
              </h4>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "20px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                <li>
                  The service fee will be permanently removed from the system
                </li>
                <li>
                  Historical references to this service fee may become invalid
                </li>
                <li>Related reports and calculations may be affected</li>
                <li>This action cannot be reversed or undone</li>
                <li>
                  You will need to recreate the service fee if needed again
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.warningBg,
                borderRadius: "4px",
                border: `1px solid ${theme.colors.warning}`,
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                💡 Alternative Options:
              </h4>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "20px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                <li>
                  <strong>Set to Inactive:</strong> Instead of deleting, you can
                  set the status to "Inactive" to preserve historical data
                </li>
                <li>
                  <strong>Edit Instead:</strong> Modify the service fee details
                  if you need to update information
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`/admin/settings/service-fee/${id}/update`)
                }
                disabled={isDeleting}
                size="sm"
              >
                ✏️ Edit Instead
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Section */}
      <Card title="✅ Confirm Deletion">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              To confirm the deletion of this service fee, please type{" "}
              <code
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontWeight: "bold",
                  color: theme.colors.danger,
                }}
              >
                delete
              </code>{" "}
              in the field below:
            </p>

            <Input
              label="Confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              disabled={isDeleting}
              style={{
                borderColor:
                  confirmationText && !isConfirmationValid()
                    ? theme.colors.danger
                    : undefined,
              }}
            />

            {confirmationText && !isConfirmationValid() && (
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.danger,
                  marginTop: "5px",
                }}
              >
                Please type "delete" exactly to confirm
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
                🎯 Final Confirmation
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {isConfirmationValid()
                  ? "Ready to delete - this action cannot be undone"
                  : "Enter confirmation text to enable deletion"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!isConfirmationValid() || isDeleting}
              >
                {isDeleting ? "Deleting..." : "🗑️ Delete Service Fee"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
            zIndex: 2000,
          }}
        >
          <Card style={{ minWidth: "300px", textAlign: "center" }}>
            <Loading message="Deleting service fee..." />
            <div style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
              Please wait while we permanently remove this service fee...
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingServiceFeeDeletePage;

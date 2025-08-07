// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Detail/Page.jsx

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
  Modal,
} from "../../../../../components/UI";

function SettingServiceFeeDetailPage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Component state
  const [serviceFee, setServiceFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setSuccess("Service fee deleted successfully");
      setTimeout(() => {
        navigate("/admin/settings/service-fees");
      }, 2000);
    } catch (err) {
      console.error("Failed to delete service fee:", err);
      setError(err.message || "Failed to delete service fee");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Service Fees", path: "/admin/settings/service-fees", icon: "💳" },
    { label: serviceFee?.name || "Detail", icon: "🔍" },
  ];

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

  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: isActive
            ? theme.colors.success
            : theme.colors.secondary,
        }}
      >
        {isActive ? "✓ Active" : "○ Inactive"}
      </span>
    );
  };

  const getRateDisplay = () => {
    if (serviceFee.percentage && serviceFee.percentage > 0) {
      return `${serviceFee.percentage}% (Percentage-based)`;
    }
    if (serviceFee.amount && serviceFee.amount > 0) {
      return `${formatCurrency(serviceFee.amount)} (Fixed amount)`;
    }
    return "No rate set";
  };

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
            }}
          >
            💳 Service Fee Details
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            {serviceFee?.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/service-fees")}
          >
            ← Back to List
          </Button>
          <Button
            variant="info"
            onClick={() => navigate(`/admin/settings/service-fee/${id}/update`)}
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

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Basic Information */}
        <Card title="📋 Basic Information">
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
                Status
              </label>
              <div>{getStatusBadge(serviceFee?.status)}</div>
            </div>
          </div>
        </Card>

        {/* Rate Information */}
        <Card title="💰 Rate Information">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Rate
              </label>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: theme.colors.primary,
                }}
              >
                {getRateDisplay()}
              </div>
            </div>

            {serviceFee?.percentage && serviceFee.percentage > 0 && (
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Percentage
                </label>
                <div style={{ fontSize: "16px" }}>{serviceFee.percentage}%</div>
              </div>
            )}

            {serviceFee?.amount && serviceFee.amount > 0 && (
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Fixed Amount
                </label>
                <div style={{ fontSize: "16px" }}>
                  {formatCurrency(serviceFee.amount)}
                </div>
              </div>
            )}

            <div
              style={{
                padding: "10px",
                backgroundColor: theme.colors.infoBg,
                borderRadius: "4px",
                fontSize: "12px",
                color: "#0c5460",
              }}
            >
              <strong>Note:</strong> Service fees can be either percentage-based
              or fixed amount, but not both simultaneously.
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card title="🔧 System Information">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Service Fee ID
              </label>
              <div
                style={{
                  fontSize: "14px",
                  fontFamily: "monospace",
                  backgroundColor: "#f5f5f5",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {serviceFee?.id}
              </div>
            </div>

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Created At
              </label>
              <div style={{ fontSize: "14px" }}>
                {formatDate(serviceFee?.createdAt)}
              </div>
            </div>

            {serviceFee?.createdByUserName && (
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Created By
                </label>
                <div style={{ fontSize: "14px" }}>
                  {serviceFee.createdByUserName}
                </div>
              </div>
            )}

            <div>
              <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                Last Modified
              </label>
              <div style={{ fontSize: "14px" }}>
                {formatDate(serviceFee?.modifiedAt) || "Never"}
              </div>
            </div>

            {serviceFee?.modifiedByUserName && (
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Modified By
                </label>
                <div style={{ fontSize: "14px" }}>
                  {serviceFee.modifiedByUserName}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Actions Section */}
      <Card style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>⚡ Quick Actions</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Manage this service fee
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
              variant="info"
              onClick={() =>
                navigate(`/admin/settings/service-fee/${id}/update`)
              }
            >
              ✏️ Edit Service Fee
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              🗑️ Delete Service Fee
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="🗑️ Delete Service Fee"
        footer={
          <>
            <Button
              variant="outline"
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
              {isDeleting ? "Deleting..." : "Delete Service Fee"}
            </Button>
          </>
        }
      >
        <div>
          <p>
            Are you sure you want to delete the service fee{" "}
            <strong>"{serviceFee?.name}"</strong>?
          </p>
          <div
            style={{
              padding: "15px",
              backgroundColor: theme.colors.errorBg,
              borderRadius: "4px",
              marginTop: "15px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: theme.colors.error,
              }}
            >
              <strong>⚠️ Warning:</strong> This action cannot be undone. The
              service fee will be permanently removed from the system.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingServiceFeeDetailPage;

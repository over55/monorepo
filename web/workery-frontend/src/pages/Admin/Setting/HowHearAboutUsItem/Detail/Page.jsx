// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

function SettingHowHearAboutUsItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Component state
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await howHearAboutUsItemManager.getDetail(
        id,
        onUnauthorized,
        true, // Force refresh
      );

      setData(result);
    } catch (err) {
      console.error("Failed to fetch How Hear About Us Item:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (data?.text === "Other") {
      setError("Cannot delete the 'Other' item as it is locked.");
      setShowDeleteConfirm(false);
      return;
    }

    try {
      await howHearAboutUsItemManager.delete(id, onUnauthorized);
      setSuccessMessage("How Hear About Us Item deleted successfully");
      setTimeout(() => {
        navigate("/admin/settings/how-hear-about-us-items");
      }, 2000);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError(err.message || "Failed to delete item");
      setShowDeleteConfirm(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if item ID is valid
  if (!id) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">Invalid item ID</Alert>
        <Link to="/admin/settings/how-hear-about-us-items">
          ← Back to How Hear About Us Items
        </Link>
      </div>
    );
  }

  const renderDeleteConfirmation = () => (
    <Card
      title="⚠️ Confirm Deletion"
      style={{
        marginBottom: "20px",
        border: `2px solid ${theme.colors.danger}`,
      }}
    >
      <p style={{ marginBottom: "20px" }}>
        Are you sure you want to delete "{data?.text}"? This action cannot be
        undone and will permanently remove this item from the system.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button variant="danger" onClick={handleDelete}>
          🗑️ Yes, Delete Permanently
        </Button>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: isActive
            ? theme.colors.successBg
            : theme.colors.errorBg,
          color: isActive ? theme.colors.success : theme.colors.error,
        }}
      >
        {isActive ? "✅ Active" : "❌ Inactive"}
      </span>
    );
  };

  const getRolesBadges = (item) => {
    const roles = [];
    if (item?.isForAssociate) roles.push("Associate");
    if (item?.isForCustomer) roles.push("Customer");
    if (item?.isForStaff) roles.push("Staff");

    if (roles.length === 0) {
      return (
        <span style={{ color: theme.colors.secondary }}>No roles assigned</span>
      );
    }

    return (
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {roles.map((role) => (
          <span
            key={role}
            style={{
              padding: "2px 8px",
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: theme.colors.infoBg,
              color: theme.colors.info,
            }}
          >
            {role}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          {
            path: "/admin/settings/how-hear-about-us-items",
            label: "How Hear About Us Items",
            icon: "📞",
          },
          { label: data?.text || "Item Detail", icon: "👁️" },
        ]}
      />

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: theme.colors.dark }}>
            👁️ Item Detail
          </h1>
          {data && (
            <p style={{ margin: "8px 0 0 0", color: theme.colors.secondary }}>
              Details for "{data.text}"
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {data && data.text !== "Other" && (
            <>
              <Button
                variant="warning"
                onClick={() =>
                  navigate(
                    `/admin/settings/how-hear-about-us-item/${id}/update`,
                  )
                }
              >
                ✏️ Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/how-hear-about-us-items")}
          >
            📋 Back to List
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && renderDeleteConfirmation()}

      {/* Main Content */}
      {isLoading ? (
        <Loading message="Loading item details..." />
      ) : data ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Basic Information */}
          <Card title="📋 Basic Information">
            <div style={{ display: "grid", gap: "15px" }}>
              <div>
                <label style={globalStyles.label}>Sort Number:</label>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
                  {data.sortNumber ?? "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Text:</label>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
                  {data.text || "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Status:</label>
                <div style={{ marginTop: "5px" }}>
                  {getStatusBadge(data.status)}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Assigned Roles:</label>
                <div style={{ marginTop: "5px" }}>{getRolesBadges(data)}</div>
              </div>
              {data.text === "Other" && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: theme.colors.warningBg,
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.warning}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#856404",
                      fontWeight: "500",
                    }}
                  >
                    🔒 This is a system-protected item and cannot be edited or
                    deleted.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Role Details */}
          <Card title="👥 Role Configuration">
            <div style={{ display: "grid", gap: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  backgroundColor: data.isForAssociate
                    ? theme.colors.successBg
                    : theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontWeight: "500" }}>For Associates:</span>
                <span
                  style={{
                    color: data.isForAssociate
                      ? theme.colors.success
                      : theme.colors.secondary,
                  }}
                >
                  {data.isForAssociate ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  backgroundColor: data.isForCustomer
                    ? theme.colors.successBg
                    : theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontWeight: "500" }}>For Customers:</span>
                <span
                  style={{
                    color: data.isForCustomer
                      ? theme.colors.success
                      : theme.colors.secondary,
                  }}
                >
                  {data.isForCustomer ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  backgroundColor: data.isForStaff
                    ? theme.colors.successBg
                    : theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontWeight: "500" }}>For Staff:</span>
                <span
                  style={{
                    color: data.isForStaff
                      ? theme.colors.success
                      : theme.colors.secondary,
                  }}
                >
                  {data.isForStaff ? "✅ Yes" : "❌ No"}
                </span>
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card title="🔧 System Information" style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label style={globalStyles.label}>Created At:</label>
                <p style={{ margin: 0 }}>{formatDate(data.createdAt)}</p>
              </div>
              <div>
                <label style={globalStyles.label}>Created By:</label>
                <p style={{ margin: 0 }}>{data.createdByUserName || "N/A"}</p>
              </div>
              <div>
                <label style={globalStyles.label}>Modified At:</label>
                <p style={{ margin: 0 }}>{formatDate(data.modifiedAt)}</p>
              </div>
              <div>
                <label style={globalStyles.label}>Modified By:</label>
                <p style={{ margin: 0 }}>{data.modifiedByUserName || "N/A"}</p>
              </div>
              <div>
                <label style={globalStyles.label}>Created From IP:</label>
                <p style={{ margin: 0 }}>
                  {data.createdFromIpAddress || "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Modified From IP:</label>
                <p style={{ margin: 0 }}>
                  {data.modifiedFromIpAddress || "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>❌ Item Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "20px" }}>
              The requested How Hear About Us Item could not be found.
            </p>
            <Button
              onClick={() =>
                navigate("/admin/settings/how-hear-about-us-items")
              }
            >
              📋 Back to Items List
            </Button>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to="/admin/settings/how-hear-about-us-items"
          style={{
            textDecoration: "none",
            color: theme.colors.primary,
            fontSize: "16px",
          }}
        >
          ← Back to How Hear About Us Items
        </Link>
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemDetailPage;

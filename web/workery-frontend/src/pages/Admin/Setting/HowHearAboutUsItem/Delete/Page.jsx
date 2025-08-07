// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Delete/Page.jsx

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

function SettingHowHearAboutUsItemDeletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Component state
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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

      // Check if item is locked (Other)
      if (result.text === "Other") {
        setError("This item is system-protected and cannot be deleted.");
        setTimeout(() => {
          navigate(`/admin/settings/how-hear-about-us-item/${id}/detail`);
        }, 3000);
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Failed to fetch How Hear About Us Item:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      await howHearAboutUsItemManager.delete(id, onUnauthorized);

      setSuccessMessage("How Hear About Us Item deleted successfully");
      setTimeout(() => {
        navigate("/admin/settings/how-hear-about-us-items");
      }, 2000);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError(err.message || "Failed to delete item");
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/how-hear-about-us-item/${id}/detail`);
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

  const getRolesList = (item) => {
    const roles = [];
    if (item?.isForAssociate) roles.push("Associate");
    if (item?.isForCustomer) roles.push("Customer");
    if (item?.isForStaff) roles.push("Staff");
    return roles.length > 0 ? roles.join(", ") : "None";
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
          {
            path: `/admin/settings/how-hear-about-us-item/${id}/detail`,
            label: data?.text || "Item Detail",
            icon: "👁️",
          },
          { label: "Delete", icon: "🗑️" },
        ]}
      />

      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: theme.colors.danger }}>
          🗑️ Delete How Hear About Us Item
        </h1>
        {data && (
          <p style={{ margin: "8px 0 0 0", color: theme.colors.secondary }}>
            You are about to permanently delete "{data.text}"
          </p>
        )}
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
          {/* Warning Card */}
          <Card
            title="⚠️ Deletion Warning"
            style={{
              gridColumn: "1 / -1",
              border: `2px solid ${theme.colors.danger}`,
              backgroundColor: theme.colors.errorBg,
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: theme.colors.danger, margin: "0 0 10px 0" }}>
                This action cannot be undone!
              </h3>
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                Deleting this "How Hear About Us" item will permanently remove
                it from the system. This may affect:
              </p>
              <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                <li>Forms where this option is displayed to users</li>
                <li>Historical records that reference this option</li>
                <li>Reports and analytics that include this data</li>
              </ul>
              <p style={{ margin: "15px 0 0 0", fontWeight: "500" }}>
                Please confirm that you want to proceed with the deletion.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{ minWidth: "180px" }}
              >
                {isDeleting ? (
                  <>
                    <span style={{ marginRight: "8px" }}>⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: "8px" }}>🗑️</span>
                    Yes, Delete Permanently
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isDeleting}
                style={{ minWidth: "120px" }}
              >
                Cancel
              </Button>
            </div>
          </Card>

          {/* Item Details */}
          <Card title="📋 Item to be Deleted">
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
                <label style={globalStyles.label}>Available for Roles:</label>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {getRolesList(data)}
                </p>
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card title="🔧 System Information">
            <div style={{ display: "grid", gap: "15px" }}>
              <div>
                <label style={globalStyles.label}>Created At:</label>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Created By:</label>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {data.createdByUserName || "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Modified At:</label>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {data.modifiedAt
                    ? new Date(data.modifiedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label style={globalStyles.label}>Modified By:</label>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {data.modifiedByUserName || "N/A"}
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

      {/* Loading Overlay */}
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
          <Loading message="Deleting How Hear About Us Item..." />
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to={`/admin/settings/how-hear-about-us-item/${id}/detail`}
          style={{
            textDecoration: "none",
            color: theme.colors.primary,
            fontSize: "16px",
          }}
        >
          ← Back to Item Detail
        </Link>
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemDeletePage;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useAuthManager,
  useAccountManager,
} from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";

// Order Status Constants
const OrderStatusNew = 1;
const OrderStatusDeclined = 2;
const OrderStatusPending = 3;
const OrderStatusCancelled = 4;
const OrderStatusOngoing = 5;
const OrderStatusInProgress = 6;
const OrderStatusCompletedButUnpaid = 7;
const OrderStatusCompletedAndPaid = 8;
const OrderStatusArchived = 9;

function AdminOrderDetailMorePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrder = async () => {
    if (!oid) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const profile = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(profile);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      setCurrentUser(null);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
    fetchCurrentUser();
  }, [oid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid} (More)`, icon: "⋯" },
  ];

  // Simple action card component
  const ActionCard = ({ title, subtitle, icon, url, bgColor, showNew }) => (
    <div
      style={{
        backgroundColor: bgColor || theme.colors.primary,
        color: "white",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={() => navigate(url)}
    >
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>{icon}</div>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
        {title}
        {showNew && (
          <span
            style={{
              backgroundColor: theme.colors.success,
              color: "white",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "11px",
              marginLeft: "8px",
            }}
          >
            NEW
          </span>
        )}
      </h3>
      <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>{subtitle}</p>
    </div>
  );

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading order details..." />
      </div>
    );
  }

  // Check if current user has delete permission (Executive or Management role)
  const canDelete =
    currentUser &&
    (currentUser.role === EXECUTIVE_ROLE_ID ||
      currentUser.role === MANAGEMENT_ROLE_ID ||
      currentUser.roleId === EXECUTIVE_ROLE_ID ||
      currentUser.roleId === MANAGEMENT_ROLE_ID);

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🔧 Order</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === OrderStatusArchived && (
        <Alert type="info">📁 This order is archived</Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {order && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>⋯ More</h3>
            </div>

            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                marginBottom: "30px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={`/admin/order/${order.wjid}`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Summary
              </Link>
              <Link
                to={`/admin/order/${order.wjid}/full`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Detail
              </Link>
              <Link
                to={`/admin/order/${order.wjid}/activity-sheets`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Activity Sheets
              </Link>
              <Link
                to={`/admin/order/${order.wjid}/tasks`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Tasks
              </Link>
              <Link
                to={`/admin/order/${order.wjid}/comments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/order/${order.wjid}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                More ⋯
              </div>
            </div>

            {/* Action Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {/* Unassign - Only show if associate is assigned */}
              {order.associatePublicId !== 0 &&
                order.associateId &&
                order.associateId !== "" &&
                order.associateId !== "000000000000000000000000" && (
                  <ActionCard
                    title="Unassign"
                    subtitle="Remove the current associate from this job."
                    icon="👤❌"
                    url={`/admin/order/${oid}/more/unassign`}
                    bgColor={theme.colors.danger}
                  />
                )}

              {/* Close Job */}
              <ActionCard
                title="Close Job"
                subtitle="Close this job for the time being."
                icon="❌"
                url={`/admin/order/${oid}/more/close`}
                bgColor={theme.colors.success}
              />

              {/* Postpone Job */}
              <ActionCard
                title="Postpone Job"
                subtitle="Postpone this job for a certain amount of time."
                icon="⏰"
                url={`/admin/order/${oid}/more/postpone`}
                bgColor={theme.colors.info}
              />

              {/* Transfer Job */}
              <ActionCard
                title="Transfer Job"
                subtitle="Transfer this job to client or associate."
                icon="🔄"
                url={`/admin/order/${oid}/more/transfer/step-1`}
                bgColor={theme.colors.primary}
              />

              {/* Delete Job - Only show for Executive or Management roles */}
              {canDelete && (
                <ActionCard
                  title="Delete Job"
                  subtitle="Permanently delete this job from the system."
                  icon="🗑️"
                  url={`/admin/order/${oid}/more/delete`}
                  bgColor={theme.colors.dark}
                />
              )}

              {/* Incidents */}
              <ActionCard
                title="Incidents"
                subtitle="View or open any incidents with this order."
                icon="🔥"
                url={`/admin/order/${oid}/more/incidents`}
                bgColor={theme.colors.warning}
                showNew={true}
              />
            </div>

            {/* Back Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginTop: "30px",
              }}
            >
              <Link to="/admin/orders">
                <Button variant="outline">← Back to Orders</Button>
              </Link>
            </div>
          </>
        )}

        {!order && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Order Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/orders">
              <Button variant="primary">← Back to Orders</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailMorePage;

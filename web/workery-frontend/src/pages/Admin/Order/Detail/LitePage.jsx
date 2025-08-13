// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";

// Constants
const CLIENT_PHONE_TYPE_WORK = 1;
const ASSOCIATE_PHONE_TYPE_WORK = 1;
const ORDER_STATUS_COMPLETED_BUT_UNPAID = 4;
const ORDER_STATUS_COMPLETED_AND_PAID = 5;
const STAFF_TYPE_MANAGEMENT = 2;
const STAFF_TYPE_EXECUTIVE = 1;

function AdminOrderDetailLitePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      // This would typically come from the account manager
      // For now, we'll use a mock user or get it from auth manager
      setCurrentUser({ role: STAFF_TYPE_MANAGEMENT }); // Mock user
    } catch (err) {
      console.error("Failed to fetch current user:", err);
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
    { label: "Detail", icon: "ℹ️" },
  ];

  // Format phone number for display
  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  // Format tags for display
  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return "-";
    return tags.map((tag) => tag.text || tag.name || tag).join(", ");
  };

  // Format skill sets for display
  const formatSkillSets = (skillSets) => {
    if (!skillSets || skillSets.length === 0) return "-";
    return skillSets
      .map((skill) => skill.subCategory || skill.name || skill)
      .join(", ");
  };

  // Format address for display
  const formatAddress = (order) => {
    if (!order) return "-";
    const address =
      order.customerFullAddressWithoutPostalCode ||
      `${order.customerAddressLine1 || ""} ${order.customerCity || ""} ${order.customerRegion || ""}`.trim();

    if (order.customerFullAddressUrl) {
      return (
        <a
          href={order.customerFullAddressUrl}
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.colors.primary }}
        >
          {address} 🔗
        </a>
      );
    }
    return address || "-";
  };

  // Get order status text
  const getOrderStatusText = (status) => {
    const statusMap = {
      1: "New",
      2: "Assigned",
      3: "In Progress",
      4: "Completed (Unpaid)",
      5: "Completed (Paid)",
      6: "Cancelled",
      7: "Archived",
    };
    return statusMap[status] || "Unknown";
  };

  // Get order type text
  const getOrderTypeText = (type) => {
    const typeMap = {
      1: "🏠 Residential",
      2: "🏢 Commercial",
    };
    return typeMap[type] || "Unknown";
  };

  // Phone type mappings
  const CLIENT_PHONE_TYPE_OF_MAP = {
    1: "Work",
    2: "Home",
    3: "Mobile",
  };

  const ASSOCIATE_PHONE_TYPE_OF_MAP = {
    1: "Work",
    2: "Home",
    3: "Mobile",
  };

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading order details..." />
      </div>
    );
  }

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
      {order && order.status === 2 && (
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
        {/* Header with Actions */}
        {order && (
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
            <h3 style={{ margin: 0 }}>📋 Summary</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {order.associatePublicId !== 0 && (
                <Link to={`/admin/order/${oid}/more/unassign`}>
                  <Button variant="secondary" disabled={order.status === 2}>
                    👤❌ Unassign
                  </Button>
                </Link>
              )}
              <Link to={`/admin/order/${oid}/more/close`}>
                <Button variant="danger" disabled={order.status === 2}>
                  ❌ Close
                </Button>
              </Link>
              <Link to={`/admin/order/${oid}/edit`}>
                <Button variant="warning" disabled={order.status === 2}>
                  ✏️ Edit
                </Button>
              </Link>
              {order.latestPendingTaskId &&
                order.latestPendingTaskId !== "000000000000000000000000" && (
                  <Link to={`/admin/task/${order.latestPendingTaskId}`}>
                    <Button variant="primary" disabled={order.status === 2}>
                      Go to Task →
                    </Button>
                  </Link>
                )}
              {(order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID ||
                order.status === ORDER_STATUS_COMPLETED_AND_PAID) &&
                (currentUser?.role === STAFF_TYPE_MANAGEMENT ||
                  currentUser?.role === STAFF_TYPE_EXECUTIVE) && (
                  <Link to={`/admin/financial/${oid}`}>
                    <Button variant="info" disabled={order.status === 2}>
                      Go to Financials →
                    </Button>
                  </Link>
                )}
            </div>
          </div>
        )}

        {order && (
          <>
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
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Summary
              </div>
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
              <Link
                to={`/admin/order/${order.wjid}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {/* Order Summary Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ backgroundColor: theme.colors.dark, color: "white" }}
                >
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                    colSpan="2"
                  >
                    Job #{order.wjid} - Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Client:
                  </th>
                  <td style={{ padding: "12px" }}>
                    <Link
                      to={`/admin/customer/${order.customerId}`}
                      style={{
                        color: theme.colors.primary,
                        textDecoration: "none",
                      }}
                    >
                      {order.customerName} 🔗
                    </Link>
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Client Phone Number (
                    {CLIENT_PHONE_TYPE_OF_MAP[order.customerPhoneType]}):
                  </th>
                  <td style={{ padding: "12px" }}>
                    {order.customerPhone ? (
                      <a
                        href={`tel:${order.customerPhone}`}
                        style={{ color: theme.colors.primary }}
                      >
                        {formatPhone(
                          order.customerPhone,
                          order.customerPhoneType === CLIENT_PHONE_TYPE_WORK
                            ? order.customerPhoneExtension
                            : null,
                        )}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Client Address:
                  </th>
                  <td style={{ padding: "12px" }}>{formatAddress(order)}</td>
                </tr>

                {/* Associate Information (if assigned) */}
                {order.associateId &&
                  order.associateId !== "" &&
                  order.associateId !== "000000000000000000000000" && (
                    <>
                      <tr>
                        <th
                          style={{
                            backgroundColor: theme.colors.light,
                            padding: "12px",
                            width: "30%",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Associate:
                        </th>
                        <td style={{ padding: "12px" }}>
                          <Link
                            to={`/admin/associate/${order.associateId}`}
                            style={{
                              color: theme.colors.primary,
                              textDecoration: "none",
                            }}
                          >
                            {order.associateName} 🔗
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <th
                          style={{
                            backgroundColor: theme.colors.light,
                            padding: "12px",
                            width: "30%",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Associate Phone Number (
                          {
                            ASSOCIATE_PHONE_TYPE_OF_MAP[
                              order.associatePhoneType
                            ]
                          }
                          ):
                        </th>
                        <td style={{ padding: "12px" }}>
                          {order.associatePhone ? (
                            <a
                              href={`tel:${order.associatePhone}`}
                              style={{ color: theme.colors.primary }}
                            >
                              {formatPhone(
                                order.associatePhone,
                                order.associatePhoneType ===
                                  ASSOCIATE_PHONE_TYPE_WORK
                                  ? order.associatePhoneExtension
                                  : null,
                              )}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    </>
                  )}

                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Status:
                  </th>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        color:
                          order.status === 1
                            ? theme.colors.success
                            : theme.colors.secondary,
                        fontWeight: "600",
                      }}
                    >
                      {getOrderStatusText(order.status)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Job Type:
                  </th>
                  <td style={{ padding: "12px" }}>
                    {getOrderTypeText(order.type)}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Description:
                  </th>
                  <td style={{ padding: "12px" }}>
                    {order.description || "-"}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Skill(s) Required:
                  </th>
                  <td style={{ padding: "12px" }}>
                    {formatSkillSets(order.skillSets)}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Tag(s):
                  </th>
                  <td style={{ padding: "12px" }}>{formatTags(order.tags)}</td>
                </tr>
                <tr>
                  <th
                    style={{
                      backgroundColor: theme.colors.light,
                      padding: "12px",
                      width: "30%",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Required Task:
                  </th>
                  <td style={{ padding: "12px" }}>
                    {order.latestPendingTaskId &&
                    order.latestPendingTaskId !== "000000000000000000000000" ? (
                      <Link to={`/admin/task/${order.latestPendingTaskId}`}>
                        <Button variant="primary" size="sm">
                          {order.latestPendingTaskTitle} →
                        </Button>
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to="/admin/orders">
                <Button variant="outline">← Back to Orders</Button>
              </Link>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {order.associatePublicId !== 0 && (
                  <Link to={`/admin/order/${oid}/more/unassign`}>
                    <Button variant="secondary" disabled={order.status === 2}>
                      👤❌ Unassign
                    </Button>
                  </Link>
                )}
                <Link to={`/admin/order/${oid}/more/close`}>
                  <Button variant="danger" disabled={order.status === 2}>
                    ❌ Close
                  </Button>
                </Link>
                <Link to={`/admin/order/${oid}/edit`}>
                  <Button variant="warning" disabled={order.status === 2}>
                    ✏️ Edit
                  </Button>
                </Link>
                {order.latestPendingTaskId &&
                  order.latestPendingTaskId !== "000000000000000000000000" && (
                    <Link to={`/admin/task/${order.latestPendingTaskId}`}>
                      <Button variant="primary" disabled={order.status === 2}>
                        Go to Task →
                      </Button>
                    </Link>
                  )}
                {(order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID ||
                  order.status === ORDER_STATUS_COMPLETED_AND_PAID) &&
                  (currentUser?.role === STAFF_TYPE_MANAGEMENT ||
                    currentUser?.role === STAFF_TYPE_EXECUTIVE) && (
                    <Link to={`/admin/financial/${oid}`}>
                      <Button variant="info" disabled={order.status === 2}>
                        Go to Financials →
                      </Button>
                    </Link>
                  )}
              </div>
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

export default AdminOrderDetailLitePage;

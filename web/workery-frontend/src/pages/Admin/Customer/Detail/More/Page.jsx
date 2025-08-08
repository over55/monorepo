// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useCustomerManager,
  useAccountManager,
  useAuthManager,
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

// Customer type constants (these should match the backend)
const RESIDENTIAL_CUSTOMER_TYPE_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_ID = 2;

function AdminCustomerDetailMorePage() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const customerManager = useCustomerManager();
  const accountManager = useAccountManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  ////
  //// Event handling.
  ////

  const fetchCustomerDetail = async (customerId) => {
    setFetching(true);
    setErrors({});

    try {
      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(response);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // Don't set this as an error since it's not critical for this page
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Lifecycle.
  ////

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (cid) {
      fetchCustomerDetail(cid);
      fetchCurrentUser();
    }
  }, [cid]);

  ////
  //// Render helpers.
  ////

  const getActionItems = () => {
    const actions = [];

    // Archive/Unarchive
    if (customer.status === 2) {
      actions.push({
        title: "Unarchive",
        subtitle: "Make customer visible in list and search results",
        icon: "📤",
        url: `/admin/customer/${cid}/unarchive`,
        color: theme.colors.success,
        bgColor: "#d4edda",
      });
    } else {
      actions.push({
        title: "Archive",
        subtitle: "Make customer hidden from list and search results",
        icon: "📁",
        url: `/admin/customer/${cid}/archive`,
        color: theme.colors.success,
        bgColor: "#d4edda",
      });
    }

    // Upgrade/Downgrade (only for active customers)
    if (customer.status === 1) {
      if (customer.type === COMMERCIAL_CUSTOMER_TYPE_ID) {
        actions.push({
          title: "Downgrade",
          subtitle: "Change customer to become residential customer",
          icon: "🏠",
          url: `/admin/customer/${cid}/downgrade`,
          color: theme.colors.info,
          bgColor: "#d1ecf1",
        });
      } else {
        actions.push({
          title: "Upgrade",
          subtitle: "Change customer to become business customer",
          icon: "🏢",
          url: `/admin/customer/${cid}/upgrade`,
          color: theme.colors.info,
          bgColor: "#d1ecf1",
        });
      }
    }

    // Executive/Management only actions
    const userRole = currentUser.role || currentUser.roleId;
    if (userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID) {
      // Delete (only for active customers)
      if (customer.status === 1) {
        actions.push({
          title: "Delete",
          subtitle: "Permanently delete this customer and all associated data",
          icon: "🗑️",
          url: `/admin/customer/${cid}/permadelete`,
          color: "#fff",
          bgColor: theme.colors.danger,
        });
      }

      // Password and 2FA (only for active customers)
      if (customer.status === 1) {
        actions.push({
          title: "Password",
          subtitle: "Change or reset the user's password",
          icon: "🔑",
          url: `/admin/customer/${cid}/change-password`,
          color: "#fff",
          bgColor: "#dc3545",
        });

        actions.push({
          title: "2FA",
          subtitle: "Enable or disable two-factor authentication",
          icon: "📱",
          url: `/admin/customer/${cid}/change-2fa`,
          color: "#fff",
          bgColor: "#343a40",
        });
      }
    }

    // Ban/Unban
    if (customer.isBanned) {
      actions.push({
        title: "Unban",
        subtitle: "Remove ban from customer",
        icon: "✅",
        url: `/admin/customer/${cid}/unban`,
        color: "#856404",
        bgColor: theme.colors.warningBg,
      });
    } else {
      actions.push({
        title: "Ban",
        subtitle: "Mark the customer as banned",
        icon: "🚫",
        url: `/admin/customer/${cid}/ban`,
        color: "#856404",
        bgColor: theme.colors.warningBg,
      });
    }

    return actions;
  };

  const renderDesktopActionCard = (action, index) => (
    <div
      key={index}
      style={{
        backgroundColor: action.bgColor,
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        border: "1px solid rgba(0,0,0,0.1)",
        minHeight: "140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
      onClick={() => navigate(action.url)}
    >
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{action.icon}</div>
      <h3
        style={{
          color: action.color,
          fontSize: "18px",
          fontWeight: "600",
          margin: "0 0 4px 0",
        }}
      >
        {action.title}
      </h3>
      <p
        style={{
          color: action.color,
          fontSize: "13px",
          margin: 0,
          opacity: 0.9,
        }}
      >
        {action.subtitle}
      </p>
    </div>
  );

  const renderMobileActionRow = (action, index) => (
    <tr key={index}>
      <td style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}>
        <span style={{ marginRight: "8px" }}>{action.icon}</span>
        {action.title}
      </td>
      <td
        style={{
          padding: "12px",
          borderBottom: "1px solid #e9ecef",
          textAlign: "right",
        }}
      >
        <Link
          to={action.url}
          style={{
            color: theme.colors.primary,
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          View →
        </Link>
      </td>
    </tr>
  );

  ////
  //// Component rendering.
  ////

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: "👤",
    },
    {
      label: "Detail",
      icon: "ℹ️",
    },
  ];

  if (!authManager.isAuthenticated()) {
    return <Loading message="Checking authentication..." />;
  }

  const actionItems = getActionItems();

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner */}
      {customer && customer.status === 2 && (
        <Alert type="info">This customer is archived.</Alert>
      )}
      {customer && customer.isBanned && (
        <Alert type="error">This customer is banned.</Alert>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          👤 Customer
        </h1>
        <h2 style={{ fontSize: "18px", color: "#666", margin: 0 }}>
          ℹ️ Detail
        </h2>
      </div>

      <Card title="More...">
        {isFetching ? (
          <Loading message="Loading customer details..." />
        ) : (
          <>
            {/* Show errors if any */}
            {Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </div>
                ))}
              </Alert>
            )}

            {customer && (
              <>
                {/* Tab Navigation */}
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    marginBottom: "30px",
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to={`/admin/customer/${cid}`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Summary
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/detail`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/orders`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Orders
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/comments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/attachments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Attachments
                  </Link>
                  <span
                    style={{
                      color: "#333",
                      fontWeight: "bold",
                      padding: "10px 0",
                      borderBottom: `2px solid ${theme.colors.primary}`,
                    }}
                  >
                    More...
                  </span>
                </div>

                {/* Desktop Actions Grid */}
                <div
                  style={{
                    display:
                      window.innerWidth > theme.breakpoints.mobile
                        ? "grid"
                        : "none",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px",
                  }}
                >
                  {actionItems.map((action, index) =>
                    renderDesktopActionCard(action, index),
                  )}
                </div>

                {/* Mobile Actions Table */}
                <div
                  style={{
                    display:
                      window.innerWidth <= theme.breakpoints.mobile
                        ? "block"
                        : "none",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "30px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      borderRadius: "6px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            borderBottom: "2px solid #dee2e6",
                          }}
                          colSpan="2"
                        >
                          Menu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionItems.map((action, index) =>
                        renderMobileActionRow(action, index),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <Link to="/admin/customers">
                    <Button variant="secondary">← Back to Customers</Button>
                  </Link>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to={`/admin/customer/${cid}/detail`}>
                      <Button variant="outline">📝 Edit Customer</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailMorePage;

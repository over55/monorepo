// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import { TagsDisplay } from "../../../../components/Display";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;

function AdminCustomerDetailLitePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer data
  const fetchCustomer = async () => {
    if (!cid) return;

    setLoading(true);
    setError(null);

    try {
      const customerData = await customerManager.getCustomerDetail(
        cid,
        onUnauthorized,
      );
      setCustomer(customerData);
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      setError("Failed to load customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCustomer();
  }, [cid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Customers", path: "/admin/customers", icon: "👤" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "-";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Format email for display
  const formatEmail = (email) => {
    if (!email) return "-";
    return (
      <a href={`mailto:${email}`} style={{ color: theme.colors.primary }}>
        {email}
      </a>
    );
  };

  // Extract tag IDs from tag objects if necessary
  const getTagIds = (tags) => {
    if (!tags || tags.length === 0) return [];

    // If tags are already IDs (numbers or strings of numbers)
    if (typeof tags[0] === "number" || typeof tags[0] === "string") {
      return tags;
    }

    // If tags are objects with id property
    if (tags[0].id !== undefined) {
      return tags.map((tag) => tag.id);
    }

    // If tags are objects with value property
    if (tags[0].value !== undefined) {
      return tags.map((tag) => tag.value);
    }

    return [];
  };

  // Format address for display
  const formatAddress = (customer) => {
    if (!customer) return "-";
    return (
      customer.fullAddressWithPostalCode ||
      `${customer.addressLine1 || ""} ${customer.city || ""} ${customer.region || ""} ${customer.postalCode || ""}`.trim()
    );
  };

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading customer details..." />
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
          <h1 style={{ margin: 0 }}>👤 Customer</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {customer && customer.status === 2 && (
        <Alert type="info">📁 This customer is archived</Alert>
      )}
      {customer && customer.isBanned && (
        <Alert type="error">🚫 This customer is banned</Alert>
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
        {customer && (
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
              <Link to={`/admin/customer/${cid}/edit`}>
                <Button variant="warning" disabled={customer.status === 2}>
                  ✏️ Edit
                </Button>
              </Link>
              <Link
                to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="success">➕ New Order 🔗</Button>
              </Link>
            </div>
          </div>
        )}

        {customer && (
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
                to={`/admin/customer/${customer.id}/detail`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Detail
              </Link>
              <Link
                to={`/admin/customer/${customer.id}/orders`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Orders
              </Link>
              <Link
                to={`/admin/customer/${customer.id}/comments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/customer/${customer.id}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/customer/${customer.id}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {/* Customer Summary Card */}
            <Card style={{ backgroundColor: theme.colors.light }}>
              <div style={{ marginBottom: "20px" }}>
                {/* Customer Name/Organization */}
                {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                  <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
                    🏢 {customer.organizationName}
                  </h2>
                )}
                <h3 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
                  {customer.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID && "🏠 "}
                  {customer.firstName} {customer.lastName}
                </h3>

                {/* Address */}
                <p
                  style={{
                    margin: "0 0 20px 0",
                    color: theme.colors.secondary,
                    fontSize: "16px",
                  }}
                >
                  📍 {formatAddress(customer)}
                </p>
              </div>

              {/* Contact Information */}
              <div style={{ display: "grid", gap: "15px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "16px" }}>✉️</span>
                  <span style={{ fontWeight: "600", minWidth: "80px" }}>
                    Email:
                  </span>
                  <span>{formatEmail(customer.email)}</span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "16px" }}>📞</span>
                  <span style={{ fontWeight: "600", minWidth: "80px" }}>
                    Phone:
                  </span>
                  <span>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        style={{ color: theme.colors.primary }}
                      >
                        {formatPhone(customer.phone)}
                      </a>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "16px", marginTop: "2px" }}>🏷️</span>
                  <span style={{ fontWeight: "600", minWidth: "80px" }}>
                    Tags:
                  </span>
                  <div style={{ flex: 1 }}>
                    <TagsDisplay
                      values={getTagIds(customer.tags)}
                      onUnauthorized={onUnauthorized}
                      variant="primary"
                    />
                  </div>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "16px" }}>📋</span>
                  <span style={{ fontWeight: "600", minWidth: "80px" }}>
                    Type:
                  </span>
                  <span>
                    {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                      ? "Commercial"
                      : customer.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID
                        ? "Residential"
                        : "Unassigned"}
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "16px" }}>📊</span>
                  <span style={{ fontWeight: "600", minWidth: "80px" }}>
                    Status:
                  </span>
                  <span
                    style={{
                      color: customer.isBanned
                        ? theme.colors.danger
                        : customer.status === 1
                          ? theme.colors.success
                          : theme.colors.secondary,
                      fontWeight: "600",
                    }}
                  >
                    {customer.isBanned
                      ? "Banned"
                      : customer.status === 1
                        ? "Active"
                        : "Inactive"}
                  </span>
                </div>

                {customer.publicId && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🆔</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      ID:
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        backgroundColor: "#f0f0f0",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {customer.publicId}
                    </span>
                  </div>
                )}
              </div>
            </Card>

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
              <Link to="/admin/customers">
                <Button variant="outline">← Back to Customers</Button>
              </Link>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to={`/admin/customer/${cid}/edit`}>
                  <Button variant="warning" disabled={customer.status === 2}>
                    ✏️ Edit
                  </Button>
                </Link>
                <Link
                  to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="success">➕ New Order 🔗</Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!customer && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Customer Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The customer you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/customers">
              <Button variant="primary">← Back to Customers</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailLitePage;

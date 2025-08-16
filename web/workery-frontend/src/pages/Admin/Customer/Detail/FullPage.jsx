// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/FullPage.jsx

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
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/Display";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const CLIENT_PHONE_TYPE_WORK = 2;

// Option mappings for display
const CLIENT_TYPE_OPTIONS = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

const CLIENT_ORGANIZATION_TYPE_OPTIONS = {
  1: "Private",
  2: "Non-profit",
  3: "Government",
};

const GENDER_OPTIONS = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const PHONE_TYPE_OPTIONS = {
  1: "Mobile",
  2: "Work",
  3: "Home",
};

function AdminCustomerDetailFullPage() {
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

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  const formatEmail = (email) => {
    if (!email) return "-";
    return (
      <a href={`mailto:${email}`} style={{ color: theme.colors.primary }}>
        {email}
      </a>
    );
  };

  const formatAddress = (customer) => {
    if (!customer) return "-";
    const address =
      customer.fullAddressWithPostalCode ||
      `${customer.addressLine1 || ""} ${customer.city || ""} ${customer.region || ""} ${customer.postalCode || ""}`.trim();

    if (customer.fullAddressUrl) {
      return (
        <a
          href={customer.fullAddressUrl}
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.colors.primary }}
        >
          {address} 🔗
        </a>
      );
    }
    return address;
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

  // Table component
  const DetailTable = ({ title, children }) => (
    <table
      style={{
        width: "100%",
        marginBottom: "30px",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: theme.colors.dark }}>
          <th
            style={{
              color: "white",
              padding: "12px",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: "600",
            }}
            colSpan="2"
          >
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  // Table row component
  const DetailRow = ({ label, value, valueStyle = {} }) => (
    <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
      <th
        style={{
          backgroundColor: theme.colors.light,
          padding: "12px",
          width: "30%",
          fontWeight: "600",
          textAlign: "left",
        }}
      >
        {label}:
      </th>
      <td style={{ padding: "12px", ...valueStyle }}>{value}</td>
    </tr>
  );

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
            <h3 style={{ margin: 0 }}>📋 Detail</h3>
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
              <Link
                to={`/admin/customer/${customer.id}`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Summary
              </Link>
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Detail
              </div>
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

            {/* Personal Information Table */}
            <DetailTable title="Personal Information">
              <DetailRow
                label="Type"
                value={CLIENT_TYPE_OPTIONS[customer.type] || "Unknown"}
              />
              <DetailRow label="First Name" value={customer.firstName || "-"} />
              <DetailRow label="Last Name" value={customer.lastName || "-"} />
              <DetailRow
                label="Date of Birth"
                value={formatDate(customer.birthDate)}
              />
              <DetailRow
                label="Gender"
                value={
                  customer.gender ? (
                    <>
                      {GENDER_OPTIONS[customer.gender] || "Unknown"}
                      {customer.gender === 1 &&
                        customer.genderOther &&
                        ` - ${customer.genderOther}`}
                    </>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="Description"
                value={customer.description || "-"}
              />
              <DetailRow
                label="Tags"
                value={
                  <TagsDisplay
                    values={getTagIds(customer.tags)}
                    onUnauthorized={onUnauthorized}
                    variant="primary"
                  />
                }
              />
            </DetailTable>

            {/* Company Information Table (for Commercial customers) */}
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
              <DetailTable title="Company Information">
                <DetailRow
                  label="Company Name"
                  value={customer.organizationName || "-"}
                />
                <DetailRow
                  label="Company Type"
                  value={
                    CLIENT_ORGANIZATION_TYPE_OPTIONS[
                      customer.organizationType
                    ] || "-"
                  }
                />
              </DetailTable>
            )}

            {/* Contact Point Table */}
            <DetailTable title="Contact Point">
              <DetailRow label="Email" value={formatEmail(customer.email)} />
              <DetailRow
                label="I agree to receive electronic email"
                value={customer.isOkToEmail ? "✅ Yes" : "❌ No"}
              />
              <DetailRow
                label="Phone"
                value={formatPhone(
                  customer.phone,
                  customer.phoneType === CLIENT_PHONE_TYPE_WORK
                    ? customer.phoneExtension
                    : null,
                )}
              />
              <DetailRow
                label="Phone Type"
                value={PHONE_TYPE_OPTIONS[customer.phoneType] || "-"}
              />
              {customer.otherPhone && (
                <>
                  <DetailRow
                    label="Other Phone (Optional)"
                    value={formatPhone(
                      customer.otherPhone,
                      customer.otherPhoneType === CLIENT_PHONE_TYPE_WORK
                        ? customer.otherPhoneExtension
                        : null,
                    )}
                  />
                  <DetailRow
                    label="Other Phone Type (Optional)"
                    value={PHONE_TYPE_OPTIONS[customer.otherPhoneType] || "-"}
                  />
                </>
              )}
              <DetailRow
                label="I agree to receive texts to my phone"
                value={customer.isOkToText ? "✅ Yes" : "❌ No"}
              />
            </DetailTable>

            {/* Address Table */}
            <DetailTable title="Address">
              <DetailRow label="Location" value={formatAddress(customer)} />
            </DetailTable>

            {/* Internal Metrics Table */}
            <DetailTable title="Internal Metrics">
              <DetailRow
                label="How did they discover us?"
                value={
                  customer.isHowDidYouHearAboutUsOther ? (
                    <div>
                      <HowHearAboutUsDisplay
                        value={customer.howDidYouHearAboutUsID}
                        label=""
                        onUnauthorized={onUnauthorized}
                      />
                      {customer.howDidYouHearAboutUsOther && (
                        <div style={{ marginTop: "5px", fontStyle: "italic" }}>
                          Other: {customer.howDidYouHearAboutUsOther}
                        </div>
                      )}
                    </div>
                  ) : (
                    <HowHearAboutUsDisplay
                      value={customer.howDidYouHearAboutUsID}
                      label=""
                      onUnauthorized={onUnauthorized}
                    />
                  )
                }
              />
              <DetailRow
                label="Join date"
                value={formatDateTime(customer.joinDate)}
              />
              <DetailRow
                label="Preferred Language"
                value={customer.preferredLanguage || "English"}
              />
            </DetailTable>

            {/* System Table */}
            <DetailTable title="System">
              <DetailRow
                label="ID"
                value={customer.publicId || customer.id || "-"}
                valueStyle={{
                  fontFamily: "monospace",
                  backgroundColor: "#f9f9f9",
                }}
              />
              <DetailRow
                label="Created at"
                value={formatDateTime(customer.createdAt)}
              />
              <DetailRow
                label="Created by"
                value={customer.createdByUserName || "-"}
              />
              <DetailRow
                label="Created from"
                value={customer.createdFromIpAddress || "-"}
                valueStyle={{ fontFamily: "monospace" }}
              />
              <DetailRow
                label="Modified at"
                value={formatDateTime(customer.modifiedAt)}
              />
              <DetailRow
                label="Modified by"
                value={customer.modifiedByUserName || "-"}
              />
              <DetailRow
                label="Modified from"
                value={customer.modifiedFromIpAddress || "-"}
                valueStyle={{ fontFamily: "monospace" }}
              />
            </DetailTable>

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

export default AdminCustomerDetailFullPage;

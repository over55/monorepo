// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import {
  TagsDisplay,
  HowHearAboutUsDisplay,
} from "../../../../components/Display";

// Staff type mapping
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

// Phone type mapping
const PHONE_TYPE_MAP = {
  1: "Landline",
  2: "Mobile",
  3: "Work",
};

function AdminStaffDetailLitePage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  // Component state
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("summary");

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Fetch staff detail
  const fetchStaffDetail = () => {
    setIsLoading(true);
    setErrors({});

    staffManager.getStaffDetailWithCallbacks(
      aid,
      onFetchSuccess,
      onFetchError,
      onFetchDone,
      onUnauthorized,
    );
  };

  const onFetchSuccess = (response) => {
    console.log("Staff detail fetched successfully:", response);
    setStaff(response);
  };

  const onFetchError = (error) => {
    console.error("Error fetching staff detail:", error);
    setErrors(error);
  };

  const onFetchDone = () => {
    setIsLoading(false);
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Format address
  const formatAddress = (staff) => {
    if (!staff) return "-";
    const parts = [];
    if (staff.addressLine1) parts.push(staff.addressLine1);
    if (staff.addressLine2) parts.push(staff.addressLine2);
    if (staff.city) parts.push(staff.city);
    if (staff.region) parts.push(staff.region);
    if (staff.postalCode) parts.push(staff.postalCode);
    if (staff.country) parts.push(staff.country);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  // Get Google Maps URL
  const getGoogleMapsUrl = (staff) => {
    if (!staff) return null;
    const address = formatAddress(staff);
    if (address === "-") return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  };

  // Tab navigation component
  const TabNavigation = () => (
    <div
      style={{
        borderBottom: "2px solid #e0e0e0",
        marginBottom: "20px",
        display: "flex",
        gap: "0",
      }}
    >
      <button
        onClick={() => setActiveTab("summary")}
        style={{
          padding: "10px 20px",
          border: "none",
          background: activeTab === "summary" ? "#007bff" : "transparent",
          color: activeTab === "summary" ? "white" : "#666",
          cursor: "pointer",
          borderBottom: activeTab === "summary" ? "3px solid #007bff" : "none",
          fontWeight: activeTab === "summary" ? "bold" : "normal",
        }}
      >
        Summary
      </button>
      <Link to={`/admin/staff/${aid}/detail`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Detail
        </button>
      </Link>
      <Link to={`/admin/staff/${aid}/comments`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Comments
        </button>
      </Link>
      <Link to={`/admin/staff/${aid}/attachments`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Attachments
        </button>
      </Link>
      <Link to={`/admin/staff/${aid}/more`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          More ⋯
        </button>
      </Link>
    </div>
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchStaffDetail();
  }, [aid]);

  // Render loading state
  if (isLoading) {
    return <Loading message="Loading staff member details..." />;
  }

  // Render error state
  if (errors.message) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">
          {errors.message || "An error occurred while loading staff details."}
        </Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to="/admin/staff">
            <Button variant="secondary">← Back to Staff</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render staff not found
  if (!staff) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="warning">Staff member not found.</Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to="/admin/staff">
            <Button variant="secondary">← Back to Staff</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
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
          <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>
            👔 Staff Member
          </h1>
          <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
            ℹ️ Detail
          </h4>
        </div>
        <div>
          <Link to={`/admin/staff/${aid}/edit`}>
            <Button variant="warning" disabled={staff.status === 2}>
              ✏️ Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Archived Banner */}
      {staff.status === 2 && (
        <Alert type="info" style={{ marginBottom: "20px" }}>
          This staff member is archived.
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Content */}
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          {/* Avatar Section */}
          <div
            style={{
              flex: "0 0 200px",
              textAlign: "center",
            }}
          >
            <img
              src={staff.avatarObjectUrl || "/img/placeholder.png"}
              alt={staff.name || "Profile"}
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "10px",
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          </div>

          {/* Information Section */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            {/* Name and Type */}
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.8rem", marginBottom: "5px" }}>
                {staff.type === 3 && staff.organizationName && (
                  <>
                    🏢 {staff.organizationName}
                    <br />
                  </>
                )}
                {staff.type === 2 ? "🏠 " : ""}
                {staff.name || `${staff.firstName} ${staff.lastName}`}
              </h2>

              {/* Address */}
              <p style={{ color: "#666", fontSize: "0.95rem" }}>
                {formatAddress(staff) !== "-" ? (
                  <a
                    href={getGoogleMapsUrl(staff)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    📍 {formatAddress(staff)}
                  </a>
                ) : (
                  "📍 No address available"
                )}
              </p>
            </div>

            {/* Contact Information */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
                Contact Information
              </h3>

              <div style={{ marginBottom: "10px" }}>
                <strong>✉️ Email:</strong>{" "}
                {staff.email ? (
                  <a
                    href={`mailto:${staff.email}`}
                    style={{ color: "#007bff" }}
                  >
                    {staff.email}
                  </a>
                ) : (
                  "-"
                )}
              </div>

              <div style={{ marginBottom: "10px" }}>
                <strong>📱 Phone:</strong>{" "}
                {staff.phone ? (
                  <a href={`tel:${staff.phone}`} style={{ color: "#007bff" }}>
                    {formatPhoneNumber(staff.phone)}
                  </a>
                ) : (
                  "-"
                )}
                {staff.phoneType &&
                  ` (${PHONE_TYPE_MAP[staff.phoneType] || "Unknown"})`}
              </div>

              {staff.otherPhone && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>📞 Other Phone:</strong>{" "}
                  <a
                    href={`tel:${staff.otherPhone}`}
                    style={{ color: "#007bff" }}
                  >
                    {formatPhoneNumber(staff.otherPhone)}
                  </a>
                  {staff.otherPhoneType &&
                    ` (${PHONE_TYPE_MAP[staff.otherPhoneType] || "Unknown"})`}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
                Additional Information
              </h3>

              <div style={{ marginBottom: "10px" }}>
                <strong>👤 Type:</strong>{" "}
                {STAFF_TYPE_MAP[staff.type] || "Unknown"}
              </div>

              <div style={{ marginBottom: "10px" }}>
                <strong>🔖 Status:</strong>{" "}
                <span
                  style={{
                    color: staff.status === 1 ? "green" : "gray",
                    fontWeight: "bold",
                  }}
                >
                  {staff.status === 1 ? "Active" : "Archived"}
                </span>
              </div>

              {/* Use TagsDisplay component */}
              <div style={{ marginBottom: "10px" }}>
                <TagsDisplay
                  values={extractIds(staff.tags)}
                  label="Tags"
                  onUnauthorized={onUnauthorized}
                />
              </div>

              {/* Use HowHearAboutUsDisplay component if applicable */}
              {(staff.howDidYouHearAboutUsId ||
                staff.howDidYouHearAboutUsID) && (
                <div style={{ marginBottom: "10px" }}>
                  {staff.isHowDidYouHearAboutUsOther ? (
                    <>
                      <strong>How did they discover us:</strong>{" "}
                      {staff.howDidYouHearAboutUsOther}
                    </>
                  ) : (
                    <HowHearAboutUsDisplay
                      value={
                        staff.howDidYouHearAboutUsId ||
                        staff.howDidYouHearAboutUsID
                      }
                      label="How did they discover us?"
                      onUnauthorized={onUnauthorized}
                    />
                  )}
                </div>
              )}

              {staff.publicId && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>🆔 Public ID:</strong> {staff.publicId}
                </div>
              )}

              {staff.createdAt && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>📅 Created:</strong>{" "}
                  {new Date(staff.createdAt).toLocaleDateString()}
                </div>
              )}

              {staff.modifiedAt && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>📅 Last Modified:</strong>{" "}
                  {new Date(staff.modifiedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link to="/admin/staff">
            <Button variant="secondary">← Back to Staff</Button>
          </Link>
          <Link to={`/admin/staff/${aid}/edit`}>
            <Button variant="warning" disabled={staff.status === 2}>
              ✏️ Edit Staff
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailLitePage;

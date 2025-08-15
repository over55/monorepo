// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/FullPage.jsx

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

// Gender options
const GENDER_MAP = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

// Identify as options
const IDENTIFY_AS_OPTIONS = [
  { value: 1, label: "Indigenous" },
  { value: 2, label: "Newcomer" },
  { value: 3, label: "Visible minority" },
  { value: 4, label: "Women" },
  { value: 5, label: "Prefer not to say" },
];

// Organization type options
const ORGANIZATION_TYPE_MAP = {
  1: "Corporation",
  2: "Partnership",
  3: "Sole Proprietorship",
  4: "Other",
};

function AdminStaffDetailFullPage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  // Component state
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

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

  // Format functions
  const formatPhoneNumber = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

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

  const getGoogleMapsUrl = (staff) => {
    if (!staff) return null;
    const address = formatAddress(staff);
    if (address === "-") return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return "-";
    return tags.map((tag) => tag.text || tag.name || tag).join(", ");
  };

  const formatSkillSets = (skillSets) => {
    if (!skillSets || skillSets.length === 0) return "-";
    return skillSets
      .map((skill) => skill.text || skill.name || skill)
      .join(", ");
  };

  const formatIdentifyAs = (values) => {
    if (!values || values.length === 0) return "-";
    return values
      .map((value) => {
        const option = IDENTIFY_AS_OPTIONS.find((opt) => opt.value === value);
        return option ? option.label : value;
      })
      .join(", ");
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
      <Link to={`/admin/staff/${aid}`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Summary
        </button>
      </Link>
      <button
        style={{
          padding: "10px 20px",
          border: "none",
          background: "#007bff",
          color: "white",
          cursor: "pointer",
          borderBottom: "3px solid #007bff",
          fontWeight: "bold",
        }}
      >
        Detail
      </button>
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

  // Data table component
  const DataTable = ({ title, children }) => (
    <table
      style={{
        width: "100%",
        marginBottom: "30px",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#333" }}>
          <th
            colSpan="2"
            style={{
              color: "white",
              padding: "10px",
              textAlign: "left",
            }}
          >
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  // Data row component
  const DataRow = ({ label, value, width = "30%" }) => (
    <tr>
      <th
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          width: width,
          borderBottom: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        {label}
      </th>
      <td
        style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {value}
      </td>
    </tr>
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
            ℹ️ Full Detail
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

        {/* Personal Information */}
        <DataTable title="Personal Information">
          <DataRow label="Type" value={STAFF_TYPE_MAP[staff.type] || "-"} />
          <DataRow label="First Name" value={staff.firstName || "-"} />
          <DataRow label="Last Name" value={staff.lastName || "-"} />
          <DataRow label="Date of Birth" value={formatDate(staff.birthDate)} />
          <DataRow
            label="Gender"
            value={
              staff.gender
                ? `${GENDER_MAP[staff.gender] || "-"}${staff.gender === 1 && staff.genderOther ? ` - ${staff.genderOther}` : ""}`
                : "-"
            }
          />
          <DataRow label="Description" value={staff.description || "-"} />
          <DataRow label="Tags" value={formatTags(staff.tags)} />
          <DataRow
            label="Skill Sets"
            value={formatSkillSets(staff.skillSets)}
          />
        </DataTable>

        {/* Company Information (if commercial type) */}
        {staff.type === 3 && (
          <DataTable title="Company Information">
            <DataRow
              label="Company Name"
              value={staff.organizationName || "-"}
            />
            <DataRow
              label="Company Type"
              value={ORGANIZATION_TYPE_MAP[staff.organizationType] || "-"}
            />
          </DataTable>
        )}

        {/* Contact Point */}
        <DataTable title="Contact Point">
          <DataRow
            label="Email"
            value={
              staff.email ? (
                <a href={`mailto:${staff.email}`} style={{ color: "#007bff" }}>
                  {staff.email}
                </a>
              ) : (
                "-"
              )
            }
          />
          <DataRow
            label="I agree to receive electronic email"
            value={staff.isOkToEmail ? "✓ Yes" : "✗ No"}
          />
          <DataRow
            label="Phone"
            value={
              staff.phone ? (
                <a href={`tel:${staff.phone}`} style={{ color: "#007bff" }}>
                  {formatPhoneNumber(staff.phone)}
                </a>
              ) : (
                "-"
              )
            }
          />
          <DataRow
            label="Phone Type"
            value={PHONE_TYPE_MAP[staff.phoneType] || "-"}
          />
          {staff.otherPhone && (
            <>
              <DataRow
                label="Other Phone (Optional)"
                value={
                  <a
                    href={`tel:${staff.otherPhone}`}
                    style={{ color: "#007bff" }}
                  >
                    {formatPhoneNumber(staff.otherPhone)}
                  </a>
                }
              />
              <DataRow
                label="Other Phone Type (Optional)"
                value={PHONE_TYPE_MAP[staff.otherPhoneType] || "-"}
              />
            </>
          )}
          <DataRow
            label="I agree to receive texts to my phone"
            value={staff.isOkToText ? "✓ Yes" : "✗ No"}
          />
        </DataTable>

        {/* Address */}
        <DataTable title="Address">
          <DataRow
            label="Location"
            value={
              formatAddress(staff) !== "-" ? (
                <a
                  href={getGoogleMapsUrl(staff)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  {formatAddress(staff)}
                </a>
              ) : (
                "-"
              )
            }
          />
        </DataTable>

        {/* Account */}
        <DataTable title="Account">
          <DataRow
            label="Is active"
            value={staff.status === 1 ? "Active" : "Archived"}
          />
          <DataRow
            label="Preferred Language"
            value={
              staff.preferredLanguage === "English"
                ? "English"
                : staff.preferredLanguage === "French"
                  ? "French"
                  : staff.preferredLanguage || "-"
            }
          />
        </DataTable>

        {/* Emergency Contact */}
        <DataTable title="Emergency Contact">
          <DataRow label="Name" value={staff.emergencyContactName || "-"} />
          <DataRow
            label="Relationship"
            value={staff.emergencyContactRelationship || "-"}
          />
          <DataRow
            label="Telephone"
            value={
              staff.emergencyContactTelephone ? (
                <a
                  href={`tel:${staff.emergencyContactTelephone}`}
                  style={{ color: "#007bff" }}
                >
                  {formatPhoneNumber(staff.emergencyContactTelephone)}
                </a>
              ) : (
                "-"
              )
            }
          />
          <DataRow
            label="Alternate Telephone"
            value={
              staff.emergencyContactAlternativeTelephone ? (
                <a
                  href={`tel:${staff.emergencyContactAlternativeTelephone}`}
                  style={{ color: "#007bff" }}
                >
                  {formatPhoneNumber(
                    staff.emergencyContactAlternativeTelephone,
                  )}
                </a>
              ) : (
                "-"
              )
            }
          />
        </DataTable>

        {/* Internal Metrics */}
        <DataTable title="Internal Metrics">
          <DataRow
            label="How did they discover us?"
            value={
              staff.isHowDidYouHearAboutUsOther
                ? staff.howDidYouHearAboutUsOther
                : staff.howDidYouHearAboutUsText || "-"
            }
          />
          <DataRow label="Join date" value={formatDateTime(staff.joinDate)} />
          <DataRow
            label="Do you identify as belonging to any of the following groups?"
            value={formatIdentifyAs(staff.identifyAs)}
          />
        </DataTable>

        {/* System */}
        <DataTable title="System">
          <DataRow label="ID" value={staff.publicId || staff.id || "-"} />
          <DataRow label="Created at" value={formatDateTime(staff.createdAt)} />
          <DataRow label="Created by" value={staff.createdByUserName || "-"} />
          <DataRow
            label="Created from"
            value={staff.createdFromIpAddress || "-"}
          />
          <DataRow
            label="Modified at"
            value={formatDateTime(staff.modifiedAt)}
          />
          <DataRow
            label="Modified by"
            value={staff.modifiedByUserName || "-"}
          />
          <DataRow
            label="Modified from"
            value={staff.modifiedFromIpAddress || "-"}
          />
        </DataTable>

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

export default AdminStaffDetailFullPage;

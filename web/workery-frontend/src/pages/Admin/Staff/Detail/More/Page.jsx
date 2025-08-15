// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../../services/Services";
import { theme } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

// Constants
const STAFF_TYPE_MANAGEMENT = 2;
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailMorePage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState({});

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchStaffDetail = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const response = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(response);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff detail:", error);
          setErrors(error);
          window.scrollTo(0, 0);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchStaffDetail();

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", icon: "ℹ️" },
  ];

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
      <button
        style={{
          padding: "10px 20px",
          border: "none",
          background: theme.colors.primary,
          color: "white",
          cursor: "pointer",
          borderBottom: `3px solid ${theme.colors.primary}`,
          fontWeight: "bold",
        }}
      >
        More ⋯
      </button>
    </div>
  );

  // Render loading state
  if (isFetching) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading staff details..." />
      </div>
    );
  }

  // Render error state if staff not found
  if (!staff || !staff.id) {
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
            ⋯ More Actions
          </h4>
        </div>
      </div>

      {/* Archived Banner */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <Alert type="info" style={{ marginBottom: "20px" }}>
          This staff member is archived.
        </Alert>
      )}

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {typeof errors === "string" ? (
            errors
          ) : errors.message ? (
            errors.message
          ) : (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Page Menu Options */}
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
            🎯 Available Actions
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {/* Photo option - only for active staff */}
            {staff.status === STAFF_STATUS_ACTIVE && (
              <Link
                to={`/admin/staff/${aid}/avatar`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "#fff3cd",
                    padding: "25px",
                    borderRadius: "8px",
                    border: "1px solid #ffc107",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    height: "100%",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    ":hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    📷
                  </div>
                  <h4 style={{ margin: "10px 0", color: "#333" }}>Photo</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    Upload a photo of the staff
                  </p>
                </div>
              </Link>
            )}

            {/* Archive/Unarchive option */}
            {staff.status === STAFF_STATUS_ARCHIVED ? (
              <Link
                to={`/admin/staff/${aid}/unarchive`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    padding: "25px",
                    borderRadius: "8px",
                    border: "1px solid #28a745",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    height: "100%",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    📦
                  </div>
                  <h4 style={{ margin: "10px 0", color: "#333" }}>Unarchive</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    Make staff visible in list and search results
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                to={`/admin/staff/${aid}/archive`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "#d1ecf1",
                    padding: "25px",
                    borderRadius: "8px",
                    border: "1px solid #17a2b8",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    height: "100%",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    📁
                  </div>
                  <h4 style={{ margin: "10px 0", color: "#333" }}>Archive</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    Hide staff from list and search results
                  </p>
                </div>
              </Link>
            )}

            {/* Upgrade/Downgrade option - only for active staff */}
            {staff.status === STAFF_STATUS_ACTIVE && (
              <>
                {staff.type === STAFF_TYPE_MANAGEMENT ? (
                  <Link
                    to={`/admin/staff/${aid}/downgrade`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#e7e8ea",
                        padding: "25px",
                        borderRadius: "8px",
                        border: "1px solid #6c757d",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        height: "100%",
                        minHeight: "150px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                        🏠
                      </div>
                      <h4 style={{ margin: "10px 0", color: "#333" }}>
                        Downgrade
                      </h4>
                      <p
                        style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}
                      >
                        Change to residential staff
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to={`/admin/staff/${aid}/upgrade`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#e7e8ea",
                        padding: "25px",
                        borderRadius: "8px",
                        border: "1px solid #6c757d",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        height: "100%",
                        minHeight: "150px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                        🏢
                      </div>
                      <h4 style={{ margin: "10px 0", color: "#333" }}>
                        Upgrade
                      </h4>
                      <p
                        style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}
                      >
                        Change to business staff
                      </p>
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* Active staff only options */}
            {staff.status === STAFF_STATUS_ACTIVE && (
              <>
                {/* Delete option */}
                <Link
                  to={`/admin/staff/${aid}/permadelete`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8d7da",
                      padding: "25px",
                      borderRadius: "8px",
                      border: "1px solid #dc3545",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      height: "100%",
                      minHeight: "150px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                      🗑️
                    </div>
                    <h4 style={{ margin: "10px 0", color: "#333" }}>Delete</h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                      Permanently delete this staff
                    </p>
                  </div>
                </Link>

                {/* Password option */}
                <Link
                  to={`/admin/staff/${aid}/change-password`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "#f4e4ff",
                      padding: "25px",
                      borderRadius: "8px",
                      border: "1px solid #8b5cf6",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      height: "100%",
                      minHeight: "150px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                      🔑
                    </div>
                    <h4 style={{ margin: "10px 0", color: "#333" }}>
                      Password
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                      Change or reset the password
                    </p>
                  </div>
                </Link>

                {/* 2FA option */}
                <Link
                  to={`/admin/staff/${aid}/2fa`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "#e8f4fd",
                      padding: "25px",
                      borderRadius: "8px",
                      border: "1px solid #0d6efd",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      height: "100%",
                      minHeight: "150px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                      📱
                    </div>
                    <h4 style={{ margin: "10px 0", color: "#333" }}>2FA</h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                      Two-factor authentication
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
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
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailMorePage;

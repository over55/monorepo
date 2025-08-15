// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Upgrade/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../../../services/Services";
import { theme } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";

function AdminStaffDetailMoreUpgradePage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [staff, setStaff] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  const handleSubmit = async () => {
    setErrors({});
    setSubmitting(true);

    try {
      const upgradeData = {
        staff_id: aid,
      };

      await staffManager.upgradeStaff(upgradeData, onUnauthorized);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade staff:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail (More)", path: `/admin/staff/${aid}/more`, icon: "ℹ️" },
    { label: "Upgrade", icon: "🏢" },
  ];

  // Render loading state
  if (isFetching) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading staff details..." />
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
            🏢 Upgrade Staff
          </h4>
        </div>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          Staff upgraded successfully! Redirecting...
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
        <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
          🏢 Upgrade to Management Staff
        </h3>

        {staff && (
          <div>
            <div
              style={{
                backgroundColor: "#fff3cd",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #ffc107",
                marginBottom: "30px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 15px 0",
                  color: "#856404",
                  fontSize: "1.1rem",
                }}
              >
                ⚠ Warning
              </h4>
              <p style={{ margin: 0, color: "#856404", lineHeight: "1.6" }}>
                You are about to <strong>upgrade</strong> this staff member from{" "}
                <em>Frontline Staff</em> type to <em>Management</em>. This will
                affect the permission system of this user. Are you sure you want
                to continue?
              </p>
            </div>

            {/* Role Change Information */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "30px",
              }}
            >
              <h4 style={{ margin: "0 0 20px 0", fontSize: "1.1rem" }}>
                📋 Role Change Details
              </h4>
              <table
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: "4px",
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td
                      style={{
                        padding: "12px 15px",
                        fontWeight: "600",
                        backgroundColor: "#f8f9fa",
                        width: "30%",
                      }}
                    >
                      Current Role:
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{ color: "#28a745", fontWeight: "600" }}>
                        Frontline Staff
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "12px 15px",
                        fontWeight: "600",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      New Role:
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <span style={{ color: "#17a2b8", fontWeight: "600" }}>
                        Management Staff
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
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
              <Link to={`/admin/staff/${aid}/more`}>
                <Button variant="secondary">← Back to Detail</Button>
              </Link>

              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : <>✓ Confirm and Upgrade</>}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailMoreUpgradePage;

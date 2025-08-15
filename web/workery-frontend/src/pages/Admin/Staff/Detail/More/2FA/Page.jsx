// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/2FA/Page.jsx

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

// Constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailMore2FAPage() {
  const navigate = useNavigate();
  const { sid } = useParams();
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
        const response = await staffManager.getStaffDetail(sid, onUnauthorized);
        if (mounted) {
          setStaff(response);
          console.log("Staff detail fetched:", response);
          console.log("Staff OTP Enabled:", response.otpEnabled);
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
  }, [sid]);

  const handleSubmit = async () => {
    setErrors({});
    setSubmitting(true);

    try {
      const twoFactorData = {
        staff_id: sid,
        otp_enabled: !staff.otpEnabled,
      };

      await staffManager.changeStaffTwoFactorAuth(
        twoFactorData,
        onUnauthorized,
      );

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${sid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change 2FA settings:", error);
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
    { label: "Detail (More)", path: `/admin/staff/${sid}/more`, icon: "ℹ️" },
    { label: "Two-Factor Authentication", icon: "📱" },
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
            📱 Two-Factor Authentication
          </h4>
        </div>
      </div>

      {/* Archived Banner */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <Alert type="info" style={{ marginBottom: "20px" }}>
          This staff member is archived.
        </Alert>
      )}

      {/* Success message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          2FA settings changed successfully! Redirecting...
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
          🔐 Change Two-Factor Authentication Settings
        </h3>

        {/* 2FA Status Alert */}
        {!staff.otpEnabled ? (
          <div
            style={{
              backgroundColor: "#d4edda",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #28a745",
              marginBottom: "30px",
            }}
          >
            <h4
              style={{
                margin: "0 0 15px 0",
                color: "#155724",
                fontSize: "1.1rem",
              }}
            >
              ✓ Enable 2FA
            </h4>
            <p style={{ margin: 0, color: "#155724", lineHeight: "1.6" }}>
              You are about to <strong>enable 2FA</strong> for this staff
              member. This operation will force the staff member on their next
              successful login to be taken through a{" "}
              <strong>3-step wizard</strong> to setup 2FA. Afterwards, every
              time the staff member logs in, they will be asked to carry out a
              2FA process. Are you sure you want to continue?
            </p>
          </div>
        ) : (
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
              ⚠ Remove 2FA
            </h4>
            <p style={{ margin: 0, color: "#856404", lineHeight: "1.6" }}>
              You are about to <strong>remove 2FA</strong> for this staff
              member. This operation will remove previous 2FA setup codes and
              disable 2FA on login for this staff. This is recommended if the
              user lost their 2FA codes from their device. Are you sure you want
              to continue?
            </p>
          </div>
        )}

        {/* Staff Information Table */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <h4 style={{ margin: "0 0 20px 0", fontSize: "1.1rem" }}>
            📋 Staff Information
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
                  Name:
                </td>
                <td style={{ padding: "12px 15px" }}>
                  {staff.firstName} {staff.lastName}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                <td
                  style={{
                    padding: "12px 15px",
                    fontWeight: "600",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  Email:
                </td>
                <td style={{ padding: "12px 15px" }}>{staff.email}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                <td
                  style={{
                    padding: "12px 15px",
                    fontWeight: "600",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  Current 2FA Status:
                </td>
                <td style={{ padding: "12px 15px" }}>
                  {staff.otpEnabled ? (
                    <span
                      style={{
                        color: "#28a745",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ✓ Enabled
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#dc3545",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ✗ Disabled
                    </span>
                  )}
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
                  New 2FA Status:
                </td>
                <td style={{ padding: "12px 15px" }}>
                  {!staff.otpEnabled ? (
                    <span
                      style={{
                        color: "#28a745",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ✓ Will be Enabled
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#dc3545",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      ✗ Will be Disabled
                    </span>
                  )}
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
          <Link to={`/admin/staff/${sid}/more`}>
            <Button variant="secondary">← Back to Detail (More)</Button>
          </Link>

          <Button
            variant={!staff.otpEnabled ? "success" : "warning"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : <>✓ Confirm and Submit</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailMore2FAPage;

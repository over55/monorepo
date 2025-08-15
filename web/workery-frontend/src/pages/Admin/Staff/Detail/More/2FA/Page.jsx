// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/2FA/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";

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
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

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

      // Scroll to top to show error
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

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner for archived staff */}
      {staff && staff.status === 2 && <Alert type="info">Archived</Alert>}

      {/* Success message */}
      {showSuccessMessage && (
        <Alert type="success">
          2FA settings changed successfully! Redirecting...
        </Alert>
      )}

      {/* Page Title */}
      <h1>Staff - Two-Factor Authentication</h1>

      {/* Page Content */}
      <Card title="Change Two-Factor Authentication">
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {/* Error display */}
            {errors && Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.keys(errors).map((key) => (
                  <div key={key}>{errors[key]}</div>
                ))}
              </Alert>
            )}

            {staff && (
              <div>
                {!staff.otpEnabled ? (
                  <Alert type="success">
                    <h3>✓ Enable 2FA</h3>
                    <p>
                      You are about to <strong>enable 2FA</strong> for this
                      staff member. This operation will force staff member on
                      next successful login to be taken through a{" "}
                      <strong>3-step wizard</strong> to setup 2FA. Afterwards
                      every time the staff member logs in, they will be asked to
                      carry out a 2FA process. Are you sure you want to
                      continue?
                    </p>
                  </Alert>
                ) : (
                  <Alert type="warning">
                    <h3>⚠ Remove 2FA</h3>
                    <p>
                      You are about to <strong>remove 2FA</strong> for this
                      staff member. This operation will remove previous 2FA
                      setup codes and disable 2FA on login for this staff. This
                      is recommended if the user lost their 2FA codes from their
                      device. Are you sure you want to continue?
                    </p>
                  </Alert>
                )}

                {/* Staff Information */}
                <div style={{ marginTop: "30px", marginBottom: "30px" }}>
                  <h3>Staff Information</h3>
                  <table style={{ width: "100%", marginTop: "10px" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Name:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {staff.firstName} {staff.lastName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Email:
                        </td>
                        <td style={{ padding: "10px" }}>{staff.email}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Current 2FA Status:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {staff.otpEnabled ? (
                            <span style={{ color: "green" }}>✓ Enabled</span>
                          ) : (
                            <span style={{ color: "red" }}>✗ Disabled</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          New 2FA Status:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {!staff.otpEnabled ? (
                            <span style={{ color: "green" }}>
                              ✓ Will be Enabled
                            </span>
                          ) : (
                            <span style={{ color: "red" }}>
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
                    marginTop: "40px",
                    display: "flex",
                    justifyContent: "space-between",
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
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailMore2FAPage;

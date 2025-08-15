// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/ChangePassword/Page.jsx

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
  Input,
} from "../../../../../../components/UI";

function AdminStaffDetailMoreChangePasswordPage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [staff, setStaff] = useState({});
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
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
    // Validate passwords
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }
    if (!passwordRepeated) {
      setErrors({ passwordRepeated: "Password confirmation is required" });
      return;
    }
    if (password !== passwordRepeated) {
      setErrors({ passwordRepeated: "Passwords do not match" });
      return;
    }
    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters long" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const passwordData = {
        staff_id: aid,
        password: password,
        password_repeated: passwordRepeated,
      };

      await staffManager.changeStaffPassword(passwordData, onUnauthorized);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change password:", error);
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
    { label: "Password", icon: "🔑" },
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
            🔑 Change Password
          </h4>
        </div>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          Password changed successfully! Redirecting...
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
          🔑 Set New Password
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
                You are about to <strong>change the password</strong> for this
                staff member. Please make sure you enter it correctly or else
                the staff member will be locked out of their account and will
                require password resetting. Are you sure you want to continue?
              </p>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required={true}
              />

              <Input
                label="Password Repeated"
                name="passwordRepeated"
                type="password"
                placeholder="Enter password again"
                value={passwordRepeated}
                onChange={(e) => setPasswordRepeated(e.target.value)}
                error={errors.passwordRepeated}
                required={true}
              />
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
                <Button variant="secondary">← Back to Detail (More)</Button>
              </Link>

              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : <>✓ Confirm and Submit</>}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailMoreChangePasswordPage;

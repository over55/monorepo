// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/ChangePassword/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateManager } from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
} from "../../../../../../components/UI";

function AdminAssociateDetailMoreChangePasswordPage() {
  // URL Parameters
  const { aid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load associate details
  useEffect(() => {
    let mounted = true;

    const fetchAssociate = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await associateManager.getAssociateDetail(
          aid,
          onUnauthorized,
        );
        if (mounted) {
          setAssociate(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch associate:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchAssociate();
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!passwordRepeated) {
      newErrors.passwordRepeated = "Password confirmation is required";
    } else if (password !== passwordRepeated) {
      newErrors.passwordRepeated = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Prepare password data
      const passwordData = {
        associate_id: aid,
        password: password,
        password_repeated: passwordRepeated,
      };

      // Call the manager to change password
      await associateManager.changeAssociatePassword(
        passwordData,
        onUnauthorized,
      );

      // Set success message
      setSuccessMessage("Password has been successfully changed");

      // Clear form
      setPassword("");
      setPasswordRepeated("");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change password:", error);
      setErrors(error);
      setIsSubmitting(false);
    }
  };

  // Handle confirm button click
  const handleConfirmClick = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Change Password", icon: "🔑" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Change Password">
          <Loading message="Loading associate details..." />
        </Card>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>
        👷 Associate: {associate?.firstName} {associate?.lastName}
      </h1>
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Change Password</h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors &&
        Object.keys(errors).length > 0 &&
        !errors.password &&
        !errors.passwordRepeated && (
          <Alert type="error">
            {errors.message ||
              errors.detail ||
              "An error occurred. Please try again."}
          </Alert>
        )}

      {/* Main Card */}
      <Card>
        {/* Status Banner */}
        {associate?.status === 2 && (
          <Alert type="info">This associate is archived.</Alert>
        )}

        {/* Warning Message */}
        <Alert type="warning">
          <h4 style={{ marginBottom: "10px" }}>⚠️ Warning</h4>
          <p>
            You are about to <strong>change the password</strong> for this
            associate. Please make sure you enter it correctly or else the
            associate will be locked out of their account and will require
            password resetting.
          </p>
          <p style={{ marginTop: "10px" }}>
            <strong>Note:</strong> The associate will need to use this new
            password on their next login.
          </p>
        </Alert>

        {/* Associate Information */}
        {associate && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              marginBottom: "20px",
              marginTop: "20px",
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>Associate Information:</h4>
            <div style={{ display: "grid", gap: "5px" }}>
              <div>
                <strong>Name:</strong> {associate.firstName}{" "}
                {associate.lastName}
              </div>
              <div>
                <strong>Email:</strong> {associate.email}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {associate.status === 1 ? (
                  <span style={{ color: theme.colors.success }}>Active</span>
                ) : associate.status === 2 ? (
                  <span style={{ color: theme.colors.warning }}>Archived</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Password Form */}
        <div style={{ marginTop: "20px" }}>
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              // Clear password errors when typing
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
            required
            placeholder="Enter new password"
            disabled={isSubmitting}
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordRepeated}
            onChange={(e) => {
              setPasswordRepeated(e.target.value);
              // Clear password confirmation errors when typing
              if (errors.passwordRepeated) {
                setErrors({ ...errors, passwordRepeated: undefined });
              }
            }}
            error={errors.passwordRepeated}
            required
            placeholder="Enter new password again"
            disabled={isSubmitting}
          />

          <div
            style={{
              padding: "10px",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <p style={{ fontSize: "12px", color: "#666" }}>
              <strong>Password Requirements:</strong>
            </p>
            <ul
              style={{
                fontSize: "12px",
                color: "#666",
                marginLeft: "20px",
                marginTop: "5px",
              }}
            >
              <li>Minimum 8 characters long</li>
              <li>Both password fields must match</li>
              <li>
                Consider using a mix of letters, numbers, and symbols for better
                security
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Link to={`/admin/associate/${aid}/more`}>
            <Button variant="secondary" disabled={isSubmitting}>
              ← Back to More
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={handleConfirmClick}
            disabled={isSubmitting || !password || !passwordRepeated}
          >
            {isSubmitting ? "Processing..." : <>✓ Confirm and Submit</>}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Password Change"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing..." : "Yes, Change Password"}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to change the password for:</p>
        <p style={{ fontWeight: "bold", margin: "10px 0" }}>
          {associate?.firstName} {associate?.lastName} ({associate?.email})
        </p>

        <Alert type="warning">
          <p style={{ fontSize: "14px" }}>
            <strong>Important:</strong> The associate will need to use the new
            password immediately. Make sure to securely communicate the new
            password to them.
          </p>
        </Alert>

        <p style={{ marginTop: "15px" }}>
          Do you want to proceed with changing the password?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreChangePasswordPage;

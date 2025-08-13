// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/2FA/Page.jsx

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
} from "../../../../../../components/UI";

function AdminAssociateDetailMore2FAPage() {
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Handle 2FA toggle confirmation
  const handleConfirmToggle = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      // Prepare the data for the API call
      const twoFactorData = {
        associate_id: aid,
        otp_enabled: !associate.otpEnabled,
      };

      // Call the manager to change 2FA settings
      await associateManager.changeAssociateTwoFactorAuth(
        twoFactorData,
        onUnauthorized,
      );

      // Set success message
      const message = associate.otpEnabled
        ? "2FA has been disabled for this associate"
        : "2FA has been enabled for this associate";
      setSuccessMessage(message);

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change 2FA settings:", error);
      setErrors(error);
      setFetching(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Two-Factor Authentication", icon: "📱" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Two-Factor Authentication">
          <Loading message="Loading associate details..." />
        </Card>
      </div>
    );
  }

  // Render error state
  if (!associate && !isFetching) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Two-Factor Authentication">
          <Alert type="error">
            Failed to load associate details. Please try again.
          </Alert>
          <div style={{ marginTop: "20px" }}>
            <Link to={`/admin/associate/${aid}/more`}>
              <Button variant="secondary">← Back to More</Button>
            </Link>
          </div>
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
      <h2 style={{ marginBottom: "20px", color: "#666" }}>
        Two-Factor Authentication Settings
      </h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
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

        {/* 2FA Status Information */}
        {associate && (
          <div>
            {!associate.otpEnabled ? (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: theme.colors.successBg,
                  border: `1px solid ${theme.colors.success}`,
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{ color: theme.colors.success, marginBottom: "10px" }}
                >
                  ✓ Enable 2FA
                </h3>
                <p>
                  You are about to <strong>enable 2FA</strong> for this
                  associate. This operation will force the associate on their
                  next successful login to be taken through a{" "}
                  <strong>3-step wizard</strong> to setup 2FA. Afterwards, every
                  time the associate logs in, they will be asked to carry out a
                  2FA process.
                </p>
                <p style={{ marginTop: "10px" }}>
                  Are you sure you want to continue?
                </p>
              </div>
            ) : (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: theme.colors.warningBg,
                  border: `1px solid ${theme.colors.warning}`,
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ color: "#856404", marginBottom: "10px" }}>
                  ⚠️ Remove 2FA
                </h3>
                <p>
                  You are about to <strong>remove 2FA</strong> for this
                  associate. This operation will remove previous 2FA setup codes
                  and disable 2FA on login for this associate. This is
                  recommended if the user lost their 2FA codes from their
                  device.
                </p>
                <p style={{ marginTop: "10px" }}>
                  Are you sure you want to continue?
                </p>
              </div>
            )}

            {/* Current Status */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <strong>Current 2FA Status:</strong>{" "}
              {associate.otpEnabled ? (
                <span style={{ color: theme.colors.success }}>✓ Enabled</span>
              ) : (
                <span style={{ color: "#666" }}>✗ Disabled</span>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to={`/admin/associate/${aid}/more`}>
                <Button variant="secondary" disabled={isFetching}>
                  ← Back to More
                </Button>
              </Link>

              <Button
                variant={!associate.otpEnabled ? "success" : "warning"}
                onClick={() => setShowConfirmModal(true)}
                disabled={isFetching}
              >
                {isFetching ? (
                  "Processing..."
                ) : (
                  <>✓ {!associate.otpEnabled ? "Enable 2FA" : "Disable 2FA"}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm 2FA Change"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isFetching}
            >
              Cancel
            </Button>
            <Button
              variant={!associate?.otpEnabled ? "success" : "warning"}
              onClick={handleConfirmToggle}
              disabled={isFetching}
            >
              {isFetching ? "Processing..." : "Confirm"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to{" "}
          {!associate?.otpEnabled ? "enable" : "disable"}
          Two-Factor Authentication for this associate?
        </p>
        {!associate?.otpEnabled && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            The associate will be required to set up 2FA on their next login.
          </p>
        )}
        {associate?.otpEnabled && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            This will remove all 2FA settings for this associate. They will be
            able to login without 2FA verification.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMore2FAPage;

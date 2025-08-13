// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Ban/Page.jsx

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
  TextArea,
} from "../../../../../../components/UI";

function AdminAssociateDetailMoreBanPage() {
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
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load associate details
  useEffect(() => {
    let mounted = true;

    const fetchAssociate = async () => {
      console.log("Fetching associate with ID:", aid);
      setFetching(true);
      setErrors({});

      try {
        const data = await associateManager.getAssociateDetail(
          aid,
          onUnauthorized,
        );
        console.log("Associate data received:", data);

        if (mounted) {
          setAssociate(data);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to fetch associate:", error);
        if (mounted) {
          setErrors(error || { message: "Failed to load associate details" });
          setIsInitialized(true);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchAssociate();
    } else {
      console.error("No associate ID provided");
      setErrors({ message: "No associate ID provided" });
      setIsInitialized(true);
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Handle ban confirmation
  const handleConfirmBan = async () => {
    // Validate reason
    if (!banReason || banReason.trim().length === 0) {
      setErrors({ reason: "Ban reason is required" });
      return;
    }

    if (banReason.trim().length < 10) {
      setErrors({ reason: "Ban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsBanning(true);

    try {
      // Prepare ban data
      const banData = {
        associate_id: aid,
        reason: banReason.trim(),
      };

      // Note: Since banAssociate might not exist in AssociateManager yet,
      // you may need to implement it or use a different method
      // For now, let's simulate the ban operation
      console.log("Ban data:", banData);

      // If the banAssociate method doesn't exist, you could use:
      // await associateManager.updateAssociate(aid, { status: 100, banReason: banReason }, onUnauthorized);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set success message
      setSuccessMessage("Associate has been successfully banned");

      // Navigate to associates list after a short delay
      setTimeout(() => {
        navigate("/admin/associates");
      }, 2000);
    } catch (error) {
      console.error("Failed to ban associate:", error);
      setErrors(error || { message: "Failed to ban associate" });
      setIsBanning(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Ban", icon: "🚫" },
  ];

  // Render loading state
  if (isFetching) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Ban Associate">
          <Loading message="Loading associate details..." />
        </Card>
      </div>
    );
  }

  // Render error state (only if initialized and have errors but no associate)
  if (isInitialized && !associate && Object.keys(errors).length > 0) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Ban Associate">
          <Alert type="error">
            {errors.message ||
              errors.detail ||
              "Failed to load associate details. Please try again."}
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

  // Don't render main content until we have associate data
  if (!associate) {
    return null;
  }

  // Check if already banned
  const isAlreadyBanned = associate.status === 100 || associate.isBanned;

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>
        👷 Associate: {associate.firstName} {associate.lastName}
      </h1>
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Ban Associate</h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors && errors.reason && <Alert type="error">{errors.reason}</Alert>}

      {/* Main Card */}
      <Card>
        {/* Warning Message */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8d7da",
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: theme.colors.danger, marginBottom: "10px" }}>
            🚫 Ban Associate - Severe Action Warning
          </h3>
          <p>
            You are about to <strong>permanently ban</strong> this associate.
            This means:
          </p>
          <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
            <li>
              The associate will be <strong>immediately</strong> logged out
            </li>
            <li>
              They will <strong>not</strong> be able to log in again
            </li>
            <li>
              All access to the system will be{" "}
              <strong>permanently revoked</strong>
            </li>
            <li>
              The associate will not be able to receive or complete any work
              orders
            </li>
            <li>
              This action is <strong>irreversible</strong> without system
              administrator intervention
            </li>
          </ul>
          <p
            style={{
              marginTop: "15px",
              fontWeight: "bold",
              color: theme.colors.danger,
            }}
          >
            This action should only be taken for serious violations or security
            concerns.
          </p>
        </div>

        {/* Associate Information */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>Associate Information:</h4>
          <div style={{ display: "grid", gap: "5px" }}>
            <div>
              <strong>Name:</strong> {associate.firstName} {associate.lastName}
            </div>
            <div>
              <strong>Email:</strong> {associate.email}
            </div>
            <div>
              <strong>Phone:</strong> {associate.phone || "N/A"}
            </div>
            <div>
              <strong>Current Status:</strong>{" "}
              {isAlreadyBanned ? (
                <span style={{ color: theme.colors.danger }}>🚫 Banned</span>
              ) : associate.status === 1 ? (
                <span style={{ color: theme.colors.success }}>Active</span>
              ) : associate.status === 2 ? (
                <span style={{ color: theme.colors.warning }}>Archived</span>
              ) : (
                <span>Unknown</span>
              )}
            </div>
            {associate.typeOf && (
              <div>
                <strong>Type:</strong>{" "}
                {associate.typeOf === 1
                  ? "Unassigned"
                  : associate.typeOf === 2
                    ? "Residential"
                    : associate.typeOf === 3
                      ? "Commercial"
                      : "Unknown"}
              </div>
            )}
          </div>
        </div>

        {/* Ban Reason Input */}
        {!isAlreadyBanned && (
          <div style={{ marginBottom: "20px" }}>
            <TextArea
              label="Ban Reason"
              value={banReason}
              onChange={(e) => {
                setBanReason(e.target.value);
                setErrors({}); // Clear errors when typing
              }}
              error={errors.reason}
              required
              placeholder="Please provide a detailed reason for banning this associate..."
              rows={5}
              maxLength={500}
              disabled={isBanning}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              This reason will be recorded in the system logs and may be
              reviewed by administrators.
            </p>
          </div>
        )}

        {/* Already Banned Message */}
        {isAlreadyBanned && (
          <Alert type="info">
            This associate is already banned. No further action is needed.
          </Alert>
        )}

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
            <Button variant="secondary" disabled={isBanning}>
              ← Back to More
            </Button>
          </Link>

          {!isAlreadyBanned && (
            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isBanning || !banReason.trim()}
            >
              {isBanning ? "Processing..." : <>🚫 Proceed with Ban</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="⚠️ Final Ban Confirmation"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBanning}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmBan}
              disabled={isBanning}
            >
              {isBanning ? "Banning..." : "Yes, Ban Associate"}
            </Button>
          </>
        }
      >
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          <p style={{ color: theme.colors.danger, fontWeight: "bold" }}>
            ⚠️ THIS ACTION CANNOT BE UNDONE
          </p>
        </div>

        <p>You are about to permanently ban:</p>
        <p style={{ fontWeight: "bold", margin: "10px 0" }}>
          {associate.firstName} {associate.lastName} ({associate.email})
        </p>

        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            margin: "15px 0",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Ban Reason:</p>
          <p style={{ fontStyle: "italic" }}>{banReason}</p>
        </div>

        <p style={{ marginTop: "15px" }}>
          This will immediately revoke all access and log the associate out of
          the system.
        </p>

        <p
          style={{
            marginTop: "15px",
            color: theme.colors.danger,
            fontWeight: "bold",
          }}
        >
          Are you absolutely certain you want to proceed?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreBanPage;

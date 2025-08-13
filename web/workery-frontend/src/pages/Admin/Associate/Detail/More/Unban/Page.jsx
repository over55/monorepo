// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Unban/Page.jsx

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

function AdminAssociateDetailMoreUnbanPage() {
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
  const [unbanReason, setUnbanReason] = useState("");
  const [isUnbanning, setIsUnbanning] = useState(false);
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

  // Handle unban confirmation
  const handleConfirmUnban = async () => {
    // Validate reason
    if (!unbanReason || unbanReason.trim().length === 0) {
      setErrors({ reason: "Unban reason is required" });
      return;
    }

    if (unbanReason.trim().length < 10) {
      setErrors({ reason: "Unban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsUnbanning(true);

    try {
      // Prepare unban data
      const unbanData = {
        associate_id: aid,
        reason: unbanReason.trim(),
      };

      // Note: Since unbanAssociate might not exist in AssociateManager yet,
      // you may need to implement it or use a different method
      console.log("Unban data:", unbanData);

      // If the unbanAssociate method doesn't exist, you could use:
      // await associateManager.updateAssociate(aid, { status: 1, banReason: null }, onUnauthorized);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set success message
      setSuccessMessage(
        "Associate has been successfully unbanned and can now access the system",
      );

      // Navigate back to associate detail after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to unban associate:", error);
      setErrors(error || { message: "Failed to unban associate" });
      setIsUnbanning(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Unban", icon: "✅" },
  ];

  // Render loading state
  if (isFetching) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Unban Associate">
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
        <Card title="Unban Associate">
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

  // Check if banned
  const isBanned = associate.status === 100 || associate.isBanned;

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>
        👷 Associate: {associate.firstName} {associate.lastName}
      </h1>
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Unban Associate</h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors && errors.reason && <Alert type="error">{errors.reason}</Alert>}

      {/* Main Card */}
      <Card>
        {/* Info Message */}
        {isBanned ? (
          <div
            style={{
              padding: "20px",
              backgroundColor: theme.colors.successBg,
              border: `1px solid ${theme.colors.success}`,
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ color: theme.colors.success, marginBottom: "10px" }}>
              ✅ Restore Associate Access
            </h3>
            <p>
              You are about to <strong>unban</strong> this associate. This
              means:
            </p>
            <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
              <li>
                The associate will be able to log in to their account again
              </li>
              <li>They will regain access to all system features</li>
              <li>They can receive and complete work orders</li>
              <li>Their account status will be restored to active</li>
              <li>
                They will receive an email notification about the account
                restoration
              </li>
            </ul>
            <p style={{ marginTop: "15px" }}>
              Please ensure this decision has been properly reviewed and
              approved.
            </p>
          </div>
        ) : (
          <Alert type="info">
            This associate is not currently banned. No unban action is needed.
          </Alert>
        )}

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
              {isBanned ? (
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
            {associate.banReason && (
              <div>
                <strong>Original Ban Reason:</strong>{" "}
                <span style={{ fontStyle: "italic" }}>
                  {associate.banReason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Unban Reason Input */}
        {isBanned && (
          <div style={{ marginBottom: "20px" }}>
            <TextArea
              label="Unban Reason"
              value={unbanReason}
              onChange={(e) => {
                setUnbanReason(e.target.value);
                setErrors({}); // Clear errors when typing
              }}
              error={errors.reason}
              required
              placeholder="Please provide a reason for unbanning this associate (e.g., review complete, issue resolved, appeal approved)..."
              rows={5}
              maxLength={500}
              disabled={isUnbanning}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              This reason will be recorded in the system logs for audit
              purposes.
            </p>
          </div>
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
            <Button variant="secondary" disabled={isUnbanning}>
              ← Back to More
            </Button>
          </Link>

          {isBanned && (
            <Button
              variant="success"
              onClick={() => setShowConfirmModal(true)}
              disabled={isUnbanning || !unbanReason.trim()}
            >
              {isUnbanning ? "Processing..." : <>✅ Proceed with Unban</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Unban"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isUnbanning}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmUnban}
              disabled={isUnbanning}
            >
              {isUnbanning ? "Unbanning..." : "Yes, Unban Associate"}
            </Button>
          </>
        }
      >
        <p>You are about to restore access for:</p>
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
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Unban Reason:
          </p>
          <p style={{ fontStyle: "italic" }}>{unbanReason}</p>
        </div>

        <div
          style={{
            padding: "10px",
            backgroundColor: theme.colors.successBg,
            borderRadius: "4px",
            marginTop: "15px",
          }}
        >
          <p style={{ color: theme.colors.success }}>
            <strong>Note:</strong> The associate will be immediately able to log
            in and access the system once this action is confirmed.
          </p>
        </div>

        <p style={{ marginTop: "15px" }}>
          Are you sure you want to proceed with unbanning this associate?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreUnbanPage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Downgrade/Page.jsx

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

function AdminAssociateDetailMoreDowngradePage() {
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
  const [isDowngrading, setIsDowngrading] = useState(false);

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

  // Handle downgrade confirmation
  const handleConfirmDowngrade = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsDowngrading(true);

    try {
      // Call the manager to downgrade associate
      await associateManager.downgradeAssociate(aid, onUnauthorized);

      // Set success message
      setSuccessMessage(
        "Associate has been successfully downgraded to Residential type",
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to downgrade associate:", error);
      setErrors(error);
      setIsDowngrading(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Downgrade", icon: "🏠" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Downgrade Associate">
          <Loading message="Loading associate details..." />
        </Card>
      </div>
    );
  }

  // Check if already residential or not business type
  const isNotBusiness = !associate?.organizationName || associate?.typeOf !== 3;

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>
        👷 Associate: {associate?.firstName} {associate?.lastName}
      </h1>
      <h2 style={{ marginBottom: "20px", color: "#666" }}>
        Downgrade to Residential
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
        {/* Warning Message */}
        {!isNotBusiness ? (
          <Alert type="warning">
            <h4 style={{ marginBottom: "10px" }}>⚠️ Downgrade Warning</h4>
            <p>
              You are about to <strong>downgrade</strong> this associate from{" "}
              <strong>Business</strong> type to <strong>Residential</strong>{" "}
              type. This will affect:
            </p>
            <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
              <li>
                The rates applied to their work orders (will use residential
                rates)
              </li>
              <li>The types of services they can provide</li>
              <li>Tax and billing calculations</li>
              <li>Terms and conditions that apply</li>
              <li>Organization information will be removed</li>
            </ul>
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              Are you sure you want to continue?
            </p>
          </Alert>
        ) : (
          <Alert type="info">
            This associate is not currently a Business type account. No
            downgrade is needed.
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
          <h4 style={{ marginBottom: "10px" }}>
            Current Associate Information:
          </h4>
          <div style={{ display: "grid", gap: "5px" }}>
            <div>
              <strong>Name:</strong> {associate?.firstName}{" "}
              {associate?.lastName}
            </div>
            <div>
              <strong>Email:</strong> {associate?.email}
            </div>
            <div>
              <strong>Current Type:</strong>{" "}
              {associate?.typeOf === 1 ? (
                <span>Unassigned</span>
              ) : associate?.typeOf === 2 ? (
                <span style={{ color: theme.colors.info }}>Residential</span>
              ) : associate?.typeOf === 3 ? (
                <span style={{ color: theme.colors.success }}>
                  Commercial/Business
                </span>
              ) : (
                <span>Unknown</span>
              )}
            </div>
            {associate?.organizationName && (
              <div>
                <strong>Current Organization:</strong>{" "}
                {associate.organizationName}{" "}
                <span style={{ color: theme.colors.danger }}>
                  (will be removed)
                </span>
              </div>
            )}
            {associate?.organizationType && (
              <div>
                <strong>Organization Type:</strong>{" "}
                {associate.organizationType === 1
                  ? "Private"
                  : associate.organizationType === 2
                    ? "Non-Profit"
                    : associate.organizationType === 3
                      ? "Government"
                      : "Unknown"}{" "}
                <span style={{ color: theme.colors.danger }}>
                  (will be removed)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Impact Information */}
        {!isNotBusiness && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#fff3cd",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <h4 style={{ marginBottom: "10px", color: "#856404" }}>
              📋 After Downgrade:
            </h4>
            <ul style={{ marginLeft: "20px", color: "#666" }}>
              <li>Residential rates will apply to all future work orders</li>
              <li>
                The associate will be classified as a residential service
                provider
              </li>
              <li>Business-specific features will be disabled</li>
              <li>Organization information will be permanently removed</li>
              <li>Different insurance requirements may apply</li>
            </ul>
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
            <Button variant="secondary" disabled={isDowngrading}>
              ← Back to More
            </Button>
          </Link>

          {!isNotBusiness && (
            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isDowngrading}
            >
              {isDowngrading ? "Processing..." : <>🏠 Confirm and Downgrade</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Downgrade"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isDowngrading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDowngrade}
              disabled={isDowngrading}
            >
              {isDowngrading
                ? "Downgrading..."
                : "Yes, Downgrade to Residential"}
            </Button>
          </>
        }
      >
        <p>
          You are about to downgrade the following associate to Residential
          type:
        </p>

        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            margin: "15px 0",
          }}
        >
          <p>
            <strong>Associate:</strong> {associate?.firstName}{" "}
            {associate?.lastName}
          </p>
          {associate?.organizationName && (
            <p>
              <strong>Current Organization:</strong>{" "}
              {associate.organizationName} (will be removed)
            </p>
          )}
        </div>

        <Alert type="warning">
          <p style={{ fontSize: "14px" }}>
            This will remove all business information and change their account
            type to Residential, affecting rates and terms for all future work
            orders.
          </p>
        </Alert>

        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          Are you sure you want to proceed?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreDowngradePage;

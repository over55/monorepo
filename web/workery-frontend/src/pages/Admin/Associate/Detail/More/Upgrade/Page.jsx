// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Upgrade/Page.jsx

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
  Select,
} from "../../../../../../components/UI";

// Organization type options
const ASSOCIATE_ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "1", label: "Private" },
  { value: "2", label: "Non-Profit" },
  { value: "3", label: "Government" },
];

function AdminAssociateDetailMoreUpgradePage() {
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
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

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

    if (!organizationName || organizationName.trim().length === 0) {
      newErrors.organizationName = "Organization name is required";
    } else if (organizationName.trim().length < 2) {
      newErrors.organizationName =
        "Organization name must be at least 2 characters";
    }

    if (!organizationType || organizationType === "") {
      newErrors.organizationType = "Organization type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle upgrade confirmation
  const handleConfirmUpgrade = async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsUpgrading(true);

    try {
      // Prepare upgrade data
      const upgradeData = {
        associate_id: aid,
        organization_name: organizationName.trim(),
        organization_type: parseInt(organizationType),
      };

      // Call the manager to upgrade associate
      await associateManager.upgradeAssociate(upgradeData, onUnauthorized);

      // Set success message
      setSuccessMessage(
        "Associate has been successfully upgraded to Business type",
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade associate:", error);
      setErrors(error);
      setIsUpgrading(false);
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
    { label: "Upgrade", icon: "🏢" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Upgrade Associate">
          <Loading message="Loading associate details..." />
        </Card>
      </div>
    );
  }

  // Check if already business type
  const isAlreadyBusiness =
    associate?.typeOf === 3 || associate?.organizationName;

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>
        👷 Associate: {associate?.firstName} {associate?.lastName}
      </h1>
      <h2 style={{ marginBottom: "20px", color: "#666" }}>
        Upgrade to Business
      </h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors &&
        Object.keys(errors).length > 0 &&
        !errors.organizationName &&
        !errors.organizationType && (
          <Alert type="error">
            {errors.message ||
              errors.detail ||
              "An error occurred. Please try again."}
          </Alert>
        )}

      {/* Main Card */}
      <Card>
        {/* Warning Message */}
        {!isAlreadyBusiness ? (
          <Alert type="warning">
            <h4 style={{ marginBottom: "10px" }}>⚠️ Upgrade Warning</h4>
            <p>
              You are about to <strong>upgrade</strong> this associate from{" "}
              <strong>Residential</strong> type to <strong>Business</strong>{" "}
              type. This will affect:
            </p>
            <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
              <li>The rates applied to their work orders</li>
              <li>The types of services they can provide</li>
              <li>Tax and billing requirements</li>
              <li>Terms and conditions that apply</li>
            </ul>
            <p style={{ marginTop: "10px" }}>
              Please ensure you have the correct business information before
              proceeding.
            </p>
          </Alert>
        ) : (
          <Alert type="info">
            This associate is already a Business type account. No upgrade is
            needed.
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
                {associate.organizationName}
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Form */}
        {!isAlreadyBusiness && (
          <>
            <div style={{ marginTop: "20px" }}>
              <Input
                label="Organization Name"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  if (errors.organizationName) {
                    setErrors({ ...errors, organizationName: undefined });
                  }
                }}
                error={errors.organizationName}
                required
                placeholder="Enter the business/organization name"
                disabled={isUpgrading}
              />

              <Select
                label="Organization Type"
                value={organizationType}
                onChange={(e) => {
                  setOrganizationType(e.target.value);
                  if (errors.organizationType) {
                    setErrors({ ...errors, organizationType: undefined });
                  }
                }}
                options={ASSOCIATE_ORGANIZATION_TYPE_OPTIONS}
                error={errors.organizationType}
                required
                disabled={isUpgrading}
              />
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                marginTop: "20px",
              }}
            >
              <h4 style={{ marginBottom: "10px", color: "#1976d2" }}>
                📋 After Upgrade:
              </h4>
              <ul style={{ marginLeft: "20px", color: "#666" }}>
                <li>Business rates will apply to all future work orders</li>
                <li>
                  The associate will be classified as a commercial service
                  provider
                </li>
                <li>Business documentation may be required</li>
                <li>Different insurance requirements may apply</li>
              </ul>
            </div>
          </>
        )}

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
            <Button variant="secondary" disabled={isUpgrading}>
              ← Back to More
            </Button>
          </Link>

          {!isAlreadyBusiness && (
            <Button
              variant="success"
              onClick={handleConfirmClick}
              disabled={isUpgrading || !organizationName || !organizationType}
            >
              {isUpgrading ? "Processing..." : <>🏢 Confirm and Upgrade</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Upgrade"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isUpgrading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Upgrading..." : "Yes, Upgrade to Business"}
            </Button>
          </>
        }
      >
        <p>
          You are about to upgrade the following associate to Business type:
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
          <p>
            <strong>Organization Name:</strong> {organizationName}
          </p>
          <p>
            <strong>Organization Type:</strong>{" "}
            {
              ASSOCIATE_ORGANIZATION_TYPE_OPTIONS.find(
                (opt) => opt.value === organizationType,
              )?.label
            }
          </p>
        </div>

        <p style={{ marginTop: "15px" }}>
          This will change their account type from Residential to Business,
          affecting rates and terms.
        </p>

        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          Are you sure you want to proceed?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreUpgradePage;

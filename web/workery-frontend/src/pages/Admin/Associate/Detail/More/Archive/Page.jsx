// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Archive/Page.jsx

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

function AdminAssociateDetailMoreArchivePage() {
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

  // Handle archive confirmation
  const handleConfirmArchive = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      // Call the manager to archive associate
      await associateManager.archiveAssociate(aid, onUnauthorized);

      // Set success message
      setSuccessMessage("Associate has been successfully archived");

      // Navigate to associates list after a short delay
      setTimeout(() => {
        navigate("/admin/associates");
      }, 2000);
    } catch (error) {
      console.error("Failed to archive associate:", error);
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
    { label: "Archive", icon: "📦" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Archive Associate">
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
        <Card title="Archive Associate">
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
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Archive Associate</h2>

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
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#856404", marginBottom: "10px" }}>
            ⚠️ Archive Associate - Are you sure?
          </h3>
          <p>
            You are about to <strong>archive</strong> this associate. This
            means:
          </p>
          <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
            <li>
              The associate will no longer appear in the active associates list
            </li>
            <li>The associate will not be able to log in to their account</li>
            <li>
              All current assignments and tasks will remain but the associate
              cannot receive new ones
            </li>
            <li>
              This action can be undone by contacting a system administrator
            </li>
          </ul>
          <p style={{ marginTop: "15px", fontWeight: "bold" }}>
            Are you sure you would like to continue?
          </p>
        </div>

        {/* Associate Information */}
        {associate && (
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
                <strong>Name:</strong> {associate.firstName}{" "}
                {associate.lastName}
              </div>
              <div>
                <strong>Email:</strong> {associate.email}
              </div>
              <div>
                <strong>Phone:</strong> {associate.phone || "N/A"}
              </div>
              <div>
                <strong>Current Status:</strong>{" "}
                {associate.status === 1 ? (
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
            <Button variant="secondary" disabled={isFetching}>
              ← Back to More
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={() => setShowConfirmModal(true)}
            disabled={isFetching || associate?.status === 2}
          >
            {isFetching ? (
              "Processing..."
            ) : associate?.status === 2 ? (
              "Already Archived"
            ) : (
              <>📦 Confirm and Archive</>
            )}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Archive"
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
              variant="danger"
              onClick={handleConfirmArchive}
              disabled={isFetching}
            >
              {isFetching ? "Archiving..." : "Yes, Archive"}
            </Button>
          </>
        }
      >
        <p>
          <strong>Final Confirmation</strong>
        </p>
        <p style={{ marginTop: "10px" }}>
          You are about to archive{" "}
          <strong>
            {associate?.firstName} {associate?.lastName}
          </strong>
          .
        </p>
        <p style={{ marginTop: "10px" }}>
          This action will remove the associate from all active lists and
          prevent them from logging in. The action can only be reversed by a
          system administrator.
        </p>
        <p style={{ marginTop: "15px", color: theme.colors.danger }}>
          Are you absolutely sure you want to proceed?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreArchivePage;

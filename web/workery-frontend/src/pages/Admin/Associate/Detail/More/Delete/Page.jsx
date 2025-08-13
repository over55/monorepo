// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Delete/Page.jsx

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

function AdminAssociateDetailMoreDeletePage() {
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
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsDeleting(true);

    try {
      // Call the manager to delete associate
      await associateManager.deleteAssociate(aid, onUnauthorized);

      // Set success message
      setSuccessMessage("Associate has been permanently deleted");

      // Navigate to associates list after a short delay
      setTimeout(() => {
        navigate("/admin/associates");
      }, 2000);
    } catch (error) {
      console.error("Failed to delete associate:", error);
      setErrors(error);
      setIsDeleting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Delete", icon: "🗑️" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Delete Associate">
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
        <Card title="Delete Associate">
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
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Delete Associate</h2>

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
        {/* Critical Warning Message */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8d7da",
            border: `2px solid ${theme.colors.danger}`,
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: theme.colors.danger, marginBottom: "10px" }}>
            🗑️ Delete Associate - Critical Action Warning
          </h3>
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            ⚠️ THIS IS A PERMANENT ACTION ⚠️
          </p>
          <p>
            You are about to <strong>permanently delete</strong> this associate.
            This means:
          </p>
          <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
            <li>
              All associate data will be <strong>permanently removed</strong>{" "}
              from the database
            </li>
            <li>
              All related records, work orders, and history will be affected
            </li>
            <li>
              The associate's account will be <strong>completely erased</strong>
            </li>
            <li>
              This action <strong>CANNOT be undone</strong> without database
              restoration
            </li>
            <li>
              Recovery will require system administrator intervention and may
              not be possible
            </li>
          </ul>
          <p
            style={{
              marginTop: "15px",
              fontWeight: "bold",
              color: theme.colors.danger,
            }}
          >
            ⚠️ Consider archiving instead if you want to preserve the data but
            deactivate the account.
          </p>
        </div>

        {/* Alternative Actions */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ color: "#856404", marginBottom: "10px" }}>
            💡 Consider Alternative Actions
          </h4>
          <p>Before permanently deleting, consider these alternatives:</p>
          <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
            <li>
              <strong>Archive:</strong> Deactivates the account but preserves
              all data
              <Link
                to={`/admin/associate/${aid}/archive`}
                style={{ marginLeft: "10px", color: theme.colors.primary }}
              >
                Archive instead →
              </Link>
            </li>
            <li>
              <strong>Ban:</strong> Blocks access but keeps the account for
              records
              <Link
                to={`/admin/associate/${aid}/ban`}
                style={{ marginLeft: "10px", color: theme.colors.primary }}
              >
                Ban instead →
              </Link>
            </li>
          </ul>
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
            <h4 style={{ marginBottom: "10px" }}>
              Associate Information to be Deleted:
            </h4>
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
              {associate.joinDate && (
                <div>
                  <strong>Join Date:</strong> {associate.joinDate}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Confirmation Text */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "#ffe5e5",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: theme.colors.danger, fontWeight: "bold" }}>
            Are you absolutely certain you want to permanently delete this
            associate?
          </p>
          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            Type the associate's email address to confirm deletion:{" "}
            <strong>{associate?.email}</strong>
          </p>
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
            <Button variant="secondary" disabled={isDeleting}>
              ← Back to More
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={() => setShowConfirmModal(true)}
            disabled={isDeleting || associate?.status === 100}
          >
            {isDeleting ? (
              "Processing..."
            ) : (
              <>🗑️ I Understand, Delete Permanently</>
            )}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="⚠️ FINAL DELETE CONFIRMATION"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isDeleting}
            >
              Cancel - Keep Associate
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "DELETE PERMANENTLY"}
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
          <p
            style={{
              color: theme.colors.danger,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ⚠️ THIS ACTION CANNOT BE UNDONE ⚠️
          </p>
        </div>

        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
          You are about to permanently delete:
        </p>

        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            margin: "10px 0",
          }}
        >
          <p>
            <strong>Name:</strong> {associate?.firstName} {associate?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {associate?.email}
          </p>
          <p>
            <strong>ID:</strong> {aid}
          </p>
        </div>

        <p style={{ marginTop: "15px", color: theme.colors.danger }}>
          <strong>
            All data related to this associate will be permanently erased.
          </strong>
        </p>

        <p style={{ marginTop: "15px" }}>
          This includes all work orders, comments, attachments, and any other
          associated records.
        </p>

        <p
          style={{
            marginTop: "20px",
            fontWeight: "bold",
            color: theme.colors.danger,
          }}
        >
          Are you ABSOLUTELY CERTAIN you want to proceed?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateDetailMoreDeletePage;

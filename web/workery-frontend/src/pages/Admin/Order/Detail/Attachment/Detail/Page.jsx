// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAttachmentManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../../components/UI";

function AdminOrderDetailAttachmentDetailPage() {
  const { oid, aid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (aid) {
      fetchAttachmentDetail(aid);
    }
    window.scrollTo(0, 0);
  }, [aid]);

  const fetchAttachmentDetail = async (attachmentId) => {
    try {
      setFetching(true);
      setErrors({});

      const response = await attachmentManager.getAttachmentDetail(
        attachmentId,
        onUnauthorized,
      );
      setAttachment(response);
    } catch (error) {
      console.error("Failed to fetch attachment detail:", error);
      setErrors({ general: "Failed to load details" });
    } finally {
      setFetching(false);
    }
  };

  // Delete handlers
  const onSelectAttachmentForDeletion = () => {
    setShowDeleteModal(true);
  };

  const onDeleteConfirmButtonClick = async () => {
    try {
      setFetching(true);
      setShowDeleteModal(false);

      await attachmentManager.deleteAttachment(aid, onUnauthorized);

      setAlertMessage("Attachment deleted successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to delete attachment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
    }
  };

  // Download handler
  const onDownloadClick = async () => {
    try {
      const fileBlob = await attachmentManager.downloadAttachment(
        aid,
        null,
        onUnauthorized,
      );

      // Trigger download
      attachmentManager.triggerFileDownload(
        fileBlob,
        attachment?.filename || "download",
      );
    } catch (error) {
      console.error("Failed to download attachment:", error);
      setAlertMessage("Failed to download attachment");
      setAlertStatus("error");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    {
      path: `/admin/order/${oid}/attachments`,
      label: "Detail (Attachments)",
      icon: "📎",
    },
    { label: "Attachment", icon: "📄" },
  ];

  // Data display row component
  const DataRow = ({ label, value }) => (
    <div style={{ marginBottom: "15px" }}>
      <strong>{label}:</strong> {value || "N/A"}
    </div>
  );

  if (!authManager.isAuthenticated()) {
    return <Loading message="Checking authentication..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {alertMessage && (
        <Alert
          type={alertStatus}
          onClose={() => {
            setAlertMessage("");
            setAlertStatus("");
          }}
        >
          {alertMessage}
        </Alert>
      )}

      <h1>🔧 Work Order - Attachment Detail</h1>

      <Card
        title="📄 Attachment"
        actions={
          attachment && (
            <>
              <Link to={`/admin/order/${oid}/attachment/${aid}/edit`}>
                <Button variant="warning" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={onSelectAttachmentForDeletion}
              >
                🗑️ Delete
              </Button>
            </>
          )
        }
      >
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

            {attachment && (
              <>
                <DataRow label="Title" value={attachment.title} />
                <DataRow label="Description" value={attachment.description} />

                <div style={{ marginBottom: "15px" }}>
                  <strong>File:</strong>{" "}
                  <button
                    onClick={onDownloadClick}
                    style={{
                      color: theme.colors.primary,
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    📥 {attachment.filename || "Download File"}
                  </button>
                </div>

                <DataRow
                  label="File Size"
                  value={
                    attachment.fileSize
                      ? `${(attachment.fileSize / 1024).toFixed(2)} KB`
                      : "N/A"
                  }
                />
                <DataRow label="File Type" value={attachment.fileType} />
                <DataRow label="Created At" value={attachment.createdAt} />
                <DataRow label="Updated At" value={attachment.updatedAt} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginTop: "30px",
                  }}
                >
                  <Link to={`/admin/order/${oid}/attachments`}>
                    <Button variant="secondary">← Back to Attachments</Button>
                  </Link>
                  <Link to={`/admin/order/${oid}/attachment/${aid}/edit`}>
                    <Button variant="warning">✏️ Edit</Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={onDeleteConfirmButtonClick}>
              Confirm
            </Button>
          </>
        }
      >
        <p>
          You are about to <strong>permanently delete</strong> this attachment.
          This action cannot be undone. Are you sure you would like to continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminOrderDetailAttachmentDetailPage;

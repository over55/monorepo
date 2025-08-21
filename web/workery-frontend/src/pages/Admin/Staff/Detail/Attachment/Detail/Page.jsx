// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAttachmentManager } from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../../components/UI";

function AdminStaffDetailAttachmentDetailPage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();

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
    fetchData();
    window.scrollTo(0, 0);
  }, [aid, atid]);

  const fetchData = async () => {
    try {
      setFetching(true);

      // Fetch attachment details
      const attachmentData = await attachmentManager.getAttachmentDetail(
        atid,
        onUnauthorized,
      );

      setAttachment(attachmentData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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

      await attachmentManager.deleteAttachment(atid, onUnauthorized);

      setAlertMessage("Attachment deleted successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/attachments`);
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
      const blob = await attachmentManager.downloadAttachment(
        atid,
        null,
        onUnauthorized,
      );

      // Trigger download
      attachmentManager.triggerFileDownload(
        blob,
        attachment?.filename || attachment?.fileName || "download",
      );
    } catch (error) {
      console.error("Failed to download attachment:", error);
      setAlertMessage("Failed to download attachment");
      setAlertStatus("error");
    }
  };

  // Format date helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/staff", label: "Staff", icon: "👔" },
    {
      path: `/admin/staff/${aid}/attachments`,
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

      <h1>👔 Staff - Attachment Detail</h1>

      <Card
        title="📄 Attachment"
        actions={
          attachment && (
            <>
              <Link to={`/admin/staff/${aid}/attachment/${atid}/edit`}>
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
                    📥{" "}
                    {attachment.filename ||
                      attachment.fileName ||
                      "Download File"}
                  </button>
                </div>

                <DataRow
                  label="File Size"
                  value={formatFileSize(attachment.fileSize)}
                />
                <DataRow label="File Type" value={attachment.fileType} />
                <DataRow
                  label="Created At"
                  value={formatDateTime(attachment.createdAt)}
                />
                <DataRow
                  label="Created By"
                  value={attachment.createdByUserName}
                />
                <DataRow
                  label="Modified At"
                  value={formatDateTime(attachment.modifiedAt)}
                />
                <DataRow
                  label="Modified By"
                  value={attachment.modifiedByUserName}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginTop: "30px",
                  }}
                >
                  <Link to={`/admin/staff/${aid}/attachments`}>
                    <Button variant="secondary">← Back to Attachments</Button>
                  </Link>
                  <Link to={`/admin/staff/${aid}/attachment/${atid}/edit`}>
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

export default AdminStaffDetailAttachmentDetailPage;

// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAttachmentManager } from "../../../../../../services/Services";
import { theme } from "../../../../../../constants/Theme";
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

  // Services
  const attachmentManager = useAttachmentManager();

  // Component state
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    {
      label: "Attachments",
      path: `/admin/staff/${aid}/attachments`,
      icon: "📎",
    },
    { label: "Detail", icon: "📄" },
  ];

  // Fetch attachment detail
  const fetchAttachmentDetail = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await attachmentManager.getAttachmentDetail(
        atid,
        onUnauthorized,
      );
      setAttachment(response);
    } catch (error) {
      console.error("Error fetching attachment detail:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Delete handler
  const handleDelete = async () => {
    setIsDeleting(true);
    setErrors({});

    try {
      await attachmentManager.deleteAttachment(atid, onUnauthorized);

      // Show success and redirect
      navigate(`/admin/staff/${aid}/attachments`, {
        state: { message: "Attachment deleted successfully" },
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      setErrors(error);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Download handler
  const handleDownload = async () => {
    try {
      const blob = await attachmentManager.downloadAttachment(
        atid,
        null,
        onUnauthorized,
      );

      // Trigger download
      attachmentManager.triggerFileDownload(
        blob,
        attachment.filename || "download",
      );
    } catch (error) {
      console.error("Error downloading attachment:", error);
      setErrors({ download: "Failed to download file" });
    }
  };

  // Format date helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Effect
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAttachmentDetail();
  }, [atid]);

  // Data table component
  const DataTable = ({ title, children }) => (
    <table
      style={{
        width: "100%",
        marginBottom: "30px",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#333" }}>
          <th
            colSpan="2"
            style={{
              color: "white",
              padding: "10px",
              textAlign: "left",
            }}
          >
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );

  // Data row component
  const DataRow = ({ label, value }) => (
    <tr>
      <th
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          width: "30%",
          borderBottom: "1px solid #ddd",
          textAlign: "left",
        }}
      >
        {label}
      </th>
      <td
        style={{
          padding: "10px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {value}
      </td>
    </tr>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading attachment details..." />
      </div>
    );
  }

  // Render error state if attachment not found
  if (!attachment) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="warning">Attachment not found.</Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to={`/admin/staff/${aid}/attachments`}>
            <Button variant="secondary">← Back to Attachments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>
            📄 Attachment Detail
          </h1>
          <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
            {attachment.title || attachment.filename}
          </h4>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/admin/staff/${aid}/attachment/${atid}/edit`}>
            <Button variant="warning">✏️ Edit</Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {typeof errors === "string"
            ? errors
            : errors.message || "An error occurred."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Attachment Information */}
        <DataTable title="Attachment Information">
          <DataRow label="Title" value={attachment.title || "-"} />
          <DataRow label="Description" value={attachment.description || "-"} />
          <DataRow label="File Name" value={attachment.filename || "-"} />
          <DataRow
            label="File Size"
            value={formatFileSize(attachment.fileSize)}
          />
          <DataRow label="File Type" value={attachment.fileType || "-"} />
          <DataRow
            label="Download"
            value={
              <Button size="sm" variant="primary" onClick={handleDownload}>
                ⬇️ Download File
              </Button>
            }
          />
        </DataTable>

        {/* System Information */}
        <DataTable title="System Information">
          <DataRow label="ID" value={attachment.id || "-"} />
          <DataRow
            label="Created At"
            value={formatDateTime(attachment.createdAt)}
          />
          <DataRow
            label="Created By"
            value={attachment.createdByUserName || "-"}
          />
          <DataRow
            label="Modified At"
            value={formatDateTime(attachment.modifiedAt)}
          />
          <DataRow
            label="Modified By"
            value={attachment.modifiedByUserName || "-"}
          />
        </DataTable>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link to={`/admin/staff/${aid}/attachments`}>
            <Button variant="secondary">← Back to Attachments</Button>
          </Link>
          <Link to={`/admin/staff/${aid}/attachment/${atid}/edit`}>
            <Button variant="warning">✏️ Edit Attachment</Button>
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="⚠️ Confirm Deletion"
        footer={
          <>
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </>
        }
      >
        <p>
          You are about to <strong>permanently delete</strong> this attachment.
          This action cannot be undone.
        </p>
        <p>Are you sure you want to continue?</p>
      </Modal>
    </div>
  );
}

export default AdminStaffDetailAttachmentDetailPage;

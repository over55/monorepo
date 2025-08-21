// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAttachmentManager } from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
} from "../../../../../../components/UI";

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function AdminStaffDetailAttachmentUpdatePage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();

  // Component state
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch attachment detail on mount
  useEffect(() => {
    fetchAttachmentDetail();
    window.scrollTo(0, 0);
  }, [atid]);

  const fetchAttachmentDetail = async () => {
    try {
      setFetching(true);
      setErrors({});

      const response = await attachmentManager.getAttachmentDetail(
        atid,
        onUnauthorized,
      );

      setAttachment(response);
      setTitle(response.title || "");
      setDescription(response.description || "");
    } catch (error) {
      console.error("Error fetching attachment detail:", error);
      setErrors({ general: "Failed to load attachment details" });
    } finally {
      setFetching(false);
    }
  };

  // Event handlers
  const onHandleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors({
          file: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Starting...");
    setFetching(true);
    setErrors({});
    setUploadProgress(0);

    try {
      // Validate inputs
      if (!title || !title.trim()) {
        setErrors({ title: "Title is required" });
        setFetching(false);
        return;
      }

      // Check if we need to upload a new file or just update metadata
      if (selectedFile) {
        // Upload new file with updated metadata
        const metadata = {
          title: title.trim(),
          description: description.trim(),
          entityId: aid,
          entityType: "4", // ATTACHMENT_OWNERSHIP_TYPE.STAFF
        };

        // Delete old attachment and upload new one
        await attachmentManager.deleteAttachment(atid, onUnauthorized);
        await attachmentManager.uploadAttachment(
          selectedFile,
          metadata,
          (progress) => setUploadProgress(progress),
          onUnauthorized,
        );
      } else {
        // Just update metadata
        const updateData = {
          title: title.trim(),
          description: description.trim(),
        };

        await attachmentManager.updateAttachment(
          atid,
          updateData,
          onUnauthorized,
        );
      }

      // Show success message
      setAlertMessage("Attachment updated successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to update attachment");
      setAlertStatus("error");
      setUploadProgress(0);
    } finally {
      setFetching(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
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
    {
      path: `/admin/staff/${aid}/attachment/${atid}`,
      label: "Attachment",
      icon: "📄",
    },
    { label: "Edit", icon: "✏️" },
  ];

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

      <h1>👔 Staff - Edit Attachment</h1>

      <Card title="✏️ Edit Attachment">
        {isFetching ? (
          <Loading message="Processing..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

            <Alert type="warning">
              <strong>Warning:</strong> Uploading a new file will replace the
              existing file.
            </Alert>

            <Input
              label="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
              placeholder="Enter attachment title"
            />

            <TextArea
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Enter attachment description (optional)"
              rows={4}
            />

            <div style={{ marginBottom: "20px" }}>
              <label style={globalStyles.label}>
                <strong>File (Optional)</strong>
              </label>
              <p
                style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
              >
                Current file:{" "}
                {attachment?.filename || attachment?.fileName || "Unknown"}
                {attachment &&
                  attachment.fileSize &&
                  ` (${formatFileSize(attachment.fileSize)})`}
              </p>
              {selectedFile ? (
                <Alert type="success">
                  ✅ New file ready to upload: {selectedFile.name}
                  {uploadProgress > 0 && ` (${uploadProgress}%)`}
                </Alert>
              ) : (
                <input
                  name="file"
                  type="file"
                  onChange={onHandleFileChange}
                  style={{ display: "block", marginTop: "5px" }}
                />
              )}
              {errors.file && (
                <div style={globalStyles.errorMessage}>{errors.file}</div>
              )}
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "5px",
                }}
              >
                Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <Link to={`/admin/staff/${aid}/attachment/${atid}`}>
                <Button variant="secondary">← Back to Detail</Button>
              </Link>
              <Button
                variant="success"
                onClick={onSubmitClick}
                disabled={!title}
              >
                ✓ Save
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailAttachmentUpdatePage;

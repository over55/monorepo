// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Update/Page.jsx

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    {
      label: "Attachments",
      path: `/admin/staff/${aid}/attachments`,
      icon: "📎",
    },
    {
      label: "Detail",
      path: `/admin/staff/${aid}/attachment/${atid}`,
      icon: "📄",
    },
    { label: "Edit", icon: "✏️" },
  ];

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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
      setTitle(response.title || "");
      setDescription(response.description || "");
    } catch (error) {
      console.error("Error fetching attachment detail:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  // File change handler
  const handleFileChange = (event) => {
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

  // Submit handler
  const handleSubmit = async () => {
    // Validation
    const validationErrors = {};

    if (!title || !title.trim()) {
      validationErrors.title = "Title is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setUploadProgress(0);

    try {
      // Check if we need to upload a new file or just update metadata
      if (selectedFile) {
        // Upload new file with updated metadata
        const metadata = {
          title: title.trim(),
          description: description.trim(),
          entityId: aid,
          entityType: "4", // ATTACHMENT_OWNERSHIP_TYPE.STAFF
        };

        // Note: You might need to implement a replace attachment method
        // For now, we'll delete old and upload new
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

      // Success - redirect to attachment detail
      navigate(`/admin/staff/${aid}/attachment/${atid}`, {
        state: { message: "Attachment updated successfully" },
      });
    } catch (error) {
      console.error("Error updating attachment:", error);
      setErrors(error);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Effect
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAttachmentDetail();
  }, [atid]);

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
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>
          👔 Staff Member
        </h1>
        <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
          ✏️ Edit Attachment
        </h4>
      </div>

      {/* Warning Message */}
      <Alert type="warning" style={{ marginBottom: "20px" }}>
        <strong>⚠️ Warning:</strong> Uploading a new file will replace the
        existing file permanently.
      </Alert>

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {typeof errors === "string" ? (
            errors
          ) : errors.message ? (
            errors.message
          ) : (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Main Card */}
      <Card title="📎 Edit Attachment">
        {isSubmitting ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loading message="Updating attachment..." />
            {uploadProgress > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "30px",
                      backgroundColor: theme.colors.success,
                      transition: "width 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Input
              label="Title"
              name="title"
              placeholder="Enter attachment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
              maxLength={255}
            />

            <TextArea
              label="Description (Optional)"
              name="description"
              placeholder="Enter attachment description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              rows={4}
              maxLength={1000}
            />

            {/* Current File Info */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Current File
              </label>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                <div style={{ fontSize: "14px" }}>
                  📄 {attachment.filename || "Unknown file"}
                  <br />
                  📊 Size: {formatFileSize(attachment.fileSize)}
                  <br />
                  📁 Type: {attachment.fileType || "Unknown"}
                </div>
              </div>
            </div>

            {/* Replace File Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Replace File (Optional)
              </label>

              {selectedFile ? (
                <div
                  style={{
                    backgroundColor: "#fff3cd",
                    padding: "15px",
                    borderRadius: "4px",
                    border: "1px solid #ffeeba",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <strong>⚠️ New file will replace the current file:</strong>
                  </div>
                  <div style={{ fontSize: "14px", color: "#856404" }}>
                    📄 {selectedFile.name}
                    <br />
                    📊 Size: {formatFileSize(selectedFile.size)}
                    <br />
                    📁 Type: {selectedFile.type || "Unknown"}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedFile(null);
                      document.getElementById("file-input").value = null;
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    ❌ Cancel File Replacement
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    id="file-input"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    style={{
                      padding: "10px",
                      border: errors.file
                        ? "1px solid #dc3545"
                        : "1px solid #ddd",
                      borderRadius: "4px",
                      width: "100%",
                      backgroundColor: "#fff",
                    }}
                  />
                  {errors.file && (
                    <div
                      style={{
                        color: theme.colors.error,
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.file}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Leave empty to keep the current file. Maximum file size:{" "}
                    {MAX_FILE_SIZE / (1024 * 1024)}MB
                  </div>
                </>
              )}
            </div>

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
              <Link to={`/admin/staff/${aid}/attachment/${atid}`}>
                <Button variant="secondary">← Back to Detail</Button>
              </Link>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                ✓ Save Changes
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailAttachmentUpdatePage;

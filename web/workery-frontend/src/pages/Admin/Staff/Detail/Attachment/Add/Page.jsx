// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Add/Page.jsx

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
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function AdminStaffDetailAttachmentAddPage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();

  // Component state
  const [errors, setErrors] = useState({});
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
    { label: "Add", icon: "➕" },
  ];

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
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
      setErrors({});
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validation
    const validationErrors = {};

    if (!title || !title.trim()) {
      validationErrors.title = "Title is required";
    }

    if (!selectedFile) {
      validationErrors.file = "Please select a file to upload";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setUploadProgress(0);

    try {
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        entityId: aid,
        entityType: String(ATTACHMENT_OWNERSHIP_TYPE.STAFF),
      };

      await attachmentManager.uploadAttachment(
        selectedFile,
        metadata,
        (progress) => setUploadProgress(progress),
        onUnauthorized,
      );

      // Success - redirect to attachments list
      navigate(`/admin/staff/${aid}/attachments`, {
        state: { message: "Attachment uploaded successfully" },
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
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
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>
          👔 Staff Member
        </h1>
        <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
          ➕ Add Attachment
        </h4>
      </div>

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
      <Card title="📎 Upload New Attachment">
        {isSubmitting ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loading message="Uploading attachment..." />
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

            {/* File Upload Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                File <span style={{ color: "red" }}>*</span>
              </label>

              {selectedFile ? (
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    padding: "15px",
                    borderRadius: "4px",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <strong>✅ File ready to upload:</strong>
                  </div>
                  <div style={{ fontSize: "14px", color: "#155724" }}>
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
                    ❌ Remove File
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
                    Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
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
              <Link to={`/admin/staff/${aid}/attachments`}>
                <Button variant="secondary">← Back to Attachments</Button>
              </Link>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                ✓ Upload Attachment
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailAttachmentAddPage;

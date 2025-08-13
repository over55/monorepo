// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Avatar/Page.jsx

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
} from "../../../../../../components/UI";

function AdminAssociateDetailMoreAvatarPage() {
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Validate file
    if (file) {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          file: "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
        });
        setSelectedFile(null);
        event.target.value = null; // Reset file input
        return;
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setErrors({
          file: "File is too large. The maximum size is 10 MB.",
        });
        setSelectedFile(null);
        event.target.value = null; // Reset file input
        return;
      }

      // File is valid
      setErrors({});
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    setErrors({});
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("associate_id", aid);
      formData.append("file", selectedFile);

      // Upload avatar
      await associateManager.uploadAssociateAvatar(formData, onUnauthorized);

      // Set success message
      setSuccessMessage("Photo has been successfully updated");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setErrors(error);
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors({});
    // Reset the file input
    const fileInput = document.getElementById("avatar-file-input");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "👤" },
    { label: "More", path: `/admin/associate/${aid}/more`, icon: "⚙️" },
    { label: "Avatar", icon: "🖼️" },
  ];

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Change Photo">
          <Loading message="Loading associate details..." />
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
      <h2 style={{ marginBottom: "20px", color: "#666" }}>Change Photo</h2>

      {/* Success Message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {errors.file ||
            errors.message ||
            errors.detail ||
            "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Warning Message */}
        <Alert type="warning">
          <strong>Warning:</strong> Uploading a new photo will replace the
          existing one. The previous photo cannot be recovered.
        </Alert>

        {/* File Upload Section */}
        <div style={{ marginTop: "20px" }}>
          {selectedFile ? (
            <>
              {/* File Selected */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: theme.colors.successBg,
                  border: `1px solid ${theme.colors.success}`,
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: theme.colors.success,
                        marginBottom: "5px",
                      }}
                    >
                      ✓ File ready to upload
                    </p>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      <strong>File name:</strong> {selectedFile.name}
                    </p>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      <strong>File size:</strong>{" "}
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    ✕ Remove
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* File Input */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: "600",
                  }}
                >
                  Select Photo File
                </label>
                <input
                  id="avatar-file-input"
                  name="file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    maxWidth: "400px",
                    cursor: "pointer",
                  }}
                />
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
                >
                  Accepted formats: JPEG, PNG, GIF. Maximum size: 10 MB.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Associate Information */}
        {associate && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              marginBottom: "20px",
              marginTop: "20px",
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>
              Current Associate Information:
            </h4>
            <div style={{ display: "grid", gap: "5px" }}>
              <div>
                <strong>Name:</strong> {associate.firstName}{" "}
                {associate.lastName}
              </div>
              <div>
                <strong>Email:</strong> {associate.email}
              </div>
              {associate.avatarObjectUrl && (
                <div>
                  <strong>Current Photo:</strong> Photo exists (will be
                  replaced)
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
            marginTop: "20px",
          }}
        >
          <Link to={`/admin/associate/${aid}/more`}>
            <Button variant="secondary" disabled={isUploading}>
              ← Back to More
            </Button>
          </Link>

          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : <>✓ Save Photo</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminAssociateDetailMoreAvatarPage;

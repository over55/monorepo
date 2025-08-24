// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Update/Page.jsx

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
  Input,
  TextArea,
} from "../../../../../../components/UI";

function AdminOrderDetailAttachmentUpdatePage() {
  const { oid, aid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setFetching(true);
    setErrors({});

    try {
      const response = await attachmentManager.getAttachmentDetail(
        attachmentId,
        onUnauthorized,
      );
      setAttachment(response);
      setTitle(response.title || "");
      setDescription(response.description || "");
    } catch (error) {
      console.error("Failed to fetch attachment detail:", error);
      setErrors({ general: "Failed to load details" });
    } finally {
      setFetching(false);
    }
  };

  // Event handlers
  const onHandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Starting...");
    setFetching(true);
    setErrors({});
    setUploadProgress(0);

    try {
      // Validate inputs
      if (!title) {
        setErrors({ title: "Title is required" });
        setFetching(false);
        return;
      }

      // If a new file is selected, upload it; otherwise just update metadata
      if (selectedFile) {
        const metadata = {
          entityType: "order",
          entityId: oid,
          title: title.trim(),
          description: description.trim(),
        };

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
          aid,
          updateData,
          onUnauthorized,
        );
      }

      // Show success message
      setAlertMessage("Attachment updated successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to update attachment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
      setUploadProgress(0);
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
    {
      path: `/admin/order/${oid}/attachment/${aid}`,
      label: "Attachment",
      icon: "📄",
    },
    { label: "Edit", icon: "✏️" },
  ];

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

      <h1>🔧 Work Order - Edit Attachment</h1>

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
                Current file: {attachment?.fileName || "Unknown"}
              </p>
              {selectedFile ? (
                <Alert type="success">
                  ✅ New file ready to upload: {selectedFile.name}
                  <br />
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Alert>
              ) : (
                <input
                  name="file"
                  type="file"
                  onChange={onHandleFileChange}
                  style={{ display: "block", marginTop: "5px" }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
              )}
              {errors.file && (
                <div style={globalStyles.errorMessage}>{errors.file}</div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "8px" }}>
                  Upload Progress: {uploadProgress}%
                </div>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "8px",
                      backgroundColor: theme.colors.success,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <Link to={`/admin/order/${oid}/attachment/${aid}`}>
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

export default AdminOrderDetailAttachmentUpdatePage;

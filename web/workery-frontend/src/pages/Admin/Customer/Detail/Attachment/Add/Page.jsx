// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Add/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAttachmentManager,
  useCustomerManager,
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

function AdminCustomerDetailAttachmentAddPage() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const attachmentManager = useAttachmentManager();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  ////
  //// Event handling.
  ////

  const onHandleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrors({}); // Clear any file-related errors
  };

  const onSubmitClick = async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    if (!description.trim()) {
      setErrors({ description: "Description is required" });
      return;
    }

    setFetching(true);
    setErrors({});
    setUploadProgress(0);

    try {
      const metadata = {
        entityType: "customer", // or whatever the backend expects
        entityId: cid,
        title: title.trim(),
        description: description.trim(),
      };

      await attachmentManager.uploadAttachment(
        selectedFile,
        metadata,
        (progress) => setUploadProgress(progress),
        onUnauthorized,
      );

      // Show success message
      setAlertMessage("Attachment uploaded successfully");
      setAlertType("success");

      // Redirect after short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/attachments`);
      }, 1500);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to upload attachment");
      setAlertType("error");
    } finally {
      setFetching(false);
      setUploadProgress(0);
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Lifecycle.
  ////

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    window.scrollTo(0, 0);
  }, []);

  ////
  //// Component rendering.
  ////

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: "👤",
    },
    {
      label: "Detail (Attachments)",
      path: `/admin/customer/${cid}/attachments`,
      icon: "📎",
    },
    {
      label: "New",
      icon: "➕",
    },
  ];

  if (!authManager.isAuthenticated()) {
    return <Loading message="Checking authentication..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Alert Messages */}
      {alertMessage && (
        <Alert type={alertType} onClose={() => setAlertMessage("")}>
          {alertMessage}
        </Alert>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          👤 Customer
        </h1>
        <h2 style={{ fontSize: "18px", color: "#666", margin: 0 }}>
          ℹ️ Detail
        </h2>
      </div>

      <Card title="➕ Add Attachment">
        {isFetching ? (
          <Loading message="Uploading attachment..." />
        ) : (
          <>
            {/* Show errors if any */}
            {Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </div>
                ))}
              </Alert>
            )}

            <div style={{ marginBottom: "20px" }}>
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter attachment title"
                required
                error={errors.title}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter attachment description"
                required
                error={errors.description}
              />
            </div>

            {selectedFile ? (
              <Alert type="success">
                ✅ File ready to upload: <strong>{selectedFile.name}</strong>
                <br />
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Alert>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ ...globalStyles.label, marginBottom: "8px" }}>
                  Select File <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="file"
                  onChange={onHandleFileChange}
                  style={{
                    ...globalStyles.input,
                    padding: "10px",
                    cursor: "pointer",
                  }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
                {errors.file && (
                  <div style={globalStyles.errorMessage}>{errors.file}</div>
                )}
              </div>
            )}

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

            {/* Bottom Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to={`/admin/customer/${cid}/attachments`}>
                <Button variant="secondary">← Back to Attachments</Button>
              </Link>
              <Button
                onClick={onSubmitClick}
                variant="success"
                disabled={
                  isFetching ||
                  !selectedFile ||
                  !title.trim() ||
                  !description.trim()
                }
              >
                {isFetching ? "Uploading..." : "💾 Save"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailAttachmentAddPage;

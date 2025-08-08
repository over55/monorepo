// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAttachmentManager,
  useAssociateManager,
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

function AdminAssociateDetailAttachmentUpdatePage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [associate, setAssociate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

      // Fetch both associate and attachment details
      const [associateData, attachmentData] = await Promise.all([
        associateManager.getAssociateDetail(aid, onUnauthorized),
        attachmentManager.getAttachmentDetail(atid, onUnauthorized),
      ]);

      setAssociate(associateData);
      setAttachment(attachmentData);

      // Set initial form values
      setTitle(attachmentData.title || "");
      setDescription(attachmentData.description || "");
    } catch (error) {
      console.error("Failed to fetch data:", error);
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

    try {
      // Validate inputs
      if (!title) {
        setErrors({ title: "Title is required" });
        setFetching(false);
        return;
      }

      // Update attachment metadata
      const attachmentData = {
        title: title,
        description: description,
      };

      // If a new file is selected, we need to handle file replacement
      // Note: The current API might need adjustment for file replacement
      if (selectedFile) {
        // Delete old attachment and upload new one
        await attachmentManager.deleteAttachment(atid, onUnauthorized);

        const metadata = {
          title: title,
          description: description,
          entityType: "associate",
          entityId: aid,
        };

        await attachmentManager.uploadAttachment(
          selectedFile,
          metadata,
          null,
          onUnauthorized,
        );
      } else {
        // Just update metadata
        await attachmentManager.updateAttachment(
          atid,
          attachmentData,
          onUnauthorized,
        );
      }

      // Show success message
      setAlertMessage("Attachment updated successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to update attachment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    {
      path: `/admin/associate/${aid}/attachments`,
      label: "Detail (Attachments)",
      icon: "📎",
    },
    {
      path: `/admin/associate/${aid}/attachment/${atid}`,
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

      <h1>👷 Associate - Edit Attachment</h1>

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
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <Link to={`/admin/associate/${aid}/attachment/${atid}`}>
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

export default AdminAssociateDetailAttachmentUpdatePage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Add/Page.jsx

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

function AdminAssociateDetailAttachmentAddPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [associate, setAssociate] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate details on mount
  useEffect(() => {
    fetchAssociateDetail();
    window.scrollTo(0, 0);
  }, [aid]);

  const fetchAssociateDetail = async () => {
    try {
      setFetching(true);
      const data = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate:", error);
      setErrors({ general: "Failed to load associate details" });
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

      if (!selectedFile) {
        setErrors({ file: "File is required" });
        setFetching(false);
        return;
      }

      // Prepare metadata
      const metadata = {
        title: title,
        description: description,
        entityType: "associate",
        entityId: aid,
      };

      // Upload attachment
      await attachmentManager.uploadAttachment(
        selectedFile,
        metadata,
        null, // No progress callback for now
        onUnauthorized,
      );

      // Show success message
      setAlertMessage("Attachment uploaded successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to upload attachment");
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
    { label: "Add", icon: "➕" },
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

      <h1>👷 Associate - Add Attachment</h1>

      <Card>
        {isFetching ? (
          <Loading message="Processing..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

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
                File <span style={{ color: "red" }}>*</span>
              </label>
              {selectedFile ? (
                <Alert type="success">
                  ✅ File ready to upload: {selectedFile.name}
                </Alert>
              ) : (
                <>
                  <input
                    name="file"
                    type="file"
                    onChange={onHandleFileChange}
                    style={{ display: "block", marginTop: "5px" }}
                  />
                  {errors.file && (
                    <div style={globalStyles.errorMessage}>{errors.file}</div>
                  )}
                </>
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
              <Link to={`/admin/associate/${aid}/attachments`}>
                <Button variant="secondary">← Back to Attachments</Button>
              </Link>
              <Button
                variant="success"
                onClick={onSubmitClick}
                disabled={!title || !selectedFile}
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

export default AdminAssociateDetailAttachmentAddPage;

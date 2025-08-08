// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Detail/Page.jsx

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
} from "../../../../../../components/UI";

function AdminCustomerDetailAttachmentDetailPage() {
  ////
  //// URL Parameters.
  ////

  const { cid, aid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const attachmentManager = useAttachmentManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState({});

  ////
  //// Event handling.
  ////

  const fetchAttachmentDetail = async (attachmentId) => {
    setFetching(true);
    setErrors({});

    try {
      const response = await attachmentManager.getAttachmentDetail(
        attachmentId,
        onUnauthorized,
      );
      setAttachment(response);
    } catch (error) {
      console.error("Failed to fetch attachment detail:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const onDownloadClick = async () => {
    try {
      const fileBlob = await attachmentManager.downloadAttachment(
        aid,
        null, // no progress callback needed for detail view
        onUnauthorized,
      );

      // Trigger download
      attachmentManager.triggerFileDownload(
        fileBlob,
        attachment.filename || "download",
      );
    } catch (error) {
      console.error("Failed to download attachment:", error);
      setErrors(error);
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

    if (aid) {
      fetchAttachmentDetail(aid);
    }
  }, [aid]);

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
      label: "Attachment",
      icon: "📄",
    },
  ];

  if (!authManager.isAuthenticated()) {
    return <Loading message="Checking authentication..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

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

      <Card title="ℹ️ Attachment">
        {isFetching ? (
          <Loading message="Loading attachment..." />
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

            {attachment && (
              <>
                {/* Attachment Details */}
                <div style={{ marginBottom: "30px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "200px 1fr",
                      gap: "15px",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ fontWeight: "600" }}>Title:</div>
                    <div>{attachment.title || "No title"}</div>

                    <div style={{ fontWeight: "600" }}>Description:</div>
                    <div>{attachment.description || "No description"}</div>

                    <div style={{ fontWeight: "600" }}>File:</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>{attachment.filename || "Unknown file"}</span>
                      {attachment.objectUrl ? (
                        <a
                          href={attachment.objectUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: theme.colors.primary,
                            textDecoration: "none",
                            padding: "4px 8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          📥 Download
                        </a>
                      ) : (
                        <Button
                          onClick={onDownloadClick}
                          variant="outline"
                          size="sm"
                        >
                          📥 Download
                        </Button>
                      )}
                    </div>

                    <div style={{ fontWeight: "600" }}>Created:</div>
                    <div>{attachment.createdAt || "Unknown"}</div>

                    <div style={{ fontWeight: "600" }}>File Size:</div>
                    <div>
                      {attachment.fileSize
                        ? `${(attachment.fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : "Unknown"}
                    </div>

                    <div style={{ fontWeight: "600" }}>File Type:</div>
                    <div>{attachment.fileType || "Unknown"}</div>
                  </div>
                </div>

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
                  <Link to={`/admin/customer/${cid}/attachment/${aid}/edit`}>
                    <Button variant="warning">✏️ Edit</Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailAttachmentDetailPage;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/Comment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useStaffManager } from "../../../../../../services/Services";
import { theme } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  TextArea,
} from "../../../../../../components/UI";

// Import constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

// Maximum comment length constant
const MAX_COMMENT_LENGTH = 5000;

// Staff status labels
const STAFF_STATUS_LABELS = {
  [STAFF_STATUS_ACTIVE]: "Active",
  [STAFF_STATUS_ARCHIVED]: "Archived",
};

function AdminStaffDetailCommentListPage() {
  ////
  //// URL Parameters.
  ////
  const { aid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services
  ////
  const staffManager = useStaffManager();

  ////
  //// Component states.
  ////
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState({});
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  ////
  //// Breadcrumb items
  ////
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", icon: "ℹ️" },
  ];

  ////
  //// Event handling.
  ////
  const onSubmitClick = async () => {
    // Validate content
    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setErrors({
        content: `Comment must be less than ${MAX_COMMENT_LENGTH} characters`,
      });
      return;
    }

    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick, content:", content);

    setErrors({});
    setIsSubmitting(true);

    try {
      // Create comment using the manager
      const response = await staffManager.createStaffComment(
        aid,
        content,
        onUnauthorized,
      );

      console.log("Comment created successfully:", response);

      // Refresh staff data to get updated comments
      await fetchStaffData();

      // Clear the content field
      setContent("");

      // Show success message
      setSuccessMessage("Comment created successfully");
      setShowSuccessMessage(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 3000);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrors(error);

      // Scroll to top to show errors
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  ////
  //// API Callbacks
  ////
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchStaffData = async () => {
    setFetching(true);
    setErrors({});

    try {
      const response = await staffManager.getStaffDetail(aid, onUnauthorized);
      console.log("Staff detail fetched:", response);
      setStaff(response);
    } catch (error) {
      console.error("Error fetching staff detail:", error);
      setErrors(error);

      // Scroll to top to show errors
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  ////
  //// Misc.
  ////
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top
      fetchStaffData();
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Format date helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Tab navigation component (matching the style from LitePage and FullPage)
  const TabNavigation = () => (
    <div
      style={{
        borderBottom: "2px solid #e0e0e0",
        marginBottom: "20px",
        display: "flex",
        gap: "0",
      }}
    >
      <Link to={`/admin/staff/${aid}`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Summary
        </button>
      </Link>
      <Link to={`/admin/staff/${aid}/detail`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Detail
        </button>
      </Link>
      <button
        style={{
          padding: "10px 20px",
          border: "none",
          background: theme.colors.primary,
          color: "white",
          cursor: "pointer",
          borderBottom: `3px solid ${theme.colors.primary}`,
          fontWeight: "bold",
        }}
      >
        Comments
      </button>
      <Link to={`/admin/staff/${aid}/attachments`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Attachments
        </button>
      </Link>
      <Link to={`/admin/staff/${aid}/more`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          More ⋯
        </button>
      </Link>
    </div>
  );

  ////
  //// Component rendering.
  ////

  // Render loading state
  if (isFetching) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading staff comments..." />
      </div>
    );
  }

  // Render error state if staff not found
  if (!staff || !staff.id) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="warning">Staff member not found.</Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to="/admin/staff">
            <Button variant="secondary">← Back to Staff</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title (matching style from other pages) */}
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
            👔 Staff Member
          </h1>
          <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
            💬 Comments
          </h4>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Archived Banner */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <Alert type="info" style={{ marginBottom: "20px" }}>
          This staff member is archived.
        </Alert>
      )}

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
      <Card>
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Comments Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
            📋 Comment History
          </h3>

          {/* Comments List */}
          {staff.comments && staff.comments.length > 0 ? (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {staff.comments.map((comment, index) => (
                <div
                  key={comment.id || index}
                  style={{
                    marginBottom:
                      index < staff.comments.length - 1 ? "20px" : "0",
                    paddingBottom:
                      index < staff.comments.length - 1 ? "20px" : "0",
                    borderBottom:
                      index < staff.comments.length - 1
                        ? "1px solid #dee2e6"
                        : "none",
                  }}
                >
                  {/* Comment Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      fontSize: "0.9rem",
                      color: "#6c757d",
                    }}
                  >
                    <span>
                      <strong>
                        👤 {comment.createdByUserName || "Hidden User"}
                      </strong>
                    </span>
                    <span>📅 {formatDateTime(comment.createdAt)}</span>
                  </div>

                  {/* Comment Content Box */}
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "4px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ color: "#6c757d", margin: 0, fontSize: "1.1rem" }}>
                📭 No comments have been added yet.
              </p>
            </div>
          )}
        </div>

        {/* Add Comment Section */}
        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{ fontSize: "1.3rem", marginTop: 0, marginBottom: "15px" }}
          >
            ✍️ Add New Comment
          </h3>

          <TextArea
            label="Write your comment here:"
            name="content"
            placeholder="Enter your comment..."
            value={content}
            error={errors && errors.content}
            onChange={(e) => setContent(e.target.value)}
            required={true}
            rows={5}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={staff.status === STAFF_STATUS_ARCHIVED || isSubmitting}
          />

          {/* Character count */}
          <div
            style={{
              fontSize: "0.85rem",
              color:
                content.length > MAX_COMMENT_LENGTH * 0.9
                  ? "#dc3545"
                  : "#6c757d",
              marginTop: "-10px",
              marginBottom: "10px",
              textAlign: "right",
            }}
          >
            {content.length}/{MAX_COMMENT_LENGTH} characters
            {content.length > MAX_COMMENT_LENGTH * 0.9 &&
              content.length < MAX_COMMENT_LENGTH && (
                <span style={{ color: "#ffc107", marginLeft: "10px" }}>
                  ⚠️ Approaching limit
                </span>
              )}
          </div>
        </div>

        {/* Action Buttons (matching style from other pages) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link to="/admin/staff">
            <Button variant="secondary">← Back to Staff</Button>
          </Link>

          <Button
            onClick={onSubmitClick}
            variant="success"
            disabled={
              staff.status === STAFF_STATUS_ARCHIVED ||
              isSubmitting ||
              !content.trim()
            }
          >
            {isSubmitting ? "Saving..." : "✓ Save Comment"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailCommentListPage;

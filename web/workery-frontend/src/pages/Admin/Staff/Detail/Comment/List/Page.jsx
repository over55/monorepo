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
  //// Event handling.
  ////
  const onSubmitClick = async () => {
    // Validate content
    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
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

  ////
  //// Component rendering.
  ////

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", icon: "ℹ️" },
  ];

  if (isFetching) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Card title="Comments">
          <Loading message="Loading staff comments..." />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>
        👔 Staff - {staff.firstName} {staff.lastName}
      </h1>
      <h4>💬 Comments</h4>
      <hr />

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Archived Banner */}
      {staff && staff.status === 2 && (
        <Alert type="info">This staff member is archived</Alert>
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

      <Card>
        {/* Tab Navigation */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ borderBottom: "2px solid #e0e0e0" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <Link
                to={`/admin/staff/${aid}`}
                style={{
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#666",
                  borderBottom: "2px solid transparent",
                  display: "inline-block",
                  marginBottom: "-2px",
                }}
              >
                Summary
              </Link>
              <Link
                to={`/admin/staff/${aid}/detail`}
                style={{
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#666",
                  borderBottom: "2px solid transparent",
                  display: "inline-block",
                  marginBottom: "-2px",
                }}
              >
                Detail
              </Link>
              <Link
                to={`/admin/staff/${aid}/comments`}
                style={{
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: theme.colors.primary,
                  borderBottom: `2px solid ${theme.colors.primary}`,
                  display: "inline-block",
                  marginBottom: "-2px",
                  fontWeight: "bold",
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/staff/${aid}/attachments`}
                style={{
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#666",
                  borderBottom: "2px solid transparent",
                  display: "inline-block",
                  marginBottom: "-2px",
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/staff/${aid}/more`}
                style={{
                  padding: "10px 15px",
                  textDecoration: "none",
                  color: "#666",
                  borderBottom: "2px solid transparent",
                  display: "inline-block",
                  marginBottom: "-2px",
                }}
              >
                More ⋯
              </Link>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {staff.comments && staff.comments.length > 0 ? (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "20px" }}>
              Previous Comments ({staff.comments.length})
            </h3>

            {staff.comments.map((comment, index) => (
              <div
                key={comment.id || index}
                style={{
                  marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom:
                    index < staff.comments.length - 1
                      ? "1px solid #e0e0e0"
                      : "none",
                }}
              >
                {/* Comment Meta */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "10px",
                  }}
                >
                  <span>{comment.createdByUserName || "Hidden User"}</span>
                  {" at "}
                  <strong>{formatDateTime(comment.createdAt)}</strong>
                </div>

                {/* Comment Content */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              marginBottom: "30px",
            }}
          >
            <p style={{ color: "#666", margin: 0 }}>
              No comments have been added yet.
            </p>
          </div>
        )}

        {/* Add Comment Section */}
        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "20px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
            Add New Comment
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
            maxLength={5000}
            disabled={staff.status === 2 || isSubmitting}
          />

          {/* Character count */}
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "-10px",
              marginBottom: "10px",
            }}
          >
            {content.length}/5000 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/admin/staff"
            style={{
              padding: "10px 20px",
              backgroundColor: "#f8f9fa",
              color: "#333",
              textDecoration: "none",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
              display: "inline-block",
            }}
          >
            ← Back to Staff
          </Link>

          <Button
            onClick={onSubmitClick}
            variant="success"
            disabled={staff.status === 2 || isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Saving..." : "✓ Save Comment"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailCommentListPage;

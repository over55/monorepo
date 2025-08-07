// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Comment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
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
  TextArea,
} from "../../../../../../components/UI";

function AdminCustomerDetailCommentListPage() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState({});
  const [content, setContent] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  ////
  //// Event handling.
  ////

  const fetchCustomerDetail = async (customerId) => {
    setFetching(true);
    setErrors({});

    try {
      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const onSubmitClick = async () => {
    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
      return;
    }

    setFetching(true);
    setErrors({});

    try {
      // Create the comment using customer manager
      const response = await customerManager.createCustomerComment(
        cid,
        content.trim(),
        onUnauthorized,
      );

      // Update customer data with new comment
      setCustomer(response);
      setContent("");

      // Show success message
      setAlertMessage("Comment created successfully");
      setAlertType("success");

      // Clear alert after 3 seconds
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create comment:", error);
      setErrors(error);
    } finally {
      setFetching(false);
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

    if (cid) {
      fetchCustomerDetail(cid);
    }
  }, [cid]);

  ////
  //// Render helpers.
  ////

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";

    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateTimeString;
    }
  };

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
      label: "Detail",
      icon: "ℹ️",
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

      {/* Page banner */}
      {customer && customer.status === 2 && (
        <Alert type="info">This customer is archived.</Alert>
      )}
      {customer && customer.isBanned && (
        <Alert type="error">This customer is banned.</Alert>
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

      <Card title="💬 Comments">
        {isFetching ? (
          <Loading message="Loading comments..." />
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

            {customer && (
              <>
                {/* Tab Navigation */}
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to={`/admin/customer/${cid}`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Summary
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/detail`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/orders`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Orders
                  </Link>
                  <span
                    style={{
                      color: "#333",
                      fontWeight: "bold",
                      padding: "10px 0",
                      borderBottom: `2px solid ${theme.colors.primary}`,
                    }}
                  >
                    Comments
                  </span>
                  <Link
                    to={`/admin/customer/${cid}/attachments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/more`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    More...
                  </Link>
                </div>

                {/* Existing Comments */}
                {customer.comments && customer.comments.length > 0 ? (
                  <div style={{ marginBottom: "30px" }}>
                    {customer.comments.map((comment, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: "20px",
                          padding: "15px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              fontWeight: "500",
                            }}
                          >
                            {comment.createdByUserName || "Unknown User"}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                            }}
                          >
                            {formatDateTime(comment.createdAt)}
                          </div>
                        </div>
                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #dee2e6",
                            lineHeight: "1.5",
                          }}
                        >
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      marginBottom: "30px",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      💭
                    </div>
                    <h3 style={{ marginBottom: "8px", color: "#666" }}>
                      No Comments Yet
                    </h3>
                    <p style={{ color: "#888", margin: 0 }}>
                      Be the first to add a comment for this customer.
                    </p>
                  </div>
                )}

                {/* Add New Comment Section */}
                <div
                  style={{
                    backgroundColor: "#e8f5e8",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <h4
                    style={{
                      marginBottom: "15px",
                      color: "#333",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    Write your comment:
                  </h4>

                  <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your comment here..."
                    rows={4}
                    error={errors.content}
                    style={{ marginBottom: "15px" }}
                  />

                  <div style={{ textAlign: "right" }}>
                    <Button
                      onClick={onSubmitClick}
                      variant="success"
                      disabled={
                        isFetching || customer.status === 2 || !content.trim()
                      }
                    >
                      {isFetching ? "Saving..." : "💾 Save Comment"}
                    </Button>
                  </div>

                  {customer.status === 2 && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#dc3545",
                        fontStyle: "italic",
                      }}
                    >
                      Cannot add comments to archived customers.
                    </div>
                  )}
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
                  <Link to="/admin/customers">
                    <Button variant="secondary">← Back to Customers</Button>
                  </Link>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to={`/admin/customer/${cid}/detail`}>
                      <Button variant="outline">📝 Edit Customer</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailCommentListPage;

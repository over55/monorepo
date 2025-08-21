// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderIncident/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  TextArea,
} from "../../../../components/UI";

function AdminOrderIncidentDetailPage() {
  const { oiid } = useParams();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [incident, setIncident] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch incident details
  const fetchData = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Fetch incident details
      const incidentData = await orderIncidentManager.getOrderIncidentDetail(
        oiid,
        onUnauthorized,
      );
      setIncident(incidentData);

      console.log("AdminOrderIncidentDetailPage: Data loaded successfully");
    } catch (error) {
      console.error(
        "AdminOrderIncidentDetailPage: Failed to fetch data:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await orderIncidentManager.createOrderIncidentComment(
        oiid,
        newComment,
        onUnauthorized,
      );
      setNewComment("");
      setShowCommentModal(false);
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [oiid]);

  if (isFetching) {
    return <Loading message="Loading incident details..." />;
  }

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/order-incidents", label: "Incidents", icon: "🔥" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Format initiator label
  const getInitiatorLabel = (initiator) => {
    switch (initiator) {
      case 1:
        return "Client";
      case 2:
        return "Associate";
      case 3:
        return "Staff";
      default:
        return "Unknown";
    }
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>🔥 Incident</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Page Content */}
      <Card
        title="📋 Incident Detail"
        actions={
          <>
            <Button variant="primary" onClick={() => setShowCommentModal(true)}>
              ➕ New Comment
            </Button>
          </>
        }
      >
        {/* Error Display */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            <div>
              <strong>There were errors:</strong>
              <ul style={{ margin: "10px 0 0 20px" }}>
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {incident && (
          <>
            {/* Summary Table */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ marginBottom: "15px" }}>Summary</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        width: "30%",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Title:
                    </td>
                    <td style={{ padding: "10px" }}>{incident.title}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Description:
                    </td>
                    <td style={{ padding: "10px" }}>{incident.description}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Related Order:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {incident.orderId ? (
                        <Link to={`/admin/order/${incident.orderId}`}>
                          Order #{incident.orderId}
                        </Link>
                      ) : (
                        <span style={{ color: "#999" }}>
                          Not linked to order
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Initiated By:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {getInitiatorLabel(incident.initiator)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Start Date:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {incident.startDate || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Status:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {incident.closingReason ? (
                        <span style={{ color: "green" }}>Closed</span>
                      ) : (
                        <span style={{ color: "orange" }}>Open</span>
                      )}
                    </td>
                  </tr>
                  {incident.closingReason && (
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: "600",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        Closing Reason:
                      </td>
                      <td style={{ padding: "10px" }}>
                        {incident.closingReasonLabel ||
                          incident.closingReasonOther ||
                          "N/A"}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Created At:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {incident.createdAt || "N/A"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      Created By:
                    </td>
                    <td style={{ padding: "10px" }}>
                      {incident.createdByUserName || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Feed Section */}
            <div>
              <h3 style={{ marginBottom: "15px" }}>Feed</h3>
              {incident.feed && incident.feed.length > 0 ? (
                <div>
                  {incident.feed.map((item, index) => (
                    <div key={index} style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "5px",
                          textAlign: "right",
                        }}
                      >
                        {item.createdByUserName} at {item.createdAt}
                      </div>
                      {item.filetype ? (
                        // Attachment
                        <Alert type="info">
                          <a
                            href={item.objectUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📎 {item.filename || "Download Attachment"}
                          </a>
                        </Alert>
                      ) : (
                        // Comment
                        <div
                          style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#666" }}>No comments or attachments yet.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to="/admin/order-incidents">
                <Button variant="secondary">← Back to Incidents</Button>
              </Link>

              <Button
                variant="primary"
                onClick={() => setShowCommentModal(true)}
              >
                ➕ New Comment
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setNewComment("");
        }}
        title="New Comment"
        footer={
          <>
            <Button
              onClick={() => {
                setShowCommentModal(false);
                setNewComment("");
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleAddComment} variant="success">
              Submit
            </Button>
          </>
        }
      >
        <TextArea
          label="Content"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={7}
          placeholder="Enter your comment here"
        />
      </Modal>
    </div>
  );
}

export default AdminOrderIncidentDetailPage;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  TextArea,
} from "../../../../../../../components/UI";

function AdminOrderDetailMoreIncidentDetailPage() {
  const { oid, oiid } = useParams();
  const orderManager = useOrderManager();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [incident, setIncident] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order and incident details
  const fetchData = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Fetch both order and incident details
      const [orderData, incidentData] = await Promise.all([
        orderManager.getOrderDetail(oid, onUnauthorized),
        orderIncidentManager.getOrderIncidentDetail(oiid, onUnauthorized),
      ]);

      setOrder(orderData);
      setIncident(incidentData);

      console.log(
        "AdminOrderDetailMoreIncidentDetailPage: Data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentDetailPage: Failed to fetch data:",
        error,
      );
      setErrors({ general: "Failed to load incident details" });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setAlertMessage("Please enter a comment");
      setAlertStatus("error");
      return;
    }

    try {
      setFetching(true);
      await orderIncidentManager.createOrderIncidentComment(
        oiid,
        newComment,
        onUnauthorized,
      );
      setNewComment("");
      setShowCommentModal(false);
      setAlertMessage("Comment added successfully");
      setAlertStatus("success");
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Failed to add comment:", error);
      setAlertMessage("Failed to add comment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
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
  }, [oid, oiid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    {
      path: `/admin/order/${oid}/more`,
      label: `Order #${oid} (More)`,
      icon: "ℹ️",
    },
    {
      path: `/admin/order/${oid}/more/incidents`,
      label: "Incidents",
      icon: "🔥",
    },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Data display row component
  const DataRow = ({ label, value, isLink = false, linkPath = "" }) => (
    <div style={{ marginBottom: "15px" }}>
      <strong>{label}:</strong>{" "}
      {isLink && linkPath ? (
        <Link to={linkPath} style={{ color: theme.colors.primary }}>
          {value || "N/A"}
        </Link>
      ) : (
        value || "N/A"
      )}
    </div>
  );

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

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <Alert type="info">This order is archived</Alert>
      )}

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

      <h1>🔧 Order - Incident Detail</h1>

      {/* Summary Card */}
      <Card
        title="📋 Summary"
        actions={
          incident && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCommentModal(true)}
                disabled={order.status === 2}
              >
                ➕ New Comment
              </Button>
              {incident.closingReason ? null : (
                <Link to={`/admin/order/${oid}/more/incident/${oiid}/close`}>
                  <Button variant="warning" size="sm">
                    🔒 Close
                  </Button>
                </Link>
              )}
            </>
          )
        }
      >
        {isFetching ? (
          <Loading message="Loading incident details..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

            {incident && (
              <>
                <DataRow
                  label="Client"
                  value={order.customerName}
                  isLink={true}
                  linkPath={`/admin/customer/${order.customerId}`}
                />
                <DataRow
                  label="Associate"
                  value={
                    order.associateId
                      ? order.associateName || "N/A"
                      : "Not assigned"
                  }
                  isLink={!!order.associateId}
                  linkPath={`/admin/associate/${order.associateId}`}
                />
                <DataRow label="Title" value={incident.title} />
                <DataRow label="Description" value={incident.description} />
                <DataRow
                  label="Initiated By"
                  value={getInitiatorLabel(incident.initiator)}
                />
                <DataRow label="Start Date" value={incident.startDate} />
                <DataRow
                  label="Status"
                  value={incident.closingReason ? "Closed" : "Open"}
                />
                {incident.closingReason && (
                  <DataRow
                    label="Closing Reason"
                    value={
                      incident.closingReasonLabel || incident.closingReasonOther
                    }
                  />
                )}
                <DataRow label="Created At" value={incident.createdAt} />
                <DataRow
                  label="Created By"
                  value={incident.createdByUserName}
                />
              </>
            )}
          </>
        )}
      </Card>

      {/* Feed Card */}
      {incident && (
        <Card title="💬 Feed" style={{ marginTop: "20px" }}>
          {incident.feed && incident.feed.length > 0 ? (
            <div>
              {incident.feed.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "20px",
                    borderBottom:
                      index < incident.feed.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      {item.createdByUserName}
                    </span>
                    <span>{item.createdAt}</span>
                  </div>
                  {item.filetype ? (
                    // Attachment
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "4px",
                        border: "1px solid #90caf9",
                      }}
                    >
                      <a
                        href={item.objectUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: theme.colors.primary,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        📎 {item.filename || "Download Attachment"}
                      </a>
                    </div>
                  ) : (
                    // Comment
                    <div
                      style={{
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #dee2e6",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              No comments or attachments yet.
            </p>
          )}

          {/* Action buttons at bottom of feed */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Link to={`/admin/order/${oid}/more/incidents`}>
              <Button variant="secondary">← Back to Incidents</Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => setShowCommentModal(true)}
              disabled={order.status === 2}
            >
              ➕ Add Comment
            </Button>
          </div>
        </Card>
      )}

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
          required
        />
      </Modal>
    </div>
  );
}

export default AdminOrderDetailMoreIncidentDetailPage;

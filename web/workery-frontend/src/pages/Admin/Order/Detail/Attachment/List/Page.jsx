// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAttachmentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Table,
} from "../../../../../../components/UI";

function AdminOrderDetailAttachmentListPage() {
  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  ////
  //// Event handling.
  ////

  const fetchAttachmentList = async (
    cur,
    limit,
    orderId,
    forceRefresh = false,
  ) => {
    setFetching(true);
    setErrors({});

    try {
      // Use order_wjid for filtering
      const params = {
        orderWjid: orderId,
        limit: limit,
        cursor: cur || undefined,
      };

      // IMPORTANT: Pass forceRefresh parameter to bypass cache
      const response = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        forceRefresh, // Force refresh to bypass cache
      );

      setAttachments(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch attachment list:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await orderManager.getOrderDetail(
        orderId,
        onUnauthorized,
      );
      setOrder(response);
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      setErrors(error);
    }
  };

  const onNextClicked = () => {
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onSelectAttachmentForDeletion = (attachment) => {
    setSelectedAttachmentForDeletion(attachment);
  };

  const onDeselectAttachmentForDeletion = () => {
    setSelectedAttachmentForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedAttachmentForDeletion) return;

    setFetching(true);

    try {
      await attachmentManager.deleteAttachment(
        selectedAttachmentForDeletion.id,
        onUnauthorized,
      );

      // Show success message
      setAlertMessage("Attachment deleted successfully");
      setAlertType("success");

      // Clear alert after 3 seconds
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);

      // Refresh the list with force refresh
      fetchAttachmentList(currentCursor, pageSize, oid, true);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to delete attachment");
      setAlertType("error");
    } finally {
      setFetching(false);
      setSelectedAttachmentForDeletion(null);
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

    if (oid) {
      fetchOrderDetail(oid);
      // IMPORTANT: Force refresh on initial load to bypass stale cache
      fetchAttachmentList(currentCursor, pageSize, oid, true);
    }
  }, [oid]); // Only depend on oid, not currentCursor or pageSize

  // Separate effect for pagination changes
  useEffect(() => {
    if (oid && currentCursor !== "") {
      // Don't force refresh for pagination, use cache if available
      fetchAttachmentList(currentCursor, pageSize, oid, false);
    }
  }, [currentCursor, pageSize]);

  ////
  //// Render helpers.
  ////

  const renderAttachmentStatusBadge = (status) => {
    const statusStyles = {
      1: { backgroundColor: "#28a745", color: "white" }, // Active
      2: { backgroundColor: "#6c757d", color: "white" }, // Archived
    };

    const statusLabels = {
      1: "Active",
      2: "Archived",
    };

    const style = statusStyles[status] || {
      backgroundColor: "#6c757d",
      color: "white",
    };
    const label = statusLabels[status] || "Unknown";

    return (
      <span
        style={{
          ...style,
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {label}
      </span>
    );
  };

  ////
  //// Table configuration.
  ////

  const attachmentColumns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => renderAttachmentStatusBadge(value),
    },
    {
      key: "createdAt",
      label: "Created",
    },
    {
      key: "filename",
      label: "File",
      render: (value, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{value || "Unknown file"}</span>
          {row.objectUrl && (
            <a
              href={row.objectUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: theme.colors.primary,
                textDecoration: "none",
                fontSize: "12px",
              }}
            >
              📥 Download
            </a>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            to={`/admin/order/${oid}/attachment/${row.id}`}
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            View
          </Link>
          <Link
            to={`/admin/order/${oid}/attachment/${row.id}/edit`}
            style={{
              color: theme.colors.warning,
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            Edit
          </Link>
          <button
            onClick={() => onSelectAttachmentForDeletion(row)}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.danger,
              cursor: "pointer",
              fontSize: "12px",
              padding: 0,
            }}
          >
            🗑️ Delete
          </button>
        </div>
      ),
    },
  ];

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
      label: "Orders",
      path: "/admin/orders",
      icon: "🔧",
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
      {order && order.status === 2 && (
        <Alert type="info">This order is archived.</Alert>
      )}
      {order && order.status === 6 && (
        <Alert type="warning">This order is cancelled.</Alert>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          🔧 Work Order
        </h1>
        <h2 style={{ fontSize: "18px", color: "#666", margin: 0 }}>
          ℹ️ Detail
        </h2>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedAttachmentForDeletion}
        onClose={onDeselectAttachmentForDeletion}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={onDeselectAttachmentForDeletion}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={onDeleteConfirmButtonClick} variant="danger">
              Confirm
            </Button>
          </>
        }
      >
        <p>
          You are about to <strong>delete</strong> this attachment; it will no
          longer appear on your dashboard and will be permanently removed. This
          action cannot be undone. Are you sure you would like to continue?
        </p>
      </Modal>

      <Card
        title="📄 Attachments"
        actions={
          order &&
          order.status !== 2 &&
          order.status !== 6 && (
            <Link to={`/admin/order/${oid}/attachments/add`}>
              <Button variant="success">➕ New</Button>
            </Link>
          )
        }
      >
        {isFetching ? (
          <Loading message="Loading attachments..." />
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

            {order && (
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
                    to={`/admin/order/${oid}`}
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
                    to={`/admin/order/${oid}/full`}
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
                    to={`/admin/order/${oid}/activity-sheets`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Activity Sheets
                  </Link>
                  <Link
                    to={`/admin/order/${oid}/tasks`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Tasks
                  </Link>
                  <Link
                    to={`/admin/order/${oid}/comments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Comments
                  </Link>
                  <span
                    style={{
                      color: "#333",
                      fontWeight: "bold",
                      padding: "10px 0",
                      borderBottom: `2px solid ${theme.colors.primary}`,
                    }}
                  >
                    Attachments
                  </span>
                  <Link
                    to={`/admin/order/${oid}/more`}
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

                {attachments &&
                attachments.results &&
                (attachments.results.length > 0 ||
                  previousCursors.length > 0) ? (
                  <>
                    {/* Attachments Table */}
                    <Table
                      columns={attachmentColumns}
                      data={attachments.results || []}
                      onRowClick={(attachment) =>
                        navigate(
                          `/admin/order/${oid}/attachment/${attachment.id}`,
                        )
                      }
                    />

                    {/* Pagination Controls */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "20px",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <label style={{ marginRight: "10px" }}>
                          Page Size:
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            setPageSize(parseInt(e.target.value))
                          }
                          style={globalStyles.input}
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {previousCursors.length > 0 && (
                          <Button
                            onClick={onPreviousClicked}
                            variant="secondary"
                          >
                            Previous
                          </Button>
                        )}
                        {attachments.hasNextPage && (
                          <Button onClick={onNextClicked} variant="secondary">
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      📄
                    </div>
                    <h3 style={{ marginBottom: "8px" }}>No Attachments</h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                      No attachments found for this order.{" "}
                      {order.status !== 2 && order.status !== 6 && (
                        <>
                          <Link
                            to={`/admin/order/${oid}/attachments/add`}
                            style={{ color: theme.colors.primary }}
                          >
                            Click here
                          </Link>{" "}
                          to get started creating a new attachment.
                        </>
                      )}
                    </p>
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
                  <Link to="/admin/orders">
                    <Button variant="secondary">← Back to Orders</Button>
                  </Link>
                  {order.status !== 2 && order.status !== 6 && (
                    <Link to={`/admin/order/${oid}/attachments/add`}>
                      <Button variant="success">➕ New</Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailAttachmentListPage;

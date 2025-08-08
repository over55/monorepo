// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/List/Page.jsx

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
  Modal,
  Table,
} from "../../../../../../components/UI";

function AdminCustomerDetailAttachmentListPage() {
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
  const [customer, setCustomer] = useState({});
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

  const fetchAttachmentList = async (cur, limit, customerId) => {
    setFetching(true);
    setErrors({});

    try {
      const params = {
        entityType: "customer", // or whatever the backend expects
        entityId: customerId,
        limit: limit,
        cursor: cur || undefined,
      };

      const response = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
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

  const fetchCustomerDetail = async (customerId) => {
    try {
      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
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

      // Refresh the list
      fetchAttachmentList(currentCursor, pageSize, cid);
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

    if (cid) {
      fetchCustomerDetail(cid);
      fetchAttachmentList(currentCursor, pageSize, cid);
    }
  }, [currentCursor, pageSize, cid]);

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
            to={`/admin/customer/${cid}/attachment/${row.id}`}
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            View
          </Link>
          <Link
            to={`/admin/customer/${cid}/attachment/${row.id}/edit`}
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
          customer &&
          customer.status !== 2 && (
            <Link to={`/admin/customer/${cid}/attachments/add`}>
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
                  <Link
                    to={`/admin/customer/${cid}/comments`}
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
                          `/admin/customer/${cid}/attachment/${attachment.id}`,
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
                      No attachments found for this customer.{" "}
                      {customer.status !== 2 && (
                        <>
                          <Link
                            to={`/admin/customer/${cid}/attachments/add`}
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
                  <Link to="/admin/customers">
                    <Button variant="secondary">← Back to Customers</Button>
                  </Link>
                  {customer.status !== 2 && (
                    <Link to={`/admin/customer/${cid}/attachments/add`}>
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

export default AdminCustomerDetailAttachmentListPage;

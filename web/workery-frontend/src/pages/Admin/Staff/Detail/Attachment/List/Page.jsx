// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useStaffManager,
  useAttachmentManager,
} from "../../../../../../services/Services";
import { theme } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Table,
  Select,
} from "../../../../../../components/UI";
import {
  ATTACHMENT_OWNERSHIP_TYPE,
  ATTACHMENT_STATUS_LABELS,
} from "../../../../../../constants/Attachment";
import { PAGE_SIZE_OPTIONS } from "../../../../../../constants/FieldOptions";

// Staff status constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailAttachmentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const staffManager = useStaffManager();
  const attachmentManager = useAttachmentManager();

  // Component state
  const [staff, setStaff] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Tab navigation component
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
      <Link to={`/admin/staff/${aid}/comments`}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            color: "#666",
            cursor: "pointer",
          }}
        >
          Comments
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
        Attachments
      </button>
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

  // Fetch functions
  const fetchStaffData = async () => {
    try {
      const response = await staffManager.getStaffDetail(aid, onUnauthorized);
      setStaff(response);
    } catch (error) {
      console.error("Error fetching staff detail:", error);
      setErrors(error);
    }
  };

  const fetchAttachmentList = async () => {
    try {
      const params = {
        entityId: aid,
        entityType: String(ATTACHMENT_OWNERSHIP_TYPE.STAFF),
        limit: pageSize,
        cursor: currentCursor || undefined,
      };

      const response = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        true, // force refresh
      );

      setAttachments(response.results || []);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setErrors(error);
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Pagination handlers
  const onNextClicked = () => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Format date helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Effects
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        window.scrollTo(0, 0);
        setIsLoading(true);
        await Promise.all([fetchStaffData(), fetchAttachmentList()]);
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [aid, currentCursor, pageSize]);

  // Mobile attachment card component
  const AttachmentCard = ({ attachment }) => (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "15px",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <strong>📄 Title:</strong> {attachment.title || attachment.fileName}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>📊 Status:</strong>{" "}
        {ATTACHMENT_STATUS_LABELS[attachment.status] || "Active"}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>📅 Created:</strong> {formatDateTime(attachment.createdAt)}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>📁 File:</strong>{" "}
        <a
          href={attachment.objectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.colors.primary }}
        >
          ⬇️ {attachment.filename || "Download File"}
        </a>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Link
          to={`/admin/staff/${aid}/attachment/${attachment.id}`}
          style={{ flex: 1 }}
        >
          <Button size="sm" fullWidth>
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading attachments..." />
      </div>
    );
  }

  // Define table columns for desktop view
  const tableColumns = [
    {
      key: "title",
      label: "Title",
      render: (value, row) => row.title || row.fileName || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => ATTACHMENT_STATUS_LABELS[value] || "Active",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDateTime(value),
    },
    {
      key: "filename",
      label: "File",
      render: (value, row) => (
        <a
          href={row.objectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.colors.primary }}
        >
          ⬇️ {value || "Download"}
        </a>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_, row) => (
        <Link to={`/admin/staff/${aid}/attachment/${row.id}`}>
          <Button size="sm" variant="primary">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
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
            📎 Attachments
          </h4>
        </div>
        <div>
          {staff.status !== STAFF_STATUS_ARCHIVED && (
            <Link to={`/admin/staff/${aid}/attachments/add`}>
              <Button variant="success">➕ New Attachment</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Archived Banner */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <Alert type="info" style={{ marginBottom: "20px" }}>
          This staff member is archived. You cannot add new attachments.
        </Alert>
      )}

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {typeof errors === "string"
            ? errors
            : errors.message || "An error occurred while loading attachments."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Attachments Content */}
        {attachments && attachments.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="is-hidden-mobile" style={{ marginBottom: "20px" }}>
              <Table
                columns={tableColumns}
                data={attachments}
                onRowClick={(row) =>
                  navigate(`/admin/staff/${aid}/attachment/${row.id}`)
                }
              />
            </div>

            {/* Mobile View */}
            <div className="is-hidden-tablet">
              {attachments.map((attachment) => (
                <AttachmentCard key={attachment.id} attachment={attachment} />
              ))}
            </div>

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
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                options={PAGE_SIZE_OPTIONS}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                {previousCursors.length > 0 && (
                  <Button onClick={onPreviousClicked} variant="secondary">
                    Previous
                  </Button>
                )}
                {nextCursor && (
                  <Button onClick={onNextClicked} variant="primary">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              📭 No attachments have been uploaded yet.
            </p>
            {staff.status !== STAFF_STATUS_ARCHIVED && (
              <Link to={`/admin/staff/${aid}/attachments/add`}>
                <Button variant="success">➕ Upload First Attachment</Button>
              </Link>
            )}
          </div>
        )}

        {/* Action Buttons */}
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
          {staff.status !== STAFF_STATUS_ARCHIVED && (
            <Link to={`/admin/staff/${aid}/attachments/add`}>
              <Button variant="success">➕ New Attachment</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffDetailAttachmentListPage;

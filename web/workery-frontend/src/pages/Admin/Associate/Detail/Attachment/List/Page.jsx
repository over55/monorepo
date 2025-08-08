// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/List/Page.jsx

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
  Table,
  Select,
} from "../../../../../../components/UI";

function AdminAssociateDetailAttachmentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState(null);
  const [attachments, setAttachments] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data on mount and when pagination changes
  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [aid, currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setFetching(true);

      // Fetch associate details
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);

      // Fetch attachments
      const params = {
        entityType: "associate",
        entityId: aid,
        page: currentPage,
        limit: pageSize,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      const attachmentsData = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
      );
      setAttachments(attachmentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrors({ general: "Failed to load attachments" });
    } finally {
      setFetching(false);
    }
  };

  const onNextClicked = () => {
    setCurrentPage(currentPage + 1);
  };

  const onPreviousClicked = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const onRowClick = (attachment) => {
    navigate(`/admin/associate/${aid}/attachment/${attachment.id}`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    {
      path: `/admin/associate/${aid}`,
      label: "Detail",
      icon: "📋",
    },
    { label: "Attachments", icon: "📎" },
  ];

  // Table columns
  const columns = [
    { key: "title", label: "Title" },
    { key: "fileType", label: "Type" },
    { key: "createdAt", label: "Created" },
    {
      key: "fileName",
      label: "File",
      render: (value) => (
        <span style={{ color: theme.colors.primary }}>
          📥 {value || "Download"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Link to={`/admin/associate/${aid}/attachment/${row.id}`}>
          <Button size="sm" variant="primary">
            View
          </Button>
        </Link>
      ),
    },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  // Tab items (simplified)
  const tabs = [
    { path: `/admin/associate/${aid}`, label: "Summary" },
    { path: `/admin/associate/${aid}/detail`, label: "Detail" },
    { path: `/admin/associate/${aid}/orders`, label: "Orders" },
    { path: `/admin/associate/${aid}/comments`, label: "Comments" },
    {
      path: `/admin/associate/${aid}/attachments`,
      label: "Attachments",
      active: true,
    },
    { path: `/admin/associate/${aid}/more`, label: "More..." },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {associate && associate.status === 2 && (
        <Alert type="info">This associate is archived</Alert>
      )}

      <h1>👷 Associate - Attachments</h1>

      <Card
        title="📎 Attachments"
        actions={
          associate && (
            <Link to={`/admin/associate/${aid}/attachments/add`}>
              <Button variant="success" disabled={associate.status === 2}>
                ➕ New
              </Button>
            </Link>
          )
        }
      >
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

            {/* Simple tabs */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  borderBottom: "2px solid #ddd",
                  display: "flex",
                  gap: "20px",
                }}
              >
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    style={{
                      padding: "10px",
                      textDecoration: "none",
                      color: tab.active ? theme.colors.primary : "#666",
                      borderBottom: tab.active
                        ? `2px solid ${theme.colors.primary}`
                        : "none",
                      fontWeight: tab.active ? "bold" : "normal",
                    }}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>

            {attachments &&
            attachments.results &&
            attachments.results.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  data={attachments.results}
                  onRowClick={onRowClick}
                />

                {/* Pagination controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  <Select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    options={pageSizeOptions}
                  />

                  <div style={{ display: "flex", gap: "10px" }}>
                    {currentPage > 1 && (
                      <Button variant="secondary" onClick={onPreviousClicked}>
                        Previous
                      </Button>
                    )}
                    {attachments.hasNextPage && (
                      <Button variant="secondary" onClick={onNextClicked}>
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Alert type="info">
                No attachments found.
                {associate && associate.status !== 2 && (
                  <>
                    {" "}
                    <Link to={`/admin/associate/${aid}/attachments/add`}>
                      <strong>Click here →</strong>
                    </Link>{" "}
                    to add a new attachment.
                  </>
                )}
              </Alert>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <Link to="/admin/associates">
                <Button variant="secondary">← Back to Associates</Button>
              </Link>
              <Link to={`/admin/associate/${aid}/attachments/add`}>
                <Button
                  variant="success"
                  disabled={associate && associate.status === 2}
                >
                  ➕ New
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailAttachmentListPage;

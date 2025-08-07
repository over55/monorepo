// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useTagManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  Select,
  Table,
} from "../../../../../components/UI";

function SettingTagListPage() {
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState(null);
  const [selectedTagForDeletion, setSelectedTagForDeletion] = useState(null);

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filtering
  const [showFilter, setShowFilter] = useState(false);
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("text");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTags = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    sortField = "text",
    sortDirection = "ASC",
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: limit,
        sortBy: sortField,
        sortOrder: sortDirection,
      };

      if (search) {
        params.search = search;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const tagsData = await tagManager.getTags(params, onUnauthorized, true);

      setTags(tagsData);
      setHasNextPage(tagsData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("TagListPage: Tags fetched successfully:", {
        count: tagsData.results ? tagsData.results.length : 0,
        totalCount: tagsData.count,
      });
    } catch (error) {
      console.error("TagListPage: Failed to fetch tags:", error);
      setErrors({ fetch: error.message || "Failed to load tags" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTags(nextPage, pageSize, actualSearchText, status, sortBy, sortOrder);
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchTags(prevPage, pageSize, actualSearchText, status, sortBy, sortOrder);
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchTags(1, pageSize, temporarySearchText, status, sortBy, sortOrder);
  };

  const handleSortChange = (field) => {
    const newSortOrder =
      sortBy === field && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchTags(1, pageSize, actualSearchText, status, field, newSortOrder);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTagForDeletion) return;

    setIsLoading(true);

    try {
      await tagManager.deleteTag(selectedTagForDeletion.id, onUnauthorized);

      fetchTags(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        sortBy,
        sortOrder,
      );
      setSelectedTagForDeletion(null);
      console.log("TagListPage: Tag deleted successfully");
    } catch (error) {
      console.error("TagListPage: Failed to delete tag:", error);
      setErrors({ delete: error.message || "Failed to delete tag" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStatus("");
    setSortBy("text");
    setSortOrder("ASC");
    setActualSearchText("");
    setTemporarySearchText("");
    setCurrentPage(1);
    fetchTags(1, pageSize, "", "", "text", "ASC");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
      fetchTags();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading && !tags) {
    return <Loading message="Loading Tags..." />;
  }

  const styles = {
    filterSection: {
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      padding: "20px",
      marginBottom: "20px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
    },
    searchContainer: {
      display: "flex",
      gap: "5px",
    },
    searchInput: {
      flex: 1,
    },
    actionButtons: {
      display: "flex",
      gap: "5px",
      justifyContent: "center",
    },
    paginationContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    noData: {
      textAlign: "center",
      padding: "40px",
    },
    sortableHeader: {
      cursor: "pointer",
      userSelect: "none",
    },
  };

  // Table columns configuration
  const columns = [
    {
      key: "text",
      label: "Text",
      align: "left",
      sortable: true,
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          {row.description && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              {row.description.length > 50
                ? `${row.description.substring(0, 50)}...`
                : row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      align: "left",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (value, row) => (
        <div style={styles.actionButtons}>
          <Button
            variant="info"
            size="sm"
            onClick={() => navigate(`/admin/settings/tag/${row.id}/detail`)}
          >
            ℹ️ View
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate(`/admin/settings/tag/${row.id}/update`)}
          >
            ✏️ Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedTagForDeletion(row)}
          >
            🗑️ Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Settings", path: "/admin/settings", icon: "⚙️" },
          { label: "Tags", icon: "🏷️" },
        ]}
      />

      <Card
        title="🏷️ Tags"
        actions={
          <>
            <Button
              variant="info"
              size="sm"
              onClick={() =>
                fetchTags(
                  currentPage,
                  pageSize,
                  actualSearchText,
                  status,
                  sortBy,
                  sortOrder,
                )
              }
              disabled={isLoading}
            >
              🔄 Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
            >
              🔍 {showFilter ? "Hide Filter" : "Show Filter"}
            </Button>
            <Link to="/admin/settings/tag/create">
              <Button variant="success" size="sm">
                ➕ New Tag
              </Button>
            </Link>
          </>
        }
      >
        {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
        {errors.delete && <Alert type="error">{errors.delete}</Alert>}

        {/* Filter Section */}
        {showFilter && (
          <div style={styles.filterSection}>
            <div style={styles.filterGrid}>
              <div>
                <label style={globalStyles.label}>Search:</label>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search by text..."
                    value={temporarySearchText}
                    onChange={(e) => setTemporarySearchText(e.target.value)}
                    style={{ ...globalStyles.input, ...styles.searchInput }}
                  />
                  <Button onClick={handleSearch} size="sm">
                    🔍
                  </Button>
                </div>
              </div>

              <div>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "1", label: "Active" },
                    { value: "2", label: "Inactive" },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Sort By"
                  value={`${sortBy},${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split(",");
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                    fetchTags(
                      1,
                      pageSize,
                      actualSearchText,
                      status,
                      field,
                      order,
                    );
                  }}
                  options={[
                    { value: "text,ASC", label: "Text (A-Z)" },
                    { value: "text,DESC", label: "Text (Z-A)" },
                    { value: "created_at,ASC", label: "Created (Oldest)" },
                    { value: "created_at,DESC", label: "Created (Newest)" },
                  ]}
                />
              </div>

              <div>
                <Button
                  variant="secondary"
                  onClick={handleClearFilter}
                  size="sm"
                >
                  🗑️ Clear Filter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading...</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && tags && tags.results && tags.results.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={tags.results}
              onRowClick={(row) =>
                navigate(`/admin/settings/tag/${row.id}/detail`)
              }
            />

            {/* Pagination */}
            <div style={styles.paginationContainer}>
              <div>
                <label style={{ marginRight: "10px" }}>Page Size:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = parseInt(e.target.value);
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                    fetchTags(
                      1,
                      newPageSize,
                      actualSearchText,
                      status,
                      sortBy,
                      sortOrder,
                    );
                  }}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {hasPreviousPage && (
                  <Button
                    variant="secondary"
                    onClick={handlePreviousPage}
                    disabled={isLoading}
                  >
                    Previous
                  </Button>
                )}
                <span style={{ padding: "8px" }}>Page {currentPage}</span>
                {hasNextPage && (
                  <Button
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={isLoading}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <strong>Total Results: {tags.count}</strong>
            </div>
          </>
        ) : !isLoading &&
          tags &&
          (!tags.results || tags.results.length === 0) ? (
          <div style={styles.noData}>
            <h2>📋 No Tags</h2>
            <p>
              No tags found.{" "}
              <Link
                to="/admin/settings/tag/create"
                style={{ fontWeight: "bold" }}
              >
                Click here to add your first tag →
              </Link>
            </p>
          </div>
        ) : null}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Link to="/admin/settings">
            <Button variant="secondary">← Back to Settings</Button>
          </Link>
          <Link to="/admin/settings/tag/create">
            <Button variant="success">➕ New Tag</Button>
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedTagForDeletion}
        onClose={() => setSelectedTagForDeletion(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedTagForDeletion(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the tag "
          {selectedTagForDeletion?.text}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default SettingTagListPage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
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

function SettingSkillSetListPage() {
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [skillSets, setSkillSets] = useState(null);
  const [selectedSkillSetForDeletion, setSelectedSkillSetForDeletion] =
    useState(null);

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
  const [sortBy, setSortBy] = useState("category");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchSkillSets = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    sortField = "category",
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

      const skillSetsData = await skillSetManager.getSkillSets(
        params,
        onUnauthorized,
        true,
      );

      setSkillSets(skillSetsData);
      setHasNextPage(skillSetsData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("SkillSetListPage: Skill sets fetched successfully:", {
        count: skillSetsData.results ? skillSetsData.results.length : 0,
        totalCount: skillSetsData.count,
      });
    } catch (error) {
      console.error("SkillSetListPage: Failed to fetch skill sets:", error);
      setErrors({ fetch: error.message || "Failed to load skill sets" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchSkillSets(
      nextPage,
      pageSize,
      actualSearchText,
      status,
      sortBy,
      sortOrder,
    );
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchSkillSets(
      prevPage,
      pageSize,
      actualSearchText,
      status,
      sortBy,
      sortOrder,
    );
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchSkillSets(1, pageSize, temporarySearchText, status, sortBy, sortOrder);
  };

  const handleSortChange = (field) => {
    const newSortOrder =
      sortBy === field && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchSkillSets(1, pageSize, actualSearchText, status, field, newSortOrder);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSkillSetForDeletion) return;

    setIsLoading(true);

    try {
      await skillSetManager.deleteSkillSet(
        selectedSkillSetForDeletion.id,
        onUnauthorized,
      );

      fetchSkillSets(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        sortBy,
        sortOrder,
      );
      setSelectedSkillSetForDeletion(null);
      console.log("SkillSetListPage: Skill set deleted successfully");
    } catch (error) {
      console.error("SkillSetListPage: Failed to delete skill set:", error);
      setErrors({ delete: error.message || "Failed to delete skill set" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStatus("");
    setSortBy("category");
    setSortOrder("ASC");
    setActualSearchText("");
    setTemporarySearchText("");
    setCurrentPage(1);
    fetchSkillSets(1, pageSize, "", "", "category", "ASC");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
      fetchSkillSets();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading && !skillSets) {
    return <Loading message="Loading Skill Sets..." />;
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
      key: "category",
      label: "Category",
      align: "left",
      sortable: true,
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          {row.subCategory && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              Sub: {row.subCategory}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      align: "left",
      render: (value, row) => (
        <div style={{ fontSize: "14px", color: "#666" }}>
          {value
            ? value.length > 50
              ? `${value.substring(0, 50)}...`
              : value
            : "No description"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (value) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor: value === 1 ? "#d4edda" : "#f8d7da",
            color: value === 1 ? "#155724" : "#721c24",
          }}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
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
            onClick={() =>
              navigate(`/admin/settings/skill-set/${row.id}/detail`)
            }
          >
            ℹ️ View
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() =>
              navigate(`/admin/settings/skill-set/${row.id}/update`)
            }
          >
            ✏️ Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedSkillSetForDeletion(row)}
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
          { label: "Skill Sets", icon: "🎓" },
        ]}
      />

      <Card
        title="🎓 Skill Sets"
        actions={
          <>
            <Button
              variant="info"
              size="sm"
              onClick={() =>
                fetchSkillSets(
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
            <Link to="/admin/settings/skill-set/create">
              <Button variant="success" size="sm">
                ➕ New Skill Set
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
                    placeholder="Search by category or sub-category..."
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
                    fetchSkillSets(
                      1,
                      pageSize,
                      actualSearchText,
                      status,
                      field,
                      order,
                    );
                  }}
                  options={[
                    { value: "category,ASC", label: "Category (A-Z)" },
                    { value: "category,DESC", label: "Category (Z-A)" },
                    { value: "sub_category,ASC", label: "Sub-Category (A-Z)" },
                    { value: "sub_category,DESC", label: "Sub-Category (Z-A)" },
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
        {!isLoading &&
        skillSets &&
        skillSets.results &&
        skillSets.results.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={skillSets.results}
              onRowClick={(row) =>
                navigate(`/admin/settings/skill-set/${row.id}/detail`)
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
                    fetchSkillSets(
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
              <strong>Total Results: {skillSets.count}</strong>
            </div>
          </>
        ) : !isLoading &&
          skillSets &&
          (!skillSets.results || skillSets.results.length === 0) ? (
          <div style={styles.noData}>
            <h2>📋 No Skill Sets</h2>
            <p>
              No skill sets found.{" "}
              <Link
                to="/admin/settings/skill-set/create"
                style={{ fontWeight: "bold" }}
              >
                Click here to add your first skill set →
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
          <Link to="/admin/settings/skill-set/create">
            <Button variant="success">➕ New Skill Set</Button>
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedSkillSetForDeletion}
        onClose={() => setSelectedSkillSetForDeletion(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedSkillSetForDeletion(null)}
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
          Are you sure you want to delete the skill set "
          {selectedSkillSetForDeletion?.category} -{" "}
          {selectedSkillSetForDeletion?.subCategory}"? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}

export default SettingSkillSetListPage;

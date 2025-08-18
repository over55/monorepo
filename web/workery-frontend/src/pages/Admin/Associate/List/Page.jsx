// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  Table,
  Modal,
} from "../../../../components/UI";

// Constants for filtering and sorting
const ASSOCIATE_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

const ASSOCIATE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "0", label: "All" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
];

const ASSOCIATE_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

// Associate type constants (from old code)
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;

function AdminAssociateListPage() {
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associates, setAssociates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state using cursor-based approach
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pageSize, setPageSize] = useState(50);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("1"); // Default to active
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional associate-specific filters
  const [isJobSeeker, setIsJobSeeker] = useState(false);
  const [hasTaxId, setHasTaxId] = useState(false);
  const [joinDateGte, setJoinDateGte] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [associateToDelete, setAssociateToDelete] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associates using the new manager
  const fetchAssociates = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      console.log(
        "🔄 fetchAssociates called with cursor:",
        cursor,
        "pageSize:",
        pageSize,
      );

      setLoading(true);
      setError(null);

      try {
        // Build params using Map for legacy filtersMap approach
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // FIXED: Use the correct parameter name for page size
        filtersMap.set("page_size", pageSize.toString());

        // FIXED: Use correct sort_order format (ASC/DESC instead of 1/-1)
        if (sortBy) {
          const [sortField, sortOrder] = sortBy.split(",");
          filtersMap.set("sort_field", sortField);
          // Backend expects ASC or DESC strings
          filtersMap.set("sort_order", sortOrder); // Already "ASC" or "DESC" from ASSOCIATE_SORT_OPTIONS
        }

        // Add search
        if (searchQuery.trim()) {
          filtersMap.set("search", searchQuery.trim());
        }

        // Add filters
        if (statusFilter) {
          filtersMap.set("status", statusFilter);
        }
        if (typeFilter) {
          filtersMap.set("type", typeFilter);
        }
        if (joinDateGte) {
          const date = new Date(joinDateGte);
          filtersMap.set("join_date_gte", date.getTime().toString());
        }
        if (isJobSeeker) {
          filtersMap.set("is_job_seeker", "1");
        }
        if (hasTaxId) {
          filtersMap.set("has_tax_id", "1");
        }

        console.log(
          "🌐 Making API call with filters:",
          Array.from(filtersMap.entries()),
        );

        // Use the manager method
        const response = await associateManager.getAssociatesWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        console.log("✅ API response received:", {
          resultsCount: response.results?.length,
          nextCursor: response.nextCursor,
          hasNextPage: response.hasNextPage,
          totalCount: response.count,
        });

        setAssociates(response.results || []);
        setTotalCount(response.count || 0);

        // Handle pagination response
        if (
          response.nextCursor !== undefined &&
          response.nextCursor !== null &&
          response.nextCursor !== ""
        ) {
          setNextCursor(response.nextCursor);
          setHasNextPage(true);
        } else {
          setNextCursor("");
          setHasNextPage(false);
        }

        // Alternative: Check if hasNextPage is explicitly set
        if (response.hasNextPage !== undefined) {
          setHasNextPage(response.hasNextPage);
        }

        // Update current cursor if not navigating back
        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }
      } catch (err) {
        console.error("❌ Failed to fetch associates:", err);
        setError("Failed to load associates. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      pageSize,
      sortBy,
      searchQuery,
      statusFilter,
      typeFilter,
      joinDateGte,
      isJobSeeker,
      hasTaxId,
      associateManager,
      onUnauthorized,
    ],
  );

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("🔍 Search triggered:", searchQuery);
    // Reset pagination when searching
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchAssociates("");
  };

  // FIXED: Handle filter changes properly with useEffect
  useEffect(() => {
    console.log("🔄 Filters changed - resetting pagination and fetching");
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchAssociates("");
  }, [statusFilter, typeFilter, joinDateGte, isJobSeeker, hasTaxId]);

  // FIXED: Handle sort change with useEffect
  useEffect(() => {
    console.log("🔄 Sort changed - resetting pagination and fetching");
    // Reset pagination when sort changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchAssociates("");
  }, [sortBy]);

  // FIXED: Handle page size change with useEffect
  useEffect(() => {
    console.log("📏 Page size changed to:", pageSize, "- fetching data");
    // Reset pagination when page size changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchAssociates("");
  }, [pageSize]);

  // Pagination handlers
  const handleNextPage = () => {
    console.log(
      "🔜 handleNextPage clicked, nextCursor:",
      nextCursor,
      "hasNextPage:",
      hasNextPage,
    );

    if (hasNextPage && nextCursor) {
      console.log("✅ Going to next page with cursor:", nextCursor);

      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);

      // Fetch next page
      fetchAssociates(nextCursor);
    } else {
      console.log("❌ No next page available");
    }
  };

  const handlePreviousPage = () => {
    console.log("🔙 handlePreviousPage clicked");

    if (cursorHistory.length > 0) {
      // Pop the last cursor from history
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();

      console.log(
        "✅ Going to previous page with cursor:",
        previousCursor || "start",
      );

      // Update history
      setCursorHistory(newHistory);

      // Fetch previous page
      fetchAssociates(previousCursor || "", true);
    } else {
      console.log("❌ Already on first page");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("📏 Page size changing from", pageSize, "to", newPageSize);
    setPageSize(newPageSize);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle delete associate
  const handleDeleteAssociate = async () => {
    if (!associateToDelete) return;

    try {
      setLoading(true);
      await associateManager.deleteAssociate(
        associateToDelete.id,
        onUnauthorized,
      );

      // Refresh the current page
      fetchAssociates(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setAssociateToDelete(null);
    } catch (err) {
      console.error("Failed to delete associate:", err);
      setError("Failed to delete associate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    console.log("🧹 clearFilters called");
    setSearchQuery("");
    setStatusFilter("1");
    setTypeFilter("");
    setSortBy("lexical_name,ASC");
    setJoinDateGte("");
    setIsJobSeeker(false);
    setHasTaxId(false);
    setShowFilters(false);
  };

  // Initial data load - only on mount (empty dependency array)
  useEffect(() => {
    console.log("🚀 Initial mount - loading first page");
    fetchAssociates("");
  }, []); // Empty dependency array for initial load only

  // Format associate type for display
  const getAssociateTypeDisplay = (type) => {
    switch (type) {
      case COMMERCIAL_ASSOCIATE_TYPE_OF_ID:
        return "Commercial";
      case RESIDENTIAL_ASSOCIATE_TYPE_OF_ID:
        return "Residential";
      default:
        return "Unknown";
    }
  };

  // Table columns for tabular view
  const tableColumns = [
    {
      key: "firstName",
      label: "First Name",
      render: (value, associate) => (
        <Link
          to={`/admin/associate/${associate.id}`}
          style={{ color: theme.colors.primary }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "lastName",
      label: "Last Name",
      render: (value, associate) => (
        <Link
          to={`/admin/associate/${associate.id}`}
          style={{ color: theme.colors.primary }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (value) =>
        value ? <Link to={`mailto:${value}`}>{value}</Link> : "-",
    },
    {
      key: "type",
      label: "Type",
      render: (value) => getAssociateTypeDisplay(value),
    },
    {
      key: "isJobSeeker",
      label: "Job Seeker",
      render: (value) => (value === 1 ? "Yes" : "No"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, associate) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/admin/associate/${associate.id}`}>
            <Button size="sm" variant="primary">
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", icon: "👷" },
  ];

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>👷 Associates</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/associates/add/step-1-search">
            <Button variant="success">➕ Add Associate</Button>
          </Link>
          <Link to="/admin/associates/search">
            <Button variant="info">🔍 Search Associates</Button>
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        {/* Controls Section */}
        <div style={{ marginBottom: "20px" }}>
          {/* Search and View Controls */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "end",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                gap: "10px",
                flex: "1",
                minWidth: "300px",
              }}
            >
              <Input
                placeholder="Search associates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary">
                🔍 Search
              </Button>
            </form>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={handleSortChange}
              options={ASSOCIATE_SORT_OPTIONS}
              style={{ minWidth: "200px" }}
            />

            {/* View Type Toggle */}
            <div style={{ display: "flex", gap: "5px" }}>
              <Button
                variant={viewType === VIEW_TYPE_TABULAR ? "primary" : "outline"}
                onClick={() => setViewType(VIEW_TYPE_TABULAR)}
              >
                📋 Table
              </Button>
              <Button
                variant={viewType === VIEW_TYPE_GRID ? "primary" : "outline"}
                onClick={() => setViewType(VIEW_TYPE_GRID)}
              >
                ⊞ Grid
              </Button>
            </div>

            {/* Show Filters Button */}
            <Button
              variant={showFilters ? "info" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "➖" : "➕"} See All Filters
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <Card style={{ backgroundColor: theme.colors.light }}>
              <h3>🔍 Filtering</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={ASSOCIATE_STATUS_OPTIONS}
                />

                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={ASSOCIATE_TYPE_OPTIONS}
                />

                <Input
                  label="Join Date (From)"
                  type="date"
                  value={joinDateGte}
                  onChange={(e) => setJoinDateGte(e.target.value)}
                />

                <div>
                  <label style={globalStyles.label}>Additional Filters</label>
                  <div style={{ marginTop: "10px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isJobSeeker}
                        onChange={(e) => setIsJobSeeker(e.target.checked)}
                        style={{ marginRight: "8px" }}
                      />
                      Filter by Job Seekers
                    </label>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={hasTaxId}
                        onChange={(e) => setHasTaxId(e.target.checked)}
                        style={{ marginRight: "8px" }}
                      />
                      Filter by Charges Tax
                    </label>
                  </div>
                </div>
              </div>

              <Button variant="secondary" onClick={clearFilters}>
                🗑️ Clear All Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Display */}
        {loading && <Loading message="Loading associates..." />}

        {/* Results */}
        {!loading && (
          <>
            {/* Results Count */}
            <div
              style={{ marginBottom: "20px", color: theme.colors.secondary }}
            >
              <div>
                Showing <strong>{associates.length}</strong> associates
                {totalCount > 0 && ` (Total: ${totalCount})`}
                {searchQuery && ` (filtered by "${searchQuery}")`}
              </div>
            </div>

            {/* Associate List */}
            {associates.length > 0 ? (
              <>
                {viewType === VIEW_TYPE_TABULAR ? (
                  <Table
                    columns={tableColumns}
                    data={associates}
                    onRowClick={(associate) =>
                      navigate(`/admin/associate/${associate.id}`)
                    }
                  />
                ) : (
                  /* Grid View */
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {associates.map((associate) => (
                      <Card
                        key={associate.id}
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #ddd",
                        }}
                      >
                        <div style={{ marginBottom: "15px" }}>
                          <h3 style={{ margin: "0 0 5px 0" }}>
                            <Link
                              to={`/admin/associate/${associate.id}`}
                              style={{
                                color: theme.colors.primary,
                                textDecoration: "none",
                              }}
                            >
                              {associate.type ===
                              COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                                <>
                                  🏢{" "}
                                  {associate.organizationName ||
                                    `${associate.firstName} ${associate.lastName}`}
                                </>
                              ) : (
                                <>
                                  🏠 {associate.firstName} {associate.lastName}
                                </>
                              )}
                            </Link>
                          </h3>
                        </div>

                        <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                          {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
                            associate.organizationName && (
                              <div>
                                <strong>Contact:</strong> {associate.firstName}{" "}
                                {associate.lastName}
                              </div>
                            )}
                          <div>
                            <strong>Email:</strong> {associate.email || "-"}
                          </div>
                          <div>
                            <strong>Phone:</strong> {associate.phone || "-"}
                          </div>
                          <div>
                            <strong>Type:</strong>{" "}
                            {getAssociateTypeDisplay(associate.type)}
                          </div>
                          {associate.addressLine1 && (
                            <div>
                              <strong>Address:</strong> {associate.addressLine1}
                              {associate.city && `, ${associate.city}`}
                              {associate.region && `, ${associate.region}`}
                            </div>
                          )}
                          {associate.isJobSeeker === 1 && (
                            <div style={{ color: theme.colors.info }}>
                              <strong>💼 Job Seeker</strong>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <Link
                            to={`/admin/associate/${associate.id}`}
                            style={{ flex: 1 }}
                          >
                            <Button fullWidth variant="primary">
                              View Details →
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "30px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span>Show:</span>
                    <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      options={PAGE_SIZE_OPTIONS}
                      style={{ minWidth: "120px" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="secondary"
                      disabled={!hasPreviousPage}
                      onClick={handlePreviousPage}
                    >
                      ← Previous
                    </Button>

                    <span style={{ padding: "0 15px", fontSize: "14px" }}>
                      Page {currentPageNumber}
                      {totalCount > 0 && (
                        <span style={{ color: theme.colors.secondary }}>
                          {" "}
                          (Total: {totalCount} associates)
                        </span>
                      )}
                    </span>

                    <Button
                      variant="secondary"
                      disabled={!hasNextPage}
                      onClick={handleNextPage}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No Results */
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
                <h3>No Associates Found</h3>
                <p
                  style={{
                    color: theme.colors.secondary,
                    marginBottom: "30px",
                  }}
                >
                  {searchQuery ||
                  statusFilter !== "1" ||
                  typeFilter ||
                  isJobSeeker ||
                  hasTaxId
                    ? "No associates match your current filters. Try adjusting your search criteria."
                    : "No associates have been added yet."}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {(searchQuery ||
                    statusFilter !== "1" ||
                    typeFilter ||
                    isJobSeeker ||
                    hasTaxId) && (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Link to="/admin/associates/add/step-1-search">
                    <Button variant="success">➕ Add First Associate</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAssociate}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Associate"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to archive associate{" "}
          <strong>
            {associateToDelete?.firstName} {associateToDelete?.lastName}
          </strong>
          ? This action will archive the associate and they will no longer
          appear on your dashboard.
        </p>
      </Modal>

      {/* Navigation Links */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link to="/admin/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default AdminAssociateListPage;

// File Path: web/workery-frontend/src/pages/Admin/Customer/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  useCustomerManager,
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
const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "1", label: "Unassigned" },
  { value: "2", label: "Residential" },
  { value: "3", label: "Commercial" },
];

const CUSTOMER_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "created_at,DESC", label: "Newest First" },
  { value: "created_at,ASC", label: "Oldest First" },
  { value: "email,ASC", label: "Email (A-Z)" },
  { value: "email,DESC", label: "Email (Z-A)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminCustomerListPage() {
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIXED: Use cursor-based pagination
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]); // Stack to track cursors for "Previous" functionality
  const [pageSize, setPageSize] = useState(50);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // FIXED: Updated to use cursor-based pagination
  const fetchCustomers = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      console.log("🔄 fetchCustomers called with cursor:", cursor);

      setLoading(true);
      setError(null);

      try {
        // Build params using Map for legacy filtersMap approach (matching backend)
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Add page size
        filtersMap.set("pageSize", pageSize);

        // Add sorting
        if (sortBy) {
          const [sortField, sortOrder] = sortBy.split(",");
          filtersMap.set("sortField", sortField);
          filtersMap.set("sortOrder", sortOrder === "DESC" ? "-1" : "1");
        }

        // Add search
        if (searchQuery.trim()) {
          filtersMap.set("searchText", searchQuery.trim());
        }

        // Add filters
        if (statusFilter) {
          filtersMap.set("status", statusFilter);
        }
        if (typeFilter) {
          filtersMap.set("type", typeFilter);
        }

        console.log(
          "🌐 Making API call with filters:",
          Array.from(filtersMap.entries()),
        );

        // Use the legacy filtersMap method that matches backend expectations
        const response = await customerManager.getCustomersWithFiltersMap(
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

        setCustomers(response.results || []);
        setTotalCount(response.count || 0);
        setNextCursor(response.nextCursor || "");
        setHasNextPage(response.hasNextPage || false);

        // Update current cursor if not navigating back
        if (!isNavigatingBack) {
          setCurrentCursor(cursor);
        }
      } catch (err) {
        console.error("❌ Failed to fetch customers:", err);
        setError("Failed to load customers. Please try again.");
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
      customerManager,
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
    fetchCustomers("");
  };

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    console.log("🔄 Filter changed - resetting pagination");
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    fetchCustomers("");
  }, [fetchCustomers]);

  // FIXED: Cursor-based pagination handlers
  const handleNextPage = () => {
    console.log("🔜 handleNextPage clicked");

    if (hasNextPage && nextCursor) {
      console.log("✅ Going to next page with cursor:", nextCursor);

      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);

      // Fetch next page
      fetchCustomers(nextCursor);
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
      fetchCustomers(previousCursor || "", true);
    } else {
      console.log("❌ Already on first page");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPageSize(newPageSize);

    // Reset pagination when page size changes
    setCursorHistory([]);
    setCurrentCursor("");

    // Fetch with new page size
    setTimeout(() => fetchCustomers(""), 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);

    // Reset pagination when sort changes
    setCursorHistory([]);
    setCurrentCursor("");

    setTimeout(() => fetchCustomers(""), 0);
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setLoading(true);
      await customerManager.deleteCustomer(customerToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchCustomers(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError("Failed to delete customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    console.log("🧹 clearFilters called");
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
    setSortBy("lexical_name,ASC");
    setCursorHistory([]);
    setCurrentCursor("");
    fetchCustomers("");
  }, [fetchCustomers]);

  // Initial data load
  useEffect(() => {
    console.log("🚀 Initial useEffect - loading first page");
    fetchCustomers("");
  }, []); // Empty dependency array for initial load only

  // Table columns for tabular view
  const tableColumns = [
    {
      key: "firstName",
      label: "First Name",
      render: (value, customer) => (
        <Link
          to={`/admin/customer/${customer.id}`}
          style={{ color: theme.colors.primary }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "lastName",
      label: "Last Name",
      render: (value, customer) => (
        <Link
          to={`/admin/customer/${customer.id}`}
          style={{ color: theme.colors.primary }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => value || "-",
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      key: "type",
      label: "Type",
      render: (value) => {
        switch (value) {
          case 2:
            return "Residential";
          case 3:
            return "Commercial";
          default:
            return "Unassigned";
        }
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, customer) => (
        <span
          style={{
            color: customer.isBanned
              ? theme.colors.danger
              : value === 1
                ? theme.colors.success
                : theme.colors.secondary,
          }}
        >
          {customer.isBanned ? "Banned" : value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, customer) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/admin/customer/${customer.id}`}>
            <Button size="sm" variant="primary">
              View
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setCustomerToDelete(customer);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Customers", icon: "👤" },
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
        <h1 style={{ margin: 0 }}>👤 Customers</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/customers/add/step-1-search">
            <Button variant="success">➕ Add Customer</Button>
          </Link>
          <Link to="/admin/customers/search">
            <Button variant="info">🔍 Search Customers</Button>
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
                placeholder="Search customers..."
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
              options={CUSTOMER_SORT_OPTIONS}
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
              {showFilters ? "➖" : "➕"} Filters
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <Card style={{ backgroundColor: theme.colors.light }}>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "end",
                  flexWrap: "wrap",
                }}
              >
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setTimeout(() => handleFilterChange(), 0);
                  }}
                  options={CUSTOMER_STATUS_OPTIONS}
                  style={{ minWidth: "150px" }}
                />

                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setTimeout(() => handleFilterChange(), 0);
                  }}
                  options={CUSTOMER_TYPE_OPTIONS}
                  style={{ minWidth: "150px" }}
                />

                <Button variant="secondary" onClick={clearFilters}>
                  🗑️ Clear Filters
                </Button>
              </div>
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
        {loading && <Loading message="Loading customers..." />}

        {/* Results */}
        {!loading && (
          <>
            {/* Results Count */}
            <div
              style={{ marginBottom: "20px", color: theme.colors.secondary }}
            >
              <div>
                Showing <strong>{customers.length}</strong> customers
                {totalCount > 0 && ` (Total: ${totalCount})`}
                {searchQuery && ` (filtered by "${searchQuery}")`}
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === "development" && (
                <div
                  style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}
                >
                  <strong>Pagination Debug:</strong>
                  <br />
                  Page: {currentPageNumber} | Results: {customers.length} | Has
                  next: {hasNextPage ? "Yes" : "No"} | Has previous:{" "}
                  {hasPreviousPage ? "Yes" : "No"}
                  <br />
                  Current cursor: {currentCursor || "start"} | Next cursor:{" "}
                  {nextCursor || "none"}
                  <br />
                  History stack size: {cursorHistory.length}
                </div>
              )}
            </div>

            {/* Customer List */}
            {customers.length > 0 ? (
              <>
                {viewType === VIEW_TYPE_TABULAR ? (
                  <Table
                    columns={tableColumns}
                    data={customers}
                    onRowClick={(customer) =>
                      navigate(`/admin/customer/${customer.id}`)
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
                    {customers.map((customer) => (
                      <Card
                        key={customer.id}
                        style={{
                          backgroundColor: customer.isBanned
                            ? theme.colors.errorBg
                            : "white",
                          border: customer.isBanned
                            ? `1px solid ${theme.colors.danger}`
                            : "1px solid #ddd",
                        }}
                      >
                        <div style={{ marginBottom: "15px" }}>
                          <h3 style={{ margin: "0 0 5px 0" }}>
                            <Link
                              to={`/admin/customer/${customer.id}`}
                              style={{
                                color: theme.colors.primary,
                                textDecoration: "none",
                              }}
                            >
                              {customer.type === 3 &&
                              customer.organizationName ? (
                                <>🏢 {customer.organizationName}</>
                              ) : (
                                <>
                                  🏠 {customer.firstName} {customer.lastName}
                                </>
                              )}
                            </Link>
                          </h3>
                          {customer.isBanned && (
                            <div
                              style={{
                                color: theme.colors.danger,
                                fontSize: "14px",
                              }}
                            >
                              🚫 <strong>BANNED</strong>
                            </div>
                          )}
                        </div>

                        <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                          {customer.type === 3 && (
                            <div>
                              <strong>Contact:</strong> {customer.firstName}{" "}
                              {customer.lastName}
                            </div>
                          )}
                          <div>
                            <strong>Email:</strong> {customer.email || "-"}
                          </div>
                          <div>
                            <strong>Phone:</strong> {customer.phone || "-"}
                          </div>
                          <div>
                            <strong>Type:</strong>{" "}
                            {customer.type === 3
                              ? "Commercial"
                              : customer.type === 2
                                ? "Residential"
                                : "Unassigned"}
                          </div>
                          <div>
                            <strong>Status:</strong>
                            <span
                              style={{
                                color: customer.isBanned
                                  ? theme.colors.danger
                                  : customer.status === 1
                                    ? theme.colors.success
                                    : theme.colors.secondary,
                              }}
                            >
                              {customer.isBanned
                                ? " Banned"
                                : customer.status === 1
                                  ? " Active"
                                  : " Inactive"}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <Link
                            to={`/admin/customer/${customer.id}`}
                            style={{ flex: 1 }}
                          >
                            <Button fullWidth variant="primary">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            onClick={() => {
                              setCustomerToDelete(customer);
                              setShowDeleteModal(true);
                            }}
                          >
                            🗑️
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* FIXED: Cursor-based pagination controls */}
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
                          (Total: {totalCount} customers)
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
                <h3>No Customers Found</h3>
                <p
                  style={{
                    color: theme.colors.secondary,
                    marginBottom: "30px",
                  }}
                >
                  {searchQuery || statusFilter || typeFilter
                    ? "No customers match your current filters. Try adjusting your search criteria."
                    : "No customers have been added yet."}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {(searchQuery || statusFilter || typeFilter) && (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Link to="/admin/customers/add/step-1-search">
                    <Button variant="success">➕ Add First Customer</Button>
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
              onClick={handleDeleteCustomer}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Customer"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete customer{" "}
          <strong>
            {customerToDelete?.firstName} {customerToDelete?.lastName}
          </strong>
          ? This action cannot be undone.
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

export default AdminCustomerListPage;

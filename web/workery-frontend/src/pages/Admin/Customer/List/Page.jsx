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

  // FIXED: Use page-based pagination instead of cursor-based
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);

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

  // FIXED: Use the modern CustomerManager.getCustomers method with proper params
  const fetchCustomers = useCallback(
    async (page = 1, refresh = false) => {
      console.log("🔄 fetchCustomers called with:", { page, refresh });

      setLoading(true);
      setError(null);

      try {
        // Build modern params object for CustomerManager.getCustomers
        const params = {
          page: page,
          limit: pageSize,
        };

        // Add search
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Add sorting
        if (sortBy) {
          const [sortField, sortOrder] = sortBy.split(",");
          params.sortBy = sortField;
          params.sortOrder = sortOrder;
        }

        // Add filters
        if (statusFilter) {
          params.status = statusFilter;
        }
        if (typeFilter) {
          params.typeOf = typeFilter; // Note: using typeOf for the param name
        }

        console.log("🌐 Making API call with params:", params);

        // FIXED: Use modern CustomerManager.getCustomers method
        const response = await customerManager.getCustomers(
          params,
          onUnauthorized,
          refresh,
        );

        console.log("✅ API response received:");
        console.log("Full response object:", response);

        setCustomers(response.results || []);
        setTotalCount(response.count || 0);

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(
          (response.count || 0) / pageSize,
        );
        setTotalPages(calculatedTotalPages);

        console.log("📊 Pagination state updated:", {
          currentPage: page,
          pageSize,
          totalCount: response.count,
          totalPages: calculatedTotalPages,
          resultsCount: response.results?.length,
          hasNextPage: page < calculatedTotalPages,
          hasPreviousPage: page > 1,
        });
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
    setCurrentPage(1);
    fetchCustomers(1, true);
  };

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    console.log("🔄 handleFilterChange called - resetting to page 1");
    setCurrentPage(1);
    fetchCustomers(1, true);
  }, [fetchCustomers]);

  // FIXED: Simple page-based pagination handlers
  const handleNextPage = () => {
    console.log("🔜 handleNextPage clicked");
    const nextPage = currentPage + 1;

    console.log("Current state:", {
      currentPage,
      totalPages,
      canGoNext: currentPage < totalPages,
      nextPage,
    });

    if (currentPage < totalPages) {
      console.log("✅ Going to next page:", nextPage);
      setCurrentPage(nextPage);
      fetchCustomers(nextPage);
    } else {
      console.log("❌ Already on last page");
    }
  };

  const handlePreviousPage = () => {
    console.log("🔙 handlePreviousPage clicked");
    const prevPage = currentPage - 1;

    console.log("Current state:", {
      currentPage,
      totalPages,
      canGoPrevious: currentPage > 1,
      prevPage,
    });

    if (currentPage > 1) {
      console.log("✅ Going to previous page:", prevPage);
      setCurrentPage(prevPage);
      fetchCustomers(prevPage);
    } else {
      console.log("❌ Already on first page");
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setLoading(true);
      await customerManager.deleteCustomer(customerToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchCustomers(currentPage, true);

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
    setCurrentPage(1);
    fetchCustomers(1, true);
  }, [fetchCustomers]);

  // Initial data load only
  useEffect(() => {
    console.log("🚀 Initial useEffect - loading first page");
    fetchCustomers(1);
  }, []);

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
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

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
              onChange={(e) => {
                setSortBy(e.target.value);
                setTimeout(() => handleFilterChange(), 0);
              }}
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
            {/* Results Count and Pagination Info */}
            <div
              style={{ marginBottom: "20px", color: theme.colors.secondary }}
            >
              <div>
                Showing {startItem}-{endItem} of <strong>{totalCount}</strong>{" "}
                customers
                {searchQuery && ` (filtered by "${searchQuery}")`}
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === "development" && (
                <div
                  style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}
                >
                  <strong>Pagination Debug:</strong>
                  <br />
                  Page {currentPage} of {totalPages} | Page size: {pageSize} |
                  Has next: {hasNextPage ? "Yes" : "No"} | Has previous:{" "}
                  {hasPreviousPage ? "Yes" : "No"}
                  <br />
                  <strong>Button States:</strong> Previous disabled:{" "}
                  {!hasPreviousPage ? "Yes" : "No"} | Next disabled:{" "}
                  {!hasNextPage ? "Yes" : "No"}
                  <br />
                  <strong>Range:</strong> Showing items {startItem}-{endItem} of{" "}
                  {totalCount}
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

                {/* FIXED: Simple page-based pagination */}
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
                      onChange={(e) => {
                        const newPageSize = parseInt(e.target.value);
                        setPageSize(newPageSize);
                        setCurrentPage(1);
                        setTimeout(() => fetchCustomers(1, true), 0);
                      }}
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
                      Page {currentPage} of {totalPages}
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

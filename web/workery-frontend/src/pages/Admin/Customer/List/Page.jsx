// File Path: web/workery-frontend/src/pages/Admin/Customer/List/Page.jsx

import React, { useState, useEffect } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Pagination state
  const [cursors, setCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customers data
  const fetchCustomers = async (cursor = "", refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Build filters map for backward compatibility with existing API
      const filtersMap = new Map();

      // Add pagination
      filtersMap.set("pageSize", pageSize);
      if (cursor) {
        filtersMap.set("cursor", cursor);
      }

      // Add sorting
      if (sortBy) {
        const [sortField, sortOrder] = sortBy.split(",");
        filtersMap.set("sortField", sortField);
        filtersMap.set("sortOrder", sortOrder);
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

      // Fetch data using CustomerManager
      const response = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        refresh,
      );

      setCustomers(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);

      // Update cursor for next page
      if (response.nextCursor) {
        setCurrentCursor(response.nextCursor);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setCursors([]);
    setCurrentCursor("");
    fetchCustomers("", true);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    setCursors([]);
    setCurrentCursor("");
    fetchCustomers("", true);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (hasNextPage && currentCursor) {
      setCursors([...cursors, currentCursor]);
      setCurrentPage(currentPage + 1);
      fetchCustomers(currentCursor);
    }
  };

  const handlePreviousPage = () => {
    if (cursors.length > 0) {
      const newCursors = [...cursors];
      const previousCursor = newCursors.pop() || "";
      setCursors(newCursors);
      setCurrentPage(currentPage - 1);
      fetchCustomers(previousCursor);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setLoading(true);
      await customerManager.deleteCustomer(customerToDelete.id, onUnauthorized);

      // Refresh the list
      fetchCustomers("", true);

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
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
    setSortBy("lexical_name,ASC");
    setCurrentPage(1);
    setCursors([]);
    setCurrentCursor("");
    fetchCustomers("", true);
  };

  // Initial data load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle filter/sort changes
  useEffect(() => {
    handleFilterChange();
  }, [statusFilter, typeFilter, sortBy, pageSize]);

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
              onChange={(e) => setSortBy(e.target.value)}
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={CUSTOMER_STATUS_OPTIONS}
                  style={{ minWidth: "150px" }}
                />

                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
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
              Total Results: <strong>{totalCount}</strong>
              {searchQuery && ` (filtered by "${searchQuery}")`}
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

                {/* Pagination */}
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
                      onChange={(e) => setPageSize(parseInt(e.target.value))}
                      options={PAGE_SIZE_OPTIONS}
                      style={{ minWidth: "120px" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      variant="secondary"
                      disabled={cursors.length === 0}
                      onClick={handlePreviousPage}
                    >
                      ← Previous
                    </Button>
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

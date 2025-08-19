// File Path: web/workery-frontend/src/pages/Admin/Order/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import { formatDateForDisplay } from "../../../../services/Helpers/dateFormatter";
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
import {
  ORDER_STATUS_NEW,
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_ONGOING,
  ORDER_STATUS_IN_PROGRESS,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";

// We define ORDER_STATUS_OPTIONS locally to ensure it is correct
const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(ORDER_STATUS_NEW), label: "New" },
  { value: String(ORDER_STATUS_DECLINED), label: "Declined" },
  { value: String(ORDER_STATUS_PENDING), label: "Pending" },
  { value: String(ORDER_STATUS_CANCELLED), label: "Cancelled" },
  { value: String(ORDER_STATUS_ONGOING), label: "Ongoing" },
  { value: String(ORDER_STATUS_IN_PROGRESS), label: "In Progress" },
  {
    value: String(ORDER_STATUS_COMPLETED_BUT_UNPAID),
    label: "Completed but unpaid",
  },
  {
    value: String(ORDER_STATUS_COMPLETED_AND_PAID),
    label: "Completed and paid",
  },
  { value: String(ORDER_STATUS_ARCHIVED), label: "Archived" },
];

const ORDER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: String(ORDER_TYPE_RESIDENTIAL), label: "Residential" },
  { value: String(ORDER_TYPE_COMMERCIAL), label: "Commercial" },
];

const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Newest First" },
  { value: "created_at,ASC", label: "Oldest First" },
  { value: "start_date,DESC", label: "Start Date (Newest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest)" },
  { value: "customer_name,ASC", label: "Customer Name (A-Z)" },
  { value: "customer_name,DESC", label: "Customer Name (Z-A)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

const VIEW_TYPE_TABULAR = "tabular";
const VIEW_TYPE_GRID = "grid";

function AdminOrderListPage() {
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [orders, setOrders] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [viewType, setViewType] = useState(VIEW_TYPE_TABULAR);
  const [showFilters, setShowFilters] = useState(false);

  // Additional order-specific filters
  const [startDateGte, setStartDateGte] = useState("");
  const [startDateLte, setStartDateLte] = useState("");
  const [completionDateGte, setCompletionDateGte] = useState("");
  const [completionDateLte, setCompletionDateLte] = useState("");

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Use refs to track the latest filter values to avoid stale closures
  const filtersRef = useRef({
    searchQuery,
    statusFilter,
    typeFilter,
    sortBy,
    startDateGte,
    startDateLte,
    completionDateGte,
    completionDateLte,
    pageSize,
  });

  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = {
      searchQuery,
      statusFilter,
      typeFilter,
      sortBy,
      startDateGte,
      startDateLte,
      completionDateGte,
      completionDateLte,
      pageSize,
    };
  }, [
    searchQuery,
    statusFilter,
    typeFilter,
    sortBy,
    startDateGte,
    startDateLte,
    completionDateGte,
    completionDateLte,
    pageSize,
  ]);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch orders using the new manager - now uses refs for filter values
  const fetchOrders = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      // Get the latest filter values from refs
      const currentFilters = filtersRef.current;

      console.log(
        "🔄 fetchOrders called with cursor:",
        cursor,
        "pageSize:",
        currentFilters.pageSize,
        "filters:",
        currentFilters,
      );

      setLoading(true);
      setError(null);

      // Always clear the cache when fetching with new filters
      if (!isNavigatingBack) {
        orderManager.clearOrdersCache();
      }

      try {
        // Build params using Map for legacy filtersMap approach
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Add page size
        filtersMap.set("page_size", currentFilters.pageSize.toString());

        // Add sorting
        if (currentFilters.sortBy) {
          const [sortField, sortOrder] = currentFilters.sortBy.split(",");
          filtersMap.set("sort_field", sortField);
          filtersMap.set("sort_order", sortOrder);
        }

        // Add search
        if (currentFilters.searchQuery.trim()) {
          filtersMap.set("search", currentFilters.searchQuery.trim());
        }

        // Add filters
        if (currentFilters.statusFilter) {
          filtersMap.set("status", currentFilters.statusFilter);
        }
        if (currentFilters.typeFilter) {
          filtersMap.set("type", currentFilters.typeFilter);
        }
        if (currentFilters.startDateGte) {
          const date = new Date(currentFilters.startDateGte);
          filtersMap.set("start_date_gte", date.getTime().toString());
        }
        if (currentFilters.startDateLte) {
          const date = new Date(currentFilters.startDateLte);
          filtersMap.set("start_date_lte", date.getTime().toString());
        }
        if (currentFilters.completionDateGte) {
          const date = new Date(currentFilters.completionDateGte);
          filtersMap.set("completion_date_gte", date.getTime().toString());
        }
        if (currentFilters.completionDateLte) {
          const date = new Date(currentFilters.completionDateLte);
          filtersMap.set("completion_date_lte", date.getTime().toString());
        }

        console.log(
          "🌐 Making API call with filters:",
          Array.from(filtersMap.entries()),
        );

        // Use the manager method - always force refresh to avoid cache issues
        const response = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // Always force refresh
        );

        console.log("✅ API response received:", {
          resultsCount: response.results?.length,
          nextCursor: response.nextCursor,
          hasNextPage: response.hasNextPage,
          totalCount: response.count,
        });

        setOrders(response.results || []);
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
        console.error("❌ Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [orderManager, onUnauthorized],
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
    fetchOrders("");
  };

  // Immediate filter application function
  const applyFilters = useCallback(() => {
    console.log("🔄 Applying filters - resetting pagination");
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    // Clear cache and fetch fresh data
    orderManager.clearOrdersCache();
    fetchOrders("");
  }, [fetchOrders, orderManager]);

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
      fetchOrders(nextCursor);
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
      fetchOrders(previousCursor || "", true);
    } else {
      console.log("❌ Already on first page");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("📏 Page size changing from", pageSize, "to", newPageSize);
    setPageSize(newPageSize);
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    console.log("🧿 Status change -->", e.target.value);
    setStatusFilter(e.target.value);
    // Apply filters immediately after state update
    setTimeout(() => applyFilters(), 0);
  };

  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setTimeout(() => applyFilters(), 0);
  };

  // Handle date filter changes
  const handleDateFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setTimeout(() => applyFilters(), 0);
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setLoading(true);
      await orderManager.archiveOrder(orderToDelete.id, onUnauthorized);

      // Refresh the current page
      fetchOrders(currentCursor);

      // Reset delete state
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError("Failed to delete order. Please try again.");
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
    setSortBy("created_at,DESC");
    setStartDateGte("");
    setStartDateLte("");
    setCompletionDateGte("");
    setCompletionDateLte("");
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    setShowFilters(false);
    // Clear cache and fetch fresh data
    orderManager.clearOrdersCache();
    setTimeout(() => fetchOrders(""), 0);
  }, [fetchOrders, orderManager]);

  // Initial data load - only on mount
  useEffect(() => {
    console.log("🚀 Initial mount - loading first page");
    fetchOrders("");
  }, []); // Empty dependency array for initial load only

  // Format order status for display
  const getOrderStatusDisplay = (status) => {
    // Convert string to number if needed
    const statusNum =
      typeof status === "string" ? parseInt(status, 10) : status;

    const statusMap = {
      [ORDER_STATUS_NEW]: { label: "New", color: theme.colors.info },
      [ORDER_STATUS_DECLINED]: {
        label: "Declined",
        color: theme.colors.danger,
      },
      [ORDER_STATUS_PENDING]: { label: "Pending", color: theme.colors.warning },
      [ORDER_STATUS_CANCELLED]: {
        label: "Cancelled",
        color: theme.colors.secondary,
      },
      [ORDER_STATUS_ONGOING]: { label: "Ongoing", color: theme.colors.primary },
      [ORDER_STATUS_IN_PROGRESS]: {
        label: "In Progress",
        color: theme.colors.primary,
      },
      [ORDER_STATUS_COMPLETED_BUT_UNPAID]: {
        label: "Completed (Unpaid)",
        color: theme.colors.warning,
      },
      [ORDER_STATUS_COMPLETED_AND_PAID]: {
        label: "Completed (Paid)",
        color: theme.colors.success,
      },
      [ORDER_STATUS_ARCHIVED]: {
        label: "Archived",
        color: theme.colors.secondary,
      },
    };

    return (
      statusMap[statusNum] || {
        label: "Unknown",
        color: theme.colors.secondary,
      }
    );
  };

  // Format order type for display
  const getOrderTypeDisplay = (type) => {
    // Convert string to number if needed for comparison with numeric constants
    const typeNum = typeof type === "string" ? parseInt(type, 10) : type;

    switch (typeNum) {
      case ORDER_TYPE_COMMERCIAL:
        return "Commercial";
      case ORDER_TYPE_RESIDENTIAL:
        return "Residential";
      default:
        return "Unknown";
    }
  };

  // Table columns for tabular view
  const tableColumns = [
    {
      key: "id",
      label: "Order #",
      render: (value, order) => (
        <Link
          to={`/admin/order/${order.wjid || order.id}`}
          style={{ color: theme.colors.primary }}
        >
          {order.wjid || `#${order.id}`}
        </Link>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (value, order) => (
        <Link
          to={`/admin/customer/${order.customerId}`}
          style={{ color: theme.colors.primary }}
        >
          {value || "N/A"}
        </Link>
      ),
    },
    {
      key: "associateName",
      label: "Associate",
      render: (value, order) =>
        order.associateId ? (
          <Link
            to={`/admin/associate/${order.associateId}`}
            style={{ color: theme.colors.primary }}
          >
            {value || "N/A"}
          </Link>
        ) : (
          <span style={{ color: theme.colors.secondary }}>Unassigned</span>
        ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => getOrderTypeDisplay(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const statusInfo = getOrderStatusDisplay(value);
        return (
          <span
            style={{
              color: statusInfo.color,
              fontWeight: "600",
            }}
          >
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (value) => formatDateForDisplay(value),
    },
    {
      key: "completionDate",
      label: "Completion",
      render: (value) => formatDateForDisplay(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/admin/order/${order.wjid || order.id}`}>
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
    { label: "Work Orders", icon: "🔧" },
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
        <h1 style={{ margin: 0 }}>🔧 Work Orders</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin/orders/add/step-1-search">
            <Button variant="success">➕ Add Order</Button>
          </Link>
          <Link to="/admin/orders/search">
            <Button variant="info">🔍 Search Orders</Button>
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
                placeholder="Search orders..."
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
              options={ORDER_SORT_OPTIONS}
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
                  onChange={handleStatusFilterChange}
                  options={ORDER_STATUS_OPTIONS}
                />

                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  options={ORDER_TYPE_OPTIONS}
                />

                <Input
                  label="Start Date (From)"
                  type="date"
                  value={startDateGte}
                  onChange={handleDateFilterChange(setStartDateGte)}
                />

                <Input
                  label="Start Date (To)"
                  type="date"
                  value={startDateLte}
                  onChange={handleDateFilterChange(setStartDateLte)}
                />

                <Input
                  label="Completion Date (From)"
                  type="date"
                  value={completionDateGte}
                  onChange={handleDateFilterChange(setCompletionDateGte)}
                />

                <Input
                  label="Completion Date (To)"
                  type="date"
                  value={completionDateLte}
                  onChange={handleDateFilterChange(setCompletionDateLte)}
                />
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
        {loading && <Loading message="Loading orders..." />}

        {/* Results */}
        {!loading && (
          <>
            {/* Results Count */}
            <div
              style={{ marginBottom: "20px", color: theme.colors.secondary }}
            >
              <div>
                Showing <strong>{orders.length}</strong> orders
                {totalCount > 0 && ` (Total: ${totalCount})`}
                {searchQuery && ` (filtered by "${searchQuery}")`}
              </div>
            </div>

            {/* Order List */}
            {orders.length > 0 ? (
              <>
                {viewType === VIEW_TYPE_TABULAR ? (
                  <Table
                    columns={tableColumns}
                    data={orders}
                    onRowClick={(order) =>
                      navigate(`/admin/order/${order.wjid || order.id}`)
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
                    {orders.map((order) => {
                      const statusInfo = getOrderStatusDisplay(order.status);
                      return (
                        <Card
                          key={order.id}
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                          }}
                        >
                          <div style={{ marginBottom: "15px" }}>
                            <h3 style={{ margin: "0 0 5px 0" }}>
                              <Link
                                to={`/admin/order/${order.wjid || order.id}`}
                                style={{
                                  color: theme.colors.primary,
                                  textDecoration: "none",
                                }}
                              >
                                Order {order.wjid || `#${order.id}`}
                              </Link>
                            </h3>
                            <span
                              style={{
                                color: statusInfo.color,
                                fontWeight: "600",
                                fontSize: "14px",
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div
                            style={{ marginBottom: "15px", fontSize: "14px" }}
                          >
                            <div>
                              <strong>Customer:</strong>{" "}
                              <Link
                                to={`/admin/customer/${order.customerId}`}
                                style={{ color: theme.colors.primary }}
                              >
                                {order.customerName || "N/A"}
                              </Link>
                            </div>
                            <div>
                              <strong>Associate:</strong>{" "}
                              {order.associateId ? (
                                <Link
                                  to={`/admin/associate/${order.associateId}`}
                                  style={{ color: theme.colors.primary }}
                                >
                                  {order.associateName || "N/A"}
                                </Link>
                              ) : (
                                <span style={{ color: theme.colors.secondary }}>
                                  Unassigned
                                </span>
                              )}
                            </div>
                            <div>
                              <strong>Type:</strong>{" "}
                              {getOrderTypeDisplay(order.type)}
                            </div>
                            <div>
                              <strong>Start Date:</strong>{" "}
                              {formatDateForDisplay(order.startDate)}
                            </div>
                            {order.completionDate && (
                              <div>
                                <strong>Completion:</strong>{" "}
                                {formatDateForDisplay(order.completionDate)}
                              </div>
                            )}
                            {order.description && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  color: theme.colors.secondary,
                                  fontSize: "13px",
                                }}
                              >
                                {order.description.substring(0, 100)}
                                {order.description.length > 100 && "..."}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                              to={`/admin/order/${order.wjid || order.id}`}
                              style={{ flex: 1 }}
                            >
                              <Button fullWidth variant="primary">
                                View Details →
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      );
                    })}
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
                          (Total: {totalCount} orders)
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
                <h3>No Orders Found</h3>
                <p
                  style={{
                    color: theme.colors.secondary,
                    marginBottom: "30px",
                  }}
                >
                  {searchQuery ||
                  statusFilter ||
                  typeFilter ||
                  startDateGte ||
                  startDateLte ||
                  completionDateGte ||
                  completionDateLte
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "No orders have been created yet."}
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
                    statusFilter ||
                    typeFilter ||
                    startDateGte ||
                    startDateLte ||
                    completionDateGte ||
                    completionDateLte) && (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Link to="/admin/orders/add/step-1-search">
                    <Button variant="success">➕ Add First Order</Button>
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
              onClick={handleDeleteOrder}
              disabled={loading}
            >
              {loading ? "Archiving..." : "Archive Order"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to archive order{" "}
          <strong>{orderToDelete?.wjid || `#${orderToDelete?.id}`}</strong>?
          This action will archive the order and it will no longer appear on
          your dashboard.
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

export default AdminOrderListPage;

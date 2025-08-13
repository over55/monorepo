// File Path: web/workery-frontend/src/pages/Admin/Order/Search/ResultPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager, useOrderManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Table,
  Select,
} from "../../../../components/UI";

function AdminOrderSearchResultPage() {
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  // Search criteria from URL parameters
  const searchCriteria = {
    customerFirstName: searchParams.get("cfn") || "",
    customerLastName: searchParams.get("cln") || "",
    customerEmail: searchParams.get("ce") || "",
    customerPhone: searchParams.get("cp") || "",
    customerOrganizationName: searchParams.get("con") || "",
    generalSearch: searchParams.get("q") || "",
    associateFirstName: searchParams.get("afn") || "",
    associateLastName: searchParams.get("aln") || "",
    associateEmail: searchParams.get("ae") || "",
    associatePhone: searchParams.get("ap") || "",
    associateOrganizationName: searchParams.get("aon") || "",
    orderWjid: searchParams.get("owjid") || "",
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const buildSearchParams = (page = 1) => {
    const params = {
      page: page,
      limit: pageSize,
    };

    // Add sorting
    if (sortBy) {
      const [field, order] = sortBy.split(",");
      params.sortBy = field;
      params.sortOrder = order;
    }

    // Add status filter
    if (status) {
      params.status = status;
    }

    // Add type filter
    if (type) {
      params.type = type;
    }

    // Add search criteria
    if (searchCriteria.generalSearch) {
      params.search = searchCriteria.generalSearch;
    }
    if (searchCriteria.customerFirstName) {
      params.customerFirstName = searchCriteria.customerFirstName;
    }
    if (searchCriteria.customerLastName) {
      params.customerLastName = searchCriteria.customerLastName;
    }
    if (searchCriteria.customerEmail) {
      params.customerEmail = searchCriteria.customerEmail;
    }
    if (searchCriteria.customerPhone) {
      params.customerPhone = searchCriteria.customerPhone;
    }
    if (searchCriteria.customerOrganizationName) {
      params.customerOrganizationName = searchCriteria.customerOrganizationName;
    }
    if (searchCriteria.associateFirstName) {
      params.associateFirstName = searchCriteria.associateFirstName;
    }
    if (searchCriteria.associateLastName) {
      params.associateLastName = searchCriteria.associateLastName;
    }
    if (searchCriteria.associateEmail) {
      params.associateEmail = searchCriteria.associateEmail;
    }
    if (searchCriteria.associatePhone) {
      params.associatePhone = searchCriteria.associatePhone;
    }
    if (searchCriteria.associateOrganizationName) {
      params.associateOrganizationName =
        searchCriteria.associateOrganizationName;
    }
    if (searchCriteria.orderWjid) {
      params.wjid = searchCriteria.orderWjid;
    }

    return params;
  };

  const fetchOrders = async (page = 1) => {
    if (isFetching) {
      console.log("Already fetching, skipping duplicate request");
      return;
    }

    setFetching(true);
    setErrors({});

    try {
      const params = buildSearchParams(page);

      console.log("Fetching orders with params:", params);

      // Clear the orders cache to ensure fresh data
      orderManager.clearOrdersCache();

      // Fetch orders using the OrderManager
      const ordersData = await orderManager.getOrders(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      console.log("Orders data received:", {
        resultsCount: ordersData.results ? ordersData.results.length : 0,
        totalCount: ordersData.count,
        page: page,
      });

      setOrders(ordersData.results || []);
      setTotalCount(ordersData.count || 0);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setErrors({
        fetch: error.message || "Failed to load order search results",
      });
      setOrders([]);
      setTotalCount(0);
      setHasSearched(true);
    } finally {
      setFetching(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (isFetching) {
      return;
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log(`Changing to page ${newPage} of ${totalPages}`);
      fetchOrders(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    const newSize = parseInt(newPageSize);
    if (newSize !== pageSize) {
      setPageSize(newSize);
      setCurrentPage(1); // Reset to first page
      // Will trigger useEffect to refetch
    }
  };

  const handleSortChange = (newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
      setCurrentPage(1); // Reset to first page
      // Will trigger useEffect to refetch
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== status) {
      setStatus(newStatus);
      setCurrentPage(1); // Reset to first page
      // Will trigger useEffect to refetch
    }
  };

  const handleTypeChange = (newType) => {
    if (newType !== type) {
      setType(newType);
      setCurrentPage(1); // Reset to first page
      // Will trigger useEffect to refetch
    }
  };

  const handleOrderClick = (order) => {
    navigate(`/admin/order/${order.wjid}`);
  };

  const getSearchSummary = () => {
    const criteria = [];

    if (searchCriteria.generalSearch) {
      criteria.push(`Keywords: "${searchCriteria.generalSearch}"`);
    }
    if (searchCriteria.customerFirstName || searchCriteria.customerLastName) {
      const name = [
        searchCriteria.customerFirstName,
        searchCriteria.customerLastName,
      ]
        .filter(Boolean)
        .join(" ");
      criteria.push(`Customer: "${name}"`);
    }
    if (searchCriteria.customerEmail) {
      criteria.push(`Customer Email: "${searchCriteria.customerEmail}"`);
    }
    if (searchCriteria.customerPhone) {
      criteria.push(`Customer Phone: "${searchCriteria.customerPhone}"`);
    }
    if (searchCriteria.customerOrganizationName) {
      criteria.push(
        `Customer Org: "${searchCriteria.customerOrganizationName}"`,
      );
    }
    if (searchCriteria.associateFirstName || searchCriteria.associateLastName) {
      const name = [
        searchCriteria.associateFirstName,
        searchCriteria.associateLastName,
      ]
        .filter(Boolean)
        .join(" ");
      criteria.push(`Associate: "${name}"`);
    }
    if (searchCriteria.associateEmail) {
      criteria.push(`Associate Email: "${searchCriteria.associateEmail}"`);
    }
    if (searchCriteria.associatePhone) {
      criteria.push(`Associate Phone: "${searchCriteria.associatePhone}"`);
    }
    if (searchCriteria.associateOrganizationName) {
      criteria.push(
        `Associate Org: "${searchCriteria.associateOrganizationName}"`,
      );
    }
    if (searchCriteria.orderWjid) {
      criteria.push(`Job #: "${searchCriteria.orderWjid}"`);
    }

    return criteria.length > 0 ? criteria.join(", ") : "No criteria specified";
  };

  // Safe field access helper
  const getFieldValue = (obj, path, defaultValue = "") => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined && current[key] !== null
        ? current[key]
        : defaultValue;
    }, obj);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format status helper
  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";
    return status.toString().replace(/_/g, " ").toUpperCase();
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Check if we have any search criteria
      const hasAnyCriteria = Object.values(searchCriteria).some(
        (value) => value && value.trim(),
      );

      if (!hasAnyCriteria) {
        setErrors({
          search:
            "No search criteria provided. Please go back and enter search terms.",
        });
        setHasSearched(true);
        return;
      }

      // Initial fetch is triggered by dependencies
    }

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Trigger fetch when filters or pagination changes
  useEffect(() => {
    if (authManager.isAuthenticated()) {
      const hasAnyCriteria = Object.values(searchCriteria).some(
        (value) => value && value.trim(),
      );

      if (hasAnyCriteria) {
        fetchOrders(currentPage);
      }
    }
  }, [pageSize, sortBy, status, type]); // Re-fetch when these change

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    { path: "/admin/orders/search", label: "Search", icon: "🔍" },
    { label: "Results", icon: "📋" },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  // Table columns
  const tableColumns = [
    {
      key: "wjid",
      label: "Job #",
      render: (value, order) => {
        const wjid = getFieldValue(order, "wjid") || `#${order.id}`;
        return (
          <span style={{ fontWeight: "600", color: theme.colors.primary }}>
            {wjid}
          </span>
        );
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (value, order) => {
        const firstName = getFieldValue(order, "customerFirstName", "");
        const lastName = getFieldValue(order, "customerLastName", "");
        const orgName = getFieldValue(order, "customerOrganizationName", "");

        let displayName = orgName || `${firstName} ${lastName}`.trim() || "N/A";
        return <span>{displayName}</span>;
      },
    },
    {
      key: "associate",
      label: "Associate",
      render: (value, order) => {
        const firstName = getFieldValue(order, "associateFirstName", "");
        const lastName = getFieldValue(order, "associateLastName", "");

        let displayName = `${firstName} ${lastName}`.trim() || "Unassigned";
        return (
          <span
            style={{ color: displayName === "Unassigned" ? "#999" : "inherit" }}
          >
            {displayName}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, order) => {
        const status = getFieldValue(order, "status", "unknown");
        const statusColors = {
          1: "#28a745", // New
          2: "#17a2b8", // Assigned
          3: "#ffc107", // In Progress
          4: "#6f42c1", // Completed
          5: "#6c757d", // Closed
          6: "#dc3545", // Cancelled
        };
        return (
          <span
            style={{
              color: statusColors[status] || "#6c757d",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            {formatStatus(status)}
          </span>
        );
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (value, order) => {
        const startDate = getFieldValue(order, "startDate");
        return <span>{formatDate(startDate)}</span>;
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value, order) => {
        const description = getFieldValue(
          order,
          "description",
          "No description",
        );
        const truncated =
          description.length > 50
            ? `${description.substring(0, 50)}...`
            : description;
        return <span title={description}>{truncated}</span>;
      },
    },
  ];

  const styles = {
    searchSummary: {
      backgroundColor: "#e9ecef",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      color: "#495057",
    },
    filterSection: {
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "20px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
    },
    resultsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    paginationControls: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    pageInfo: {
      fontSize: "14px",
      color: "#6c757d",
    },
    noResults: {
      textAlign: "center",
      padding: "40px",
      color: "#6c757d",
    },
  };

  if (isFetching && !hasSearched) {
    return <Loading message="Searching orders..." />;
  }

  // Sort options
  const sortOptions = [
    { value: "created_at,DESC", label: "Newest First" },
    { value: "created_at,ASC", label: "Oldest First" },
    { value: "start_date,DESC", label: "Start Date (Newest)" },
    { value: "start_date,ASC", label: "Start Date (Oldest)" },
    { value: "customer_last_name,ASC", label: "Customer Name (A-Z)" },
    { value: "customer_last_name,DESC", label: "Customer Name (Z-A)" },
  ];

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "1", label: "New" },
    { value: "2", label: "Assigned" },
    { value: "3", label: "In Progress" },
    { value: "4", label: "Completed" },
    { value: "5", label: "Closed" },
    { value: "6", label: "Cancelled" },
  ];

  // Type options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "1", label: "Residential" },
    { value: "2", label: "Commercial" },
    { value: "3", label: "Unassigned" },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>🔧 Orders</h1>
      <h2 style={{ fontSize: "18px", color: "#6c757d", marginBottom: "20px" }}>
        📋 Search Results
      </h2>

      {Object.keys(errors).length > 0 && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.fetch || errors.search || "An error occurred"}
        </Alert>
      )}

      {/* Search Summary */}
      <div style={styles.searchSummary}>
        <strong>Search Criteria:</strong> {getSearchSummary()}
      </div>

      <Card>
        {/* Filters */}
        <div style={styles.filterSection}>
          <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>
            🔍 Filters & Sorting
          </h3>
          <div style={styles.filterGrid}>
            <Select
              label="Status"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              options={typeOptions}
            />
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              options={sortOptions}
            />
            <Select
              label="Page Size"
              value={pageSize.toString()}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              options={pageSizeOptions}
            />
          </div>
        </div>

        <div style={styles.resultsHeader}>
          <div>
            {hasSearched && (
              <span style={styles.pageInfo}>
                {totalCount > 0
                  ? `Found ${totalCount} order${totalCount === 1 ? "" : "s"}`
                  : "No orders found"}
                {totalPages > 1 && ` - Page ${currentPage} of ${totalPages}`}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/admin/orders/search">
              <Button variant="secondary">🔍 New Search</Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline">← Back to Orders</Button>
            </Link>
          </div>
        </div>

        {/* Results Table */}
        {hasSearched && (
          <>
            {orders.length > 0 ? (
              <>
                <Table
                  columns={tableColumns}
                  data={orders}
                  onRowClick={handleOrderClick}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <div style={styles.pageInfo}>
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalCount)} of{" "}
                      {totalCount} results
                    </div>

                    <div style={styles.paginationControls}>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isFetching}
                      >
                        ← Previous
                      </Button>

                      <span style={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || isFetching}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.noResults}>
                <h3>No orders found</h3>
                <p>Try adjusting your search criteria or filters.</p>
                <Link to="/admin/orders/search">
                  <Button variant="primary" style={{ marginTop: "15px" }}>
                    🔍 Try New Search
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {isFetching && hasSearched && (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderSearchResultPage;

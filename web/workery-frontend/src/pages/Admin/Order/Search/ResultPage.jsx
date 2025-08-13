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
} from "../../../../components/UI";

function AdminOrderSearchResultPage() {
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [hasSearched, setHasSearched] = useState(false);

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

  const buildSearchFiltersMap = (page = 1) => {
    const filtersMap = new Map();

    // Add pagination
    filtersMap.set("page", page);
    filtersMap.set("pageSize", pageSize);

    console.log("AdminOrderSearchResult: Building filters for page:", page);

    // Add search criteria
    if (searchCriteria.customerFirstName) {
      filtersMap.set("customerFirstName", searchCriteria.customerFirstName);
    }
    if (searchCriteria.customerLastName) {
      filtersMap.set("customerLastName", searchCriteria.customerLastName);
    }
    if (searchCriteria.customerEmail) {
      filtersMap.set("customerEmail", searchCriteria.customerEmail);
    }
    if (searchCriteria.customerPhone) {
      filtersMap.set("customerPhone", searchCriteria.customerPhone);
    }
    if (searchCriteria.customerOrganizationName) {
      filtersMap.set(
        "customerOrganizationName",
        searchCriteria.customerOrganizationName,
      );
    }
    if (searchCriteria.generalSearch) {
      filtersMap.set("search", searchCriteria.generalSearch);
    }
    if (searchCriteria.associateFirstName) {
      filtersMap.set("associateFirstName", searchCriteria.associateFirstName);
    }
    if (searchCriteria.associateLastName) {
      filtersMap.set("associateLastName", searchCriteria.associateLastName);
    }
    if (searchCriteria.associateEmail) {
      filtersMap.set("associateEmail", searchCriteria.associateEmail);
    }
    if (searchCriteria.associatePhone) {
      filtersMap.set("associatePhone", searchCriteria.associatePhone);
    }
    if (searchCriteria.associateOrganizationName) {
      filtersMap.set(
        "associateOrganizationName",
        searchCriteria.associateOrganizationName,
      );
    }
    if (searchCriteria.orderWjid) {
      filtersMap.set("wjid", searchCriteria.orderWjid);
    }

    console.log(
      "AdminOrderSearchResult: Final filters map:",
      Array.from(filtersMap.entries()),
    );
    return filtersMap;
  };

  const fetchOrders = async (page = 1) => {
    setFetching(true);
    setErrors({});

    try {
      const filtersMap = buildSearchFiltersMap(page);

      console.log(
        "AdminOrderSearchResult: Fetching orders with filters:",
        filtersMap,
      );
      console.log("AdminOrderSearchResult: Requesting page:", page);

      // Clear the orders cache to ensure fresh data for pagination
      orderManager.clearOrdersCache();

      // Also check if OrderManager is in a loading state
      const cacheInfo = orderManager.getOrdersCacheInfo();
      console.log(
        "AdminOrderSearchResult: OrderManager cache info:",
        cacheInfo,
      );

      // If OrderManager thinks it's still loading, force it to stop
      if (cacheInfo.orders?.memoryCache?.isLoading) {
        console.log(
          "AdminOrderSearchResult: OrderManager was stuck in loading state, clearing...",
        );
        // This is a workaround - we might need to add a method to OrderManager to clear loading state
      }

      // Try alternative approach with regular getOrders method if filtersMap doesn't work well
      let ordersData;
      try {
        ordersData = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // Force refresh for search results
        );
      } catch (error) {
        console.log(
          "AdminOrderSearchResult: FiltersMap method failed, trying alternative approach:",
          error,
        );

        // Convert filtersMap to regular params object
        const params = {};
        filtersMap.forEach((value, key) => {
          params[key] = value;
        });

        console.log(
          "AdminOrderSearchResult: Trying with regular params:",
          params,
        );
        ordersData = await orderManager.getOrders(params, onUnauthorized, true);
      }

      console.log("AdminOrderSearchResult: Raw orders data:", ordersData);
      console.log("AdminOrderSearchResult: Returned page info:", {
        requestedPage: page,
        resultsCount: ordersData.results ? ordersData.results.length : 0,
        totalCount: ordersData.count,
      });

      // Debug: Log first order to see structure
      if (ordersData.results && ordersData.results.length > 0) {
        console.log(
          "AdminOrderSearchResult: First order structure:",
          ordersData.results[0],
        );
      }

      setOrders(ordersData.results || []);
      setTotalCount(ordersData.count || 0);
      setCurrentPage(page);
      setHasSearched(true);

      console.log("AdminOrderSearchResult: Orders data loaded successfully:", {
        count: ordersData.results ? ordersData.results.length : 0,
        totalCount: ordersData.count,
        currentPage: page,
      });
    } catch (error) {
      console.error("AdminOrderSearchResult: Failed to fetch orders:", error);
      setErrors({
        fetch: error.message || "Failed to load order search results",
      });
      setOrders([]);
      setTotalCount(0);
      setHasSearched(true);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  const handlePageChange = (newPage) => {
    console.log("AdminOrderSearchResult: Page change requested:", {
      currentPage,
      newPage,
      totalPages,
      totalCount,
      pageSize,
      isFetching,
    });

    // Prevent pagination if already fetching
    if (isFetching) {
      console.log(
        "AdminOrderSearchResult: Page change rejected - already fetching",
      );
      return;
    }

    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log(
        "AdminOrderSearchResult: Proceeding with page change to:",
        newPage,
      );

      // Set a timeout to prevent infinite loading states
      const timeoutId = setTimeout(() => {
        console.log(
          "AdminOrderSearchResult: Pagination timeout - forcing loading state to false",
        );
        setFetching(false);
      }, 10000); // 10 second timeout

      fetchOrders(newPage).finally(() => {
        clearTimeout(timeoutId);
      });

      window.scrollTo(0, 0);
    } else {
      console.log("AdminOrderSearchResult: Page change rejected:", {
        reason:
          newPage < 1
            ? "Page below 1"
            : newPage > totalPages
              ? "Page above total"
              : newPage === currentPage
                ? "Same page"
                : "Unknown",
      });
    }
  };

  const handleOrderClick = (order) => {
    navigate(`/admin/order/${order.id}`);
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

      // Perform search
      fetchOrders(1);
    }

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    { path: "/admin/orders/search", label: "Search", icon: "🔍" },
    { label: "Results", icon: "📋" },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  // Table columns with safe field access
  const tableColumns = [
    {
      key: "id",
      label: "Job #",
      render: (value, order) => {
        try {
          const wjid =
            getFieldValue(order, "wjid") ||
            getFieldValue(order, "workOrderId") ||
            getFieldValue(order, "jobId");
          const displayValue = wjid || `#${value}`;
          return (
            <span style={{ fontWeight: "600", color: theme.colors.primary }}>
              {displayValue}
            </span>
          );
        } catch (error) {
          console.error("Error rendering job #:", error);
          return <span>#{value}</span>;
        }
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (value, order) => {
        try {
          const firstName =
            getFieldValue(order, "customerFirstName") ||
            getFieldValue(order, "customer.firstName");
          const lastName =
            getFieldValue(order, "customerLastName") ||
            getFieldValue(order, "customer.lastName");
          const orgName =
            getFieldValue(order, "customerOrganizationName") ||
            getFieldValue(order, "customer.organizationName");

          let displayName = "N/A";
          if (firstName && lastName) {
            displayName = `${firstName} ${lastName}`;
          } else if (orgName) {
            displayName = orgName;
          } else if (firstName) {
            displayName = firstName;
          } else if (lastName) {
            displayName = lastName;
          }

          return <span>{displayName}</span>;
        } catch (error) {
          console.error("Error rendering customer:", error);
          return <span>N/A</span>;
        }
      },
    },
    {
      key: "associate",
      label: "Associate",
      render: (value, order) => {
        try {
          const firstName =
            getFieldValue(order, "associateFirstName") ||
            getFieldValue(order, "associate.firstName");
          const lastName =
            getFieldValue(order, "associateLastName") ||
            getFieldValue(order, "associate.lastName");

          let displayName = "Unassigned";
          if (firstName && lastName) {
            displayName = `${firstName} ${lastName}`;
          } else if (firstName) {
            displayName = firstName;
          } else if (lastName) {
            displayName = lastName;
          }

          return (
            <span
              style={{
                color: displayName === "Unassigned" ? "#999" : "inherit",
              }}
            >
              {displayName}
            </span>
          );
        } catch (error) {
          console.error("Error rendering associate:", error);
          return <span style={{ color: "#999" }}>Unassigned</span>;
        }
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value, order) => {
        try {
          const status =
            getFieldValue(order, "status") ||
            getFieldValue(order, "state") ||
            "unknown";
          const statusColors = {
            new: "#28a745",
            assigned: "#17a2b8",
            in_progress: "#ffc107",
            completed: "#6f42c1",
            closed: "#6c757d",
            cancelled: "#dc3545",
          };
          const displayStatus = status
            ? status.toString().replace(/_/g, " ").toUpperCase()
            : "UNKNOWN";
          return (
            <span
              style={{
                color: statusColors[status] || "#6c757d",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              {displayStatus}
            </span>
          );
        } catch (error) {
          console.error("Error rendering status:", error);
          return (
            <span
              style={{ color: "#6c757d", fontWeight: "600", fontSize: "12px" }}
            >
              UNKNOWN
            </span>
          );
        }
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (value, order) => {
        try {
          const startDate =
            getFieldValue(order, "startDate") ||
            getFieldValue(order, "scheduledDate");
          return <span>{startDate || "Not set"}</span>;
        } catch (error) {
          console.error("Error rendering start date:", error);
          return <span>Not set</span>;
        }
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value, order) => {
        try {
          const description =
            getFieldValue(order, "description") ||
            getFieldValue(order, "summary") ||
            getFieldValue(order, "title");
          const truncated =
            description && description.length > 50
              ? `${description.substring(0, 50)}...`
              : description;
          return (
            <span title={description}>{truncated || "No description"}</span>
          );
        } catch (error) {
          console.error("Error rendering description:", error);
          return <span>No description</span>;
        }
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
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      marginTop: "20px",
      flexWrap: "wrap",
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
    debugInfo: {
      backgroundColor: "#f8f9fa",
      padding: "10px",
      borderRadius: "4px",
      marginBottom: "10px",
      fontSize: "12px",
      fontFamily: "monospace",
      maxHeight: "200px",
      overflow: "auto",
    },
  };

  if (isFetching) {
    return <Loading message="Searching orders..." />;
  }

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

      {/* Debug Info in Development */}
      {process.env.NODE_ENV === "development" && orders.length > 0 && (
        <div style={styles.debugInfo}>
          <strong>Debug - First Order Structure:</strong>
          <pre>{JSON.stringify(orders[0], null, 2)}</pre>
        </div>
      )}

      <Card>
        <div style={styles.resultsHeader}>
          <div>
            {hasSearched && (
              <span style={styles.pageInfo}>
                {totalCount > 0
                  ? `Found ${totalCount} order${totalCount === 1 ? "" : "s"}`
                  : "No orders found"}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
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
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log(
                          "Previous button clicked, current page:",
                          currentPage,
                        );
                        handlePageChange(currentPage - 1);
                      }}
                      disabled={currentPage <= 1 || isFetching}
                    >
                      {isFetching ? "Loading..." : "← Previous"}
                    </Button>

                    <span style={styles.pageInfo}>
                      Page {currentPage} of {totalPages} ({totalCount} total
                      results)
                      {isFetching && " - Loading..."}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log(
                          "Next button clicked, current page:",
                          currentPage,
                        );
                        handlePageChange(currentPage + 1);
                      }}
                      disabled={currentPage >= totalPages || isFetching}
                    >
                      {isFetching ? "Loading..." : "Next →"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.noResults}>
                <h3>No orders found</h3>
                <p>Try adjusting your search criteria or search terms.</p>
                <Link to="/admin/orders/search">
                  <Button variant="primary" style={{ marginTop: "15px" }}>
                    🔍 Try New Search
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderSearchResultPage;

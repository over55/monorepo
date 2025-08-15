// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useOrderManager } from "../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  Select,
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
  ORDER_TYPE_UNASSIGNED,
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";
import {
  PAGE_SIZE_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
  DEFAULT_ORDER_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";

function AdminFinancialListPage() {
  const navigate = useNavigate();
  const orderManager = useOrderManager();

  // State
  const [orders, setOrders] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [selectedOrderForDeletion, setSelectedOrderForDeletion] =
    useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Filtering and Pagination state
  const [status, setStatus] = useState(0);
  const [type, setType] = useState(0);
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_ORDER_LIST_SORT_BY_VALUE,
  );
  const [pageSize, setPageSize] = useState(50);

  // Cursor-based pagination state (matching working Order List)
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch list function (matching pattern from working Order List)
  const fetchList = useCallback(
    async (cursor = "", isNavigatingBack = false) => {
      console.log(
        "fetchList called with cursor:",
        cursor,
        "pageSize:",
        pageSize,
      );

      setIsFetching(true);
      setErrors({});

      try {
        // Build filters map (matching working implementation)
        const filtersMap = new Map();

        // Add cursor if provided
        if (cursor) {
          filtersMap.set("cursor", cursor);
        }

        // Add page size
        filtersMap.set("page_size", pageSize.toString());

        // Sort field and order
        if (sortByValue) {
          const [sortField, sortOrder] = sortByValue.split(",");
          filtersMap.set("sort_field", sortField);
          filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
        }

        // Add filters only if not 0 (All)
        if (status !== 0) {
          filtersMap.set("status", status.toString());
        }
        if (type !== 0) {
          filtersMap.set("type", type.toString());
        }

        console.log(
          "Making API call with filters:",
          Array.from(filtersMap.entries()),
        );

        // Use the OrderManager to fetch orders
        const response = await orderManager.getOrdersWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        console.log("API response received:", {
          resultsCount: response.results?.length,
          nextCursor: response.nextCursor,
          hasNextPage: response.hasNextPage,
          totalCount: response.count,
        });

        setOrders(response);
        setTotalCount(response.count || 0);

        // Handle pagination response (matching working implementation)
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
        console.error("Failed to fetch orders:", err);
        setErrors({ general: "Failed to load orders. Please try again." });
        window.scrollTo(0, 0);
      } finally {
        setIsFetching(false);
      }
    },
    [pageSize, sortByValue, status, type, orderManager],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    console.log("Filter changed - resetting pagination");
    // Reset pagination when filters change
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchList("");
  }, [fetchList]);

  // Pagination handlers (matching working implementation)
  const handleNextPage = () => {
    console.log(
      "handleNextPage clicked, nextCursor:",
      nextCursor,
      "hasNextPage:",
      hasNextPage,
    );

    if (hasNextPage && nextCursor) {
      console.log("Going to next page with cursor:", nextCursor);

      // Push current cursor to history for "Previous" functionality
      setCursorHistory((prev) => [...prev, currentCursor]);

      // Fetch next page
      fetchList(nextCursor);
    } else {
      console.log("No next page available");
    }
  };

  const handlePreviousPage = () => {
    console.log("handlePreviousPage clicked");

    if (cursorHistory.length > 0) {
      // Pop the last cursor from history
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop();

      console.log(
        "Going to previous page with cursor:",
        previousCursor || "start",
      );

      // Update history
      setCursorHistory(newHistory);

      // Fetch previous page
      fetchList(previousCursor || "", true);
    } else {
      console.log("Already on first page");
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("Page size changing from", pageSize, "to", newPageSize);
    setPageSize(newPageSize);

    // Reset pagination when page size changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
  };

  // Event handlers
  const onClearFilterClick = (e) => {
    e.preventDefault();
    setType(0);
    setStatus(0);
    setSortByValue(DEFAULT_ORDER_LIST_SORT_BY_VALUE);

    // Reset pagination
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);

    // Fetch with cleared filters
    fetchList("");
  };

  const onSelectOrderForDeletion = (e, order) => {
    e.preventDefault();
    console.log("onSelectOrderForDeletion", order);
    setSelectedOrderForDeletion(order);
    setShowDeleteConfirmation(true);
  };

  const onDeselectOrderForDeletion = (e) => {
    if (e) e.preventDefault();
    console.log("onDeselectOrderForDeletion");
    setSelectedOrderForDeletion(null);
    setShowDeleteConfirmation(false);
  };

  const onDeleteConfirmButtonClick = async (e) => {
    e.preventDefault();
    console.log("onDeleteConfirmButtonClick");

    if (selectedOrderForDeletion) {
      try {
        setIsFetching(true);
        await orderManager.archiveOrder(
          selectedOrderForDeletion.id,
          onUnauthorized,
        );

        // Update notification
        setTopAlertStatus("success");
        setTopAlertMessage("Order archived successfully");
        setTimeout(() => {
          setTopAlertMessage("");
        }, 2000);

        // Refresh current page
        fetchList(currentCursor);
      } catch (err) {
        console.error("Failed to archive order:", err);
        setTopAlertStatus("danger");
        setTopAlertMessage("Failed to archive order");
        setTimeout(() => {
          setTopAlertMessage("");
        }, 2000);
      } finally {
        setIsFetching(false);
        setSelectedOrderForDeletion(null);
        setShowDeleteConfirmation(false);
      }
    }
  };

  // Format date helper - Just return the date string as is since it's already formatted by the API
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // The date is already formatted by the API layer, just return it
    return dateString;
  };

  // Format status helper using constants
  const formatStatus = (statusValue) => {
    switch (statusValue) {
      case ORDER_STATUS_NEW:
        return "New";
      case ORDER_STATUS_DECLINED:
        return "Declined";
      case ORDER_STATUS_PENDING:
        return "Pending";
      case ORDER_STATUS_CANCELLED:
        return "Cancelled";
      case ORDER_STATUS_ONGOING:
        return "Ongoing";
      case ORDER_STATUS_IN_PROGRESS:
        return "In Progress";
      case ORDER_STATUS_COMPLETED_BUT_UNPAID:
        return "Completed but Unpaid";
      case ORDER_STATUS_COMPLETED_AND_PAID:
        return "Completed and Paid";
      case ORDER_STATUS_ARCHIVED:
        return "Archived";
      default:
        return `Unknown (${statusValue})`;
    }
  };

  // Format type helper using constants
  const formatType = (typeValue) => {
    switch (typeValue) {
      case ORDER_TYPE_UNASSIGNED:
        return "Unassigned";
      case ORDER_TYPE_RESIDENTIAL:
        return "Residential";
      case ORDER_TYPE_COMMERCIAL:
        return "Commercial";
      default:
        return `Unknown (${typeValue})`;
    }
  };

  // Format type icon - Fixed to properly handle type values
  const getTypeIcon = (typeValue) => {
    // Log for debugging
    console.log(
      "getTypeIcon - typeValue:",
      typeValue,
      "type:",
      typeof typeValue,
    );

    // Convert to number if it's a string
    const typeNum =
      typeof typeValue === "string" ? parseInt(typeValue, 10) : typeValue;

    switch (typeNum) {
      case ORDER_TYPE_RESIDENTIAL:
        return "🏠";
      case ORDER_TYPE_COMMERCIAL:
        return "🏢";
      case ORDER_TYPE_UNASSIGNED:
        return "❓";
      default:
        console.log("getTypeIcon - defaulting for value:", typeNum);
        return "📋";
    }
  };

  // Effect for page size changes
  useEffect(() => {
    if (pageSize) {
      console.log("Page size changed to:", pageSize, "- fetching data");
      fetchList("");
    }
  }, [pageSize]);

  // Effect for sort changes
  useEffect(() => {
    console.log("Sort changed to:", sortByValue, "- fetching data");
    // Reset pagination when sort changes
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
    fetchList("");
  }, [sortByValue]);

  // Effect for filter changes
  useEffect(() => {
    console.log("Filters changed - status:", status, "type:", type);
    handleFilterChange();
  }, [status, type]);

  // Initial load - only on mount
  useEffect(() => {
    console.log("Initial mount - loading first page");
    fetchList("");
  }, []); // Empty dependency array for initial load only

  // Calculate pagination info
  const hasPreviousPage = cursorHistory.length > 0;
  const currentPageNumber = cursorHistory.length + 1;

  // Render
  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { label: "Financials", icon: "💳" },
        ]}
      />

      {/* Page Title */}
      <h1>💳 Financials</h1>
      <hr />

      {/* Alert Messages */}
      {topAlertMessage && (
        <Alert
          type={topAlertStatus === "success" ? "success" : "error"}
          onClose={() => setTopAlertMessage("")}
        >
          {topAlertMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <Alert type="error">
          <h4>Errors:</h4>
          <ul>
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Page Actions */}
      <Card title="Quick Actions" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/admin/orders/add/step-1-search")}>
            ➕ Add Order
          </Button>
          <Button
            variant="success"
            onClick={() => navigate("/admin/orders/search")}
          >
            🔍 Search Orders
          </Button>
        </div>
      </Card>

      {/* Filter Panel */}
      <Card
        title="🔍 Filtering & Sorting"
        actions={
          <Button variant="outline" onClick={onClearFilterClick}>
            ❌ Clear Filter
          </Button>
        }
        style={{ marginBottom: "20px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
          }}
        >
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(parseInt(e.target.value))}
            options={ORDER_STATUS_FILTER_OPTIONS}
          />
          <Select
            label="Type"
            name="type"
            value={type}
            onChange={(e) => setType(parseInt(e.target.value))}
            options={ORDER_TYPE_FILTER_OPTIONS}
          />
          <Select
            label="Sort by"
            name="sortByValue"
            value={sortByValue}
            onChange={(e) => setSortByValue(e.target.value)}
            options={ORDER_SORT_OPTIONS}
          />
        </div>
      </Card>

      {/* Table Contents */}
      <Card title="📋 List" style={{ marginBottom: "20px" }}>
        {isFetching ? (
          <Loading message="Loading orders..." />
        ) : (
          <>
            {orders &&
            orders.results &&
            (orders.results.length > 0 || cursorHistory.length > 0) ? (
              <>
                {/* Results info */}
                <div style={{ marginBottom: "10px" }}>
                  Showing <strong>{orders.results.length}</strong> orders
                  {totalCount > 0 && ` (Total: ${totalCount})`}
                </div>

                {/* Simple Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Job #
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Client
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Associate
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Assigned Date
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Start Date
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.results.map((order) => (
                        <tr key={order.wjid || order.id}>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              textAlign: "center",
                            }}
                          >
                            <span
                              title={formatType(order.type)}
                              style={{ fontSize: "1.2em" }}
                            >
                              {getTypeIcon(order.type)}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {order.wjid || order.id}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {order.customerName ? (
                              <Link to={`/admin/customer/${order.customerId}`}>
                                {order.customerName}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {order.associateName ? (
                              <Link
                                to={`/admin/associate/${order.associateId}`}
                              >
                                {order.associateName}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {formatDate(order.assignmentDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {formatDate(order.startDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {formatStatus(order.status)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <div style={{ display: "flex", gap: "5px" }}>
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/financial/${order.wjid || order.id}`,
                                  )
                                }
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={(e) =>
                                  onSelectOrderForDeletion(e, order)
                                }
                              >
                                Archive
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
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
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      style={{ padding: "5px" }}
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
              <div style={{ textAlign: "center", padding: "40px" }}>
                <h2>📋 No Orders</h2>
                <p>
                  No orders found.{" "}
                  <Link to="/admin/orders/add/step-1-search">
                    Click here to add your first order →
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedOrderForDeletion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3>Are you sure?</h3>
            <p>
              You are about to <strong>archive</strong> order{" "}
              {selectedOrderForDeletion.wjid ||
                `#${selectedOrderForDeletion.id}`}
              . It will no longer appear on your dashboard. This action can be
              undone but you'll need to contact the system administrator. Are
              you sure you would like to continue?
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Button variant="secondary" onClick={onDeselectOrderForDeletion}>
                Cancel
              </Button>
              <Button variant="success" onClick={onDeleteConfirmButtonClick}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: "20px" }}>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default AdminFinancialListPage;

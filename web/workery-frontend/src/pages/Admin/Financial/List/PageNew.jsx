// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useFinancialManager } from "../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  Select,
} from "../../../../components/UI";
import {
  FINANCIAL_STATUS_PENDING,
  FINANCIAL_STATUS_PAID,
  FINANCIAL_STATUS_CANCELLED,
  FINANCIAL_STATUS_LABELS,
  FINANCIAL_TYPE_INVOICE,
  FINANCIAL_TYPE_PAYMENT,
  FINANCIAL_TYPE_REFUND,
  FINANCIAL_TYPE_ADJUSTMENT,
  FINANCIAL_TYPE_CREDIT,
  FINANCIAL_TYPE_DEBIT,
  FINANCIAL_TYPE_LABELS,
  FINANCIAL_TYPE_ICONS,
  FINANCIAL_STATUS_COLORS,
  DEFAULT_FINANCIAL_LIST_SORT_BY_VALUE,
} from "../../../../constants/Financial";
import {
  PAGE_SIZE_OPTIONS,
  FINANCIAL_SORT_OPTIONS,
  FINANCIAL_STATUS_FILTER_OPTIONS,
  FINANCIAL_TYPE_FILTER_OPTIONS,
} from "../../../../constants/FieldOptions";

function AdminFinancialListPage() {
  const navigate = useNavigate();
  const financialManager = useFinancialManager();

  // State
  const [financials, setFinancials] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [selectedFinancialForDeletion, setSelectedFinancialForDeletion] =
    useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Filtering and Pagination state
  const [status, setStatus] = useState(0);
  const [type, setType] = useState(0);
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_FINANCIAL_LIST_SORT_BY_VALUE,
  );
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");

  // Cursor-based pagination state
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([]);

  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch list function
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
        // Build params object for FinancialManager
        const params = {
          page: cursor ? undefined : 1, // Use page 1 if no cursor
          limit: pageSize,
          search: searchTerm || undefined,
        };

        // Add cursor if provided
        if (cursor) {
          params.cursor = cursor;
        }

        // Sort field and order
        if (sortByValue) {
          const [sortField, sortOrder] = sortByValue.split(",");
          params.sortBy = sortField;
          params.sortOrder = sortOrder;
        }

        // Add filters only if not 0 (All)
        if (status !== 0) {
          params.status = status.toString();
        }
        if (type !== 0) {
          params.type = type.toString();
        }

        // Add date range filters if provided
        if (startDate) {
          params.startDate = startDate;
        }
        if (endDate) {
          params.endDate = endDate;
        }

        console.log("Making API call with params:", params);

        // Use the FinancialManager to fetch financials
        const response = await financialManager.getFinancials(
          params,
          onUnauthorized,
          true, // force refresh
        );

        console.log("API response received:", {
          resultsCount: response.results?.length,
          nextCursor: response.nextCursor,
          hasNextPage: response.hasNextPage,
          totalCount: response.count,
        });

        setFinancials(response);
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
        console.error("Failed to fetch financials:", err);
        setErrors({ general: "Failed to load financials. Please try again." });
        window.scrollTo(0, 0);
      } finally {
        setIsFetching(false);
      }
    },
    [
      pageSize,
      sortByValue,
      status,
      type,
      searchTerm,
      startDate,
      endDate,
      financialManager,
    ],
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

  // Pagination handlers
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
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSortByValue(DEFAULT_FINANCIAL_LIST_SORT_BY_VALUE);

    // Reset pagination
    setCursorHistory([]);
    setCurrentCursor("");
    setNextCursor("");
    setHasNextPage(false);
  };

  const onSelectFinancialForDeletion = (e, financial) => {
    e.preventDefault();
    console.log("onSelectFinancialForDeletion", financial);
    setSelectedFinancialForDeletion(financial);
    setShowDeleteConfirmation(true);
  };

  const onDeselectFinancialForDeletion = (e) => {
    if (e) e.preventDefault();
    console.log("onDeselectFinancialForDeletion");
    setSelectedFinancialForDeletion(null);
    setShowDeleteConfirmation(false);
  };

  const onDeleteConfirmButtonClick = async (e) => {
    e.preventDefault();
    console.log("onDeleteConfirmButtonClick");

    if (selectedFinancialForDeletion) {
      try {
        setIsFetching(true);
        await financialManager.deleteFinancial(
          selectedFinancialForDeletion.id,
          onUnauthorized,
        );

        // Update notification
        setTopAlertStatus("success");
        setTopAlertMessage("Financial record deleted successfully");
        setTimeout(() => {
          setTopAlertMessage("");
        }, 2000);

        // Refresh current page
        fetchList(currentCursor);
      } catch (err) {
        console.error("Failed to delete financial record:", err);
        setTopAlertStatus("danger");
        setTopAlertMessage("Failed to delete financial record");
        setTimeout(() => {
          setTopAlertMessage("");
        }, 2000);
      } finally {
        setIsFetching(false);
        setSelectedFinancialForDeletion(null);
        setShowDeleteConfirmation(false);
      }
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // The date is already formatted by the API layer, just return it
    return dateString;
  };

  // Format status helper using constants
  const formatStatus = (statusValue) => {
    return FINANCIAL_STATUS_LABELS[statusValue] || `Unknown (${statusValue})`;
  };

  // Get status color
  const getStatusColor = (statusValue) => {
    return FINANCIAL_STATUS_COLORS[statusValue] || "secondary";
  };

  // Format type helper using constants
  const formatType = (typeValue) => {
    return FINANCIAL_TYPE_LABELS[typeValue] || `Unknown (${typeValue})`;
  };

  // Get type icon using constants
  const getTypeIcon = (typeValue) => {
    return FINANCIAL_TYPE_ICONS[typeValue] || "📋";
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
  }, [status, type, startDate, endDate]);

  // Effect for search term changes (with debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        console.log("Search term changed to:", searchTerm);
        handleFilterChange();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
          <Button onClick={() => navigate("/admin/financial/create")}>
            ➕ Add Financial Record
          </Button>
          <Button
            variant="info"
            onClick={() => navigate("/admin/financial/export")}
          >
            📊 Export Data
          </Button>
          <Button
            variant="success"
            onClick={() => navigate("/admin/financial/summary")}
          >
            📈 View Summary
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
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search by description, reference, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(parseInt(e.target.value))}
            options={FINANCIAL_STATUS_FILTER_OPTIONS}
          />
          <Select
            label="Type"
            name="type"
            value={type}
            onChange={(e) => setType(parseInt(e.target.value))}
            options={FINANCIAL_TYPE_FILTER_OPTIONS}
          />
          <Select
            label="Sort by"
            name="sortByValue"
            value={sortByValue}
            onChange={(e) => setSortByValue(e.target.value)}
            options={FINANCIAL_SORT_OPTIONS}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table Contents */}
      <Card title="📋 List" style={{ marginBottom: "20px" }}>
        {isFetching ? (
          <Loading message="Loading financial records..." />
        ) : (
          <>
            {financials &&
            financials.results &&
            (financials.results.length > 0 || cursorHistory.length > 0) ? (
              <>
                {/* Results info */}
                <div style={{ marginBottom: "10px" }}>
                  Showing <strong>{financials.results.length}</strong> records
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
                          Reference #
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Description
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            border: "1px solid #ddd",
                          }}
                        >
                          Amount
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Transaction Date
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            textAlign: "left",
                            border: "1px solid #ddd",
                          }}
                        >
                          Due Date
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
                          Related Order
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
                      {financials.results.map((financial) => (
                        <tr key={financial.id}>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              textAlign: "center",
                            }}
                          >
                            <span
                              title={formatType(financial.type)}
                              style={{ fontSize: "1.2em" }}
                            >
                              {getTypeIcon(financial.type)}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {financial.referenceNumber || financial.id}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {financial.description || "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(financial.amount)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {formatDate(financial.transactionDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {formatDate(financial.dueDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                                backgroundColor:
                                  getStatusColor(financial.status) === "success"
                                    ? "#d4edda"
                                    : getStatusColor(financial.status) ===
                                        "warning"
                                      ? "#fff3cd"
                                      : getStatusColor(financial.status) ===
                                          "danger"
                                        ? "#f8d7da"
                                        : "#e2e3e5",
                                color:
                                  getStatusColor(financial.status) === "success"
                                    ? "#155724"
                                    : getStatusColor(financial.status) ===
                                        "warning"
                                      ? "#856404"
                                      : getStatusColor(financial.status) ===
                                          "danger"
                                        ? "#721c24"
                                        : "#383d41",
                              }}
                            >
                              {formatStatus(financial.status)}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              border: "1px solid #ddd",
                            }}
                          >
                            {financial.orderId ? (
                              <Link to={`/admin/order/${financial.orderId}`}>
                                Order #
                                {financial.orderWjid || financial.orderId}
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
                            <div style={{ display: "flex", gap: "5px" }}>
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(`/admin/financial/${financial.id}`)
                                }
                              >
                                View
                              </Button>
                              {financial.status ===
                                FINANCIAL_STATUS_PENDING && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() =>
                                    navigate(
                                      `/admin/financial/${financial.id}/edit`,
                                    )
                                  }
                                >
                                  Edit
                                </Button>
                              )}
                              {financial.type === FINANCIAL_TYPE_INVOICE && (
                                <Button
                                  size="sm"
                                  variant="info"
                                  onClick={() =>
                                    navigate(
                                      `/admin/financial/${financial.id}/invoice`,
                                    )
                                  }
                                >
                                  Invoice
                                </Button>
                              )}
                              {financial.status !== FINANCIAL_STATUS_PAID && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={(e) =>
                                    onSelectFinancialForDeletion(e, financial)
                                  }
                                >
                                  Delete
                                </Button>
                              )}
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
                <h2>📋 No Financial Records</h2>
                <p>
                  No financial records found.{" "}
                  <Link to="/admin/financial/create">
                    Click here to add your first financial record →
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedFinancialForDeletion && (
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
              You are about to <strong>delete</strong> financial record{" "}
              {selectedFinancialForDeletion.referenceNumber ||
                `#${selectedFinancialForDeletion.id}`}
              . This action cannot be undone. Are you sure you would like to
              continue?
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Button
                variant="secondary"
                onClick={onDeselectFinancialForDeletion}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={onDeleteConfirmButtonClick}>
                Delete
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

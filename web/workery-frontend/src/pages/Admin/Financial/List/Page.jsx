// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useOrderManager } from "../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  Table,
  Select,
  Input,
} from "../../../../components/UI";
import { DateTime } from "luxon";

// Constants
const DEFAULT_ORDER_LIST_SORT_BY_VALUE = "start_date,DESC";
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Newest → Oldest" },
  { value: "created_at,ASC", label: "Oldest → Newest" },
  { value: "customer_lexical_name,ASC", label: "Customer (A → Z)" },
  { value: "customer_lexical_name,DESC", label: "Customer (Z → A)" },
  { value: "associate_lexical_name,ASC", label: "Associate (A → Z)" },
  { value: "associate_lexical_name,DESC", label: "Associate (Z → A)" },
  { value: "assignment_date,DESC", label: "Assigned Date (Newest → Oldest)" },
  { value: "assignment_date,ASC", label: "Assigned Date (Oldest → Newest)" },
  { value: "start_date,DESC", label: "Start Date (Newest → Oldest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest → Newest)" },
];

const ORDER_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "New" },
  { value: 2, label: "Declined" },
  { value: 3, label: "Pending" },
  { value: 4, label: "Cancelled" },
  { value: 5, label: "Ongoing" },
  { value: 6, label: "In Progress" },
  { value: 7, label: "Completed but Unpaid" },
  { value: 8, label: "Completed and Paid" },
  { value: 9, label: "Archived" },
];

const ORDER_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Residential" },
  { value: 2, label: "Commercial" },
  { value: 3, label: "Unassigned" },
];

function AdminFinancialListPage() {
  const navigate = useNavigate();
  const orderManager = useOrderManager();

  // State
  const [orders, setOrders] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [selectedOrderForDeletion, setSelectedOrderForDeletion] =
    useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  // Filtering and Pagination
  const [status, setStatus] = useState(0);
  const [type, setType] = useState(0);
  const [sortByValue, setSortByValue] = useState(
    DEFAULT_ORDER_LIST_SORT_BY_VALUE,
  );
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  // Fetch list function
  const fetchList = (cur, limit, keywords, so, s, t) => {
    setIsFetching(true);
    setErrors({});

    console.log(
      "fetchList | cur=" +
        cur +
        ", limit=" +
        limit +
        ", keywords=" +
        keywords +
        ", so=" +
        so +
        ", s=" +
        s +
        ", t=" +
        t,
    );

    // Build filters map
    let filtersMap = new Map();
    filtersMap.set("page_size", limit);

    if (cur !== "") {
      filtersMap.set("cursor", cur);
    }

    // Sort field and order
    const sortArray = so.split(",");
    filtersMap.set("sort_field", sortArray[0]);
    filtersMap.set("sort_order", sortArray[1]);

    // Filtering
    if (keywords !== undefined && keywords !== null && keywords !== "") {
      filtersMap.set("search", keywords);
    }
    if (s !== undefined && s !== null && s !== "" && s !== 0) {
      filtersMap.set("status", s);
    }
    if (t !== undefined && t !== null && t !== "" && t !== 0) {
      filtersMap.set("type", t);
    }

    // Use the OrderManager to fetch orders
    orderManager.getOrdersWithFiltersMapWithCallbacks(
      filtersMap,
      onOrderListSuccess,
      onOrderListError,
      onOrderListDone,
      onUnauthorized,
      false, // Don't force refresh, use cache if available
    );
  };

  const onOrderListSuccess = (response) => {
    console.log("onOrderListSuccess: Starting...");
    if (response.results !== null) {
      setOrders(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    }
  };

  const onOrderListError = (apiErr) => {
    console.log("onOrderListError: Starting...");
    setErrors(apiErr);
    window.scrollTo(0, 0);
  };

  const onOrderListDone = () => {
    console.log("onOrderListDone: Starting...");
    setIsFetching(false);
  };

  const onOrderDeleteSuccess = (response) => {
    console.log("onOrderDeleteSuccess: Starting...");

    // Update notification
    setTopAlertStatus("success");
    setTopAlertMessage("Order deleted");
    setTimeout(() => {
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list
    fetchList(currentCursor, pageSize, "", sortByValue, status, type);
  };

  const onOrderDeleteError = (apiErr) => {
    console.log("onOrderDeleteError: Starting...");
    setErrors(apiErr);

    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      setTopAlertMessage("");
    }, 2000);

    window.scrollTo(0, 0);
  };

  const onOrderDeleteDone = () => {
    console.log("onOrderDeleteDone: Starting...");
    setIsFetching(false);
  };

  // Event handlers
  const onClearFilterClick = (e) => {
    e.preventDefault();
    setType(0);
    setStatus(0);
    setSortByValue(DEFAULT_ORDER_LIST_SORT_BY_VALUE);
  };

  const onNextClicked = (e) => {
    e.preventDefault();
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    e.preventDefault();
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
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

  const onDeleteConfirmButtonClick = (e) => {
    e.preventDefault();
    console.log("onDeleteConfirmButtonClick");

    if (selectedOrderForDeletion) {
      orderManager.deleteOrderWithCallbacks(
        selectedOrderForDeletion.id,
        onOrderDeleteSuccess,
        onOrderDeleteError,
        onOrderDeleteDone,
        onUnauthorized,
      );
      setSelectedOrderForDeletion(null);
      setShowDeleteConfirmation(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
    } catch {
      return dateString;
    }
  };

  // Format status helper
  const formatStatus = (status) => {
    const statusOption = ORDER_STATUS_FILTER_OPTIONS.find(
      (opt) => opt.value === status,
    );
    return statusOption ? statusOption.label : `Status ${status}`;
  };

  // Format type helper
  const formatType = (type) => {
    const typeOption = ORDER_TYPE_FILTER_OPTIONS.find(
      (opt) => opt.value === type,
    );
    return typeOption ? typeOption.label : `Type ${type}`;
  };

  // Effect
  useEffect(() => {
    fetchList(currentCursor, pageSize, "", sortByValue, status, type);
    window.scrollTo(0, 0);
  }, [currentCursor, pageSize, sortByValue, status, type]);

  // Redirect if needed
  if (forceURL !== "") {
    navigate(forceURL);
    return null;
  }

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
            (orders.results.length > 0 || previousCursors.length > 0) ? (
              <>
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
                            }}
                          >
                            {formatType(order.type)}
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
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Results Count */}
                <p style={{ textAlign: "right", marginTop: "10px" }}>
                  <strong>Total Results: {orders.count}</strong>
                </p>

                {/* Pagination Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  <div>
                    <label>
                      Results per page:&nbsp;
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                        style={{ padding: "5px" }}
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {previousCursors.length > 0 && (
                      <Button onClick={onPreviousClicked}>Previous</Button>
                    )}
                    {orders.hasNextPage && (
                      <Button onClick={onNextClicked}>Next</Button>
                    )}
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
              You are about to <strong>archive</strong> this order; it will no
              longer appear on your dashboard. This action can be undone but
              you'll need to contact the system administrator. Are you sure you
              would like to continue?
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

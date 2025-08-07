// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Order/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Table,
} from "../../../../../../components/UI";

function AdminCustomerDetailOrderListPage() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const orderManager = useOrderManager();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState({});
  const [orderList, setOrderList] = useState([]);

  const [pageSize, setPageSize] = useState(50); // Pagination
  const [previousCursors, setPreviousCursors] = useState([]); // Pagination
  const [nextCursor, setNextCursor] = useState(""); // Pagination
  const [currentCursor, setCurrentCursor] = useState(""); // Pagination
  const [sortByValue, setSortByValue] = useState("created_at,DESC"); // Sorting
  const [status, setStatus] = useState(0); // Filtering
  const [createdAtGTE, setCreatedAtGTE] = useState(null); // Filtering

  ////
  //// Event handling.
  ////

  const fetchOrderList = async (cur, limit, so, s, dateFilter, custId) => {
    setFetching(true);
    setErrors({});

    try {
      // Prepare filters map for backward compatibility
      const filtersMap = new Map();
      filtersMap.set("pageSize", limit);
      filtersMap.set("sortField", "last_name");

      if (cur !== "") {
        filtersMap.set("cursor", cur);
      }

      // Handle sort by value
      const sortArray = so.split(",");
      filtersMap.set("sortField", sortArray[0]);
      filtersMap.set("sortOrder", sortArray[1]);

      // Add filtering
      if (s !== undefined && s !== null && s !== "") {
        filtersMap.set("status", s);
      }
      if (
        dateFilter !== undefined &&
        dateFilter !== null &&
        dateFilter !== ""
      ) {
        const dateStr = dateFilter.getTime();
        filtersMap.set("createdAtGte", dateStr);
      }

      // Customer id
      filtersMap.set("customerId", custId);

      const response = await orderManager.getOrdersWithFiltersMap(
        filtersMap,
        onUnauthorized,
      );

      setOrderList(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch order list:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const fetchCustomerDetail = async (customerId) => {
    setFetching(true);
    setErrors({});

    try {
      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const onNextClicked = () => {
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Lifecycle.
  ////

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (cid) {
      // Fetch customer details
      fetchCustomerDetail(cid);

      // Fetch order list
      fetchOrderList(
        currentCursor,
        pageSize,
        sortByValue,
        status,
        createdAtGTE,
        cid,
      );
    }
  }, [currentCursor, pageSize, sortByValue, status, createdAtGTE, cid]);

  ////
  //// Render helpers.
  ////

  const renderOrderStatusBadge = (status) => {
    const statusStyles = {
      1: { backgroundColor: "#ffc107", color: "#212529" }, // New
      2: { backgroundColor: "#17a2b8", color: "white" }, // Assigned
      3: { backgroundColor: "#007bff", color: "white" }, // In Progress
      4: { backgroundColor: "#28a745", color: "white" }, // Completed
      5: { backgroundColor: "#6c757d", color: "white" }, // Closed
      6: { backgroundColor: "#dc3545", color: "white" }, // Cancelled
    };

    const statusLabels = {
      1: "New",
      2: "Assigned",
      3: "In Progress",
      4: "Completed",
      5: "Closed",
      6: "Cancelled",
    };

    const style = statusStyles[status] || {
      backgroundColor: "#6c757d",
      color: "white",
    };
    const label = statusLabels[status] || "Unknown";

    return (
      <span
        style={{
          ...style,
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {label}
      </span>
    );
  };

  const renderOrderTypeIcon = (type) => {
    const typeLabels = {
      1: "🏠 Residential",
      2: "🏢 Commercial",
      3: "🏗️ Industrial",
    };
    return typeLabels[type] || "❓ Unknown";
  };

  ////
  //// Table configuration.
  ////

  const orderColumns = [
    {
      key: "type",
      label: "Type",
      render: (value) => renderOrderTypeIcon(value),
    },
    {
      key: "wjid",
      label: "Job #",
      render: (value, row) => (
        <Link
          to={`/admin/order/${value}`}
          style={{ color: theme.colors.primary, textDecoration: "none" }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "associateName",
      label: "Associate",
      render: (value, row) => {
        if (
          row.associateId &&
          row.associateId !== "" &&
          row.associateId !== "000000000000000000000000"
        ) {
          return (
            <Link
              to={`/admin/associate/${row.associateId}`}
              style={{ color: theme.colors.primary, textDecoration: "none" }}
            >
              {value}
            </Link>
          );
        }
        return "-";
      },
    },
    {
      key: "assignmentDate",
      label: "Assigned",
      render: (value, row) => {
        if (
          row.associateId &&
          row.associateId !== "" &&
          row.associateId !== "000000000000000000000000"
        ) {
          return value || "-";
        }
        return "-";
      },
    },
    {
      key: "startDate",
      label: "Start",
    },
    {
      key: "completionDate",
      label: "Completion",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => renderOrderStatusBadge(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            to={`/admin/financial/${row.wjid}`}
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            Financial
          </Link>
          <Link
            to={`/admin/order/${row.wjid}`}
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  ////
  //// Component rendering.
  ////

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: "👤",
    },
    {
      label: "Detail",
      icon: "ℹ️",
    },
  ];

  if (!authManager.isAuthenticated()) {
    return <Loading message="Checking authentication..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner */}
      {customer && customer.status === 2 && (
        <Alert type="info">This customer is archived.</Alert>
      )}
      {customer && customer.isBanned && (
        <Alert type="error">This customer is banned.</Alert>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          👤 Customer
        </h1>
        <h2 style={{ fontSize: "18px", color: "#666", margin: 0 }}>
          ℹ️ Detail
        </h2>
      </div>

      <Card
        title="🔧 Orders"
        actions={
          customer && (
            <Link
              to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="success">➕ New Order</Button>
            </Link>
          )
        }
      >
        {isFetching ? (
          <Loading message="Loading orders..." />
        ) : (
          <>
            {/* Show errors if any */}
            {Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </div>
                ))}
              </Alert>
            )}

            {customer && (
              <>
                {/* Tab Navigation */}
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to={`/admin/customer/${cid}`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Summary
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/detail`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Detail
                  </Link>
                  <span
                    style={{
                      color: "#333",
                      fontWeight: "bold",
                      padding: "10px 0",
                      borderBottom: `2px solid ${theme.colors.primary}`,
                    }}
                  >
                    Orders
                  </span>
                  <Link
                    to={`/admin/customer/${cid}/comments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/attachments`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/more`}
                    style={{
                      textDecoration: "none",
                      color: theme.colors.primary,
                      padding: "10px 0",
                      borderBottom: "2px solid transparent",
                    }}
                  >
                    More...
                  </Link>
                </div>

                {orderList &&
                orderList.results &&
                (orderList.results.length > 0 || previousCursors.length > 0) ? (
                  <>
                    {/* Orders Table */}
                    <Table
                      columns={orderColumns}
                      data={orderList.results || []}
                      onRowClick={(order) =>
                        navigate(`/admin/order/${order.wjid}`)
                      }
                    />

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
                      <div>
                        <label style={{ marginRight: "10px" }}>
                          Page Size:
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            setPageSize(parseInt(e.target.value))
                          }
                          style={globalStyles.input}
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={250}>250</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {previousCursors.length > 0 && (
                          <Button
                            onClick={onPreviousClicked}
                            variant="secondary"
                          >
                            Previous
                          </Button>
                        )}
                        {orderList.hasNextPage && (
                          <Button onClick={onNextClicked} variant="secondary">
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      📋
                    </div>
                    <h3 style={{ marginBottom: "8px" }}>No Orders</h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                      No orders found for this customer.{" "}
                      <Link
                        to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: theme.colors.primary }}
                      >
                        Click here
                      </Link>{" "}
                      to create the first work order.
                    </p>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <Link to="/admin/customers">
                    <Button variant="secondary">← Back to Customers</Button>
                  </Link>
                  <Link
                    to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="success">➕ New Order</Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailOrderListPage;

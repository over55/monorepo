// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/Order/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateManager,
  useOrderManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";
import { DateTime } from "luxon";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;

// Order status mappings
const ORDER_STATUS_OPTIONS = {
  1: { label: "New", color: theme.colors.info },
  2: { label: "Assigned", color: theme.colors.primary },
  3: { label: "In Progress", color: theme.colors.warning },
  4: { label: "Completed", color: theme.colors.success },
  5: { label: "Closed", color: theme.colors.secondary },
  6: { label: "Cancelled", color: theme.colors.danger },
};

// Order type mappings
const ORDER_TYPE_OPTIONS = {
  1: { label: "Unassigned", icon: "❓" },
  2: { label: "Residential", icon: "🏠" },
  3: { label: "Commercial", icon: "🏢" },
};

function AdminAssociateDetailOrderListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("assignment_date,DESC");
  const [status, setStatus] = useState(0);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate details
  const fetchAssociateDetail = async () => {
    try {
      const data = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate detail:", error);
      setErrors(error);
    }
  };

  // Fetch order list
  const fetchOrderList = async () => {
    try {
      setFetching(true);
      setErrors({});

      // Build filters map (matching old implementation)
      const filtersMap = new Map();
      filtersMap.set("page_size", pageSize);
      filtersMap.set("associate_id", aid);

      if (currentCursor !== "") {
        filtersMap.set("cursor", currentCursor);
      }

      // Handle sorting
      const sortArray = sortByValue.split(",");
      filtersMap.set("sort_field", sortArray[0]);
      filtersMap.set("sort_order", sortArray[1]);

      if (status !== 0) {
        filtersMap.set("status", status);
      }

      // Use the legacy method for compatibility
      const data = await orderManager.getOrdersWithFiltersMap(
        filtersMap,
        onUnauthorized,
      );

      if (data.results !== null) {
        setOrderList(data);
        if (data.hasNextPage) {
          setNextCursor(data.nextCursor);
        }
      }
    } catch (error) {
      console.error("Failed to fetch order list:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  // Pagination handlers
  const onNextClicked = () => {
    console.log("Next Clicked");
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
    } catch {
      return dateString;
    }
  };

  // Format status helper with color
  const formatStatus = (statusValue) => {
    const status = ORDER_STATUS_OPTIONS[statusValue];
    if (!status) return <span>Unknown</span>;

    return (
      <span
        style={{
          color: status.color,
          fontWeight: "600",
        }}
      >
        {status.label}
      </span>
    );
  };

  // Format type helper with icon
  const formatType = (typeValue) => {
    const type = ORDER_TYPE_OPTIONS[typeValue];
    if (!type) return <span>Unknown</span>;

    return (
      <span>
        {type.icon} {type.label}
      </span>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociateDetail();
  }, [aid]);

  useEffect(() => {
    if (aid) {
      fetchOrderList();
    }
  }, [currentCursor, pageSize, sortByValue, status, aid]);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", icon: "ℹ️" },
  ];

  if (isFetching && !associate.id) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading associate orders..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>👷 Associate</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <Alert type="info">📁 This associate is archived</Alert>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            <strong>Error:</strong>
            <ul
              style={{
                marginTop: "10px",
                paddingLeft: "20px",
                marginBottom: 0,
              }}
            >
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </Alert>
        )}

      {/* Main Content */}
      <Card>
        {/* Header with Title */}
        {associate && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>🔧 Orders</h3>
          </div>
        )}

        {associate && (
          <>
            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                marginBottom: "30px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={`/admin/associate/${aid}`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Summary
              </Link>
              <Link
                to={`/admin/associate/${aid}/detail`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Detail
              </Link>
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Orders
              </div>
              <Link
                to={`/admin/associate/${aid}/comments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/associate/${aid}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/associate/${aid}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {isFetching ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loading message="Loading orders..." />
              </div>
            ) : orderList &&
              orderList.results &&
              (orderList.results.length > 0 || previousCursors.length > 0) ? (
              <>
                {/* Orders Table - Desktop */}
                <div
                  style={{
                    overflowX: "auto",
                    display: window.innerWidth <= 768 ? "none" : "block",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Job #
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Customer
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Assigned ↓
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Start
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Completion
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Financial
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderList.results.map((order, index) => (
                        <tr
                          key={order.wjid || index}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "white" : "#f8f9fa",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatType(order.type)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                              fontFamily: "monospace",
                            }}
                          >
                            {order.wjid}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <Link
                              to={`/admin/customer/${order.customerId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: theme.colors.primary,
                                textDecoration: "none",
                              }}
                            >
                              {order.customerName} 🔗
                            </Link>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatDate(order.assignmentDate)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatDate(order.startDate)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatDate(order.completionDate)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatStatus(order.status)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <Link
                              to={`/admin/financial/${order.wjid}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: theme.colors.primary,
                                textDecoration: "none",
                              }}
                            >
                              View 🔗
                            </Link>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <Link
                              to={`/admin/order/${order.wjid}`}
                              style={{
                                color: theme.colors.primary,
                                textDecoration: "none",
                              }}
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Orders List - Mobile */}
                <div
                  style={{
                    display: window.innerWidth > 768 ? "none" : "block",
                  }}
                >
                  {orderList.results.map((order, index) => (
                    <Card
                      key={order.wjid || index}
                      style={{
                        marginBottom: "15px",
                        backgroundColor: theme.colors.light,
                      }}
                    >
                      <div style={{ marginBottom: "10px" }}>
                        <strong>{formatType(order.type)}</strong>
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Job #:</strong>{" "}
                        <span style={{ fontFamily: "monospace" }}>
                          {order.wjid}
                        </span>
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Customer:</strong>{" "}
                        <Link
                          to={`/admin/customer/${order.customerId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: theme.colors.primary,
                            textDecoration: "none",
                          }}
                        >
                          {order.customerName} 🔗
                        </Link>
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Assigned:</strong>{" "}
                        {formatDate(order.assignmentDate)}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Start:</strong> {formatDate(order.startDate)}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Completion:</strong>{" "}
                        {formatDate(order.completionDate)}
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        <strong>Status:</strong> {formatStatus(order.status)}
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <strong>Financial:</strong>{" "}
                        <Link
                          to={`/admin/financial/${order.wjid}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: theme.colors.primary,
                            textDecoration: "none",
                          }}
                        >
                          View 🔗
                        </Link>
                      </div>
                      <Link to={`/admin/order/${order.wjid}`}>
                        <Button variant="primary" fullWidth>
                          View Order →
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <label
                      style={{
                        marginRight: "10px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Items per page:
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(parseInt(e.target.value))}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        fontSize: "14px",
                      }}
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {previousCursors.length > 0 && (
                      <Button onClick={onPreviousClicked} variant="secondary">
                        ← Previous
                      </Button>
                    )}
                    {orderList.hasNextPage && (
                      <Button onClick={onNextClicked} variant="primary">
                        Next →
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
                  backgroundColor: theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
                <h3>No Orders</h3>
                <p
                  style={{
                    color: theme.colors.secondary,
                    marginBottom: "0",
                  }}
                >
                  This associate does not have any orders yet.
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
              <Link to="/admin/associates">
                <Button variant="outline">← Back to Associates</Button>
              </Link>
            </div>
          </>
        )}

        {!associate && !isFetching && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Associate Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <Button variant="primary">← Back to Associates</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailOrderListPage;

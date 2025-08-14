// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/ActivitySheet/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useActivitySheetManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Select,
} from "../../../../../../components/UI";

// Constants
const OrderStatusNew = 1;
const OrderStatusDeclined = 2;
const OrderStatusPending = 3;
const OrderStatusCancelled = 4;
const OrderStatusOngoing = 5;
const OrderStatusInProgress = 6;
const OrderStatusCompletedButUnpaid = 7;
const OrderStatusCompletedAndPaid = 8;
const OrderStatusArchived = 9;

const ORDER_STATUS_MAP = {
  [OrderStatusNew]: "New",
  [OrderStatusDeclined]: "Declined",
  [OrderStatusPending]: "Pending",
  [OrderStatusCancelled]: "Cancelled",
  [OrderStatusOngoing]: "Ongoing",
  [OrderStatusInProgress]: "In Progress",
  [OrderStatusCompletedButUnpaid]: "Completed but Unpaid",
  [OrderStatusCompletedAndPaid]: "Completed and Paid",
  [OrderStatusArchived]: "Archived",
};

const ACTIVITY_SHEET_STATUS_MAP = {
  1: "Archived",
  2: "Error",
  3: "Accepted",
  4: "Declined",
  5: "Pending",
};

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

function AdminOrderDetailActivitySheetListPage() {
  // URL Parameters
  const { oid } = useParams();

  // Services
  const activitySheetManager = useActivitySheetManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [activitySheets, setActivitySheets] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch activity sheets list
  const fetchList = async (
    cursor,
    limit,
    keywords,
    sortFieldParam,
    sortOrderParam,
    orderWJID,
  ) => {
    setFetching(true);
    setErrors({});

    try {
      console.log(
        "fetchList | cursor=" +
          cursor +
          ", limit=" +
          limit +
          ", keywords=" +
          keywords +
          ", sortField=" +
          sortFieldParam +
          ", sortOrder=" +
          sortOrderParam +
          ", orderWJID=" +
          orderWJID,
      );

      // Build parameters object for the API
      const params = {};

      // Add pagination params
      params.page_size = limit;

      // Add cursor if present
      if (cursor && cursor !== "") {
        params.cursor = cursor;
      }

      // Add sorting parameters
      if (sortFieldParam && sortFieldParam !== "") {
        params.sort_field = sortFieldParam;
      }

      // Convert sortOrder to the format expected by backend
      if (sortOrderParam === "DESC") {
        params.sort_order = "-1";
      } else if (sortOrderParam === "ASC") {
        params.sort_order = "1";
      }

      // Add search if provided
      if (keywords && keywords !== "") {
        params.search = keywords;
      }

      // IMPORTANT: Add order_wjid filter
      // The oid from URL params is the order's WJID (Workery Job ID)
      if (orderWJID) {
        params.order_wjid = String(orderWJID); // Ensure it's a string for the URL param
      }

      // Build Map for legacy API compatibility
      const filtersMap = new Map();
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          filtersMap.set(key, params[key]);
        }
      });

      console.log("Sending filters to API:", Array.from(filtersMap.entries()));

      // Fetch data using the manager with filters map
      const response = await activitySheetManager.getActivitySheets(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      console.log("Activity sheets response:", response);

      // Update state with response
      if (response) {
        setActivitySheets(response);

        // Handle pagination
        if (response.hasNextPage) {
          setNextCursor(response.nextCursor);
        } else {
          setNextCursor("");
        }
      }
    } catch (error) {
      console.error("Failed to fetch activity sheets:", error);
      setErrors(error);

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Pagination handlers
  const onNextClicked = () => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor || "");
  };

  // Initial load and refresh when dependencies change
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Pass oid (which is the order's WJID) to fetchList
      fetchList(currentCursor, pageSize, "", sortField, sortOrder, oid);

      // Scroll to top on first load
      if (onPageLoaded === false) {
        window.scrollTo(0, 0);
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, sortField, sortOrder, oid]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString;
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "Activity Sheets", icon: "📄" },
  ];

  // Render loading state
  if (isFetching && !activitySheets) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading activity sheets..." />
      </div>
    );
  }

  // Main render
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
          <h1 style={{ margin: 0 }}>🔧 Order</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
            {activitySheets && activitySheets.order && (
              <span style={{ fontWeight: "normal", marginLeft: "10px" }}>
                (Status:{" "}
                {ORDER_STATUS_MAP[activitySheets.order.status] || "Unknown"})
              </span>
            )}
          </h4>
        </div>
      </div>

      <hr />

      {/* Main Content Card */}
      <Card>
        {/* Title */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>📄 Activity Sheets for Order #{oid}</h3>
        </div>

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
            to={`/admin/order/${oid}`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            Summary
          </Link>
          <Link
            to={`/admin/order/${oid}/full`}
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
            Activity Sheets
          </div>
          <Link
            to={`/admin/order/${oid}/tasks`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            Tasks
          </Link>
          <Link
            to={`/admin/order/${oid}/comments`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            Comments
          </Link>
          <Link
            to={`/admin/order/${oid}/attachments`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            Attachments
          </Link>
          <Link
            to={`/admin/order/${oid}/more`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            More ⋯
          </Link>
        </div>

        {/* Error Display */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            {typeof errors === "string"
              ? errors
              : "Failed to load activity sheets"}
          </Alert>
        )}

        {/* Content */}
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {activitySheets &&
            activitySheets.results &&
            (activitySheets.results.length > 0 ||
              previousCursors.length > 0) ? (
              <div>
                {/* Desktop Table View */}
                <div style={{ display: "block" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                          Associate
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "2px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Created At
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
                      </tr>
                    </thead>
                    <tbody>
                      {activitySheets.results.map((datum, index) => (
                        <tr key={datum.id || index}>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {datum.associateName ? (
                              <Link
                                to={`/admin/associate/${datum.associateId}`}
                                style={{
                                  color: theme.colors.primary,
                                  textDecoration: "none",
                                }}
                              >
                                {datum.associateName} 🔗
                              </Link>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formatDate(datum.createdAt)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {ACTIVITY_SHEET_STATUS_MAP[datum.status] ||
                              "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

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
                      <Select
                        value={pageSize}
                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                        options={PAGE_SIZE_OPTIONS}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {previousCursors.length > 0 && (
                        <Button onClick={onPreviousClicked} variant="info">
                          Previous
                        </Button>
                      )}
                      {activitySheets.hasNextPage && (
                        <Button onClick={onNextClicked} variant="info">
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📄</div>
                <h3>No Activity Sheets</h3>
                <p style={{ color: theme.colors.secondary }}>
                  No activity sheets found for Order #{oid}.
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link to="/admin/orders">
            <Button variant="outline">← Back to Orders</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailActivitySheetListPage;

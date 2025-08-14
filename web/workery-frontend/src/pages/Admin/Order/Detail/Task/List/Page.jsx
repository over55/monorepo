// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Task/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { Loading, Alert } from "../../../../../../components/UI";
import { DateTime } from "luxon";

function AdminOrderDetailTaskListPage() {
  // URL Parameters
  const { oid } = useParams();

  // Services
  const taskManager = useTaskManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component state
  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [listData, setListData] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("created_at,DESC");

  // Constants from old code
  const TASK_ITEM_CLOSE_REASON_OTHER = 5;
  const TASK_ITEM_CLOSE_REASON_MAP = {
    1: "Completed",
    2: "Cancelled - Client",
    3: "Cancelled - Associate",
    4: "Cancelled - Office",
    5: "Other",
  };

  // Check authorization
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Success callback for task list
  function onTaskListSuccess(response) {
    console.log("onTaskListSuccess: Starting...", response);
    if (response.results !== null) {
      setListData(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    }
  }

  // Error callback for task list
  function onTaskListError(apiErr) {
    console.log("onTaskListError: Starting...", apiErr);
    setErrors(apiErr);
    window.scrollTo(0, 0);
  }

  // Done callback for task list
  function onTaskListDone() {
    console.log("onTaskListDone: Starting...");
    setFetching(false);
  }

  // Fetch task list
  const fetchList = async (cur, limit, keywords, so, orderId) => {
    setFetching(true);
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
        ", oid=" +
        orderId,
    );

    // Parse sort parameters
    const sortArray = so.split(",");

    // Build parameters object matching TaskAPI's expected format
    const paramsObj = {
      limit: limit, // TaskAPI expects 'limit' not 'page_size'
      sortBy: sortArray[0], // TaskAPI expects 'sortBy' not 'sort_field'
      sortOrder: sortArray[1], // TaskAPI expects 'sortOrder' not 'sort_order'
      order_wjid: orderId, // This will be passed through as additional filter
    };

    if (cur !== "") {
      paramsObj.cursor = cur;
    }

    if (keywords !== undefined && keywords !== null && keywords !== "") {
      paramsObj.search = keywords;
    }

    console.log("Calling TaskManager with params:", paramsObj);

    try {
      // IMPORTANT: Force refresh to avoid cached data for different orders
      const response = await taskManager.getTasks(
        paramsObj,
        onUnauthorized,
        true, // forceRefresh = true to bypass cache
      );

      onTaskListSuccess(response);
    } catch (error) {
      onTaskListError(error);
    } finally {
      onTaskListDone();
    }
  };

  // Handle pagination
  const onNextClicked = (e) => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Format date/time helper - handles both ISO strings and already formatted dates
  const formatDateTime = (value) => {
    if (!value) return "-";

    try {
      // If it's already a formatted string from the API, return it
      if (typeof value === "string" && value.includes(",")) {
        return value;
      }

      // Otherwise try to parse and format it
      const dt = DateTime.fromISO(value);
      if (dt.isValid) {
        return dt.toLocaleString(DateTime.DATETIME_MED);
      }

      // If ISO parsing fails, try JavaScript date parsing
      const jsDate = new Date(value);
      if (!isNaN(jsDate)) {
        return DateTime.fromJSDate(jsDate).toLocaleString(
          DateTime.DATETIME_MED,
        );
      }

      return value; // Return as-is if all parsing fails
    } catch (error) {
      console.error("Date formatting error:", error, "Value:", value);
      return value || "-";
    }
  };

  // Format date helper - handles both ISO strings and already formatted dates
  const formatDate = (value) => {
    if (!value) return "-";

    try {
      // Check if it's the zero date (Go's time.Time{})
      const zeroDate = new Date(value);
      if (zeroDate.getFullYear() === 1 || zeroDate.getFullYear() < 1900) {
        return "-";
      }

      // If it's already a formatted string from the API, return it
      if (typeof value === "string" && value.includes(",")) {
        return value;
      }

      // Otherwise try to parse and format it
      const dt = DateTime.fromISO(value);
      if (dt.isValid) {
        return dt.toLocaleString(DateTime.DATE_MED);
      }

      // If ISO parsing fails, try JavaScript date parsing
      const jsDate = new Date(value);
      if (!isNaN(jsDate)) {
        return DateTime.fromJSDate(jsDate).toLocaleString(DateTime.DATE_MED);
      }

      return value; // Return as-is if all parsing fails
    } catch (error) {
      console.error("Date formatting error:", error, "Value:", value);
      return "-";
    }
  };

  // Format checkbox helper
  const formatCheckbox = (value) => {
    return value ? "✓ Yes" : "✗ No";
  };

  // Task URL formatter based on task type
  const getTaskUpdateURL = (taskId, taskType) => {
    // Map task types to their appropriate paths based on backend constants
    switch (taskType) {
      case 1: // TaskItemTypeAssignedAssociate
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case 2: // TaskItemTypeFollowUpDidAssociateAndCustomerAgreedToMeet
        return `/admin/task/${taskId}/follow-up`;
      case 3: // TaskItemTypeFollowUpCustomerSurvey (DEPRECATED)
        return `/admin/task/${taskId}/survey/step-1`;
      case 4: // TaskItemTypeFollowUpDidAssociateAcceptJob
        return `/admin/task/${taskId}/follow-up`;
      case 5: // TaskItemTypeUpdateOngoingJob
        return `/admin/task/${taskId}/order-completion/step-1`;
      case 6: // TaskItemTypeFollowUpDidAssociateCompleteJob
        return `/admin/task/${taskId}/order-completion/step-1`;
      case 7: // TaskItemTypeFollowUpDidCustomerReviewAssociateAfterJob
        return `/admin/task/${taskId}/survey/step-1`;
      default:
        return `/admin/task/${taskId}`;
    }
  };

  // Effect for initial load and pagination
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Clear any existing task cache to ensure fresh data
      taskManager.clearTasksCache();

      fetchList(currentCursor, pageSize, "", sortByValue, oid);

      // If you loaded the page for the very first time
      if (onPageLoaded === false) {
        window.scrollTo(0, 0);
        setOnPageLoaded(true);
      }
    }

    return () => {
      mounted = false;
    };
  }, [currentCursor, pageSize, sortByValue, oid]);

  // Render component
  return (
    <div style={{ padding: "20px" }}>
      {/* Breadcrumbs */}
      <nav style={{ marginBottom: "20px" }}>
        <div>
          <Link to="/admin/dashboard">Dashboard</Link> &gt;{" "}
          <Link to="/admin/orders">Orders</Link> &gt;{" "}
          <span>Order #{oid} (Tasks)</span>
        </div>
      </nav>

      {/* Page Title */}
      <h1>Order</h1>
      <h4>Detail</h4>
      <hr />

      {/* Main Content Box */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Tasks</h3>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to={`/admin/order/${oid}`}>Summary</Link>
            <Link to={`/admin/order/${oid}/full`}>Detail</Link>
            <Link to={`/admin/order/${oid}/activity-sheets`}>
              Activity Sheets
            </Link>
            <strong
              style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}
            >
              Tasks
            </strong>
            <Link to={`/admin/order/${oid}/comments`}>Comments</Link>
            <Link to={`/admin/order/${oid}/attachments`}>Attachments</Link>
            <Link to={`/admin/order/${oid}/more`}>More</Link>
          </div>
        </div>

        {/* Table Contents */}
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {/* Error Display */}
            {errors && Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))}
              </Alert>
            )}

            {/* Task List */}
            {listData &&
            listData.results &&
            (listData.results.length > 0 || previousCursors.length > 0) ? (
              <div>
                {listData.results.map(function (datum, i) {
                  // Check if due date exists and is valid
                  const hasDueDate =
                    datum.dueDate &&
                    new Date(datum.dueDate).getFullYear() > 1900;

                  return (
                    <table
                      key={`task-${datum.id || i}`}
                      style={{
                        width: "100%",
                        marginBottom: "20px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#000" }}>
                          <th
                            colSpan="2"
                            style={{ color: "#fff", padding: "10px" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                Task at {formatDateTime(datum.createdAt)}
                              </span>
                              <Link
                                target="_blank"
                                rel="noreferrer"
                                to={getTaskUpdateURL(datum.id, datum.type)}
                                style={{
                                  padding: "5px 10px",
                                  backgroundColor: "#fff",
                                  color: "#000",
                                  textDecoration: "none",
                                  borderRadius: "4px",
                                }}
                              >
                                View →
                              </Link>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            style={{
                              width: "30%",
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Staff
                          </th>
                          <td style={{ padding: "10px" }}>
                            {datum.modifiedByUserName || "-"}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Title
                          </th>
                          <td style={{ padding: "10px" }}>
                            {datum.title || "-"}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Description
                          </th>
                          <td style={{ padding: "10px" }}>
                            {datum.description || "-"}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Due date
                          </th>
                          <td style={{ padding: "10px" }}>
                            {formatDate(datum.dueDate)}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Is closed?
                          </th>
                          <td style={{ padding: "10px" }}>
                            {formatCheckbox(datum.isClosed)}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Was postponed?
                          </th>
                          <td style={{ padding: "10px" }}>
                            {formatCheckbox(datum.wasPostponed)}
                          </td>
                        </tr>
                        <tr>
                          <th
                            style={{
                              backgroundColor: "#f5f5f5",
                              padding: "10px",
                            }}
                          >
                            Closed reason
                          </th>
                          <td style={{ padding: "10px" }}>
                            {datum.closingReason ===
                            TASK_ITEM_CLOSE_REASON_OTHER
                              ? datum.closingReasonOther || "-"
                              : datum.closingReason
                                ? TASK_ITEM_CLOSE_REASON_MAP[
                                    datum.closingReason
                                  ]
                                : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })}

                {/* Pagination */}
                <div
                  style={{ marginTop: "20px", display: "flex", gap: "10px" }}
                >
                  {previousCursors.length > 0 && (
                    <button onClick={onPreviousClicked}>← Previous</button>
                  )}
                  {listData.hasNextPage && (
                    <button onClick={onNextClicked}>Next →</button>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#f8f8f8",
                }}
              >
                <h3>No Tasks</h3>
                <p>No tasks yet.</p>
              </div>
            )}
          </>
        )}

        {/* Bottom Navigation */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to="/admin/orders">← Back to Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailTaskListPage;

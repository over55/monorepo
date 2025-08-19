// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/List/Page.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  useTaskManager,
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Input,
  Select,
  Alert,
  Loading,
  Breadcrumb,
  Table,
  Modal,
  FormGroup,
} from "../../../../components/UI";
import { globalStyles } from "../../../../constants/Theme";
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
  TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
} from "../../../../constants/Task";
import {
  TASK_LIST_VIEW_TYPE,
  TASK_PAGINATION,
  TASK_SORT_OPTIONS,
  DEFAULT_TASK_SORT_BY,
  TASK_TYPE_FILTER_OPTIONS,
  TASK_IS_CLOSED_FILTER,
  TASK_STATUS,
} from "../../../../constants/Task";
import { CACHE_DURATIONS } from "../../../../constants/Storage";
import { AUTH_ROUTES } from "../../../../constants/Authentication";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

function AdminTaskItemListPage() {
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tasks, setTasks] = useState(null);
  const [taskCount, setTaskCount] = useState(0);

  // Filter and sort state
  const [type, setType] = useState(0);
  const [isClosed, setIsClosed] = useState(TASK_IS_CLOSED_FILTER.OPEN); // default to show only open tasks
  const [sortByValue, setSortByValue] = useState(DEFAULT_TASK_SORT_BY);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [listViewType, setListViewType] = useState(TASK_LIST_VIEW_TYPE.TABULAR);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Cursor-based pagination state
  const [pageSize, setPageSize] = useState(TASK_PAGINATION.DEFAULT_PAGE_SIZE);
  const [currentCursor, setCurrentCursor] = useState("");
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);

  // Track filter/sort changes to reset pagination
  const [filterKey, setFilterKey] = useState(0);

  // Modal state
  const [selectedTaskForDeletion, setSelectedTaskForDeletion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Background refresh interval
  const refreshIntervalRef = useRef(null);

  // Track if initial load is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Authorization callback
  const onUnauthorized = () => {
    authManager.logout();
    navigate(AUTH_ROUTES.UNAUTHORIZED);
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        navigate(AUTH_ROUTES.LOGIN);
      }
    };

    if (authManager.isAuthenticated()) {
      fetchCurrentUser();
    } else {
      navigate(AUTH_ROUTES.LOGIN);
    }
  }, []);

  // Fetch tasks list
  const fetchTasks = async (cursor = "") => {
    console.log("fetchTasks called with cursor:", cursor || "(empty)");
    setIsLoading(true);
    setErrors({});

    try {
      // Build params for cursor-based pagination
      const [sortField, sortOrder] = sortByValue.split(",");

      // IMPORTANT: Use exact parameter names the backend expects
      const params = {
        page_size: pageSize.toString(),
        sort_field: sortField,
        sort_order: sortOrder,
        cursor: cursor || undefined, // Don't send empty string
        is_closed: isClosed.toString(),
      };

      // Add optional filters
      if (searchKeyword && searchKeyword.trim()) {
        params.search = searchKeyword.trim();
      }
      if (type !== 0) {
        params.type = type.toString();
      }

      console.log("Calling taskManager.getTasks with params:", params);

      // CRITICAL: Force refresh to bypass ALL caching
      const response = await taskManager.getTasks(params, onUnauthorized, true);

      console.log("Got response from taskManager:", {
        hasResults: !!response?.results,
        resultCount: response?.results?.length || 0,
        totalCount: response?.count,
        hasNextPage: response?.hasNextPage,
        nextCursor: response?.nextCursor,
      });

      if (response) {
        setTasks(response);

        // Update pagination state from response
        setHasNextPage(response.hasNextPage === true);
        setNextCursor(response.nextCursor || "");

        // Set task count if available
        if (response.count !== undefined) {
          setTaskCount(response.count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Fetch task count (separate API call for better performance)
  const fetchTaskCount = async () => {
    try {
      const params = {};

      // Add same filters as task list for accurate count
      if (type !== 0) {
        params.type = type.toString();
      }
      // Always filter by is_closed status
      params.is_closed = isClosed.toString();

      const response = await taskManager.getTaskCount(
        params,
        onUnauthorized,
        true,
      );

      if (response && response.count !== undefined) {
        setTaskCount(response.count);
      }
    } catch (error) {
      console.error("Failed to fetch task count:", error);
    }
  };

  // Effect to fetch tasks - simplified dependencies
  useEffect(() => {
    if (currentUser) {
      console.log("=== useEffect triggered ===");
      console.log("Current cursor:", currentCursor || "(empty)");
      console.log("Dependencies:", {
        pageSize,
        sortByValue,
        type,
        isClosed,
        currentUser: currentUser?.id,
      });

      fetchTasks(currentCursor);
    }
  }, [currentCursor, pageSize, sortByValue, type, isClosed, currentUser]);

  // Effect for background refresh of task count
  useEffect(() => {
    if (currentUser) {
      // Initial fetch
      fetchTaskCount();

      // Set up interval for background refresh
      refreshIntervalRef.current = setInterval(() => {
        fetchTaskCount();
      }, CACHE_DURATIONS.BACKGROUND_REFRESH);

      // Cleanup on unmount
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [currentUser, type, isClosed]);

  // Event handlers
  const handleSearch = () => {
    console.log("Search clicked - resetting pagination");
    // Reset pagination when searching
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
    setFilterKey((prev) => prev + 1); // Force re-fetch
  };

  const handleClearFilters = () => {
    console.log("Clear filters clicked - resetting everything");
    setType(0);
    setIsClosed(TASK_IS_CLOSED_FILTER.OPEN); // Reset to show only open tasks
    setSortByValue(DEFAULT_TASK_SORT_BY);
    setSearchKeyword("");
    setShowAllFilters(false);
    // Reset pagination
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
    setFilterKey((prev) => prev + 1); // Force re-fetch
  };

  // Pagination handlers
  const handleNextPage = () => {
    console.log("=== Next page clicked ===");
    console.log("Current state:", {
      currentCursor: currentCursor || "(empty)",
      nextCursor: nextCursor || "(empty)",
      hasNextPage,
      previousCursorsCount: previousCursors.length,
    });

    if (hasNextPage && nextCursor) {
      // Save current cursor to previous stack
      setPreviousCursors((prev) => {
        const newStack = [...prev];
        if (currentCursor !== "") {
          newStack.push(currentCursor);
        }
        console.log("Updated previous cursors stack:", newStack);
        return newStack;
      });

      // Move to next page by updating current cursor
      console.log("Setting current cursor to:", nextCursor);
      setCurrentCursor(nextCursor);
    } else {
      console.log("Cannot go to next page:", { hasNextPage, nextCursor });
    }
  };

  const handlePreviousPage = () => {
    console.log("=== Previous page clicked ===");
    console.log("Previous cursors stack:", previousCursors);

    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const prevCursor = newPreviousCursors.pop();

      console.log("Going back to cursor:", prevCursor || "(empty)");
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(prevCursor || "");
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    console.log("Page size changed to:", newPageSize);
    setPageSize(newPageSize);
    // Reset pagination when page size changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
  };

  const handleSortChange = (newSortValue) => {
    console.log("Sort changed to:", newSortValue);
    setSortByValue(newSortValue);
    // Reset pagination when sort changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
  };

  const handleTypeChange = (newType) => {
    console.log("Type filter changed to:", newType);
    setType(newType);
    // Reset pagination when filter changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
  };

  const handleIsClosedChange = (newIsClosed) => {
    console.log("Is closed filter changed to:", newIsClosed);
    setIsClosed(newIsClosed);
    // Reset pagination when filter changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    setHasNextPage(false);
  };

  const handleDeleteClick = (task) => {
    setSelectedTaskForDeletion(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskForDeletion) return;

    try {
      await taskManager.deleteTask(selectedTaskForDeletion.id, onUnauthorized);

      // Refresh current page
      fetchTasks(currentCursor);
      fetchTaskCount();

      // Close modal
      setShowDeleteModal(false);
      setSelectedTaskForDeletion(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setErrors(error);
      setShowDeleteModal(false);
    }
  };

  // Helper function to get task update URL based on type
  const getTaskUpdateURL = (taskId, taskType) => {
    console.log("getTaskUpdateURL:", taskId, taskType);
    switch (taskType) {
      // Assign Associate
      case TASK_ITEM_TYPE_ASSIGN_ASSOCIATE:
        return `/admin/task/${taskId}/assign-associate/step-1`;
      // Follow Up
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB:
      case TASK_ITEM_TYPE_UPDATE_ONGOING_JOB:
        return `/admin/task/${taskId}/order-completion/step-1`;
      // Survey
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY:
        return `/admin/task/${taskId}/survey/step-1`;
      // Default case for unknown types
      default:
        return "/404";
    }
  };

  // Render grid view
  const renderGridView = () => {
    if (!tasks || !tasks.results || tasks.results.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>No tasks found.</p>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {tasks.results.map((task) => (
          <Card key={task.id}>
            <h3>
              <Link to={getTaskUpdateURL(task.id, task.type)}>
                {task.title}
              </Link>
            </h3>

            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Due Date:</strong> {formatDateForDisplay(task.dueDate)}
              </p>
              <p>
                <strong>Client:</strong>{" "}
                {task.customerName ? (
                  <Link to={`/admin/customer/${task.customerId}`}>
                    {task.customerName}
                  </Link>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Associate:</strong>{" "}
                {task.associateName ? (
                  <Link to={`/admin/associate/${task.associateId}`}>
                    {task.associateName}
                  </Link>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Created:</strong> {formatDateForDisplay(task.createdAt)}
              </p>
              <p>
                <strong>Status:</strong> {task.isClosed ? "Closed" : "Open"}
              </p>
            </div>

            <div style={{ marginTop: "15px" }}>
              <Link to={getTaskUpdateURL(task.id, task.type)}>
                <Button size="sm">
                  {task.isClosed ? "View" : "View & Update"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render tabular view
  const renderTabularView = () => {
    if (!tasks || !tasks.results || tasks.results.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>No tasks found.</p>
        </div>
      );
    }

    const columns = [
      {
        key: "dueDate",
        label: "Due Date",
        render: (value) => formatDateForDisplay(value),
      },
      {
        key: "title",
        label: "Task",
      },
      {
        key: "customerName",
        label: "Client",
        render: (value, row) =>
          value ? (
            <Link to={`/admin/customer/${row.customerId}`}>{value}</Link>
          ) : (
            "N/A"
          ),
      },
      {
        key: "associateName",
        label: "Associate",
        render: (value, row) =>
          value ? (
            <Link to={`/admin/associate/${row.associateId}`}>{value}</Link>
          ) : (
            "N/A"
          ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row) => (
          <Link to={getTaskUpdateURL(row.id, row.type)}>
            <Button size="sm">{row.isClosed ? "View" : "View & Update"}</Button>
          </Link>
        ),
      },
    ];

    return <Table columns={columns} data={tasks.results} />;
  };

  // Debug info (remove in production)
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== "development") return null;

    return (
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          marginBottom: "20px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <strong>Debug Info:</strong>
        <br />
        Current Cursor: {currentCursor || "(empty)"}
        <br />
        Next Cursor: {nextCursor || "(none)"}
        <br />
        Has Next Page: {hasNextPage ? "YES" : "NO"}
        <br />
        Previous Cursors Count: {previousCursors.length}
        <br />
        Page Size: {pageSize}
        <br />
        Is Closed Filter: {isClosed} (0=all, 1=closed, 2=open)
        <br />
        Type Filter: {type}
        <br />
        Total Count: {taskCount}
      </div>
    );
  };

  // Render main content
  if (!currentUser) {
    return <Loading message="Loading user information..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Tasks", icon: "📋" },
        ]}
      />

      <h1>
        Tasks{" "}
        {taskCount > 0 && (
          <span style={{ fontSize: "0.8em", color: "#666" }}>
            ({taskCount}{" "}
            {isClosed === TASK_IS_CLOSED_FILTER.OPEN
              ? "open"
              : isClosed === TASK_IS_CLOSED_FILTER.CLOSED
                ? "closed"
                : "total"}
            )
          </span>
        )}
      </h1>

      {errors && errors.message && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      <Card
        title="Task List"
        actions={[
          <Button
            key="toggle-view"
            onClick={() =>
              setListViewType(
                listViewType === TASK_LIST_VIEW_TYPE.TABULAR
                  ? TASK_LIST_VIEW_TYPE.GRID
                  : TASK_LIST_VIEW_TYPE.TABULAR,
              )
            }
            variant="outline"
          >
            {listViewType === TASK_LIST_VIEW_TYPE.TABULAR
              ? "Grid View"
              : "Table View"}
          </Button>,
        ]}
      >
        {/* Debug info for development */}
        {renderDebugInfo()}

        {/* Filter Panel */}
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Select
              label="Sort by"
              value={sortByValue}
              onChange={(e) => handleSortChange(e.target.value)}
              options={TASK_SORT_OPTIONS}
            />

            <div style={{ flex: 1 }}>
              <Input
                label="Search"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search tasks..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <Button onClick={handleSearch}>Search</Button>

            <Button
              onClick={() => setShowAllFilters(!showAllFilters)}
              variant="outline"
            >
              {showAllFilters ? "Hide Filters" : "Show All Filters"}
            </Button>
          </div>

          {/* Extended Filters */}
          {showAllFilters && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#e9ecef",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                }}
              >
                <h3>Filters</h3>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <Select
                  label="Type"
                  value={type}
                  onChange={(e) => handleTypeChange(parseInt(e.target.value))}
                  options={TASK_TYPE_FILTER_OPTIONS}
                />

                <FormGroup>
                  <label style={globalStyles.label}>Is Task Closed?</label>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={TASK_IS_CLOSED_FILTER.ALL}
                        checked={isClosed === TASK_IS_CLOSED_FILTER.ALL}
                        onChange={(e) =>
                          handleIsClosedChange(parseInt(e.target.value))
                        }
                      />{" "}
                      All
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={TASK_IS_CLOSED_FILTER.CLOSED}
                        checked={isClosed === TASK_IS_CLOSED_FILTER.CLOSED}
                        onChange={(e) =>
                          handleIsClosedChange(parseInt(e.target.value))
                        }
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={TASK_IS_CLOSED_FILTER.OPEN}
                        checked={isClosed === TASK_IS_CLOSED_FILTER.OPEN}
                        onChange={(e) =>
                          handleIsClosedChange(parseInt(e.target.value))
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </FormGroup>
              </div>
            </div>
          )}
        </div>

        {/* List Content */}
        {isLoading && !initialLoadComplete ? (
          <Loading message="Loading tasks..." />
        ) : (
          <>
            {listViewType === TASK_LIST_VIEW_TYPE.GRID
              ? renderGridView()
              : renderTabularView()}

            {/* Results Info */}
            {tasks && tasks.count > 0 && (
              <p
                style={{
                  textAlign: "right",
                  marginTop: "20px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Total Results: {tasks.count}
                {tasks.results && tasks.results.length > 0 && (
                  <span> (Showing {tasks.results.length} items)</span>
                )}
              </p>
            )}

            {/* Pagination Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                options={TASK_PAGINATION.PAGE_SIZE_OPTIONS}
              />

              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <Button
                  onClick={handlePreviousPage}
                  disabled={previousCursors.length === 0}
                  variant="outline"
                >
                  Previous
                </Button>

                <span style={{ fontSize: "14px", color: "#666" }}>
                  Page {previousCursors.length + 1}
                </span>

                <Button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || !nextCursor}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <div style={{ marginTop: "20px" }}>
        <Link to="/admin/dashboard">
          <Button variant="secondary">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTaskForDeletion(null);
        }}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTaskForDeletion(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="danger">
              Delete
            </Button>
          </>
        }
      >
        <p>
          You are about to delete the task "{selectedTaskForDeletion?.title}".
          This action cannot be undone. Are you sure you want to continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminTaskItemListPage;

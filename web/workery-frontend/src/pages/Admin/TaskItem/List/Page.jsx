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

// Constants
const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_SORT_BY_VALUE = "due_date,DESC";
const LIST_VIEW_TYPE_TABULAR = "tabular";
const LIST_VIEW_TYPE_GRID = "grid";

const TASK_ITEM_SORT_OPTIONS = [
  { value: "due_date,DESC", label: "Due Date (Newest → Oldest)" },
  { value: "due_date,ASC", label: "Due Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
  { value: "customer_lexical_name,ASC", label: "Customer Name (A → Z)" },
  { value: "customer_lexical_name,DESC", label: "Customer Name (Z → A)" },
  { value: "associate_lexical_name,ASC", label: "Associate Name (A → Z)" },
  { value: "associate_lexical_name,DESC", label: "Associate Name (Z → A)" },
];

const TASK_ITEM_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Assign Associate" },
  { value: 2, label: "Follow Up" },
  { value: 3, label: "48 Hour Follow Up" },
  { value: 4, label: "Completion Survey" },
  { value: 5, label: "Order Completion" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

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
  const [isClosed, setIsClosed] = useState(2); // 0=all, 1=true, 2=false (default to show only open tasks)
  const [sortByValue, setSortByValue] = useState(DEFAULT_SORT_BY_VALUE);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [listViewType, setListViewType] = useState(LIST_VIEW_TYPE_TABULAR);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Cursor-based pagination state (FIXED)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentCursor, setCurrentCursor] = useState("");
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);

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
    navigate("/login?unauthorized=true");
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        navigate("/login");
      }
    };

    if (authManager.isAuthenticated()) {
      fetchCurrentUser();
    } else {
      navigate("/login");
    }
  }, []);

  // Fetch tasks list (FIXED)
  const fetchTasks = async (cursor = "") => {
    setIsLoading(true);
    setErrors({});

    try {
      // Build params for cursor-based pagination
      const [sortField, sortOrder] = sortByValue.split(",");
      const params = {
        page_size: pageSize.toString(),
        sort_field: sortField,
        sort_order: sortOrder,
      };

      // Add cursor if provided (for pagination)
      if (cursor) {
        params.cursor = cursor;
      }

      // Add filters
      if (searchKeyword && searchKeyword.trim()) {
        params.search = searchKeyword.trim();
      }
      if (type !== 0) {
        params.type = type.toString();
      }
      // Always set is_closed filter (2 = false = show only open tasks)
      params.is_closed = isClosed.toString();

      console.log("Fetching tasks with params:", params);

      // Make API call through task manager
      const response = await taskManager.getTasks(params, onUnauthorized, true); // Force refresh

      console.log("Tasks response:", response);

      if (response) {
        setTasks(response);

        // Update pagination state
        if (response.hasNextPage !== undefined) {
          setHasNextPage(response.hasNextPage);
        }
        if (response.nextCursor !== undefined) {
          setNextCursor(response.nextCursor);
        }

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

  // Effect to fetch tasks when filters change or pagination changes
  useEffect(() => {
    if (currentUser) {
      fetchTasks(currentCursor);
    }
  }, [currentCursor, pageSize, sortByValue, type, isClosed, currentUser]);

  // Effect for background refresh of task count
  useEffect(() => {
    if (currentUser) {
      // Initial fetch
      fetchTaskCount();

      // Set up interval for background refresh (every 30 seconds)
      refreshIntervalRef.current = setInterval(() => {
        fetchTaskCount();
      }, 30 * 1000);

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
    // Reset pagination when searching
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    fetchTasks("");
  };

  const handleClearFilters = () => {
    setType(0);
    setIsClosed(2); // Reset to show only open tasks
    setSortByValue(DEFAULT_SORT_BY_VALUE);
    setSearchKeyword("");
    setShowAllFilters(false);
    // Reset pagination
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
  };

  // Pagination handlers (FIXED)
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      // Save current cursor to previous stack
      const newPreviousCursors = [...previousCursors];
      if (currentCursor) {
        newPreviousCursors.push(currentCursor);
      }
      setPreviousCursors(newPreviousCursors);

      // Move to next page
      setCurrentCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const prevCursor = newPreviousCursors.pop();

      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(prevCursor || "");
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    // Reset pagination when page size changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
  };

  const handleDeleteClick = (task) => {
    setSelectedTaskForDeletion(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskForDeletion) return;

    try {
      await taskManager.deleteTask(selectedTaskForDeletion.id, onUnauthorized);

      // Refresh list
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
    switch (taskType) {
      case 1: // Assign Associate
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case 2: // Follow Up
      case 3: // 48 Hour Follow Up
        return `/admin/task/${taskId}/postpone`;
      case 4: // Completion Survey
        return `/admin/task/${taskId}/survey/step-1`;
      case 5: // Order Completion
        return `/admin/task/${taskId}/order-completion/step-1`;
      default:
        return `/admin/task/${taskId}/close`;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render grid view
  const renderGridView = () => {
    if (!tasks || !tasks.results || tasks.results.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>No open tasks found.</p>
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
                <strong>Due Date:</strong> {formatDate(task.dueDate)}
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
                <strong>Created:</strong> {formatDate(task.createdAt)}
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
          <p>No open tasks found.</p>
        </div>
      );
    }

    const columns = [
      {
        key: "dueDate",
        label: "Due Date",
        render: (value) => formatDate(value),
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
            {isClosed === 2 ? "open" : isClosed === 1 ? "closed" : "total"})
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
                listViewType === LIST_VIEW_TYPE_TABULAR
                  ? LIST_VIEW_TYPE_GRID
                  : LIST_VIEW_TYPE_TABULAR,
              )
            }
            variant="outline"
          >
            {listViewType === LIST_VIEW_TYPE_TABULAR
              ? "Grid View"
              : "Table View"}
          </Button>,
        ]}
      >
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
              onChange={(e) => {
                setSortByValue(e.target.value);
                // Reset pagination when sort changes
                setCurrentCursor("");
                setPreviousCursors([]);
                setNextCursor("");
              }}
              options={TASK_ITEM_SORT_OPTIONS}
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
                  onChange={(e) => {
                    setType(parseInt(e.target.value));
                    // Reset pagination when filter changes
                    setCurrentCursor("");
                    setPreviousCursors([]);
                    setNextCursor("");
                  }}
                  options={TASK_ITEM_TYPE_FILTER_OPTIONS}
                />

                <FormGroup>
                  <label style={globalStyles.label}>Is Task Closed?</label>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={0}
                        checked={isClosed === 0}
                        onChange={(e) => {
                          setIsClosed(parseInt(e.target.value));
                          // Reset pagination when filter changes
                          setCurrentCursor("");
                          setPreviousCursors([]);
                          setNextCursor("");
                        }}
                      />{" "}
                      All
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={1}
                        checked={isClosed === 1}
                        onChange={(e) => {
                          setIsClosed(parseInt(e.target.value));
                          // Reset pagination when filter changes
                          setCurrentCursor("");
                          setPreviousCursors([]);
                          setNextCursor("");
                        }}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isClosed"
                        value={2}
                        checked={isClosed === 2}
                        onChange={(e) => {
                          setIsClosed(parseInt(e.target.value));
                          // Reset pagination when filter changes
                          setCurrentCursor("");
                          setPreviousCursors([]);
                          setNextCursor("");
                        }}
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
            {listViewType === LIST_VIEW_TYPE_GRID
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

            {/* Pagination Controls (FIXED) */}
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
                options={PAGE_SIZE_OPTIONS}
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
                  {previousCursors.length > 0 &&
                    `Page ${previousCursors.length + 1}`}
                </span>

                <Button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
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

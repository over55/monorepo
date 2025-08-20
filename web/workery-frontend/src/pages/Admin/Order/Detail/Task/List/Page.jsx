// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Task/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useTaskManager } from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";
import {
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
} from "../../../../../../constants/Order";

function AdminOrderDetailMoreTaskListPage() {
  // Get order ID from URL parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Services
  const taskManager = useTaskManager();

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [order, setOrder] = useState(null);
  const [errors, setErrors] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(25);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Validate order ID
    if (!oid) {
      setErrors("Order ID is required");
      return;
    }

    // Clear the task cache when order ID changes or on mount
    if (isInitialLoad) {
      taskManager.clearTasksCache();
      setIsInitialLoad(false);
    }

    fetchTasks();
  }, [oid, currentPage]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setErrors(null);

    try {
      // Create parameters with order_wjid filter - THIS IS THE KEY FIX
      const params = {
        page: currentPage,
        limit: pageSize,
        order_wjid: oid, // IMPORTANT: This filters tasks by order ID
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      // Fetch tasks for this specific order
      // Force refresh on initial load to ensure we get the latest data
      const response = await taskManager.getTasks(
        params,
        () => {
          // Unauthorized callback
          console.log("Unauthorized access, redirecting to login");
          navigate("/login?unauthorized=true");
        },
        true, // Force refresh to bypass cache and get latest data
      );

      if (response) {
        setTasks(response.results || []);
        if (response.order) {
          setOrder(response.order);
        }
        setTotalCount(response.count || 0);

        // Calculate total pages
        const pages = Math.ceil((response.count || 0) / pageSize);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setErrors(error?.general || "Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    // Clear cache and reload
    taskManager.clearTasksCache();
    fetchTasks();
  };

  const getTaskTypeLabel = (type) => {
    const types = {
      1: "Assign Associate",
      2: "Follow Up",
      3: "Complete Job",
      4: "Survey",
      5: "Review",
    };
    return types[type] || `Type ${type}`;
  };

  const getTaskStatusLabel = (status) => {
    const statuses = {
      1: "Pending",
      2: "In Progress",
      3: "Completed",
      4: "Cancelled",
    };
    return statuses[status] || `Status ${status}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return theme.colors.warning;
      case 2:
        return theme.colors.info;
      case 3:
        return theme.colors.success;
      case 4:
        return theme.colors.danger;
      default:
        return theme.colors.secondary;
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "Tasks", icon: "✅" },
  ];

  if (isLoading && tasks.length === 0) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading tasks..." />
      </div>
    );
  }

  const isOrderActionable =
    order &&
    ![
      ORDER_STATUS_DECLINED,
      ORDER_STATUS_CANCELLED,
      ORDER_STATUS_COMPLETED_BUT_UNPAID,
      ORDER_STATUS_COMPLETED_AND_PAID,
      ORDER_STATUS_ARCHIVED,
    ].includes(order.status);

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
            ✅ Tasks
          </h4>
        </div>
      </div>

      {/* Error Display */}
      {errors && (
        <Alert type="error" onClose={() => setErrors(null)}>
          {errors}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* Header with Actions */}
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
          <h3 style={{ margin: 0 }}>📋 Tasks for Order #{oid}</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              🔄 Refresh
            </Button>
            <Link to={`/admin/order/${oid}`}>
              <Button variant="outline">← Back to Order</Button>
            </Link>
          </div>
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
          <Link
            to={`/admin/order/${oid}/activity-sheets`}
            style={{
              padding: "10px 0",
              textDecoration: "none",
              color: theme.colors.secondary,
            }}
          >
            Activity Sheets
          </Link>
          <div
            style={{
              padding: "10px 0",
              borderBottom: "3px solid " + theme.colors.primary,
              fontWeight: "bold",
            }}
          >
            Tasks
          </div>
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

        {/* Results Summary */}
        <div
          style={{
            padding: "12px",
            backgroundColor: theme.colors.light,
            marginBottom: "20px",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: theme.colors.secondary,
            }}
          >
            Showing {tasks.length} of {totalCount} tasks for Order #{oid}
          </p>
        </div>

        {/* Tasks Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: theme.colors.dark, color: "white" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Task ID
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Title
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Due Date
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Created
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: theme.colors.secondary,
                  }}
                >
                  No tasks found for this order
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <tr
                  key={task.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "white" : theme.colors.light,
                  }}
                >
                  <td style={{ padding: "12px", fontWeight: "600" }}>
                    #{task.wjid || task.id}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getTaskTypeLabel(task.type)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.title || task.description || "No title"}
                    </div>
                  </td>
                  <td
                    style={{ padding: "12px", color: theme.colors.secondary }}
                  >
                    {formatDateForDisplay(task.dueDate)}
                  </td>
                  <td
                    style={{ padding: "12px", color: theme.colors.secondary }}
                  >
                    {formatDateForDisplay(task.createdAt)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {isOrderActionable &&
                        task.status === 1 &&
                        task.type === 1 && (
                          <Link
                            to={`/admin/task/${task.id}/assign-associate/step-1`}
                            style={{
                              color: theme.colors.primary,
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Assign
                          </Link>
                        )}
                      {isOrderActionable &&
                        task.status === 1 &&
                        task.type === 3 && (
                          <Link
                            to={`/admin/task/${task.id}/order-completion/step-1`}
                            style={{
                              color: theme.colors.primary,
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Complete
                          </Link>
                        )}
                      {isOrderActionable &&
                        task.status === 1 &&
                        task.type === 4 && (
                          <Link
                            to={`/admin/task/${task.id}/survey/step-1`}
                            style={{
                              color: theme.colors.primary,
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Survey
                          </Link>
                        )}
                      {isOrderActionable && task.status === 1 && (
                        <>
                          <span style={{ color: theme.colors.light }}>|</span>
                          <Link
                            to={`/admin/task/${task.id}/postpone`}
                            style={{
                              color: theme.colors.warning,
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Postpone
                          </Link>
                          <span style={{ color: theme.colors.light }}>|</span>
                          <Link
                            to={`/admin/task/${task.id}/close`}
                            style={{
                              color: theme.colors.danger,
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                          >
                            Close
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              ← Previous
            </Button>

            <div style={{ display: "flex", gap: "5px" }}>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      style={{ minWidth: "40px" }}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span
                      key={page}
                      style={{
                        padding: "0 5px",
                        color: theme.colors.secondary,
                      }}
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next →
            </Button>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: totalPages <= 1 ? "1px solid #e0e0e0" : "none",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link to={`/admin/order/${oid}`}>
            <Button variant="outline">← Back to Order</Button>
          </Link>

          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            🔄 Refresh List
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreTaskListPage;

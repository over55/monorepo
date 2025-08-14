// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Task/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router"; // Using react-router to match AppRouter.jsx
import { useTaskManager } from "../../../../../../services/Services";

function AdminOrderDetailMoreTaskListPage() {
  // Get order ID from URL parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Services
  const taskManager = useTaskManager();

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(25);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Validate order ID
    if (!oid) {
      setErrors({ general: "Order ID is required" });
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
    setErrors({});

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
          navigate("/login");
        },
        true, // Force refresh to bypass cache and get latest data
      );

      if (response) {
        setTasks(response.results || []);
        setTotalCount(response.count || 0);

        // Calculate total pages
        const pages = Math.ceil((response.count || 0) / pageSize);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setErrors(error || { general: "Failed to load tasks" });
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-green-100 text-green-800";
      case 4:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <span className="mx-2 text-gray-400">/</span>
                      <Link
                        to="/admin/orders"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Orders
                      </Link>
                    </li>
                    <li>
                      <span className="mx-2 text-gray-400">/</span>
                      <Link
                        to={`/admin/order/${oid}`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Order #{oid}
                      </Link>
                    </li>
                    <li>
                      <span className="mx-2 text-gray-400">/</span>
                      <span className="text-gray-900">Tasks</span>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">
                  Order Tasks
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage tasks associated with Order #{oid}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Refresh
                </button>
                <Link
                  to={`/admin/order/${oid}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Results Summary */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {tasks.length} of {totalCount} tasks for Order #{oid}
              </p>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No tasks found for this order
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{task.wjid || task.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTaskTypeLabel(task.type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {task.title || task.description || "No title"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}
                        >
                          {getTaskStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.dueDate || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {task.status === 1 && task.type === 1 && (
                            <Link
                              to={`/admin/task/${task.id}/assign-associate/step-1`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Assign
                            </Link>
                          )}
                          {task.status === 1 && task.type === 3 && (
                            <Link
                              to={`/admin/task/${task.id}/order-completion/step-1`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Complete
                            </Link>
                          )}
                          {task.status === 1 && task.type === 4 && (
                            <Link
                              to={`/admin/task/${task.id}/survey/step-1`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Survey
                            </Link>
                          )}
                          {task.status === 1 && (
                            <>
                              <Link
                                to={`/admin/task/${task.id}/postpone`}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Postpone
                              </Link>
                              <Link
                                to={`/admin/task/${task.id}/close`}
                                className="text-red-600 hover:text-red-900"
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === currentPage
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreTaskListPage;

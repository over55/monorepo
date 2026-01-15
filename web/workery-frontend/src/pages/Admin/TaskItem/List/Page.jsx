// File Path: web/workery-frontend/src/pages/Admin/TaskItem/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminTaskItemListPage

import React, { useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useTaskManager } from "../../../../services/Services";
import {
  UniversalListPage,
  Card,
  Button,
  Badge,
} from "../../../../components/UIX";
import {
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
  TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
  TASK_IS_CLOSED_FILTER,
  TASK_SORT_OPTIONS,
  DEFAULT_TASK_SORT_BY,
  TASK_TYPE_FILTER_OPTIONS,
} from "../../../../constants/Task";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Status filter options
const STATUS_FILTER_OPTIONS = [
  { label: "All", value: String(TASK_IS_CLOSED_FILTER.ALL) },
  { label: "Open", value: String(TASK_IS_CLOSED_FILTER.OPEN) },
  { label: "Closed", value: String(TASK_IS_CLOSED_FILTER.CLOSED) },
];

// Helper function to get task update URL based on type
const getTaskUpdateURL = (taskId, taskType) => {
  switch (taskType) {
    case TASK_ITEM_TYPE_ASSIGN_ASSOCIATE:
      return `/admin/task/${taskId}/assign-associate/step-1`;
    case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB:
    case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET:
    case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB:
    case TASK_ITEM_TYPE_UPDATE_ONGOING_JOB:
      return `/admin/task/${taskId}/order-completion/step-1`;
    case TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB:
    case TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY:
      return `/admin/task/${taskId}/survey/step-1`;
    default:
      return "/404";
  }
};

// Get task type display name
const getTaskTypeDisplay = (type) => {
  const typeOption = TASK_TYPE_FILTER_OPTIONS.find(
    (opt) => opt.value === String(type),
  );
  return typeOption ? typeOption.label : "Unknown";
};

function AdminTaskItemListPage() {
  const taskManager = useTaskManager();

  // Convert type filter options for select
  const typeFilterOptions = useMemo(
    () =>
      TASK_TYPE_FILTER_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    [],
  );

  const config = useMemo(
    () => ({
      // Entity information
      entityName: "Task",
      entityNamePlural: "Tasks",
      icon: ClipboardDocumentListIcon,
      title: "Tasks Management",
      subtitle: "View and manage all tasks",

      // Routes - no search or create for tasks
      routes: {
        detail: null, // Tasks use custom URLs based on type
      },

      // Hide search and create buttons
      showSearchButton: false,
      showCreateButton: false,

      // Breadcrumb
      breadcrumbItems: [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: "Tasks",
          icon: ClipboardDocumentListIcon,
          isActive: true,
        },
      ],

      // Table columns
      columns: [
        {
          key: "dueDate",
          label: "Due Date",
          render: (task) => (
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
              <span className="text-lg">
                {formatDateForDisplay(task.dueDate)}
              </span>
            </div>
          ),
        },
        {
          key: "title",
          label: "Task",
          render: (task) => (
            <div>
              <Link
                to={getTaskUpdateURL(task.id, task.type)}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <span className="text-lg">{task.title}</span>
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getTaskTypeDisplay(task.type)}
              </div>
            </div>
          ),
        },
        {
          key: "customer",
          label: "Client",
          render: (task) =>
            task.customerName ? (
              <Link
                to={`/admin/customer/${task.customerId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <UserIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                <span className="text-lg">{task.customerName}</span>
              </Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-lg">
                —
              </span>
            ),
        },
        {
          key: "associate",
          label: "Associate",
          render: (task) =>
            task.associateName ? (
              <Link
                to={`/admin/associate/${task.associateId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                <span className="text-lg">{task.associateName}</span>
              </Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-lg">
                —
              </span>
            ),
        },
        {
          key: "status",
          label: "Status",
          render: (task) => (
            <Badge
              variant={task.isClosed ? "secondary" : "success"}
              size="sm"
            >
              {task.isClosed ? (
                <>
                  <LockClosedIcon className="w-4 h-4 mr-1" />
                  Closed
                </>
              ) : (
                <>
                  <LockOpenIcon className="w-4 h-4 mr-1" />
                  Open
                </>
              )}
            </Badge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          align: "center",
          render: (task) => (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = getTaskUpdateURL(task.id, task.type);
              }}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              {task.isClosed ? "View" : "View & Update"}
            </Button>
          ),
        },
      ],

      // Filter options
      statusOptions: STATUS_FILTER_OPTIONS,
      statusFilterLabel: "Status",
      typeOptions: typeFilterOptions,
      typeFilterLabel: "Type",
      sortOptions: TASK_SORT_OPTIONS,
      searchPlaceholder: "Search tasks...",

      // Default values
      defaultStatus: String(TASK_IS_CLOSED_FILTER.OPEN),
      defaultType: "0",
      defaultSort: DEFAULT_TASK_SORT_BY.split(",")[0],
      defaultSortOrder: DEFAULT_TASK_SORT_BY.split(",")[1] || "DESC",
      defaultPageSize: 50,
      defaultViewType: "tabular",

      // Empty state
      emptyState: {
        title: "No Tasks Found",
        filterDescription:
          "No tasks match your current filters. Try adjusting your search criteria.",
        emptyDescription: "No tasks have been created yet.",
      },

      // Data fetching
      fetchData: async (params, onUnauthorized, forceRefresh) => {
        const response = await taskManager.getTasks(
          params,
          onUnauthorized,
          forceRefresh,
        );
        return response;
      },

      // Build API parameters
      buildParams: ({
        pageSize,
        currentCursor,
        sortBy,
        sortOrder,
        status,
        type,
        searchQuery,
      }) => {
        const params = {
          page_size: pageSize.toString(),
          sort_field: sortBy,
          sort_order: sortOrder,
          is_closed: status,
        };

        if (currentCursor) {
          params.cursor = currentCursor;
        }

        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (type && type !== "0") {
          params.type = type;
        }

        return params;
      },

      // Custom grid item renderer
      renderGridItem: (task, navigate) => (
        <Card
          key={task.id}
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-zinc-300 dark:border-zinc-600"
          onClick={() => navigate(getTaskUpdateURL(task.id, task.type))}
        >
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Link
                  to={getTaskUpdateURL(task.id, task.type)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span className="text-xl">{task.title}</span>
                </Link>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getTaskTypeDisplay(task.type)}
              </p>
            </div>

            <div className="space-y-2 text-base text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center text-lg">
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span>Due: {formatDateForDisplay(task.dueDate)}</span>
              </div>
              {task.customerName && (
                <div className="flex items-center text-lg">
                  <UserIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <Link
                    to={`/admin/customer/${task.customerId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {task.customerName}
                  </Link>
                </div>
              )}
              {task.associateName && (
                <div className="flex items-center text-lg">
                  <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <Link
                    to={`/admin/associate/${task.associateId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {task.associateName}
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant={task.isClosed ? "secondary" : "success"}
                size="sm"
              >
                {task.isClosed ? (
                  <>
                    <LockClosedIcon className="w-4 h-4 mr-1" />
                    Closed
                  </>
                ) : (
                  <>
                    <LockOpenIcon className="w-4 h-4 mr-1" />
                    Open
                  </>
                )}
              </Badge>

              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getTaskUpdateURL(task.id, task.type));
                }}
              >
                {task.isClosed ? "View" : "Update"}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      ),
    }),
    [taskManager, typeFilterOptions],
  );

  return <UniversalListPage config={config} />;
}

export default AdminTaskItemListPage;

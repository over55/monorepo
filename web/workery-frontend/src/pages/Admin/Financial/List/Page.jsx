// File Path: web/workery-frontend/src/pages/Admin/Financial/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminFinancialListPage

import React, { useMemo } from "react";
import { Link } from "react-router";
import { useOrderManager } from "../../../../services/Services";
import {
  UniversalListPage,
  Card,
  Button,
  ViewButton,
  Badge,
} from "../../../../components/UIX";
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarIcon,
  HomeIcon,
  BuildingOffice2Icon,
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ORDER_STATUS_NEW,
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_ONGOING,
  ORDER_STATUS_IN_PROGRESS,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_TYPE_UNASSIGNED,
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";
import {
  PAGE_SIZE_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_TYPE_FILTER_OPTIONS,
  DEFAULT_ORDER_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Helper functions for formatting
const formatStatus = (statusValue) => {
  switch (statusValue) {
    case ORDER_STATUS_NEW:
      return "New";
    case ORDER_STATUS_DECLINED:
      return "Declined";
    case ORDER_STATUS_PENDING:
      return "Pending";
    case ORDER_STATUS_CANCELLED:
      return "Cancelled";
    case ORDER_STATUS_ONGOING:
      return "Ongoing";
    case ORDER_STATUS_IN_PROGRESS:
      return "In Progress";
    case ORDER_STATUS_COMPLETED_BUT_UNPAID:
      return "Completed but Unpaid";
    case ORDER_STATUS_COMPLETED_AND_PAID:
      return "Completed and Paid";
    case ORDER_STATUS_ARCHIVED:
      return "Archived";
    default:
      return `Unknown (${statusValue})`;
  }
};

const formatType = (typeValue) => {
  switch (typeValue) {
    case ORDER_TYPE_UNASSIGNED:
      return "Unassigned";
    case ORDER_TYPE_RESIDENTIAL:
      return "Residential";
    case ORDER_TYPE_COMMERCIAL:
      return "Commercial";
    default:
      return `Unknown (${typeValue})`;
  }
};

const getTypeBadgeVariant = (type) => {
  switch (type) {
    case ORDER_TYPE_COMMERCIAL:
      return "info";
    case ORDER_TYPE_RESIDENTIAL:
      return "success";
    case ORDER_TYPE_UNASSIGNED:
    default:
      return "secondary";
  }
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case ORDER_STATUS_NEW:
      return "primary";
    case ORDER_STATUS_PENDING:
    case ORDER_STATUS_ONGOING:
    case ORDER_STATUS_IN_PROGRESS:
      return "warning";
    case ORDER_STATUS_COMPLETED_AND_PAID:
      return "success";
    case ORDER_STATUS_COMPLETED_BUT_UNPAID:
      return "warning";
    case ORDER_STATUS_DECLINED:
    case ORDER_STATUS_CANCELLED:
    case ORDER_STATUS_ARCHIVED:
      return "danger";
    default:
      return "secondary";
  }
};

const TypeIcon = ({ type }) => {
  switch (type) {
    case ORDER_TYPE_COMMERCIAL:
      return <BuildingOffice2Icon className="w-4 h-4 mr-1" />;
    case ORDER_TYPE_RESIDENTIAL:
      return <HomeIcon className="w-4 h-4 mr-1" />;
    default:
      return <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />;
  }
};

function AdminFinancialListPage() {
  const orderManager = useOrderManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(
    () => ({
      // Entity information
      entityName: "Financial",
      entityNamePlural: "Financials",
      icon: CurrencyDollarIcon,
      title: "Financial Management",
      subtitle: "Manage your financial records and invoices",

      // Routes
      routes: {
        search: "/admin/orders/search",
        create: "/admin/orders/add/step-1-search",
        detail: "/admin/financial/:id",
      },

      // Action buttons
      createLabel: "Add Order",
      createIcon: PlusIcon,
      searchIcon: MagnifyingGlassIcon,

      // Breadcrumb
      breadcrumbItems: [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: "Financials",
          icon: CurrencyDollarIcon,
          isActive: true,
        },
      ],

      // Table columns for tabular view
      columns: [
        {
          key: "type",
          label: "Type",
          render: (order) => (
            <Badge variant={getTypeBadgeVariant(order.type)} size="sm">
              <TypeIcon type={order.type} />
              {formatType(order.type)}
            </Badge>
          ),
        },
        {
          key: "wjid",
          label: "Job #",
          render: (order) => (
            <span className="text-lg font-medium">
              {order.wjid || order.id}
            </span>
          ),
        },
        {
          key: "customer",
          label: "Client",
          render: (order) =>
            order.customerName ? (
              <Link
                to={`/admin/customer/${order.customerId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                {order.customerName}
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
          render: (order) =>
            order.associateName ? (
              <Link
                to={`/admin/associate/${order.associateId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 text-lg"
              >
                {order.associateName}
              </Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-lg">
                —
              </span>
            ),
        },
        {
          key: "assignmentDate",
          label: "Assigned Date",
          render: (order) => (
            <span className="text-lg">
              {formatDateForDisplay(order.assignmentDate)}
            </span>
          ),
        },
        {
          key: "startDate",
          label: "Start Date",
          render: (order) => (
            <span className="text-lg">
              {formatDateForDisplay(order.startDate)}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (order) => (
            <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
              {formatStatus(order.status)}
            </Badge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          align: "center",
          render: (order) => (
            <div className="flex items-center justify-center gap-2">
              <ViewButton
                to={`/admin/financial/${order.wjid || order.id}`}
                text="View"
                icon={EyeIcon}
              />
              {order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/admin/financial/${order.wjid || order.id}/invoice`;
                  }}
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                  Invoice
                </Button>
              )}
            </div>
          ),
        },
      ],

      // Filter options
      statusOptions: ORDER_STATUS_FILTER_OPTIONS,
      typeOptions: ORDER_TYPE_FILTER_OPTIONS,
      typeFilterLabel: "Type",
      sortOptions: ORDER_SORT_OPTIONS,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      searchPlaceholder: "Search financial records...",

      // Default values - parse the default sort value
      defaultStatus: "0", // All statuses
      defaultType: "0", // All types
      defaultSort: DEFAULT_ORDER_LIST_SORT_BY_VALUE.split(",")[0],
      defaultSortOrder: DEFAULT_ORDER_LIST_SORT_BY_VALUE.split(",")[1] || "DESC",
      defaultPageSize: 50,
      defaultViewType: "tabular",

      // Empty state
      emptyState: {
        title: "No Financial Records Found",
        filterDescription:
          "No records match your current filters. Try adjusting your search criteria.",
        emptyDescription: "No financial records have been added yet.",
        actionLabel: "Add First Order",
      },

      // Data fetching
      fetchData: async (params, onUnauthorized, forceRefresh) => {
        const response = await orderManager.getOrdersWithFiltersMap(
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
        const filtersMap = new Map();

        if (currentCursor) {
          filtersMap.set("cursor", currentCursor);
        }

        filtersMap.set("page_size", pageSize.toString());

        if (sortBy) {
          filtersMap.set("sort_field", sortBy);
          filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
        }

        if (searchQuery && searchQuery.trim()) {
          filtersMap.set("search", searchQuery.trim());
        }

        // Add filters only if not 0 (All)
        if (status && status !== "0") {
          filtersMap.set("status", status);
        }

        if (type && type !== "0") {
          filtersMap.set("type", type);
        }

        return filtersMap;
      },

      // Custom grid item renderer
      renderGridItem: (order, navigate) => (
        <Card
          key={order.wjid || order.id}
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-zinc-300 dark:border-zinc-600"
          onClick={() => navigate(`/admin/financial/${order.wjid || order.id}`)}
        >
          <div className="p-5">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <span className="text-xl">
                    Job #{order.wjid || order.id}
                  </span>
                </h3>
                <Badge variant={getTypeBadgeVariant(order.type)} size="sm">
                  <TypeIcon type={order.type} />
                  {formatType(order.type)}
                </Badge>
              </div>
              <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                {formatStatus(order.status)}
              </Badge>
            </div>

            <div className="space-y-2 text-base text-gray-700 dark:text-gray-300 mb-4">
              {order.customerName && (
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Client:
                  </strong>{" "}
                  <Link
                    to={`/admin/customer/${order.customerId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span className="text-lg">{order.customerName}</span>
                  </Link>
                </div>
              )}
              {order.associateName && (
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Associate:
                  </strong>{" "}
                  <Link
                    to={`/admin/associate/${order.associateId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span className="text-lg">{order.associateName}</span>
                  </Link>
                </div>
              )}
              <div className="flex items-center text-lg">
                <CalendarIcon
                  className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>Start: {formatDateForDisplay(order.startDate)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/financial/${order.wjid || order.id}`);
                }}
              >
                View Details
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
              {order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/admin/financial/${order.wjid || order.id}/invoice`,
                    );
                  }}
                  title="Generate Invoice"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ),
    }),
    [orderManager],
  );

  return <UniversalListPage config={config} />;
}

export default AdminFinancialListPage;

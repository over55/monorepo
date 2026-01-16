// File Path: web/workery-frontend/src/pages/Admin/Order/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminOrderListPage

import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useOrderManager,
  useAccountManager,
} from "../../../../services/Services";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../constants/Roles";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  UniversalListPage,
  Card,
  Button,
  Modal,
  ViewButton,
} from "../../../../components/UIX";
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
  ORDER_TYPE_RESIDENTIAL,
  ORDER_TYPE_COMMERCIAL,
} from "../../../../constants/Order";

// Constants for filtering and sorting
const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: String(ORDER_STATUS_NEW), label: "New" },
  { value: String(ORDER_STATUS_DECLINED), label: "Declined" },
  { value: String(ORDER_STATUS_PENDING), label: "Pending" },
  { value: String(ORDER_STATUS_CANCELLED), label: "Cancelled" },
  { value: String(ORDER_STATUS_ONGOING), label: "Ongoing" },
  { value: String(ORDER_STATUS_IN_PROGRESS), label: "In Progress" },
  { value: String(ORDER_STATUS_COMPLETED_BUT_UNPAID), label: "Completed but unpaid" },
  { value: String(ORDER_STATUS_COMPLETED_AND_PAID), label: "Completed and paid" },
  { value: String(ORDER_STATUS_ARCHIVED), label: "Archived" },
];

const ORDER_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: String(ORDER_TYPE_RESIDENTIAL), label: "Residential" },
  { value: String(ORDER_TYPE_COMMERCIAL), label: "Commercial" },
];

const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Date Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Date Created (Oldest → Newest)" },
  { value: "start_date,DESC", label: "Start Date (Newest → Oldest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest → Newest)" },
  { value: "customer_name,ASC", label: "Customer Name (A → Z)" },
  { value: "customer_name,DESC", label: "Customer Name (Z → A)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

// Helper: Format order status for display
const getOrderStatusDisplay = (status) => {
  const statusNum = typeof status === "string" ? parseInt(status, 10) : status;

  switch (statusNum) {
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
      return "Completed (Unpaid)";
    case ORDER_STATUS_COMPLETED_AND_PAID:
      return "Completed (Paid)";
    case ORDER_STATUS_ARCHIVED:
      return "Archived";
    default:
      return "Unknown";
  }
};

// Helper: Get badge color for status
const getStatusBadgeColor = (status) => {
  const statusNum = typeof status === "string" ? parseInt(status, 10) : status;

  switch (statusNum) {
    case ORDER_STATUS_NEW:
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case ORDER_STATUS_DECLINED:
      return "bg-red-100 text-red-800 border border-red-200";
    case ORDER_STATUS_PENDING:
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case ORDER_STATUS_CANCELLED:
      return "bg-gray-100 text-gray-800 border border-gray-200";
    case ORDER_STATUS_ONGOING:
    case ORDER_STATUS_IN_PROGRESS:
      return "bg-indigo-100 text-indigo-800 border border-indigo-200";
    case ORDER_STATUS_COMPLETED_BUT_UNPAID:
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case ORDER_STATUS_COMPLETED_AND_PAID:
      return "bg-green-100 text-green-800 border border-green-200";
    case ORDER_STATUS_ARCHIVED:
      return "bg-gray-100 text-gray-800 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

function AdminOrderListPage() {
  const orderManager = useOrderManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // Role-based state
  const [userRole, setUserRole] = useState(null);

  // Modal state for deletion
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Get user role on component mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const accountDetails = await accountManager.getAccountDetail(
          onUnauthorized,
          false
        );

        if (accountDetails && accountDetails.role) {
          const roleId = accountDetails.role;
          setUserRole(roleId);

          if (process.env.NODE_ENV === "development") {
            console.log("User role fetched:", {
              roleId: roleId,
              isExecutive: roleId === EXECUTIVE_ROLE_ID,
              isManagement: roleId === MANAGEMENT_ROLE_ID,
              canViewFinancials:
                roleId === EXECUTIVE_ROLE_ID || roleId === MANAGEMENT_ROLE_ID,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    };
    fetchUserRole();
  }, [accountManager]);

  // Check if user can view financials (Executive or Management)
  const canViewFinancials =
    userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID;

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);

    try {
      await orderManager.archiveOrder(orderToDelete.id, onUnauthorized);
      setOrderToDelete(null);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("AdminOrderListPage: Failed to archive order:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity information
    entityName: "Order",
    entityNamePlural: "Work Orders",
    icon: ClipboardDocumentListIcon,
    title: "Work Orders Management",
    subtitle: "Manage work orders and track progress",

    // Routes
    routes: {
      search: "/admin/orders/search",
      create: "/admin/orders/add/step-1-search",
      detail: "/admin/order/:id",
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
        label: "Work Orders",
        icon: ClipboardDocumentListIcon,
        isActive: true,
      },
    ],

    // Table columns for tabular view
    // DataList render function signature: (item, rowIndex)
    columns: [
      {
        key: "wjid",
        label: "Order #",
        render: (order) => (
          <Link
            to={`/admin/order/${order.wjid || order.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-lg">{order.wjid || `#${order.id}`}</span>
          </Link>
        ),
      },
      {
        key: "customerName",
        label: "Customer",
        render: (order) =>
          order.customerName ? (
            <Link
              to={`/admin/customer/${order.customerId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center hover:text-blue-600"
            >
              {order.type === ORDER_TYPE_COMMERCIAL ? (
                <BuildingOffice2Icon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
              ) : (
                <HomeIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-lg">{order.customerName}</span>
            </Link>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "associateName",
        label: "Associate",
        render: (order) =>
          order.associateName ? (
            <Link
              to={`/admin/associate/${order.associateId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center hover:text-blue-600"
            >
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-lg">{order.associateName}</span>
            </Link>
          ) : (
            <span className="text-gray-400 italic text-lg">Unassigned</span>
          ),
      },
      {
        key: "status",
        label: "Status",
        render: (order) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
          >
            {getOrderStatusDisplay(order.status)}
          </span>
        ),
      },
      {
        key: "startDate",
        label: "Start Date",
        render: (order) =>
          order.startDate ? (
            <span className="flex items-center text-lg">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400" />
              {formatDateForDisplay(order.startDate)}
            </span>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (order) => (
          <div className="flex items-center justify-center gap-2">
            <ViewButton
              to={`/admin/order/${order.wjid || order.id}`}
              text="View"
              icon={EyeIcon}
            />
            {canViewFinancials && (
              <Link to={`/admin/financial/${order.wjid || order.id}`}>
                <Button
                  variant="success"
                  size="sm"
                  icon={CurrencyDollarIcon}
                  onClick={(e) => e.stopPropagation()}
                >
                  Financials
                </Button>
              </Link>
            )}
          </div>
        ),
      },
    ],

    // Filter options
    statusOptions: ORDER_STATUS_OPTIONS,
    typeOptions: ORDER_TYPE_OPTIONS,
    typeFilterLabel: "Type",
    sortOptions: ORDER_SORT_OPTIONS,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchPlaceholder: "Search orders...",

    // Default values
    defaultStatus: "all",
    defaultType: "all",
    defaultSort: "created_at",
    defaultSortOrder: "DESC",
    defaultPageSize: 50,
    defaultViewType: "tabular",

    // Empty state
    emptyState: {
      icon: ClipboardDocumentListIcon,
      title: "No Work Orders Found",
      filterDescription: "No orders match your current filters. Try adjusting your search criteria.",
      emptyDescription: "No work orders have been created yet.",
      actionLabel: "Add First Order",
      actionLink: "/admin/orders/add/step-1-search",
    },

    // Data fetching
    fetchData: async (filtersMap, onUnauthorized, forceRefresh) => {
      // Always clear cache when fetching with new filters
      if (forceRefresh) {
        orderManager.clearOrdersCache();
      }

      const response = await orderManager.getOrdersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true // Always force refresh
      );
      return response;
    },

    // Build API parameters
    buildParams: ({ pageSize, currentCursor, sortBy, sortOrder, status, type, searchQuery, startDateGte, startDateLte, completionDateGte, completionDateLte }) => {
      const filtersMap = new Map();

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      filtersMap.set("page_size", pageSize.toString());

      // Add sorting
      if (sortBy) {
        filtersMap.set("sort_field", sortBy);
        filtersMap.set("sort_order", sortOrder);
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      // Add status filter (only if not "all")
      if (status && status !== "all") {
        filtersMap.set("status", status);
      }

      // Add type filter (only if not "all")
      if (type && type !== "all") {
        filtersMap.set("type", type);
      }

      // Additional date filters
      if (startDateGte) {
        const date = new Date(startDateGte);
        filtersMap.set("start_date_gte", date.getTime().toString());
      }
      if (startDateLte) {
        const date = new Date(startDateLte);
        filtersMap.set("start_date_lte", date.getTime().toString());
      }
      if (completionDateGte) {
        const date = new Date(completionDateGte);
        filtersMap.set("completion_date_gte", date.getTime().toString());
      }
      if (completionDateLte) {
        const date = new Date(completionDateLte);
        filtersMap.set("completion_date_lte", date.getTime().toString());
      }

      return filtersMap;
    },

    // Additional filters configuration
    additionalFilters: [
      {
        key: "startDateGte",
        label: "Start Date (From)",
        type: "date",
      },
      {
        key: "startDateLte",
        label: "Start Date (To)",
        type: "date",
      },
      {
        key: "completionDateGte",
        label: "Completion Date (From)",
        type: "date",
      },
      {
        key: "completionDateLte",
        label: "Completion Date (To)",
        type: "date",
      },
    ],

    // Handle row click - navigate to detail
    onRowClick: (order) => {
      navigate(`/admin/order/${order.wjid || order.id}`);
    },

    // Custom grid item renderer
    renderGridItem: (order, navigateFn) => (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigateFn(`/admin/order/${order.wjid || order.id}`)}
      >
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              <Link
                to={`/admin/order/${order.wjid || order.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 flex items-start"
              >
                <ClipboardDocumentListIcon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-xl">Order {order.wjid || `#${order.id}`}</span>
              </Link>
            </h3>
          </div>

          <div className="space-y-2 text-base mb-4">
            {order.customerName && (
              <div className="flex items-center text-lg">
                <UserIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.customerName}</span>
              </div>
            )}
            {order.associateName && (
              <div className="flex items-center text-lg">
                <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{order.associateName}</span>
              </div>
            )}
            {order.startDate && (
              <div className="flex items-center text-lg">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                {formatDateForDisplay(order.startDate)}
              </div>
            )}
            {order.description && (
              <div className="text-sm text-gray-600 mt-2">
                {order.description.substring(0, 100)}
                {order.description.length > 100 && "..."}
              </div>
            )}
          </div>

          <div className="mb-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
            >
              {getOrderStatusDisplay(order.status)}
            </span>
          </div>

          <div className="space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigateFn(`/admin/order/${order.wjid || order.id}`);
              }}
            >
              View Details
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
            {canViewFinancials && (
              <Button
                variant="success"
                size="md"
                className="w-full"
                icon={CurrencyDollarIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateFn(`/admin/financial/${order.wjid || order.id}`);
                }}
              >
                View Financials
              </Button>
            )}
          </div>
        </div>
      </Card>
    ),

    // Refresh trigger for external updates
    refreshTrigger,
  }), [orderManager, canViewFinancials, navigate, refreshTrigger]);

  return (
    <>
      <UniversalListPage config={config} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        title="Archive Work Order"
      >
        {orderToDelete && (
          <>
            <p className="text-sm text-black mb-4">
              Are you sure you want to archive this work order? It will no
              longer appear in active lists.
            </p>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 mb-4">
              <p className="text-sm font-medium text-black mb-1">
                <strong>Order:</strong> {orderToDelete.wjid || `#${orderToDelete.id}`}
              </p>
              {orderToDelete.customerName && (
                <p className="text-sm text-black mt-1">
                  <strong>Customer:</strong> {orderToDelete.customerName}
                </p>
              )}
              <p className="text-sm text-black mt-1">
                <strong>Status:</strong> {getOrderStatusDisplay(orderToDelete.status)}
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-xs text-blue-800 flex items-start">
                <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> This action can be undone by a
                  system administrator. The order data will be preserved.
                </span>
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setOrderToDelete(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                icon={ArchiveBoxIcon}
                className="w-full sm:w-auto"
              >
                {isDeleting ? "Archiving..." : "Archive Order"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default AdminOrderListPage;

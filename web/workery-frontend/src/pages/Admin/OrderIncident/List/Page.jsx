// File Path: web/workery-frontend/src/pages/Admin/OrderIncident/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminOrderIncidentListPage

import React, { useMemo } from "react";
import { Link } from "react-router";
import { useOrderIncidentManager } from "../../../../services/Services";
import {
  UniversalListPage,
  Card,
  Button,
  Badge,
  ViewButton,
} from "../../../../components/UIX";
import {
  FireIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ORDER_INCIDENT_SORT_OPTIONS } from "../../../../constants/FieldOptions";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Status constants
const INCIDENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const INITIATOR_OPTIONS = [
  { value: "", label: "All Initiators" },
  { value: "1", label: "Client" },
  { value: "2", label: "Associate" },
  { value: "3", label: "Staff" },
];

// Format initiator for display
const getInitiatorDisplay = (initiator) => {
  switch (initiator) {
    case 1:
      return "Client";
    case 2:
      return "Associate";
    case 3:
      return "Staff";
    default:
      return "Unknown";
  }
};

// Get badge variant for initiator
const getInitiatorBadgeVariant = (initiator) => {
  switch (initiator) {
    case 1:
      return "info";
    case 2:
      return "success";
    case 3:
      return "primary";
    default:
      return "secondary";
  }
};

// Get badge variant for status
const getStatusBadgeVariant = (incident) => {
  return incident.closingReason ? "success" : "warning";
};

function AdminOrderIncidentListPage() {
  const orderIncidentManager = useOrderIncidentManager();

  const config = useMemo(
    () => ({
      // Entity information
      entityName: "Incident",
      entityNamePlural: "Incidents",
      icon: FireIcon,
      title: "Incidents Management",
      subtitle: "Manage and track all order incidents",

      // Routes
      routes: {
        search: "/admin/incidents/search",
        create: "/admin/incidents/create",
        detail: "/admin/incident/:id",
      },

      // Action buttons
      createLabel: "Add Incident",
      createIcon: PlusIcon,
      createButtonVariant: "danger",
      searchIcon: MagnifyingGlassIcon,

      // Breadcrumb
      breadcrumbItems: [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: "Incidents",
          icon: FireIcon,
          isActive: true,
        },
      ],

      // Table columns
      columns: [
        {
          key: "title",
          label: "Title",
          render: (incident) => (
            <Link
              to={`/admin/incident/${incident.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
            >
              <ShieldExclamationIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-lg">{incident.title}</span>
            </Link>
          ),
        },
        {
          key: "order",
          label: "Order",
          render: (incident) =>
            incident.orderId ? (
              <Link
                to={`/admin/order/${incident.orderId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-lg"
              >
                #{incident.orderId}
              </Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-lg">
                —
              </span>
            ),
        },
        {
          key: "initiator",
          label: "Initiated By",
          render: (incident) => (
            <Badge
              variant={getInitiatorBadgeVariant(incident.initiator)}
              size="sm"
            >
              {getInitiatorDisplay(incident.initiator)}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: "Created At",
          render: (incident) => (
            <span className="text-gray-900 dark:text-gray-100 text-lg">
              {formatDateForDisplay(incident.createdAt)}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (incident) => (
            <Badge variant={getStatusBadgeVariant(incident)} size="sm">
              {incident.closingReason ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Closed
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
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
          render: (incident) => (
            <ViewButton
              to={`/admin/incident/${incident.id}`}
              text="View"
              icon={EyeIcon}
            />
          ),
        },
      ],

      // Filter options
      statusOptions: INCIDENT_STATUS_OPTIONS,
      statusFilterLabel: "Status",
      typeOptions: INITIATOR_OPTIONS,
      typeFilterLabel: "Initiated By",
      sortOptions: ORDER_INCIDENT_SORT_OPTIONS,
      searchPlaceholder: "Search incidents...",

      // Default values
      defaultStatus: "",
      defaultType: "",
      defaultSort: "created_at",
      defaultSortOrder: "DESC",
      defaultPageSize: 50,
      defaultViewType: "tabular",

      // Empty state
      emptyState: {
        title: "No Incidents Found",
        filterDescription:
          "No incidents match your current filters. Try adjusting your search criteria.",
        emptyDescription: "No incidents have been reported yet.",
        actionLabel: "Report First Incident",
      },

      // Data fetching
      fetchData: async (params, onUnauthorized, forceRefresh) => {
        const response = await orderIncidentManager.getOrderIncidents(
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
          sortBy: `${sortBy},${sortOrder}`,
          limit: pageSize,
        };

        if (currentCursor) {
          params.cursor = currentCursor;
        }

        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (status && status !== "") {
          params.status = status;
        }

        if (type && type !== "") {
          params.initiator = type;
        }

        return params;
      },

      // Custom grid item renderer
      renderGridItem: (incident, navigate) => (
        <Card
          key={incident.id}
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-zinc-300 dark:border-zinc-600"
          onClick={() => navigate(`/admin/incident/${incident.id}`)}
        >
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Link
                  to={`/admin/incident/${incident.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-start"
                >
                  <ShieldExclamationIcon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-xl">{incident.title}</span>
                </Link>
              </h3>
            </div>

            <div className="space-y-2 text-base text-gray-700 dark:text-gray-300 mb-4">
              {incident.orderId && (
                <div className="flex items-center text-lg">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>
                    Order{" "}
                    <Link
                      to={`/admin/order/${incident.orderId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      #{incident.orderId}
                    </Link>
                  </span>
                </div>
              )}
              <div className="flex items-center text-lg">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                {formatDateForDisplay(incident.createdAt)}
              </div>
              {incident.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                  {incident.description}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={getInitiatorBadgeVariant(incident.initiator)}
                size="sm"
              >
                {getInitiatorDisplay(incident.initiator)}
              </Badge>
              <Badge variant={getStatusBadgeVariant(incident)} size="sm">
                {incident.closingReason ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Closed
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    Open
                  </>
                )}
              </Badge>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/incident/${incident.id}`);
              }}
            >
              View Details
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      ),
    }),
    [orderIncidentManager],
  );

  return <UniversalListPage config={config} />;
}

export default AdminOrderIncidentListPage;

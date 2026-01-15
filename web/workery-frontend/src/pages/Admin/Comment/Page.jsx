// File Path: web/workery-frontend/src/pages/Admin/Comment/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminCommentListPage

import React, { useMemo } from "react";
import { Link } from "react-router";
import { useCommentManager } from "../../../services/Services";
import {
  UniversalListPage,
  Badge,
} from "../../../components/UIX";
import {
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  ChartBarIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "../../../services/Helpers/DateFormatter";

// Comment Sort Options
const COMMENT_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
];

// Comment Status Filter Options
const COMMENT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Belongs To Types
const BELONGS_TO_CUSTOMER = 1;
const BELONGS_TO_ASSOCIATE = 2;
const BELONGS_TO_ORDER = 3;
const BELONGS_TO_ORDER_INCIDENT = 4;

// Render belongs to badge
const renderBelongsTo = (belongsTo) => {
  switch (belongsTo) {
    case BELONGS_TO_CUSTOMER:
      return (
        <Badge variant="info" size="sm">
          <UserCircleIcon className="h-4 w-4 mr-1" />
          Customer
        </Badge>
      );
    case BELONGS_TO_ASSOCIATE:
      return (
        <Badge variant="success" size="sm">
          <UserIcon className="h-4 w-4 mr-1" />
          Associate
        </Badge>
      );
    case BELONGS_TO_ORDER:
      return (
        <Badge variant="primary" size="sm">
          <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
          Order
        </Badge>
      );
    case BELONGS_TO_ORDER_INCIDENT:
      return (
        <Badge variant="warning" size="sm">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          Order Incident
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm">
          Unknown ({belongsTo})
        </Badge>
      );
  }
};

// Get view link based on belongs to type
const getViewLink = (row) => {
  if (row.belongsTo === BELONGS_TO_CUSTOMER) {
    if (row.customerId === "000000000000000000000000" || !row.customerId) {
      return null;
    }
    return `/admin/customer/${row.customerId}/comments`;
  } else if (row.belongsTo === BELONGS_TO_ASSOCIATE) {
    if (row.associateId === "000000000000000000000000" || !row.associateId) {
      return null;
    }
    return `/admin/associate/${row.associateId}/comments`;
  } else if (row.belongsTo === BELONGS_TO_ORDER) {
    if (!row.orderWjid) {
      return null;
    }
    return `/admin/order/${row.orderWjid}/comments`;
  } else if (row.belongsTo === BELONGS_TO_ORDER_INCIDENT) {
    const incidentId = row.orderIncidentId || row.incidentId;
    if (!incidentId) {
      return null;
    }
    return `/admin/incident/${incidentId}/comments`;
  }
  return null;
};

function AdminCommentListPage() {
  const commentManager = useCommentManager();

  const config = useMemo(
    () => ({
      // Entity information
      entityName: "Comment",
      entityNamePlural: "Comments",
      icon: ChatBubbleLeftRightIcon,
      title: "Comments",
      subtitle: "View and manage all comments",

      // Routes - no search or create for comments
      routes: {
        detail: null, // Comments don't have their own detail page
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
          label: "Comments",
          icon: ChatBubbleLeftRightIcon,
          isActive: true,
        },
      ],

      // Table columns
      columns: [
        {
          key: "content",
          label: "Content",
          render: (row) => (
            <div
              className="max-w-md truncate text-gray-900 dark:text-gray-100 text-lg"
              title={row.content}
            >
              {row.content}
            </div>
          ),
        },
        {
          key: "belongsTo",
          label: "Belongs to",
          render: (row) => renderBelongsTo(row.belongsTo),
        },
        {
          key: "createdAt",
          label: "Created At",
          render: (row) => (
            <span className="text-gray-600 dark:text-gray-400 text-lg">
              {formatDateTime(row.createdAt, "medium")}
            </span>
          ),
        },
        {
          key: "actions",
          label: "",
          align: "center",
          render: (row) => {
            const link = getViewLink(row);
            if (!link) return null;
            return (
              <Link
                to={link}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-lg"
              >
                View
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            );
          },
        },
      ],

      // Filter options
      statusOptions: COMMENT_STATUS_FILTER_OPTIONS,
      statusFilterLabel: "Status",
      sortOptions: COMMENT_SORT_OPTIONS,
      searchPlaceholder: "Search comments...",

      // Default values
      defaultStatus: "1", // Active by default
      defaultSort: "created_at",
      defaultSortOrder: "DESC",
      defaultPageSize: 50,
      defaultViewType: "tabular",

      // Only show tabular view (no grid for comments)
      showViewToggle: false,

      // Empty state
      emptyState: {
        title: "No Comments Found",
        filterDescription:
          "No comments match your current filters. Try adjusting your search criteria.",
        emptyDescription: "No comments have been added yet.",
      },

      // Data fetching
      fetchData: async (params, onUnauthorized, forceRefresh) => {
        return new Promise((resolve, reject) => {
          commentManager.getCommentListAPI(
            params,
            (response) => {
              resolve(response);
            },
            (error) => {
              reject(error);
            },
            () => {},
            onUnauthorized,
          );
        });
      },

      // Build API parameters
      buildParams: ({
        pageSize,
        currentCursor,
        sortBy,
        sortOrder,
        status,
        searchQuery,
      }) => {
        const params = new Map();

        params.set("page_size", pageSize.toString());

        if (currentCursor) {
          params.set("cursor", currentCursor);
        }

        if (sortBy) {
          params.set("sort_field", sortBy);
          params.set("sort_order", sortOrder);
        }

        if (searchQuery && searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        if (status && status !== "") {
          params.set("status", status);
        }

        return params;
      },
    }),
    [commentManager],
  );

  return <UniversalListPage config={config} />;
}

export default AdminCommentListPage;

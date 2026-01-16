// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/Tenant/List/Page.jsx
// Refactored to use UniversalListPage component

import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTenantManager } from "../../../../services/Services";
import {
  UniversalListPage,
  Button,
  Modal,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  BuildingOfficeIcon,
  PlusIcon,
  InformationCircleIcon,
  PlayIcon,
  TrashIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Status options for filtering
// Using "all" instead of "" because empty string is falsy and causes fallback to default
const TENANT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Inactive" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

function RootTenantListPage() {
  const tenantManager = useTenantManager();
  const { getThemeClasses } = useUIXTheme();
  const [selectedTenantForDeletion, setSelectedTenantForDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize theme classes for use in render functions
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    bgCard: getThemeClasses("bg-card"),
    cardBorder: getThemeClasses("card-border"),
  }), [getThemeClasses]);

  // Handle delete confirmation
  const handleDeleteConfirm = async (onUnauthorized) => {
    if (!selectedTenantForDeletion) return;

    setIsDeleting(true);

    try {
      await tenantManager.archiveTenant(
        selectedTenantForDeletion.id,
        onUnauthorized,
      );
      setSelectedTenantForDeletion(null);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("RootTenantListPage: Failed to archive tenant:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity information
    entityName: "Tenant",
    entityNamePlural: "Tenants",
    icon: BuildingOffice2Icon,
    title: "Tenants List",
    subtitle: "Manage your tenants",

    // Routes
    routes: {
      create: "/root/tenant/add",
      detail: "/root/tenant/:id",
    },

    // Action buttons
    createLabel: "New Tenant",
    createIcon: PlusIcon,

    // Breadcrumb
    breadcrumbItems: [
      {
        label: "Root Dashboard",
        to: "/root/dashboard",
        icon: ChartBarIcon,
      },
      {
        label: "Tenants",
        icon: BuildingOffice2Icon,
        isActive: true,
      },
    ],

    // Table columns
    // DataList render function signature: (item, rowIndex)
    columns: [
      {
        key: "schemaName",
        label: "Schema",
        render: (tenant) => (
          <span className={`font-medium ${themeClasses.textPrimary}`}>{tenant.schemaName}</span>
        ),
      },
      {
        key: "name",
        label: "Name",
        render: (tenant) => (
          <Link
            to={`/root/tenant/${tenant.id}`}
            className={`${themeClasses.textPrimary} font-medium hover:underline`}
          >
            {tenant.name}
          </Link>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (tenant) => (
          <div className="flex gap-2 justify-center">
            <Link to={`/root/tenant/${tenant.id}`}>
              <Button
                variant="primary"
                size="sm"
                icon={InformationCircleIcon}
              >
                View
              </Button>
            </Link>
            <Link to={`/root/tenant/${tenant.id}/start`}>
              <Button
                variant="success"
                size="sm"
                icon={PlayIcon}
              >
                Start
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setSelectedTenantForDeletion(tenant)}
              icon={TrashIcon}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],

    // Filter options
    statusOptions: TENANT_STATUS_OPTIONS,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchPlaceholder: "Search by name...",

    // Default values
    defaultStatus: "all",
    defaultPageSize: 50,
    defaultViewType: "tabular",

    // Empty state
    emptyState: {
      icon: BuildingOfficeIcon,
      title: "No Tenants",
      filterDescription: "No tenants match your current filters.",
      emptyDescription: "No tenants found.",
      actionLabel: "Add First Tenant",
      actionLink: "/root/tenant/add",
    },

    // Data fetching
    fetchData: async (params, onUnauthorized, forceRefresh) => {
      const response = await tenantManager.getTenants(
        params,
        onUnauthorized,
        forceRefresh,
      );
      return response;
    },

    // Custom fetch success handler for page-based API
    onFetchSuccess: (response, setEntityList, setNextCursor) => {
      const results = response?.results || [];
      const count = response?.count || results.length;
      const hasNextPage = response?.hasNextPage || false;

      setEntityList({
        results: results,
        count: count,
      });

      // Use hasNextPage from response if available
      if (hasNextPage) {
        setNextCursor("next");
      } else {
        setNextCursor("");
      }
    },

    // Build API parameters - currentCursor is used as page number for page-based APIs
    buildParams: ({ pageSize, currentCursor, status, searchQuery, createdAtGTE }) => {
      // Parse cursor as page number (default to 1 if empty)
      const page = currentCursor ? parseInt(currentCursor, 10) : 1;

      const params = {
        page: page,
        limit: pageSize,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Only add status filter if it's not "all" (all means no status filter)
      if (status && status !== "all") {
        params.status = status;
      }

      if (createdAtGTE) {
        params.createdAtGTE = new Date(createdAtGTE).getTime();
      }

      return params;
    },

    // Custom grid item renderer for mobile
    // Note: renderGridItem receives (item, navigate) from UniversalListPage
    renderGridItem: (tenant, navigate) => (
      <div className={`${themeClasses.bgCard} border ${themeClasses.cardBorder} rounded-lg p-4 hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${themeClasses.textPrimary} truncate`}>
              {tenant.name}
            </h3>
            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
              Schema: {tenant.schemaName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/root/tenant/${tenant.id}`} className="flex-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
            >
              View
            </Button>
          </Link>
          <Link to={`/root/tenant/${tenant.id}/start`} className="flex-1">
            <Button
              variant="success"
              size="sm"
              className="w-full"
            >
              Start
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedTenantForDeletion(tenant)}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    ),

    // Refresh trigger for external updates
    refreshTrigger,

    // Additional filters
    additionalFilters: [
      {
        key: "createdAtGTE",
        label: "Created After",
        type: "date",
      },
    ],
  }), [tenantManager, refreshTrigger, themeClasses]);

  return (
    <>
      <UniversalListPage config={config} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedTenantForDeletion}
        onClose={() => setSelectedTenantForDeletion(null)}
        title="Confirm Deletion"
      >
        <div className="flex items-start space-x-3 mb-6">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Are you sure you want to delete the tenant "
            <strong className="break-all">
              {selectedTenantForDeletion?.name}
            </strong>
            "? This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setSelectedTenantForDeletion(null)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteConfirm(() => {})}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default RootTenantListPage;

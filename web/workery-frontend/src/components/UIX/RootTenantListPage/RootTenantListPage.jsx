// File: src/components/UIX/RootTenantListPage/RootTenantListPage.jsx
// UIX Mobile Optimizations Applied
// Reusable Root Tenant List Page Component

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  UIXThemeProvider,
  PageHeader,
  DataList,
  ViewButton,
  Breadcrumb,
  Alert,
  Card,
  Badge,
  useUIXTheme,
} from "../index";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * RootTenantListPage - Reusable Root Tenant List Page Component
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.authManager - Auth manager with isAuthenticated() method
 * @param {Function} config.tenantManager - Tenant manager with getTenants() method
 * @param {React.Component} config.icon - Main icon for page
 * @param {React.Component} config.headerIcon - Icon for header
 * @param {string} config.title - Page title
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items
 * @param {Array} config.columns - DataList column configuration
 * @param {Object} config.routes - Route configuration {dashboard, add, detail, launch}
 * @param {Object} config.emptyState - Empty state configuration {icon, title, description}
 * @param {string} config.loginPath - Path to login page
 */
const RootTenantListPage = memo(({ config }) => {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState(null);

  // Ref for mounted state
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Memoize callback to prevent recreation
  const onUnauthorized = useCallback(() => {
    navigate(`${config.loginPath || "/login"}?unauthorized=true`);
  }, [navigate, config.loginPath]);

  // Memoize fetchTenants to prevent recreation
  const fetchTenants = useCallback(async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setErrors({});

    try {
      const params = config.fetchParams || {
        page: 1,
        limit: 100,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      const tenantsData = await config.tenantManager.getTenants(
        params,
        onUnauthorized,
        true,
      );

      if (!isMounted.current) return;

      setTenants(tenantsData);

      if (import.meta.env.DEV) {
        console.log("RootTenantListPage: Tenants fetched successfully:", {
          count: tenantsData.results ? tenantsData.results.length : 0,
          totalCount: tenantsData.count,
        });
      }
    } catch (error) {
      if (!isMounted.current) return;

      if (import.meta.env.DEV) {
        console.error("RootTenantListPage: Failed to fetch tenants:", error);
      }
      setErrors({ fetch: error.message || "Failed to load tenants" });
      window.scrollTo(0, 0);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [config.tenantManager, config.fetchParams, onUnauthorized]);

  useEffect(() => {
    isMounted.current = true;
    window.scrollTo(0, 0);

    if (!config.authManager.isAuthenticated()) {
      navigate(`${config.loginPath || "/login"}?unauthorized=true`);
      return;
    }

    fetchTenants();

    return () => {
      isMounted.current = false;
    };
  }, [config.authManager, config.loginPath, navigate, fetchTenants]);

  // Memoize breadcrumb items
  const breadcrumbs = useMemo(() => {
    if (config.breadcrumbItems) {
      return config.breadcrumbItems;
    }
    return [
      {
        label: "Root Dashboard",
        to: config.routes?.dashboard || "/root/dashboard",
        icon: config.headerIcon || config.icon,
      },
      {
        label: config.title || "Tenants",
        icon: config.icon,
        isActive: true,
      },
    ];
  }, [config.breadcrumbItems, config.routes, config.headerIcon, config.icon, config.title]);

  // Memoize action buttons
  const actionButtons = useMemo(() => [
    {
      label: config.createLabel || "New Tenant",
      variant: "success",
      icon: PlusIcon,
      onClick: () => navigate(config.routes?.add || "/root/tenant/add"),
    },
  ], [navigate, config.routes, config.createLabel]);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses('text-primary'),
    bgPage: getThemeClasses('bg-page') || 'bg-gray-50',
    bgGradientPrimary: getThemeClasses('bg-gradient-primary'),
  }), [getThemeClasses]);

  // Memoize columns configuration
  const columns = useMemo(() => {
    if (config.columns) {
      return config.columns;
    }
    return [
      {
        header: "Schema",
        accessor: "schemaName",
        type: "text",
        render: (row) => (
          <Badge variant="default" size="lg" className={`!bg-transparent font-medium ${themeClasses.textPrimary}`}>
            {row.schemaName}
          </Badge>
        )
      },
      {
        header: "Name",
        accessor: "name",
        type: "text",
        render: (row) => (
          <Badge variant="default" size="lg" className={`!bg-transparent font-medium ${themeClasses.textPrimary}`}>
            {row.name}
          </Badge>
        )
      },
      {
        header: "Actions",
        align: "right",
        type: "action",
        render: (row) => (
          <div className="flex gap-2 justify-end">
            <ViewButton
              to={(config.routes?.detail || "/root/tenant/:id").replace(":id", row.id)}
              text="Details"
            />
            <ViewButton
              to={(config.routes?.launch || "/root/tenant/:id/start").replace(":id", row.id)}
              text="Launch"
            />
          </div>
        ),
      },
    ];
  }, [config.columns, config.routes, themeClasses]);

  // Memoize empty state
  const emptyState = useMemo(() => ({
    icon: config.emptyState?.icon || config.icon,
    title: config.emptyState?.title || "No Tenants Found",
    description: config.emptyState?.description || "No tenants match your search criteria.",
  }), [config.emptyState, config.icon]);

  return (
    <Card
      padding="p-0"
      className={`min-h-dvh border-0 shadow-none ${themeClasses.bgGradientPrimary}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Card padding="p-0" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-0 shadow-none bg-transparent">
        {/* Breadcrumbs */}
        <Card padding="p-0" className="mb-6 border-0 shadow-none bg-transparent">
          <Breadcrumb items={breadcrumbs} />
        </Card>

        {/* Errors */}
        {errors.fetch && (
          <Card padding="p-0" className="mb-4 border-0 shadow-none bg-transparent">
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({})}
            >
              {errors.fetch}
            </Alert>
          </Card>
        )}

        {/* Page Header */}
        <PageHeader
          title={config.title || "Tenants"}
          icon={config.icon}
          actionButtons={actionButtons}
        />

        {/* Data List */}
        <DataList
          columns={columns}
          data={tenants?.results || []}
          isLoading={isLoading}
          emptyState={emptyState}
          className="!bg-transparent !min-h-0"
        />
      </Card>
    </Card>
  );
});

RootTenantListPage.displayName = "RootTenantListPage";

// Wrapped component with theme provider
function RootTenantListPageWithProvider(props) {
  return (
    <UIXThemeProvider>
      <RootTenantListPage {...props} />
    </UIXThemeProvider>
  );
}

export default RootTenantListPageWithProvider;

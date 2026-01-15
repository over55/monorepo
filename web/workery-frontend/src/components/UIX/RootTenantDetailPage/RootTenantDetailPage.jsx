// File: src/components/UIX/RootTenantDetailPage/RootTenantDetailPage.jsx
// UIX Mobile Optimizations Applied
// Reusable Root Tenant Detail Page Component

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Alert,
  InfoCard,
  InfoField,
  PageHeader,
  BackToListButton,
  EditButton,
  Button,
  Spinner,
  Card,
  Badge,
  EmptyState,
} from "../index";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

/**
 * RootTenantDetailPage - Reusable Root Tenant Detail Page Component
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.authManager - Auth manager with isAuthenticated() method
 * @param {Function} config.tenantManager - Tenant manager with getTenantDetail() method
 * @param {React.Component} config.icon - Main icon for page
 * @param {React.Component} config.headerIcon - Icon for header
 * @param {string} config.idParam - URL parameter name for tenant ID (default: "tid")
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items (dynamic - receives tenant)
 * @param {Array} config.sections - Section configuration for displaying tenant info
 * @param {Object} config.routes - Route configuration {dashboard, list, edit, start}
 * @param {Array} config.actionButtons - Additional action buttons [{label, variant, icon, getTo}]
 * @param {Object} config.emptyState - Empty state configuration {icon, title, description}
 * @param {string} config.loginPath - Path to login page
 */
const RootTenantDetailPage = memo(({ config }) => {
  const params = useParams();
  const tenantId = params[config.idParam || "tid"];
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);

  // Use ref to track mounted state
  const mountedRef = useRef(true);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    bgDisabled: getThemeClasses("bg-disabled"),
    textSecondary: getThemeClasses("text-secondary"),
    textPrimary: getThemeClasses("text-primary"),
    textMuted: getThemeClasses("text-muted"),
  }), [getThemeClasses]);

  // Memoize onUnauthorized
  const onUnauthorized = useCallback(() => {
    navigate(`${config.loginPath || "/login"}?unauthorized=true`);
  }, [navigate, config.loginPath]);

  // Memoize fetchTenantDetail
  const fetchTenantDetail = useCallback(async (id) => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = await config.tenantManager.getTenantDetail(
        id,
        onUnauthorized,
      );

      if (!mountedRef.current) return;

      setTenant(tenantData);
    } catch (error) {
      if (!mountedRef.current) return;

      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [config.tenantManager, onUnauthorized]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (config.breadcrumbItems) {
      return typeof config.breadcrumbItems === "function"
        ? config.breadcrumbItems(tenant, tenantId)
        : config.breadcrumbItems;
    }
    return [
      {
        label: "Root Dashboard",
        href: config.routes?.dashboard || "/root/dashboard",
        icon: config.headerIcon || config.icon,
      },
      {
        label: "Tenants",
        href: config.routes?.list || "/root/tenants",
        icon: config.icon,
      },
      {
        label: "Detail",
        icon: InformationCircleIcon,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally using specific config properties to avoid re-renders when other config properties change
  }, [config.breadcrumbItems, config.routes, config.headerIcon, config.icon, tenant, tenantId]);

  // Memoize page header actions
  const pageHeaderActions = useMemo(() => [
    <EditButton
      key="edit"
      to={(config.routes?.edit || "/root/tenant/:id/edit").replace(":id", tenantId)}
    />,
  ], [config.routes, tenantId]);

  useEffect(() => {
    mountedRef.current = true;
    window.scrollTo(0, 0);

    if (!config.authManager.isAuthenticated()) {
      navigate(`${config.loginPath || "/login"}?unauthorized=true`);
      return;
    }

    if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
      setErrors({ tenantId: "Invalid tenant ID" });
      return;
    }

    fetchTenantDetail(tenantId);

    return () => {
      mountedRef.current = false;
    };
  }, [tenantId, config.authManager, config.loginPath, navigate, fetchTenantDetail]);

  if (isLoading) {
    return (
      <Card
        padding="p-0"
        className={`min-h-dvh flex items-center justify-center ${themeClasses.bgDisabled} px-4 border-0 shadow-none`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Card padding="p-0" className="text-center border-0 shadow-none">
          <Spinner className="mx-auto" />
          <Badge variant="default" size="md" className={`!bg-transparent mt-4 block ${themeClasses.textSecondary}`}>
            Loading Tenant Details...
          </Badge>
        </Card>
      </Card>
    );
  }

  return (
    <Card
      padding="p-0"
      className={`min-h-dvh ${themeClasses.bgDisabled} border-0 shadow-none`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Card padding="p-0" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-0 shadow-none">
        {/* Breadcrumb */}
        <Card padding="p-0" className="mb-6 border-0 shadow-none">
          <Breadcrumb items={breadcrumbItems} />
        </Card>

        {/* Page Header */}
        {tenant && (
          <PageHeader
            icon={config.icon}
            title={tenant.name || "Tenant Details"}
            subtitle={config.subtitle || "View and manage tenant information"}
            actions={pageHeaderActions}
          />
        )}

        {/* Error Alerts */}
        {errors.fetch && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.fetch}
          </Alert>
        )}
        {errors.tenantId && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.tenantId}
          </Alert>
        )}

        {/* Tenant Information */}
        {tenant && config.sections && (
          <Card padding="p-0" className="space-y-6 border-0 shadow-none">
            {config.sections.map((section, index) => (
              <InfoCard
                key={index}
                title={section.title}
                icon={section.icon}
                primarySections={[
                  {
                    component: (
                      <Card padding="p-0" className={`grid ${section.gridCols || "grid-cols-1 md:grid-cols-2"} gap-6 border-0 shadow-none`}>
                        {section.fields.map((field, fieldIndex) => (
                          <InfoField
                            key={fieldIndex}
                            label={field.label}
                            value={typeof field.accessor === "function"
                              ? field.accessor(tenant)
                              : tenant[field.accessor]}
                            icon={field.icon}
                            size={field.size || "md"}
                            className={field.className}
                          />
                        ))}
                      </Card>
                    ),
                  },
                ]}
                twoColumn={false}
                showAvatar={false}
              />
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        {tenant && (
          <Card padding="p-0" className="max-w-6xl mx-auto border-0 shadow-none">
            <Card padding="p-0" className="flex flex-row flex-wrap justify-between gap-3 pt-4 border-0 shadow-none">
              <BackToListButton to={config.routes?.list || "/root/tenants"} />
              <Card padding="p-0" className="flex flex-row gap-3 border-0 shadow-none">
                {config.actionButtons && config.actionButtons.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "primary"}
                    icon={action.icon}
                    onClick={() => navigate(
                      typeof action.getTo === "function"
                        ? action.getTo(tenantId)
                        : action.to?.replace(":id", tenantId)
                    )}
                  >
                    {action.label}
                  </Button>
                ))}
                <EditButton to={(config.routes?.edit || "/root/tenant/:id/edit").replace(":id", tenantId)} />
              </Card>
            </Card>
          </Card>
        )}

        {/* Not Found State */}
        {!tenant && !isLoading && (
          <EmptyState
            icon={config.emptyState?.icon || config.icon}
            title={config.emptyState?.title || "Tenant Not Found"}
            description={config.emptyState?.description || "The requested tenant could not be found."}
            action={<BackToListButton to={config.routes?.list || "/root/tenants"} label="Back to Tenants" />}
            className="py-12"
          />
        )}
      </Card>
    </Card>
  );
});

RootTenantDetailPage.displayName = "RootTenantDetailPage";

// Wrapped component with theme provider
function RootTenantDetailPageWithProvider(props) {
  return (
    <UIXThemeProvider>
      <RootTenantDetailPage {...props} />
    </UIXThemeProvider>
  );
}

export default RootTenantDetailPageWithProvider;

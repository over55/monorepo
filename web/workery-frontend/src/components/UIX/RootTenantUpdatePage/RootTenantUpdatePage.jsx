// File: src/components/UIX/RootTenantUpdatePage/RootTenantUpdatePage.jsx
// UIX Mobile Optimizations Applied
// Reusable Root Tenant Update Page Component

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Card,
  Button,
  Alert,
  Breadcrumb,
  Input,
  Textarea,
  Select,
  Badge,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../index";
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

/**
 * RootTenantUpdatePage - Reusable Root Tenant Update Page Component
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.authManager - Auth manager with isAuthenticated() method
 * @param {Function} config.tenantManager - Tenant manager with getTenantDetail() and updateTenant() methods
 * @param {React.Component} config.icon - Main icon for page
 * @param {React.Component} config.headerIcon - Icon for header
 * @param {string} config.idParam - URL parameter name for tenant ID (default: "tid")
 * @param {string} config.title - Page title
 * @param {string} config.subtitle - Page subtitle
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items (dynamic - receives tenant, tenantId)
 * @param {Array} config.formSections - Form sections configuration
 * @param {Function} config.validateForm - Custom validation function
 * @param {Function} config.formatDataFromResponse - Format data from API response
 * @param {Function} config.formatDataForSubmit - Format data before submission
 * @param {Object} config.routes - Route configuration {dashboard, list, detail}
 * @param {string} config.loginPath - Path to login page
 */
const RootTenantUpdatePage = memo(({ config }) => {
  const params = useParams();
  const tenantId = params[config.idParam || "tid"];
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({});

  // Ref for mounted state
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    sectionTitle: getThemeClasses("text-primary"),
    headerIcon: getThemeClasses("link-primary"),
    linkSecondary: getThemeClasses("link-secondary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    textPrimary: getThemeClasses("text-primary"),
    borderSecondary: getThemeClasses("border-secondary"),
    bgDisabled: getThemeClasses("bg-disabled"),
    bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
    bgCard: getThemeClasses("bg-card"),
    cardBorder: getThemeClasses("card-border"),
  }), [getThemeClasses]);

  const onUnauthorized = useCallback(() => {
    navigate(`${config.loginPath || "/login"}?unauthorized=true`);
  }, [navigate, config.loginPath]);

  // Fetch tenant detail
  const fetchTenantDetail = useCallback(async (id) => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = await config.tenantManager.getTenantDetail(id, onUnauthorized);

      if (!mountedRef.current) return;

      setTenant(tenantData);

      // Format data from response
      const formatted = config.formatDataFromResponse
        ? config.formatDataFromResponse(tenantData)
        : tenantData;

      setFormData(formatted);
    } catch (error) {
      if (!mountedRef.current) return;

      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally using specific config properties (tenantManager, formatDataFromResponse) to avoid re-creating callback when other config properties change
  }, [config.tenantManager, config.formatDataFromResponse, onUnauthorized]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    setErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    if (config.validateForm) {
      return config.validateForm(formData);
    }
    return {};
  }, [config, formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData = config.formatDataForSubmit
        ? config.formatDataForSubmit(formData, tenantId)
        : { ...formData, id: tenantId };

      if (import.meta.env.DEV) {
        console.log("RootTenantUpdatePage: Updating tenant:", submitData);
      }

      await config.tenantManager.updateTenant(tenantId, submitData, onUnauthorized);

      if (import.meta.env.DEV) {
        console.log("RootTenantUpdatePage: Tenant updated successfully");
      }

      const detailPath = (config.routes?.detail || "/root/tenant/:id").replace(":id", tenantId);
      navigate(detailPath);
    } catch (error) {
      if (!mountedRef.current) return;

      if (import.meta.env.DEV) {
        console.error("RootTenantUpdatePage: Failed to update tenant:", error);
      }
      setErrors({ submit: error.message || "Failed to update tenant" });
      window.scrollTo(0, 0);
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateForm, config, tenantId, onUnauthorized, navigate]);

  useEffect(() => {
    mountedRef.current = true;
    window.scrollTo(0, 0);

    if (!config.authManager.isAuthenticated()) {
      navigate(`${config.loginPath || "/login"}?unauthorized=true`);
      return;
    }

    if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
      setErrors({ tenantId: "Invalid tenant ID" });
      setIsLoading(false);
      return;
    }

    fetchTenantDetail(tenantId);

    return () => {
      mountedRef.current = false;
    };
  }, [tenantId, config.authManager, config.loginPath, navigate, fetchTenantDetail]);

  // Memoized breadcrumb items
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
        href: (config.routes?.detail || "/root/tenant/:id").replace(":id", tenantId),
        icon: config.icon,
      },
      {
        label: "Edit",
        icon: PencilIcon,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally using specific config properties to avoid re-renders when other config properties change
  }, [config.breadcrumbItems, config.routes, config.headerIcon, config.icon, tenant, tenantId]);

  const HeaderIcon = config.headerIcon || config.icon;

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
      className={`min-h-dvh ${themeClasses.bgGradientPrimary} border-0 shadow-none`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <Card padding="p-0" className={`${themeClasses.bgCard} shadow-sm border-x-0 border-t-0 border-b ${themeClasses.cardBorder} rounded-none`}>
        <Card padding="p-0" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-0 shadow-none bg-transparent">
          <Card padding="p-0" className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-2 sm:gap-4 border-0 shadow-none bg-transparent">
            <Card padding="p-0" className="flex items-center space-x-3 border-0 shadow-none bg-transparent">
              <HeaderIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${themeClasses.headerIcon} flex-shrink-0`} />
              <Card padding="p-0" className="min-w-0 border-0 shadow-none bg-transparent">
                <Badge variant="default" size="lg" className={`!bg-transparent text-lg sm:text-xl font-semibold ${themeClasses.textPrimary} truncate block`}>
                  {config.title || "Edit Tenant"}
                </Badge>
                <Badge variant="default" size="sm" className={`!bg-transparent text-xs sm:text-sm ${themeClasses.textSecondary} mt-0.5 sm:mt-1 block`}>
                  {config.subtitle || "Update organization information"}
                </Badge>
              </Card>
            </Card>
          </Card>
        </Card>
      </Card>

      {/* Main Content */}
      <Card padding="p-0" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-0 shadow-none bg-transparent">
        {/* Breadcrumb - Hidden on mobile, shown on tablet+ */}
        <Card padding="p-0" className="hidden sm:block mb-4 lg:mb-6 border-0 shadow-none">
          <Breadcrumb items={breadcrumbItems} />
        </Card>

        {/* Mobile breadcrumb - Simplified */}
        <Card padding="p-0" className="sm:hidden mb-4 border-0 shadow-none">
          <Link
            to={(config.routes?.detail || "/root/tenant/:id").replace(":id", tenantId)}
            className={`inline-flex items-center text-sm ${themeClasses.linkSecondary}`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            <Badge variant="default" size="sm" className="!bg-transparent">
              Back to Details
            </Badge>
          </Link>
        </Card>

        <Card className="p-4 sm:p-6 lg:p-8">
          {/* Error Alerts */}
          {errors.submit && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, submit: null })}
              className="mb-4"
            >
              {errors.submit}
            </Alert>
          )}
          {errors.fetch && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setErrors({ ...errors, fetch: null })}
              className="mb-4"
            >
              {errors.fetch}
            </Alert>
          )}

          <Card padding="p-0" as="form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 border-0 shadow-none">
            {/* Dynamic Form Sections */}
            {config.formSections && config.formSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} padding="p-0" className="border-0 shadow-none bg-transparent">
                <Card padding="p-0" className={`border-b ${themeClasses.borderSecondary} pb-3 sm:pb-4 mb-4 sm:mb-6 border-t-0 border-x-0 shadow-none bg-transparent`}>
                  <Card padding="p-0" className="flex items-center space-x-2 border-0 shadow-none bg-transparent">
                    <section.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${themeClasses.textMuted}`} />
                    <Badge variant="default" size="lg" className={`!bg-transparent font-semibold ${themeClasses.sectionTitle}`}>
                      {section.title}
                    </Badge>
                  </Card>
                </Card>

                <Card padding="p-0" className={`grid ${section.gridCols || "grid-cols-1 lg:grid-cols-2"} gap-4 sm:gap-6 max-w-5xl border-0 shadow-none`}>
                  {section.fields.map((field, fieldIndex) => (
                    <Card key={fieldIndex} padding="p-0" className={`${field.colSpan || "col-span-1"} border-0 shadow-none`}>
                      {field.type === "textarea" ? (
                        <Textarea
                          label={field.label}
                          value={formData[field.name] || ""}
                          onChange={(value) => handleFieldChange(field.name, value)}
                          placeholder={field.placeholder}
                          rows={field.rows || 4}
                          maxLength={field.maxLength}
                          error={errors[field.name]}
                          required={field.required}
                          disabled={isSubmitting || field.disabled}
                          helperText={field.helperText}
                          className="w-full"
                        />
                      ) : field.type === "select" ? (
                        <Select
                          label={field.label}
                          value={formData[field.name] || ""}
                          onChange={(value) => handleFieldChange(field.name, value)}
                          options={field.options}
                          error={errors[field.name]}
                          required={field.required}
                          disabled={isSubmitting || field.disabled}
                          className="w-full"
                        />
                      ) : (
                        <Input
                          label={field.label}
                          type={field.type || "text"}
                          value={formData[field.name] || ""}
                          onChange={(value) => handleFieldChange(field.name, value)}
                          placeholder={field.placeholder}
                          error={errors[field.name]}
                          required={field.required}
                          disabled={isSubmitting || field.disabled}
                          icon={field.icon}
                          helperText={field.helperText}
                          className="w-full"
                        />
                      )}
                    </Card>
                  ))}
                </Card>
              </Card>
            ))}

            {/* Form Actions */}
            <Card padding="p-0" className={`flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 sm:pt-6 border-t ${themeClasses.borderSecondary} border-x-0 border-b-0 shadow-none`}>
              <Link to={(config.routes?.detail || "/root/tenant/:id").replace(":id", tenantId)} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  icon={ArrowLeftIcon}
                  type="button"
                  fullWidth
                  className="justify-center"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                variant="success"
                disabled={isSubmitting}
                loading={isSubmitting}
                icon={CheckCircleIcon}
                className="w-full sm:w-auto justify-center"
              >
                {isSubmitting ? "Saving..." : (config.submitLabel || "Save Changes")}
              </Button>
            </Card>
          </Card>
        </Card>
      </Card>
    </Card>
  );
});

RootTenantUpdatePage.displayName = "RootTenantUpdatePage";

// Wrapped component with theme provider
function RootTenantUpdatePageWithProvider(props) {
  return (
    <UIXThemeProvider>
      <RootTenantUpdatePage {...props} />
    </UIXThemeProvider>
  );
}

export default RootTenantUpdatePageWithProvider;

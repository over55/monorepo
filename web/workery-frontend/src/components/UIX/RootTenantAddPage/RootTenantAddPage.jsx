// File: src/components/UIX/RootTenantAddPage/RootTenantAddPage.jsx
// UIX Mobile Optimizations Applied
// Reusable Root Tenant Add Page Component

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  Button,
  Alert,
  Breadcrumb,
  Input,
  Textarea,
  Select,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../index";
import {
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

/**
 * RootTenantAddPage - Reusable Root Tenant Add Page Component
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.authManager - Auth manager with isAuthenticated() method
 * @param {Function} config.tenantManager - Tenant manager with createTenant() method
 * @param {React.Component} config.icon - Main icon for page
 * @param {React.Component} config.headerIcon - Icon for header
 * @param {string} config.title - Page title
 * @param {string} config.subtitle - Page subtitle
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items
 * @param {Array} config.formSections - Form sections configuration
 * @param {Object} config.initialFormData - Initial form data
 * @param {Function} config.validateForm - Custom validation function
 * @param {Function} config.formatDataForSubmit - Format data before submission
 * @param {Object} config.routes - Route configuration {dashboard, list, detail}
 * @param {string} config.loginPath - Path to login page
 */
const RootTenantAddPage = memo(({ config }) => {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(config.initialFormData || {});

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
    bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
    bgCard: getThemeClasses("bg-card"),
    cardBorder: getThemeClasses("card-border"),
  }), [getThemeClasses]);

  const onUnauthorized = useCallback(() => {
    navigate(`${config.loginPath || "/login"}?unauthorized=true`);
  }, [navigate, config.loginPath]);

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

    setIsLoading(true);
    setErrors({});

    try {
      const submitData = config.formatDataForSubmit
        ? config.formatDataForSubmit(formData)
        : formData;

      if (import.meta.env.DEV) {
        console.log("RootTenantAddPage: Creating new tenant:", submitData);
      }

      const createdTenant = await config.tenantManager.createTenant(submitData, onUnauthorized);

      if (import.meta.env.DEV) {
        console.log("RootTenantAddPage: Tenant created successfully:", createdTenant);
      }

      const detailPath = (config.routes?.detail || "/root/tenant/:id").replace(":id", createdTenant.id);
      navigate(detailPath);
    } catch (error) {
      if (!mountedRef.current) return;

      if (import.meta.env.DEV) {
        console.error("RootTenantAddPage: Failed to create tenant:", error);
      }
      setErrors({ submit: error.message || "Failed to create tenant" });
      window.scrollTo(0, 0);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [formData, validateForm, config, onUnauthorized, navigate]);

  useEffect(() => {
    mountedRef.current = true;
    window.scrollTo(0, 0);

    if (!config.authManager.isAuthenticated()) {
      navigate(`${config.loginPath || "/login"}?unauthorized=true`);
      return;
    }

    return () => {
      mountedRef.current = false;
    };
  }, [config.authManager, config.loginPath, navigate]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (config.breadcrumbItems) {
      return config.breadcrumbItems;
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
        label: "Add New",
        icon: PlusIcon,
      },
    ];
  }, [config.breadcrumbItems, config.routes, config.headerIcon, config.icon]);

  const HeaderIcon = config.headerIcon || config.icon;

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
                  {config.title || "Create New Tenant"}
                </Badge>
                <Badge variant="default" size="sm" className={`!bg-transparent text-xs sm:text-sm ${themeClasses.textSecondary} mt-0.5 sm:mt-1 block`}>
                  {config.subtitle || "Add a new organization to the system"}
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
            to={config.routes?.list || "/root/tenants"}
            className={`inline-flex items-center text-sm ${themeClasses.linkSecondary}`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            <Badge variant="default" size="sm" className="!bg-transparent">
              Back to Tenants
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

          <Card padding="p-0" as="form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 border-0 shadow-none">
            {/* Dynamic Form Sections */}
            {config.formSections && config.formSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} padding="p-0" className="border-0 shadow-none">
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
              <Link to={config.routes?.list || "/root/tenants"} className="w-full sm:w-auto">
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
                disabled={isLoading}
                loading={isLoading}
                icon={PlusIcon}
                className="w-full sm:w-auto justify-center"
              >
                {isLoading ? "Creating..." : (config.submitLabel || "Create Tenant")}
              </Button>
            </Card>
          </Card>
        </Card>
      </Card>
    </Card>
  );
});

RootTenantAddPage.displayName = "RootTenantAddPage";

// Wrapped component with theme provider
function RootTenantAddPageWithProvider(props) {
  return (
    <UIXThemeProvider>
      <RootTenantAddPage {...props} />
    </UIXThemeProvider>
  );
}

export default RootTenantAddPageWithProvider;

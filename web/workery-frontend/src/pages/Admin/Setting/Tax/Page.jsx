// File Path: web/workery-frontend/src/pages/Admin/Setting/Tax/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTenantManager, useAccountManager } from "../../../../services/Services";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  PageHeader,
  FormCard,
  Alert,
  Button,
  Input,
  InfoField,
  SystemInfo,
  BackToListButton,
  Card,
  Loading,
  LoadingOverlay,
} from "../../../../components/UIX";
import {
  BanknotesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

function SettingTaxPage() {
  return (
    <UIXThemeProvider>
      <SettingTaxPageContent />
    </UIXThemeProvider>
  );
}

const SettingTaxPageContent = memo(
  function SettingTaxPageContent() {
    const { getThemeClasses } = useUIXTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const tenantManager = useTenantManager();
    const accountManager = useAccountManager();

    // Form state
    const [formData, setFormData] = useState({
      taxRate: "",
    });

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [tenant, setTenant] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [originalTaxRate, setOriginalTaxRate] = useState("");

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        bgGradientPrimary: getThemeClasses('bg-gradient-primary'),
        bgSecondary: getThemeClasses('bg-secondary'),
        loadingSpinner: getThemeClasses('loading-spinner'),
        alertInfoBg: getThemeClasses('alert-info-bg'),
        borderPrimary: getThemeClasses('border-primary'),
        textPrimary: getThemeClasses('text-primary'),
        textSecondary: getThemeClasses('text-secondary'),
        accentText: getThemeClasses('text-accent'),
      }),
      [getThemeClasses],
    );

    const onUnauthorized = useCallback(() => {
      navigate("/login?unauthorized=true");
    }, [navigate]);

    // Load existing tax data
    const loadTaxData = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First get current user
        const userData = await accountManager.getAccountDetail(onUnauthorized);
        setCurrentUser(userData);

        if (!userData || !userData.tenantId) {
          throw new Error("User does not have a valid tenant ID");
        }

        // Then get tenant details using user's tenant ID
        const tenantData = await tenantManager.getTenantDetail(
          userData.tenantId,
          onUnauthorized,
        );

        setTenant(tenantData);
        const taxRateValue = (tenantData.taxRate || 0).toString();
        setFormData({
          taxRate: taxRateValue,
        });
        setOriginalTaxRate(taxRateValue);

        if (import.meta.env.DEV) {
          console.log("TaxPage: Tax data loaded successfully:", {
            taxRate: tenantData.taxRate,
            tenantId: tenantData.id,
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("TaxPage: Failed to load tax data:", err);
        }
        setError(err.message || "Failed to load tax settings");
      } finally {
        setIsLoading(false);
      }
    }, [accountManager, tenantManager, onUnauthorized]);

    // Load data on component mount
    useEffect(() => {
      window.scrollTo(0, 0);
      loadTaxData();
    }, [loadTaxData]);

    // Handle input change
    const handleInputChange = useCallback((value) => {
      setFormData((prev) => ({
        ...prev,
        taxRate: value,
      }));

      // Clear validation error for this field when user starts typing
      setValidationErrors((prev) => {
        if (prev.taxRate) {
          return {
            ...prev,
            taxRate: null,
          };
        }
        return prev;
      });
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
      const errors = {};

      // Validate tax rate (required, numeric, range)
      if (!formData.taxRate || !formData.taxRate.toString().trim()) {
        errors.taxRate = "Tax rate is required";
      } else {
        const taxRateNum = parseFloat(formData.taxRate);
        if (isNaN(taxRateNum)) {
          errors.taxRate = "Tax rate must be a valid number";
        } else if (taxRateNum < 0) {
          errors.taxRate = "Tax rate cannot be negative";
        } else if (taxRateNum > 100) {
          errors.taxRate = "Tax rate cannot exceed 100%";
        }
      }

      return errors;
    }, [formData.taxRate]);

    // Handle submit
    const handleSubmit = useCallback(async () => {
      // Clear previous errors
      setError(null);
      setValidationErrors({});

      // Check if tenant data is available
      if (!currentUser || !currentUser.tenantId) {
        setError("Tenant information not available. Please refresh the page.");
        return;
      }

      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError("Please correct the errors below");
        window.scrollTo(0, 0);
        return;
      }

      try {
        setIsSubmitting(true);

        // Prepare data for API - using Workery's API structure
        const taxRateData = {
          tenantId: currentUser.tenantId,
          taxRate: parseFloat(formData.taxRate),
        };

        if (import.meta.env.DEV) {
          console.log("TaxPage: Submitting tax rate update:", taxRateData);
        }

        // Update tax rate using Workery's existing API
        await tenantManager.updateTaxRate(taxRateData, onUnauthorized);

        if (import.meta.env.DEV) {
          console.log("TaxPage: Tax rate updated successfully");
        }

        // Update original value and exit edit mode
        setOriginalTaxRate(formData.taxRate);
        setIsEditing(false);
        setSuccessMessage("Tax rate updated successfully!");

        // Reload tenant data to get updated timestamps
        await loadTaxData();

        window.scrollTo(0, 0);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("TaxPage: Failed to update tax rate:", err);
        }

        // Handle validation errors from API
        if (err && typeof err === "object" && !err.message) {
          setValidationErrors(err);
          setError("Please correct the errors below");
        } else {
          setError(err.message || "Failed to update tax rate");
        }
        window.scrollTo(0, 0);
      } finally {
        setIsSubmitting(false);
      }
    }, [currentUser, validateForm, formData.taxRate, tenantManager, onUnauthorized, loadTaxData]);

    // Handle cancel
    const handleCancel = useCallback(() => {
      // Reset form to original value
      setFormData({ taxRate: originalTaxRate });
      setValidationErrors({});
      setError(null);
      setIsEditing(false);
    }, [originalTaxRate]);

    // Handle edit mode toggle
    const handleEdit = useCallback(() => {
      setIsEditing(true);
      setError(null);
      setSuccessMessage("");
    }, []);

    // Handle success message from navigation state
    useEffect(() => {
      if (location.state?.successMessage) {
        setSuccessMessage(location.state.successMessage);
        // Clear the state
        window.history.replaceState({}, document.title);
      }
    }, [location]);

    // Auto-clear success message
    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => setSuccessMessage(""), 5000);
        return () => clearTimeout(timer);
      }
    }, [successMessage]);

    // Memoize breadcrumb items
    const breadcrumbItems = useMemo(
      () => [
        {
          label: 'Dashboard',
          to: '/admin/dashboard',
          icon: ChartBarIcon
        },
        {
          label: 'Settings',
          to: '/admin/settings',
          icon: Cog6ToothIcon
        },
        {
          label: 'Tax Settings',
          icon: BanknotesIcon,
          isActive: true
        }
      ],
      [],
    );

    // Memoize page header actions
    const pageHeaderActions = useMemo(
      () => [
        <BackToListButton
          key="back-to-settings"
          onClick={() => navigate("/admin/settings")}
        />
      ],
      [navigate],
    );

    // Memoize information box content
    const informationBox = useMemo(
      () => (
        <Card padding="p-4" className={`${themeClasses.alertInfoBg} rounded-xl border ${themeClasses.borderPrimary} shadow-none`}>
          <Card padding="p-0" className="flex items-start border-0 shadow-none bg-transparent">
            <InformationCircleIcon className={`w-5 h-5 ${themeClasses.textPrimary} mr-2 flex-shrink-0 mt-0.5`} />
            <Card padding="p-0" className="border-0 shadow-none bg-transparent">
              <h4 className={`text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                About Tax Rate
              </h4>
              <p className={`${themeClasses.textPrimary} text-sm`}>
                This tax rate is applied to every order if the user has a tax account configured.
                The rate is a percentage value between 0 and 100.
              </p>
            </Card>
          </Card>
        </Card>
      ),
      [themeClasses],
    );

    // Loading state
    if (isLoading) {
      return (
        <Card padding="p-0" className={`min-h-screen ${themeClasses.bgSecondary} flex items-center justify-center border-0 shadow-none`}>
          <Loading size="lg" text="Loading tax settings..." />
        </Card>
      );
    }

    // Error state - if can't load initial data
    if (error && !tenant) {
      return (
        <Card padding="p-0" className={`min-h-screen ${themeClasses.bgSecondary} p-8 border-0 shadow-none`}>
          <Card padding="p-0" className="max-w-2xl mx-auto border-0 shadow-none bg-transparent">
            <Alert
              type="error"
              message={error}
              className="mb-4"
            />
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/settings")}
              icon={Cog6ToothIcon}
            >
              Back to Settings
            </Button>
          </Card>
        </Card>
      );
    }

    return (
      <Card padding="p-0" className={`min-h-screen ${themeClasses.bgGradientPrimary} border-0 shadow-none`}>
        <Card padding="p-0" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-0 shadow-none bg-transparent">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          <PageHeader
            icon={BanknotesIcon}
            title="Tax Settings"
            subtitle="Manage the global tax rate for order calculations"
            actions={pageHeaderActions}
          />

          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage("")}
              className="mb-6"
            />
          )}

          {error && tenant && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          <FormCard
            title={isEditing ? "Edit Tax Rate" : "Tax Rate Configuration"}
            icon={BanknotesIcon}
            actions={
              isEditing ? (
                <Card padding="p-0" className="flex items-center gap-4 border-0 shadow-none bg-transparent">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    icon={XMarkIcon}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    icon={CheckCircleIcon}
                  >
                    Save Changes
                  </Button>
                </Card>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleEdit}
                  icon={PencilSquareIcon}
                >
                  Edit Tax Rate
                </Button>
              )
            }
          >
            <Card padding="p-0" className="space-y-6 border-0 shadow-none bg-transparent">
              {/* Tax Rate Field */}
              {isEditing ? (
                <Input
                  label="Tax Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  placeholder="Enter tax rate (e.g., 8.25)"
                  disabled={isSubmitting}
                  required
                  error={validationErrors.taxRate}
                  size="lg"
                  helperText="Tax rate percentage applied to orders (0-100). Enter 8.25 for 8.25% tax rate."
                />
              ) : (
                <InfoField
                  label="Current Tax Rate"
                  value={
                    <span className={`text-3xl font-bold ${themeClasses.accentText}`}>
                      {tenant?.taxRate || 0}%
                    </span>
                  }
                />
              )}

              {/* Information Box */}
              {informationBox}

              {/* System Information - only show in view mode */}
              {!isEditing && tenant && (
                <SystemInfo
                  createdAt={tenant.createdAt}
                  createdByUserName={tenant.createdByUserName}
                  createdFromIpAddress={tenant.createdFromIpAddress}
                  modifiedAt={tenant.modifiedAt}
                  modifiedByUserName={tenant.modifiedByUserName}
                  modifiedFromIpAddress={tenant.modifiedFromIpAddress}
                />
              )}
            </Card>
          </FormCard>

          {/* Loading Overlay */}
          <LoadingOverlay
            isLoading={isSubmitting}
            title="Updating Tax Rate..."
            subtitle="Please wait while we save your changes."
          />
        </Card>
      </Card>
    );
  },
);

SettingTaxPageContent.displayName = "SettingTaxPageContent";

export default SettingTaxPage;

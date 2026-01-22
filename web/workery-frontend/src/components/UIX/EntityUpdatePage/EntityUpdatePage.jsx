// File: src/components/UIX/EntityUpdatePage/EntityUpdatePage.jsx
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  FormCard,
  FormSection,
  Button,
  Breadcrumb,
  PageHeader,
  Tabs,
  UIXThemeProvider,
} from "../index";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Conditional logging for development only
const DEBUG = process.env.NODE_ENV === 'development';
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => DEBUG && console.error(...args);
const warn = (...args) => DEBUG && console.warn(...args);

/**
 * Reusable Entity Update Page Component
 * Generic update page that can be configured for any entity type
 *
 * @param {Object} config - Configuration object for the entity
 * @param {string} config.entityName - Display name (e.g., "Staff Member", "Organization")
 * @param {string} config.entityType - Entity type for routes (e.g., "staff", "organization")
 * @param {string} config.idParam - URL parameter name for entity ID (e.g., "aid", "id")
 * @param {React.Component} config.icon - Icon component for headers/breadcrumbs
 * @param {Object} config.manager - Entity manager with CRUD methods
 * @param {Array} config.breadcrumbItems - Custom breadcrumb configuration
 * @param {Array} config.tabItems - Tab navigation configuration
 * @param {Array} config.formSections - Form sections configuration
 * @param {Function} config.validateForm - Custom validation function
 * @param {Function} config.formatDataForSubmit - Format data before submission
 * @param {Function} config.formatDataFromResponse - Format data from API response
 * @param {Function} config.onUnauthorized - Unauthorized access handler
 */
function EntityUpdatePage({ config }) {
  log("====== EntityUpdatePage: COMPONENT RENDER START ======");
  log("EntityUpdatePage: Received config:", {
    entityName: config.entityName,
    idParam: config.idParam,
    hasManager: !!config.manager,
    hasGetDetail: !!config.manager?.getDetail,
    hasFormatDataFromResponse: !!config.formatDataFromResponse,
  });

  const { [config.idParam]: entityId } = useParams();
  log("EntityUpdatePage: Extracted entityId from params:", entityId);

  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Use refs to track component lifecycle and cleanup
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const navigationTimeoutRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entity, setEntity] = useState(null);
  const [formData, setFormData] = useState(() => config.initialFormData || {});

  log("EntityUpdatePage: Current state:", {
    isLoading,
    hasEntity: !!entity,
    hasErrors: Object.keys(errors).length > 0,
    hasAlert: !!alert,
  });

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    if (config.onUnauthorized) {
      config.onUnauthorized();
    } else {
      navigate("/login?unauthorized=true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.onUnauthorized, navigate]);

  // Memoized alert setter with auto-cleanup
  const setAlertWithCleanup = useCallback((alertData) => {
    // Clear any existing alert timeout
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }

    setAlert(alertData);

    // Auto-clear success alerts after 5 seconds
    if (alertData && alertData.type === "success") {
      alertTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setAlert(null);
        }
      }, 5000);
    }
  }, []);

  // Debug: Track isLoading changes
  useEffect(() => {
    log("EntityUpdatePage: *** isLoading STATE CHANGED ***:", isLoading);
  }, [isLoading]);

  // Debug: Track formData changes
  useEffect(() => {
    log("EntityUpdatePage: *** formData STATE CHANGED ***:", formData);
  }, [formData]);

  // Load entity data on mount
  useEffect(() => {
    log("EntityUpdatePage: useEffect TRIGGERED");
    log("EntityUpdatePage: entityId:", entityId);
    log("EntityUpdatePage: config.manager:", !!config.manager);
    log("EntityUpdatePage: config.manager.getDetail:", !!config.manager?.getDetail);

    // IMPORTANT: Reset mounted flag at start of effect
    // This handles React 19 Strict Mode double-mounting
    isMountedRef.current = true;
    log("EntityUpdatePage: Set isMountedRef.current = true");

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchEntityDetail = async () => {
      log("EntityUpdatePage: fetchEntityDetail STARTING");

      if (!entityId) {
        error("EntityUpdatePage: No entityId provided!");
        setAlertWithCleanup({
          type: "error",
          message: `Invalid ${config.entityName.toLowerCase()} ID`,
        });
        setIsLoading(false);
        return;
      }

      log("EntityUpdatePage: Setting isLoading to true");
      setIsLoading(true);
      setErrors({});

      try {
        log("EntityUpdatePage: About to call config.manager.getDetail");
        log("EntityUpdatePage: Calling with entityId:", entityId);

        // Pass abort signal to manager if supported
        const response = await config.manager.getDetail(
          entityId,
          onUnauthorized,
          { signal: abortControllerRef.current?.signal },
        );

        log("EntityUpdatePage: API call completed");
        log("EntityUpdatePage: Response received:", response);
        log("EntityUpdatePage: isMountedRef.current:", isMountedRef.current);

        if (isMountedRef.current) {
          log("EntityUpdatePage: Component still mounted, processing response");
          setEntity(response);
          log("EntityUpdatePage: Entity set");

          // Format data from response if formatter provided
          log("EntityUpdatePage: Has formatter?", !!config.formatDataFromResponse);
          const formatted = config.formatDataFromResponse
            ? config.formatDataFromResponse(response)
            : response;

          log("EntityUpdatePage: Formatted data:", formatted);
          log("EntityUpdatePage: Setting formData");
          setFormData(formatted);
          log("EntityUpdatePage: Setting isLoading to FALSE");
          setIsLoading(false);
          log("EntityUpdatePage: Load complete!");
        } else {
          warn("EntityUpdatePage: Component unmounted, skipping state updates");
        }
      } catch (error) {
        error("EntityUpdatePage: Error occurred:", error);
        error("EntityUpdatePage: Error name:", error.name);
        error("EntityUpdatePage: Error message:", error.message);
        error("EntityUpdatePage: Error stack:", error.stack);

        // Ignore abort errors
        if (error.name === "AbortError") {
          log("EntityUpdatePage: Abort error, ignoring");
          return;
        }

        if (isMountedRef.current) {
          log("EntityUpdatePage: Setting error alert");
          setAlertWithCleanup({
            type: "error",
            message: `Failed to load ${config.entityName.toLowerCase()} details. Please try again.`,
          });
          log("EntityUpdatePage: Setting isLoading to FALSE (error case)");
          setIsLoading(false);
        }
      }
    };

    log("EntityUpdatePage: About to call fetchEntityDetail");
    fetchEntityDetail();

    // Cleanup function
    return () => {
      log("EntityUpdatePage: useEffect CLEANUP running");
      // Mark as unmounted for this effect run
      isMountedRef.current = false;
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // We intentionally list only the specific config properties used in this effect
    // rather than the entire config object to avoid unnecessary re-fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entityId,
    config.manager,
    config.entityName,
    config.formatDataFromResponse,
    onUnauthorized,
    setAlertWithCleanup,
  ]);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear specific field error if it exists
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // Memoized form submission handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Clear any existing navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }

      setAlertWithCleanup(null);

      // Validate form if validator provided
      const formErrors = config.validateForm
        ? config.validateForm(formData)
        : {};
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setAlertWithCleanup({
          type: "error",
          message: "Please correct the errors in the form before submitting.",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      // Format data for submission if formatter provided
      const submitData = config.formatDataForSubmit
        ? config.formatDataForSubmit(formData, entityId)
        : { ...formData, id: entityId };

      try {
        await config.manager.update(entityId, submitData, onUnauthorized);

        setAlertWithCleanup({
          type: "success",
          message: `${config.entityName} updated successfully!`,
        });

        // Navigate after delay with cleanup
        navigationTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            navigate(`/admin/${config.entityType}/${entityId}`);
          }
        }, 2000);
      } catch (error) {
        // Handle errors
        if (error && typeof error === "object" && !error.message) {
          setErrors(error);
          setAlertWithCleanup({
            type: "error",
            message: `Failed to update ${config.entityName.toLowerCase()}. Please check the form and try again.`,
          });
        } else {
          setAlertWithCleanup({
            type: "error",
            message:
              error?.message ||
              "An unexpected error occurred. Please try again.",
          });
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [config, formData, entityId, navigate, onUnauthorized, setAlertWithCleanup],
  );

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (config.breadcrumbItems) {
      // Process placeholder replacements in custom breadcrumb items
      return config.breadcrumbItems.map((item) => ({
        ...item,
        to: item.to ? item.to.replace(`{${config.idParam}}`, entityId) : item.to,
      }));
    }

    return [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: config.dashboardIcon,
      },
      {
        label: config.entityName + "s",
        to: `/admin/${config.entityType}`,
        icon: config.icon,
      },
      {
        label: "Detail",
        to: `/admin/${config.entityType}/${entityId}`,
        icon: config.detailIcon,
      },
      {
        label: "Update",
        icon: config.updateIcon,
        isActive: true,
      },
    ];
  }, [config, entityId]);

  // Memoized tab items
  const tabItems = useMemo(() => {
    if (config.tabItems) {
      return config.tabItems.map((tab) => ({
        ...tab,
        to: tab.to ? tab.to.replace(`{${config.idParam}}`, entityId) : tab.to,
      }));
    }

    return [
      {
        label: "Summary",
        to: `/admin/${config.entityType}/${entityId}`,
      },
      {
        label: "Detail",
        to: `/admin/${config.entityType}/${entityId}/detail`,
      },
      {
        label: "Comments",
        to: `/admin/${config.entityType}/${entityId}/comments`,
      },
      {
        label: "Attachments",
        to: `/admin/${config.entityType}/${entityId}/attachments`,
      },
      {
        label: "Update",
        isActive: true,
      },
    ];
  }, [config.tabItems, config.entityType, config.idParam, entityId]);

  // Memoized alert close handler
  const handleAlertClose = useCallback(() => {
    setAlertWithCleanup(null);
  }, [setAlertWithCleanup]);

  // Memoized back button handler
  const handleBackClick = useCallback(() => {
    navigate(`/admin/${config.entityType}/${entityId}`);
  }, [navigate, config.entityType, entityId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Clear any pending timeouts
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }

      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <UIXThemeProvider>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
          style={{
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div
                className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeClasses("border-primary")} mx-auto`}
              ></div>
              <p
                className={`mt-4 text-sm sm:text-base ${getThemeClasses("text-muted")}`}
              >
                Loading {config.entityName.toLowerCase()} details...
              </p>
            </div>
          </div>
        </div>
      </UIXThemeProvider>
    );
  }

  return (
    <UIXThemeProvider>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          icon={config.icon}
          title={`${config.entityName} - Update`}
          subtitle={`Update ${config.entityName.toLowerCase()} information`}
        />

        {/* Tab Navigation */}
        <div
          className={`${getThemeClasses("card-bg")} ${getThemeClasses("card-shadow")} rounded-lg mb-6`}
        >
          <Tabs tabs={tabItems} mode="routing" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormCard
            title={`Update ${config.entityName}`}
            icon={config.icon}
            maxWidth="full"
          >
            {/* Alert Display */}
            {alert && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  alert.type === "success"
                    ? getThemeClasses("alert-success")
                    : getThemeClasses("alert-error")
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {alert.type === "success" ? (
                      <CheckCircleIcon
                        className={`h-5 w-5 ${getThemeClasses("text-success-icon")}`}
                      />
                    ) : (
                      <ExclamationTriangleIcon
                        className={`h-5 w-5 ${getThemeClasses("text-error-icon")}`}
                      />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAlertClose}
                      className={`${getThemeClasses("text-muted")} hover:${getThemeClasses("info-card-content-text")} transition-colors`}
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Form Sections */}
            {config.formSections &&
              config.formSections.map((SectionComponent, index) => (
                <React.Fragment key={`form-section-${index}`}>
                  <SectionComponent
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                    onUnauthorized={onUnauthorized}
                  />
                </React.Fragment>
              ))}

            {/* Submit Buttons */}
            <div
              className={`flex justify-between items-center pt-6 border-t ${getThemeClasses("border-default")}`}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleBackClick}
                icon={ChevronLeftIcon}
                disabled={isSubmitting}
              >
                Back to Detail
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={CheckCircleIcon}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FormCard>
        </form>
      </div>
    </UIXThemeProvider>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(EntityUpdatePage);

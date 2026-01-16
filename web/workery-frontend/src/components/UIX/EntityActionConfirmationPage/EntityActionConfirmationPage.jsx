// File: src/components/UIX/EntityActionConfirmationPage/EntityActionConfirmationPage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import { Button } from "../index";
import { useAuthManager } from "../../../services/Services";

/**
 * EntityActionConfirmationPage
 *
 * A reusable component for entity action confirmation pages (archive, delete, ban, etc.)
 *
 * @param {Object} props
 * @param {string} props.entityType - Type of entity (e.g., 'customer', 'speaker', 'facilitator')
 * @param {string} props.entityId - ID of the entity
 * @param {string} props.actionType - Type of action ('archive', 'unarchive', 'delete', 'ban', 'unban', 'upgrade', 'downgrade')
 * @param {Function} props.fetchEntity - Function to fetch entity data: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeAction - Function to execute the action: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Array} props.breadcrumbItems - Breadcrumb navigation items
 * @param {Object} props.pageConfig - Page configuration (title, subtitle, icon, etc.)
 * @param {Function} props.renderEntityInfo - Function to render entity information: (entity) => ReactNode
 * @param {Object} props.warningConfig - Warning message configuration
 * @param {Array} props.statusAlerts - Array of status alert configurations: [{condition: (entity) => boolean, type: 'info'|'warning'|'error', message: string, icon: Component}]
 * @param {Function} props.isActionDisabled - Function to check if action should be disabled: (entity) => boolean
 * @param {string} props.returnPath - Path to navigate after action
 * @param {string} props.successRedirectPath - Path to redirect after successful action (defaults to returnPath)
 * @param {number} props.successRedirectDelay - Delay before redirect in ms (default: 2000)
 */
function EntityActionConfirmationPage({
  entityType = "entity",
  entityId,
  actionType = "action",
  fetchEntity,
  executeAction,
  breadcrumbItems = [],
  pageConfig = {},
  renderEntityInfo,
  warningConfig = {},
  statusAlerts = [],
  isActionDisabled,
  returnPath,
  successRedirectPath,
  successRedirectDelay = 2000,
}) {
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes for performance
  const themeClasses = {
    // Text colors
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    textMuted: getThemeClasses("text-muted") || "text-gray-600",
    textError: getThemeClasses("text-error") || "text-red-600",
    textSuccess: getThemeClasses("text-success") || "text-green-700",
    // Background colors
    bgCard: getThemeClasses("bg-card") || "bg-white",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-50",
    bgOverlay: getThemeClasses("bg-overlay") || "bg-gray-500",
    // Border colors
    borderPrimary: getThemeClasses("border-primary") || "border-red-600",
    borderBorder: getThemeClasses("border-border") || "border-gray-200",
    // Success state
    successBg: getThemeClasses("success-bg") || "bg-green-50",
    successBorder: getThemeClasses("success-border") || "border-green-200",
    // Error state
    errorBg: getThemeClasses("error-bg") || "bg-red-50",
    errorBorder: getThemeClasses("error-border") || "border-red-200",
    // Link colors
    linkHover: getThemeClasses("link-hover") || "hover:text-red-600",
    // Button colors
    btnDangerBg: getThemeClasses("btn-danger-bg") || "bg-red-600",
    btnDangerHover: getThemeClasses("btn-danger-hover") || "hover:bg-red-700",
    btnDangerBorder: getThemeClasses("btn-danger-border") || "border-red-300",
    // Icon background
    iconBgDanger: getThemeClasses("icon-bg-danger") || "bg-red-100",
    iconTextDanger: getThemeClasses("icon-text-danger") || "text-red-600",
    // Warning variants
    warningRed: {
      bg: getThemeClasses("warning-red-bg") || "bg-red-50",
      border: getThemeClasses("warning-red-border") || "border-red-200",
      iconText: getThemeClasses("warning-red-icon") || "text-red-600",
      titleText: getThemeClasses("warning-red-title") || "text-red-900",
      descText: getThemeClasses("warning-red-desc") || "text-red-800",
      listText: getThemeClasses("warning-red-list") || "text-red-700",
      bulletBg: getThemeClasses("warning-red-bullet") || "bg-red-600",
      confirmText: getThemeClasses("warning-red-confirm") || "text-red-900",
    },
    warningYellow: {
      bg: getThemeClasses("warning-yellow-bg") || "bg-yellow-50",
      border: getThemeClasses("warning-yellow-border") || "border-yellow-200",
      iconText: getThemeClasses("warning-yellow-icon") || "text-yellow-600",
      titleText: getThemeClasses("warning-yellow-title") || "text-yellow-900",
      descText: getThemeClasses("warning-yellow-desc") || "text-yellow-800",
      listText: getThemeClasses("warning-yellow-list") || "text-yellow-700",
      bulletBg: getThemeClasses("warning-yellow-bullet") || "bg-yellow-600",
      confirmText: getThemeClasses("warning-yellow-confirm") || "text-yellow-900",
    },
    warningAmber: {
      bg: getThemeClasses("warning-amber-bg") || "bg-amber-50",
      border: getThemeClasses("warning-amber-border") || "border-amber-200",
      iconText: getThemeClasses("warning-amber-icon") || "text-amber-600",
      titleText: getThemeClasses("warning-amber-title") || "text-amber-900",
      descText: getThemeClasses("warning-amber-desc") || "text-amber-800",
      listText: getThemeClasses("warning-amber-list") || "text-amber-700",
      bulletBg: getThemeClasses("warning-amber-bullet") || "bg-amber-600",
      confirmText: getThemeClasses("warning-amber-confirm") || "text-amber-900",
    },
    // Alert variants
    alertInfo: {
      bg: getThemeClasses("alert-info-bg") || "bg-blue-50",
      border: getThemeClasses("alert-info-border") || "border-blue-200",
      text: getThemeClasses("alert-info-text") || "text-blue-700",
    },
    alertWarning: {
      bg: getThemeClasses("alert-warning-bg") || "bg-amber-50",
      border: getThemeClasses("alert-warning-border") || "border-amber-200",
      text: getThemeClasses("alert-warning-text") || "text-amber-700",
    },
    alertError: {
      bg: getThemeClasses("alert-error-bg") || "bg-red-50",
      border: getThemeClasses("alert-error-border") || "border-red-200",
      text: getThemeClasses("alert-error-text") || "text-red-700",
    },
  };

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Ref for success redirect timeout cleanup
  const successTimeoutRef = useRef(null);

  // Mounted ref to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Cleanup timeout on unmount and set mounted to false
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Default page config
  const {
    title = `${entityType} - ${actionType}`,
    subtitle = `${actionType} ${entityType}`,
    icon: PageIcon,
    actionIcon: ActionIcon,
    loadingText = `Loading ${entityType} details...`,
  } = pageConfig;

  // Default warning config
  const {
    title: warningTitle = `${actionType} ${entityType} - Are you sure?`,
    description = `You are about to ${actionType} this ${entityType}.`,
    consequences = [],
    confirmationText = "Are you sure you would like to continue?",
    warningType = "amber", // 'amber', 'red', 'yellow'
  } = warningConfig;

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load entity details
  useEffect(() => {
    let mounted = true;

    const fetchEntityData = async () => {
      if (!authManager.isAuthenticated()) {
        navigate("/login");
        return;
      }

      if (!entityId) {
        setErrors({ general: `${entityType} ID is required` });
        setFetching(false);
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        await fetchEntity(
          entityId,
          (entityData) => {
            if (mounted) {
              setEntity(entityData);
            }
          },
          (error) => {
            if (mounted) {
              if (import.meta.env.DEV) {
                console.error(`Failed to fetch ${entityType}:`, error);
              }
              setErrors(error);
            }
          },
          () => {
            if (mounted) {
              setFetching(false);
            }
          },
          onUnauthorized,
        );
      } catch (error) {
        if (mounted) {
          if (import.meta.env.DEV) {
            console.error(`Failed to fetch ${entityType}:`, error);
          }
          setErrors({ general: `Failed to load ${entityType} information` });
          setFetching(false);
        }
      }
    };

    fetchEntityData();

    return () => {
      mounted = false;
    };
  }, [entityId, fetchEntity, authManager, navigate, onUnauthorized, entityType]);

  // Handle action confirmation
  const handleConfirmAction = useCallback(async () => {
    if (!isMountedRef.current) return;
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      await executeAction(
        entityId,
        () => {
          // Success callback - check mounted before state update
          if (!isMountedRef.current) return;
          setSuccessMessage(`${entityType} has been successfully ${actionType}d`);

          // Navigate after delay (using ref for cleanup on unmount)
          successTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              navigate(successRedirectPath || returnPath);
            }
          }, successRedirectDelay);
        },
        (error) => {
          // Error callback - check mounted before state update
          if (!isMountedRef.current) return;
          if (import.meta.env.DEV) {
            console.error(`Failed to ${actionType} ${entityType}:`, error);
          }
          setErrors(error);
          setFetching(false);
        },
        () => {
          // Done callback - check mounted before state update
          if (!isMountedRef.current) return;
          if (!successMessage) {
            setFetching(false);
          }
        },
        onUnauthorized,
      );
    } catch (error) {
      // Check mounted before state update in catch
      if (!isMountedRef.current) return;
      if (import.meta.env.DEV) {
        console.error(`Failed to ${actionType} ${entityType}:`, error);
      }
      setErrors({ general: `Failed to ${actionType} ${entityType}` });
      setFetching(false);
    }
  }, [
    entityId,
    executeAction,
    actionType,
    entityType,
    navigate,
    onUnauthorized,
    successMessage,
    returnPath,
    successRedirectPath,
    successRedirectDelay,
  ]);

  // Get warning color classes using theme
  const getWarningClasses = () => {
    switch (warningType) {
      case "red":
        return themeClasses.warningRed;
      case "yellow":
        return themeClasses.warningYellow;
      case "amber":
      default:
        return themeClasses.warningAmber;
    }
  };

  const warningClasses = getWarningClasses();

  // Render loading state
  if (isFetching && !entity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary} mx-auto`}></div>
            <p className={`mt-4 ${themeClasses.textSecondary}`}>
              {loadingText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const actionDisabled = isActionDisabled ? isActionDisabled(entity) : false;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbItems.map((item, index) => (
              <li
                key={index}
                className={item.isActive ? "inline-flex items-center" : ""}
                aria-current={item.isActive ? "page" : undefined}
              >
                {index > 0 && (
                  <span className={`mx-2 ${themeClasses.textMuted}`}>
                    /
                  </span>
                )}
                {item.to && !item.isActive ? (
                  <Link
                    to={item.to}
                    className={`inline-flex items-center text-sm font-medium ${themeClasses.textPrimary} ${themeClasses.linkHover}`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm font-medium ${themeClasses.textMuted} inline-flex items-center`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              {PageIcon && (
                <PageIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.iconTextDanger}`} />
              )}
              {title}
            </h1>
            <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-1" />}
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className={`mb-4 ${themeClasses.successBg} border ${themeClasses.successBorder} ${themeClasses.textSuccess} px-4 py-3 rounded-lg flex items-center`}>
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <div className={`mb-4 ${themeClasses.errorBg} border ${themeClasses.errorBorder} ${themeClasses.textError} px-4 py-3 rounded-lg`}>
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              {errors.general ||
                errors.message ||
                errors.detail ||
                "An error occurred. Please try again."}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setErrors({})}
              className={`${themeClasses.textError} hover:opacity-75`}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Status Alerts */}
      {statusAlerts.map((alert, index) => {
        if (!alert.condition || !alert.condition(entity)) return null;

        const alertColors = {
          info: themeClasses.alertInfo,
          warning: themeClasses.alertWarning,
          error: themeClasses.alertError,
        };

        const colors = alertColors[alert.type] || alertColors.info;
        const AlertIcon = alert.icon || InformationCircleIcon;

        return (
          <div
            key={index}
            className={`mb-4 ${colors.bg} border ${colors.border} ${colors.text} px-4 py-3 rounded-lg flex items-center`}
          >
            <AlertIcon className="w-5 h-5 mr-2" />
            {alert.message}
          </div>
        );
      })}

      {/* Main Content */}
      <div className={`${themeClasses.bgCard} shadow-sm rounded-lg overflow-hidden`}>
        <div className="p-6">
          {/* Warning Message */}
          <div className={`mb-6 ${warningClasses.bg} border ${warningClasses.border} rounded-lg p-6`}>
            <div className="flex items-start">
              <ExclamationTriangleIcon
                className={`w-6 h-6 ${warningClasses.iconText} mt-1 mr-3 flex-shrink-0`}
              />
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${warningClasses.titleText} mb-2`}>
                  {warningTitle}
                </h3>
                <p className={`${warningClasses.descText} mb-3`}>
                  {description}
                </p>
                {consequences.length > 0 && (
                  <ul className={`space-y-2 ${warningClasses.listText} ml-4`}>
                    {consequences.map((consequence, index) => (
                      <li key={index} className="flex items-start">
                        <span
                          className={`inline-block w-2 h-2 ${warningClasses.bulletBg} rounded-full mt-1.5 mr-2 flex-shrink-0`}
                        ></span>
                        {consequence}
                      </li>
                    ))}
                  </ul>
                )}
                <p className={`mt-4 font-semibold ${warningClasses.confirmText}`}>
                  {confirmationText}
                </p>
              </div>
            </div>
          </div>

          {/* Entity Information */}
          {entity && renderEntityInfo && renderEntityInfo(entity)}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link to={returnPath}>
              <Button
                variant="outline"
                size="md"
                disabled={isFetching}
                icon={ChevronLeftIcon}
              >
                Back to More
              </Button>
            </Link>

            <Button
              variant={actionDisabled ? "outline" : "danger"}
              size="md"
              onClick={() => setShowConfirmModal(true)}
              disabled={isFetching || actionDisabled}
              icon={ActionIcon}
            >
              {isFetching
                ? "Processing..."
                : actionDisabled
                  ? `Already ${actionType}d`
                  : `Confirm and ${actionType}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Background overlay */}
            <div
              className={`fixed inset-0 ${themeClasses.bgOverlay} bg-opacity-75 transition-opacity`}
              onClick={() => setShowConfirmModal(false)}
              style={{ touchAction: 'none' }}
            ></div>

            {/* Modal panel */}
            <div className={`relative transform overflow-hidden rounded-lg ${themeClasses.bgCard} text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg`}>
              <div className={`${themeClasses.bgCard} px-4 pb-4 pt-5 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${themeClasses.iconBgDanger} sm:mx-0 sm:h-10 sm:w-10`}>
                    <ExclamationTriangleIcon
                      className={`h-6 w-6 ${themeClasses.iconTextDanger}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className={`text-lg font-semibold leading-6 ${themeClasses.textPrimary}`}>
                      Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        <strong>Final Confirmation</strong>
                      </p>
                      <p className={`mt-2 text-sm ${themeClasses.textSecondary}`}>
                        {description}
                      </p>
                      <p className={`mt-3 text-sm font-medium ${themeClasses.textError}`}>
                        Are you absolutely sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${themeClasses.bgMuted} px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3`}>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={handleConfirmAction}
                  disabled={isFetching}
                  className="w-full sm:w-auto"
                >
                  {isFetching ? `${actionType}ing...` : `Yes, ${actionType}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isFetching}
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntityActionConfirmationPage;

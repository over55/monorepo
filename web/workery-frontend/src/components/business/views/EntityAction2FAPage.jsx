// File: monorepo/web/frontend/src/components/business/views/EntityAction2FAPage.jsx

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Badge,
  Button,
  Alert,
  Breadcrumb,
  Modal,
  Loading,
} from "../../UIX";
import { useAuthManager } from "../../../services/Services";

/**
 * EntityAction2FAPage
 *
 * A pre-configured page for enabling/disabling Two-Factor Authentication.
 * Automatically detects current 2FA state and provides appropriate UI.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeToggle2FA - Function to toggle 2FA: (id, enable, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {string} props.otpPropertyName - Property name for OTP enabled status (default: "otpEnabled")
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to more page)
 */
function EntityAction2FAPage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeToggle2FA,
  renderEntityInfo,
  otpPropertyName = "otpEnabled",
  successRedirectPath,
}) {
  return (
    <UIXThemeProvider>
      <EntityAction2FAPageContent
        entityType={entityType}
        entityTypePlural={entityTypePlural}
        basePath={basePath}
        listPath={listPath}
        entityParamName={entityParamName}
        entityIcon={entityIcon}
        fetchEntity={fetchEntity}
        executeToggle2FA={executeToggle2FA}
        renderEntityInfo={renderEntityInfo}
        otpPropertyName={otpPropertyName}
        successRedirectPath={successRedirectPath}
      />
    </UIXThemeProvider>
  );
}

const EntityAction2FAPageContent = memo(function EntityAction2FAPageContent({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName,
  entityIcon,
  fetchEntity,
  executeToggle2FA,
  renderEntityInfo,
  otpPropertyName,
  successRedirectPath,
}) {
  // Get entity ID from URL params
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      bgMuted: getThemeClasses("bg-muted"),
      cardBorder: getThemeClasses("card-border"),
    }),
    [getThemeClasses]
  );

  // Compute list path
  const computedListPath = useMemo(() => {
    return listPath || `${basePath}s`;
  }, [listPath, basePath]);

  // Check current 2FA state
  const is2FAEnabled = useMemo(() => {
    return entity?.[otpPropertyName] || false;
  }, [entity, otpPropertyName]);

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
          onUnauthorized
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

  // Handle open modal
  const handleOpenModal = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Handle confirm toggle
  const handleConfirmToggle = useCallback(async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    const newState = !is2FAEnabled;

    try {
      await executeToggle2FA(
        entityId,
        newState,
        () => {
          // Success callback
          const message = newState
            ? "2FA has been enabled for this account"
            : "2FA has been disabled for this account";
          setSuccessMessage(message);

          // Navigate after delay
          setTimeout(() => {
            const redirectPath = successRedirectPath || `${basePath}/${entityId}/more`;
            navigate(redirectPath);
          }, 2000);
        },
        (error) => {
          // Error callback
          if (import.meta.env.DEV) {
            console.error(`Failed to toggle 2FA:`, error);
          }
          setErrors(error);
          setFetching(false);
        },
        () => {
          // Done callback - no action needed
          // Success case: navigates away (fetching state doesn't matter)
          // Error case: already resets fetching in error callback
        },
        onUnauthorized
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to toggle 2FA:`, error);
      }
      setErrors({ general: "Failed to change 2FA settings" });
      setFetching(false);
    }
  }, [entityId, is2FAEnabled, successRedirectPath, basePath, navigate, onUnauthorized, executeToggle2FA]);

  // Handle error dismiss
  const handleErrorDismiss = useCallback(() => {
    setErrors({});
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(`${basePath}/${entityId}/more`);
  }, [navigate, basePath, entityId]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: entityTypePlural,
      to: computedListPath,
      icon: entityIcon,
    },
    {
      label: "Detail",
      to: `${basePath}/${entityId}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `${basePath}/${entityId}/more`,
      icon: EllipsisHorizontalIcon,
    },
    {
      label: "Two-Factor Authentication",
      icon: DevicePhoneMobileIcon,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Render loading state
  if (isFetching && !entity) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <Loading size="lg" message={`Loading ${entityType.toLowerCase()} details...`} />
        </Card>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <Card padding="p-0" className="mb-6 border-0 shadow-none">
        <Badge
          variant="default"
          size="lg"
          className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}
        >
          {entityIcon && React.createElement(entityIcon, { className: "w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" })}
          {entityType}: {entity?.firstName} {entity?.lastName}
        </Badge>
        <Badge
          variant="secondary"
          size="sm"
          className={`mt-1 ${themeClasses.textSecondary} flex items-center`}
        >
          <DevicePhoneMobileIcon className="w-4 h-4 mr-1" />
          Two-Factor Authentication Settings
        </Badge>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          <CheckCircleIcon className="w-5 h-5 mr-2 inline" />
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error" className="mb-4" onDismiss={handleErrorDismiss}>
          <XMarkIcon className="w-5 h-5 mr-2 inline" />
          {errors.message || errors.detail || errors.general || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* 2FA Status Information */}
        {entity && (
          <>
            {!is2FAEnabled ? (
              <Alert type="success" className="mb-6">
                <Card padding="p-0" className="flex items-start border-0 shadow-none">
                  <LockClosedIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                  <Card padding="p-0" className="flex-1 border-0 shadow-none">
                    <Badge variant="default" size="lg" className="font-semibold mb-2 block">
                      Enable Two-Factor Authentication
                    </Badge>
                    <Badge variant="default" size="md" className="mb-3 block">
                      You are about to <strong>enable 2FA</strong> for this {entityType.toLowerCase()}. This will
                      force them to set up 2FA on their next successful login through a{" "}
                      <strong>3-step wizard</strong>. Afterwards, every login will require 2FA verification.
                    </Badge>
                    <Badge variant="default" size="sm" className="block">
                      Are you sure you want to continue?
                    </Badge>
                  </Card>
                </Card>
              </Alert>
            ) : (
              <Alert type="warning" className="mb-6">
                <Card padding="p-0" className="flex items-start border-0 shadow-none">
                  <LockOpenIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                  <Card padding="p-0" className="flex-1 border-0 shadow-none">
                    <Badge variant="default" size="lg" className="font-semibold mb-2 block">
                      Remove Two-Factor Authentication
                    </Badge>
                    <Badge variant="default" size="md" className="mb-3 block">
                      You are about to <strong>remove 2FA</strong> for this {entityType.toLowerCase()}. This will
                      remove their existing 2FA codes and disable 2FA verification on login.
                      This is recommended if they lost their 2FA codes from their device.
                    </Badge>
                    <Badge variant="default" size="sm" className="block">
                      Are you sure you want to continue?
                    </Badge>
                  </Card>
                </Card>
              </Alert>
            )}

            {/* Entity Information */}
            {renderEntityInfo && renderEntityInfo(entity)}

            {/* Current Status */}
            <Card className={`${themeClasses.bgMuted} mb-6`} padding="p-4">
              <Card padding="p-0" className="flex items-center justify-between border-0 shadow-none">
                <Badge variant="secondary" size="md" className={`font-medium ${themeClasses.textSecondary}`}>
                  Current 2FA Status:
                </Badge>
                {is2FAEnabled ? (
                  <Badge variant="success" size="md">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="md">
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    Disabled
                  </Badge>
                )}
              </Card>
            </Card>

            {/* Action Buttons */}
            <Card padding="p-0" className="flex flex-col sm:flex-row justify-between items-center gap-4 border-0 shadow-none">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isFetching}
                icon={ChevronLeftIcon}
                className="w-full sm:w-auto"
              >
                Back to More
              </Button>

              <Button
                variant={!is2FAEnabled ? "success" : "warning"}
                onClick={handleOpenModal}
                disabled={isFetching}
                icon={!is2FAEnabled ? LockClosedIcon : LockOpenIcon}
                loading={isFetching}
                className="w-full sm:w-auto"
              >
                {isFetching ? "Processing..." : !is2FAEnabled ? "Enable 2FA" : "Disable 2FA"}
              </Button>
            </Card>
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title="Confirm 2FA Change"
        size="md"
      >
        <Card padding="p-0" className="border-0 shadow-none">
          <Card padding="p-0" className="sm:flex sm:items-start border-0 shadow-none">
            <Card
              padding="p-0"
              className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 border-0 shadow-none ${
                !is2FAEnabled ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {!is2FAEnabled ? (
                <LockClosedIcon className="h-6 w-6 text-green-600" />
              ) : (
                <LockOpenIcon className="h-6 w-6 text-amber-600" />
              )}
            </Card>
            <Card padding="p-0" className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1 border-0 shadow-none">
              <Badge variant="secondary" size="md" className={`${themeClasses.textSecondary} block`}>
                Are you sure you want to {!is2FAEnabled ? "enable" : "disable"} Two-Factor
                Authentication for this {entityType.toLowerCase()}?
              </Badge>

              {!is2FAEnabled && (
                <Badge variant="secondary" size="sm" className={`mt-2 ${themeClasses.textMuted} block`}>
                  They will be required to set up 2FA on their next login.
                </Badge>
              )}

              {is2FAEnabled && (
                <Badge variant="secondary" size="sm" className={`mt-2 ${themeClasses.textMuted} block`}>
                  This will remove all 2FA settings. They will be able to login
                  without 2FA verification.
                </Badge>
              )}
            </Card>
          </Card>

          <Card padding="p-0" className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 border-0 shadow-none">
            <Button
              variant={!is2FAEnabled ? "success" : "warning"}
              onClick={handleConfirmToggle}
              disabled={isFetching}
              className="w-full sm:w-auto"
            >
              {isFetching ? "Processing..." : "Confirm"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isFetching}
              className="mt-3 sm:mt-0 w-full sm:w-auto"
            >
              Cancel
            </Button>
          </Card>
        </Card>
      </Modal>
    </Card>
  );
});

EntityAction2FAPageContent.displayName = "EntityAction2FAPageContent";

export default EntityAction2FAPage;

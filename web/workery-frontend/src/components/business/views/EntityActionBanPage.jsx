// File: monorepo/web/frontend/src/components/business/views/EntityActionBanPage.jsx

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  NoSymbolIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
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
  Textarea,
  Loading,
} from "../../UIX";
import { useAuthManager } from "../../../services/Services";
import { MAX_BAN_REASON_LENGTH } from "../../../constants/UI";

/**
 * EntityActionBanPage
 *
 * A pre-configured page for banning entities with a reason input.
 * Provides a complete UI for the ban action with a textarea for ban reason.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeBan - Function to execute ban: (id, banReason, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {Array} props.consequences - Optional custom consequences array (uses defaults if not provided)
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to more page)
 * @param {boolean} props.requireReason - Whether ban reason is required (default: true)
 */
function EntityActionBanPage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeBan,
  renderEntityInfo,
  consequences,
  successRedirectPath,
  requireReason = true,
}) {
  return (
    <UIXThemeProvider>
      <EntityActionBanPageContent
        entityType={entityType}
        entityTypePlural={entityTypePlural}
        basePath={basePath}
        listPath={listPath}
        entityParamName={entityParamName}
        entityIcon={entityIcon}
        fetchEntity={fetchEntity}
        executeBan={executeBan}
        renderEntityInfo={renderEntityInfo}
        consequences={consequences}
        successRedirectPath={successRedirectPath}
        requireReason={requireReason}
      />
    </UIXThemeProvider>
  );
}

const EntityActionBanPageContent = memo(function EntityActionBanPageContent({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName,
  entityIcon,
  fetchEntity,
  executeBan,
  renderEntityInfo,
  consequences,
  successRedirectPath,
  requireReason,
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
  const [banReason, setBanReason] = useState("");

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

  // Default consequences for banning
  const defaultConsequences = useMemo(() => [
    `The ${entityType.toLowerCase()} will be immediately banned from the system`,
    `They will not be able to log in or access their account`,
    `The ${entityType.toLowerCase()} will be marked as banned in all lists`,
    "This action can be undone by unbanning the record",
  ], [entityType]);

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

  // Handle ban reason change
  const handleBanReasonChange = useCallback((value) => {
    setBanReason(value);
    // Clear error when user starts typing
    if (errors.banReason) {
      setErrors((prev) => ({ ...prev, banReason: undefined }));
    }
  }, [errors.banReason]);

  // Handle open modal
  const handleOpenModal = useCallback(() => {
    // Validate ban reason if required
    if (requireReason && (!banReason || banReason.trim() === "")) {
      setErrors({ banReason: "Please provide a reason for banning" });
      return;
    }
    // Validate ban reason length
    if (banReason && banReason.trim().length > MAX_BAN_REASON_LENGTH) {
      setErrors({ banReason: `Ban reason must be ${MAX_BAN_REASON_LENGTH} characters or less` });
      return;
    }
    setShowConfirmModal(true);
  }, [banReason, requireReason]);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Handle confirm ban
  const handleConfirmBan = useCallback(async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      await executeBan(
        entityId,
        banReason.trim(),
        () => {
          // Success callback
          setSuccessMessage(`${entityType} has been successfully banned`);

          // Navigate after delay
          setTimeout(() => {
            const redirectPath = successRedirectPath || `${basePath}/${entityId}/more`;
            navigate(redirectPath);
          }, 2000);
        },
        (error) => {
          // Error callback
          if (import.meta.env.DEV) {
            console.error(`Failed to ban ${entityType}:`, error);
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
        console.error(`Failed to ban ${entityType}:`, error);
      }
      setErrors({ general: `Failed to ban ${entityType}` });
      setFetching(false);
    }
  }, [entityId, banReason, entityType, successRedirectPath, basePath, navigate, onUnauthorized, executeBan]);

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
      label: "Ban",
      icon: NoSymbolIcon,
    },
  ], [entityTypePlural, entityIcon, basePath, entityId, computedListPath]);

  // Check if already banned
  const isAlreadyBanned = entity?.isBanned;

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
          <NoSymbolIcon className="w-4 h-4 mr-1" />
          Ban {entityType}
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
      {errors && Object.keys(errors).length > 0 && !errors.banReason && (
        <Alert type="error" className="mb-4" onDismiss={handleErrorDismiss}>
          <XMarkIcon className="w-5 h-5 mr-2 inline" />
          {errors.message || errors.detail || errors.general || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Already Banned Alert */}
      {isAlreadyBanned && (
        <Alert type="info" className="mb-4">
          <InformationCircleIcon className="w-5 h-5 mr-2 inline" />
          {entityType} is already banned
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* Warning Message */}
        <Alert type="warning" className="mb-6">
          <Card padding="p-0" className="flex items-start border-0 shadow-none">
            <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
            <Card padding="p-0" className="flex-1 border-0 shadow-none">
              <Badge variant="default" size="lg" className="font-semibold mb-2 block">
                Ban {entityType} - Are you sure?
              </Badge>
              <Badge variant="default" size="md" className="mb-3 block">
                You are about to ban this {entityType.toLowerCase()}. This means:
              </Badge>
              <Card padding="p-0" className="space-y-2 ml-4 border-0 shadow-none">
                {(consequences || defaultConsequences).map((consequence, index) => (
                  <Badge key={index} variant="default" size="sm" className="flex items-start block">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    {consequence}
                  </Badge>
                ))}
              </Card>
              <Badge variant="default" size="sm" className="mt-4 font-semibold block">
                Are you sure you would like to continue?
              </Badge>
            </Card>
          </Card>
        </Alert>

        {/* Entity Information */}
        {entity && renderEntityInfo && renderEntityInfo(entity)}

        {/* Ban Reason Input */}
        <Card className={`${themeClasses.bgMuted} mb-6`} padding="p-4">
          <Textarea
            label="Ban Reason"
            value={banReason}
            onChange={handleBanReasonChange}
            placeholder="Enter the reason for banning this account..."
            rows={4}
            maxLength={MAX_BAN_REASON_LENGTH}
            error={errors.banReason}
            required={requireReason}
            disabled={isFetching || isAlreadyBanned}
            helpText={`Provide a detailed reason for the ban (max ${MAX_BAN_REASON_LENGTH} characters). This will be recorded for administrative purposes.`}
          />
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
            variant="danger"
            onClick={handleOpenModal}
            disabled={isFetching || isAlreadyBanned}
            icon={NoSymbolIcon}
            loading={isFetching}
            className="w-full sm:w-auto"
          >
            {isFetching ? "Processing..." : isAlreadyBanned ? "Already Banned" : "Ban"}
          </Button>
        </Card>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title={`Confirm Ban`}
        size="md"
      >
        <Card padding="p-0" className="border-0 shadow-none">
          <Card padding="p-0" className="sm:flex sm:items-start border-0 shadow-none">
            <Card
              padding="p-0"
              className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 border-0 shadow-none"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </Card>
            <Card padding="p-0" className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1 border-0 shadow-none">
              <Badge variant="secondary" size="md" className={`${themeClasses.textSecondary} block`}>
                Are you sure you want to ban this {entityType.toLowerCase()}?
              </Badge>
              {banReason && (
                <Card padding="p-0" className="mt-3 border-0 shadow-none">
                  <Badge variant="secondary" size="sm" className="font-medium block mb-1">
                    Ban Reason:
                  </Badge>
                  <Badge variant="default" size="sm" className={`${themeClasses.textPrimary} block`}>
                    {banReason}
                  </Badge>
                </Card>
              )}
            </Card>
          </Card>

          <Card padding="p-0" className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 border-0 shadow-none">
            <Button
              variant="danger"
              onClick={handleConfirmBan}
              disabled={isFetching}
              className="w-full sm:w-auto"
            >
              {isFetching ? "Processing..." : "Confirm Ban"}
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

EntityActionBanPageContent.displayName = "EntityActionBanPageContent";

export default EntityActionBanPage;

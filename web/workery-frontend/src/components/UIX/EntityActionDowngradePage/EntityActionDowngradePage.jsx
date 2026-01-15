// File: src/components/UIX/EntityActionDowngradePage/EntityActionDowngradePage.jsx
// UIX Mobile Optimizations Applied
//
// Reusable entity downgrade action page component
// Used for downgrading entities from one type to another (e.g., Business to Residential)

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowDownIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAuthManager } from "../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Badge,
  Loading,
  Breadcrumb,
  Modal,
  UIXThemeProvider,
} from "../";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Development-only logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log("[EntityActionDowngradePage]", ...args);
const logError = (...args) => DEBUG && console.error("[EntityActionDowngradePage]", ...args);

/**
 * EntityActionDowngradePage
 *
 * A reusable component for entity type downgrade pages
 *
 * @param {Object} config - Configuration object
 * @param {string} config.entityType - Display name (e.g., "Speaker", "Customer")
 * @param {string} config.entityIdParam - URL parameter name (e.g., "aid", "cid")
 * @param {React.Component} config.entityIcon - Icon for the entity type
 * @param {Function} config.fetchEntity - Function to fetch entity: (id, onUnauthorized) => Promise<entity>
 * @param {Function} config.executeDowngrade - Function to execute downgrade: (id, onUnauthorized) => Promise
 * @param {Function} config.isDowngradeDisabled - Check if downgrade is disabled: (entity) => boolean
 * @param {string} config.disabledMessage - Message when downgrade is disabled
 * @param {Function} config.getEntityDisplayName - Get display name: (entity) => string
 * @param {Function} config.getCurrentTypeLabel - Get current type label: (entity) => string
 * @param {Function} config.getCurrentTypeBadge - Get current type badge: (entity) => ReactNode
 * @param {Function} config.renderEntityInfo - Render custom entity info: (entity) => ReactNode
 * @param {Array} config.breadcrumbItems - Function to generate breadcrumb items: (entityId) => Array
 * @param {Object} config.warningConfig - Warning section configuration
 * @param {Object} config.impactConfig - Impact/consequences section configuration
 * @param {Object} config.routes - Route configuration { returnPath, successRedirectPath }
 * @param {Object} config.labels - Custom labels { pageTitle, pageSubtitle, confirmTitle, successMessage, etc. }
 */
const EntityActionDowngradePage = memo(function EntityActionDowngradePage({ config }) {
  // URL Parameters
  const { [config.entityIdParam]: entityId } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const authManager = useAuthManager();

  // Theme
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [entity, setEntity] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      textInfo: getThemeClasses("text-info"),
      textError: getThemeClasses("text-error"),
      bgCard: getThemeClasses("bg-card"),
      bgErrorLight: getThemeClasses("bg-error-light"),
      cardBorder: getThemeClasses("card-border"),
    }),
    [getThemeClasses]
  );

  // Default configuration
  const {
    entityType = "Entity",
    entityIcon: EntityIcon = ArrowDownIcon,
    fetchEntity,
    executeDowngrade,
    isDowngradeDisabled = () => false,
    disabledMessage = "This entity cannot be downgraded.",
    getEntityDisplayName = (e) => e?.name || "Unknown",
    // eslint-disable-next-line no-unused-vars
    getCurrentTypeLabel = () => "Unknown", // Available for custom renderEntityInfo
    getCurrentTypeBadge = () => <Badge variant="secondary" size="sm">Unknown</Badge>,
    renderEntityInfo,
    breadcrumbItems = () => [],
    warningConfig = {},
    impactConfig = {},
    routes = {},
    labels = {},
  } = config;

  // Default labels
  const {
    pageTitle = `${entityType} Downgrade`,
    pageSubtitle = "Downgrade to lower tier",
    confirmTitle = "Confirm Downgrade",
    successMessage: successMsgLabel = `${entityType} has been successfully downgraded`,
    actionButtonLabel = "Downgrade",
    processingLabel = "Processing...",
  } = labels;

  // Default warning config
  const {
    title: warningTitle = "Downgrade Warning",
    description: warningDescription = `You are about to downgrade this ${entityType.toLowerCase()}.`,
    consequences: warningConsequences = [],
    confirmationText = "Are you sure you want to continue?",
  } = warningConfig;

  // Default impact config
  const {
    title: impactTitle = "After Downgrade",
    items: impactItems = [],
  } = impactConfig;

  // Default routes
  const {
    returnPath = `/admin/${entityType.toLowerCase()}/${entityId}/more`,
    successRedirectPath,
  } = routes;

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load entity details
  useEffect(() => {
    let mounted = true;

    const loadEntity = async () => {
      if (!authManager.isAuthenticated()) {
        navigate("/login");
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        const data = await fetchEntity(entityId, onUnauthorized);
        if (mounted) {
          setEntity(data);
        }
      } catch (error) {
        if (mounted) {
          logError("Failed to fetch entity:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (entityId) {
      loadEntity();
    }

    return () => {
      mounted = false;
    };
  }, [entityId, fetchEntity, onUnauthorized, authManager, navigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConfirmModal]);

  // Handle showing the modal
  const handleShowModal = useCallback(() => {
    log("Opening confirm modal...");
    setShowConfirmModal(true);
  }, []);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    log("Closing confirm modal...");
    setShowConfirmModal(false);
  }, []);

  // Handle downgrade confirmation
  const handleConfirmDowngrade = useCallback(async () => {
    log("Starting downgrade process for entity:", entityId);

    // Close modal first
    setShowConfirmModal(false);

    // Update UI state
    setErrors({});
    setIsProcessing(true);
    setSuccessMessage("");

    try {
      log("Executing downgrade...");
      await executeDowngrade(entityId, onUnauthorized);

      log("Downgrade successful");
      setSuccessMessage(successMsgLabel);
      setErrors({});
      setIsProcessing(false);

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(successRedirectPath || returnPath);
      }, 2000);
    } catch (error) {
      logError("Failed to downgrade entity:", error);

      // Handle error properly
      if (error && typeof error === "object") {
        if (error.message) {
          setErrors({ general: error.message });
        } else if (error.detail) {
          setErrors({ general: error.detail });
        } else if (error.error) {
          setErrors({ general: error.error });
        } else {
          setErrors({ general: "Failed to downgrade. Please try again." });
        }
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." });
      }

      setIsProcessing(false);
      setSuccessMessage("");
    }
  }, [entityId, executeDowngrade, onUnauthorized, navigate, returnPath, successRedirectPath, successMsgLabel]);

  // Handle clear errors
  const handleClearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if downgrade is disabled
  const isDisabled = entity ? isDowngradeDisabled(entity) : false;

  // Memoized breadcrumb items
  const breadcrumbs = useMemo(
    () => breadcrumbItems(entityId),
    [breadcrumbItems, entityId]
  );

  // Render loading state
  if (isFetching && !entity) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbs} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <Loading size="lg" text={`Loading ${entityType.toLowerCase()} details...`} />
        </Card>
      </Card>
    );
  }

  return (
    <Card
      padding="p-4 sm:p-6 lg:p-8"
      className="max-w-7xl mx-auto border-0 shadow-none"
      style={{
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Page Title */}
      <Card padding="p-0" className="mb-6 border-0 shadow-none">
        <Badge
          variant="default"
          size="lg"
          className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}
        >
          <EntityIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.textInfo}`} />
          {entityType}: {getEntityDisplayName(entity)}
        </Badge>
        <Badge
          variant="secondary"
          size="sm"
          className={`mt-1 ${themeClasses.textSecondary} flex items-center`}
        >
          <ArrowDownIcon className="w-4 h-4 mr-1" />
          {pageSubtitle}
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
        <Alert type="error" className="mb-4" dismissible onDismiss={handleClearErrors}>
          {errors.general || errors.message || errors.detail || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Card Header */}
        <Card padding="p-0" className="mb-6 border-0 shadow-none">
          <Badge
            variant="default"
            size="lg"
            className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}
          >
            <ArrowDownIcon className="w-6 h-6 mr-2 text-amber-600" />
            {pageTitle}
          </Badge>
        </Card>

        {/* Warning Message */}
        {!isDisabled ? (
          <Alert type="warning" className="mb-6">
            <Card padding="p-0" className="flex items-start border-0 shadow-none">
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <Card padding="p-0" className="flex-1 border-0 shadow-none">
                <Badge variant="default" size="md" className="font-semibold mb-2 block">
                  {warningTitle}
                </Badge>
                <Badge variant="default" size="sm" className="mb-3 block">
                  {warningDescription}
                </Badge>
                {warningConsequences.length > 0 && (
                  <Card padding="p-0" className="space-y-1 ml-4 border-0 shadow-none">
                    {warningConsequences.map((consequence, index) => (
                      <Badge key={index} variant="default" size="sm" className="flex items-start">
                        <Badge variant="secondary" size="sm" className="mr-2">•</Badge>
                        {consequence}
                      </Badge>
                    ))}
                  </Card>
                )}
                <Badge variant="default" size="sm" className="mt-3 font-semibold block">
                  {confirmationText}
                </Badge>
              </Card>
            </Card>
          </Alert>
        ) : (
          <Alert type="info" className="mb-6">
            <InformationCircleIcon className="w-5 h-5 mr-2 inline" />
            {disabledMessage}
          </Alert>
        )}

        {/* Entity Information */}
        {renderEntityInfo ? (
          renderEntityInfo(entity, themeClasses, getCurrentTypeBadge)
        ) : (
          <Card className={`${themeClasses.bgCard} mb-6`}>
            <Badge variant="default" size="lg" className={`font-semibold ${themeClasses.textPrimary} mb-4 block`}>
              Current {entityType} Information
            </Badge>
            <Card padding="p-0" className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 shadow-none">
              <Card padding="p-0" className="border-0 shadow-none">
                <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted}`}>
                  Name
                </Badge>
                <Badge variant="default" size="md" className={`mt-1 ${themeClasses.textPrimary} block`}>
                  {getEntityDisplayName(entity)}
                </Badge>
              </Card>
              <Card padding="p-0" className="border-0 shadow-none">
                <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted}`}>
                  Current Type
                </Badge>
                <Card padding="p-0" className="mt-1 border-0 shadow-none">
                  {getCurrentTypeBadge(entity)}
                </Card>
              </Card>
            </Card>
          </Card>
        )}

        {/* Impact Information */}
        {!isDisabled && impactItems.length > 0 && (
          <Alert type="warning" className="mb-6">
            <Card padding="p-0" className="border-0 shadow-none">
              <Badge variant="default" size="lg" className="font-semibold mb-3 flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                {impactTitle}
              </Badge>
              <Card padding="p-0" className="space-y-2 border-0 shadow-none">
                {impactItems.map((item, index) => (
                  <Badge key={index} variant="default" size="sm" className="flex items-start">
                    <Badge variant="secondary" size="sm" className="mr-2">•</Badge>
                    {item}
                  </Badge>
                ))}
              </Card>
            </Card>
          </Alert>
        )}

        {/* Action Buttons */}
        <Card padding="p-0" className="flex flex-col sm:flex-row justify-between gap-4 border-0 shadow-none">
          <Link to={returnPath}>
            <Button variant="secondary" disabled={isProcessing} className="w-full sm:w-auto">
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          {!isDisabled && (
            <Button
              variant="danger"
              onClick={handleShowModal}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  {processingLabel}
                </>
              ) : (
                <>
                  <ArrowDownIcon className="w-4 h-4 mr-2" />
                  {actionButtonLabel}
                </>
              )}
            </Button>
          )}
        </Card>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title={confirmTitle}
        size="md"
      >
        <Card padding="p-0" className="border-0 shadow-none">
          <Card padding="p-0" className="sm:flex sm:items-start border-0 shadow-none">
            <Card padding="p-0" className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${themeClasses.bgErrorLight} sm:mx-0 sm:h-10 sm:w-10 border-0 shadow-none`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${themeClasses.textError}`} />
            </Card>
            <Card padding="p-0" className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1 border-0 shadow-none">
              <Badge variant="secondary" size="md" className={themeClasses.textSecondary}>
                {warningDescription}
              </Badge>

              <Card className={`mt-3 ${themeClasses.bgCard}`} padding="p-3">
                <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted}`}>
                  {entityType}:
                </Badge>
                <Badge variant="default" size="md" className={`ml-2 ${themeClasses.textPrimary}`}>
                  {getEntityDisplayName(entity)}
                </Badge>
              </Card>

              <Badge variant="default" size="md" className={`mt-3 font-medium ${themeClasses.textPrimary} block`}>
                Are you sure you want to proceed?
              </Badge>
            </Card>
          </Card>

          <Card padding="p-0" className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 border-0 shadow-none">
            <Button
              variant="danger"
              onClick={handleConfirmDowngrade}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? processingLabel : `Yes, ${actionButtonLabel}`}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isProcessing}
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

// Wrapper with UIXThemeProvider
function EntityActionDowngradePageWithTheme(props) {
  return (
    <UIXThemeProvider>
      <EntityActionDowngradePage {...props} />
    </UIXThemeProvider>
  );
}

export default EntityActionDowngradePageWithTheme;

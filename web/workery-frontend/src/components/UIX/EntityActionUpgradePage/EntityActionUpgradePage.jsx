// File: src/components/UIX/EntityActionUpgradePage/EntityActionUpgradePage.jsx
// UIX Mobile Optimizations Applied
//
// Reusable entity upgrade action page component
// Used for upgrading entities from one type to another (e.g., Residential to Business)
// Includes form inputs for additional data required during upgrade

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
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
  Input,
  Select,
  UIXThemeProvider,
} from "../";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Development-only logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log("[EntityActionUpgradePage]", ...args);
const logError = (...args) => DEBUG && console.error("[EntityActionUpgradePage]", ...args);

/**
 * EntityActionUpgradePage
 *
 * A reusable component for entity type upgrade pages with form inputs
 *
 * @param {Object} config - Configuration object
 * @param {string} config.entityType - Display name (e.g., "Speaker", "Customer")
 * @param {string} config.entityIdParam - URL parameter name (e.g., "aid", "cid")
 * @param {React.Component} config.entityIcon - Icon for the entity type
 * @param {Function} config.fetchEntity - Function to fetch entity: (id, onUnauthorized) => Promise<entity>
 * @param {Function} config.executeUpgrade - Function to execute upgrade: (data, onUnauthorized) => Promise
 * @param {Function} config.isUpgradeDisabled - Check if upgrade is disabled: (entity) => boolean
 * @param {string} config.disabledMessage - Message when upgrade is disabled
 * @param {Function} config.getEntityDisplayName - Get display name: (entity) => string
 * @param {Function} config.getCurrentTypeLabel - Get current type label: (entity) => string
 * @param {Function} config.getCurrentTypeBadge - Get current type badge: (entity) => ReactNode
 * @param {Function} config.renderEntityInfo - Render custom entity info: (entity) => ReactNode
 * @param {Array} config.formFields - Form field configurations
 * @param {Function} config.validateForm - Custom validation function: (formData) => { isValid: boolean, errors: object }
 * @param {Function} config.formatUpgradeData - Format data for upgrade: (entityId, formData) => object
 * @param {Array} config.breadcrumbItems - Function to generate breadcrumb items: (entityId) => Array
 * @param {Object} config.warningConfig - Warning section configuration
 * @param {Object} config.impactConfig - Impact/benefits section configuration
 * @param {Object} config.routes - Route configuration { returnPath, successRedirectPath }
 * @param {Object} config.labels - Custom labels
 */
const EntityActionUpgradePage = memo(function EntityActionUpgradePage({ config }) {
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
  const [formData, setFormData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const redirectTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      textInfo: getThemeClasses("text-info"),
      textSuccess: getThemeClasses("text-success"),
      bgCard: getThemeClasses("bg-card"),
      bgSuccessLight: getThemeClasses("bg-success-light"),
      cardBorder: getThemeClasses("card-border"),
    }),
    [getThemeClasses]
  );

  // Default configuration
  const {
    entityType = "Entity",
    entityIcon: EntityIcon = ArrowUpCircleIcon,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled = () => false,
    disabledMessage = "This entity cannot be upgraded.",
    getEntityDisplayName = (e) => e?.name || "Unknown",
    // eslint-disable-next-line no-unused-vars
    getCurrentTypeLabel = () => "Unknown", // Available for custom renderEntityInfo
    getCurrentTypeBadge = () => <Badge variant="secondary" size="sm">Unknown</Badge>,
    renderEntityInfo,
    formFields = [],
    validateForm: customValidateForm,
    formatUpgradeData = (id, data) => ({ entity_id: id, ...data }),
    breadcrumbItems = () => [],
    warningConfig = {},
    impactConfig = {},
    routes = {},
    labels = {},
  } = config;

  // Default labels
  const {
    // eslint-disable-next-line no-unused-vars
    pageTitle = `Upgrade ${entityType}`, // Available for custom layouts
    pageSubtitle = "Upgrade to higher tier",
    confirmTitle = "Confirm Upgrade",
    successMessage: successMsgLabel = `${entityType} has been successfully upgraded`,
    actionButtonLabel = "Confirm and Upgrade",
    processingLabel = "Processing...",
  } = labels;

  // Default warning config
  const {
    title: warningTitle = "Upgrade Notice",
    description: warningDescription = `You are about to upgrade this ${entityType.toLowerCase()}.`,
    consequences: warningConsequences = [],
    notice = "Please ensure you have the correct information before proceeding.",
  } = warningConfig;

  // Default impact config
  const {
    title: impactTitle = "After Upgrade",
    items: impactItems = [],
  } = impactConfig;

  // Default routes
  const {
    returnPath = `/admin/${entityType.toLowerCase()}/${entityId}/more`,
    successRedirectPath,
  } = routes;

  // Initialize form data from field defaults
  useEffect(() => {
    const initialData = {};
    formFields.forEach(field => {
      initialData[field.name] = field.defaultValue || "";
    });
    setFormData(initialData);
  }, [formFields]);

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

  // Validate form
  const validateForm = useCallback(() => {
    if (customValidateForm) {
      const result = customValidateForm(formData);
      setErrors(result.errors || {});
      return result.isValid;
    }

    // Default validation - check required fields
    const newErrors = {};
    formFields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (!value || (typeof value === "string" && value.trim().length === 0)) {
          newErrors[field.name] = `${field.label} is required`;
        } else if (field.minLength && value.trim().length < field.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, formFields, customValidateForm]);

  // Handle form field change
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setErrors(prev => ({ ...prev, [fieldName]: undefined }));
  }, []);

  // Handle confirm button click
  const handleConfirmClick = useCallback(() => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  }, [validateForm]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Handle upgrade confirmation
  const handleConfirmUpgrade = useCallback(async () => {
    setShowConfirmModal(false);

    if (!validateForm()) {
      return;
    }

    log("Starting upgrade process for entity:", entityId);
    setErrors({});
    setIsProcessing(true);

    try {
      const upgradeData = formatUpgradeData(entityId, formData);
      log("Executing upgrade with data:", upgradeData);

      await executeUpgrade(upgradeData, onUnauthorized);

      log("Upgrade successful");
      setSuccessMessage(successMsgLabel);

      // Navigate back after a short delay
      redirectTimeoutRef.current = setTimeout(() => {
        navigate(successRedirectPath || returnPath);
      }, 2000);
    } catch (error) {
      logError("Failed to upgrade entity:", error);
      setErrors(error);
      setIsProcessing(false);
    }
  }, [entityId, formData, validateForm, formatUpgradeData, executeUpgrade, onUnauthorized, navigate, returnPath, successRedirectPath, successMsgLabel]);

  // Handle clear errors
  const handleClearErrors = useCallback(() => {
    const fieldErrors = {};
    formFields.forEach(field => {
      if (errors[field.name]) {
        fieldErrors[field.name] = errors[field.name];
      }
    });
    // Only clear non-field errors
    setErrors(fieldErrors);
  }, [errors, formFields]);

  // Check if upgrade is disabled
  const isDisabled = entity ? isUpgradeDisabled(entity) : false;

  // Check if form is valid for submit button
  const isFormValid = formFields.every(field => {
    if (!field.required) return true;
    const value = formData[field.name];
    return value && (typeof value !== "string" || value.trim().length > 0);
  });

  // Memoized breadcrumb items
  const breadcrumbs = useMemo(
    () => breadcrumbItems(entityId),
    [breadcrumbItems, entityId]
  );

  // Get field display value for modal
  const getFieldDisplayValue = useCallback((field) => {
    const value = formData[field.name];
    if (field.type === "select" && field.options) {
      const option = field.options.find(opt => opt.value === value);
      return option?.label || value;
    }
    return value;
  }, [formData]);

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
          <ArrowUpCircleIcon className="w-4 h-4 mr-1" />
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

      {/* Error Messages (non-field errors) */}
      {errors && Object.keys(errors).length > 0 &&
       !formFields.some(f => errors[f.name]) && (
        <Alert type="error" className="mb-4" dismissible onDismiss={handleClearErrors}>
          {errors.message || errors.detail || errors.general || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        {/* Warning/Info Message */}
        {!isDisabled ? (
          <Alert type="warning" className="mb-6">
            <Card padding="p-0" className="flex items-start border-0 shadow-none">
              <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <Card padding="p-0" className="flex-1 border-0 shadow-none">
                <Badge variant="default" size="md" className="font-medium mb-2 block">
                  {warningTitle}
                </Badge>
                <Badge variant="default" size="sm" className="block mb-2">
                  {warningDescription}
                </Badge>
                {warningConsequences.length > 0 && (
                  <Card padding="p-0" className="space-y-1 mt-2 border-0 shadow-none">
                    {warningConsequences.map((consequence, index) => (
                      <Badge key={index} variant="default" size="sm" className="flex items-start">
                        <Badge variant="secondary" size="sm" className="mr-2">•</Badge>
                        {consequence}
                      </Badge>
                    ))}
                  </Card>
                )}
                <Badge variant="default" size="sm" className="mt-2 block">
                  {notice}
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
            <Badge variant="default" size="md" className={`font-medium ${themeClasses.textPrimary} mb-3 block`}>
              Current {entityType} Information
            </Badge>
            <Card padding="p-0" className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 border-0 shadow-none">
              <Card padding="p-0" className="border-0 shadow-none">
                <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted}`}>
                  Name:
                </Badge>
                <Badge variant="default" size="sm" className={`ml-2 ${themeClasses.textPrimary}`}>
                  {getEntityDisplayName(entity)}
                </Badge>
              </Card>
              <Card padding="p-0" className="border-0 shadow-none">
                <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted}`}>
                  Current Type:
                </Badge>
                <Card padding="p-0" className="ml-2 inline-block border-0 shadow-none">
                  {getCurrentTypeBadge(entity)}
                </Card>
              </Card>
            </Card>
          </Card>
        )}

        {/* Upgrade Form */}
        {!isDisabled && formFields.length > 0 && (
          <Card padding="p-0" className="space-y-4 border-0 shadow-none">
            {formFields.map(field => (
              <div key={field.name}>
                {field.type === "select" ? (
                  <Select
                    label={field.label}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={isProcessing}
                    error={errors[field.name]}
                    options={field.options || []}
                  />
                ) : (
                  <Input
                    label={field.label}
                    required={field.required}
                    type={field.type || "text"}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isProcessing}
                    error={errors[field.name]}
                    icon={field.icon}
                  />
                )}
              </div>
            ))}
          </Card>
        )}

        {/* After Upgrade Info */}
        {!isDisabled && impactItems.length > 0 && (
          <Alert type="info" className="mt-6">
            <Card padding="p-0" className="border-0 shadow-none">
              <Badge variant="default" size="md" className="font-medium mb-2 flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                {impactTitle}
              </Badge>
              <Card padding="p-0" className="space-y-1 border-0 shadow-none">
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
        <Card padding="p-0" className="mt-6 flex flex-col sm:flex-row justify-between gap-3 border-0 shadow-none">
          <Link to={returnPath}>
            <Button variant="secondary" disabled={isProcessing}>
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          {!isDisabled && (
            <Button
              variant="success"
              onClick={handleConfirmClick}
              disabled={isProcessing || !isFormValid}
            >
              {isProcessing ? processingLabel : actionButtonLabel}
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
            <Card padding="p-0" className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${themeClasses.bgSuccessLight} sm:mx-0 sm:h-10 sm:w-10 border-0 shadow-none`}>
              <ArrowUpCircleIcon className={`h-6 w-6 ${themeClasses.textSuccess}`} />
            </Card>
            <Card padding="p-0" className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1 border-0 shadow-none">
              <Badge variant="secondary" size="md" className={themeClasses.textSecondary}>
                {warningDescription}
              </Badge>

              <Card className={`mt-3 ${themeClasses.bgCard}`} padding="p-3">
                <Card padding="p-0" className="py-1 border-0 shadow-none">
                  <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted} inline`}>
                    {entityType}:
                  </Badge>
                  <Badge variant="default" size="sm" className={`ml-2 ${themeClasses.textPrimary} inline`}>
                    {getEntityDisplayName(entity)}
                  </Badge>
                </Card>
                {formFields.map(field => (
                  <Card key={field.name} padding="p-0" className="py-1 border-0 shadow-none">
                    <Badge variant="secondary" size="sm" className={`font-medium ${themeClasses.textMuted} inline`}>
                      {field.label}:
                    </Badge>
                    <Badge variant="default" size="sm" className={`ml-2 ${themeClasses.textPrimary} inline`}>
                      {getFieldDisplayValue(field)}
                    </Badge>
                  </Card>
                ))}
              </Card>

              <Badge variant="default" size="md" className={`mt-3 font-medium ${themeClasses.textPrimary} block`}>
                Are you sure you want to proceed?
              </Badge>
            </Card>
          </Card>

          <Card padding="p-0" className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 border-0 shadow-none">
            <Button
              variant="success"
              onClick={handleConfirmUpgrade}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? processingLabel : `Yes, Upgrade`}
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
function EntityActionUpgradePageWithTheme(props) {
  return (
    <UIXThemeProvider>
      <EntityActionUpgradePage {...props} />
    </UIXThemeProvider>
  );
}

export default EntityActionUpgradePageWithTheme;

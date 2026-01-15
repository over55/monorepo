// File: monorepo/web/frontend/src/components/business/views/EntityActionConfirmationPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Badge,
  Button,
  Alert,
  ContactLink,
  AddressDisplay,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

/**
 * Reusable EntityActionConfirmationPage component for confirmation-based actions
 * Used for archive, unarchive, ban, unban, delete, upgrade, downgrade, etc.
 *
 * @param {React.Component} entityIcon - Icon component for the entity type
 * @param {string} entityType - Type of entity (e.g., "Staff Member", "Customer")
 * @param {string} entityTypePlural - Plural form (e.g., "Staff", "Customers")
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} entityParamName - URL parameter name for entity ID (e.g., "aid", "cid")
 * @param {object} entityManager - Manager service for the entity
 * @param {function} getEntityDetail - Function to get entity details
 * @param {React.Component} actionIcon - Icon for the specific action
 * @param {string} actionName - Name of the action (e.g., "Archive", "Delete")
 * @param {string} actionDescription - Description of what the action does
 * @param {Array} actionWarningPoints - Array of warning points to display
 * @param {string} actionButtonText - Text for the action button
 * @param {string} actionButtonVariant - Variant for action button (danger, warning, etc.)
 * @param {function} onActionExecute - Function to execute the action
 * @param {string} successMessage - Message to show on success
 * @param {string} redirectPath - Path to redirect to after success
 * @param {Array} additionalBreadcrumbs - Additional breadcrumb items
 * @param {React.Node} additionalContent - Additional content to display
 * @param {object} entityDisplayOverrides - Override entity display logic
 * @param {function} buildFieldSections - Function to build custom field sections like EntityMorePage
 * @param {boolean} useInlineConfirmation - Use inline confirmation instead of modal
 * @param {string} inlineConfirmationText - Text to show in inline confirmation mode
 * @param {string} inlineConfirmButtonText - Button text in inline confirmation mode
 */
function EntityActionConfirmationPage({
  entityIcon: EntityIcon,
  entityType = "Item",
  entityTypePlural = "Items",
  basePath = "/admin",
  entityParamName = "id",
  entityManager, // eslint-disable-line no-unused-vars
  getEntityDetail,
  actionIcon: ActionIcon,
  actionName = "Action",
  actionDescription = "Perform this action",
  actionWarningPoints = [],
  actionButtonText = "Confirm",
  actionButtonVariant = "danger",
  onActionExecute,
  successMessage = "Action completed successfully",
  redirectPath = null,
  additionalBreadcrumbs = [],
  additionalContent = null,
  entityDisplayOverrides = {}, // eslint-disable-line no-unused-vars
  buildFieldSections = null,
  useInlineConfirmation = false,
  inlineConfirmationText = null,
  inlineConfirmButtonText = null,
}) {
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInlineConfirmation, setShowInlineConfirmation] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch entity details
  const fetchEntityDetails = useCallback(async () => {
    if (!entityId) return;

    setFetching(true);
    setErrors({});

    try {
      const entityData = await getEntityDetail(entityId, onUnauthorized);
      setEntity(entityData);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to fetch ${entityType.toLowerCase()}:`, error);
      }
      setErrors({ general: `Failed to load ${entityType.toLowerCase()} details` });
    } finally {
      setFetching(false);
    }
  }, [entityId, getEntityDetail, onUnauthorized, entityType]);

  // Initial load
  useEffect(() => {
    fetchEntityDetails();
  }, [fetchEntityDetails]);

  // Handle showing confirmation (either modal or inline)
  const handleShowConfirmation = () => {
    if (useInlineConfirmation) {
      setShowInlineConfirmation(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  // Handle going back from inline confirmation
  const handleBackFromConfirmation = () => {
    setShowInlineConfirmation(false);
  };

  // Handle action confirmation
  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    setShowInlineConfirmation(false);
    setErrors({});
    setFetching(true);

    try {
      await onActionExecute(entityId, onUnauthorized);
      setSuccessMsg(successMessage);

      // Navigate after delay
      setTimeout(() => {
        const targetPath = redirectPath || `${basePath}/${entityId}/more`;
        navigate(targetPath);
      }, 2000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to ${actionName.toLowerCase()}:`, error);
      }
      setErrors(error);
      setFetching(false);
    }
  };

  // Create status badge component
  const createStatusBadge = (entity) => {
    if (!entity) return null;
    if (entity.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XMarkIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (entity.status === 1) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        <ArrowPathIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
        Archived
      </Badge>
    );
  };

  // Breadcrumb configuration
  const breadcrumbs = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: entityTypePlural,
      to: basePath,
      icon: EntityIcon,
    },
    {
      label: "Detail",
      to: `${basePath}/${entityId}`,
      icon: EntityIcon,
    },
    {
      label: "More Actions",
      to: `${basePath}/${entityId}/more`,
      icon: EllipsisHorizontalIcon,
    },
    ...additionalBreadcrumbs,
    {
      label: actionName,
      icon: ActionIcon,
      isActive: true,
    },
  ];

  // Loading state
  if (isFetching && !entity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeClasses('border-primary')} mx-auto`}></div>
            <p className={`mt-4 text-sm sm:text-base ${getThemeClasses('text-secondary')}`}>
              Loading {entityType.toLowerCase()} details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Success Message */}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          className="mb-4"
        />
      )}

      {/* Error Display */}
      {errors.general && (
        <Alert
          type="error"
          message={errors.general}
          onClose={() => setErrors({})}
          className="mb-4"
        />
      )}

      {/* Main Content with Header like AttachmentListPage */}
      <div className="shadow-sm">
        {entity && (
          <div className={`rounded-lg ${getThemeClasses('form-card-header-bg') || getThemeClasses('bg-gradient-secondary')}`}>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${getThemeClasses('form-card-header-text') || 'text-white'}`}>
                  {ActionIcon && <ActionIcon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 flex-shrink-0 ${getThemeClasses('form-card-header-icon') || 'text-white/80'}`} />}
                  {entityType} - {actionName}
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    icon={ChevronLeftIcon}
                    className={getThemeClasses('detail-button-back')}
                  >
                    Back
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={fetchEntityDetails}
                    icon={ArrowPathIcon}
                    disabled={isFetching}
                    className={getThemeClasses('detail-button-edit')}
                  >
                    {isFetching ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg ${getThemeClasses('card-border')}`}>
              {/* Entity Summary Layout */}
              <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                {buildFieldSections ? (
                  /* Custom Field Sections Layout (like MoreView) */
                  <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                    {/* Avatar Section (if any exists) */}
                    {buildFieldSections(entity).find(section => section.type === 'avatar') && (
                      <div className="flex-shrink-0 order-1 xl:order-1">
                        {buildFieldSections(entity).find(section => section.type === 'avatar').component}
                      </div>
                    )}

                    {/* Main Content Container */}
                    <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                      {/* Primary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                        {buildFieldSections(entity)
                          .filter(section => section.column === 'primary')
                          .map((section, index) => (
                            <div key={index} className={section.className || ''}>
                              {section.component}
                            </div>
                          ))}
                      </div>

                      {/* Secondary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                        {buildFieldSections(entity)
                          .filter(section => section.column === 'secondary')
                          .map((section, index) => (
                            <div key={index} className={section.className || ''}>
                              {section.component}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default Entity Display Layout */
                  <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 order-1 xl:order-1">
                      <Avatar
                        src={entity.avatarObjectUrl}
                        alt={entity.avatarObjectUrl ? "Profile Picture" : "No Profile Picture"}
                        size="lg"
                        borderStyle="default"
                        showFallbackIcon={true}
                      />
                    </div>

                    {/* Main Content Container */}
                    <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                      {/* Primary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                        {/* Entity Name and Type */}
                        <div className="mb-3 sm:mb-4 lg:mb-5">
                          {entity.type === 3 && entity.organizationName && (
                            <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${getThemeClasses('text-primary')} flex items-center justify-center xl:justify-start mb-2`}>
                              <span className="break-words">
                                {entity.organizationName}
                              </span>
                            </h2>
                          )}
                          <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${getThemeClasses('text-primary')} flex items-center justify-center xl:justify-start`}>
                            <span className="break-words">
                              {entity.name || `${entity.firstName} ${entity.lastName}`}
                            </span>
                          </h3>
                          <div className={`mt-2 text-sm lg:text-base ${getThemeClasses('text-secondary')}`}>
                            <Badge variant="primary" size="md">
                              {entityType}
                            </Badge>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="mb-3 sm:mb-4 lg:mb-5">
                          <AddressDisplay
                            addressData={entity}
                            size="md"
                            showIcon={true}
                            showMapsLink={true}
                          />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2 sm:space-y-3">
                          <ContactLink
                            type="email"
                            value={entity.email}
                            size="md"
                            fallbackText="No email"
                          />
                          <ContactLink
                            type="phone"
                            value={entity.phone}
                            size="md"
                            fallbackText="No phone"
                          />
                          {entity.otherPhone && (
                            <ContactLink
                              type="phone"
                              value={entity.otherPhone}
                              size="md"
                              fallbackText="No phone"
                            />
                          )}
                        </div>
                      </div>

                      {/* Secondary Info Column */}
                      <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                        <div className={`space-y-2 text-xs sm:text-sm lg:text-base ${getThemeClasses('text-secondary')}`}>
                          <div className="flex items-center justify-center xl:justify-start">
                            <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-secondary')}`} />
                            <span className="font-medium">Status:</span>
                            <span className="ml-2">
                              {createStatusBadge(entity)}
                            </span>
                          </div>
                          {entity.createdAt && (
                            <div className="flex items-center justify-center xl:justify-start">
                              <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-secondary')}`} />
                              <span className="font-medium">Created:</span>
                              <span className="ml-2">
                                {formatDateForDisplay(entity.createdAt)}
                              </span>
                            </div>
                          )}
                          {entity.modifiedAt && (
                            <div className="flex items-center justify-center xl:justify-start">
                              <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-secondary')}`} />
                              <span className="font-medium">Last Modified:</span>
                              <span className="ml-2">
                                {formatDateForDisplay(entity.modifiedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Content Section */}
                <div className={`mt-8 border-t ${getThemeClasses('card-border')} pt-8`}>
                  {/* Inline Confirmation View */}
                  {useInlineConfirmation && showInlineConfirmation ? (
                    <>
                      {/* Inline Confirmation Message */}
                      <div className={`${getThemeClasses('alert-warning-bg')} ${getThemeClasses('alert-warning-border')} rounded-lg p-6 mb-6`}>
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className={`w-6 h-6 ${getThemeClasses('text-warning')} mt-1 mr-3 flex-shrink-0`} />
                          <div className="flex-1">
                            <p className={`text-lg font-semibold ${getThemeClasses('alert-warning-title')}`}>
                              {inlineConfirmationText || `You are about to ${actionName.toLowerCase()} this ${entityType.toLowerCase()}. Are you sure you want to do this?`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Content */}
                      {additionalContent}

                      {/* Inline Confirmation Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <Button
                          variant="secondary"
                          onClick={handleBackFromConfirmation}
                          icon={ChevronLeftIcon}
                          disabled={isFetching}
                          size="lg"
                        >
                          Back
                        </Button>

                        <Button
                          variant="success"
                          onClick={handleConfirmAction}
                          icon={ActionIcon}
                          disabled={isFetching}
                          size="lg"
                        >
                          {isFetching ? "Processing..." : (inlineConfirmButtonText || actionName)}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Warning Message */}
                      <div className={`${getThemeClasses('alert-warning-bg')} ${getThemeClasses('alert-warning-border')} rounded-lg p-6 mb-6`}>
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className={`w-6 h-6 ${getThemeClasses('text-warning')} mt-1 mr-3 flex-shrink-0`} />
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${getThemeClasses('alert-warning-title')} mb-2`}>
                              {actionDescription}
                            </h3>
                            {actionWarningPoints.length > 0 && (
                              <>
                                <p className={`${getThemeClasses('alert-warning-text')} mb-3`}>
                                  This action will:
                                </p>
                                <ul className={`space-y-2 ${getThemeClasses('alert-warning-text')} ml-4`}>
                                  {actionWarningPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className={`inline-block w-2 h-2 ${getThemeClasses('bg-warning')} rounded-full mt-1.5 mr-2 flex-shrink-0`}></span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                            <p className={`mt-4 font-semibold ${getThemeClasses('alert-warning-title')}`}>
                              Are you sure you would like to continue?
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Content */}
                      {additionalContent}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`${basePath}/${entityId}/more`)}
                          icon={ChevronLeftIcon}
                          disabled={isFetching}
                          size="lg"
                        >
                          Back to More
                        </Button>

                        <Button
                          variant={actionButtonVariant}
                          onClick={handleShowConfirmation}
                          icon={ActionIcon}
                          disabled={isFetching}
                          size="lg"
                        >
                          {isFetching ? "Processing..." : actionButtonText}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!entity && !isFetching && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${getThemeClasses('bg-disabled')} rounded-full mb-4`}>
              {EntityIcon && <EntityIcon className={`w-6 sm:w-8 h-6 sm:h-8 ${getThemeClasses('text-secondary')}`} />}
            </div>
            <h3 className={`text-base sm:text-lg font-medium ${getThemeClasses('text-primary')} mb-2`}>
              {entityType} Not Found
            </h3>
            <p className={`text-sm sm:text-base ${getThemeClasses('text-secondary')} mb-4 sm:mb-6`}>
              The {entityType.toLowerCase()} you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button
              variant="primary"
              onClick={() => window.history.back()}
              icon={ChevronLeftIcon}
              size="sm"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Background overlay */}
            <div
              className={`fixed inset-0 ${getThemeClasses('modal-backdrop')} transition-opacity`}
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className={`relative transform overflow-hidden rounded-lg ${getThemeClasses('bg-card')} text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg`}>
              <div className={`${getThemeClasses('bg-card')} px-4 pb-4 pt-5 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getThemeClasses('alert-error-bg')} sm:mx-0 sm:h-10 sm:w-10`}>
                    <ExclamationTriangleIcon
                      className={`h-6 w-6 ${getThemeClasses('text-error')}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className={`text-lg font-semibold leading-6 ${getThemeClasses('text-primary')}`}>
                      Confirm {actionName}
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${getThemeClasses('text-secondary')}`}>
                        <strong>Final Confirmation</strong>
                      </p>
                      <p className={`mt-2 text-sm ${getThemeClasses('text-secondary')}`}>
                        You are about to {actionName.toLowerCase()}{" "}
                        <strong>
                          {entity?.name || `${entity?.firstName} ${entity?.lastName}`}
                        </strong>
                        .
                      </p>
                      <p className={`mt-2 text-sm ${getThemeClasses('text-secondary')}`}>
                        {actionDescription}
                      </p>
                      <p className={`mt-3 text-sm font-medium ${getThemeClasses('text-error')}`}>
                        Are you absolutely sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${getThemeClasses('modal-footer-bg')} px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6`}>
                <Button
                  variant={actionButtonVariant}
                  onClick={handleConfirmAction}
                  disabled={isFetching}
                >
                  {isFetching ? "Processing..." : `Yes, ${actionName}`}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isFetching}
                  className="mt-3 sm:mt-0 sm:mr-3"
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
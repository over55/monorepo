// File: monorepo/web/frontend/src/components/business/views/EntityActionTogglePage.jsx

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
 * Reusable EntityActionTogglePage component for toggle-based actions
 * Used for 2FA enable/disable, etc.
 *
 * @param {React.Component} entityIcon - Icon component for the entity type
 * @param {string} entityType - Type of entity (e.g., "Staff Member", "Customer")
 * @param {string} entityTypePlural - Plural form (e.g., "Staff", "Customers")
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} entityParamName - URL parameter name for entity ID (e.g., "aid", "cid")
 * @param {object} entityManager - Manager service for the entity
 * @param {function} getEntityDetail - Function to get entity details
 * @param {React.Component} actionIcon - Icon for the specific action
 * @param {string} actionName - Name of the action (e.g., "Two-Factor Authentication")
 * @param {string} toggleProperty - Property name to check for current state (e.g., "otpEnabled")
 * @param {string} enabledText - Text to show when feature is enabled
 * @param {string} disabledText - Text to show when feature is disabled
 * @param {string} enableDescription - Description of what enabling does
 * @param {string} disableDescription - Description of what disabling does
 * @param {React.Component} enableIcon - Icon to show for enable action
 * @param {React.Component} disableIcon - Icon to show for disable action
 * @param {function} onToggleAction - Function to execute the toggle action
 * @param {string} enableSuccessMessage - Message to show on enable success
 * @param {string} disableSuccessMessage - Message to show on disable success
 * @param {string} redirectPath - Path to redirect to after success
 * @param {Array} additionalBreadcrumbs - Additional breadcrumb items
 * @param {React.Node} additionalContent - Additional content to display
 */
function EntityActionTogglePage({
  entityIcon,
  entityType = "Item",
  entityTypePlural = "Items",
  basePath = "/admin",
  entityParamName = "id",
  // eslint-disable-next-line no-unused-vars
  entityManager,
  getEntityDetail,
  actionIcon,
  actionName = "Toggle Feature",
  toggleProperty = "enabled",
  enabledText = "Feature is enabled",
  disabledText = "Feature is disabled",
  enableDescription = "Enable this feature",
  disableDescription = "Disable this feature",
  enableIcon,
  disableIcon,
  onToggleAction,
  enableSuccessMessage = "Feature has been enabled",
  disableSuccessMessage = "Feature has been disabled",
  redirectPath = null,
  additionalBreadcrumbs = [],
  additionalContent = null,
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
      console.error(`Failed to fetch ${entityType.toLowerCase()}:`, error);
      setErrors({ general: `Failed to load ${entityType.toLowerCase()} details` });
    } finally {
      setFetching(false);
    }
  }, [entityId, getEntityDetail, onUnauthorized, entityType]);

  // Initial load
  useEffect(() => {
    fetchEntityDetails();
  }, [fetchEntityDetails]);

  // Handle toggle confirmation
  const handleConfirmToggle = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      const newState = !entity[toggleProperty];
      await onToggleAction(entityId, newState, onUnauthorized);

      const message = newState ? enableSuccessMessage : disableSuccessMessage;
      setSuccessMsg(message);

      // Navigate after delay
      setTimeout(() => {
        const targetPath = redirectPath || `${basePath}/${entityId}/more`;
        navigate(targetPath);
      }, 2000);
    } catch (error) {
      console.error(`Failed to toggle ${actionName.toLowerCase()}:`, error);
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

  // Get current state
  const isCurrentlyEnabled = entity?.[toggleProperty] || false;
  const currentIcon = isCurrentlyEnabled ? disableIcon : enableIcon;
  const currentDescription = isCurrentlyEnabled ? disableDescription : enableDescription;
  const currentActionText = isCurrentlyEnabled ? "Disable" : "Enable";

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
      icon: entityIcon,
    },
    {
      label: "Detail",
      to: `${basePath}/${entityId}`,
      icon: entityIcon,
    },
    {
      label: "More Actions",
      to: `${basePath}/${entityId}/more`,
      icon: EllipsisHorizontalIcon,
    },
    ...additionalBreadcrumbs,
    {
      label: actionName,
      icon: actionIcon,
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
          <div className={`rounded-lg ${getThemeClasses('bg-gradient-secondary')}`}>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                  {actionIcon && <actionIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" />}
                  {entityType} - {actionName}
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    icon={ChevronLeftIcon}
                    className="flex-1 sm:flex-initial"
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={fetchEntityDetails}
                    icon={ArrowPathIcon}
                    disabled={isFetching}
                    className="flex-1 sm:flex-initial"
                  >
                    {isFetching ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg ${getThemeClasses('card-border')}`}>
              {/* Entity Summary Layout like DetailLiteView */}
              <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
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
                          <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
                          <span className="font-medium">Status:</span>
                          <span className="ml-2">
                            {createStatusBadge(entity)}
                          </span>
                        </div>
                        {entity.createdAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">
                              {formatDateForDisplay(entity.createdAt)}
                            </span>
                          </div>
                        )}
                        {entity.modifiedAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text-muted')}`} />
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

                {/* Action Content Section */}
                <div className={`mt-8 border-t ${getThemeClasses('card-border')} pt-8`}>
                  {/* Feature Information */}
                  <div className={`${isCurrentlyEnabled ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} border rounded-lg p-6 mb-6`}>
                    <div className="flex items-start">
                      {currentIcon && <currentIcon className={`w-6 h-6 ${isCurrentlyEnabled ? 'text-amber-600' : 'text-green-600'} mt-1 mr-3 flex-shrink-0`} />}
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${isCurrentlyEnabled ? 'text-amber-900' : 'text-green-900'} mb-2`}>
                          {currentDescription}
                        </h3>
                        <p className={`${isCurrentlyEnabled ? 'text-amber-800' : 'text-green-800'} mb-3`}>
                          {currentDescription}
                        </p>
                        <p className={`${isCurrentlyEnabled ? 'text-amber-700' : 'text-green-700'}`}>
                          Are you sure you want to continue?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className={`${getThemeClasses('bg-disabled')} border ${getThemeClasses('border-secondary')} rounded-lg p-4 mb-6`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getThemeClasses('text-primary')}`}>
                        Current {actionName} Status:
                      </span>
                      {isCurrentlyEnabled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          {enabledText}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getThemeClasses('bg-disabled')} ${getThemeClasses('text-secondary')}`}>
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {disabledText}
                        </span>
                      )}
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
                      variant={isCurrentlyEnabled ? "warning" : "primary"}
                      onClick={() => setShowConfirmModal(true)}
                      icon={currentIcon}
                      disabled={isFetching}
                      size="lg"
                    >
                      {isFetching ? "Processing..." : `${currentActionText} ${actionName}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!entity && !isFetching && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${getThemeClasses('bg-disabled')} rounded-full mb-4`}>
              {entityIcon && <entityIcon className={`w-6 sm:w-8 h-6 sm:h-8 ${getThemeClasses('text-muted')}`} />}
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
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            {/* Background overlay */}
            <div
              className={`fixed inset-0 ${getThemeClasses('bg-card')} bg-opacity-75 transition-opacity`}
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className={`relative transform overflow-hidden rounded-lg ${getThemeClasses('bg-card')} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
              <div className="sm:flex sm:items-start">
                <div
                  className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    isCurrentlyEnabled ? "bg-amber-100" : "bg-green-100"
                  }`}
                >
                  {currentIcon && <currentIcon className={`h-6 w-6 ${isCurrentlyEnabled ? 'text-amber-600' : 'text-green-600'}`} />}
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className={`text-lg font-semibold leading-6 ${getThemeClasses('text-primary')}`}>
                    Confirm {actionName} Change
                  </h3>
                  <div className="mt-2">
                    <p className={`text-sm ${getThemeClasses('text-secondary')}`}>
                      Are you sure you want to{" "}
                      {isCurrentlyEnabled ? "disable" : "enable"} {actionName.toLowerCase()} for this {entityType.toLowerCase()}?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant={isCurrentlyEnabled ? "warning" : "primary"}
                  onClick={handleConfirmToggle}
                  disabled={isFetching}
                >
                  {isFetching ? "Processing..." : "Confirm"}
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

export default EntityActionTogglePage;
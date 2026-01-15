// File: monorepo/web/frontend/src/components/business/views/EntityActionAvatarPage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  CameraIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Badge,
  Button,
  Alert,
  Breadcrumb,
  FormCard,
  PageHeader,
  Loading,
} from "../../UIX";
import { useAuthManager } from "../../../services/Services";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE_BYTES,
  MAX_AVATAR_FILE_SIZE_MB,
  FILE_UPLOAD_ERRORS,
  BYTES_PER_MB,
} from "../../../constants/FileUpload";
import { SUCCESS_MESSAGE_REDIRECT_DELAY } from "../../../constants/UI";

/**
 * EntityActionAvatarPage
 *
 * A pre-configured page for uploading/changing entity avatar/profile photo.
 * Handles file validation, preview, and upload with sensible defaults.
 *
 * @param {Object} props
 * @param {string} props.entityType - Display name of entity (e.g., "Speaker", "Customer")
 * @param {string} props.entityTypePlural - Plural form (e.g., "Speakers", "Customers")
 * @param {string} props.basePath - Base URL path (e.g., "/admin/speaker")
 * @param {string} props.listPath - Path to entity list (defaults to basePath + "s")
 * @param {string} props.entityParamName - URL param name for entity ID (default: "aid")
 * @param {React.Component} props.entityIcon - Icon component for the entity type
 * @param {Function} props.fetchEntity - Function to fetch entity: (id, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.executeUpload - Function to upload avatar: (formData, onSuccess, onError, onDone, onUnauthorized) => void
 * @param {Function} props.renderEntityInfo - Optional custom entity info renderer: (entity) => ReactNode
 * @param {string} props.successRedirectPath - Path to redirect after success (defaults to more page)
 * @param {number} props.archivedStatus - Status value indicating archived (default: 2)
 */
function EntityActionAvatarPage({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName = "aid",
  entityIcon,
  fetchEntity,
  executeUpload,
  renderEntityInfo,
  successRedirectPath,
  archivedStatus = 2,
}) {
  return (
    <UIXThemeProvider>
      <EntityActionAvatarPageContent
        entityType={entityType}
        entityTypePlural={entityTypePlural}
        basePath={basePath}
        listPath={listPath}
        entityParamName={entityParamName}
        entityIcon={entityIcon}
        fetchEntity={fetchEntity}
        executeUpload={executeUpload}
        renderEntityInfo={renderEntityInfo}
        successRedirectPath={successRedirectPath}
        archivedStatus={archivedStatus}
      />
    </UIXThemeProvider>
  );
}

const EntityActionAvatarPageContent = memo(function EntityActionAvatarPageContent({
  entityType,
  entityTypePlural,
  basePath,
  listPath,
  entityParamName,
  // eslint-disable-next-line no-unused-vars
  entityIcon,
  fetchEntity,
  executeUpload,
  renderEntityInfo,
  successRedirectPath,
  archivedStatus,
}) {
  // Get entity ID from URL params
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Refs
  const fileInputRef = useRef(null);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      bgDisabled: getThemeClasses("bg-disabled"),
      inputBorder: getThemeClasses("input-border"),
      inputFocusRing: getThemeClasses("input-focus-ring"),
      focusBorder: getThemeClasses("focus-border"),
      borderSecondary: getThemeClasses("border-secondary"),
      alertInfoBg: getThemeClasses("alert-info-bg"),
      alertInfoText: getThemeClasses("alert-info-text"),
      alertInfoHover: getThemeClasses("alert-info-hover"),
    }),
    [getThemeClasses]
  );

  // Compute list path
  const computedListPath = useMemo(() => {
    return listPath || `${basePath}s`;
  }, [listPath, basePath]);

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

  // Handle file selection
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];

    if (file) {
      // Check file type
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
        setErrors({ file: FILE_UPLOAD_ERRORS.INVALID_TYPE });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      // Check file size
      if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
        setErrors({ file: FILE_UPLOAD_ERRORS.FILE_TOO_LARGE });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      // File is valid
      setErrors({});
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      setErrors({ file: FILE_UPLOAD_ERRORS.NO_FILE_SELECTED });
      return;
    }

    setErrors({});
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append(`${entityType.toLowerCase()}_id`, entityId);
      formData.append("file", selectedFile);

      await executeUpload(
        formData,
        () => {
          // Success callback
          setSuccessMessage("Photo has been successfully updated");

          // Navigate after delay
          setTimeout(() => {
            const redirectPath = successRedirectPath || `${basePath}/${entityId}/more`;
            navigate(redirectPath);
          }, SUCCESS_MESSAGE_REDIRECT_DELAY);
        },
        (error) => {
          // Error callback
          if (import.meta.env.DEV) {
            console.error("Failed to upload avatar:", error);
          }
          setErrors(error);
          setIsUploading(false);
        },
        () => {
          // Done callback - handled in success/error
        },
        onUnauthorized
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to upload avatar:", error);
      }
      setErrors({ general: "Failed to upload photo" });
      setIsUploading(false);
    }
  }, [entityId, entityType, selectedFile, executeUpload, successRedirectPath, basePath, navigate, onUnauthorized]);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, []);

  // Handle error dismiss
  const handleErrorDismiss = useCallback(() => {
    setErrors({});
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(`${basePath}/${entityId}/more`);
  }, [navigate, basePath, entityId]);

  // Memoize file size display
  const fileSizeMB = useMemo(() => {
    if (!selectedFile) return null;
    return (selectedFile.size / BYTES_PER_MB).toFixed(2);
  }, [selectedFile]);

  // Memoize entity name
  const entityName = useMemo(() => {
    if (!entity) return "";
    return entity.name || `${entity.firstName} ${entity.lastName}`;
  }, [entity]);

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: entityTypePlural, to: computedListPath },
    { label: "Detail", to: `${basePath}/${entityId}` },
    { label: "More", to: `${basePath}/${entityId}/more` },
    { label: "Avatar" },
  ], [entityTypePlural, basePath, entityId, computedListPath]);

  // Render loading state
  if (isFetching && !entity) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center py-12 border-0 shadow-none">
          <Loading message={`Loading ${entityType.toLowerCase()} details...`} />
        </Card>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <Card padding="p-0" className="mb-8 border-0 shadow-none">
        <PageHeader
          title="Change Photo"
          subtitle={entityName}
          icon={CameraIcon}
        >
          <Card padding="p-0" className="flex items-center gap-2 border-0 shadow-none">
            {entity?.status === archivedStatus && (
              <Badge variant="secondary">Archived</Badge>
            )}
          </Card>
        </PageHeader>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          icon={CheckCircleIcon}
          className="mb-6"
        />
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert
          type="error"
          message={
            errors.file ||
            errors.message ||
            errors.detail ||
            errors.general ||
            "An error occurred. Please try again."
          }
          className="mb-6"
          onDismiss={handleErrorDismiss}
        />
      )}

      {/* Main Content Card */}
      <FormCard
        title="Upload Photo"
        icon={ArrowUpTrayIcon}
        description={`Change the ${entityType.toLowerCase()}'s profile photo`}
        maxWidth="4xl"
      >
        {/* Warning Message */}
        <Alert
          type="warning"
          icon={ExclamationTriangleIcon}
          className="mb-6"
        >
          <Card padding="p-0" className="space-y-2 border-0 shadow-none">
            <Badge variant="default" size="md" className="font-semibold block">
              Warning
            </Badge>
            <Badge variant="default" size="sm" className="block">
              Uploading a new photo will replace the existing one. The
              previous photo cannot be recovered.
            </Badge>
          </Card>
        </Alert>

        {/* File Upload Section */}
        <Card padding="p-0" className="mb-6 border-0 shadow-none">
          {selectedFile ? (
            <Alert type="success" className="mb-0">
              <Card padding="p-0" className="flex justify-between items-start w-full border-0 shadow-none">
                <Card padding="p-0" className="flex-1 border-0 shadow-none">
                  <Card padding="p-0" className="flex items-center mb-2 border-0 shadow-none">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <Badge variant="default" size="md" className="font-medium">
                      File ready to upload
                    </Badge>
                  </Card>
                  <Card padding="p-0" className="space-y-1 border-0 shadow-none">
                    <Badge variant="default" size="sm" className="block">
                      <Badge variant="secondary" size="sm" className="font-medium mr-1">
                        File name:
                      </Badge>
                      {selectedFile.name}
                    </Badge>
                    <Badge variant="default" size="sm" className="block">
                      <Badge variant="secondary" size="sm" className="font-medium mr-1">
                        File size:
                      </Badge>
                      {fileSizeMB} MB
                    </Badge>
                  </Card>
                </Card>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  icon={TrashIcon}
                >
                  Remove
                </Button>
              </Card>
            </Alert>
          ) : (
            <Card padding="p-0" className="border-0 shadow-none">
              <Badge
                variant="secondary"
                size="md"
                className={`block font-medium ${themeClasses.textSecondary} mb-2`}
              >
                Select Photo File
              </Badge>
              <input
                ref={fileInputRef}
                id="avatar-file-input"
                name="file"
                type="file"
                accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
                onChange={handleFileChange}
                disabled={isUploading}
                className={`block w-full text-sm ${themeClasses.textPrimary} border ${themeClasses.inputBorder} rounded-lg cursor-pointer ${themeClasses.bgCard} focus:outline-none ${themeClasses.inputFocusRing} ${themeClasses.focusBorder} disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium ${themeClasses.alertInfoBg} ${themeClasses.alertInfoText} ${themeClasses.alertInfoHover}`}
              />
              <Badge
                variant="secondary"
                size="sm"
                className={`mt-2 ${themeClasses.textMuted} block`}
              >
                Accepted formats: {ALLOWED_IMAGE_EXTENSIONS.join(", ")}.
                Maximum size: {MAX_AVATAR_FILE_SIZE_MB} MB.
              </Badge>
            </Card>
          )}
        </Card>

        {/* Entity Information */}
        {entity && renderEntityInfo && renderEntityInfo(entity)}

        {/* Action Buttons */}
        <Card
          padding="p-0"
          className={`flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t ${themeClasses.borderSecondary} border-0 shadow-none`}
        >
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            icon={ChevronLeftIcon}
            disabled={isUploading}
            className="flex-1"
          >
            Back to More
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            icon={CheckCircleIcon}
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            className="flex-1"
          >
            {isUploading ? "Uploading..." : "Save Photo"}
          </Button>
        </Card>
      </FormCard>
    </Card>
  );
});

EntityActionAvatarPageContent.displayName = "EntityActionAvatarPageContent";

export default EntityActionAvatarPage;

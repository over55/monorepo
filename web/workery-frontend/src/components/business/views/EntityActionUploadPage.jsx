// File: monorepo/web/frontend/src/components/business/views/EntityActionUploadPage.jsx

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
  TrashIcon,
  ArrowUpTrayIcon,
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
 * Reusable EntityActionUploadPage component for upload-based actions
 * Used for avatar uploads, document uploads, etc.
 *
 * @param {React.Component} entityIcon - Icon component for the entity type
 * @param {string} entityType - Type of entity (e.g., "Staff Member", "Customer")
 * @param {string} entityTypePlural - Plural form (e.g., "Staff", "Customers")
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} entityParamName - URL parameter name for entity ID (e.g., "aid", "cid")
 * @param {object} entityManager - Manager service for the entity
 * @param {function} getEntityDetail - Function to get entity details
 * @param {React.Component} actionIcon - Icon for the specific action
 * @param {string} actionName - Name of the action (e.g., "Upload Avatar")
 * @param {string} uploadDescription - Description of what is being uploaded
 * @param {Array} acceptedFileTypes - Array of accepted MIME types
 * @param {number} maxFileSizeMB - Maximum file size in MB
 * @param {function} onUploadExecute - Function to execute the upload
 * @param {string} successMessage - Message to show on success
 * @param {string} redirectPath - Path to redirect to after success
 * @param {Array} additionalBreadcrumbs - Additional breadcrumb items
 * @param {React.Node} additionalContent - Additional content to display
 * @param {string} fileInputLabel - Label for file input
 * @param {string} fileInputHelpText - Help text for file input
 * @param {string} warningMessage - Warning message to display
 */
function EntityActionUploadPage({
  entityIcon,
  entityType = "Item",
  entityTypePlural = "Items",
  basePath = "/admin",
  entityParamName = "id",
  // eslint-disable-next-line no-unused-vars
  entityManager,
  getEntityDetail,
  actionIcon,
  actionName = "Upload File",
  // eslint-disable-next-line no-unused-vars
  uploadDescription = "Upload a file",
  acceptedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  maxFileSizeMB = 10,
  onUploadExecute,
  successMessage = "File uploaded successfully",
  redirectPath = null,
  additionalBreadcrumbs = [],
  additionalContent = null,
  fileInputLabel = "Select File",
  fileInputHelpText = "Accepted formats: JPEG, PNG, GIF. Maximum size: 10 MB.",
  warningMessage = "Uploading a new file will replace the existing one. The previous file cannot be recovered.",
}) {
  const params = useParams();
  const entityId = params[entityParamName];
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        setErrors({
          file: `Invalid file type. Please upload one of: ${acceptedFileTypes.join(", ")}`,
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      // Check file size
      const maxSize = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSize) {
        setErrors({
          file: `File is too large. The maximum size is ${maxFileSizeMB} MB.`,
        });
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
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    setErrors({});
    setIsUploading(true);

    try {
      await onUploadExecute(entityId, selectedFile, onUnauthorized);
      setSuccessMsg(successMessage);

      // Navigate back after a short delay
      setTimeout(() => {
        const targetPath = redirectPath || `${basePath}/${entityId}/more`;
        navigate(targetPath);
      }, 2000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to upload:`, error);
      }
      setErrors(error);
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors({});
    // Reset the file input
    const fileInput = document.getElementById("upload-file-input");
    if (fileInput) {
      fileInput.value = null;
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

                {/* Upload Content Section */}
                <div className={`mt-8 border-t ${getThemeClasses('card-border')} pt-8`}>
                  {/* Warning Message */}
                  {warningMessage && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Warning:</strong> {warningMessage}
                      </div>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="mb-6">
                    {selectedFile ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center text-green-700 mb-2">
                              <CheckCircleIcon className="w-5 h-5 mr-2" />
                              <span className="font-medium">File ready to upload</span>
                            </div>
                            <div className={`text-sm ${getThemeClasses('text-secondary')} space-y-1`}>
                              <p>
                                <span className="font-medium">File name:</span>{" "}
                                {selectedFile.name}
                              </p>
                              <p>
                                <span className="font-medium">File size:</span>{" "}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                            icon={TrashIcon}
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={`block text-sm font-medium ${getThemeClasses('text-primary')} mb-2`}>
                          {fileInputLabel}
                        </label>
                        <div className="relative">
                          <input
                            id="upload-file-input"
                            name="file"
                            type="file"
                            accept={acceptedFileTypes.join(",")}
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className={`block w-full text-sm ${getThemeClasses('text-primary')} border ${getThemeClasses('input-border')} rounded-lg cursor-pointer ${getThemeClasses('bg-input')} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                          />
                        </div>
                        <p className={`mt-2 text-xs ${getThemeClasses('text-muted')}`}>
                          {fileInputHelpText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {errors.file && (
                    <Alert
                      type="error"
                      message={errors.file}
                      onClose={() => setErrors({})}
                      className="mb-6"
                    />
                  )}

                  {/* Additional Content */}
                  {additionalContent}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`${basePath}/${entityId}/more`)}
                      icon={ChevronLeftIcon}
                      disabled={isUploading}
                      size="lg"
                    >
                      Back to More
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      icon={isUploading ? null : ArrowUpTrayIcon}
                      disabled={!selectedFile || isUploading}
                      size="lg"
                    >
                      {isUploading ? "Uploading..." : `Upload ${actionName}`}
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
    </div>
  );
}

export default EntityActionUploadPage;
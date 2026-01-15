// File: monorepo/web/frontend/src/components/business/views/AttachmentAddView.jsx

import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { Breadcrumb, useUIXTheme, BackButton, CreateButton } from "../../UIX";

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Accepted file types for upload security
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

// Human-readable file type descriptions
const ACCEPTED_FILE_TYPES_DESCRIPTION = "PDF, Images (JPEG, PNG, GIF), Word, Excel, Text, CSV";

/**
 * Reusable AttachmentAddView component for adding attachments to any entity
 * Used for staff, customer, and other entity attachment creation
 *
 * @param {object} item - The main entity (staff, customer, etc.)
 * @param {string} itemType - Type of item (e.g., "Staff Member", "Customer")
 * @param {React.Component} itemIcon - Icon component for the item type
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} itemId - ID of the item for routing
 * @param {Array} breadcrumbs - Breadcrumb navigation items
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message if any
 * @param {function} onErrorClear - Function to clear error
 * @param {function} onItemFetch - Function to fetch item details (optional)
 * @param {function} onAttachmentUpload - Function to handle attachment upload
 * @param {function} onUnauthorized - Function to handle unauthorized access
 * @param {string} backPath - Path for back navigation
 * @param {string} backLabel - Label for back button
 * @param {string} pageTitle - Title for the page header
 * @param {React.Component} pageIcon - Icon for the page header
 * @param {string} alertMessage - Alert message to display
 * @param {string} alertType - Alert type (success/error)
 * @param {function} onAlertClear - Function to clear alert
 * @param {number} uploadProgress - Upload progress percentage
 * @param {string} entityType - Entity type constant for the attachment
 * @param {number} maxFileSize - Maximum file size in bytes (default: 50MB)
 */
function AttachmentAddView({
  item = null,
  itemType = "Item",
  // eslint-disable-next-line no-unused-vars
  itemIcon,
  // eslint-disable-next-line no-unused-vars
  basePath = "/admin",
  itemId,
  breadcrumbs = [],
  // eslint-disable-next-line no-unused-vars
  loading = false,
  error = null,
  onErrorClear = null,
  onItemFetch = null,
  onAttachmentUpload,
  onUnauthorized,
  backPath = "",
  backLabel = "Back",
  pageTitle = "Add Attachment",
  pageIcon: PageIcon = DocumentArrowUpIcon,
  alertMessage = "",
  alertType = "",
  onAlertClear = null,
  uploadProgress = 0,
  entityType,
  maxFileSize = MAX_FILE_SIZE,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch item details on mount
  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        setFetching(true);
        await onItemFetch(itemId, onUnauthorized);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch item:", error);
        }
        setErrors({ general: "Failed to load item details" });
      } finally {
        setFetching(false);
      }
    };

    if (onItemFetch) {
      fetchItemDetail();
    }
    window.scrollTo(0, 0);
  }, [itemId, onItemFetch, onUnauthorized]);

  // Event handlers
  const onHandleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file type (MIME type)
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setErrors({
          file: `Invalid file type. Accepted formats: ${ACCEPTED_FILE_TYPES_DESCRIPTION}`,
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        setErrors({
          file: `File size must be less than ${maxFileSize / (1024 * 1024)}MB`,
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      setSelectedFile(file);
      setErrors({});
    }
  };

  const onSubmitClick = async () => {
    if (import.meta.env.DEV) {
      console.log("onSubmitClick: Starting...");
    }
    setFetching(true);
    setErrors({});

    try {
      // Validate inputs
      if (!title || !title.trim()) {
        setErrors({ title: "Title is required" });
        setFetching(false);
        return;
      }

      if (!selectedFile) {
        setErrors({ file: "File is required" });
        setFetching(false);
        return;
      }

      // Prepare metadata
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        entityType: String(entityType),
        entityId: itemId,
      };

      // Upload attachment
      await onAttachmentUpload(
        selectedFile,
        metadata,
        onUnauthorized,
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to upload attachment:", error);
      }
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* Status Alerts */}
      {item && item.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This {itemType.toLowerCase()} is archived
        </div>
      )}

      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
            alertType === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {alertType === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{alertMessage}</span>
          </div>
          {onAlertClear && (
            <button
              onClick={onAlertClear}
              className="ml-4 hover:bg-white hover:bg-opacity-20 rounded p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Main Content Card */}
      <div className={`${getThemeClasses('bg-card')} shadow-sm rounded-lg`}>
        <div className={`px-6 py-5 ${getThemeClasses('bg-gradient-secondary')} rounded-t-lg`}>
          <h2 className="text-3xl font-bold text-white flex items-center">
            {PageIcon && <PageIcon className="w-8 h-8 mr-3 text-white/80" />}
            {pageTitle}
          </h2>
        </div>

        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${getThemeClasses('loading-spinner')} mx-auto`}></div>
                <p className={`mt-4 ${getThemeClasses('text-secondary')}`}>
                  {uploadProgress > 0
                    ? `Uploading... ${uploadProgress}%`
                    : "Processing..."}
                </p>
                {uploadProgress > 0 && (
                  <div className="mt-4 w-full max-w-xs mx-auto">
                    <div className={`${getThemeClasses('bg-disabled')} rounded-full h-2 overflow-hidden`}>
                      <div
                        className={`${getThemeClasses('progress-bar')} h-full transition-all duration-300`}
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {(errors.general || error) && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    <span>{errors.general || error}</span>
                  </div>
                  {onErrorClear && (
                    <button
                      onClick={onErrorClear}
                      className="ml-auto text-current hover:opacity-70"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* Form */}
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label
                    htmlFor="title"
                    className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter attachment title"
                    maxLength={255}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${getThemeClasses('input-focus-ring')} ${
                      errors.title
                        ? `${getThemeClasses('input-border-error')} text-red-900 placeholder-red-300`
                        : getThemeClasses('input-border')
                    } text-base`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label
                    htmlFor="description"
                    className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter attachment description (optional)"
                    maxLength={1000}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${getThemeClasses('input-focus-ring')} ${
                      errors.description
                        ? `${getThemeClasses('input-border-error')} text-red-900 placeholder-red-300`
                        : getThemeClasses('input-border')
                    } text-base`}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label
                    htmlFor="file"
                    className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}
                  >
                    File <span className="text-red-500">*</span>
                  </label>
                  {selectedFile ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              File ready to upload
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Name:</strong> {selectedFile.name}
                            </div>
                            <div>
                              <strong>Size:</strong>{" "}
                              {formatFileSize(selectedFile.size)}
                            </div>
                            <div>
                              <strong>Type:</strong>{" "}
                              {selectedFile.type || "Unknown"}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            document.getElementById("file-upload").value = null;
                          }}
                          className="ml-4 text-green-600 hover:text-green-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${getThemeClasses('border-secondary')} border-dashed rounded-lg hover:${getThemeClasses('border-secondary')} transition-colors`}>
                        <div className="space-y-1 text-center">
                          <DocumentArrowUpIcon className={`mx-auto h-12 w-12 ${getThemeClasses('text-muted')}`} />
                          <div className={`flex text-sm ${getThemeClasses('text-secondary')}`}>
                            <label
                              htmlFor="file-upload"
                              className={`relative cursor-pointer ${getThemeClasses('bg-card')} rounded-md font-medium ${getThemeClasses('link-primary')} focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${getThemeClasses('input-focus-ring')}`}
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv"
                                onChange={onHandleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className={`text-xs ${getThemeClasses('text-muted')}`}>
                            {ACCEPTED_FILE_TYPES_DESCRIPTION} up to {maxFileSize / (1024 * 1024)}MB
                          </p>
                        </div>
                      </div>
                      {errors.file && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.file}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={`flex justify-between items-center pt-6 border-t ${getThemeClasses('border-secondary')}`}>
                  {backPath && (
                    <BackButton
                      to={backPath}
                      label={backLabel}
                      size="lg"
                    />
                  )}
                  <CreateButton
                    onClick={onSubmitClick}
                    disabled={!title || !selectedFile || isFetching}
                    size="lg"
                    icon={CheckCircleIcon}
                  >
                    Save
                  </CreateButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttachmentAddView;
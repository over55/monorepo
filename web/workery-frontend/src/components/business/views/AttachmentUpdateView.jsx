// File: src/components/business/views/AttachmentUpdateView.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  useUIXTheme,
  BackButton,
  CreateButton,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

// Development-only logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args);

/**
 * Reusable Attachment Update View Component
 *
 * A flexible, entity-agnostic component for updating attachments across different entity types.
 * Provides consistent UI/UX while supporting customization for different entities.
 *
 * @param {Object} props - Component props
 * @param {string} props.itemId - The ID of the entity (staff, organization, etc.)
 * @param {string} props.attachmentId - The ID of the attachment to update
 * @param {string} props.itemType - Display name for the entity type (e.g., "Staff Member", "Organization")
 * @param {React.Component} props.itemIcon - Icon component for the entity
 * @param {Array} props.breadcrumbs - Breadcrumb navigation items
 * @param {Function} props.onAttachmentFetch - Function to fetch attachment details (attachmentId, onUnauthorized) => Promise
 * @param {Function} props.onAttachmentUpdate - Function to update attachment (attachmentId, updateData, onUnauthorized, progressCallback) => Promise
 * @param {Function} props.onUnauthorized - Callback for unauthorized access
 * @param {string} props.backPath - Path to navigate back to (attachments list)
 * @param {string} props.backLabel - Label for back button (e.g., "Back to Attachments")
 * @param {string} props.pageTitle - Title for the page header
 * @param {React.Component} props.pageIcon - Icon for the page header
 * @param {string} props.alertMessage - Alert message to display
 * @param {string} props.alertType - Type of alert (success/error)
 * @param {Function} props.onAlertClear - Function to clear alert
 * @param {number} props.uploadProgress - Upload progress (0-100)
 */
function AttachmentUpdateView({
  // eslint-disable-next-line no-unused-vars
  itemId,
  attachmentId,
  // eslint-disable-next-line no-unused-vars
  itemType,
  // eslint-disable-next-line no-unused-vars
  itemIcon,
  breadcrumbs,
  onAttachmentFetch,
  onAttachmentUpdate,
  onUnauthorized,
  backPath,
  backLabel,
  pageTitle,
  pageIcon: PageIcon,
  alertMessage,
  alertType,
  onAlertClear,
  uploadProgress = 0,
}) {
  const { getThemeClasses } = useUIXTheme();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });

  // File input state
  const [selectedFileName, setSelectedFileName] = useState("");

  // Use refs to track component lifecycle
  const isMounted = useRef(true);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Reset isMounted on every render (handles React Strict Mode remounts)
  isMounted.current = true;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch attachment details on mount
  useEffect(() => {
    // Skip if no attachment ID
    if (!attachmentId) {
      log("No attachmentId, skipping load");
      return;
    }

    // Skip if currently fetching (prevents double-fetch in React Strict Mode)
    if (isFetchingRef.current) {
      log("Already fetching (ref check), skipping");
      return;
    }

    const loadInitialData = async () => {
      try {
        // Set ref immediately to prevent double-fetch
        isFetchingRef.current = true;

        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);

        const attachmentData = await onAttachmentFetch(
          attachmentId,
          onUnauthorized,
        );

        // Always update state - React will handle updates gracefully
        setAttachment(attachmentData);
        setFormData({
          title: attachmentData.title || "",
          description: attachmentData.description || "",
          file: null,
        });
      } catch (err) {
        // Don't treat abort as an error
        if (err.name === "AbortError") {
          log("Request aborted");
          return;
        }

        error("Failed to fetch attachment details:", err);
        // Always update state - React will handle updates gracefully
        setAlert({
          type: "error",
          message: "Failed to load attachment details. Please try again.",
        });
      } finally {
        // Always reset isFetchingRef and setIsLoading, even if unmounted
        // React will handle state updates gracefully - this ensures the UI updates correctly
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachmentId]);

  // Handle input changes - memoized to prevent recreation
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user types
    setErrors((prev) => {
      if (prev[field]) {
        return {
          ...prev,
          [field]: undefined,
        };
      }
      return prev;
    });
  }, []);

  // Handle file selection - memoized to prevent recreation
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
      setSelectedFileName(file.name);

      // Clear file error
      setErrors((prev) => {
        if (prev.file) {
          return {
            ...prev,
            file: undefined,
          };
        }
        return prev;
      });
    }
  }, []);

  // Validate form - memoized to prevent recreation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Validate file if provided
    if (formData.file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (formData.file.size > maxFileSize) {
        newErrors.file = `File size must be less than 50MB`;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
      ];

      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "File type not allowed";
      }
    }

    return newErrors;
  }, [formData.title, formData.description, formData.file]);

  // Handle form submission - memoized to prevent recreation
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Clear previous alerts
    setAlert(null);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below",
      });
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      // Add file if user selected a new one
      if (formData.file) {
        updateData.file = formData.file;
      }

      // Update attachment
      await onAttachmentUpdate(
        attachmentId,
        updateData,
        onUnauthorized,
        formData.file ? null : null, // Progress callback handled externally
      );

      setAlert({
        type: "success",
        message: "Attachment updated successfully!",
      });

      // Let parent handle redirect timing
    } catch (err) {
      error("Failed to update attachment:", err);

      // Handle errors
      if (err && typeof err === "object") {
        // Field-specific errors
        const hasFieldErrors = Object.keys(err).some(
          (key) => key !== "message" && key !== "general",
        );

        if (hasFieldErrors) {
          setErrors(err);
          setAlert({
            type: "error",
            message:
              err.general ||
              err.message ||
              "Please correct the errors below",
          });
        } else {
          setAlert({
            type: "error",
            message:
              err.message || "Failed to update attachment. Please try again.",
          });
        }
      } else {
        setAlert({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData.title, formData.description, formData.file, attachmentId, onAttachmentUpdate, onUnauthorized]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeClasses('loading-spinner')} mx-auto`}></div>
          <p className={`mt-4 ${getThemeClasses('text-secondary')}`}>Loading attachment details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!attachment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className={`w-12 h-12 ${getThemeClasses('text-muted')} mx-auto mb-4`} />
          <p className={getThemeClasses('text-secondary')}>Attachment not found</p>
          <Link
            to={backPath}
            className={`mt-4 inline-flex items-center ${getThemeClasses('link-primary')}`}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  // Use external alert if provided, otherwise use internal
  const currentAlert = alertMessage ? { type: alertType, message: alertMessage } : alert;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Alert Messages */}
      {currentAlert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
            currentAlert.type === "success"
              ? getThemeClasses('alert-success')
              : getThemeClasses('alert-error')
          }`}
        >
          <div className="flex items-center">
            {currentAlert.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{currentAlert.message}</span>
          </div>
          <button
            onClick={() => {
              if (alertMessage && onAlertClear) {
                onAlertClear();
              } else {
                setAlert(null);
              }
            }}
            className={`ml-4 rounded p-1 ${getThemeClasses('hover-bg-muted')}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
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
          {isSaving ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${getThemeClasses('loading-spinner')} mx-auto`}></div>
                <p className={`mt-4 ${getThemeClasses('text-secondary')}`}>
                  {formData.file && uploadProgress > 0
                    ? `Uploading... ${uploadProgress}%`
                    : "Processing..."}
                </p>
                {formData.file && uploadProgress > 0 && (
                  <div className="mt-4 w-full max-w-xs mx-auto">
                    <div className={`${getThemeClasses('bg-muted')} rounded-full h-2 overflow-hidden`}>
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
              {/* Current File Info */}
              <div className={`mb-6 ${getThemeClasses('bg-muted')} rounded-lg px-4 py-3 border ${getThemeClasses('card-border')}`}>
                <h3 className={`text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>Current File</h3>
                <div className={`flex items-center text-sm ${getThemeClasses('text-secondary')}`}>
                  <DocumentIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {attachment.filename || attachment.fileName || "Unknown file"}
                  </span>
                  {attachment.fileType && (
                    <span className={`ml-2 ${getThemeClasses('text-muted')}`}>({attachment.fileType})</span>
                  )}
                </div>
                {attachment.createdAt && (
                  <p className={`text-xs ${getThemeClasses('text-muted')} mt-1`}>
                    Uploaded on {formatDateForDisplay(attachment.createdAt)}
                  </p>
                )}
              </div>

              {/* Update Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label
                      htmlFor="title"
                      className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}
                    >
                      Title <span className={getThemeClasses('text-error')}>*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${getThemeClasses('input-focus-ring')} ${
                        errors.title
                          ? `${getThemeClasses('input-border-error')} ${getThemeClasses('input-text-error')} ${getThemeClasses('input-placeholder-error')}`
                          : getThemeClasses('input-border')
                      } text-base`}
                      maxLength={255}
                    />
                    {errors.title && (
                      <p className={`mt-2 text-sm ${getThemeClasses('text-error')}`}>{errors.title}</p>
                    )}
                  </div>

                  {/* Description Field */}
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
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none ${getThemeClasses('input-focus-ring')} ${
                        errors.description
                          ? `${getThemeClasses('input-border-error')} ${getThemeClasses('input-text-error')} ${getThemeClasses('input-placeholder-error')}`
                          : getThemeClasses('input-border')
                      } text-base`}
                      maxLength={1000}
                    />
                    {errors.description && (
                      <p className={`mt-2 text-sm ${getThemeClasses('text-error')}`}>{errors.description}</p>
                    )}
                  </div>

                  {/* Replace File Field (Optional) */}
                  <div>
                    <label
                      htmlFor="file"
                      className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}
                    >
                      Replace File (Optional)
                    </label>
                    {selectedFileName ? (
                      <div className={`${getThemeClasses('alert-success')} px-4 py-3 rounded-lg`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <CheckCircleIcon className="w-5 h-5 mr-2" />
                              <span className="font-medium">
                                New file ready to upload
                              </span>
                            </div>
                            <div className="text-sm">
                              <strong>Name:</strong> {selectedFileName}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, file: null }));
                              setSelectedFileName("");
                            }}
                            className={`ml-4 ${getThemeClasses('text-success')} ${getThemeClasses('text-success-hover')}`}
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${getThemeClasses('input-border')} border-dashed rounded-lg ${getThemeClasses('input-border-hover')} transition-colors`}>
                          <div className="space-y-1 text-center">
                            <DocumentIcon className={`mx-auto h-12 w-12 ${getThemeClasses('text-muted')}`} />
                            <div className={`flex text-sm ${getThemeClasses('text-secondary')}`}>
                              <label
                                htmlFor="file"
                                className={`relative cursor-pointer rounded-md font-medium ${getThemeClasses('link-primary')} focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${getThemeClasses('input-focus-ring')}`}
                              >
                                <span>Upload a new file</span>
                                <input
                                  id="file"
                                  name="file"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className={`text-xs ${getThemeClasses('text-muted')}`}>
                              Any file type up to 50MB
                            </p>
                          </div>
                        </div>
                        {errors.file && (
                          <p className={`mt-2 text-sm ${getThemeClasses('text-error')}`}>{errors.file}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex justify-between items-center pt-6 border-t ${getThemeClasses('card-border')}`}>
                    <BackButton
                      to={backPath}
                      label={backLabel}
                      size="lg"
                    />
                    <CreateButton
                      onClick={handleSubmit}
                      disabled={!formData.title || isSaving}
                      size="lg"
                      icon={CheckCircleIcon}
                    >
                      {isSaving ? "Saving..." : "Update"}
                    </CreateButton>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttachmentUpdateView;
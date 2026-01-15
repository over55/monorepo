// File: src/components/UIX/EntityAttachmentAddPage/EntityAttachmentAddPage.jsx
// UIX Mobile Optimizations Applied
// Reusable entity attachment add/upload page component
//
// This component provides a complete page layout for uploading attachments
// to any entity type (staff, customer, organization, etc.) with validation,
// progress tracking, and error handling.
//
// Usage Example:
// <EntityAttachmentAddPage
//   config={{
//     entityId: "123",
//     entityType: "staff member",
//     ownershipType: ATTACHMENT_OWNERSHIP_TYPE.STAFF,
//     fetchEntity: async (id, onUnauthorized) => {...},
//     uploadAttachment: async (file, metadata, onProgress, onUnauthorized) => {...},
//     breadcrumbs: { items: [...] },
//     header: { title: "Add Attachment", icon: DocumentArrowUpIcon },
//     routes: { backPath: "/admin/staff/123/attachments" },
//   }}
// />

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { useNavigate } from "react-router";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  useUIXTheme,
  BackButton,
  CreateButton,
  Button,
  Input,
} from "../";

// Development-only logging
const DEBUG = process.env.NODE_ENV === 'development';
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args);

// Maximum file size (50MB)
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * EntityAttachmentAddPage Component
 *
 * A reusable whole-page component for uploading attachments to entities.
 *
 * @param {Object} props
 * @param {Object} props.config - Configuration object containing all settings
 *
 * Config Structure:
 * {
 *   // Core settings
 *   entityId: string,              // Entity ID
 *   entityType: string,            // Entity type for display (e.g., "staff member")
 *   ownershipType: number,         // ATTACHMENT_OWNERSHIP_TYPE constant
 *   maxFileSize: number,           // Optional: Max file size in bytes (default: 50MB)
 *
 *   // Data fetching functions
 *   fetchEntity: async (entityId, onUnauthorized) => entity,
 *   uploadAttachment: async (file, metadata, onProgress, onUnauthorized) => response,
 *
 *   // Navigation configuration
 *   breadcrumbs: {
 *     items: [{ label, to, icon, isActive }],  // Or function: (entity, entityId) => items
 *   },
 *
 *   // Header configuration
 *   header: {
 *     title: string,               // Page title (default: "Add Attachment")
 *     icon: Component,             // Icon component (default: DocumentArrowUpIcon)
 *   },
 *
 *   // Routes configuration
 *   routes: {
 *     backPath: string,            // Path for back button
 *     backLabel: string,           // Optional: Label for back button (default: "Back")
 *     successPath: string,         // Optional: Path to navigate to on success
 *   },
 *
 *   // Display configuration (optional)
 *   showEntityStatus: boolean,     // Show archived/status alerts (default: true)
 *   canUpload: (entity) => boolean, // Optional: Check if user can upload
 * }
 */
const EntityAttachmentAddPageContent = memo(
  function EntityAttachmentAddPageContent({ config }) {
    const navigate = useNavigate();
    const { getThemeClasses } = useUIXTheme();

    // Extract config values with defaults - all hooks MUST be before any conditional returns
    const {
      entityId,
      entityType = "entity",
      ownershipType,
      maxFileSize = DEFAULT_MAX_FILE_SIZE,
      fetchEntity,
      uploadAttachment,
      breadcrumbs,
      header,
      routes,
      showEntityStatus = true,
      canUpload,
    } = config || {};

    // Component states
    const [entity, setEntity] = useState(null);
    const [isFetching, setFetching] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    // Use refs to track component lifecycle
    const isMounted = useRef(true);
    const isFetchingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // Reset isMounted on every render (handles React Strict Mode remounts)
    isMounted.current = true;

    // Handle unauthorized access
    const onUnauthorized = useCallback(() => {
      navigate("/login?unauthorized=true");
    }, [navigate]);

    // Fetch entity data
    const fetchEntityData = useCallback(async () => {
      if (!fetchEntity || !entityId) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setFetching(true);
        log("[EntityAttachmentAddPage] Fetching entity data for ID:", entityId);
        const entityData = await fetchEntity(entityId, onUnauthorized);
        log("[EntityAttachmentAddPage] Entity data received:", entityData);
        if (isMounted.current) {
          setEntity(entityData);
        }
      } catch (err) {
        // Don't treat abort as an error
        if (err.name === "AbortError") {
          log("[EntityAttachmentAddPage] Request aborted");
          return;
        }

        error("[EntityAttachmentAddPage] Error fetching entity:", err);
        if (isMounted.current) {
          setErrors({ general: "Failed to load entity details" });
        }
      } finally {
        if (isMounted.current) {
          setFetching(false);
        }
      }
    }, [entityId, fetchEntity, onUnauthorized]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMounted.current = false;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    // Initial load
    useEffect(() => {
      // Skip if no entityId
      if (!entityId) {
        log("[EntityAttachmentAddPage] No entityId, skipping load");
        return;
      }

      // Skip if currently fetching (prevents double-fetch in React Strict Mode)
      if (isFetchingRef.current) {
        log("[EntityAttachmentAddPage] Already fetching (ref check), skipping");
        return;
      }

      const loadInitialData = async () => {
        try {
          // Set ref immediately to prevent double-fetch
          isFetchingRef.current = true;

          window.scrollTo(0, 0);
          if (fetchEntity) {
            await fetchEntityData();
          }
        } catch (err) {
          error("[EntityAttachmentAddPage] Error loading initial data:", err);
        } finally {
          if (isMounted.current) {
            isFetchingRef.current = false;
          }
        }
      };

      loadInitialData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityId]);

    // Format file size for display
    const formatFileSize = useCallback((bytes) => {
      if (!bytes) return "0 Bytes";
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
    }, []);

    // Handle file selection
    const handleFileChange = useCallback(
      (event) => {
        const file = event.target.files[0];

        if (file) {
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
      },
      [maxFileSize]
    );

    // Handle file removal
    const handleFileRemove = useCallback(() => {
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = null;
      }
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
      if (!uploadAttachment) {
        error("[EntityAttachmentAddPage] uploadAttachment function is required");
        return;
      }

      log("[EntityAttachmentAddPage] Starting upload...");
      setFetching(true);
      setErrors({});
      setUploadProgress(0);

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
          entityType: String(ownershipType),
          entityId: entityId,
        };

        log("[EntityAttachmentAddPage] Uploading with metadata:", metadata);

        // Upload attachment
        const result = await uploadAttachment(
          selectedFile,
          metadata,
          (progress) => {
            if (isMounted.current) {
              setUploadProgress(progress);
            }
          },
          onUnauthorized
        );

        log("[EntityAttachmentAddPage] Upload successful:", result);

        if (isMounted.current) {
          setAlertMessage("Attachment uploaded successfully!");
          setAlertType("success");

          // Navigate to success path if provided
          if (routes?.successPath) {
            setTimeout(() => {
              navigate(routes.successPath);
            }, 1500);
          }
        }
      } catch (err) {
        error("[EntityAttachmentAddPage] Upload failed:", err);
        if (isMounted.current) {
          setErrors(err);
          setAlertMessage("Failed to upload attachment");
          setAlertType("error");
        }
      } finally {
        if (isMounted.current) {
          setFetching(false);
          setUploadProgress(0);
        }
      }
    }, [
      uploadAttachment,
      title,
      description,
      selectedFile,
      ownershipType,
      entityId,
      onUnauthorized,
      routes,
      navigate,
    ]);

    // Build breadcrumb items
    const breadcrumbItems = useMemo(() => {
      if (!breadcrumbs) return [];

      if (typeof breadcrumbs.items === "function") {
        return breadcrumbs.items(entity, entityId);
      }

      return breadcrumbs.items || [];
    }, [breadcrumbs, entity, entityId]);

    // Check if upload is allowed
    const uploadAllowed = useMemo(() => {
      if (!canUpload) return true;
      return entity ? canUpload(entity) : false;
    }, [canUpload, entity]);

    // Header configuration
    const pageTitle = header?.title || "Add Attachment";
    const PageIcon = header?.icon || DocumentArrowUpIcon;
    const backPath = routes?.backPath || "";
    const backLabel = routes?.backLabel || "Back";

    // Validate required config - AFTER all hooks
    if (!config) {
      error("EntityAttachmentAddPage: config is required");
      return null;
    }

    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}

        {/* Status Alerts */}
        {showEntityStatus && entity && entity.status === 2 && (
          <div className={`mb-4 px-4 py-3 rounded-lg flex items-center ${getThemeClasses("alert-info")}`}>
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            This {entityType.toLowerCase()} is archived
          </div>
        )}

        {/* Alert Messages */}
        {alertMessage && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
              alertType === "success"
                ? getThemeClasses("alert-success")
                : getThemeClasses("alert-error")
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlertMessage("")}
              className="ml-4 hover:bg-white hover:bg-opacity-20"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Main Content Card */}
        <div className={`${getThemeClasses("bg-card")} shadow-sm rounded-lg`}>
          <div
            className={`px-6 py-5 ${getThemeClasses("bg-gradient-secondary")} rounded-t-lg`}
          >
            <h2 className="text-3xl font-bold text-white flex items-center">
              <PageIcon className="w-8 h-8 mr-3 text-white/80" />
              {pageTitle}
            </h2>
          </div>

          <div className="p-6">
            {isFetching && uploadProgress === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div
                    className={`animate-spin rounded-full h-10 w-10 border-b-2 ${getThemeClasses("loading-spinner")} mx-auto`}
                  ></div>
                  <p className={`mt-4 ${getThemeClasses("text-secondary")}`}>
                    Processing...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Error Display */}
                {errors.general && (
                  <div className={`mb-6 px-4 py-3 rounded-lg ${getThemeClasses("alert-error")}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                        <span>{errors.general}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setErrors({})}
                        className="ml-4 hover:opacity-70"
                        aria-label="Close"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                  {/* Title Input */}
                  <Input
                    id="title"
                    name="title"
                    label="Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter attachment title"
                    maxLength={255}
                    disabled={isFetching}
                    error={errors.title}
                  />

                  {/* Description Input */}
                  <Input
                    id="description"
                    name="description"
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter attachment description (optional)"
                    maxLength={1000}
                    disabled={isFetching}
                    error={errors.description}
                  />

                  {/* File Upload */}
                  <div>
                    <div className={`block text-base font-medium ${getThemeClasses("text-primary")} mb-2`}>
                      File <span className={getThemeClasses("text-error")}>*</span>
                    </div>
                    {selectedFile ? (
                      <div className={`px-4 py-3 rounded-lg ${getThemeClasses("alert-success")}`}>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleFileRemove}
                            disabled={isFetching}
                            className={`ml-4 ${getThemeClasses("text-success")} ${getThemeClasses("text-success-hover")}`}
                            aria-label="Remove file"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${getThemeClasses("border-dashed")} ${getThemeClasses("border-dashed-hover")}`}>
                          <div className="space-y-1 text-center">
                            <DocumentArrowUpIcon className={`mx-auto h-12 w-12 ${getThemeClasses("text-muted")}`} />
                            <div className={`flex text-sm ${getThemeClasses("text-secondary")}`}>
                              <label
                                htmlFor="file-upload"
                                className={`relative cursor-pointer rounded-md font-medium ${getThemeClasses("link-primary")} focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${getThemeClasses("input-focus-ring")}`}
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file"
                                  type="file"
                                  onChange={handleFileChange}
                                  disabled={isFetching}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className={`text-xs ${getThemeClasses("text-muted")}`}>
                              Any file type up to {maxFileSize / (1024 * 1024)}
                              MB
                            </p>
                          </div>
                        </div>
                        {errors.file && (
                          <p className={`mt-2 text-sm ${getThemeClasses("text-error")}`}>
                            {errors.file}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isFetching && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${getThemeClasses("text-secondary")}`}>
                          Uploading...
                        </span>
                        <span className={`text-sm font-medium ${getThemeClasses("text-primary")}`}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 overflow-hidden ${getThemeClasses("progress-bg")}`}>
                        <div
                          className={`${getThemeClasses("progress-bar")} h-full transition-all duration-300`}
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    className={`flex justify-between items-center pt-6 border-t ${getThemeClasses("border-secondary")}`}
                  >
                    {backPath && (
                      <BackButton to={backPath} label={backLabel} size="lg" />
                    )}
                    <CreateButton
                      onClick={handleSubmit}
                      disabled={
                        !title || !selectedFile || isFetching || !uploadAllowed
                      }
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
  },
  // Custom comparison for performance optimization
  (prevProps, nextProps) => {
    // Use reference equality for config object
    // Parent should memoize the config to prevent unnecessary re-renders
    return prevProps.config === nextProps.config;
  }
);

EntityAttachmentAddPageContent.displayName = "EntityAttachmentAddPageContent";

function EntityAttachmentAddPage(props) {
  return <EntityAttachmentAddPageContent {...props} />;
}

EntityAttachmentAddPage.displayName = "EntityAttachmentAddPage";

export default EntityAttachmentAddPage;

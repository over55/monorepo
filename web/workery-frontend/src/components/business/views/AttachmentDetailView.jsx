import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  useUIXTheme,
  BackButton,
  EditButton,
  DeleteButton,
  Button,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

// Development-only logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args);

function AttachmentDetailView({
  // eslint-disable-next-line no-unused-vars
  itemId,
  attachmentId,
  // eslint-disable-next-line no-unused-vars
  itemType,
  // eslint-disable-next-line no-unused-vars
  itemIcon: ItemIcon,
  breadcrumbs,
  onAttachmentFetch,
  onUnauthorized,
  backPath,
  backLabel,
  editPath,
  deletePath,
  pageTitle,
  // eslint-disable-next-line no-unused-vars
  pageIcon: PageIcon = DocumentTextIcon,
  alertMessage,
  alertType,
  onAlertClear,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState(null);

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

  const fetchAttachmentDetail = useCallback(async (id) => {
    log("🔄 AttachmentDetailView - fetchAttachmentDetail called", {
      id,
      hasOnAttachmentFetch: !!onAttachmentFetch
    });

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setFetching(true);
      setErrors({});

      log("📞 AttachmentDetailView - Calling onAttachmentFetch...");
      const response = await onAttachmentFetch(id, onUnauthorized);
      log("✅ AttachmentDetailView - Response received:", response);
      if (isMounted.current) {
        setAttachment(response);
      }
    } catch (err) {
      // Don't treat abort as an error
      if (err.name === "AbortError") {
        log("AttachmentDetailView - Request aborted");
        return;
      }

      error("❌ AttachmentDetailView - Failed to fetch attachment detail:", err);
      if (isMounted.current) {
        setErrors({ general: "Failed to load attachment details" });
      }
    } finally {
      log("🏁 AttachmentDetailView - Fetch completed, setting loading to false");
      if (isMounted.current) {
        setFetching(false);
      }
    }
  }, [onAttachmentFetch, onUnauthorized]);

  // Fetch data on mount
  useEffect(() => {
    log("🔧 AttachmentDetailView - useEffect triggered", {
      attachmentId,
      hasOnAttachmentFetch: !!onAttachmentFetch
    });

    // Skip if no attachmentId
    if (!attachmentId) {
      log("⚠️ AttachmentDetailView - No attachmentId provided");
      return;
    }

    // Skip if currently fetching (prevents double-fetch in React Strict Mode)
    if (isFetchingRef.current) {
      log("AttachmentDetailView - Already fetching (ref check), skipping");
      return;
    }

    const loadInitialData = async () => {
      try {
        // Set ref immediately to prevent double-fetch
        isFetchingRef.current = true;

        window.scrollTo(0, 0);
        log("📥 AttachmentDetailView - Starting fetch for attachment:", attachmentId);
        await fetchAttachmentDetail(attachmentId);
      } catch (err) {
        error("AttachmentDetailView - Error loading initial data:", err);
      } finally {
        if (isMounted.current) {
          isFetchingRef.current = false;
        }
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachmentId]);

  // Download handler
  const onDownloadClick = useCallback(async () => {
    try {
      if (!attachment) {
        return;
      }

      if (attachment.objectUrl || attachment.objectURL) {
        const downloadUrl = attachment.objectUrl || attachment.objectURL;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = attachment.filename || attachment.fileName || "download";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        log("No presigned URL found, refreshing attachment data...");
        await fetchAttachmentDetail(attachmentId);

        if (attachment && (attachment.objectUrl || attachment.objectURL)) {
          const downloadUrl = attachment.objectUrl || attachment.objectURL;
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = attachment.filename || attachment.fileName || "download";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      error("Failed to download attachment:", err);
    }
  }, [attachment, attachmentId, fetchAttachmentDetail]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
            alertType === "success"
              ? getThemeClasses('alert-success')
              : getThemeClasses('alert-error')
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
          <button
            onClick={onAlertClear}
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
            <PageIcon className="w-8 h-8 mr-3 text-white/80" />
            {pageTitle}
          </h2>
        </div>

        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${getThemeClasses('loading-spinner')} mx-auto`}></div>
                <p className={`mt-4 ${getThemeClasses('text-secondary')}`}>Loading attachment details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {errors.general && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${getThemeClasses('alert-error')}`}>
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    <span>{errors.general}</span>
                  </div>
                </div>
              )}

              {attachment && (
                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>
                      Title
                    </label>
                    <div className={`px-3 py-2 border ${getThemeClasses('input-border')} rounded-lg ${getThemeClasses('bg-input')} text-base`}>
                      {attachment.title || "N/A"}
                    </div>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>
                      Description
                    </label>
                    <div className={`px-3 py-2 border ${getThemeClasses('input-border')} rounded-lg ${getThemeClasses('bg-input')} text-base`}>
                      {attachment.description || "N/A"}
                    </div>
                  </div>

                  {/* File Field */}
                  <div>
                    <label className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>
                      File
                    </label>
                    <div className={`px-3 py-2 border ${getThemeClasses('input-border')} rounded-lg ${getThemeClasses('bg-input')} text-base flex items-center justify-between`}>
                      <span>
                        {attachment.filename || attachment.fileName || "Unknown file"}
                      </span>
                      <Button
                        onClick={onDownloadClick}
                        variant="outline"
                        size="sm"
                        icon={ArrowDownTrayIcon}
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Created At and Updated At Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Created At Field */}
                    <div>
                      <label className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>
                        Created At
                      </label>
                      <div className={`px-3 py-2 border ${getThemeClasses('input-border')} rounded-lg ${getThemeClasses('bg-input')} text-base flex items-center`}>
                        <CalendarIcon className={`w-4 h-4 mr-2 ${getThemeClasses('text-muted')}`} />
                        {attachment.createdAt ? formatDateForDisplay(attachment.createdAt) : "N/A"}
                      </div>
                    </div>

                    {/* Updated At Field */}
                    <div>
                      <label className={`block text-base font-medium ${getThemeClasses('text-primary')} mb-2`}>
                        Updated At
                      </label>
                      <div className={`px-3 py-2 border ${getThemeClasses('input-border')} rounded-lg ${getThemeClasses('bg-input')} text-base flex items-center`}>
                        <CalendarIcon className={`w-4 h-4 mr-2 ${getThemeClasses('text-muted')}`} />
                        {attachment.updatedAt ? formatDateForDisplay(attachment.updatedAt) : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex justify-between items-center pt-6 border-t ${getThemeClasses('border-secondary')}`}>
                    <BackButton
                      to={backPath}
                      label={backLabel}
                      size="lg"
                    />
                    <div className="flex gap-3">
                      {editPath && (
                        <EditButton
                          to={editPath}
                          size="lg"
                        />
                      )}
                      {deletePath && (
                        <DeleteButton
                          to={deletePath}
                          size="lg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttachmentDetailView;
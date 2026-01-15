// File: src/components/business/views/AttachmentDeleteView.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Breadcrumb,
  useUIXTheme,
  DeleteConfirmationCard,
  Alert,
} from "../../UIX";

// Development-only logging
const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log(...args);
const error = (...args) => console.error(...args);

/**
 * AttachmentDeleteView - A reusable view component for deleting attachments
 *
 * This component provides a consistent delete confirmation UI for attachments
 * across different entity types (staff, customers, events, etc.).
 */
function AttachmentDeleteView({
  entityId,
  attachmentId,
  // eslint-disable-next-line no-unused-vars
  itemType,
  itemIcon: ItemIcon, // eslint-disable-line no-unused-vars
  breadcrumbs,
  onAttachmentFetch,
  onEntityFetch,
  onAttachmentDelete,
  onUnauthorized,
  cancelPath,
  successRedirectPath,
  // eslint-disable-next-line no-unused-vars
  pageTitle,
  // eslint-disable-next-line no-unused-vars
  pageIcon: PageIcon = DocumentTextIcon,
  alertMessage: externalAlertMessage,
  alertType: externalAlertType,
  onAlertClear: externalOnAlertClear,
  successMessage = "Attachment deleted successfully",
  redirectDelay = 1500,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [successState, setSuccessState] = useState("");
  const [attachment, setAttachment] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [entity, setEntity] = useState(null);
  const [confirmText, setConfirmText] = useState("");

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

  // Fetch attachment and entity data
  const fetchData = useCallback(async () => {
    log("🔄 AttachmentDeleteView - fetchData called", {
      entityId,
      attachmentId,
    });

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setErrorState(null);

      // Build fetch promises
      const fetchPromises = [
        onAttachmentFetch(attachmentId, onUnauthorized),
      ];

      // Only fetch entity if callback is provided
      if (onEntityFetch) {
        fetchPromises.push(onEntityFetch(entityId, onUnauthorized));
      }

      const results = await Promise.all(fetchPromises);

      if (isMounted.current) {
        setAttachment(results[0]);
        if (results[1]) {
          setEntity(results[1]);
        }
      }
    } catch (err) {
      // Don't treat abort as an error
      if (err.name === "AbortError") {
        log("AttachmentDeleteView - Request aborted");
        return;
      }

      error("❌ AttachmentDeleteView - Failed to fetch data:", err);
      if (isMounted.current) {
        setErrorState(err.message || "Failed to load attachment details");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [entityId, attachmentId, onAttachmentFetch, onEntityFetch, onUnauthorized]);

  // Initial data load
  useEffect(() => {
    // Skip if no IDs
    if (!entityId || !attachmentId) {
      log("⚠️ AttachmentDeleteView - No entityId or attachmentId, skipping load");
      return;
    }

    // Skip if currently fetching (prevents double-fetch in React Strict Mode)
    if (isFetchingRef.current) {
      log("AttachmentDeleteView - Already fetching (ref check), skipping");
      return;
    }

    const loadInitialData = async () => {
      try {
        // Set ref immediately to prevent double-fetch
        isFetchingRef.current = true;
        window.scrollTo(0, 0);
        await fetchData();
      } catch (err) {
        error("AttachmentDeleteView - Error loading initial data:", err);
      } finally {
        if (isMounted.current) {
          isFetchingRef.current = false;
        }
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, attachmentId]);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    const expectedName =
      attachment?.title || attachment?.name || "Untitled Attachment";

    if (!attachment || confirmText !== expectedName) {
      setErrorState(`Please type '${expectedName}' to confirm deletion`);
      return;
    }

    try {
      setIsDeleting(true);
      setErrorState(null);

      await onAttachmentDelete(attachmentId, onUnauthorized);

      if (isMounted.current) {
        setSuccessState(successMessage);
      }

      // Redirect after delay if path provided
      if (successRedirectPath) {
        setTimeout(() => {
          if (isMounted.current) {
            window.location.href = successRedirectPath;
          }
        }, redirectDelay);
      }
    } catch (err) {
      error("❌ AttachmentDeleteView - Failed to delete attachment:", err);
      if (isMounted.current) {
        setErrorState(
          err.message || "Failed to delete attachment. Please try again."
        );
      }
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  }, [
    attachment,
    confirmText,
    attachmentId,
    onAttachmentDelete,
    onUnauthorized,
    successMessage,
    successRedirectPath,
    redirectDelay,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (cancelPath) {
      window.location.href = cancelPath;
    }
  }, [cancelPath]);

  // Clear error
  const handleErrorClear = useCallback(() => {
    setErrorState(null);
  }, []);

  // Combined alert handling
  const alertMessage = externalAlertMessage || successState;
  const alertType = externalAlertType || (successState ? "success" : null);
  const onAlertClear = externalOnAlertClear || (() => setSuccessState(""));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

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
          <button
            onClick={onAlertClear}
            className={`ml-4 rounded p-1 ${getThemeClasses("hover-bg-muted")}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Success Message from deletion */}
      {successState && !alertMessage && (
        <Alert type="success" message={successState} className="mb-6" />
      )}

      {/* Error Message */}
      {errorState && (
        <Alert
          type="error"
          message={errorState}
          onDismiss={handleErrorClear}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div
              className={`animate-spin rounded-full h-10 w-10 border-b-2 ${getThemeClasses("loading-spinner")} mx-auto`}
            ></div>
            <p className={`mt-4 ${getThemeClasses("text-secondary")}`}>
              Loading attachment details...
            </p>
          </div>
        </div>
      ) : attachment ? (
        <DeleteConfirmationCard
          item={{
            ...attachment,
            name: attachment.title || attachment.name || "Untitled Attachment",
          }}
          itemType="Attachment"
          isDeleting={isDeleting}
          error={errorState}
          confirmText={confirmText}
          onConfirmTextChange={setConfirmText}
          onDelete={handleDelete}
          onCancel={handleCancel}
          onErrorClear={handleErrorClear}
        />
      ) : (
        <Alert type="error" message="Attachment not found" className="mb-6" />
      )}
    </div>
  );
}

export default AttachmentDeleteView;

// File: src/components/UIX/EntityAttachmentDeletePage/EntityAttachmentDeletePage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router";
import { TrashIcon } from "@heroicons/react/24/outline";
import { UIXThemeProvider } from "../";
import AttachmentDeleteView from "../../business/views/AttachmentDeleteView";

/**
 * EntityAttachmentDeletePage - A reusable page component for entity attachment deletion
 *
 * This component provides a complete attachment delete confirmation page with consistent
 * layout, data fetching, and error handling. It's designed to work with any entity type
 * (staff, customers, events, etc.) by accepting configuration props.
 *
 * @example
 * // Usage in a Staff attachment delete page:
 * const config = {
 *   entityType: "Staff",
 *   entityIdParam: "aid",
 *   attachmentIdParam: "atid",
 *   onAttachmentFetch: attachmentManager.getAttachmentDetail,
 *   onEntityFetch: staffManager.getStaffDetail,
 *   onAttachmentDelete: attachmentManager.deleteAttachment,
 *   routes: {
 *     cancelPath: "/admin/staff/{entityId}/attachment/{attachmentId}",
 *     successRedirectPath: "/admin/staff/{entityId}/attachments",
 *     buildBreadcrumbs: (entityId, attachmentId) => [...],
 *   },
 *   header: {
 *     pageTitle: "Delete Attachment",
 *     pageIcon: TrashIcon,
 *   },
 *   messages: {
 *     successMessage: "Attachment deleted successfully",
 *   },
 * };
 * return <EntityAttachmentDeletePage config={config} />;
 */
const EntityAttachmentDeletePage = memo(({ config }) => {
  const navigate = useNavigate();
  const params = useParams();

  // Extract IDs from URL parameters - memoized to prevent repeated access
  const entityId = useMemo(
    () => params[config.entityIdParam || "id"],
    [params, config.entityIdParam]
  );

  const attachmentId = useMemo(
    () => params[config.attachmentIdParam || "aid"],
    [params, config.attachmentIdParam]
  );

  // Component states
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  // Unauthorized callback - memoized to prevent recreation
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Clear alert callback - memoized once
  const onAlertClear = useCallback(() => {
    setAlertMessage("");
    setAlertStatus("");
  }, []);

  // Fetch attachment details wrapper - properly memoized
  const onAttachmentFetch = useCallback(
    async (attachmentIdParam, onUnauthorizedCallback) => {
      try {
        return await config.onAttachmentFetch(
          attachmentIdParam,
          onUnauthorizedCallback || onUnauthorized
        );
      } catch (error) {
        setAlertMessage(error.message || "Failed to load attachment details");
        setAlertStatus("error");
        throw error;
      }
    },
    [config, onUnauthorized]
  );

  // Fetch entity details wrapper - optional
  const onEntityFetch = useMemo(() => {
    if (!config.onEntityFetch) return null;
    return async (entityIdParam, onUnauthorizedCallback) => {
      try {
        return await config.onEntityFetch(
          entityIdParam,
          onUnauthorizedCallback || onUnauthorized
        );
      } catch (error) {
        // Entity fetch errors are non-critical, just log
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch entity:", error);
        }
        return null;
      }
    };
  }, [config, onUnauthorized]);

  // Delete attachment wrapper - properly memoized
  const onAttachmentDelete = useCallback(
    async (attachmentIdParam, onUnauthorizedCallback) => {
      try {
        return await config.onAttachmentDelete(
          attachmentIdParam,
          onUnauthorizedCallback || onUnauthorized
        );
      } catch (error) {
        setAlertMessage(error.message || "Failed to delete attachment");
        setAlertStatus("error");
        throw error;
      }
    },
    [config, onUnauthorized]
  );

  // Build breadcrumbs - memoized to prevent recreation
  const breadcrumbs = useMemo(() => {
    if (!config.routes?.buildBreadcrumbs) {
      return [];
    }
    return config.routes.buildBreadcrumbs(entityId, attachmentId);
  }, [config.routes, entityId, attachmentId]);

  // Build paths - memoized to prevent expensive string operations
  const paths = useMemo(() => {
    const cancelPath = config.routes?.cancelPath
      ? config.routes.cancelPath
          .replace("{entityId}", entityId)
          .replace("{attachmentId}", attachmentId)
      : null;

    const successRedirectPath = config.routes?.successRedirectPath
      ? config.routes.successRedirectPath
          .replace("{entityId}", entityId)
          .replace("{attachmentId}", attachmentId)
      : null;

    return { cancelPath, successRedirectPath };
  }, [
    config.routes,
    entityId,
    attachmentId,
  ]);

  // Memoize header configuration
  const headerConfig = useMemo(
    () => ({
      itemType: config.header?.itemType || config.entityType,
      itemIcon: config.header?.itemIcon || TrashIcon,
      pageTitle: config.header?.pageTitle || "Delete Attachment",
      pageIcon: config.header?.pageIcon || TrashIcon,
    }),
    [config.header, config.entityType]
  );

  // Memoize messages configuration
  const messagesConfig = useMemo(
    () => ({
      successMessage:
        config.messages?.successMessage || "Attachment deleted successfully",
      redirectDelay: config.messages?.redirectDelay || 1500,
    }),
    [config.messages]
  );

  return (
    <UIXThemeProvider>
      <AttachmentDeleteView
        itemType={headerConfig.itemType}
        itemIcon={headerConfig.itemIcon}
        entityId={entityId}
        attachmentId={attachmentId}
        breadcrumbs={breadcrumbs}
        onAttachmentFetch={onAttachmentFetch}
        onEntityFetch={onEntityFetch}
        onAttachmentDelete={onAttachmentDelete}
        onUnauthorized={onUnauthorized}
        cancelPath={paths.cancelPath}
        successRedirectPath={paths.successRedirectPath}
        pageTitle={headerConfig.pageTitle}
        pageIcon={headerConfig.pageIcon}
        alertMessage={alertMessage}
        alertType={alertStatus}
        onAlertClear={onAlertClear}
        successMessage={messagesConfig.successMessage}
        redirectDelay={messagesConfig.redirectDelay}
      />
    </UIXThemeProvider>
  );
});

// Add display name for better debugging
EntityAttachmentDeletePage.displayName = "EntityAttachmentDeletePage";

export default EntityAttachmentDeletePage;

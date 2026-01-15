// File: src/components/UIX/EntityAttachmentDetailPage/EntityAttachmentDetailPage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { UIXThemeProvider } from "../";
import AttachmentDetailView from "../../business/views/AttachmentDetailView";

/**
 * EntityAttachmentDetailPage - A reusable page component for entity attachment detail management
 *
 * This component provides a complete attachment detail page with consistent layout,
 * data fetching, and error handling. It's designed to work with any entity type
 * (staff, customers, events, etc.) by accepting configuration props.
 */
const EntityAttachmentDetailPage = memo(({ config }) => {
  const navigate = useNavigate();
  const params = useParams();

  // Extract IDs from URL parameters - memoized to prevent repeated access
  const entityId = useMemo(
    () => params[config.entityIdParam || "id"],
    [params, config.entityIdParam],
  );

  const attachmentId = useMemo(
    () => params[config.attachmentIdParam || "aid"],
    [params, config.attachmentIdParam],
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
          onUnauthorizedCallback || onUnauthorized,
        );
      } catch (error) {
        setAlertMessage(error.message || "Failed to load attachment details");
        setAlertStatus("error");
        throw error;
      }
    },
    [config, onUnauthorized],
  );

  // Build breadcrumbs - memoized to prevent recreation
  const breadcrumbs = useMemo(() => {
    if (!config.routes.buildBreadcrumbs) {
      return [];
    }
    return config.routes.buildBreadcrumbs(entityId, attachmentId);
  }, [config.routes, entityId, attachmentId]);

  // Build paths - memoized to prevent expensive string operations
  const paths = useMemo(() => {
    const backPath = config.routes.backPath
      ? config.routes.backPath.replace("{entityId}", entityId)
      : `/admin/${config.entityType}s`;

    const editPath = config.routes.editPath
      ? config.routes.editPath
          .replace("{entityId}", entityId)
          .replace("{attachmentId}", attachmentId)
      : null;

    const deletePath = config.routes.deletePath
      ? config.routes.deletePath
          .replace("{entityId}", entityId)
          .replace("{attachmentId}", attachmentId)
      : null;

    return { backPath, editPath, deletePath };
  }, [config.routes, config.entityType, entityId, attachmentId]);

  // Memoize header configuration
  const headerConfig = useMemo(
    () => ({
      itemType: config.header.itemType || config.entityType,
      itemIcon: config.header.itemIcon || DocumentTextIcon,
      backLabel: config.header.backLabel || "Back to Attachments",
      pageTitle:
        config.header.pageTitle || `${config.entityType} - Attachment Detail`,
      pageIcon: config.header.pageIcon || DocumentTextIcon,
    }),
    [config],
  );

  return (
    <UIXThemeProvider>
      <AttachmentDetailView
        itemType={headerConfig.itemType}
        itemIcon={headerConfig.itemIcon}
        itemId={entityId}
        attachmentId={attachmentId}
        breadcrumbs={breadcrumbs}
        onAttachmentFetch={onAttachmentFetch}
        onUnauthorized={onUnauthorized}
        backPath={paths.backPath}
        backLabel={headerConfig.backLabel}
        editPath={paths.editPath}
        deletePath={paths.deletePath}
        pageTitle={headerConfig.pageTitle}
        pageIcon={headerConfig.pageIcon}
        alertMessage={alertMessage}
        alertType={alertStatus}
        onAlertClear={onAlertClear}
      />
    </UIXThemeProvider>
  );
});

// Add display name for better debugging
EntityAttachmentDetailPage.displayName = "EntityAttachmentDetailPage";

export default EntityAttachmentDetailPage;

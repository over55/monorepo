// File: src/components/UIX/EntityAttachmentUpdatePage/EntityAttachmentUpdatePage.jsx
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
} from "react";
import { useNavigate, useParams } from "react-router";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { UIXThemeProvider } from "../";
import AttachmentUpdateView from "../../business/views/AttachmentUpdateView";

/**
 * EntityAttachmentUpdatePage - A reusable page component for entity attachment update management
 *
 * This component provides a complete attachment update page with consistent layout,
 * data fetching, and error handling.
 */
const EntityAttachmentUpdatePage = memo(({ config }) => {
  const navigate = useNavigate();
  const params = useParams();
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  // Reset isMounted on every render (handles React Strict Mode remounts)
  isMounted.current = true;

  // Extract IDs from URL parameters - memoized
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

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Memoized callbacks
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const onAlertClear = useCallback(() => {
    setAlertMessage("");
    setAlertStatus("");
  }, []);

  // Fetch attachment details wrapper - memoized
  const onAttachmentFetch = useCallback(
    async (attachmentIdParam) => {
      try {
        return await config.onAttachmentFetch(
          attachmentIdParam,
          onUnauthorized,
        );
      } catch (error) {
        if (isMounted.current) {
          setAlertMessage(error.message || "Failed to load attachment details");
          setAlertStatus("error");
        }
        throw error;
      }
    },
    [config, onUnauthorized],
  );

  // Build redirect path - memoized helper
  const buildRedirectPath = useCallback(
    (path) => {
      if (!path) return null;
      return path
        .replace("{entityId}", entityId)
        .replace("{attachmentId}", attachmentId);
    },
    [entityId, attachmentId],
  );

  // Update attachment wrapper - memoized
  const onAttachmentUpdate = useCallback(
    async (attachmentIdParam, updateData, onUnauthorizedCallback) => {
      try {
        const response = await config.onAttachmentUpdate(
          attachmentIdParam,
          updateData,
          onUnauthorizedCallback || onUnauthorized,
        );

        // Check if mounted before updating state
        if (!isMounted.current) return response;

        setAlertMessage("Attachment updated successfully!");
        setAlertStatus("success");

        // Navigate to success redirect path after successful update
        const redirectPath = buildRedirectPath(
          config.routes.successRedirectPath || config.routes.backPath,
        );

        if (redirectPath) {
          timeoutRef.current = setTimeout(() => {
            // Check if still mounted before navigating
            if (isMounted.current) {
              navigate(redirectPath);
            }
          }, 2000);
        }

        return response;
      } catch (error) {
        // Check if mounted before updating state in error handler
        if (isMounted.current) {
          setAlertMessage(error.message || "Failed to update attachment");
          setAlertStatus("error");
        }
        throw error;
      }
    },
    [config, buildRedirectPath, navigate, onUnauthorized],
  );

  // Build breadcrumbs - properly memoized
  const breadcrumbs = useMemo(() => {
    if (!config.routes.buildBreadcrumbs) {
      return [];
    }
    return config.routes.buildBreadcrumbs(entityId, attachmentId);
  }, [config.routes, entityId, attachmentId]);

  // Build paths - memoized
  const paths = useMemo(() => {
    const backPath = config.routes.backPath
      ? buildRedirectPath(config.routes.backPath)
      : `/admin/${config.entityType}s`;

    return { backPath };
  }, [config.routes, config.entityType, buildRedirectPath]);

  // Memoize header configuration
  const headerConfig = useMemo(
    () => ({
      entityType: config.header.entityType || config.entityType,
      entityIcon: config.header.entityIcon || PencilSquareIcon,
      basePath: config.header.basePath || `/admin/${config.entityType}s`,
      backLabel: config.header.backLabel || "Back to Detail",
      pageTitle:
        config.header.pageTitle || `${config.entityType} - Update Attachment`,
      pageIcon: config.header.pageIcon || PencilSquareIcon,
    }),
    [config],
  );

  return (
    <UIXThemeProvider>
      <AttachmentUpdateView
        entityType={headerConfig.entityType}
        entityIcon={headerConfig.entityIcon}
        basePath={headerConfig.basePath}
        entityId={entityId}
        attachmentId={attachmentId}
        breadcrumbs={breadcrumbs}
        onAttachmentFetch={onAttachmentFetch}
        onAttachmentUpdate={onAttachmentUpdate}
        onUnauthorized={onUnauthorized}
        backPath={paths.backPath}
        backLabel={headerConfig.backLabel}
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
EntityAttachmentUpdatePage.displayName = "EntityAttachmentUpdatePage";

export default EntityAttachmentUpdatePage;

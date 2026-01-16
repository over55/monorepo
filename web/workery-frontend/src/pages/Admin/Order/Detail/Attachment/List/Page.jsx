// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/List/Page.jsx
// UIX Upgraded - Uses EntityAttachmentListPage whole page component
// @uix-page: AdminOrderDetailAttachmentListPage

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  XCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_TYPES } from "../../../../../../constants/Attachment";
import {
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
} from "../../../../../../constants/Order";
import { EntityAttachmentListPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminOrderDetailAttachmentListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "oid",
    entityType: "order",

    // Default pagination settings
    defaultPageSize: 50,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await orderManager.getOrderDetail(entityId, onUnauthorized);
    },

    fetchAttachments: async (params, onUnauthorized, forceRefresh, entity) => {
      attachmentManager.clearAttachmentsCache();
      // Use the MongoDB ObjectID from the entity (order.id) for ownership filtering
      const attachmentParams = {
        ...params,
        ownershipId: entity?.id, // Use MongoDB ObjectID, not the public ID
        ownershipRole: ATTACHMENT_TYPES.ORDER,
      };
      return await attachmentManager.getAttachments(attachmentParams, onUnauthorized, forceRefresh);
    },

    // Attachment query parameters
    attachmentParams: {
      ownershipRole: ATTACHMENT_TYPES.ORDER,
    },

    // Header configuration
    header: {
      title: "Attachments",
      icon: PaperClipIcon,
      loadingText: "Loading attachments...",
      notFoundTitle: "Order Not Found",
      notFoundMessage: "The order you're looking for doesn't exist or you don't have permission to view it.",
      notFoundAction: {
        label: "Back to Orders",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/orders"),
      },
    },

    // Routes configuration
    routes: {
      buildBreadcrumbs: (entity, entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
        { label: "Detail", to: `/admin/order/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", icon: PaperClipIcon, isActive: true },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/order/${entityId}` },
        { label: "Detail", to: `/admin/order/${entityId}/full` },
        { label: "Activity Sheets", to: `/admin/order/${entityId}/activity-sheets` },
        { label: "Tasks", to: `/admin/order/${entityId}/tasks` },
        { label: "Comments", to: `/admin/order/${entityId}/comments` },
        { label: "Attachments", to: `/admin/order/${entityId}/attachments`, isActive: true },
        { label: "More", to: `/admin/order/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      buildActionButtons: (entity, entityId, nav) => [
        {
          variant: "outline",
          label: "Back",
          icon: ChevronLeftIcon,
          onClick: () => nav("/admin/orders"),
        },
      ],

      // Attachment route paths
      addPath: "/admin/order/{entityId}/attachments/add",
      viewPath: "/admin/order/{entityId}/attachment/{attachmentId}",
      editPath: "/admin/order/{entityId}/attachment/{attachmentId}/edit",
      deletePath: "/admin/order/{entityId}/attachment/{attachmentId}/delete",
    },

    // Field sections for entity display (empty for attachment list)
    buildFieldSections: (entity) => [],

    // Alert configurations
    buildAlerts: (entity) => ({
      declined: entity?.status === ORDER_STATUS_DECLINED ? {
        message: "This order has been declined",
        icon: XCircleIcon,
        type: "error",
      } : null,
      cancelled: entity?.status === ORDER_STATUS_CANCELLED ? {
        message: "This order is cancelled",
        icon: NoSymbolIcon,
        type: "warning",
      } : null,
      archived: entity?.status === ORDER_STATUS_ARCHIVED ? {
        message: "This order is archived",
        icon: ArchiveBoxIcon,
        type: "info",
      } : null,
    }),

    // Control whether attachments can be added
    canAddAttachments: (entity) => entity && ![
      ORDER_STATUS_DECLINED,
      ORDER_STATUS_CANCELLED,
      ORDER_STATUS_COMPLETED_AND_PAID,
      ORDER_STATUS_ARCHIVED,
    ].includes(entity.status),

    // Click handlers
    onAttachmentClick: (attachment, entityId, nav) => {
      nav(`/admin/order/${entityId}/attachment/${attachment.id}`);
    },

    onDeleteAttachment: (attachment, entityId, nav) => {
      nav(`/admin/order/${entityId}/attachment/${attachment.id}/delete`);
    },
  }), [attachmentManager, orderManager, navigate]);

  return (
    <UIXThemeProvider>
      <EntityAttachmentListPage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailAttachmentListPage;

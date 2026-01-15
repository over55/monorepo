// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Delete/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDeletePage whole page component
// @uix-page: AdminOrderDetailAttachmentDeletePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
} from "../../../../../../services/Services";
import { EntityAttachmentDeletePage } from "../../../../../../components/UIX";

function AdminOrderDetailAttachmentDeletePage() {
  const { oid, aid } = useParams();
  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();

  // Configuration for EntityAttachmentDeletePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Order",
    entityIdParam: "oid",
    attachmentIdParam: "aid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    onEntityFetch: async (entityId, onUnauthorized) => {
      return await orderManager.getOrderDetail(entityId, onUnauthorized);
    },

    // Delete function
    onAttachmentDelete: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.deleteAttachment(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      cancelPath: `/admin/order/${oid}/attachment/${aid}`,
      successRedirectPath: `/admin/order/${oid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
        { label: "Detail", to: `/admin/order/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/order/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Delete", icon: TrashIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      itemType: "Order",
      itemIcon: WrenchScrewdriverIcon,
      pageTitle: "Delete Attachment",
      pageIcon: TrashIcon,
    },

    // Messages configuration
    messages: {
      successMessage: "Attachment deleted successfully",
      redirectDelay: 1500,
    },
  }), [oid, aid, attachmentManager, orderManager]);

  return <EntityAttachmentDeletePage config={config} />;
}

export default AdminOrderDetailAttachmentDeletePage;

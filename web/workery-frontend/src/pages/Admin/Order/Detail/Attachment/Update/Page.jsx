// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Update/Page.jsx
// UIX Upgraded - Uses EntityAttachmentUpdatePage whole page component
// @uix-page: AdminOrderDetailAttachmentUpdatePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentUpdatePage } from "../../../../../../components/UIX";

function AdminOrderDetailAttachmentUpdatePage() {
  const { oid, aid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentUpdatePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Order",
    entityIdParam: "oid",
    attachmentIdParam: "aid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    onAttachmentUpdate: async (attachmentId, updateData, onUnauthorized, progressCallback) => {
      return await attachmentManager.updateAttachment(attachmentId, updateData, onUnauthorized, progressCallback);
    },

    // Routes configuration
    routes: {
      cancelPath: `/admin/order/${oid}/attachments`,
      successRedirectPath: `/admin/order/${oid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
        { label: "Detail", to: `/admin/order/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/order/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Update", icon: PencilSquareIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      title: "Update Attachment",
      subtitle: "Update the attachment information and optionally replace the file",
      icon: PencilSquareIcon,
      itemType: "Order",
      itemIcon: WrenchScrewdriverIcon,
    },

    // Messages configuration
    messages: {
      successMessage: "Attachment updated successfully!",
      redirectDelay: 1500,
    },
  }), [oid, aid, attachmentManager]);

  return <EntityAttachmentUpdatePage config={config} />;
}

export default AdminOrderDetailAttachmentUpdatePage;

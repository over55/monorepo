// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Detail/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDetailPage whole page component
// @uix-page: AdminOrderDetailAttachmentDetailPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentDetailPage } from "../../../../../../components/UIX";

function AdminOrderDetailAttachmentDetailPage() {
  const { oid, aid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentDetailPage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Order",
    entityIdParam: "oid",
    attachmentIdParam: "aid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      backPath: `/admin/order/${oid}/attachments`,
      editPath: `/admin/order/${oid}/attachment/${aid}/edit`,
      deletePath: `/admin/order/${oid}/attachment/${aid}/delete`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
        { label: "Detail (Attachments)", to: `/admin/order/${entityId}/attachments`, icon: ClipboardDocumentListIcon },
        { label: "Attachment", icon: DocumentIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      title: "Work Order - Attachment Detail",
      icon: WrenchScrewdriverIcon,
      itemType: "Order",
      itemIcon: WrenchScrewdriverIcon,
    },
  }), [oid, aid, attachmentManager]);

  return <EntityAttachmentDetailPage config={config} />;
}

export default AdminOrderDetailAttachmentDetailPage;

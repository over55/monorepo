// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Detail/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDetailPage whole page component
// @uix-page: AdminCustomerDetailAttachmentDetailPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentDetailPage } from "../../../../../../components/UIX";

function AdminCustomerDetailAttachmentDetailPage() {
  const { cid, aid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentDetailPage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Customer",
    entityIdParam: "cid",
    attachmentIdParam: "aid",

    // Data fetching function
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      backPath: `/admin/customer/${cid}/attachments`,
      editPath: `/admin/customer/${cid}/attachment/${aid}/edit`,
      deletePath: `/admin/customer/${cid}/attachment/${aid}/delete`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Customers", to: "/admin/customers", icon: UserIcon },
        { label: "Detail", to: `/admin/customer/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Attachment", icon: DocumentTextIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      itemType: "Customer",
      itemIcon: UserIcon,
      backLabel: "Back to Attachments",
      pageTitle: "Customer - Attachment Detail",
      pageIcon: DocumentTextIcon,
    },
  }), [cid, aid, attachmentManager]);

  return <EntityAttachmentDetailPage config={config} />;
}

export default AdminCustomerDetailAttachmentDetailPage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Detail/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDetailPage whole page component
// @uix-page: AdminAssociateDetailAttachmentDetailPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentDetailPage } from "../../../../../../components/UIX";

function AdminAssociateDetailAttachmentDetailPage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentDetailPage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Associate",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching function
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      backPath: `/admin/associate/${aid}/attachments`,
      editPath: `/admin/associate/${aid}/attachment/${atid}/edit`,
      deletePath: `/admin/associate/${aid}/attachment/${atid}/delete`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
        { label: "Detail", to: `/admin/associate/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Attachment", icon: DocumentTextIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      itemType: "Associate",
      itemIcon: UserGroupIcon,
      backLabel: "Back to Attachments",
      pageTitle: "Associate - Attachment Detail",
      pageIcon: DocumentTextIcon,
    },
  }), [aid, atid, attachmentManager]);

  return <EntityAttachmentDetailPage config={config} />;
}

export default AdminAssociateDetailAttachmentDetailPage;

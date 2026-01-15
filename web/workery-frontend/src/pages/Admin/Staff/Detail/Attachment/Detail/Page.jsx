// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Detail/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDetailPage whole page component
// @uix-page: AdminStaffDetailAttachmentDetailPage

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

function AdminStaffDetailAttachmentDetailPage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentDetailPage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Staff",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching function
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      backPath: `/admin/staff/${aid}/attachments`,
      editPath: `/admin/staff/${aid}/attachment/${atid}/edit`,
      deletePath: `/admin/staff/${aid}/attachment/${atid}/delete`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: "Staff",
          to: "/admin/staff",
          icon: UserIcon,
        },
        {
          label: "Detail",
          to: `/admin/staff/${entityId}`,
          icon: ClipboardDocumentListIcon,
        },
        {
          label: "Attachments",
          to: `/admin/staff/${entityId}/attachments`,
          icon: PaperClipIcon,
        },
        {
          label: "Attachment",
          icon: DocumentTextIcon,
          isActive: true,
        },
      ],
    },

    // Header configuration
    header: {
      itemType: "Staff Member",
      itemIcon: UserIcon,
      backLabel: "Back to Attachments",
      pageTitle: "Staff - Attachment Detail",
      pageIcon: DocumentTextIcon,
    },
  }), [aid, atid, attachmentManager]);

  return <EntityAttachmentDetailPage config={config} />;
}

export default AdminStaffDetailAttachmentDetailPage;

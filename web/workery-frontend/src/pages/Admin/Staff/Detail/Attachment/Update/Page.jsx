// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Update/Page.jsx
// UIX Upgraded - Uses EntityAttachmentUpdatePage whole page component
// @uix-page: AdminStaffAttachmentUpdatePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentUpdatePage } from "../../../../../../components/UIX";

function AdminStaffAttachmentUpdatePage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentUpdatePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Staff",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching function
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Update function
    onAttachmentUpdate: async (attachmentId, updateData, onUnauthorized) => {
      return await attachmentManager.updateAttachment(
        attachmentId,
        updateData,
        onUnauthorized
      );
    },

    // Routes configuration
    routes: {
      backPath: `/admin/staff/${aid}/attachment/${atid}`,
      successRedirectPath: `/admin/staff/${aid}/attachments`,
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
          label: "Update",
          icon: PencilSquareIcon,
          isActive: true,
        },
      ],
    },

    // Header configuration
    header: {
      entityType: "Staff Member",
      entityIcon: UserIcon,
      basePath: "/admin/staff",
      backLabel: "Back to Attachment",
      pageTitle: "Update Attachment",
      pageIcon: PencilSquareIcon,
    },
  }), [aid, atid, attachmentManager]);

  return <EntityAttachmentUpdatePage config={config} />;
}

export default AdminStaffAttachmentUpdatePage;

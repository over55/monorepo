// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Delete/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDeletePage whole page component
// @uix-page: AdminStaffDetailAttachmentDeletePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  PaperClipIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useStaffManager,
} from "../../../../../../services/Services";
import { EntityAttachmentDeletePage } from "../../../../../../components/UIX";

function AdminStaffDetailAttachmentDeletePage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();
  const staffManager = useStaffManager();

  // Configuration for EntityAttachmentDeletePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Staff",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    onEntityFetch: async (entityId, onUnauthorized) => {
      return await staffManager.getStaffDetail(entityId, onUnauthorized);
    },

    // Delete function
    onAttachmentDelete: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.deleteAttachment(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      cancelPath: `/admin/staff/${aid}/attachment/${atid}`,
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
          label: "Delete",
          icon: TrashIcon,
          isActive: true,
        },
      ],
    },

    // Header configuration
    header: {
      itemType: "Staff Member",
      itemIcon: UserIcon,
      pageTitle: "Delete Attachment",
      pageIcon: TrashIcon,
    },

    // Messages configuration
    messages: {
      successMessage: "Attachment deleted successfully",
      redirectDelay: 1500,
    },
  }), [aid, atid, attachmentManager, staffManager]);

  return <EntityAttachmentDeletePage config={config} />;
}

export default AdminStaffDetailAttachmentDeletePage;

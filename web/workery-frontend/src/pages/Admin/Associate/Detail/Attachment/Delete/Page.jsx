// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Delete/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDeletePage whole page component
// @uix-page: AdminAssociateDetailAttachmentDeletePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperClipIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useAssociateManager,
} from "../../../../../../services/Services";
import { EntityAttachmentDeletePage } from "../../../../../../components/UIX";

function AdminAssociateDetailAttachmentDeletePage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Configuration for EntityAttachmentDeletePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Associate",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    onEntityFetch: async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
    },

    // Delete function
    onAttachmentDelete: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.deleteAttachment(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      cancelPath: `/admin/associate/${aid}/attachment/${atid}`,
      successRedirectPath: `/admin/associate/${aid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
        { label: "Detail", to: `/admin/associate/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Delete", icon: TrashIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      itemType: "Associate",
      itemIcon: UserGroupIcon,
      pageTitle: "Delete Attachment",
      pageIcon: TrashIcon,
    },

    // Messages configuration
    messages: {
      successMessage: "Attachment deleted successfully",
      redirectDelay: 1500,
    },
  }), [aid, atid, attachmentManager, associateManager]);

  return <EntityAttachmentDeletePage config={config} />;
}

export default AdminAssociateDetailAttachmentDeletePage;

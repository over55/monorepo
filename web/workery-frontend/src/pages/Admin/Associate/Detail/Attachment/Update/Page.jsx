// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Update/Page.jsx
// UIX Upgraded - Uses EntityAttachmentUpdatePage whole page component
// @uix-page: AdminAssociateAttachmentUpdatePage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAttachmentManager } from "../../../../../../services/Services";
import { EntityAttachmentUpdatePage } from "../../../../../../components/UIX";

function AdminAssociateAttachmentUpdatePage() {
  const { aid, atid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentUpdatePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Associate",
    entityIdParam: "aid",
    attachmentIdParam: "atid",

    // Data fetching function
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    // Update function
    onAttachmentUpdate: async (attachmentId, updateData, onUnauthorized) => {
      return await attachmentManager.updateAttachment(attachmentId, updateData, onUnauthorized);
    },

    // Routes configuration
    routes: {
      backPath: `/admin/associate/${aid}/attachment/${atid}`,
      successRedirectPath: `/admin/associate/${aid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
        { label: "Detail", to: `/admin/associate/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Update", icon: PencilSquareIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      entityType: "Associate",
      entityIcon: UserGroupIcon,
      basePath: "/admin/associates",
      backLabel: "Back to Attachment",
      pageTitle: "Update Attachment",
      pageIcon: PencilSquareIcon,
    },
  }), [aid, atid, attachmentManager]);

  return <EntityAttachmentUpdatePage config={config} />;
}

export default AdminAssociateAttachmentUpdatePage;

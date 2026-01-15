// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Update/Page.jsx
// UIX Upgraded - Uses EntityAttachmentUpdatePage whole page component
// @uix-page: AdminCustomerAttachmentUpdatePage

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

function AdminCustomerAttachmentUpdatePage() {
  const { cid, aid } = useParams();
  const attachmentManager = useAttachmentManager();

  // Configuration for EntityAttachmentUpdatePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Customer",
    entityIdParam: "cid",
    attachmentIdParam: "aid",

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
      backPath: `/admin/customer/${cid}/attachment/${aid}`,
      successRedirectPath: `/admin/customer/${cid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Customers", to: "/admin/customers", icon: UserIcon },
        { label: "Detail", to: `/admin/customer/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Update", icon: PencilSquareIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      entityType: "Customer",
      entityIcon: UserIcon,
      basePath: "/admin/customers",
      backLabel: "Back to Attachment",
      pageTitle: "Update Attachment",
      pageIcon: PencilSquareIcon,
    },
  }), [cid, aid, attachmentManager]);

  return <EntityAttachmentUpdatePage config={config} />;
}

export default AdminCustomerAttachmentUpdatePage;

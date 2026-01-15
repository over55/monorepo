// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Delete/Page.jsx
// UIX Upgraded - Uses EntityAttachmentDeletePage whole page component
// @uix-page: AdminCustomerDetailAttachmentDeletePage

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
  useCustomerManager,
} from "../../../../../../services/Services";
import { EntityAttachmentDeletePage } from "../../../../../../components/UIX";

function AdminCustomerDetailAttachmentDeletePage() {
  const { cid, aid } = useParams();
  const attachmentManager = useAttachmentManager();
  const customerManager = useCustomerManager();

  // Configuration for EntityAttachmentDeletePage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Customer",
    entityIdParam: "cid",
    attachmentIdParam: "aid",

    // Data fetching functions
    onAttachmentFetch: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.getAttachmentDetail(attachmentId, onUnauthorized);
    },

    onEntityFetch: async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },

    // Delete function
    onAttachmentDelete: async (attachmentId, onUnauthorized) => {
      return await attachmentManager.deleteAttachment(attachmentId, onUnauthorized);
    },

    // Routes configuration
    routes: {
      cancelPath: `/admin/customer/${cid}/attachment/${aid}`,
      successRedirectPath: `/admin/customer/${cid}/attachments`,
      buildBreadcrumbs: (entityId, attachmentId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Customers", to: "/admin/customers", icon: UserIcon },
        { label: "Detail", to: `/admin/customer/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Delete", icon: TrashIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      itemType: "Customer",
      itemIcon: UserIcon,
      pageTitle: "Delete Attachment",
      pageIcon: TrashIcon,
    },

    // Messages configuration
    messages: {
      successMessage: "Attachment deleted successfully",
      redirectDelay: 1500,
    },
  }), [cid, aid, attachmentManager, customerManager]);

  return <EntityAttachmentDeletePage config={config} />;
}

export default AdminCustomerDetailAttachmentDeletePage;

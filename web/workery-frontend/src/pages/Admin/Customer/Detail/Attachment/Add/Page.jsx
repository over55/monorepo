// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/Add/Page.jsx
// UIX Upgraded - Uses EntityAttachmentAddPage whole page component
// @uix-page: AdminCustomerDetailAttachmentAddPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  PaperClipIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useCustomerManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentAddPage } from "../../../../../../components/UIX";

function AdminCustomerDetailAttachmentAddPage() {
  const { cid } = useParams();
  const attachmentManager = useAttachmentManager();
  const customerManager = useCustomerManager();

  // Configuration for EntityAttachmentAddPage
  const config = useMemo(() => ({
    // Core settings
    entityId: cid,
    entityType: "customer",
    ownershipType: ATTACHMENT_OWNERSHIP_TYPE.CUSTOMER,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },

    uploadAttachment: async (file, metadata, onProgress, onUnauthorized) => {
      return await attachmentManager.uploadAttachment(file, metadata, onProgress, onUnauthorized);
    },

    // Breadcrumbs configuration
    breadcrumbs: {
      items: (entity, entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Customers", to: "/admin/customers", icon: UserIcon },
        { label: "Detail", to: `/admin/customer/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments`, icon: PaperClipIcon },
        { label: "Add", icon: PlusCircleIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      title: "Add Attachment",
      icon: DocumentArrowUpIcon,
    },

    // Routes configuration
    routes: {
      backPath: `/admin/customer/${cid}/attachments`,
      backLabel: "Back to Attachments",
      successPath: `/admin/customer/${cid}/attachments`,
    },

    // Display configuration
    showEntityStatus: true,
    canUpload: (entity) => entity?.status !== 2,
  }), [cid, attachmentManager, customerManager]);

  return <EntityAttachmentAddPage config={config} />;
}

export default AdminCustomerDetailAttachmentAddPage;

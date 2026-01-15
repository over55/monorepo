// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Add/Page.jsx
// UIX Upgraded - Uses EntityAttachmentAddPage whole page component
// @uix-page: AdminOrderDetailAttachmentAddPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_TYPES } from "../../../../../../constants/Attachment";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";
import { EntityAttachmentAddPage } from "../../../../../../components/UIX";

function AdminOrderDetailAttachmentAddPage() {
  const { oid } = useParams();
  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();

  // Configuration for EntityAttachmentAddPage
  const config = useMemo(() => ({
    // Entity identification
    entityType: "Order",
    entityIdParam: "oid",
    ownershipType: ATTACHMENT_TYPES.ORDER,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await orderManager.getOrderDetail(entityId, onUnauthorized);
    },

    uploadAttachment: async (file, metadata, progressCallback, onUnauthorized) => {
      return await attachmentManager.uploadAttachment(file, metadata, progressCallback, onUnauthorized);
    },

    // Get entity-specific ownership data
    getOwnershipData: (entity) => ({
      ownershipWjid: entity.wjid,
      ownershipId: entity.id,
      ownershipType: ATTACHMENT_TYPES.ORDER,
      orderWjid: oid, // For backward compatibility
    }),

    // Routes configuration
    routes: {
      cancelPath: `/admin/order/${oid}/attachments`,
      successRedirectPath: `/admin/order/${oid}/attachments`,
      buildBreadcrumbs: (entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
        { label: "Detail (Attachments)", to: `/admin/order/${entityId}/attachments`, icon: ClipboardDocumentListIcon },
        { label: "Add", icon: PlusCircleIcon, isActive: true },
      ],
    },

    // Header configuration
    header: {
      title: "Work Order - Add Attachment",
      subtitle: "Upload documents and files for this work order",
      icon: WrenchScrewdriverIcon,
      itemType: "Order",
      itemIcon: WrenchScrewdriverIcon,
    },

    // Alert configurations
    buildAlerts: (entity) => ({
      archived: entity?.status === ORDER_STATUS_ARCHIVED ? {
        message: "This order is archived",
        icon: ArchiveBoxIcon,
        type: "info",
      } : null,
    }),

    // Messages configuration
    messages: {
      successMessage: "Attachment uploaded successfully",
      redirectDelay: 2000,
    },
  }), [oid, attachmentManager, orderManager]);

  return <EntityAttachmentAddPage config={config} />;
}

export default AdminOrderDetailAttachmentAddPage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Add/Page.jsx
// UIX Upgraded - Uses EntityAttachmentAddPage whole page component
// @uix-page: AdminAssociateDetailAttachmentAddPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperClipIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useAssociateManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentAddPage } from "../../../../../../components/UIX";

function AdminAssociateDetailAttachmentAddPage() {
  const { aid } = useParams();
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Configuration for EntityAttachmentAddPage
  const config = useMemo(() => ({
    // Core settings
    entityId: aid,
    entityType: "associate",
    ownershipType: ATTACHMENT_OWNERSHIP_TYPE.ASSOCIATE,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
    },

    uploadAttachment: async (file, metadata, onProgress, onUnauthorized) => {
      return await attachmentManager.uploadAttachment(file, metadata, onProgress, onUnauthorized);
    },

    // Breadcrumbs configuration
    breadcrumbs: {
      items: (entity, entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
        { label: "Detail", to: `/admin/associate/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments`, icon: PaperClipIcon },
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
      backPath: `/admin/associate/${aid}/attachments`,
      backLabel: "Back to Attachments",
      successPath: `/admin/associate/${aid}/attachments`,
    },

    // Display configuration
    showEntityStatus: true,
    canUpload: (entity) => entity?.status !== 2,
  }), [aid, attachmentManager, associateManager]);

  return <EntityAttachmentAddPage config={config} />;
}

export default AdminAssociateDetailAttachmentAddPage;

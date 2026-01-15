// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Add/Page.jsx
// UIX Upgraded - Uses EntityAttachmentAddPage whole page component
// @uix-page: AdminStaffDetailAttachmentAddPage

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
  useStaffManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentAddPage } from "../../../../../../components/UIX";

function AdminStaffDetailAttachmentAddPage() {
  const { aid } = useParams();
  const attachmentManager = useAttachmentManager();
  const staffManager = useStaffManager();

  // Configuration for EntityAttachmentAddPage
  const config = useMemo(() => ({
    // Core settings
    entityId: aid,
    entityType: "staff member",
    ownershipType: ATTACHMENT_OWNERSHIP_TYPE.STAFF,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await staffManager.getStaffDetail(entityId, onUnauthorized);
    },

    uploadAttachment: async (file, metadata, onProgress, onUnauthorized) => {
      return await attachmentManager.uploadAttachment(
        file,
        metadata,
        onProgress,
        onUnauthorized
      );
    },

    // Breadcrumbs configuration
    breadcrumbs: {
      items: (entity, entityId) => [
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
          label: "Add",
          icon: PlusCircleIcon,
          isActive: true,
        },
      ],
    },

    // Header configuration
    header: {
      title: "Add Attachment",
      icon: DocumentArrowUpIcon,
    },

    // Routes configuration
    routes: {
      backPath: `/admin/staff/${aid}/attachments`,
      backLabel: "Back to Attachments",
      successPath: `/admin/staff/${aid}/attachments`,
    },

    // Display configuration
    showEntityStatus: true,
    canUpload: (entity) => entity?.status !== 2, // Prevent upload for archived staff
  }), [aid, attachmentManager, staffManager]);

  return <EntityAttachmentAddPage config={config} />;
}

export default AdminStaffDetailAttachmentAddPage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/List/Page.jsx
// UIX Upgraded - Uses EntityAttachmentListPage whole page component
// @uix-page: AdminAssociateDetailAttachmentListPage

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useAssociateManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentListPage } from "../../../../../../components/UIX";

function AdminAssociateDetailAttachmentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "aid",
    entityType: "associate",

    // Default pagination settings
    defaultPageSize: 50,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
    },

    fetchAttachments: async (params, onUnauthorized, forceRefresh) => {
      attachmentManager.clearAttachmentsCache();
      return await attachmentManager.getAttachments(params, onUnauthorized, forceRefresh);
    },

    // Attachment query parameters
    attachmentParams: {
      ownershipRole: ATTACHMENT_OWNERSHIP_TYPE.ASSOCIATE,
    },

    // Header configuration
    header: {
      title: "Attachments",
      icon: PaperClipIcon,
      loadingText: "Loading attachments...",
      notFoundTitle: "Associate Not Found",
      notFoundMessage: "The associate you're looking for doesn't exist or you don't have permission to view it.",
      notFoundAction: {
        label: "Back to Associates",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/associates"),
      },
    },

    // Routes configuration
    routes: {
      buildBreadcrumbs: (entity, entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
        { label: "Detail", to: `/admin/associate/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", icon: PaperClipIcon, isActive: true },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/associate/${entityId}` },
        { label: "Detail", to: `/admin/associate/${entityId}/detail` },
        { label: "Orders", to: `/admin/associate/${entityId}/orders` },
        { label: "Comments", to: `/admin/associate/${entityId}/comments` },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments`, isActive: true },
        { label: "More", to: `/admin/associate/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      buildActionButtons: (entity, entityId, nav) => [
        {
          variant: "outline",
          label: "Back",
          icon: ChevronLeftIcon,
          onClick: () => nav("/admin/associates"),
        },
      ],

      // Attachment route paths
      addPath: "/admin/associate/{entityId}/attachments/add",
      viewPath: "/admin/associate/{entityId}/attachment/{attachmentId}",
      editPath: "/admin/associate/{entityId}/attachment/{attachmentId}/edit",
      deletePath: "/admin/associate/{entityId}/attachment/{attachmentId}/delete",
    },

    // Field sections for entity display (empty for attachment list)
    buildFieldSections: (entity) => [],

    // Alert configurations
    buildAlerts: (entity) => ({
      archived: entity?.status === 2 ? {
        message: "This associate is archived",
        icon: ArchiveBoxIcon,
      } : null,
      banned: entity?.isBanned ? {
        message: "This associate is banned",
        icon: NoSymbolIcon,
      } : null,
    }),

    // Control whether attachments can be added
    canAddAttachments: (entity) => entity?.status !== 2,

    // Click handlers
    onAttachmentClick: (attachment, entityId, nav) => {
      nav(`/admin/associate/${entityId}/attachment/${attachment.id}`);
    },

    onDeleteAttachment: (attachment, entityId, nav) => {
      nav(`/admin/associate/${entityId}/attachment/${attachment.id}/delete`);
    },
  }), [attachmentManager, associateManager, navigate]);

  return <EntityAttachmentListPage config={config} />;
}

export default AdminAssociateDetailAttachmentListPage;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/List/Page.jsx
// UIX Upgraded - Uses EntityAttachmentListPage whole page component
// @uix-page: AdminStaffDetailAttachmentListPage

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
  useStaffManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentListPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminStaffDetailAttachmentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const staffManager = useStaffManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "aid",
    entityType: "staff member",

    // Default pagination settings
    defaultPageSize: 50,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      const data = await staffManager.getStaffDetail(entityId, onUnauthorized);
      console.log("Staff detail fetched:", data);
      return data;
    },

    fetchAttachments: async (params, onUnauthorized, forceRefresh) => {
      // Clear cache before fetching
      attachmentManager.clearAttachmentsCache();

      const attachmentsData = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        forceRefresh,
      );
      console.log("Received attachments data:", attachmentsData);
      return attachmentsData;
    },

    // Attachment query parameters
    attachmentParams: {
      ownershipRole: ATTACHMENT_OWNERSHIP_TYPE.STAFF, // This is 4
    },

    // Header configuration
    header: {
      title: "Attachments",
      icon: PaperClipIcon,
      loadingText: "Loading attachments...",
      notFoundTitle: "Staff Member Not Found",
      notFoundMessage: "The staff member you're looking for doesn't exist or you don't have permission to view it.",
      notFoundAction: {
        label: "Back to Staff",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/staff"),
      },
    },

    // Routes configuration
    routes: {
      buildBreadcrumbs: (entity, entityId) => [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: ChartBarIcon,
        },
        {
          label: "Staff",
          to: "/admin/staff",
          icon: UserGroupIcon,
        },
        {
          label: "Detail",
          to: `/admin/staff/${entityId}`,
          icon: ClipboardDocumentListIcon,
        },
        {
          label: "Attachments",
          icon: PaperClipIcon,
          isActive: true,
        },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/staff/${entityId}` },
        { label: "Detail", to: `/admin/staff/${entityId}/detail` },
        { label: "Comments", to: `/admin/staff/${entityId}/comments` },
        { label: "Attachments", to: `/admin/staff/${entityId}/attachments`, isActive: true },
        { label: "More", to: `/admin/staff/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      buildActionButtons: (entity, entityId, nav) => [
        {
          variant: "outline",
          label: "Back",
          icon: ChevronLeftIcon,
          onClick: () => nav("/admin/staff"),
        },
      ],

      // Attachment route paths
      addPath: "/admin/staff/{entityId}/attachments/add",
      viewPath: "/admin/staff/{entityId}/attachment/{attachmentId}",
      editPath: "/admin/staff/{entityId}/attachment/{attachmentId}/edit",
      deletePath: "/admin/staff/{entityId}/attachment/{attachmentId}/delete",
    },

    // Field sections for entity display (empty for attachment list)
    buildFieldSections: (entity) => [],

    // Alert configurations
    buildAlerts: (entity) => ({
      archived: entity?.status === 2 ? {
        message: "This staff member is archived",
        icon: ArchiveBoxIcon,
      } : null,
      banned: entity?.isBanned ? {
        message: "This staff member is banned",
        icon: NoSymbolIcon,
      } : null,
    }),

    // Control whether attachments can be added
    canAddAttachments: (entity) => entity?.status !== 2,

    // Click handlers
    onAttachmentClick: (attachment, entityId, nav) => {
      nav(`/admin/staff/${entityId}/attachment/${attachment.id}`);
    },

    onDeleteAttachment: (attachment, entityId, nav) => {
      nav(`/admin/staff/${entityId}/attachment/${attachment.id}/delete`);
    },
  }), [attachmentManager, staffManager, navigate]);

  return (
    <UIXThemeProvider>
      <EntityAttachmentListPage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailAttachmentListPage;

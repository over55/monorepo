// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Attachment/List/Page.jsx
// UIX Upgraded - Uses EntityAttachmentListPage whole page component
// @uix-page: AdminCustomerDetailAttachmentListPage

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
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
  useCustomerManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_OWNERSHIP_TYPE } from "../../../../../../constants/Attachment";
import { EntityAttachmentListPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminCustomerDetailAttachmentListPage() {
  const { cid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const customerManager = useCustomerManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "cid",
    entityType: "customer",

    // Default pagination settings
    defaultPageSize: 50,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },

    fetchAttachments: async (params, onUnauthorized, forceRefresh) => {
      attachmentManager.clearAttachmentsCache();
      return await attachmentManager.getAttachments(params, onUnauthorized, forceRefresh);
    },

    // Attachment query parameters
    attachmentParams: {
      ownershipRole: ATTACHMENT_OWNERSHIP_TYPE.CUSTOMER,
    },

    // Header configuration
    header: {
      title: "Attachments",
      icon: PaperClipIcon,
      loadingText: "Loading attachments...",
      notFoundTitle: "Customer Not Found",
      notFoundMessage: "The customer you're looking for doesn't exist or you don't have permission to view it.",
      notFoundAction: {
        label: "Back to Customers",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/customers"),
      },
    },

    // Routes configuration
    routes: {
      buildBreadcrumbs: (entity, entityId) => [
        { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
        { label: "Customers", to: "/admin/customers", icon: UserIcon },
        { label: "Detail", to: `/admin/customer/${entityId}`, icon: ClipboardDocumentListIcon },
        { label: "Attachments", icon: PaperClipIcon, isActive: true },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/customer/${entityId}` },
        { label: "Detail", to: `/admin/customer/${entityId}/detail` },
        { label: "Orders", to: `/admin/customer/${entityId}/orders` },
        { label: "Comments", to: `/admin/customer/${entityId}/comments` },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments`, isActive: true },
        { label: "More", to: `/admin/customer/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      buildActionButtons: (entity, entityId, nav) => [
        {
          variant: "outline",
          label: "Back",
          icon: ChevronLeftIcon,
          onClick: () => nav("/admin/customers"),
        },
      ],

      // Attachment route paths
      addPath: "/admin/customer/{entityId}/attachments/add",
      viewPath: "/admin/customer/{entityId}/attachment/{attachmentId}",
      editPath: "/admin/customer/{entityId}/attachment/{attachmentId}/edit",
      deletePath: "/admin/customer/{entityId}/attachment/{attachmentId}/delete",
    },

    // Field sections for entity display (empty for attachment list)
    buildFieldSections: (entity) => [],

    // Alert configurations
    buildAlerts: (entity) => ({
      archived: entity?.status === 2 ? {
        message: "This customer is archived",
        icon: ArchiveBoxIcon,
      } : null,
      banned: entity?.isBanned ? {
        message: "This customer is banned",
        icon: NoSymbolIcon,
      } : null,
    }),

    // Control whether attachments can be added
    canAddAttachments: (entity) => entity?.status !== 2,

    // Click handlers
    onAttachmentClick: (attachment, entityId, nav) => {
      nav(`/admin/customer/${entityId}/attachment/${attachment.id}`);
    },

    onDeleteAttachment: (attachment, entityId, nav) => {
      nav(`/admin/customer/${entityId}/attachment/${attachment.id}/delete`);
    },
  }), [attachmentManager, customerManager, navigate]);

  return (
    <UIXThemeProvider>
      <EntityAttachmentListPage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailAttachmentListPage;

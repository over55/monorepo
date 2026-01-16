// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/Comment/List/Page.jsx
// UIX Upgraded - Uses EntityCommentsPage whole page component
// @uix-page: AdminCustomerDetailCommentListPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useCommentManager,
} from "../../../../../../services/Services";
import { EntityCommentsPage, UIXThemeProvider } from "../../../../../../components/UIX";

// Constants for comment belonging types (from backend)
const BELONGS_TO_CUSTOMER = 1;

function AdminCustomerDetailCommentListPage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const commentManager = useCommentManager();

  // Configuration for EntityCommentsPage
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "cid",
    entityType: "customer",
    belongsTo: BELONGS_TO_CUSTOMER,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },

    fetchComments: async (params, onUnauthorized, forceRefresh) => {
      if (forceRefresh) {
        commentManager.clearCommentsCache();
      }
      const filtersMap = new Map(Object.entries(params));
      return await commentManager.getCommentsWithFiltersMap(
        filtersMap,
        onUnauthorized,
        forceRefresh
      );
    },

    createComment: async (entityId, content, onUnauthorized) => {
      return await customerManager.createCustomerComment(
        entityId,
        content,
        onUnauthorized
      );
    },

    clearCache: () => {
      commentManager.clearCommentsCache();
    },

    // Header configuration
    header: {
      title: "Customer",
      icon: UserIcon,
      subtitle: "View and manage comments",
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
          label: "Customers",
          to: "/admin/customers",
          icon: UserIcon,
        },
        {
          label: "Detail",
          to: `/admin/customer/${entityId}`,
          icon: InformationCircleIcon,
        },
        {
          label: "Comments",
          icon: ChatBubbleLeftRightIcon,
          isActive: true,
        },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/customer/${entityId}` },
        { label: "Detail", to: `/admin/customer/${entityId}/detail` },
        { label: "Orders", to: `/admin/customer/${entityId}/orders` },
        { label: "Comments", to: `/admin/customer/${entityId}/comments`, isActive: true },
        { label: "Attachments", to: `/admin/customer/${entityId}/attachments` },
        { label: "More", to: `/admin/customer/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      backPath: "/admin/customers",
      backLabel: "Back to Customers",
    },

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

    // Control whether comments can be added
    canAddComments: (entity) => entity?.status !== 2 && !entity?.isBanned,

    // Get entity display name
    getEntityDisplayName: (entity) => entity?.name || `${entity?.firstName} ${entity?.lastName}` || "Customer",
  }), [customerManager, commentManager]);

  return (
    <UIXThemeProvider>
      <EntityCommentsPage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailCommentListPage;

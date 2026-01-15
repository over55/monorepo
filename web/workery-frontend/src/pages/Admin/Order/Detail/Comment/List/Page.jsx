// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Comment/List/Page.jsx
// UIX Upgraded - Uses EntityCommentsPage whole page component
// @uix-page: AdminOrderDetailCommentListPage

import React, { useMemo } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  XCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useCommentManager,
} from "../../../../../../services/Services";
import {
  ORDER_STATUS_ARCHIVED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DECLINED,
} from "../../../../../../constants/Order";
import { EntityCommentsPage } from "../../../../../../components/UIX";

// Constants for comment belonging types (from backend)
const BELONGS_TO_ORDER = 3;

function AdminOrderDetailCommentListPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const commentManager = useCommentManager();

  // Configuration for EntityCommentsPage
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "oid",
    entityType: "order",
    belongsTo: BELONGS_TO_ORDER,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await orderManager.getOrderDetail(entityId, onUnauthorized);
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
      return await orderManager.createOrderComment(
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
      title: "Order",
      icon: WrenchScrewdriverIcon,
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
          label: "Orders",
          to: "/admin/orders",
          icon: WrenchScrewdriverIcon,
        },
        {
          label: `Order #${entityId}`,
          to: `/admin/order/${entityId}`,
          icon: InformationCircleIcon,
        },
        {
          label: "Comments",
          icon: ChatBubbleLeftRightIcon,
          isActive: true,
        },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/order/${entityId}` },
        { label: "Detail", to: `/admin/order/${entityId}/full` },
        { label: "Activity Sheets", to: `/admin/order/${entityId}/activity-sheets` },
        { label: "Tasks", to: `/admin/order/${entityId}/tasks` },
        { label: "Comments", to: `/admin/order/${entityId}/comments`, isActive: true },
        { label: "Attachments", to: `/admin/order/${entityId}/attachments` },
        { label: "More", to: `/admin/order/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      backPath: "/admin/orders",
      backLabel: "Back to Orders",
    },

    // Alert configurations
    buildAlerts: (entity) => ({
      archived: entity?.status === ORDER_STATUS_ARCHIVED ? {
        message: "This order is archived",
        icon: ArchiveBoxIcon,
        type: "info",
      } : null,
      cancelled: entity?.status === ORDER_STATUS_CANCELLED ? {
        message: "This order is cancelled",
        icon: NoSymbolIcon,
        type: "warning",
      } : null,
      declined: entity?.status === ORDER_STATUS_DECLINED ? {
        message: "This order has been declined",
        icon: XCircleIcon,
        type: "error",
      } : null,
    }),

    // Control whether comments can be added
    canAddComments: (entity) => entity?.status !== ORDER_STATUS_ARCHIVED,

    // Get entity display name
    getEntityDisplayName: (entity) => `Order #${entity?.wjid || entity?.id}`,

    // Show incident links in comments
    showIncidentLinks: true,
    getIncidentPath: (entityId, incidentId) => `/admin/order/${entityId}/more/incident/${incidentId}`,
  }), [orderManager, commentManager]);

  return <EntityCommentsPage config={config} />;
}

export default AdminOrderDetailCommentListPage;

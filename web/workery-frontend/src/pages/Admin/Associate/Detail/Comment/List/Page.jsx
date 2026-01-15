// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Comment/List/Page.jsx
// UIX Upgraded - Uses EntityCommentsPage whole page component
// @uix-page: AdminAssociateDetailCommentListPage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useCommentManager,
} from "../../../../../../services/Services";
import { EntityCommentsPage } from "../../../../../../components/UIX";

// Constants for comment belonging types (from backend)
const BELONGS_TO_ASSOCIATE = 2;

function AdminAssociateDetailCommentListPage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const commentManager = useCommentManager();

  // Configuration for EntityCommentsPage
  const config = useMemo(() => ({
    // Entity identification
    entityIdParam: "aid",
    entityType: "associate",
    belongsTo: BELONGS_TO_ASSOCIATE,

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      return await associateManager.getAssociateDetail(entityId, onUnauthorized);
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
      return await associateManager.createAssociateComment(
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
      title: "Associate",
      icon: UserGroupIcon,
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
          label: "Associates",
          to: "/admin/associates",
          icon: UserGroupIcon,
        },
        {
          label: "Detail",
          to: `/admin/associate/${entityId}`,
          icon: InformationCircleIcon,
        },
        {
          label: "Comments",
          icon: ChatBubbleLeftRightIcon,
          isActive: true,
        },
      ],

      buildTabs: (entity, entityId) => [
        { label: "Summary", to: `/admin/associate/${entityId}` },
        { label: "Detail", to: `/admin/associate/${entityId}/detail` },
        { label: "Orders", to: `/admin/associate/${entityId}/orders` },
        { label: "Comments", to: `/admin/associate/${entityId}/comments`, isActive: true },
        { label: "Attachments", to: `/admin/associate/${entityId}/attachments` },
        { label: "More", to: `/admin/associate/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],

      backPath: "/admin/associates",
      backLabel: "Back to Associates",
    },

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

    // Control whether comments can be added
    canAddComments: (entity) => entity?.status !== 2,

    // Get entity display name
    getEntityDisplayName: (entity) => entity?.name || `${entity?.firstName} ${entity?.lastName}` || "Associate",
  }), [associateManager, commentManager]);

  return <EntityCommentsPage config={config} />;
}

export default AdminAssociateDetailCommentListPage;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/Comment/List/Page.jsx
// UIX Upgraded - Uses EntityCommentsPage whole page component
// @uix-page: AdminStaffDetailCommentListPage

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  BriefcaseIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityCommentsPage, UIXThemeProvider } from "../../../../../../components/UIX";

// Import constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

// Type map for staff
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

function AdminStaffDetailCommentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Core settings
    entityId: aid,
    entityType: "staff member",

    // Data fetching functions
    fetchEntity: async (entityId, onUnauthorized) => {
      const data = await staffManager.getStaffDetail(entityId, onUnauthorized);
      console.log("Staff detail fetched:", data);
      return data;
    },

    createComment: async (entityId, content, onUnauthorized) => {
      await staffManager.createStaffComment(entityId, content, onUnauthorized);
      // Fetch and return updated entity data
      const data = await staffManager.getStaffDetail(entityId, onUnauthorized);
      return data;
    },

    // Breadcrumb configuration
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
          icon: BriefcaseIcon,
        },
        {
          label: "Detail",
          to: `/admin/staff/${entityId}`,
          icon: InformationCircleIcon,
        },
        {
          label: "Comments",
          icon: ChatBubbleLeftRightIcon,
          isActive: true,
        },
      ],
    },

    // Header configuration
    header: {
      title: "Comments",
      icon: ChatBubbleLeftRightIcon,
      loadingText: "Loading staff comments...",
      notFoundTitle: "Staff Member Not Found",
      notFoundMessage: "The staff member you're looking for doesn't exist or you don't have permission to view it.",
      notFoundAction: {
        label: "Back to Staff",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/staff"),
      },
    },

    // Action buttons configuration
    actionButtons: (entity, entityId, nav, isFetching) => [
      {
        variant: "outline",
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => nav("/admin/staff"),
      },
    ],

    // Tabs configuration
    tabs: {
      items: (entity, entityId) => [
        { label: "Summary", to: `/admin/staff/${entityId}` },
        { label: "Detail", to: `/admin/staff/${entityId}/detail` },
        { label: "Comments", to: `/admin/staff/${entityId}/comments`, isActive: true },
        { label: "Attachments", to: `/admin/staff/${entityId}/attachments` },
        { label: "More", to: `/admin/staff/${entityId}/more`, icon: EllipsisHorizontalIcon },
      ],
    },

    // Entity display configuration
    entityDisplay: {
      buildFieldSections: (entity) => {
        // Return field sections for the comments view
        // CommentsView will use these to display entity info
        return [];
      },
      alerts: {
        archived: {
          message: "This staff member is archived",
          icon: ArchiveBoxIcon,
        },
        banned: {
          message: "This staff member is banned",
          icon: NoSymbolIcon,
        },
      },
      statusConfig: {
        activeLabel: "Active",
        inactiveLabel: "Archived",
        bannedLabel: "Banned",
      },
      typeMap: STAFF_TYPE_MAP,
    },
  }), [aid, staffManager, navigate]);

  return (
    <UIXThemeProvider>
      <EntityCommentsPage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailCommentListPage;

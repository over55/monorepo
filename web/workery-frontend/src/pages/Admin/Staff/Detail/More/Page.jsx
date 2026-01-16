// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Page.jsx
// @uix-page: EntityMorePage

import React, { useCallback, memo } from "react";
import {
  BriefcaseIcon,
  CameraIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../components/UIX";
import { EntityMorePage } from "../../../../../components/business/views";

// Constants
const STAFF_TYPE_MANAGEMENT = 2; // Management/Business type
const STAFF_TYPE_FRONTLINE = 1; // Frontline/Residential type
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

const STAFF_CONSTANTS = {
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_FRONTLINE,
  STAFF_STATUS_ACTIVE,
  STAFF_STATUS_ARCHIVED,
};

// Function to create tab items for staff
const createStaffTabItems = (staff, _staffId) => [
  {
    label: "Summary",
    href: `/admin/staff/${staff.id}`,
    isActive: false,
  },
  {
    label: "Detail",
    href: `/admin/staff/${staff.id}/detail`,
    isActive: false,
  },
  {
    label: "Comments",
    href: `/admin/staff/${staff.id}/comments`,
    isActive: false,
  },
  {
    label: "Attachments",
    href: `/admin/staff/${staff.id}/attachments`,
    isActive: false,
  },
  {
    label: "More",
    href: `/admin/staff/${staff.id}/more`,
    isActive: true,
    icon: EllipsisHorizontalIcon,
  },
];

// Function to create action cards for staff
// Note: Authorization is handled by the API - all actions are shown based on entity status
const createStaffActionCards = (staff, staffId, constants) => {
  const actionCards = [];

  if (staff) {
    // Avatar/Photo - Available for all staff
    actionCards.push({
      key: "photo",
      title: "Photo",
      subtitle: "Upload a photo of the staff member",
      icon: CameraIcon,
      path: `/admin/staff/${staffId}/avatar`,
      disabled: false,
    });

    // Archive/Unarchive
    if (staff.status === constants.STAFF_STATUS_ARCHIVED) {
      actionCards.push({
        key: "unarchive",
        title: "Unarchive",
        subtitle: "Make staff member visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/staff/${staffId}/unarchive`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "archive",
        title: "Archive",
        subtitle: "Make staff member hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/staff/${staffId}/archive`,
        disabled: false,
      });
    }

    // Upgrade/Downgrade - Only for active staff
    if (staff.status === constants.STAFF_STATUS_ACTIVE) {
      if (staff.type === constants.STAFF_TYPE_MANAGEMENT) {
        actionCards.push({
          key: "downgrade",
          title: "Downgrade",
          subtitle: "Change staff member to frontline staff",
          icon: ArrowDownCircleIcon,
          path: `/admin/staff/${staffId}/downgrade`,
          disabled: false,
        });
      } else {
        actionCards.push({
          key: "upgrade",
          title: "Upgrade",
          subtitle: "Change staff member to management staff",
          icon: ArrowUpCircleIcon,
          path: `/admin/staff/${staffId}/upgrade`,
          disabled: false,
        });
      }

      // Password - Only for active staff
      actionCards.push({
        key: "password",
        title: "Password",
        subtitle: "Change or reset the staff member's password",
        icon: LockClosedIcon,
        path: `/admin/staff/${staffId}/change-password`,
        disabled: false,
      });

      // 2FA - Only for active staff
      actionCards.push({
        key: "2fa",
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/staff/${staffId}/2fa`,
        disabled: false,
      });

      // Delete - Only for active staff
      actionCards.push({
        key: "delete",
        title: "Delete",
        subtitle: "Permanently delete this staff member and all data",
        icon: TrashIcon,
        path: `/admin/staff/${staffId}/permadelete`,
        disabled: false,
      });
    }

    // Ban/Unban
    if (staff.isBanned) {
      actionCards.push({
        key: "unban",
        title: "Unban",
        subtitle: "Remove ban from staff member",
        icon: CheckCircleIcon,
        path: `/admin/staff/${staffId}/unban`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "ban",
        title: "Ban",
        subtitle: "Mark the staff member as banned",
        icon: NoSymbolIcon,
        path: `/admin/staff/${staffId}/ban`,
        disabled: false,
      });
    }
  }

  return actionCards;
};

const AdminStaffDetailMorePageContent = memo(function AdminStaffDetailMorePageContent() {
  const staffManager = useStaffManager();

  // Simple wrapper for getStaffDetail that works with EntityMorePage
  const getStaffDetailWithManager = useCallback(
    async (staffId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("More page: Fetching staff detail for:", staffId);
      }
      return new Promise((resolve, reject) => {
        staffManager.getStaffDetailWithCallbacks(
          staffId,
          (staffData) => {
            if (import.meta.env.DEV) {
              console.log(
                "More page: Staff detail fetched successfully for ID:",
                staffData.id,
              );
            }
            resolve(staffData);
          },
          (error) => {
            if (import.meta.env.DEV) {
              console.error("More page: Error fetching staff detail:", error);
            }
            reject(error);
          },
          () => {
            if (import.meta.env.DEV) {
              console.log("More page: Staff detail fetch done");
            }
          },
          onUnauthorized,
        );
      });
    },
    [staffManager],
  );

  return (
    <EntityMorePage
      entityIcon={BriefcaseIcon}
      entityType="Staff Member"
      entityTypePlural="Staff"
      basePath="/admin/staff"
      entityParamName="aid"
      entityManager={staffManager}
      getEntityDetail={getStaffDetailWithManager}
      createTabItems={createStaffTabItems}
      createActionCards={createStaffActionCards}
      constants={STAFF_CONSTANTS}
      infoMessage="Some actions are only available for active staff members. Archived staff members must be unarchived first before performing other actions."
    />
  );
});

function AdminStaffDetailMorePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMorePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMorePage;

// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Page.jsx
// @uix-page: EntityMorePage

import React, { useCallback, memo } from "react";
import {
  UserGroupIcon,
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
import { useAssociateManager } from "../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../components/UIX";
import { EntityMorePage } from "../../../../../components/business/views";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_STATUS_ACTIVE = 1;
const ASSOCIATE_STATUS_ARCHIVED = 2;

const ASSOCIATE_CONSTANTS = {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  ASSOCIATE_STATUS_ACTIVE,
  ASSOCIATE_STATUS_ARCHIVED,
};

// Function to create tab items for associate
const createAssociateTabItems = (associate, _associateId) => [
  {
    label: "Summary",
    href: `/admin/associate/${associate.id}`,
    isActive: false,
  },
  {
    label: "Detail",
    href: `/admin/associate/${associate.id}/detail`,
    isActive: false,
  },
  {
    label: "Orders",
    href: `/admin/associate/${associate.id}/orders`,
    isActive: false,
  },
  {
    label: "Comments",
    href: `/admin/associate/${associate.id}/comments`,
    isActive: false,
  },
  {
    label: "Attachments",
    href: `/admin/associate/${associate.id}/attachments`,
    isActive: false,
  },
  {
    label: "More",
    href: `/admin/associate/${associate.id}/more`,
    isActive: true,
    icon: EllipsisHorizontalIcon,
  },
];

// Function to create action cards for associate
const createAssociateActionCards = (associate, associateId, constants) => {
  const actionCards = [];

  if (associate) {
    // Avatar/Photo - Available for active associates
    if (associate.status === constants.ASSOCIATE_STATUS_ACTIVE) {
      actionCards.push({
        key: "photo",
        title: "Photo",
        subtitle: "Upload a photo of the associate",
        icon: CameraIcon,
        path: `/admin/associate/${associateId}/avatar`,
        disabled: false,
      });
    }

    // Archive/Unarchive
    if (associate.status === constants.ASSOCIATE_STATUS_ARCHIVED) {
      actionCards.push({
        key: "unarchive",
        title: "Unarchive",
        subtitle: "Make associate visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/associate/${associateId}/unarchive`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "archive",
        title: "Archive",
        subtitle: "Make associate hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/associate/${associateId}/archive`,
        disabled: false,
      });
    }

    // Upgrade/Downgrade - Only for active associates
    if (associate.status === constants.ASSOCIATE_STATUS_ACTIVE) {
      if (associate.type === constants.COMMERCIAL_ASSOCIATE_TYPE_OF_ID ||
          associate.typeOf === constants.COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
        actionCards.push({
          key: "downgrade",
          title: "Downgrade",
          subtitle: "Change associate to residential type",
          icon: ArrowDownCircleIcon,
          path: `/admin/associate/${associateId}/downgrade`,
          disabled: false,
        });
      } else {
        actionCards.push({
          key: "upgrade",
          title: "Upgrade",
          subtitle: "Change associate to commercial type",
          icon: ArrowUpCircleIcon,
          path: `/admin/associate/${associateId}/upgrade`,
          disabled: false,
        });
      }

      // Password - Only for active associates
      actionCards.push({
        key: "password",
        title: "Password",
        subtitle: "Change or reset the associate's password",
        icon: LockClosedIcon,
        path: `/admin/associate/${associateId}/change-password`,
        disabled: false,
      });

      // 2FA - Only for active associates
      actionCards.push({
        key: "2fa",
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/associate/${associateId}/change-2fa`,
        disabled: false,
      });

      // Delete - Only for active associates
      actionCards.push({
        key: "delete",
        title: "Delete",
        subtitle: "Permanently delete this associate and all data",
        icon: TrashIcon,
        path: `/admin/associate/${associateId}/permadelete`,
        disabled: false,
      });
    }

    // Ban/Unban
    if (associate.isBanned) {
      actionCards.push({
        key: "unban",
        title: "Unban",
        subtitle: "Remove ban from associate",
        icon: CheckCircleIcon,
        path: `/admin/associate/${associateId}/unban`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "ban",
        title: "Ban",
        subtitle: "Mark the associate as banned",
        icon: NoSymbolIcon,
        path: `/admin/associate/${associateId}/ban`,
        disabled: false,
      });
    }
  }

  return actionCards;
};

const AdminAssociateDetailMorePageContent = memo(function AdminAssociateDetailMorePageContent() {
  const associateManager = useAssociateManager();

  // Simple wrapper for getAssociateDetail that works with EntityMorePage
  const getAssociateDetailWithManager = useCallback(
    async (associateId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("More page: Fetching associate detail for:", associateId);
      }
      return new Promise((resolve, reject) => {
        associateManager.getAssociateDetailWithCallbacks(
          associateId,
          (associateData) => {
            if (import.meta.env.DEV) {
              console.log(
                "More page: Associate detail fetched successfully for ID:",
                associateData.id,
              );
            }
            resolve(associateData);
          },
          (error) => {
            if (import.meta.env.DEV) {
              console.error("More page: Error fetching associate detail:", error);
            }
            reject(error);
          },
          () => {
            if (import.meta.env.DEV) {
              console.log("More page: Associate detail fetch done");
            }
          },
          onUnauthorized,
        );
      });
    },
    [associateManager],
  );

  return (
    <EntityMorePage
      entityIcon={UserGroupIcon}
      entityType="Associate"
      entityTypePlural="Associates"
      basePath="/admin/associates"
      entityParamName="aid"
      entityManager={associateManager}
      getEntityDetail={getAssociateDetailWithManager}
      createTabItems={createAssociateTabItems}
      createActionCards={createAssociateActionCards}
      constants={ASSOCIATE_CONSTANTS}
      infoMessage="Some actions are only available for active associates. Archived associates must be unarchived first before performing other actions."
    />
  );
});

function AdminAssociateDetailMorePage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMorePageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMorePage;

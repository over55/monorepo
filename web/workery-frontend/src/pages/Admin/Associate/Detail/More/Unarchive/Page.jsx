// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Unarchive/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminAssociateDetailMoreUnarchivePage

import React, { useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArchiveBoxXMarkIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminAssociateDetailMoreUnarchivePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        const data = await associateManager.getAssociateDetail(entityId, onUnauthorized);
        onSuccess(data);
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [associateManager],
  );

  // Execute action function (unarchive)
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        await associateManager.archiveAssociate(entityId, onUnauthorized);
        onSuccess();
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [associateManager],
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Associates", to: "/admin/associates", icon: UserGroupIcon },
    { label: "Detail", to: `/admin/associate/${aid}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/associate/${aid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Unarchive", icon: ArchiveBoxXMarkIcon, isActive: true },
  ];

  // Page configuration
  const pageConfig = {
    title: "Unarchive Associate",
    subtitle: "Restore this associate from archive",
    icon: ArchiveBoxXMarkIcon,
    actionIcon: ArchiveBoxXMarkIcon,
    loadingText: "Loading associate details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Unarchive Associate - Are you sure?",
    description: "You are about to unarchive this associate. This means:",
    consequences: [
      "This associate will become active again",
      "They will be able to access the system",
      "They will appear in active associate searches",
      "All previous settings and permissions will be restored",
    ],
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  };

  // Render entity information
  const renderEntityInfo = useCallback(
    (associate) => (
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
          Associate Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Name:</span>
            <span className="text-gray-900">
              {associate.name || `${associate.firstName} ${associate.lastName}`}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Current Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <ArchiveBoxXMarkIcon className="w-3 h-3 mr-1" />
              Archived
            </span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700 mr-2">Email:</span>
            <span className="text-gray-900">{associate.email || "-"}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700 mr-2">Phone:</span>
            <span className="text-gray-900">{associate.phone || "-"}</span>
          </div>
        </div>
      </div>
    ),
    [],
  );

  // Status alerts
  const statusAlerts = [
    {
      condition: (entity) => entity?.status !== 2,
      type: "warning",
      message: "This associate is not archived and cannot be unarchived.",
      icon: ExclamationTriangleIcon,
    },
  ];

  // Check if action is disabled (only allow if associate is archived - status 2)
  const isActionDisabled = useCallback((entity) => entity?.status !== 2, []);

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType="associate"
        entityId={aid}
        actionType="unarchive"
        fetchEntity={fetchEntity}
        executeAction={executeAction}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        isActionDisabled={isActionDisabled}
        returnPath={`/admin/associate/${aid}/more`}
        successRedirectPath={`/admin/associate/${aid}/detail`}
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreUnarchivePage;

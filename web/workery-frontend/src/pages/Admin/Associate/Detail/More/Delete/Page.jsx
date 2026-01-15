// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Delete/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminAssociateDetailMoreDeletePage

import React, { useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminAssociateDetailMoreDeletePage() {
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

  // Execute action function
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        await associateManager.deleteAssociate(entityId, onUnauthorized);
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
    { label: "Delete", icon: TrashIcon, isActive: true },
  ];

  // Page configuration
  const pageConfig = {
    title: "Delete Associate",
    subtitle: "Permanently remove this associate",
    icon: TrashIcon,
    actionIcon: TrashIcon,
    loadingText: "Loading associate details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Delete Associate - Are you sure?",
    description: "You are about to permanently delete this associate. This action:",
    consequences: [
      "Will permanently remove all associate data",
      "Cannot be undone",
      "Will remove all associated records and history",
      "Will affect any linked orders or assignments",
    ],
    confirmationText: "Are you absolutely sure you want to proceed?",
    warningType: "red",
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
      condition: (entity) => entity?.status === 2,
      type: "info",
      message: "This associate is archived. Deleting will permanently remove all data.",
      icon: ExclamationTriangleIcon,
    },
  ];

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType="associate"
        entityId={aid}
        actionType="delete"
        fetchEntity={fetchEntity}
        executeAction={executeAction}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        returnPath={`/admin/associate/${aid}/more`}
        successRedirectPath="/admin/associates"
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreDeletePage;

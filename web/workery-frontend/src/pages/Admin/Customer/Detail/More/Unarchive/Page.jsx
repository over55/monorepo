// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unarchive/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminCustomerDetailMoreUnarchivePage

import React, { useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ArchiveBoxXMarkIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminCustomerDetailMoreUnarchivePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        const data = await customerManager.getCustomerDetail(entityId, onUnauthorized);
        onSuccess(data);
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [customerManager],
  );

  // Execute action function (unarchive)
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        await customerManager.archiveCustomer(entityId, onUnauthorized);
        onSuccess();
      } catch (error) {
        onError(error);
      } finally {
        onDone();
      }
    },
    [customerManager],
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Customers", to: "/admin/customers", icon: UserIcon },
    { label: "Detail", to: `/admin/customer/${cid}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/customer/${cid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Unarchive", icon: ArchiveBoxXMarkIcon, isActive: true },
  ];

  // Page configuration
  const pageConfig = {
    title: "Unarchive Customer",
    subtitle: "Restore this customer from archive",
    icon: ArchiveBoxXMarkIcon,
    actionIcon: ArchiveBoxXMarkIcon,
    loadingText: "Loading customer details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Unarchive Customer - Are you sure?",
    description: "You are about to unarchive this customer. This means:",
    consequences: [
      "This customer will become active again",
      "They will be able to access the system",
      "They will appear in active customer searches",
      "All previous settings and permissions will be restored",
      "They will be able to create new work orders",
    ],
    confirmationText: "Are you sure you would like to continue?",
    warningType: "amber",
  };

  // Render entity information
  const renderEntityInfo = useCallback(
    (customer) => (
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
          Customer Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Name:</span>
            <span className="text-gray-900">
              {customer.name || `${customer.firstName} ${customer.lastName}`}
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
            <span className="text-gray-900">{customer.email || "-"}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700 mr-2">Phone:</span>
            <span className="text-gray-900">{customer.phone || "-"}</span>
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
      message: "This customer is not archived and cannot be unarchived.",
      icon: ExclamationTriangleIcon,
    },
  ];

  // Check if action is disabled (only allow if customer is archived - status 2)
  const isActionDisabled = useCallback((entity) => entity?.status !== 2, []);

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType="customer"
        entityId={cid}
        actionType="unarchive"
        fetchEntity={fetchEntity}
        executeAction={executeAction}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        isActionDisabled={isActionDisabled}
        returnPath={`/admin/customer/${cid}/more`}
        successRedirectPath={`/admin/customer/${cid}/detail`}
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreUnarchivePage;

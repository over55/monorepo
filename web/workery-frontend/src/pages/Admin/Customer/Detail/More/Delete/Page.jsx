// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Delete/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminCustomerDetailMoreDeletePage

import React, { useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../../components/UIX";

function AdminCustomerDetailMoreDeletePage() {
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

  // Execute action function
  const executeAction = useCallback(
    async (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      try {
        await customerManager.deleteCustomer(entityId, onUnauthorized);
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
    { label: "Delete", icon: TrashIcon, isActive: true },
  ];

  // Page configuration
  const pageConfig = {
    title: "Delete Customer",
    subtitle: "Permanently remove this customer",
    icon: TrashIcon,
    actionIcon: TrashIcon,
    loadingText: "Loading customer details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Delete Customer - Are you sure?",
    description: "You are about to permanently delete this customer. This action:",
    consequences: [
      "Will permanently remove all customer data",
      "Cannot be undone",
      "Will remove all associated records and history",
      "Will affect any linked orders or assignments",
      "Consider archiving instead if you want to preserve data",
    ],
    confirmationText: "Are you absolutely sure you want to proceed?",
    warningType: "red",
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
      condition: (entity) => entity?.status === 2,
      type: "info",
      message: "This customer is archived. Deleting will permanently remove all data.",
      icon: ExclamationTriangleIcon,
    },
  ];

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType="customer"
        entityId={cid}
        actionType="delete"
        fetchEntity={fetchEntity}
        executeAction={executeAction}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        returnPath={`/admin/customer/${cid}/more`}
        successRedirectPath="/admin/customers"
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreDeletePage;

// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Archive/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: AdminCustomerDetailMoreArchivePage

import React, { useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../../components/UIX";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;

function AdminCustomerDetailMoreArchivePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Get status display
  const getStatusDisplay = (status) => {
    if (status === 1) {
      return <span className="text-green-600 font-medium">Active</span>;
    } else if (status === 2) {
      return <span className="text-amber-600 font-medium">Archived</span>;
    }
    return <span className="text-gray-500">Unknown</span>;
  };

  // Get type display
  const getTypeDisplay = (typeOf) => {
    switch (typeOf) {
      case 1:
        return "Unassigned";
      case 2:
        return "Residential";
      case 3:
        return "Commercial";
      default:
        return "Unknown";
    }
  };

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
      to: `/admin/customer/${cid}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/customer/${cid}/more`,
      icon: EllipsisHorizontalIcon,
    },
    {
      label: "Archive",
      icon: ArchiveBoxIcon,
      isActive: true,
    },
  ];

  // Page configuration
  const pageConfig = {
    title: "Customer",
    subtitle: "Archive Customer",
    icon: UserIcon,
    actionIcon: ArchiveBoxIcon,
    loadingText: "Loading customer details...",
  };

  // Warning configuration
  const warningConfig = {
    title: "Archive Customer - Are you sure?",
    description: "You are about to archive this customer. This means:",
    consequences: [
      "The customer will no longer appear in the active customers list",
      "The customer will not be able to log in to their account",
      "All current orders and history will remain but the customer cannot place new orders",
      "This action can be undone by contacting a system administrator",
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
              {customer.firstName} {customer.lastName}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Status:</span>
            {getStatusDisplay(customer.status)}
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700 mr-2">Email:</span>
            <span className="text-gray-900">{customer.email}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700 mr-2">Phone:</span>
            <span className="text-gray-900">{formatPhone(customer.phone)}</span>
          </div>
          {customer.type && (
            <div className="flex items-center">
              {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
              ) : customer.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID ? (
                <HomeIcon className="w-4 h-4 mr-2 text-gray-400" />
              ) : (
                <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
              )}
              <span className="font-medium text-gray-700 mr-2">Type:</span>
              <span className="text-gray-900">{getTypeDisplay(customer.type)}</span>
            </div>
          )}
        </div>
      </div>
    ),
    [],
  );

  // Status alerts
  const statusAlerts = [
    {
      condition: (entity) => entity?.status === 2,
      type: "warning",
      message: "This customer is already archived",
      icon: ArchiveBoxIcon,
    },
  ];

  // Check if action is disabled
  const isActionDisabled = useCallback((entity) => entity?.status === 2, []);

  return (
    <UIXThemeProvider>
      <EntityActionConfirmationPage
        entityType="customer"
        entityId={cid}
        actionType="archive"
        fetchEntity={fetchEntity}
        executeAction={executeAction}
        breadcrumbItems={breadcrumbItems}
        pageConfig={pageConfig}
        renderEntityInfo={renderEntityInfo}
        warningConfig={warningConfig}
        statusAlerts={statusAlerts}
        isActionDisabled={isActionDisabled}
        returnPath={`/admin/customer/${cid}/more`}
        successRedirectPath="/admin/customers"
        successRedirectDelay={2000}
      />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreArchivePage;

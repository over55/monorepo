// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Update/Page.jsx
// UIX Upgraded - Uses EntityActionConfirmationPage whole page component
// @uix-page: SettingInactiveClientUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import { EntityActionConfirmationPage, UIXThemeProvider } from "../../../../../components/UIX";
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  HomeIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_DEACTIVATION_REASON_MAP,
} from "../../../../../constants/Customer";

// Helper to get customer type display
const getCustomerTypeDisplay = (type) => {
  switch (type) {
    case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <BuildingOffice2Icon className="w-3 h-3 mr-1" />
          Commercial
        </span>
      );
    case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <HomeIcon className="w-3 h-3 mr-1" />
          Residential
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unassigned
        </span>
      );
  }
};

// Helper to get client name
const getClientName = (client) => {
  if (!client) return "";
  if (client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && client.organizationName) {
    return client.organizationName;
  }
  return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown";
};

// Helper to get deactivation reason
const getDeactivationReasonText = (reason, reasonOther) => {
  if (reason === 1 && reasonOther) {
    return reasonOther;
  }
  return CUSTOMER_DEACTIVATION_REASON_MAP[reason] || "Not specified";
};

function SettingInactiveClientUpdatePage() {
  const { id } = useParams();
  const customerManager = useCustomerManager();

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      {
        label: "Inactive Clients",
        to: "/admin/settings/inactive-clients",
        icon: ArchiveBoxIcon,
      },
      {
        label: "Detail",
        to: `/admin/settings/inactive-client/${id}/detail`,
        icon: InformationCircleIcon,
      },
      { label: "Restore", icon: ArrowPathIcon, isActive: true },
    ],
    [id],
  );

  // Page configuration
  const pageConfig = useMemo(
    () => ({
      title: "Inactive Client",
      subtitle: "Restore Client to Active Status",
      icon: ArchiveBoxIcon,
      actionIcon: ArrowPathIcon,
      loadingText: "Loading client details...",
    }),
    [],
  );

  // Warning configuration
  const warningConfig = useMemo(
    () => ({
      title: "Restore Client - Are you sure?",
      description: "You are about to restore this client to active status. This means:",
      consequences: [
        "The client will be removed from the inactive clients list",
        "The client will appear in the active customers list",
        "The client's deactivation reason will be cleared",
        "All client data and history will remain intact",
      ],
      confirmationText: "Are you sure you would like to continue?",
      warningType: "amber",
    }),
    [],
  );

  // Status alerts - show message if already active
  const statusAlerts = useMemo(
    () => [
      {
        condition: (entity) => entity?.status === 1,
        type: "info",
        message: "This client is already active",
        icon: InformationCircleIcon,
      },
    ],
    [],
  );

  // Check if action should be disabled
  const isActionDisabled = useCallback((entity) => {
    return entity?.status === 1; // Already active
  }, []);

  // Fetch entity function
  const fetchEntity = useCallback(
    (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      customerManager
        .getCustomerDetail(entityId, onUnauthorized)
        .then((response) => {
          if (response) {
            onSuccess(response);
          } else {
            onError("Client not found");
          }
        })
        .catch((error) => {
          onError(error.message || "Failed to load client details");
        })
        .finally(() => {
          onDone();
        });
    },
    [customerManager],
  );

  // Execute restore action
  const executeRestore = useCallback(
    (entityId, onSuccess, onError, onDone, onUnauthorized) => {
      // First fetch the current client data
      customerManager
        .getCustomerDetail(entityId, onUnauthorized)
        .then((client) => {
          if (!client) {
            throw new Error("Client not found");
          }

          // Update the client to set status back to active
          const updateData = {
            ...client,
            status: 1, // Set to active
            deactivationReason: 0,
            deactivationReasonOther: "",
          };

          return customerManager.updateCustomer(entityId, updateData, onUnauthorized);
        })
        .then(() => {
          onSuccess("Client has been restored to active status successfully");
        })
        .catch((error) => {
          onError(error.message || "Failed to restore client");
        })
        .finally(() => {
          onDone();
        });
    },
    [customerManager],
  );

  // Custom entity info renderer
  const renderEntityInfo = useCallback((entity) => {
    if (!entity) return null;

    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <h3 className="text-base font-semibold text-gray-800">Client to be Restored</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex">
            <dt className="w-40 font-medium text-gray-600 shrink-0">Name</dt>
            <dd className="text-gray-800 font-medium">{getClientName(entity)}</dd>
          </div>
          {entity.email && (
            <div className="flex">
              <dt className="w-40 font-medium text-gray-600 shrink-0">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email
              </dt>
              <dd className="text-gray-800">{entity.email}</dd>
            </div>
          )}
          {entity.phone && (
            <div className="flex">
              <dt className="w-40 font-medium text-gray-600 shrink-0">
                <PhoneIcon className="w-4 h-4 inline mr-1" />
                Phone
              </dt>
              <dd className="text-gray-800">{entity.phone}</dd>
            </div>
          )}
          <div className="flex items-center">
            <dt className="w-40 font-medium text-gray-600 shrink-0">Type</dt>
            <dd>{getCustomerTypeDisplay(entity.type)}</dd>
          </div>
          <div className="flex">
            <dt className="w-40 font-medium text-gray-600 shrink-0">Deactivation Reason</dt>
            <dd className="text-gray-800">
              {getDeactivationReasonText(
                entity.deactivationReason,
                entity.deactivationReasonOther,
              )}
            </dd>
          </div>
        </dl>
      </div>
    );
  }, []);

  return (
    <EntityActionConfirmationPage
      entityType="client"
      entityId={id}
      actionType="restore"
      fetchEntity={fetchEntity}
      executeAction={executeRestore}
      breadcrumbItems={breadcrumbItems}
      pageConfig={pageConfig}
      renderEntityInfo={renderEntityInfo}
      warningConfig={warningConfig}
      statusAlerts={statusAlerts}
      isActionDisabled={isActionDisabled}
      returnPath={`/admin/settings/inactive-client/${id}/detail`}
      successRedirectPath="/admin/settings/inactive-clients"
      successRedirectDelay={2000}
      confirmButtonText="Confirm and Restore"
      confirmButtonVariant="success"
    />
  );
}

const SettingInactiveClientUpdatePageContent = memo(SettingInactiveClientUpdatePage);
SettingInactiveClientUpdatePageContent.displayName = "SettingInactiveClientUpdatePageContent";

function SettingInactiveClientUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInactiveClientUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInactiveClientUpdatePageWithProvider;

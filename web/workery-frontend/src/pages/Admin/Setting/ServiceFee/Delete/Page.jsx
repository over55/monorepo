// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingServiceFeeDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CreditCardIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: BanknotesIcon,
    text: "Any transactions that have used this service fee will be affected",
  },
  {
    icon: DocumentTextIcon,
    text: "Historical records and financial reports that include this fee will be affected",
  },
  {
    icon: ReceiptPercentIcon,
    text: "Any invoices or receipts that reference this fee structure will be affected",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this service fee once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Set the service fee to "Inactive" instead of deleting it
• Update the fee name or description if it's outdated
• Document the fee configuration before deletion for records`;

function SettingServiceFeeDeletePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Service Fees", to: "/admin/settings/service-fees", icon: CreditCardIcon },
      { label: "Detail", to: `/admin/settings/service-fee/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await serviceFeeManager.getServiceFeeDetail(itemId, onUnauthorized);
    },
    [serviceFeeManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("ServiceFeeDeletePage: Deleting service fee:", itemId);
      }

      return await serviceFeeManager.deleteServiceFee(itemId, onUnauthorized);
    },
    [serviceFeeManager],
  );

  // Function to render item details
  const renderItemDetails = useCallback((item) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
          <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
            {item.name || "N/A"}
          </div>
        </div>
        {item.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <div className="p-3 bg-white rounded border border-gray-300">{item.description}</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID:</span>{" "}
            <span className="text-gray-900">{item.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Rate:</span>{" "}
            <span className="text-gray-900 flex items-center">
              <PercentBadgeIcon className="w-4 h-4 mr-1 text-blue-500" />
              {item.percentage || 0}%
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {item.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Service Fee"
      icon={CreditCardIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/service-fees"
      detailPath={`/admin/settings/service-fee/${id}/detail`}
      editPath={`/admin/settings/service-fee/${id}/update`}
      entityName="service fee"
      displayField="name"
      requireConfirmation={true}
      confirmationWord="delete"
    />
  );
}

const SettingServiceFeeDeletePageContent = memo(SettingServiceFeeDeletePage);
SettingServiceFeeDeletePageContent.displayName = "SettingServiceFeeDeletePageContent";

function SettingServiceFeeDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingServiceFeeDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingServiceFeeDeletePageWithProvider;

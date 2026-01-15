// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingVehicleTypeDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TruckIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: TruckIcon,
    text: "Any associates currently assigned to this vehicle type will be affected",
  },
  {
    icon: DocumentTextIcon,
    text: "Historical records referencing this vehicle type will still exist but may show as 'Deleted'",
  },
  {
    icon: WrenchScrewdriverIcon,
    text: "Vehicle records and service histories that use this type will be affected",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this vehicle type once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Set the vehicle type to "Inactive" instead of deleting it
• Edit the vehicle type to update its name or description
• Export or document the vehicle type information before deletion`;

function SettingVehicleTypeDeletePage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Vehicle Types", to: "/admin/settings/vehicle-types", icon: TruckIcon },
      { label: "Detail", to: `/admin/settings/vehicle-type/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await vehicleTypeManager.getVehicleTypeDetail(itemId, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("VehicleTypeDeletePage: Deleting vehicle type:", itemId);
      }

      return await vehicleTypeManager.deleteVehicleType(itemId, onUnauthorized);
    },
    [vehicleTypeManager],
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
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {item.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Created:</span>{" "}
            <span className="text-gray-900">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Vehicle Type"
      icon={TruckIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/vehicle-types"
      detailPath={`/admin/settings/vehicle-type/${id}/detail`}
      editPath={`/admin/settings/vehicle-type/${id}/update`}
      entityName="vehicle type"
      displayField="name"
      requireConfirmation={true}
      confirmationWord="delete"
    />
  );
}

const SettingVehicleTypeDeletePageContent = memo(SettingVehicleTypeDeletePage);
SettingVehicleTypeDeletePageContent.displayName = "SettingVehicleTypeDeletePageContent";

function SettingVehicleTypeDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingVehicleTypeDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingVehicleTypeDeletePageWithProvider;

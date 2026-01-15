// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingVehicleTypeUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TruckIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "name",
    label: "Vehicle Type Name",
    type: "text",
    required: true,
    maxLength: 100,
    placeholder: "Enter vehicle type name",
    helperText: "A clear and descriptive name for the vehicle type (max 100 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    maxLength: 500,
    rows: 4,
    placeholder: "Enter description (optional)",
    helperText: "Additional context or details about this vehicle type (max 500 characters)",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ],
    helperText: "Changing to 'Inactive' will hide it from new selections",
  },
];

// Validation rules
const VALIDATION_RULES = {
  name: {
    maxLength: 100,
    minLength: 1,
  },
  description: {
    maxLength: 500,
  },
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive name for the vehicle type",
  "The name should be unique and easily recognizable",
  "Use the description to provide additional context or details",
  "Vehicle types help categorize and organize associate vehicles",
  "Changing the status to 'Inactive' will hide it from new selections",
  "Review changes before saving",
];

function SettingVehicleTypeUpdatePage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Vehicle Types", to: "/admin/settings/vehicle-types", icon: TruckIcon },
      { label: "Detail", to: `/admin/settings/vehicle-type/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await vehicleTypeManager.getVehicleTypeDetail(itemId, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  // Submit function for updating the vehicle type
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const vehicleTypeData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        status: parseInt(formData.status),
      };

      if (import.meta.env.DEV) {
        console.log("VehicleTypeUpdatePage: Submitting vehicle type update:", vehicleTypeData);
      }

      return await vehicleTypeManager.updateVehicleType(itemId, vehicleTypeData, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update Vehicle Type"
      icon={TruckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      fetchItem={fetchItem}
      submitForm={submitForm}
      listPath="/admin/settings/vehicle-types"
      detailPath={`/admin/settings/vehicle-type/${id}/detail`}
      entityName="vehicle type"
      guidelines={GUIDELINES}
    />
  );
}

const SettingVehicleTypeUpdatePageContent = memo(SettingVehicleTypeUpdatePage);
SettingVehicleTypeUpdatePageContent.displayName = "SettingVehicleTypeUpdatePageContent";

function SettingVehicleTypeUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingVehicleTypeUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingVehicleTypeUpdatePageWithProvider;

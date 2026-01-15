// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingVehicleTypeCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TruckIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
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

// Hidden fields with default values
const HIDDEN_FIELDS = [
  {
    name: "status",
    defaultValue: 1, // Active by default
  },
];

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive name for the vehicle type",
  "The name should be unique and easily recognizable",
  "Use the description to provide additional context or details",
  "Vehicle types help categorize and organize associate vehicles",
  "Common examples: Sedan, Pickup Truck, Van, Service Vehicle",
];

function SettingVehicleTypeCreatePage() {
  const vehicleTypeManager = useVehicleTypeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Vehicle Types", to: "/admin/settings/vehicle-types", icon: TruckIcon },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating a vehicle type
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const vehicleTypeData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        status: formData.status,
      };

      if (import.meta.env.DEV) {
        console.log("VehicleTypeCreatePage: Submitting vehicle type creation:", vehicleTypeData);
      }

      return await vehicleTypeManager.createVehicleType(vehicleTypeData, onUnauthorized);
    },
    [vehicleTypeManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create Vehicle Type"
      icon={TruckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      hiddenFields={HIDDEN_FIELDS}
      submitForm={submitForm}
      listPath="/admin/settings/vehicle-types"
      detailPathTemplate="/admin/settings/vehicle-type/{id}/detail"
      entityName="vehicle type"
      guidelines={GUIDELINES}
    />
  );
}

const SettingVehicleTypeCreatePageContent = memo(SettingVehicleTypeCreatePage);
SettingVehicleTypeCreatePageContent.displayName = "SettingVehicleTypeCreatePageContent";

function SettingVehicleTypeCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingVehicleTypeCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingVehicleTypeCreatePageWithProvider;

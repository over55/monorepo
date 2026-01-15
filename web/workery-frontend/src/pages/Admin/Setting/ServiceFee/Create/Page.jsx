// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingServiceFeeCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useServiceFeeManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CreditCardIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "name",
    label: "Service Fee Name",
    type: "text",
    required: true,
    maxLength: 127,
    placeholder: "Enter service fee name",
    helperText: "A clear and descriptive name for the service fee (max 127 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    maxLength: 500,
    rows: 4,
    placeholder: "Enter description",
    helperText: "Describe when and how this fee applies (max 500 characters)",
  },
  {
    name: "percentage",
    label: "Percentage Rate (%)",
    type: "number",
    required: true,
    min: 0,
    max: 100,
    step: 0.01,
    placeholder: "Enter percentage (e.g., 2.5)",
    helperText: "Enter a value between 0 and 100. Example: 2.5 for 2.5%",
  },
];

// Validation rules
const VALIDATION_RULES = {
  name: {
    maxLength: 127,
    minLength: 1,
  },
  description: {
    maxLength: 500,
    minLength: 1,
  },
  percentage: {
    min: 0,
    max: 100,
  },
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive name for the service fee",
  "The name should be unique and easily recognizable",
  "Describe when and how this fee applies in the description",
  "Enter the percentage rate between 0 and 100",
  "Common rates: Transaction Processing (2.5-3.5%), Platform Fee (5-10%)",
];

function SettingServiceFeeCreatePage() {
  const serviceFeeManager = useServiceFeeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Service Fees", to: "/admin/settings/service-fees", icon: CreditCardIcon },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating a service fee
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const serviceFeeData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        percentage: parseFloat(formData.percentage) || 0,
      };

      if (import.meta.env.DEV) {
        console.log("ServiceFeeCreatePage: Submitting service fee creation:", serviceFeeData);
      }

      return await serviceFeeManager.createServiceFee(serviceFeeData, onUnauthorized);
    },
    [serviceFeeManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create Service Fee"
      icon={CreditCardIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      submitForm={submitForm}
      listPath="/admin/settings/service-fees"
      detailPathTemplate="/admin/settings/service-fee/{id}/detail"
      entityName="service fee"
      guidelines={GUIDELINES}
    />
  );
}

const SettingServiceFeeCreatePageContent = memo(SettingServiceFeeCreatePage);
SettingServiceFeeCreatePageContent.displayName = "SettingServiceFeeCreatePageContent";

function SettingServiceFeeCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingServiceFeeCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingServiceFeeCreatePageWithProvider;

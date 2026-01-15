// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingInsuranceRequirementCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  ShieldCheckIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "name",
    label: "Insurance Requirement Name",
    type: "text",
    required: true,
    maxLength: 100,
    placeholder: "Enter insurance requirement name",
    helperText: "A clear and descriptive name for the insurance requirement (max 100 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    maxLength: 500,
    rows: 4,
    placeholder: "Enter description (optional)",
    helperText: "Additional context or details about this insurance requirement (max 500 characters)",
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
  "Choose a clear and descriptive name for the insurance requirement",
  "The name should be unique and easily recognizable",
  "Use the description to provide additional context or details",
  "Insurance requirements help specify coverage needed for jobs or associates",
  "Common examples: General Liability, Workers' Compensation, Professional Liability",
];

function SettingInsuranceRequirementCreatePage() {
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Insurance Requirements", to: "/admin/settings/insurance-requirements", icon: ShieldCheckIcon },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating an insurance requirement
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const insuranceRequirementData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
      };

      if (import.meta.env.DEV) {
        console.log("InsuranceRequirementCreatePage: Submitting insurance requirement creation:", insuranceRequirementData);
      }

      return await insuranceRequirementManager.createInsuranceRequirement(insuranceRequirementData, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create Insurance Requirement"
      icon={ShieldCheckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      submitForm={submitForm}
      listPath="/admin/settings/insurance-requirements"
      detailPathTemplate="/admin/settings/insurance-requirement/{id}/detail"
      entityName="insurance requirement"
      guidelines={GUIDELINES}
    />
  );
}

const SettingInsuranceRequirementCreatePageContent = memo(SettingInsuranceRequirementCreatePage);
SettingInsuranceRequirementCreatePageContent.displayName = "SettingInsuranceRequirementCreatePageContent";

function SettingInsuranceRequirementCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInsuranceRequirementCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInsuranceRequirementCreatePageWithProvider;

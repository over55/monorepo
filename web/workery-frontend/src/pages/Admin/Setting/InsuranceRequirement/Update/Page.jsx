// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingInsuranceRequirementUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
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
  "Review changes before saving",
];

function SettingInsuranceRequirementUpdatePage() {
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Insurance Requirements", to: "/admin/settings/insurance-requirements", icon: ShieldCheckIcon },
      { label: "Detail", to: `/admin/settings/insurance-requirement/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await insuranceRequirementManager.getInsuranceRequirementDetail(itemId, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  // Submit function for updating the insurance requirement
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const insuranceRequirementData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
      };

      if (import.meta.env.DEV) {
        console.log("InsuranceRequirementUpdatePage: Submitting insurance requirement update:", insuranceRequirementData);
      }

      return await insuranceRequirementManager.updateInsuranceRequirement(itemId, insuranceRequirementData, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update Insurance Requirement"
      icon={ShieldCheckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      fetchItem={fetchItem}
      submitForm={submitForm}
      listPath="/admin/settings/insurance-requirements"
      detailPath={`/admin/settings/insurance-requirement/${id}/detail`}
      entityName="insurance requirement"
      guidelines={GUIDELINES}
    />
  );
}

const SettingInsuranceRequirementUpdatePageContent = memo(SettingInsuranceRequirementUpdatePage);
SettingInsuranceRequirementUpdatePageContent.displayName = "SettingInsuranceRequirementUpdatePageContent";

function SettingInsuranceRequirementUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInsuranceRequirementUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInsuranceRequirementUpdatePageWithProvider;

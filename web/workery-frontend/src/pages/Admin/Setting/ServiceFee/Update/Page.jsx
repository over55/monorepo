// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingServiceFeeUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  CreditCardIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
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
    required: false,
    maxLength: 500,
    rows: 4,
    placeholder: "Enter description (optional)",
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
    maxLength: 127,
    minLength: 1,
  },
  description: {
    maxLength: 500,
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
  "Changing the status to 'Inactive' will hide it from new selections",
  "Review changes before saving",
];

function SettingServiceFeeUpdatePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Service Fees", to: "/admin/settings/service-fees", icon: CreditCardIcon },
      { label: "Detail", to: `/admin/settings/service-fee/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await serviceFeeManager.getServiceFeeDetail(itemId, onUnauthorized);
    },
    [serviceFeeManager],
  );

  // Submit function for updating the service fee
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const serviceFeeData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        percentage: parseFloat(formData.percentage) || 0,
        status: parseInt(formData.status),
      };

      if (import.meta.env.DEV) {
        console.log("ServiceFeeUpdatePage: Submitting service fee update:", serviceFeeData);
      }

      return await serviceFeeManager.updateServiceFee(itemId, serviceFeeData, onUnauthorized);
    },
    [serviceFeeManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update Service Fee"
      icon={CreditCardIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      fetchItem={fetchItem}
      submitForm={submitForm}
      listPath="/admin/settings/service-fees"
      detailPath={`/admin/settings/service-fee/${id}/detail`}
      entityName="service fee"
      guidelines={GUIDELINES}
    />
  );
}

const SettingServiceFeeUpdatePageContent = memo(SettingServiceFeeUpdatePage);
SettingServiceFeeUpdatePageContent.displayName = "SettingServiceFeeUpdatePageContent";

function SettingServiceFeeUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingServiceFeeUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingServiceFeeUpdatePageWithProvider;

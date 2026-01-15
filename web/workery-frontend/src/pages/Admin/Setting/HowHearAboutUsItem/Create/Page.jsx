// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingHowHearAboutUsItemCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider, Checkbox } from "../../../../../components/UIX";
import {
  MegaphoneIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Custom Role Configuration Component - Uses UIX Checkbox with card-style wrapper
function RoleConfigurationCheckboxes({ value = {}, onChange, disabled }) {
  const handleChange = (field) => {
    onChange({
      ...value,
      [field]: !value[field],
    });
  };

  // Card-style checkbox wrapper component
  const CardCheckbox = ({ id, checked, onToggle, icon: Icon, iconColor, label, helperText }) => (
    <div
      onClick={() => !disabled && onToggle()}
      className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
        checked
          ? "bg-green-50 border-green-500"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        className="mt-1"
      />
      <div className="ml-3">
        <div className="flex items-center">
          <Icon className={`w-4 h-4 mr-2 ${iconColor}`} />
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <CardCheckbox
        id="isForAssociate"
        checked={value.isForAssociate || false}
        onToggle={() => handleChange("isForAssociate")}
        icon={BriefcaseIcon}
        iconColor="text-blue-500"
        label="For Associates"
        helperText="Associates can select this option when registering"
      />

      <CardCheckbox
        id="isForCustomer"
        checked={value.isForCustomer || false}
        onToggle={() => handleChange("isForCustomer")}
        icon={UsersIcon}
        iconColor="text-purple-500"
        label="For Customers"
        helperText="Customers can select this option when registering"
      />

      <CardCheckbox
        id="isForStaff"
        checked={value.isForStaff || false}
        onToggle={() => handleChange("isForStaff")}
        icon={UserGroupIcon}
        iconColor="text-green-500"
        label="For Staff"
        helperText="Staff can select this option when creating records"
      />
    </div>
  );
}

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "sortNumber",
    label: "Sort Number",
    type: "number",
    required: true,
    min: 0,
    placeholder: "Enter sort number (e.g., 1, 2, 3...)",
    helperText: "Lower numbers appear first in lists",
  },
  {
    name: "text",
    label: "Display Text",
    type: "text",
    required: true,
    maxLength: 255,
    placeholder: "Enter the display text (e.g., 'Google Search', 'Referral from friend')",
    helperText: "A clear and descriptive text for the option (max 255 characters)",
  },
  {
    name: "roleConfiguration",
    label: "Role Configuration",
    type: "custom",
    required: true,
    component: RoleConfigurationCheckboxes,
    helperText: "Select which user roles can use this option (at least one required)",
  },
];

// Validation rules
const VALIDATION_RULES = {
  text: {
    maxLength: 255,
    minLength: 1,
  },
  sortNumber: {
    min: 0,
  },
};

// Custom validation function for role configuration
const customValidation = (formData) => {
  const errors = {};
  const roles = formData.roleConfiguration || {};

  if (!roles.isForAssociate && !roles.isForCustomer && !roles.isForStaff) {
    errors.roleConfiguration = "At least one role must be selected";
  }

  return errors;
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive text for the option",
  "Use consistent terminology that users can easily understand",
  "Assign logical sort numbers to control display order",
  "Select appropriate roles based on your audience",
  "Common examples: Google Search, Referral from friend, Social Media, Newspaper Ad",
];

// Default values for the form
const DEFAULT_VALUES = {
  sortNumber: 1,
  text: "",
  roleConfiguration: {
    isForAssociate: false,
    isForCustomer: false,
    isForStaff: false,
  },
};

function SettingHowHearAboutUsItemCreatePage() {
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      {
        label: "How Hear About Us Items",
        to: "/admin/settings/how-hear-about-us-items",
        icon: MegaphoneIcon,
      },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating the item
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const roles = formData.roleConfiguration || {};
      const submitData = {
        sortNumber: parseInt(formData.sortNumber) || 0,
        text: formData.text.trim(),
        isForAssociate: roles.isForAssociate || false,
        isForCustomer: roles.isForCustomer || false,
        isForStaff: roles.isForStaff || false,
      };

      if (import.meta.env.DEV) {
        console.log("HowHearAboutUsItemCreatePage: Submitting item creation:", submitData);
      }

      return await howHearAboutUsItemManager.create(submitData, onUnauthorized);
    },
    [howHearAboutUsItemManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create How Hear About Us Item"
      icon={MegaphoneIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      customValidation={customValidation}
      submitForm={submitForm}
      listPath="/admin/settings/how-hear-about-us-items"
      detailPathTemplate="/admin/settings/how-hear-about-us-item/{id}/detail"
      entityName="how hear about us item"
      guidelines={GUIDELINES}
      defaultValues={DEFAULT_VALUES}
    />
  );
}

const SettingHowHearAboutUsItemCreatePageContent = memo(SettingHowHearAboutUsItemCreatePage);
SettingHowHearAboutUsItemCreatePageContent.displayName = "SettingHowHearAboutUsItemCreatePageContent";

function SettingHowHearAboutUsItemCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingHowHearAboutUsItemCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingHowHearAboutUsItemCreatePageWithProvider;

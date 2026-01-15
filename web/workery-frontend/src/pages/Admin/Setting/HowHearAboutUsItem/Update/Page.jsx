// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingHowHearAboutUsItemUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider, Checkbox } from "../../../../../components/UIX";
import {
  MegaphoneIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
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

// Transform fetched data for the form
const transformFetchedData = (data) => {
  return {
    sortNumber: data.sortNumber || 0,
    text: data.text || "",
    roleConfiguration: {
      isForAssociate: data.isForAssociate || false,
      isForCustomer: data.isForCustomer || false,
      isForStaff: data.isForStaff || false,
    },
    status: data.status || 1,
  };
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive text for the option",
  "Use consistent terminology that users can easily understand",
  "Assign logical sort numbers to control display order",
  "Select appropriate roles based on your audience",
  "Changing to 'Inactive' will hide it from new selections",
  "Review changes before saving",
];

function SettingHowHearAboutUsItemUpdatePage() {
  const { id } = useParams();
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
      {
        label: "Detail",
        to: `/admin/settings/how-hear-about-us-item/${id}/detail`,
        icon: ClipboardDocumentIcon,
      },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await howHearAboutUsItemManager.getDetail(itemId, onUnauthorized, true);
    },
    [howHearAboutUsItemManager],
  );

  // Check if item can be modified (system-protected check)
  const canModifyItem = useCallback((item) => {
    return item.text !== "Other";
  }, []);

  // Submit function for updating the item
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const roles = formData.roleConfiguration || {};
      const submitData = {
        id: itemId,
        sortNumber: parseInt(formData.sortNumber) || 0,
        text: formData.text.trim(),
        isForAssociate: roles.isForAssociate || false,
        isForCustomer: roles.isForCustomer || false,
        isForStaff: roles.isForStaff || false,
        status: parseInt(formData.status),
      };

      if (import.meta.env.DEV) {
        console.log("HowHearAboutUsItemUpdatePage: Submitting item update:", submitData);
      }

      return await howHearAboutUsItemManager.update(itemId, submitData, onUnauthorized);
    },
    [howHearAboutUsItemManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update How Hear About Us Item"
      icon={MegaphoneIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      customValidation={customValidation}
      fetchItem={fetchItem}
      transformFetchedData={transformFetchedData}
      submitForm={submitForm}
      listPath="/admin/settings/how-hear-about-us-items"
      detailPath={`/admin/settings/how-hear-about-us-item/${id}/detail`}
      entityName="how hear about us item"
      guidelines={GUIDELINES}
      canModifyItem={canModifyItem}
      systemProtectedMessage="This is a system-protected item and cannot be edited."
    />
  );
}

const SettingHowHearAboutUsItemUpdatePageContent = memo(SettingHowHearAboutUsItemUpdatePage);
SettingHowHearAboutUsItemUpdatePageContent.displayName = "SettingHowHearAboutUsItemUpdatePageContent";

function SettingHowHearAboutUsItemUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingHowHearAboutUsItemUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingHowHearAboutUsItemUpdatePageWithProvider;

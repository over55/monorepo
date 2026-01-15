// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingTagCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useTagManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TagIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "text",
    label: "Tag Text",
    type: "text",
    required: true,
    maxLength: 100,
    placeholder: "Enter tag text",
    helperText: "A clear and descriptive text for the tag (max 100 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    maxLength: 500,
    rows: 4,
    placeholder: "Enter description (optional)",
    helperText: "Additional context or details about this tag (max 500 characters)",
  },
];

// Validation rules
const VALIDATION_RULES = {
  text: {
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
  "Choose a clear and descriptive text for the tag",
  "The text should be unique and easily recognizable",
  "Use the description to provide additional context or details",
  "Tags help categorize and organize content throughout the system",
  "Keep tag text concise for better usability",
];

function SettingTagCreatePage() {
  const tagManager = useTagManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Tags", to: "/admin/settings/tags", icon: TagIcon },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating a tag
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const tagData = {
        text: formData.text.trim(),
        description: formData.description?.trim() || "",
        status: formData.status,
      };

      if (import.meta.env.DEV) {
        console.log("TagCreatePage: Submitting tag creation:", tagData);
      }

      return await tagManager.createTag(tagData, onUnauthorized);
    },
    [tagManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create New Tag"
      icon={TagIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      hiddenFields={HIDDEN_FIELDS}
      submitForm={submitForm}
      listPath="/admin/settings/tags"
      detailPathTemplate="/admin/settings/tag/{id}/detail"
      entityName="tag"
      guidelines={GUIDELINES}
    />
  );
}

const SettingTagCreatePageContent = memo(SettingTagCreatePage);
SettingTagCreatePageContent.displayName = "SettingTagCreatePageContent";

function SettingTagCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingTagCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingTagCreatePageWithProvider;

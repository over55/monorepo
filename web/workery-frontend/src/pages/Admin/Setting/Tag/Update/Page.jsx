// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingTagUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useTagManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  TagIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
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
    maxLength: 100,
    minLength: 1,
  },
  description: {
    maxLength: 500,
  },
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Choose a clear and descriptive text for the tag",
  "The text should be unique and easily recognizable",
  "Use the description to provide additional context or details",
  "Tags help categorize and organize content throughout the system",
  "Changing the status to 'Inactive' will hide it from new selections",
  "Keep tag text concise for better usability",
];

function SettingTagUpdatePage() {
  const { id } = useParams();
  const tagManager = useTagManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Tags", to: "/admin/settings/tags", icon: TagIcon },
      { label: "Detail", to: `/admin/settings/tag/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await tagManager.getTagDetail(itemId, onUnauthorized);
    },
    [tagManager],
  );

  // Submit function for updating the tag
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const tagData = {
        text: formData.text.trim(),
        description: formData.description?.trim() || "",
        status: parseInt(formData.status),
      };

      if (import.meta.env.DEV) {
        console.log("TagUpdatePage: Submitting tag update:", tagData);
      }

      return await tagManager.updateTag(itemId, tagData, onUnauthorized);
    },
    [tagManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update Tag"
      icon={TagIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      fetchItem={fetchItem}
      submitForm={submitForm}
      listPath="/admin/settings/tags"
      detailPath={`/admin/settings/tag/${id}/detail`}
      entityName="tag"
      guidelines={GUIDELINES}
    />
  );
}

const SettingTagUpdatePageContent = memo(SettingTagUpdatePage);
SettingTagUpdatePageContent.displayName = "SettingTagUpdatePageContent";

function SettingTagUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingTagUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingTagUpdatePageWithProvider;

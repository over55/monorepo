// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingSkillSetUpdatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { InsuranceRequirementsMultiSelect } from "../../../../../components/business/selects";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  AcademicCapIcon,
  PencilSquareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

// Form fields configuration
const FORM_FIELDS = [
  {
    name: "category",
    label: "Category",
    type: "text",
    required: true,
    maxLength: 127,
    placeholder: "e.g., Electrical, Plumbing, Carpentry",
    helperText: "Main skill category (max 127 characters)",
  },
  {
    name: "subCategory",
    label: "Sub-Category",
    type: "text",
    required: true,
    maxLength: 127,
    placeholder: "e.g., Residential Wiring, Commercial Installation",
    helperText: "Specific skill sub-category (max 127 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    maxLength: 500,
    rows: 4,
    placeholder: "Provide additional context or requirements (optional)",
    helperText: "Additional details about this skill set (max 500 characters)",
  },
  {
    name: "insuranceRequirements",
    label: "Insurance Requirements",
    type: "custom",
    required: false,
    component: InsuranceRequirementsMultiSelect,
    componentProps: {
      placeholder: "Select insurance requirements...",
      helperText: "Select one or more insurance requirements for this skill set",
    },
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
  category: {
    maxLength: 127,
    minLength: 1,
  },
  subCategory: {
    maxLength: 127,
    minLength: 1,
  },
  description: {
    maxLength: 500,
  },
};

// Guidelines for the sidebar
const GUIDELINES = [
  "Use clear, industry-standard category names",
  "Keep sub-categories specific but not too narrow",
  "Select all applicable insurance requirements for the skill",
  "Add descriptions for skills requiring certifications",
  "Changing status to 'Inactive' will hide it from selections",
  "Review changes before saving",
];

// Transform function for loading existing data
const transformFetchedData = (data) => {
  // Extract just the IDs from insurance requirements if they're objects
  const insuranceRequirementIds = data.insuranceRequirements
    ? data.insuranceRequirements.map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id || item.value;
        }
        return item;
      })
    : [];

  return {
    category: data.category || "",
    subCategory: data.subCategory || "",
    description: data.description || "",
    insuranceRequirements: insuranceRequirementIds,
    status: data.status || 1,
  };
};

function SettingSkillSetUpdatePage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Skill Sets", to: "/admin/settings/skill-sets", icon: AcademicCapIcon },
      { label: "Detail", to: `/admin/settings/skill-set/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Update", icon: PencilSquareIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading existing data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await skillSetManager.getSkillSetDetail(itemId, onUnauthorized);
    },
    [skillSetManager],
  );

  // Submit function for updating the skill set
  const submitForm = useCallback(
    async (formData, onUnauthorized, itemId) => {
      const skillSetData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description?.trim() || "",
        insuranceRequirements: formData.insuranceRequirements?.filter((id) => id) || [],
        status: parseInt(formData.status),
      };

      if (import.meta.env.DEV) {
        console.log("SkillSetUpdatePage: Submitting skill set update:", skillSetData);
      }

      return await skillSetManager.updateSkillSet(itemId, skillSetData, onUnauthorized);
    },
    [skillSetManager],
  );

  return (
    <SettingsFormView
      mode="update"
      id={id}
      title="Update Skill Set"
      icon={AcademicCapIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      fetchItem={fetchItem}
      submitForm={submitForm}
      listPath="/admin/settings/skill-sets"
      detailPath={`/admin/settings/skill-set/${id}/detail`}
      entityName="skill set"
      guidelines={GUIDELINES}
      transformFetchedData={transformFetchedData}
    />
  );
}

const SettingSkillSetUpdatePageContent = memo(SettingSkillSetUpdatePage);
SettingSkillSetUpdatePageContent.displayName = "SettingSkillSetUpdatePageContent";

function SettingSkillSetUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingSkillSetUpdatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingSkillSetUpdatePageWithProvider;

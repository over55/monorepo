// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingSkillSetCreatePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useSkillSetManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { InsuranceRequirementsMultiSelect } from "../../../../../components/business/selects";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  AcademicCapIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
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
  "Review existing skill sets to avoid duplicates",
];

function SettingSkillSetCreatePage() {
  const skillSetManager = useSkillSetManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Skill Sets", to: "/admin/settings/skill-sets", icon: AcademicCapIcon },
      { label: "Create", icon: PlusIcon, isActive: true },
    ],
    [],
  );

  // Submit function for creating a skill set
  const submitForm = useCallback(
    async (formData, onUnauthorized) => {
      const skillSetData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description?.trim() || "",
        status: 1, // Active by default
        insuranceRequirements: formData.insuranceRequirements || [],
      };

      if (import.meta.env.DEV) {
        console.log("SkillSetCreatePage: Submitting skill set creation:", skillSetData);
      }

      return await skillSetManager.createSkillSet(skillSetData, onUnauthorized);
    },
    [skillSetManager],
  );

  return (
    <SettingsFormView
      mode="create"
      title="Create Skill Set"
      icon={AcademicCapIcon}
      breadcrumbItems={breadcrumbItems}
      fields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      submitForm={submitForm}
      listPath="/admin/settings/skill-sets"
      detailPathTemplate="/admin/settings/skill-set/{id}/detail"
      entityName="skill set"
      guidelines={GUIDELINES}
    />
  );
}

const SettingSkillSetCreatePageContent = memo(SettingSkillSetCreatePage);
SettingSkillSetCreatePageContent.displayName = "SettingSkillSetCreatePageContent";

function SettingSkillSetCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingSkillSetCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingSkillSetCreatePageWithProvider;

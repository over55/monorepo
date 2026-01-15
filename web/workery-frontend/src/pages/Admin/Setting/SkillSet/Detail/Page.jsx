// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingSkillSetDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Insurance requirement display helper
const getInsuranceLabel = (value) => {
  switch (value) {
    case 1:
      return "None Required";
    case 2:
      return "Commercial General Liability (CGL)";
    case 3:
      return "WSIB";
    default:
      return "Not specified";
  }
};

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "category",
    label: "Category",
    required: true,
  },
  {
    name: "subCategory",
    label: "Sub-Category",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  {
    name: "status",
    label: "Status",
    type: "status",
    render: (value) => (
      <span
        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
          value === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {value === 1 ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    name: "insuranceRequirement",
    label: "Insurance Requirement",
    render: (value) => (
      <div className="flex items-center">
        <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
        <span className="text-gray-900">{getInsuranceLabel(value)}</span>
      </div>
    ),
  },
];

function SettingSkillSetDetailPage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Skill Sets", to: "/admin/settings/skill-sets", icon: AcademicCapIcon },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await skillSetManager.getSkillSetDetail(itemId, onUnauthorized);
    },
    [skillSetManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Skill Set Details"
      icon={AcademicCapIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/skill-sets"
      editPath={`/admin/settings/skill-set/${id}/update`}
      deletePath={`/admin/settings/skill-set/${id}/delete`}
      entityName="skill set"
      displayField="category"
    />
  );
}

const SettingSkillSetDetailPageContent = memo(SettingSkillSetDetailPage);
SettingSkillSetDetailPageContent.displayName = "SettingSkillSetDetailPageContent";

function SettingSkillSetDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingSkillSetDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingSkillSetDetailPageWithProvider;

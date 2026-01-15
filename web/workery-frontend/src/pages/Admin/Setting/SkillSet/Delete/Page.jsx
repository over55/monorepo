// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingSkillSetDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  AcademicCapIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Insurance requirement display helper
const getInsuranceLabel = (value) => {
  switch (value) {
    case 1:
      return "None";
    case 2:
      return "CGL";
    case 3:
      return "WSIB";
    default:
      return "—";
  }
};

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: UserGroupIcon,
    text: "Any associates currently assigned to this skill set may be affected",
  },
  {
    icon: BriefcaseIcon,
    text: "Work orders that reference this skill set may lose this requirement information",
  },
  {
    icon: DocumentTextIcon,
    text: "Historical records referencing this skill set will still exist but may show as 'Deleted'",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this skill set once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Set the skill set to "Inactive" instead of deleting it
• Edit the skill set to update its categories or requirements
• Export or document the skill set information before deletion`;

function SettingSkillSetDeletePage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Skill Sets", to: "/admin/settings/skill-sets", icon: AcademicCapIcon },
      { label: "Detail", to: `/admin/settings/skill-set/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await skillSetManager.getSkillSetDetail(itemId, onUnauthorized);
    },
    [skillSetManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("SkillSetDeletePage: Deleting skill set:", itemId);
      }

      return await skillSetManager.deleteSkillSet(itemId, onUnauthorized);
    },
    [skillSetManager],
  );

  // Function to render item details
  const renderItemDetails = useCallback((item) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
            <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
              {item.category || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category:</label>
            <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
              {item.subCategory || "N/A"}
            </div>
          </div>
        </div>
        {item.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <div className="p-3 bg-white rounded border border-gray-300">{item.description}</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID:</span>{" "}
            <span className="text-gray-900">{item.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>{" "}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {item.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center">
            <ShieldCheckIcon className="w-4 h-4 mr-1 text-gray-500" />
            <span className="font-medium text-gray-600">Insurance:</span>{" "}
            <span className="text-gray-900 ml-1">
              {getInsuranceLabel(item.insuranceRequirement)}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Skill Set"
      icon={AcademicCapIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/skill-sets"
      detailPath={`/admin/settings/skill-set/${id}/detail`}
      editPath={`/admin/settings/skill-set/${id}/update`}
      entityName="skill set"
      displayField="category"
      requireConfirmation={true}
      confirmationWord="delete"
    />
  );
}

const SettingSkillSetDeletePageContent = memo(SettingSkillSetDeletePage);
SettingSkillSetDeletePageContent.displayName = "SettingSkillSetDeletePageContent";

function SettingSkillSetDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingSkillSetDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingSkillSetDeletePageWithProvider;

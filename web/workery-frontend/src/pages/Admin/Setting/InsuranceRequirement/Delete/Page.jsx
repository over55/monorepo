// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingInsuranceRequirementDeletePageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  ShieldCheckIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Impact warnings for deletion
const IMPACT_WARNINGS = [
  {
    icon: UserGroupIcon,
    text: "Any associates currently assigned to this insurance requirement will be affected",
  },
  {
    icon: BuildingOfficeIcon,
    text: "Jobs that reference this insurance requirement may show as 'Deleted'",
  },
  {
    icon: DocumentTextIcon,
    text: "Historical records and reports that include this requirement will be affected",
  },
  {
    icon: TrashIcon,
    text: "You will not be able to recover this insurance requirement once deleted",
  },
];

// Alternative suggestions text
const ALTERNATIVE_TEXT = `Consider these alternatives:
• Update the insurance requirement name or description instead
• Document the requirement information before deletion
• Verify no active associates or jobs depend on this requirement`;

function SettingInsuranceRequirementDeletePage() {
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Insurance Requirements", to: "/admin/settings/insurance-requirements", icon: ShieldCheckIcon },
      { label: "Detail", to: `/admin/settings/insurance-requirement/${id}/detail`, icon: ClipboardDocumentIcon },
      { label: "Delete", icon: TrashIcon, isActive: true },
    ],
    [id],
  );

  // Fetch function for loading item data
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await insuranceRequirementManager.getInsuranceRequirementDetail(itemId, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  // Delete function
  const deleteItem = useCallback(
    async (itemId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("InsuranceRequirementDeletePage: Deleting insurance requirement:", itemId);
      }

      return await insuranceRequirementManager.deleteInsuranceRequirement(itemId, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  // Function to render item details
  const renderItemDetails = useCallback((item) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
          <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
            {item.name || "N/A"}
          </div>
        </div>
        {item.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
            <div className="p-3 bg-white rounded border border-gray-300">{item.description}</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID:</span>{" "}
            <span className="text-gray-900">{item.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Created:</span>{" "}
            <span className="text-gray-900">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  }, []);

  return (
    <SettingsDeleteView
      id={id}
      title="Delete Insurance Requirement"
      icon={ShieldCheckIcon}
      breadcrumbItems={breadcrumbItems}
      fetchItem={fetchItem}
      deleteItem={deleteItem}
      renderItemDetails={renderItemDetails}
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      listPath="/admin/settings/insurance-requirements"
      detailPath={`/admin/settings/insurance-requirement/${id}/detail`}
      editPath={`/admin/settings/insurance-requirement/${id}/update`}
      entityName="insurance requirement"
      displayField="name"
      requireConfirmation={true}
      confirmationWord="delete"
    />
  );
}

const SettingInsuranceRequirementDeletePageContent = memo(SettingInsuranceRequirementDeletePage);
SettingInsuranceRequirementDeletePageContent.displayName = "SettingInsuranceRequirementDeletePageContent";

function SettingInsuranceRequirementDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInsuranceRequirementDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInsuranceRequirementDeletePageWithProvider;

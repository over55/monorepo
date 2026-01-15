// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingInsuranceRequirementDetailPageWithProvider

import React, { useMemo, useCallback, memo } from "react";
import { useParams } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import {
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

// Detail fields configuration
const DETAIL_FIELDS = [
  {
    name: "name",
    label: "Name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
];

function SettingInsuranceRequirementDetailPage() {
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
      { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
      { label: "Insurance Requirements", to: "/admin/settings/insurance-requirements", icon: ShieldCheckIcon },
      { label: "Detail", icon: ClipboardDocumentIcon, isActive: true },
    ],
    [],
  );

  // Fetch function for the detail view
  const fetchItem = useCallback(
    async (itemId, onUnauthorized) => {
      return await insuranceRequirementManager.getInsuranceRequirementDetail(itemId, onUnauthorized);
    },
    [insuranceRequirementManager],
  );

  return (
    <SettingsDetailView
      id={id}
      title="Insurance Requirement Details"
      icon={ShieldCheckIcon}
      breadcrumbItems={breadcrumbItems}
      fields={DETAIL_FIELDS}
      fetchItem={fetchItem}
      listPath="/admin/settings/insurance-requirements"
      editPath={`/admin/settings/insurance-requirement/${id}/update`}
      deletePath={`/admin/settings/insurance-requirement/${id}/delete`}
      entityName="insurance requirement"
      displayField="name"
    />
  );
}

const SettingInsuranceRequirementDetailPageContent = memo(SettingInsuranceRequirementDetailPage);
SettingInsuranceRequirementDetailPageContent.displayName = "SettingInsuranceRequirementDetailPageContent";

function SettingInsuranceRequirementDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInsuranceRequirementDetailPageContent />
    </UIXThemeProvider>
  );
}

export default SettingInsuranceRequirementDetailPageWithProvider;

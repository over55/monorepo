// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Detail/Page.jsx
// UIX Upgraded - Uses SettingsDetailView whole page component
// @uix-page: SettingBulletinDetailPage
import React, { memo } from "react";
import { useBulletinManager } from "../../../../../services/Services";
import { SettingsDetailView } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";
import { NewspaperIcon } from "@heroicons/react/24/outline";

// Move static field configuration outside component to prevent recreation
const DETAIL_FIELDS = [
  {
    name: "text",
    label: "Bulletin Text",
    required: true,
  },
];

function SettingBulletinDetailPage() {
  return (
    <UIXThemeProvider>
      <SettingBulletinDetailPageContent />
    </UIXThemeProvider>
  );
}

const SettingBulletinDetailPageContent = memo(function SettingBulletinDetailPageContent() {
  const bulletinManager = useBulletinManager();

  return (
    <SettingsDetailView
      entityType="bulletin"
      entityTypePlural="Bulletins"
      entityIcon={NewspaperIcon}
      entityManager={bulletinManager}
      basePath="/admin/settings/bulletin"
      listPath="/admin/settings/bulletins"
      title="Bulletin Details"
      subtitle="View bulletin information and details"
      fields={DETAIL_FIELDS}
    />
  );
});
SettingBulletinDetailPageContent.displayName = 'SettingBulletinDetailPageContent';

export default SettingBulletinDetailPage;

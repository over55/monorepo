// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Delete/Page.jsx
// UIX Upgraded - Uses SettingsDeleteView whole page component
// @uix-page: SettingBulletinDeletePage
import React from "react";
import { useBulletinManager } from "../../../../../services/Services";
import { SettingsDeleteView } from "../../../../../components/business/views";
import {
  NewspaperIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Move static configuration outside component to prevent recreation
const IMPACT_WARNINGS = [
  {
    icon: NewspaperIcon,
    text: "Any users who have access to this bulletin will no longer see it",
  },
  {
    icon: DocumentTextIcon,
    text: "Historical records referencing this bulletin will still exist but may show as 'Deleted'",
  },
  {
    icon: InformationCircleIcon,
    text: "You will not be able to recover this bulletin once deleted",
  },
];

const ALTERNATIVE_TEXT =
  "Consider setting the bulletin to 'Inactive' instead of deleting it to preserve historical data.";

function SettingBulletinDeletePage() {
  const bulletinManager = useBulletinManager();

  return (
    <SettingsDeleteView
      entityType="bulletin"
      entityTypePlural="Bulletins"
      entityIcon={NewspaperIcon}
      entityManager={bulletinManager}
      basePath="/admin/settings/bulletin"
      listPath="/admin/settings/bulletins"
      title="Delete Bulletin"
      subtitle="Permanent deletion confirmation"
      impactWarnings={IMPACT_WARNINGS}
      alternativeText={ALTERNATIVE_TEXT}
      requiresConfirmation={true}
    />
  );
}

export default SettingBulletinDeletePage;

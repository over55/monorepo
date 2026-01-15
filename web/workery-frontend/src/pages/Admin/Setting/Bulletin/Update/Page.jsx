// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Update/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingBulletinUpdatePage

import React, { useMemo, memo } from "react";
import { useBulletinManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider, useUIXTheme } from "../../../../../components/UIX";
import { NewspaperIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// Move static configuration outside component to prevent recreation
const FORM_FIELDS = [
  {
    name: "text",
    label: "Bulletin Text",
    type: "textarea",
    placeholder: "Enter bulletin text",
    required: true,
    maxLength: 1000,
    rows: 4,
    defaultValue: "",
  },
];

const VALIDATION_RULES = {
  text: {
    maxLength: 1000,
    minLength: 1,
  },
};

// Status is hidden but submitted - keeps existing value on update
const HIDDEN_FIELDS = [
  { name: "status", defaultValue: 1 },
];

function SettingBulletinUpdatePage() {
  return (
    <UIXThemeProvider>
      <SettingBulletinUpdatePageContent />
    </UIXThemeProvider>
  );
}

const SettingBulletinUpdatePageContent = memo(function SettingBulletinUpdatePageContent() {
  const bulletinManager = useBulletinManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize custom info note
  const customInfoNote = useMemo(() => (
    <div className={`p-4 ${getThemeClasses('alert-info-bg')} border ${getThemeClasses('border-primary')} rounded-lg`}>
      <p className={`text-sm ${getThemeClasses('text-primary')} flex items-start`}>
        <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Bulletins are used to display important announcements and notices.
          Changes will be visible immediately after updating.
        </span>
      </p>
    </div>
  ), [getThemeClasses]);

  return (
    <SettingsFormView
      entityType="bulletin"
      entityTypePlural="Bulletins"
      entityIcon={NewspaperIcon}
      entityManager={bulletinManager}
      basePath="/admin/settings/bulletin"
      listPath="/admin/settings/bulletins"
      mode="update"
      formFields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      hiddenFields={HIDDEN_FIELDS}
      title="Edit Bulletin"
      subtitle="Update bulletin details and configuration"
      customInfoNote={customInfoNote}
    />
  );
});
SettingBulletinUpdatePageContent.displayName = 'SettingBulletinUpdatePageContent';

export default SettingBulletinUpdatePage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Create/Page.jsx
// UIX Upgraded - Uses SettingsFormView whole page component
// @uix-page: SettingBulletinCreatePage

import React, { useMemo, memo } from "react";
import { useBulletinManager } from "../../../../../services/Services";
import { SettingsFormView } from "../../../../../components/business/views";
import { UIXThemeProvider, useUIXTheme } from "../../../../../components/UIX";
import { NewspaperIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// Move static configuration outside component to prevent recreation
const FORM_FIELDS = [
  {
    name: "text",
    label: "Bulletin Message",
    type: "textarea",
    placeholder: "Type your bulletin message here...",
    required: true,
    maxLength: 1000,
    rows: 4,
    defaultValue: "",
    description: "Keep it short and clear. The bulletin will be active and visible to all users immediately after creation.",
  },
];

const VALIDATION_RULES = {
  text: {
    maxLength: 1000,
    minLength: 1,
  },
};

// Status is hidden but submitted - defaults to Active (1)
const HIDDEN_FIELDS = [
  { name: "status", defaultValue: 1 },
];

function SettingBulletinCreatePage() {
  return (
    <UIXThemeProvider>
      <SettingBulletinCreatePageContent />
    </UIXThemeProvider>
  );
}

const SettingBulletinCreatePageContent = memo(function SettingBulletinCreatePageContent() {
  const bulletinManager = useBulletinManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize custom info note
  const customInfoNote = useMemo(() => (
    <div className={`p-4 ${getThemeClasses('alert-info-bg')} border ${getThemeClasses('border-primary')} rounded-lg`}>
      <p className={`text-sm ${getThemeClasses('text-primary')} flex items-start`}>
        <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Bulletins are used to share important information and announcements with your team.
          Changes will be visible immediately after creating.
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
      mode="create"
      formFields={FORM_FIELDS}
      validationRules={VALIDATION_RULES}
      hiddenFields={HIDDEN_FIELDS}
      title="Create Bulletin"
      subtitle="Add a new bulletin to share important information with your team"
      customInfoNote={customInfoNote}
    />
  );
});
SettingBulletinCreatePageContent.displayName = 'SettingBulletinCreatePageContent';

export default SettingBulletinCreatePage;

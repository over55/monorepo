// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Ban/Page.jsx
// @uix-page: EntityActionBanPage

import React, { useCallback, memo } from "react";
import {
  BriefcaseIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

const AdminStaffDetailMoreBanPageContent = memo(function AdminStaffDetailMoreBanPageContent() {
  const staffManager = useStaffManager();

  const getStaffDetailWithManager = useCallback(async (staffId, onUnauthorized) => {
    return new Promise((resolve, reject) => {
      staffManager.getStaffDetailWithCallbacks(
        staffId,
        (staffData) => resolve(staffData),
        (error) => reject(error),
        () => {},
        onUnauthorized
      );
    });
  }, [staffManager]);

  const handleBanAction = useCallback(async (staffId, onUnauthorized) => {
    await staffManager.banStaff(staffId, onUnauthorized);
  }, [staffManager]);

  return (
    <EntityActionConfirmationPage
      entityIcon={BriefcaseIcon}
      entityType="Staff Member"
      entityTypePlural="Staff"
      basePath="/admin/staff"
      entityParamName="aid"
      entityManager={staffManager}
      getEntityDetail={getStaffDetailWithManager}
      actionIcon={NoSymbolIcon}
      actionName="Ban"
      actionDescription="Ban Staff Member - Permanently Block Access"
      actionWarningPoints={[
        "The staff member will be permanently banned from the system",
        "They will lose all access to their account",
        "This action can only be reversed by an administrator"
      ]}
      actionButtonText="Confirm and Ban"
      actionButtonVariant="danger"
      onActionExecute={handleBanAction}
      successMessage="Staff member has been successfully banned"
      redirectPath="/admin/staff"
    />
  );
});

function AdminStaffDetailMoreBanPage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreBanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreBanPage;

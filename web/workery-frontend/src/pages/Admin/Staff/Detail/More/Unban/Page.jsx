// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Unban/Page.jsx
// @uix-page: EntityActionUnbanPage

import React, { useCallback, memo } from "react";
import { BriefcaseIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminStaffDetailMoreUnbanPageContent = memo(
  function AdminStaffDetailMoreUnbanPageContent() {
    const staffManager = useStaffManager();

    // Get staff detail function that uses the hook - wrapped with useCallback to prevent infinite loops
    const getStaffDetailWithManager = useCallback(
      async (staffId, onUnauthorized) => {
        return new Promise((resolve, reject) => {
          staffManager.getStaffDetailWithCallbacks(
            staffId,
            (staffData) => resolve(staffData), // onSuccess
            (error) => reject(error), // onError
            () => {}, // onDone
            onUnauthorized, // onUnauthorized
          );
        });
      },
      [staffManager],
    );

    // Handle unban action
    const handleUnbanAction = useCallback(
      async (staffId, onUnauthorized) => {
        await staffManager.unbanStaff(staffId, onUnauthorized);
      },
      [staffManager],
    );

    return (
      <EntityActionConfirmationPage
        entityIcon={BriefcaseIcon}
        entityType="Staff Member"
        entityTypePlural="Staff"
        basePath="/admin/staff"
        entityParamName="aid"
        entityManager={staffManager}
        getEntityDetail={getStaffDetailWithManager}
        actionIcon={CheckCircleIcon}
        actionName="Unban"
        actionDescription="Unban Staff Member - Restore Account Access"
        actionWarningPoints={[
          "The staff member will be unbanned",
          "They will regain access to their account",
          "Their previous permissions will be restored",
        ]}
        actionButtonText="Confirm and Unban"
        actionButtonVariant="primary"
        onActionExecute={handleUnbanAction}
        successMessage="Staff member has been successfully unbanned"
        redirectPath="/admin/staff"
      />
    );
  },
);

function AdminStaffDetailMoreUnbanPage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreUnbanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreUnbanPage;

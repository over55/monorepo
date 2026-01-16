// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Upgrade/Page.jsx
// @uix-page: EntityActionUpgradePage

import React, { useCallback, memo } from "react";
import { BriefcaseIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminStaffDetailMoreUpgradePageContent = memo(
  function AdminStaffDetailMoreUpgradePageContent() {
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

    // Handle upgrade action
    const handleUpgradeAction = useCallback(
      async (staffId, onUnauthorized) => {
        await staffManager.upgradeStaff(staffId, onUnauthorized);
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
        actionIcon={ArrowUpCircleIcon}
        actionName="Upgrade"
        actionDescription="Upgrade Staff Member to Management Level"
        actionWarningPoints={[
          "The staff member will be upgraded to management level",
          "They will gain additional permissions and responsibilities",
          "This change affects their role in the system",
        ]}
        actionButtonText="Confirm and Upgrade"
        actionButtonVariant="primary"
        onActionExecute={handleUpgradeAction}
        successMessage="Staff member has been successfully upgraded"
        redirectPath="/admin/staff"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to upgrade this staff member to management. Are you sure you want to do this?"
        inlineConfirmButtonText="Upgrade"
      />
    );
  },
);

function AdminStaffDetailMoreUpgradePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreUpgradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreUpgradePage;

// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Downgrade/Page.jsx
// @uix-page: EntityActionDowngradePage

import React, { useCallback, memo } from "react";
import {
  BriefcaseIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminStaffDetailMoreDowngradePageContent = memo(
  function AdminStaffDetailMoreDowngradePageContent() {
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

    // Handle downgrade action
    const handleDowngradeAction = useCallback(
      async (staffId, onUnauthorized) => {
        await staffManager.downgradeStaff(staffId, onUnauthorized);
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
        actionIcon={ArrowDownCircleIcon}
        actionName="Downgrade"
        actionDescription="Downgrade Staff Member to Frontline Level"
        actionWarningPoints={[
          "The staff member will be downgraded to frontline level",
          "They will lose management permissions",
          "This change affects their role and responsibilities",
        ]}
        actionButtonText="Confirm and Downgrade"
        actionButtonVariant="warning"
        onActionExecute={handleDowngradeAction}
        successMessage="Staff member has been successfully downgraded"
        redirectPath="/admin/staff"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to downgrade this staff member to frontline. Are you sure you want to do this?"
        inlineConfirmButtonText="Downgrade"
      />
    );
  },
);

function AdminStaffDetailMoreDowngradePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreDowngradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreDowngradePage;

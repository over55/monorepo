// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Upgrade/Page.jsx
// @uix-page: EntityActionUpgradePage

import React, { useCallback, memo } from "react";
import { UserGroupIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminAssociateDetailMoreUpgradePageContent = memo(
  function AdminAssociateDetailMoreUpgradePageContent() {
    const associateManager = useAssociateManager();

    const getAssociateDetailWithManager = useCallback(
      async (associateId, onUnauthorized) => {
        return new Promise((resolve, reject) => {
          associateManager.getAssociateDetailWithCallbacks(
            associateId,
            (associateData) => resolve(associateData),
            (error) => reject(error),
            () => {},
            onUnauthorized,
          );
        });
      },
      [associateManager],
    );

    const handleUpgradeAction = useCallback(
      async (associateId, onUnauthorized) => {
        await associateManager.upgradeAssociate(associateId, onUnauthorized);
      },
      [associateManager],
    );

    return (
      <EntityActionConfirmationPage
        entityIcon={UserGroupIcon}
        entityType="Associate"
        entityTypePlural="Associates"
        basePath="/admin/associates"
        entityParamName="aid"
        entityManager={associateManager}
        getEntityDetail={getAssociateDetailWithManager}
        actionIcon={ArrowUpCircleIcon}
        actionName="Upgrade"
        actionDescription="Upgrade Associate to Commercial Type"
        actionWarningPoints={[
          "The associate will be upgraded to commercial type",
          "They will gain access to commercial work orders",
          "Different rate structure may apply",
          "This change affects their job assignments",
        ]}
        actionButtonText="Confirm and Upgrade"
        actionButtonVariant="primary"
        onActionExecute={handleUpgradeAction}
        successMessage="Associate has been successfully upgraded to commercial type"
        redirectPath="/admin/associates"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to upgrade this associate to commercial type. Are you sure you want to do this?"
        inlineConfirmButtonText="Upgrade"
      />
    );
  },
);

function AdminAssociateDetailMoreUpgradePage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMoreUpgradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreUpgradePage;

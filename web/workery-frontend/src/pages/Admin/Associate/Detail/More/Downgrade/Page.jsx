// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Downgrade/Page.jsx
// @uix-page: EntityActionDowngradePage

import React, { useCallback, memo } from "react";
import { UserGroupIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminAssociateDetailMoreDowngradePageContent = memo(
  function AdminAssociateDetailMoreDowngradePageContent() {
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

    const handleDowngradeAction = useCallback(
      async (associateId, onUnauthorized) => {
        await associateManager.downgradeAssociate(associateId, onUnauthorized);
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
        actionIcon={ArrowDownCircleIcon}
        actionName="Downgrade"
        actionDescription="Downgrade Associate to Residential Type"
        actionWarningPoints={[
          "The associate will be downgraded to residential type",
          "They will lose access to commercial work orders",
          "Different rate structure may apply",
          "This change affects their job assignments",
        ]}
        actionButtonText="Confirm and Downgrade"
        actionButtonVariant="warning"
        onActionExecute={handleDowngradeAction}
        successMessage="Associate has been successfully downgraded to residential type"
        redirectPath="/admin/associates"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to downgrade this associate to residential type. Are you sure you want to do this?"
        inlineConfirmButtonText="Downgrade"
      />
    );
  },
);

function AdminAssociateDetailMoreDowngradePage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMoreDowngradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreDowngradePage;

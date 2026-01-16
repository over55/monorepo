// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Unban/Page.jsx
// @uix-page: EntityActionUnbanPage

import React, { useCallback, memo } from "react";
import { UserGroupIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminAssociateDetailMoreUnbanPageContent = memo(function AdminAssociateDetailMoreUnbanPageContent() {
  const associateManager = useAssociateManager();

  const getAssociateDetailWithManager = useCallback(async (associateId, onUnauthorized) => {
    return new Promise((resolve, reject) => {
      associateManager.getAssociateDetailWithCallbacks(
        associateId,
        (associateData) => resolve(associateData),
        (error) => reject(error),
        () => {},
        onUnauthorized
      );
    });
  }, [associateManager]);

  const handleUnbanAction = useCallback(async (associateId, onUnauthorized) => {
    await associateManager.unbanAssociate(associateId, onUnauthorized);
  }, [associateManager]);

  return (
    <EntityActionConfirmationPage
      entityIcon={UserGroupIcon}
      entityType="Associate"
      entityTypePlural="Associates"
      basePath="/admin/associates"
      entityParamName="aid"
      entityManager={associateManager}
      getEntityDetail={getAssociateDetailWithManager}
      actionIcon={CheckCircleIcon}
      actionName="Unban"
      actionDescription="Unban Associate - Restore Account Access"
      actionWarningPoints={[
        "The associate will be unbanned",
        "They will regain access to their account",
        "Their previous permissions will be restored",
        "They will be able to receive work orders again"
      ]}
      actionButtonText="Confirm and Unban"
      actionButtonVariant="primary"
      onActionExecute={handleUnbanAction}
      successMessage="Associate has been successfully unbanned"
      redirectPath="/admin/associates"
    />
  );
});

function AdminAssociateDetailMoreUnbanPage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMoreUnbanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreUnbanPage;

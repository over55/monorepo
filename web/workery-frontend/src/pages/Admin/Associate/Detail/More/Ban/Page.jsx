// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Ban/Page.jsx
// @uix-page: EntityActionBanPage

import React, { useCallback, memo } from "react";
import { UserGroupIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

const AdminAssociateDetailMoreBanPageContent = memo(function AdminAssociateDetailMoreBanPageContent() {
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

  const handleBanAction = useCallback(async (associateId, onUnauthorized) => {
    await associateManager.banAssociate(associateId, onUnauthorized);
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
      actionIcon={NoSymbolIcon}
      actionName="Ban"
      actionDescription="Ban Associate - Permanently Block Access"
      actionWarningPoints={[
        "The associate will be permanently banned from the system",
        "They will lose all access to their account",
        "They will not be able to receive or complete any work orders",
        "This action can only be reversed by an administrator"
      ]}
      actionButtonText="Confirm and Ban"
      actionButtonVariant="danger"
      onActionExecute={handleBanAction}
      successMessage="Associate has been successfully banned"
      redirectPath="/admin/associates"
    />
  );
});

function AdminAssociateDetailMoreBanPage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMoreBanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreBanPage;

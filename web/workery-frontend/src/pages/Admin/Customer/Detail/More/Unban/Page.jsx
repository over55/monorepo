// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unban/Page.jsx
// @uix-page: EntityActionUnbanPage

import React, { useCallback, memo } from "react";
import { UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminCustomerDetailMoreUnbanPageContent = memo(
  function AdminCustomerDetailMoreUnbanPageContent() {
    const customerManager = useCustomerManager();

    const getCustomerDetailWithManager = useCallback(
      async (customerId, onUnauthorized) => {
        return new Promise((resolve, reject) => {
          customerManager.getCustomerDetailWithCallbacks(
            customerId,
            (customerData) => resolve(customerData),
            (error) => reject(error),
            () => {},
            onUnauthorized,
          );
        });
      },
      [customerManager],
    );

    const handleUnbanAction = useCallback(
      async (customerId, onUnauthorized) => {
        await customerManager.unbanCustomer(customerId, onUnauthorized);
      },
      [customerManager],
    );

    return (
      <EntityActionConfirmationPage
        entityIcon={UsersIcon}
        entityType="Customer"
        entityTypePlural="Customers"
        basePath="/admin/customers"
        entityParamName="cid"
        entityManager={customerManager}
        getEntityDetail={getCustomerDetailWithManager}
        actionIcon={CheckCircleIcon}
        actionName="Unban"
        actionDescription="Restore Customer Access"
        actionWarningPoints={[
          "The customer's ban status will be removed",
          "They will regain access to their account",
          "They will be able to place and manage work orders again",
          "The customer can be banned again if necessary",
        ]}
        actionButtonText="Confirm and Unban"
        actionButtonVariant="success"
        onActionExecute={handleUnbanAction}
        successMessage="Customer has been successfully unbanned"
        redirectPath="/admin/customers"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to unban this customer. Are you sure you want to do this?"
        inlineConfirmButtonText="Unban"
      />
    );
  },
);

function AdminCustomerDetailMoreUnbanPage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreUnbanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreUnbanPage;

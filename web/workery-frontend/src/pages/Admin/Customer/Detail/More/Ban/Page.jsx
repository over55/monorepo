// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Ban/Page.jsx
// @uix-page: EntityActionBanPage

import React, { useCallback, memo } from "react";
import { UsersIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminCustomerDetailMoreBanPageContent = memo(
  function AdminCustomerDetailMoreBanPageContent() {
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

    const handleBanAction = useCallback(
      async (customerId, onUnauthorized) => {
        await customerManager.banCustomer(customerId, onUnauthorized);
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
        actionIcon={NoSymbolIcon}
        actionName="Ban"
        actionDescription="Ban Customer - Permanently Block Access"
        actionWarningPoints={[
          "The customer will be permanently banned from the system",
          "They will lose all access to their account",
          "They will not be able to place or manage any work orders",
          "This action can only be reversed by an administrator",
        ]}
        actionButtonText="Confirm and Ban"
        actionButtonVariant="danger"
        onActionExecute={handleBanAction}
        successMessage="Customer has been successfully banned"
        redirectPath="/admin/customers"
      />
    );
  },
);

function AdminCustomerDetailMoreBanPage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreBanPageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreBanPage;

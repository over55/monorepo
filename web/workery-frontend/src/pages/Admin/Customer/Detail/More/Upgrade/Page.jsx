// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Upgrade/Page.jsx
// @uix-page: EntityActionUpgradePage

import React, { useCallback, memo } from "react";
import { UsersIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminCustomerDetailMoreUpgradePageContent = memo(
  function AdminCustomerDetailMoreUpgradePageContent() {
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

    const handleUpgradeAction = useCallback(
      async (customerId, onUnauthorized) => {
        await customerManager.upgradeCustomer(customerId, onUnauthorized);
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
        actionIcon={ArrowUpCircleIcon}
        actionName="Upgrade"
        actionDescription="Upgrade Customer to Commercial Type"
        actionWarningPoints={[
          "The customer will be upgraded to commercial type",
          "They will gain access to commercial services",
          "Different rate structure may apply",
          "This change affects their billing and service options",
        ]}
        actionButtonText="Confirm and Upgrade"
        actionButtonVariant="primary"
        onActionExecute={handleUpgradeAction}
        successMessage="Customer has been successfully upgraded to commercial type"
        redirectPath="/admin/customers"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to upgrade this customer to commercial type. Are you sure you want to do this?"
        inlineConfirmButtonText="Upgrade"
      />
    );
  },
);

function AdminCustomerDetailMoreUpgradePage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreUpgradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreUpgradePage;

// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Downgrade/Page.jsx
// @uix-page: EntityActionDowngradePage

import React, { useCallback, memo } from "react";
import { UsersIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { UIXThemeProvider } from "../../../../../../components/UIX";
import { EntityActionConfirmationPage } from "../../../../../../components/business/views";

const AdminCustomerDetailMoreDowngradePageContent = memo(
  function AdminCustomerDetailMoreDowngradePageContent() {
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

    const handleDowngradeAction = useCallback(
      async (customerId, onUnauthorized) => {
        await customerManager.downgradeCustomer(customerId, onUnauthorized);
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
        actionIcon={ArrowDownCircleIcon}
        actionName="Downgrade"
        actionDescription="Downgrade Customer to Residential Type"
        actionWarningPoints={[
          "The customer will be downgraded to residential type",
          "They will lose access to commercial services",
          "Different rate structure may apply",
          "This change affects their billing and service options",
        ]}
        actionButtonText="Confirm and Downgrade"
        actionButtonVariant="warning"
        onActionExecute={handleDowngradeAction}
        successMessage="Customer has been successfully downgraded to residential type"
        redirectPath="/admin/customers"
        useInlineConfirmation={true}
        inlineConfirmationText="You are going to downgrade this customer to residential type. Are you sure you want to do this?"
        inlineConfirmButtonText="Downgrade"
      />
    );
  },
);

function AdminCustomerDetailMoreDowngradePage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreDowngradePageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreDowngradePage;

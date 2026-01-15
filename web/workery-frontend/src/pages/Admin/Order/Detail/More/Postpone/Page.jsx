// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Postpone/Page.jsx
// UIX Upgraded - Uses OrderPostponeActionPage whole page component
// @uix-page: AdminOrderDetailMorePostponePage

import React, { useMemo } from "react";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";
import { OrderPostponeActionPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

function AdminOrderDetailMorePostponePage() {
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Configuration for OrderPostponeActionPage
  const config = useMemo(
    () => ({
      // Data fetching and action functions
      fetchOrder: async (entityId, onUnauthorized) => {
        return await orderManager.getOrderDetail(entityId, onUnauthorized);
      },
      postponeOrder: async (orderId, postponeData, onUnauthorized) => {
        return await orderManager.postponeOrder(
          orderId,
          postponeData,
          onUnauthorized
        );
      },
      isAuthenticated: () => authManager.isAuthenticated(),

      // Route configuration
      entityParamName: "oid",
      successRedirectPath: "/admin/order/{entityId}/more",

      // Reason options configuration
      reasonOptions: ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION,
      otherReasonValue: 1, // Value that triggers the "other" textarea
    }),
    [orderManager, authManager]
  );

  return <OrderPostponeActionPage config={config} />;
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMorePostponePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMorePostponePage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMorePostponePageWithProvider;

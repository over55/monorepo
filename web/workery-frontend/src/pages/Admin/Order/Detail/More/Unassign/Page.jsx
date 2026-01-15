// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Unassign/Page.jsx
// UIX Upgraded - Uses OrderUnassignActionPage whole page component
// @uix-page: AdminOrderDetailMoreUnassignPage

import React, { useMemo } from "react";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../constants/FieldOptions";
import { OrderUnassignActionPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

function AdminOrderDetailMoreUnassignPage() {
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Configuration for OrderUnassignActionPage
  const config = useMemo(
    () => ({
      // Data fetching and action functions
      fetchOrder: async (entityId, onUnauthorized) => {
        return await orderManager.getOrderDetail(entityId, onUnauthorized);
      },
      unassignAssociate: async (orderId, reason, reasonOther, onUnauthorized) => {
        return await orderManager.unassignAssociateFromOrder(
          orderId,
          reason,
          reasonOther,
          onUnauthorized
        );
      },
      isAuthenticated: () => authManager.isAuthenticated(),

      // Route configuration
      entityParamName: "oid",
      successRedirectPath: "/admin/order/{entityId}/more",

      // Reason options configuration
      reasonOptions: ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS,
      otherReasonValue: 1, // Value that triggers the "other" textarea
    }),
    [orderManager, authManager]
  );

  return <OrderUnassignActionPage config={config} />;
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreUnassignPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreUnassignPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreUnassignPageWithProvider;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Close/Page.jsx
// UIX Upgraded - Uses OrderCloseActionPage whole page component
// @uix-page: AdminOrderDetailMoreClosePage

import React, { useMemo, memo } from "react";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";
import { OrderCloseActionPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

const AdminOrderDetailMoreClosePage = memo(function AdminOrderDetailMoreClosePage() {
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Configuration for OrderCloseActionPage
  const config = useMemo(
    () => ({
      // Data fetching and action functions
      fetchOrder: async (entityId, onUnauthorized) => {
        return await orderManager.getOrderDetail(entityId, onUnauthorized);
      },
      closeOrder: async (orderId, closureData, onUnauthorized) => {
        return await orderManager.closeOrder(
          orderId,
          closureData,
          onUnauthorized
        );
      },
      isAuthenticated: () => authManager.isAuthenticated(),

      // Route configuration
      entityParamName: "oid",
      successRedirectPath: "/admin/tasks",

      // Reason options configuration
      reasonOptions: TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION,
      otherReasonValue: 1, // Value that triggers the "other" input
    }),
    [orderManager, authManager]
  );

  return <OrderCloseActionPage config={config} />;
});

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreClosePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreClosePage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreClosePageWithProvider;

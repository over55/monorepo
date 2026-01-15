// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Delete/Page.jsx
// UIX Upgraded - Uses OrderDeleteActionPage whole page component
// @uix-page: AdminOrderDetailMoreDeletePage

import React, { useMemo } from "react";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { OrderDeleteActionPage } from "../../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../../components/UIX";

function AdminOrderDetailMoreDeletePage() {
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Configuration for OrderDeleteActionPage
  const config = useMemo(
    () => ({
      // Data fetching and action functions
      fetchOrder: async (entityId, onUnauthorized) => {
        return await orderManager.getOrderDetail(entityId, onUnauthorized);
      },
      deleteOrder: async (entityId, onUnauthorized) => {
        return await orderManager.deleteOrder(entityId, onUnauthorized);
      },
      isAuthenticated: () => authManager.isAuthenticated(),

      // Route configuration
      entityParamName: "oid",
      basePath: "/admin/orders",
      successRedirectPath: "/admin/orders",

      // Alternative actions are handled by the component with defaults
    }),
    [orderManager, authManager]
  );

  return <OrderDeleteActionPage config={config} />;
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreDeletePage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreDeletePageWithProvider;

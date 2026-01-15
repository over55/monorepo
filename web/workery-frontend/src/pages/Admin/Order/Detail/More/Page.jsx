// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Page.jsx
// UIX Upgraded - Uses EntityMorePage whole page component
// @uix-page: AdminOrderDetailMorePage

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  WrenchScrewdriverIcon,
  EllipsisHorizontalIcon,
  UserMinusIcon,
  XCircleIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useAccountManager,
} from "../../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
import { EntityMorePage } from "../../../../../components/business/views";
import { UIXThemeProvider } from "../../../../../components/UIX";

function AdminOrderDetailMorePage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const accountManager = useAccountManager();

  // State for current user (needed for permission checks)
  const [currentUser, setCurrentUser] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, [accountManager, onUnauthorized]);

  // Get entity detail function
  const getEntityDetail = useCallback(
    async (entityId, onUnauthorizedCallback) => {
      return await orderManager.getOrderDetail(entityId, onUnauthorizedCallback);
    },
    [orderManager]
  );

  // Create tab items for navigation
  const createTabItems = useCallback((entity, entityId) => {
    const orderWjid = entity?.wjid || entityId;
    return [
      { label: "Summary", to: `/admin/order/${orderWjid}` },
      { label: "Detail", to: `/admin/order/${orderWjid}/full` },
      { label: "Activity Sheets", to: `/admin/order/${orderWjid}/activity-sheets` },
      { label: "Tasks", to: `/admin/order/${orderWjid}/tasks` },
      { label: "Comments", to: `/admin/order/${orderWjid}/comments` },
      { label: "Attachments", to: `/admin/order/${orderWjid}/attachments` },
      { label: "More", to: `/admin/order/${orderWjid}/more`, icon: EllipsisHorizontalIcon, isActive: true },
    ];
  }, []);

  // Create action cards based on order state
  const createActionCards = useCallback((entity, entityId, constants) => {
    const cards = [];
    const { currentUser: user } = constants;

    // Check if associate is assigned
    const hasAssociateAssigned =
      entity &&
      entity.associatePublicId !== 0 &&
      entity.associateId &&
      entity.associateId !== "" &&
      entity.associateId !== "000000000000000000000000";

    // Check if user can delete (Executive or Management role)
    const canDelete =
      user &&
      (user.role === EXECUTIVE_ROLE_ID ||
        user.role === MANAGEMENT_ROLE_ID ||
        user.roleId === EXECUTIVE_ROLE_ID ||
        user.roleId === MANAGEMENT_ROLE_ID);

    // Unassign - Only show if associate is assigned
    if (hasAssociateAssigned) {
      cards.push({
        title: "Unassign",
        subtitle: "Remove the current associate from this job",
        icon: UserMinusIcon,
        path: `/admin/order/${entityId}/more/unassign`,
        bgColor: "bg-red-600",
        hoverBgColor: "hover:bg-red-700",
      });
    }

    // Close Job
    cards.push({
      title: "Close Job",
      subtitle: "Close this job for the time being",
      icon: XCircleIcon,
      path: `/admin/order/${entityId}/more/close`,
      bgColor: "bg-green-600",
      hoverBgColor: "hover:bg-green-700",
    });

    // Postpone Job
    cards.push({
      title: "Postpone Job",
      subtitle: "Postpone this job for a certain amount of time",
      icon: ClockIcon,
      path: `/admin/order/${entityId}/more/postpone`,
      bgColor: "bg-blue-600",
      hoverBgColor: "hover:bg-blue-700",
    });

    // Transfer Job
    cards.push({
      title: "Transfer Job",
      subtitle: "Transfer this job to client or associate",
      icon: ArrowsRightLeftIcon,
      path: `/admin/order/${entityId}/more/transfer/step-1`,
      bgColor: "bg-indigo-600",
      hoverBgColor: "hover:bg-indigo-700",
    });

    // Delete Job - Only show for Executive or Management roles
    if (canDelete) {
      cards.push({
        title: "Delete Job",
        subtitle: "Permanently delete this job from the system",
        icon: TrashIcon,
        path: `/admin/order/${entityId}/more/delete`,
        bgColor: "bg-gray-700",
        hoverBgColor: "hover:bg-gray-800",
      });
    }

    // Incidents
    cards.push({
      title: "Incidents",
      subtitle: "View or open any incidents with this order",
      icon: FireIcon,
      path: `/admin/order/${entityId}/more/incidents`,
      bgColor: "bg-orange-600",
      hoverBgColor: "hover:bg-orange-700",
      showNew: true,
    });

    return cards;
  }, []);

  // Constants to pass to createActionCards (includes currentUser for permission checks)
  const constants = useMemo(
    () => ({
      ORDER_STATUS_ARCHIVED,
      currentUser,
    }),
    [currentUser]
  );

  // Info message for the page
  const infoMessage =
    "Some actions may have specific requirements or permissions. Ensure you have the necessary authorization before performing critical operations.";

  return (
    <EntityMorePage
      entityIcon={WrenchScrewdriverIcon}
      entityType="Order"
      entityTypePlural="Orders"
      basePath="/admin/orders"
      entityParamName="oid"
      entityManager={orderManager}
      getEntityDetail={getEntityDetail}
      createTabItems={createTabItems}
      createActionCards={createActionCards}
      constants={constants}
      infoMessage={infoMessage}
    />
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMorePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMorePage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMorePageWithProvider;

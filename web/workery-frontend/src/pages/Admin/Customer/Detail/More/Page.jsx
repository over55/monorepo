// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Page.jsx
// @uix-page: EntityMorePage

import React, { useCallback, useMemo, memo, useState, useEffect } from "react";
import {
  UserIcon,
  CameraIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAccountManager,
} from "../../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";
import { UIXThemeProvider } from "../../../../../components/UIX";
import { EntityMorePage } from "../../../../../components/business/views";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_ID = 3;
const CUSTOMER_STATUS_ACTIVE = 1;
const CUSTOMER_STATUS_ARCHIVED = 2;

// Function to create tab items for customer
const createCustomerTabItems = (customer, _customerId) => [
  {
    label: "Summary",
    href: `/admin/customer/${customer.id}`,
    isActive: false,
  },
  {
    label: "Detail",
    href: `/admin/customer/${customer.id}/detail`,
    isActive: false,
  },
  {
    label: "Orders",
    href: `/admin/customer/${customer.id}/orders`,
    isActive: false,
  },
  {
    label: "Comments",
    href: `/admin/customer/${customer.id}/comments`,
    isActive: false,
  },
  {
    label: "Attachments",
    href: `/admin/customer/${customer.id}/attachments`,
    isActive: false,
  },
  {
    label: "More",
    href: `/admin/customer/${customer.id}/more`,
    isActive: true,
    icon: EllipsisHorizontalIcon,
  },
];

// Function to create action cards for customer
const createCustomerActionCards = (customer, customerId, constants) => {
  const actionCards = [];
  const { currentUser } = constants;

  // Get user role for permission checks
  const userRole = currentUser?.role || currentUser?.roleId;
  const isExecutiveOrManagement = userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID;

  if (customer) {
    // Archive/Unarchive
    if (customer.status === CUSTOMER_STATUS_ARCHIVED) {
      actionCards.push({
        key: "unarchive",
        title: "Unarchive",
        subtitle: "Make customer visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/customer/${customerId}/unarchive`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "archive",
        title: "Archive",
        subtitle: "Make customer hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/customer/${customerId}/archive`,
        disabled: false,
      });
    }

    // Avatar - Available for all customers
    actionCards.push({
      key: "avatar",
      title: "Avatar",
      subtitle: "Change the customer's profile picture",
      icon: CameraIcon,
      path: `/admin/customer/${customerId}/avatar`,
      disabled: false,
    });

    // Upgrade/Downgrade - Only for active customers
    if (customer.status === CUSTOMER_STATUS_ACTIVE) {
      if (customer.type === COMMERCIAL_CUSTOMER_TYPE_ID) {
        actionCards.push({
          key: "downgrade",
          title: "Downgrade",
          subtitle: "Change customer to become residential customer",
          icon: ArrowDownCircleIcon,
          path: `/admin/customer/${customerId}/downgrade`,
          disabled: false,
        });
      } else {
        actionCards.push({
          key: "upgrade",
          title: "Upgrade",
          subtitle: "Change customer to become business customer",
          icon: ArrowUpCircleIcon,
          path: `/admin/customer/${customerId}/upgrade`,
          disabled: false,
        });
      }
    }

    // Delete - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      actionCards.push({
        key: "delete",
        title: "Delete",
        subtitle: "Permanently delete this customer and all data",
        icon: TrashIcon,
        path: `/admin/customer/${customerId}/permadelete`,
        disabled: false,
      });
    }

    // Password - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      actionCards.push({
        key: "password",
        title: "Password",
        subtitle: "Change or reset the user's password",
        icon: LockClosedIcon,
        path: `/admin/customer/${customerId}/change-password`,
        disabled: false,
      });
    }

    // 2FA - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      actionCards.push({
        key: "2fa",
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/customer/${customerId}/change-2fa`,
        disabled: false,
      });
    }

    // Ban/Unban
    if (customer.isBanned) {
      actionCards.push({
        key: "unban",
        title: "Unban",
        subtitle: "Remove ban from customer",
        icon: CheckCircleIcon,
        path: `/admin/customer/${customerId}/unban`,
        disabled: false,
      });
    } else {
      actionCards.push({
        key: "ban",
        title: "Ban",
        subtitle: "Mark the customer as banned",
        icon: NoSymbolIcon,
        path: `/admin/customer/${customerId}/ban`,
        disabled: false,
      });
    }
  }

  return actionCards;
};

const AdminCustomerDetailMorePageContent = memo(function AdminCustomerDetailMorePageContent() {
  const customerManager = useCustomerManager();
  const accountManager = useAccountManager();

  // State for current user (needed for permission checks)
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await accountManager.getAccountDetail(() => {});
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, [accountManager]);

  // Simple wrapper for getCustomerDetail that works with EntityMorePage
  const getCustomerDetailWithManager = useCallback(
    async (customerId, onUnauthorized) => {
      if (import.meta.env.DEV) {
        console.log("More page: Fetching customer detail for:", customerId);
      }
      return new Promise((resolve, reject) => {
        customerManager.getCustomerDetailWithCallbacks(
          customerId,
          (customerData) => {
            if (import.meta.env.DEV) {
              console.log(
                "More page: Customer detail fetched successfully for ID:",
                customerData.id,
              );
            }
            resolve(customerData);
          },
          (error) => {
            if (import.meta.env.DEV) {
              console.error("More page: Error fetching customer detail:", error);
            }
            reject(error);
          },
          () => {
            if (import.meta.env.DEV) {
              console.log("More page: Customer detail fetch done");
            }
          },
          onUnauthorized,
        );
      });
    },
    [customerManager],
  );

  // Constants to pass to createActionCards (includes currentUser for permission checks)
  const constants = useMemo(
    () => ({
      CUSTOMER_STATUS_ACTIVE,
      CUSTOMER_STATUS_ARCHIVED,
      COMMERCIAL_CUSTOMER_TYPE_ID,
      currentUser,
    }),
    [currentUser]
  );

  return (
    <EntityMorePage
      entityIcon={UserIcon}
      entityType="Customer"
      entityTypePlural="Customers"
      basePath="/admin/customers"
      entityParamName="cid"
      entityManager={customerManager}
      getEntityDetail={getCustomerDetailWithManager}
      createTabItems={createCustomerTabItems}
      createActionCards={createCustomerActionCards}
      constants={constants}
      infoMessage="Some actions are only available for active customers. Archived customers must be unarchived first before performing other actions."
    />
  );
});

function AdminCustomerDetailMorePage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMorePageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMorePage;

// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Page.jsx
// UIX Upgraded - Uses UIX primitives (ActionCard, Breadcrumb, Alert, Tabs, etc.)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  CameraIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAccountManager,
} from "../../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";
import {
  Breadcrumb,
  Alert,
  Tabs,
  Card,
  Spinner,
  ActionCard,
  UIXThemeProvider,
} from "../../../../../components/UIX";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_ID = 2; // Commercial type
const RESIDENTIAL_CUSTOMER_TYPE_ID = 1; // Residential type
const CUSTOMER_STATUS_ACTIVE = 1;
const CUSTOMER_STATUS_ARCHIVED = 2;

function AdminCustomerDetailMorePage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const accountManager = useAccountManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customer details
  const fetchCustomerDetail = useCallback(async () => {
    try {
      setFetching(true);
      const data = await customerManager.getCustomerDetail(cid, onUnauthorized);
      setCustomer(data);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      setErrors({ general: "Failed to load customer details" });
    } finally {
      setFetching(false);
    }
  }, [cid, customerManager, onUnauthorized]);

  // Fetch current user for role check
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(response);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  }, [accountManager, onUnauthorized]);

  // Fetch on mount
  useEffect(() => {
    fetchCustomerDetail();
    fetchCurrentUser();
    window.scrollTo(0, 0);
  }, [fetchCustomerDetail, fetchCurrentUser]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Customers",
      to: "/admin/customers",
      icon: UserIcon,
    },
    {
      label: "Detail",
      to: `/admin/customer/${cid}`,
      icon: ClipboardDocumentListIcon,
    },
    {
      label: "More",
      icon: EllipsisHorizontalIcon,
      isActive: true,
    },
  ], [cid]);

  // Memoize tabs
  const tabs = useMemo(() => [
    { label: "Summary", to: `/admin/customer/${cid}` },
    { label: "Detail", to: `/admin/customer/${cid}/detail` },
    { label: "Orders", to: `/admin/customer/${cid}/orders` },
    { label: "Comments", to: `/admin/customer/${cid}/comments` },
    { label: "Attachments", to: `/admin/customer/${cid}/attachments` },
    { label: "More", to: `/admin/customer/${cid}/more`, icon: EllipsisHorizontalIcon, isActive: true },
  ], [cid]);

  // Get user role for conditional rendering
  const userRole = currentUser.role || currentUser.roleId;
  const isExecutiveOrManagement = userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID;

  // Memoize action cards
  const actionCards = useMemo(() => {
    if (!customer) return [];

    const cards = [];

    // Archive/Unarchive
    if (customer.status === CUSTOMER_STATUS_ARCHIVED) {
      cards.push({
        title: "Unarchive",
        subtitle: "Make customer visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/customer/${cid}/unarchive`,
      });
    } else {
      cards.push({
        title: "Archive",
        subtitle: "Make customer hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/customer/${cid}/archive`,
      });
    }

    // Avatar - Available for all customers
    cards.push({
      title: "Avatar",
      subtitle: "Change the customer's profile picture",
      icon: CameraIcon,
      path: `/admin/customer/${cid}/avatar`,
    });

    // Upgrade/Downgrade - Only for active customers
    if (customer.status === CUSTOMER_STATUS_ACTIVE) {
      if (customer.type === COMMERCIAL_CUSTOMER_TYPE_ID) {
        cards.push({
          title: "Downgrade",
          subtitle: "Change customer to become residential customer",
          icon: ArrowDownCircleIcon,
          path: `/admin/customer/${cid}/downgrade`,
        });
      } else {
        cards.push({
          title: "Upgrade",
          subtitle: "Change customer to become business customer",
          icon: ArrowUpCircleIcon,
          path: `/admin/customer/${cid}/upgrade`,
        });
      }
    }

    // Delete - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      cards.push({
        title: "Delete",
        subtitle: "Permanently delete this customer and all data",
        icon: TrashIcon,
        path: `/admin/customer/${cid}/permadelete`,
      });
    }

    // Password - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      cards.push({
        title: "Password",
        subtitle: "Change or reset the user's password",
        icon: LockClosedIcon,
        path: `/admin/customer/${cid}/change-password`,
      });
    }

    // 2FA - Only for Executive/Management and active customers
    if (isExecutiveOrManagement && customer.status === CUSTOMER_STATUS_ACTIVE) {
      cards.push({
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/customer/${cid}/change-2fa`,
      });
    }

    // Ban/Unban
    if (customer.isBanned) {
      cards.push({
        title: "Unban",
        subtitle: "Remove ban from customer",
        icon: CheckCircleIcon,
        path: `/admin/customer/${cid}/unban`,
      });
    } else {
      cards.push({
        title: "Ban",
        subtitle: "Mark the customer as banned",
        icon: NoSymbolIcon,
        path: `/admin/customer/${cid}/ban`,
      });
    }

    return cards;
  }, [customer, cid, isExecutiveOrManagement]);

  if (isFetching) {
    return (
      <UIXThemeProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner className="mx-auto" />
              <p className="mt-4 text-gray-600">Loading customer details...</p>
            </div>
          </div>
        </div>
      </UIXThemeProvider>
    );
  }

  return (
    <UIXThemeProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Title */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <UserIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                Customer
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                Additional actions and settings
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {customer && customer.status === CUSTOMER_STATUS_ARCHIVED && (
          <Alert type="info" icon={ArchiveBoxIcon} className="mb-4">
            This customer is archived
          </Alert>
        )}

        {customer && customer.isBanned && (
          <Alert type="warning" icon={NoSymbolIcon} className="mb-4">
            This customer is banned
          </Alert>
        )}

        {/* Error Display */}
        {errors.general && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setErrors({})}
            className="mb-4"
          >
            {errors.general}
          </Alert>
        )}

        {/* Main Content */}
        <Card className="shadow-sm rounded-lg">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <EllipsisHorizontalIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600" />
              More Actions
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 sm:px-6 border-b border-gray-200">
            <Tabs items={tabs} />
          </div>

          {customer && (
            <div className="p-4 sm:p-6">
              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {actionCards.map((card, index) => (
                  <ActionCard
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    path={card.path}
                    disabled={card.disabled}
                  />
                ))}
              </div>

              {/* Information Alert */}
              <Alert type="info" icon={InformationCircleIcon} className="mb-6 sm:mb-8">
                <strong>Note:</strong> Some actions are only available for active customers.
                Archived customers must be unarchived first before performing other actions.
                {isExecutiveOrManagement && (
                  <span>
                    {" "}Executive and Management roles have access to additional administrative actions.
                  </span>
                )}
              </Alert>

              {/* Bottom Navigation */}
              <div className="flex justify-start pt-4 sm:pt-6 border-t border-gray-200">
                <Link to="/admin/customers">
                  <button className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Customers
                  </button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMorePage;

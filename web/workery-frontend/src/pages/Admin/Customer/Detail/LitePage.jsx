// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/LitePage.jsx
// @uix-page: DetailLiteView

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  InformationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CalendarIcon,
  NoSymbolIcon,
  XCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../services/Services";
import { TagsDisplay } from "../../../../components/business/displays";
import {
  UIXThemeProvider,
  DetailLiteView,
  EditButton,
  Avatar,
  Badge,
  ContactLink,
  AddressDisplay,
  useUIXTheme,
} from "../../../../components/UIX";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_STATUS_ARCHIVED,
  CUSTOMER_STATUS_ACTIVE,
  CUSTOMER_TYPE_MAP,
} from "../../../../constants/Customer";

// Extract IDs helper - moved outside component for performance
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.id || item.value).filter(Boolean);
};

const AdminCustomerDetailLitePageContent = memo(function AdminCustomerDetailLitePageContent() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup - prevents state updates on unmounted component
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customer data with proper cleanup
  const fetchCustomer = useCallback(() => {
    if (!cid) {
      if (import.meta.env.DEV) {
        console.log("No cid provided, returning");
      }
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    if (import.meta.env.DEV) {
      console.log("Starting fetch for cid:", cid);
    }
    setLoading(true);
    setError(null);

    customerManager.getCustomerDetailWithCallbacks(
      cid,
      (response) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting customer data:", response);
        }
        setCustomer(response);
        setLoading(false);
      },
      (errorResponse) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.error("Setting error:", errorResponse);
        }
        setError(
          errorResponse?.message ||
            "Failed to load customer details. Please try again.",
        );
        setLoading(false);
      },
      () => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting loading to false");
        }
        setLoading(false);
      },
      onUnauthorized,
    );
  }, [cid, customerManager, onUnauthorized]);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (import.meta.env.DEV) {
      console.log("Effect running for cid:", cid);
    }
    window.scrollTo(0, 0);
    fetchCustomer();

    // Cleanup function - only cancel requests, don't set state
    return () => {
      isMounted.current = false;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Note: Don't set state here - component is unmounting
      // The isMounted check in callbacks prevents state updates
    };
  }, [cid, fetchCustomer]);

  // Create status badge
  const createStatusBadge = useCallback((customerData) => {
    if (!customerData) return null;
    if (customerData.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (customerData.status === CUSTOMER_STATUS_ACTIVE) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        Archived
      </Badge>
    );
  }, []);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
  }), [getThemeClasses]);

  // Configure DetailLiteView props - ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: HomeIcon,
      hideOnMobile: false,
      mobileLabel: "Dash",
    },
    {
      label: "Customers",
      to: "/admin/customers",
      icon: UserIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  const headerConfig = useMemo(() => ({
    title: "Customer - Summary",
    icon: UserIcon,
    loadingText: "Loading customer details...",
    notFoundTitle: "Customer Not Found",
    notFoundMessage:
      "The customer you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Customers",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/customers"),
    },
  }), [navigate]);

  const actionButtons = useMemo(() => [
    {
      variant: "outline",
      onClick: () => navigate("/admin/customers"),
      icon: ChevronLeftIcon,
      label: "Back",
    },
    {
      component: (
        <EditButton
          onClick={() => navigate(`/admin/customer/${cid}/edit`)}
          disabled={customer?.status === CUSTOMER_STATUS_ARCHIVED}
          variant="primary"
          className="flex-1 sm:flex-initial"
        />
      ),
    },
  ], [navigate, cid, customer?.status]);

  const tabs = useMemo(() => [
    {
      label: "Summary",
      isActive: true,
    },
    {
      label: "Detail",
      to: `/admin/customer/${customer?.id}/detail`,
    },
    {
      label: "Orders",
      to: `/admin/customer/${customer?.id}/orders`,
    },
    {
      label: "Comments",
      to: `/admin/customer/${customer?.id}/comments`,
    },
    {
      label: "Attachments",
      to: `/admin/customer/${customer?.id}/attachments`,
    },
    {
      label: "More",
      to: `/admin/customer/${customer?.id}/more`,
      icon: EllipsisHorizontalIcon,
    },
  ], [customer?.id]);

  const fieldSections = useMemo(() => customer
    ? [
        // Avatar section
        {
          type: "avatar",
          component: (
            <Avatar
              src={customer?.avatarObjectUrl}
              alt={
                customer?.avatarObjectUrl
                  ? "Profile Picture"
                  : "No Profile Picture"
              }
              size="lg"
              borderStyle="default"
              showFallbackIcon={true}
            />
          ),
        },
        // Primary column sections
        {
          column: "primary",
          className: "mb-3 sm:mb-4 lg:mb-5",
          component: (
            <div>
              {customer?.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
                customer.organizationName && (
                  <h2
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start mb-2`}
                  >
                    <BuildingOfficeIcon className="w-5 sm:w-6 h-5 sm:h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                    <span className="break-words">
                      {customer.organizationName}
                    </span>
                  </h2>
                )}
              <h3
                className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start`}
              >
                <span className="break-words">
                  {customer?.name || `${customer?.firstName} ${customer?.lastName}`}
                </span>
              </h3>
              <div
                className={`mt-2 text-sm lg:text-base ${themeClasses.textSecondary}`}
              >
                <Badge variant="primary" size="md">
                  {CUSTOMER_TYPE_MAP[customer?.type] || "Unknown"}
                </Badge>
              </div>
            </div>
          ),
        },
        {
          column: "primary",
          className: "mb-3 sm:mb-4 lg:mb-5",
          component: (
            <AddressDisplay
              addressData={customer}
              size="md"
              showIcon={true}
              showMapsLink={true}
            />
          ),
        },
        {
          column: "primary",
          className: "space-y-2 sm:space-y-3",
          component: (
            <div className="space-y-2 sm:space-y-3">
              <ContactLink
                type="email"
                value={customer?.email}
                size="md"
                fallbackText="No email"
              />
              <ContactLink
                type="phone"
                value={customer?.phone}
                size="md"
                fallbackText="No phone"
              />
              {customer?.otherPhone && (
                <ContactLink
                  type="phone"
                  value={customer?.otherPhone}
                  size="md"
                  fallbackText="No phone"
                />
              )}
            </div>
          ),
        },
        // Secondary column sections
        {
          column: "secondary",
          component: (
            <TagsDisplay
              values={extractIds(customer?.tags)}
              label="Tags"
              onUnauthorized={onUnauthorized}
            />
          ),
        },
        {
          column: "secondary",
          component: (
            <div
              className={`space-y-2 text-xs sm:text-sm lg:text-base ${themeClasses.textSecondary}`}
            >
              {customer?.createdAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(customer.createdAt)}
                  </span>
                </div>
              )}
              {customer?.modifiedAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Last Modified:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(customer.modifiedAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center xl:justify-start">
                <CheckCircleIcon
                  className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                />
                <span className="font-medium">Status:</span>
                <span className="ml-2">{createStatusBadge(customer)}</span>
              </div>
            </div>
          ),
        },
      ].filter((section) => section.component)
    : [], [customer, themeClasses, onUnauthorized, createStatusBadge]);

  const alerts = useMemo(() => ({
    archived: {
      message: "This customer is archived",
      icon: ArchiveBoxIcon,
    },
    banned: {
      message: "This customer is banned",
      icon: NoSymbolIcon,
    },
  }), []);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailLiteView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading customer details...",
        }}
      />
    );
  }

  return (
    <DetailLiteView
      entityData={customer}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      fieldSections={fieldSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      onUnauthorized={onUnauthorized}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
});

function AdminCustomerDetailLitePage() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailLitePageContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailLitePage;

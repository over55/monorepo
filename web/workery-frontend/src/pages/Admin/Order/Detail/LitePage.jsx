// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/LitePage.jsx
// @uix-page: DetailLiteView

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  XCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
  TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
} from "../../../../constants/Task";
import { CLIENT_PHONE_TYPE_WORK } from "../../../../constants/Customer";
import { ASSOCIATE_PHONE_TYPE_WORK } from "../../../../constants/Associate";
import {
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_EXECUTIVE,
} from "../../../../constants/Staff";
import {
  ORDER_STATUS_NEW,
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_ONGOING,
  ORDER_STATUS_IN_PROGRESS,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_CLIENT_PHONE_TYPE_MAP,
  ORDER_ASSOCIATE_PHONE_TYPE_MAP,
} from "../../../../constants/Order";
import {
  UIXThemeProvider,
  DetailLiteView,
  EditButton,
  useUIXTheme,
} from "../../../../components/UIX";

// Extract IDs helper - moved outside component for performance
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item;
      }
      return item.id || item.value || item.skillSetId || item.tagId;
    })
    .filter(Boolean);
};

// Order status configuration - moved outside component for performance
const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS_NEW]: {
    text: "New",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  [ORDER_STATUS_DECLINED]: {
    text: "Declined",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  [ORDER_STATUS_PENDING]: {
    text: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  [ORDER_STATUS_CANCELLED]: {
    text: "Cancelled",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  [ORDER_STATUS_ONGOING]: {
    text: "Ongoing",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  [ORDER_STATUS_IN_PROGRESS]: {
    text: "In Progress",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  [ORDER_STATUS_COMPLETED_BUT_UNPAID]: {
    text: "Completed (Unpaid)",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  [ORDER_STATUS_COMPLETED_AND_PAID]: {
    text: "Completed (Paid)",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  [ORDER_STATUS_ARCHIVED]: {
    text: "Archived",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

// Order type map - moved outside component for performance
const ORDER_TYPE_MAP = {
  1: "Residential",
  2: "Commercial",
};

const AdminOrderDetailLitePageContent = memo(function AdminOrderDetailLitePageContent() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Refs for cleanup - prevents state updates on unmounted component
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Helper function to get task update URL based on type
  const getTaskUpdateURL = useCallback((taskId, taskType) => {
    if (!taskType) {
      console.warn("Task type not available for task:", taskId);
      return `/admin/task/${taskId}/assign-associate/step-1`;
    }

    switch (taskType) {
      case TASK_ITEM_TYPE_ASSIGN_ASSOCIATE:
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET:
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB:
      case TASK_ITEM_TYPE_UPDATE_ONGOING_JOB:
        return `/admin/task/${taskId}/order-completion/step-1`;
      case TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB:
      case TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY:
        return `/admin/task/${taskId}/survey/step-1`;
      default:
        console.warn("Unknown task type:", taskType);
        return `/admin/task/${taskId}/assign-associate/step-1`;
    }
  }, []);

  // Fetch order data with proper cleanup
  const fetchOrder = useCallback(() => {
    if (!oid) {
      if (import.meta.env.DEV) {
        console.log("No oid provided, returning");
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
      console.log("Starting fetch for oid:", oid);
    }
    setLoading(true);
    setError(null);

    orderManager.getOrderDetailWithCallbacks(
      oid,
      (response) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting order data:", response);
        }
        setOrder(response);
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
            "Failed to load order details. Please try again.",
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
  }, [oid, orderManager, onUnauthorized]);

  // Fetch current user data
  const fetchCurrentUser = useCallback(() => {
    if (!isMounted.current) return;
    setCurrentUser({ role: STAFF_TYPE_MANAGEMENT });
  }, []);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (import.meta.env.DEV) {
      console.log("Effect running for oid:", oid);
    }
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
    fetchCurrentUser();

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
  }, [oid, authManager, navigate, fetchOrder, fetchCurrentUser]);

  // Format phone number for display
  const formatPhone = useCallback((phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }, []);

  // Format address for display
  const formatAddress = useCallback((orderData) => {
    if (!orderData) return "-";
    const address =
      orderData.customerFullAddressWithoutPostalCode ||
      `${orderData.customerAddressLine1 || ""} ${orderData.customerCity || ""} ${orderData.customerRegion || ""}`.trim();

    return address || "-";
  }, []);

  // Get order status text and style
  const getOrderStatus = useCallback((status) => {
    return (
      ORDER_STATUS_CONFIG[status] || {
        text: "Unknown",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      }
    );
  }, []);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
  }), [getThemeClasses]);

  // Computed values
  const isArchived = useMemo(() => order?.status === ORDER_STATUS_ARCHIVED, [order]);
  const hasAssociateAssigned = useMemo(() => order && order.associatePublicId !== 0, [order]);
  const hasPendingTask = useMemo(() => {
    return order?.latestPendingTaskId && order.latestPendingTaskId !== "000000000000000000000000";
  }, [order]);
  const canViewFinancials = useMemo(() => {
    return (order?.status === ORDER_STATUS_COMPLETED_BUT_UNPAID ||
      order?.status === ORDER_STATUS_COMPLETED_AND_PAID) &&
      (currentUser?.role === STAFF_TYPE_MANAGEMENT ||
        currentUser?.role === STAFF_TYPE_EXECUTIVE);
  }, [order, currentUser]);
  const hasAssociateInfo = useMemo(() => {
    return order?.associateId &&
      order.associateId !== "" &&
      order.associateId !== "000000000000000000000000";
  }, [order]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: HomeIcon,
      hideOnMobile: false,
      mobileLabel: "Dash",
    },
    {
      label: "Orders",
      to: "/admin/orders",
      icon: WrenchScrewdriverIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  // Memoize header config
  const headerConfig = useMemo(() => ({
    title: "Order - Summary",
    icon: ClipboardDocumentListIcon,
    loadingText: "Loading order details...",
    notFoundTitle: "Order Not Found",
    notFoundMessage: "The order you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Orders",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/orders"),
    },
  }), [navigate]);

  // Memoize tabs
  const tabs = useMemo(() => {
    if (!order) return [];
    return [
      { label: "Summary", to: `/admin/order/${order.wjid}`, isActive: true },
      { label: "Detail", to: `/admin/order/${order.wjid}/full` },
      { label: "Activity Sheets", to: `/admin/order/${order.wjid}/activity-sheets` },
      { label: "Tasks", to: `/admin/order/${order.wjid}/tasks` },
      { label: "Comments", to: `/admin/order/${order.wjid}/comments` },
      { label: "Attachments", to: `/admin/order/${order.wjid}/attachments` },
      { label: "More", to: `/admin/order/${order.wjid}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [order]);

  // Memoize action buttons
  const actionButtons = useMemo(() => {
    if (!order) return [];

    const buttons = [
      {
        variant: "outline",
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/orders"),
      },
    ];

    if (hasAssociateAssigned) {
      buttons.push({
        variant: "secondary",
        label: "Unassign",
        icon: UserIcon,
        disabled: isArchived,
        onClick: () => navigate(`/admin/order/${oid}/more/unassign`),
      });
    }

    buttons.push({
      variant: "danger",
      label: "Close",
      icon: XCircleIcon,
      disabled: isArchived,
      onClick: () => navigate(`/admin/order/${oid}/more/close`),
    });

    buttons.push({
      component: (
        <EditButton
          onClick={() => navigate(`/admin/order/${oid}/edit`)}
          disabled={isArchived}
          variant="primary"
          className="flex-1 sm:flex-initial"
        />
      ),
    });

    if (hasPendingTask) {
      buttons.push({
        variant: "primary",
        label: "Go to Task",
        iconRight: ArrowRightIcon,
        disabled: isArchived,
        onClick: () => navigate(getTaskUpdateURL(order.latestPendingTaskId, order.latestPendingTaskType)),
      });
    }

    if (canViewFinancials) {
      buttons.push({
        variant: "primary",
        label: "Financials",
        icon: CurrencyDollarIcon,
        disabled: isArchived,
        onClick: () => navigate(`/admin/financial/${oid}`),
        className: "bg-cyan-600 hover:bg-cyan-700",
      });
    }

    return buttons;
  }, [order, navigate, oid, hasAssociateAssigned, isArchived, hasPendingTask, canViewFinancials, getTaskUpdateURL]);

  // Memoize alerts configuration
  const alerts = useMemo(() => ({
    archived: {
      message: "This order is archived",
      icon: ArchiveBoxIcon,
    },
    cancelled: {
      message: "This order is cancelled",
      icon: NoSymbolIcon,
    },
    declined: {
      message: "This order has been declined",
      icon: XCircleIcon,
    },
  }), []);

  // Memoize field sections
  const fieldSections = useMemo(() => {
    if (!order) return [];

    const statusInfo = getOrderStatus(order.status);

    return [
      // Primary column - Job Info
      {
        column: "primary",
        component: (
          <div>
            {/* Job ID and Status Header */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 lg:mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h3 className={`text-base sm:text-lg font-semibold ${themeClasses.textPrimary}`}>
                  Job #{order.wjid}
                </h3>
                <div
                  className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}
                >
                  {statusInfo.text}
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <h4 className={`text-sm sm:text-base font-semibold ${themeClasses.textPrimary} mb-3 sm:mb-4`}>
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start">
                  <UserIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 ${themeClasses.textMuted} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                      Name
                    </p>
                    <Link
                      to={`/admin/customer/${order.customerId}`}
                      className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      {order.customerName}
                      <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 ${themeClasses.textMuted} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                      Phone ({ORDER_CLIENT_PHONE_TYPE_MAP[order.customerPhoneType]})
                    </p>
                    {order.customerPhone ? (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {formatPhone(
                          order.customerPhone,
                          order.customerPhoneType === CLIENT_PHONE_TYPE_WORK
                            ? order.customerPhoneExtension
                            : null,
                        )}
                      </a>
                    ) : (
                      <span className={`text-sm sm:text-base ${themeClasses.textMuted}`}>
                        No phone
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start md:col-span-2">
                  <MapPinIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 ${themeClasses.textMuted} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                      Address
                    </p>
                    <span className={`text-sm sm:text-base ${themeClasses.textPrimary}`}>
                      {formatAddress(order)}
                    </span>
                    {order.customerFullAddressUrl && (
                      <a
                        href={order.customerFullAddressUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Associate Information (if assigned) */}
            {hasAssociateInfo && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
                <h4 className={`text-sm sm:text-base font-semibold ${themeClasses.textPrimary} mb-3 sm:mb-4`}>
                  Associate Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start">
                    <UserIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 ${themeClasses.textMuted} mt-0.5 flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                        Name
                      </p>
                      <Link
                        to={`/admin/associate/${order.associateId}`}
                        className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                      >
                        {order.associateName}
                        <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 ${themeClasses.textMuted} mt-0.5 flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                        Phone ({ORDER_ASSOCIATE_PHONE_TYPE_MAP[order.associatePhoneType]})
                      </p>
                      {order.associatePhone ? (
                        <a
                          href={`tel:${order.associatePhone}`}
                          className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {formatPhone(
                            order.associatePhone,
                            order.associatePhoneType === ASSOCIATE_PHONE_TYPE_WORK
                              ? order.associatePhoneExtension
                              : null,
                          )}
                        </a>
                      ) : (
                        <span className={`text-sm sm:text-base ${themeClasses.textMuted}`}>
                          No phone
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <h4 className={`text-sm sm:text-base font-semibold ${themeClasses.textPrimary} mb-3 sm:mb-4`}>
                Job Details
              </h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                      Job Type
                    </p>
                    <div className="flex items-center mt-1">
                      {order.type === 1 ? (
                        <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                      ) : (
                        <BuildingOfficeIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                      )}
                      <span className={`text-sm sm:text-base ${themeClasses.textPrimary} font-medium`}>
                        {ORDER_TYPE_MAP[order.type] || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted}`}>
                      Description
                    </p>
                    <div className={`mt-1 text-sm sm:text-base ${themeClasses.textPrimary} whitespace-pre-wrap`}>
                      {order.description || "No description provided"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted} mb-2`}>
                      Skills Required
                    </p>
                    <SkillSetsDisplay
                      values={extractIds(order.skillSets)}
                      onUnauthorized={onUnauthorized}
                    />
                  </div>
                </div>
                {hasPendingTask && (
                  <div className="flex items-start">
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${themeClasses.textMuted} mb-2`}>
                        Required Task
                      </p>
                      <Link
                        to={getTaskUpdateURL(
                          order.latestPendingTaskId,
                          order.latestPendingTaskType,
                        )}
                      >
                        <button className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-blue-300 rounded-md text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                          {order.latestPendingTaskTitle}
                          <ArrowRightIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-1 sm:ml-2" />
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
      },
      // Secondary column - Tags
      {
        column: "secondary",
        component: (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Tags */}
            <div>
              <TagsDisplay
                values={extractIds(order.tags)}
                label="Tags"
                onUnauthorized={onUnauthorized}
              />
            </div>
          </div>
        ),
      },
    ];
  }, [order, formatAddress, formatPhone, getOrderStatus, themeClasses, onUnauthorized, hasAssociateInfo, hasPendingTask, getTaskUpdateURL]);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailLiteView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading order details...",
        }}
      />
    );
  }

  return (
    <DetailLiteView
      entityData={order}
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

function AdminOrderDetailLitePage() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailLitePageContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailLitePage;

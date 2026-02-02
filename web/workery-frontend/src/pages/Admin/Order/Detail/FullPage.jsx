// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/FullPage.jsx
// @uix-page: DetailFullView

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  NoSymbolIcon,
  HomeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useOrderManager, useAuthManager } from "../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import {
  DetailSection,
  DetailField,
} from "../../../../components/business/views";
import {
  TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
  TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
  TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
  TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
} from "../../../../constants/Task";
import {
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_CLIENT_PHONE_TYPE_MAP,
  ORDER_ASSOCIATE_PHONE_TYPE_MAP,
} from "../../../../constants/Order";
import { CLIENT_PHONE_TYPE_WORK } from "../../../../constants/Customer";
import { ASSOCIATE_PHONE_TYPE_WORK } from "../../../../constants/Associate";
import {
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_EXECUTIVE,
} from "../../../../constants/Staff";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import { formatPhoneNumber } from "../../../../utils/phoneFormat";
import {
  UIXThemeProvider,
  DetailFullView,
  EditButton,
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

const AdminOrderDetailFullPageContent = memo(function AdminOrderDetailFullPageContent() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

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

  // Helper functions for formatting
  const formatAddress = useCallback((orderData) => {
    if (!orderData) return "-";
    const address =
      orderData.customerFullAddressWithoutPostalCode ||
      `${orderData.customerAddressLine1 || ""} ${orderData.customerCity || ""} ${orderData.customerRegion || ""}`.trim();

    return address || "-";
  }, []);

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
    title: "Order - Full Details",
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
    const orderWjid = order.wjid || oid;
    return [
      { label: "Summary", to: `/admin/order/${orderWjid}` },
      { label: "Detail", to: `/admin/order/${orderWjid}/full`, isActive: true },
      { label: "Activity Sheets", to: `/admin/order/${orderWjid}/activity-sheets` },
      { label: "Tasks", to: `/admin/order/${orderWjid}/tasks` },
      { label: "Comments", to: `/admin/order/${orderWjid}/comments` },
      { label: "Attachments", to: `/admin/order/${orderWjid}/attachments` },
      { label: "More", to: `/admin/order/${orderWjid}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [order, oid]);

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
        label: "Go to Financials",
        icon: CurrencyDollarIcon,
        iconRight: ArrowRightIcon,
        disabled: isArchived,
        onClick: () => navigate(`/admin/financial/${oid}`),
        className: "bg-indigo-600 hover:bg-indigo-700",
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

  // Memoize content sections
  const contentSections = useMemo(() => {
    if (!order) return [];

    return [
      // Job Detail Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Job Detail" icon={ClipboardDocumentCheckIcon}>
            <DetailField label="Job #" value={order.wjid} />
            <DetailField
              label="Client"
              value={
                order.customerName ? (
                  <Link
                    to={`/admin/customer/${order.customerId}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {order.customerName}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label={`Client Phone Number (${ORDER_CLIENT_PHONE_TYPE_MAP[order.customerPhoneType] || "Unknown"})`}
              value={
                order.customerPhone ? (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhoneNumber(
                      order.customerPhone,
                      order.customerPhoneType === CLIENT_PHONE_TYPE_WORK
                        ? order.customerPhoneExtension
                        : null,
                    )}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Client Address"
              value={
                order.customerFullAddressUrl ? (
                  <a
                    href={order.customerFullAddressUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-words"
                  >
                    {formatAddress(order)}
                  </a>
                ) : (
                  formatAddress(order)
                )
              }
            />
            <DetailField
              label="Description"
              value={order.description}
              fullWidth
            />
            <div>
              <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Skill Sets
              </dt>
              <dd>
                <SkillSetsDisplay
                  values={extractIds(order.skillSets)}
                  onUnauthorized={onUnauthorized}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Tag(s)
              </dt>
              <dd>
                <TagsDisplay
                  values={extractIds(order.tags)}
                  onUnauthorized={onUnauthorized}
                />
              </dd>
            </div>
            <DetailField
              label="Is Home Support Service"
              value={
                order.isHomeSupportService ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
            <DetailField
              label="Is ongoing?"
              value={
                order.isOngoing ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
            <DetailField
              label="Status"
              value={
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status === 1 ? "Active" : "Archived"}
                </span>
              }
            />
            <DetailField
              label="Start date"
              value={formatDateForDisplay(order.startDate)}
            />
            <DetailField
              label="Completion date"
              value={formatDateForDisplay(order.completionDate)}
            />
            <DetailField label="Hours" value={order.hours} />
            <DetailField label="Visits" value={order.visits} />
            <DetailField
              label="Required Task"
              value={
                hasPendingTask ? (
                  <div>
                    {order.latestPendingTaskDescription && (
                      <div className="mb-2 text-gray-700">
                        {order.latestPendingTaskDescription}
                      </div>
                    )}
                    <div>
                      Click the following to begin:{" "}
                      <Link
                        to={getTaskUpdateURL(
                          order.latestPendingTaskId,
                          order.latestPendingTaskType,
                        )}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {order.latestPendingTaskTitle}
                      </Link>
                    </div>
                  </div>
                ) : (
                  "-"
                )
              }
              fullWidth
            />
          </DetailSection>
        ),
      },
      // Associate Information (conditional)
      {
        type: "conditional",
        condition: hasAssociateInfo,
        component: (
          <DetailSection title="Associate Information" icon={UserGroupIcon}>
            <DetailField
              label="Assigned Associate"
              value={
                order.associateName ? (
                  <Link
                    to={`/admin/associate/${order.associateId}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {order.associateName}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label={`Associate Phone Number (${ORDER_ASSOCIATE_PHONE_TYPE_MAP[order.associatePhoneType] || "Unknown"})`}
              value={
                order.associatePhone ? (
                  <a
                    href={`tel:${order.associatePhone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhoneNumber(
                      order.associatePhone,
                      order.associatePhoneType === ASSOCIATE_PHONE_TYPE_WORK
                        ? order.associatePhoneExtension
                        : null,
                    )}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Assignment Date"
              value={formatDateForDisplay(order.assignmentDate)}
            />
          </DetailSection>
        ),
      },
      // System Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="System" icon={ComputerDesktopIcon}>
            <DetailField
              label="Created at"
              value={formatDateForDisplay(order.createdAt)}
            />
            <DetailField
              label="Created by"
              value={
                order.createdByUserName ? (
                  <Link
                    to={`/admin/staff/${order.createdByUserId}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {order.createdByUserName}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Created from"
              value={
                order.createdFromIpAddress ? (
                  <a
                    href={`https://whatismyipaddress.com/ip/${order.createdFromIpAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-mono text-sm break-all"
                  >
                    {order.createdFromIpAddress}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Modified at"
              value={formatDateForDisplay(order.modifiedAt)}
            />
            <DetailField
              label="Modified by"
              value={
                order.modifiedByUserName ? (
                  <Link
                    to={`/admin/staff/${order.modifiedByUserId}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {order.modifiedByUserName}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Modified from"
              value={
                order.modifiedFromIpAddress ? (
                  <a
                    href={`https://whatismyipaddress.com/ip/${order.modifiedFromIpAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-mono text-sm break-all"
                  >
                    {order.modifiedFromIpAddress}
                  </a>
                ) : (
                  "-"
                )
              }
            />
          </DetailSection>
        ),
      },
    ];
  }, [order, formatAddress, formatPhone, onUnauthorized, hasAssociateInfo, hasPendingTask, getTaskUpdateURL]);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailFullView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading order details...",
        }}
      />
    );
  }

  return (
    <DetailFullView
      entityData={order}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      contentSections={contentSections}
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

function AdminOrderDetailFullPage() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailFullPageContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailFullPage;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/FullPage.jsx
// UIX Upgraded - Uses DetailFullView whole page component
// @uix-page: AdminOrderDetailFullPage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  PencilSquareIcon,
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
import {
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DECLINED,
} from "../../../../constants/Order";
import { CLIENT_PHONE_TYPE_WORK } from "../../../../constants/Customer";
import { ASSOCIATE_PHONE_TYPE_WORK } from "../../../../constants/Associate";
import {
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_EXECUTIVE,
} from "../../../../constants/Staff";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import { DetailFullView } from "../../../../components/UIX";

// Phone type mappings
const CLIENT_PHONE_TYPE_OF_MAP = {
  1: "Work",
  2: "Home",
  3: "Mobile",
};

const ASSOCIATE_PHONE_TYPE_OF_MAP = {
  1: "Work",
  2: "Home",
  3: "Mobile",
};

// Detail Section Component
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {children}
      </dl>
    </div>
  </div>
);

// Detail Field Component
const DetailField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "lg:col-span-2" : ""}>
    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
      {label}
    </dt>
    <dd className="text-base sm:text-lg font-medium text-gray-900 break-words">
      {value || "-"}
    </dd>
  </div>
);

function AdminOrderDetailFullPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  // Extract IDs from array of objects
  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "number" || typeof item === "string") {
          return item;
        }
        return item.id || item.value || item.skillSetId || item.tagId;
      })
      .filter(Boolean);
  }, []);

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    if (!oid) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [oid, orderManager, onUnauthorized]);

  // Fetch current user data
  const fetchCurrentUser = useCallback(async () => {
    try {
      setCurrentUser({ role: STAFF_TYPE_MANAGEMENT });
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
    fetchCurrentUser();
  }, [oid, authManager, navigate, fetchOrder, fetchCurrentUser]);

  // Helper functions for formatting
  const formatPhone = useCallback((phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }, []);

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
      icon: ChartBarIcon,
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
    title: "Full Details",
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
      variant: "warning",
      label: "Edit",
      icon: PencilSquareIcon,
      disabled: isArchived,
      onClick: () => navigate(`/admin/order/${oid}/edit`),
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
              label={`Client Phone Number (${CLIENT_PHONE_TYPE_OF_MAP[order.customerPhoneType] || "Unknown"})`}
              value={
                order.customerPhone ? (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhone(
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
              label={`Associate Phone Number (${ASSOCIATE_PHONE_TYPE_OF_MAP[order.associatePhoneType] || "Unknown"})`}
              value={
                order.associatePhone ? (
                  <a
                    href={`tel:${order.associatePhone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {formatPhone(
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
  }, [order, formatAddress, formatPhone, extractIds, onUnauthorized, hasAssociateInfo, hasPendingTask, getTaskUpdateURL]);

  return (
    <DetailFullView
      entityData={order}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      contentSections={contentSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
}

export default AdminOrderDetailFullPage;

// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/FullPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  HeartIcon,
  UserCircleIcon,
  ClockIcon,
  MapIcon,
  HashtagIcon,
  Bars3Icon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowRightIcon,
  DocumentMagnifyingGlassIcon,
  FolderIcon,
  CalendarDaysIcon,
  RectangleStackIcon,
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
} from "../../../../constants/Order";
import { CLIENT_PHONE_TYPE_WORK } from "../../../../constants/Customer";
import { ASSOCIATE_PHONE_TYPE_WORK } from "../../../../constants/Associate";
import {
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_EXECUTIVE,
} from "../../../../constants/Staff";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Helper function to get task update URL based on type
  const getTaskUpdateURL = (taskId, taskType) => {
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
  };

  // Extract IDs from array of objects
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

  // Fetch order data
  const fetchOrder = async () => {
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
  };

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      setCurrentUser({ role: STAFF_TYPE_MANAGEMENT });
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
    fetchCurrentUser();
  }, [oid]);

  // Helper functions for formatting
  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  const formatAddress = (order) => {
    if (!order) return "-";
    const address =
      order.customerFullAddressWithoutPostalCode ||
      `${order.customerAddressLine1 || ""} ${order.customerCity || ""} ${order.customerRegion || ""}`.trim();

    return address || "-";
  };

  // Section Component - Enhanced with dark header styling
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

  // Detail Field Component - Enhanced for responsiveness
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Responsive Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to="/admin/orders"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Order
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View complete order information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This order is archived
        </div>
      )}

      {/* Error Display - Responsive */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="break-words">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {order && (
          <>
            {/* Header with Actions - Enhanced Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                  Full Details
                </h2>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <Link to="/admin/orders" className="flex-1 sm:flex-initial">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                      <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Back
                    </button>
                  </Link>
                  {order.associatePublicId !== 0 && (
                    <Link
                      to={`/admin/order/${oid}/more/unassign`}
                      className="flex-1 sm:flex-initial"
                    >
                      <button
                        disabled={order.status === ORDER_STATUS_ARCHIVED}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          order.status === ORDER_STATUS_ARCHIVED
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-white bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Unassign
                      </button>
                    </Link>
                  )}
                  <Link
                    to={`/admin/order/${oid}/more/close`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={order.status === ORDER_STATUS_ARCHIVED}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        order.status === ORDER_STATUS_ARCHIVED
                          ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "text-white bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <XCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Close
                    </button>
                  </Link>
                  <Link
                    to={`/admin/order/${oid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={order.status === ORDER_STATUS_ARCHIVED}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        order.status === ORDER_STATUS_ARCHIVED
                          ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "text-white bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
                    </button>
                  </Link>
                  {order.latestPendingTaskId &&
                    order.latestPendingTaskId !==
                      "000000000000000000000000" && (
                      <Link
                        to={getTaskUpdateURL(
                          order.latestPendingTaskId,
                          order.latestPendingTaskType,
                        )}
                        className="flex-1 sm:flex-initial"
                      >
                        <button
                          disabled={order.status === ORDER_STATUS_ARCHIVED}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                            order.status === ORDER_STATUS_ARCHIVED
                              ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                              : "text-white bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Go to Task
                          <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
                        </button>
                      </Link>
                    )}
                  {(order.status === ORDER_STATUS_COMPLETED_BUT_UNPAID ||
                    order.status === ORDER_STATUS_COMPLETED_AND_PAID) &&
                    (currentUser?.role === STAFF_TYPE_MANAGEMENT ||
                      currentUser?.role === STAFF_TYPE_EXECUTIVE) && (
                      <Link
                        to={`/admin/financial/${oid}`}
                        className="flex-1 sm:flex-initial"
                      >
                        <button
                          disabled={order.status === ORDER_STATUS_ARCHIVED}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                            order.status === ORDER_STATUS_ARCHIVED
                              ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                              : "text-white bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          Go to Financials
                          <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
                        </button>
                      </Link>
                    )}
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive with horizontal scroll on mobile */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-6">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  <Link
                    to={`/admin/order/${order.wjid}`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Summary
                  </Link>
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Detail
                  </div>
                  <Link
                    to={`/admin/order/${order.wjid}/activity-sheets`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Activity Sheets
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/tasks`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Tasks
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/comments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/attachments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/more`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
                  >
                    More
                    <EllipsisHorizontalIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                  </Link>
                </nav>
              </div>
            </div>

            {/* Detail Sections - Enhanced with dark headers */}
            <div className="p-4 sm:p-6">
              {/* Job Detail */}
              <DetailSection
                title="Job Detail"
                icon={ClipboardDocumentCheckIcon}
              >
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
                        <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
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
                        <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        No
                      </span>
                    )
                  }
                />
                <DetailField
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                    order.latestPendingTaskId &&
                    order.latestPendingTaskId !== "000000000000000000000000" ? (
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

              {/* Associate Information (if assigned) */}
              {order.associateId &&
                order.associateId !== "" &&
                order.associateId !== "000000000000000000000000" && (
                  <DetailSection
                    title="Associate Information"
                    icon={UserGroupIcon}
                  >
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
                              order.associatePhoneType ===
                                ASSOCIATE_PHONE_TYPE_WORK
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
                )}

              {/* System */}
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
                        className="text-blue-600 hover:text-blue-700 font-mono text-xs sm:text-sm break-all"
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
                        className="text-blue-600 hover:text-blue-700 font-mono text-xs sm:text-sm break-all"
                      >
                        {order.modifiedFromIpAddress}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
              </DetailSection>

              {/* Action Buttons - Enhanced Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                <Link to="/admin/orders" className="order-2 sm:order-1">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Orders
                  </button>
                </Link>

                <div className="flex gap-2 sm:gap-3 order-1 sm:order-2 flex-wrap">
                  {order.associatePublicId !== 0 && (
                    <Link
                      to={`/admin/order/${oid}/more/unassign`}
                      className="flex-1 sm:flex-initial"
                    >
                      <button
                        disabled={order.status === ORDER_STATUS_ARCHIVED}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          order.status === ORDER_STATUS_ARCHIVED
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-white bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Unassign
                      </button>
                    </Link>
                  )}
                  <Link
                    to={`/admin/order/${oid}/more/close`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={order.status === ORDER_STATUS_ARCHIVED}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        order.status === ORDER_STATUS_ARCHIVED
                          ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "text-white bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <XCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Close
                    </button>
                  </Link>
                  <Link
                    to={`/admin/order/${oid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={order.status === ORDER_STATUS_ARCHIVED}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        order.status === ORDER_STATUS_ARCHIVED
                          ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "text-white bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {!order && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <WrenchScrewdriverIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/orders">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Back to Orders
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetailFullPage;

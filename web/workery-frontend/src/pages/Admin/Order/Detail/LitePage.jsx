// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
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

// Constants
const OrderStatusNew = 1;
const OrderStatusDeclined = 2;
const OrderStatusPending = 3;
const OrderStatusCancelled = 4;
const OrderStatusOngoing = 5;
const OrderStatusInProgress = 6;
const OrderStatusCompletedButUnpaid = 7;
const OrderStatusCompletedAndPaid = 8;
const OrderStatusArchived = 9;

function AdminOrderDetailLitePage() {
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

  // Format phone number for display
  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  // Format address for display
  const formatAddress = (order) => {
    if (!order) return "-";
    const address =
      order.customerFullAddressWithoutPostalCode ||
      `${order.customerAddressLine1 || ""} ${order.customerCity || ""} ${order.customerRegion || ""}`.trim();

    return address || "-";
  };

  // Get order status text and style
  const getOrderStatus = (status) => {
    const statusConfig = {
      [OrderStatusNew]: {
        text: "New",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      [OrderStatusDeclined]: {
        text: "Declined",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      [OrderStatusPending]: {
        text: "Pending",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      },
      [OrderStatusCancelled]: {
        text: "Cancelled",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      },
      [OrderStatusOngoing]: {
        text: "Ongoing",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      [OrderStatusInProgress]: {
        text: "In Progress",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      [OrderStatusCompletedButUnpaid]: {
        text: "Completed (Unpaid)",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
      },
      [OrderStatusCompletedAndPaid]: {
        text: "Completed (Paid)",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      [OrderStatusArchived]: {
        text: "Archived",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      },
    };
    return (
      statusConfig[status] || {
        text: "Unknown",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      }
    );
  };

  // Get order type text
  const getOrderTypeText = (type) => {
    const typeMap = {
      1: "Residential",
      2: "Commercial",
    };
    return typeMap[type] || "Unknown";
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View order information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === OrderStatusArchived && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {order && (
          <>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
                  Summary
                </h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <Link to="/admin/orders" className="flex-1 sm:flex-none">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Back
                    </button>
                  </Link>
                  {order.associatePublicId !== 0 && (
                    <Link
                      to={`/admin/order/${oid}/more/unassign`}
                      className="flex-1 sm:flex-none"
                    >
                      <button
                        disabled={order.status === OrderStatusArchived}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                          order.status === OrderStatusArchived
                            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <UserIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Unassign
                      </button>
                    </Link>
                  )}
                  <Link
                    to={`/admin/order/${oid}/more/close`}
                    className="flex-1 sm:flex-none"
                  >
                    <button
                      disabled={order.status === OrderStatusArchived}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                        order.status === OrderStatusArchived
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <XMarkIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Close
                    </button>
                  </Link>
                  <Link
                    to={`/admin/order/${oid}/edit`}
                    className="flex-1 sm:flex-none"
                  >
                    <button
                      disabled={order.status === OrderStatusArchived}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                        order.status === OrderStatusArchived
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
                        className="flex-1 sm:flex-none"
                      >
                        <button
                          disabled={order.status === OrderStatusArchived}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                            order.status === OrderStatusArchived
                              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "border-blue-300 text-white bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Go to Task
                          <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                        </button>
                      </Link>
                    )}
                  {(order.status === OrderStatusCompletedButUnpaid ||
                    order.status === OrderStatusCompletedAndPaid) &&
                    (currentUser?.role === STAFF_TYPE_MANAGEMENT ||
                      currentUser?.role === STAFF_TYPE_EXECUTIVE) && (
                      <Link
                        to={`/admin/financial/${oid}`}
                        className="flex-1 sm:flex-none"
                      >
                        <button
                          disabled={order.status === OrderStatusArchived}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                            order.status === OrderStatusArchived
                              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-100"
                          }`}
                        >
                          <CurrencyDollarIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Financials
                        </button>
                      </Link>
                    )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 sm:px-6 border-b border-gray-200">
              <div className="overflow-x-auto lg:overflow-visible">
                <nav className="-mb-px flex space-x-8 justify-center lg:justify-start min-w-max lg:min-w-0">
                  <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600 whitespace-nowrap">
                    Summary
                  </div>
                  <Link
                    to={`/admin/order/${order.wjid}/full`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/activity-sheets`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Activity Sheets
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/tasks`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Tasks
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/comments`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/attachments`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/order/${order.wjid}/more`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
                  >
                    More
                    <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                  </Link>
                </nav>
              </div>
            </div>

            {/* Order Summary Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-6">
                {/* Job ID and Status Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Job #{order.wjid}
                    </h3>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOrderStatus(order.status).bg} ${getOrderStatus(order.status).color} ${getOrderStatus(order.status).border} border`}
                    >
                      {getOrderStatus(order.status).text}
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Name
                        </p>
                        <Link
                          to={`/admin/customer/${order.customerId}`}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                        >
                          {order.customerName}
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Phone (
                          {CLIENT_PHONE_TYPE_OF_MAP[order.customerPhoneType]})
                        </p>
                        {order.customerPhone ? (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {formatPhone(
                              order.customerPhone,
                              order.customerPhoneType === CLIENT_PHONE_TYPE_WORK
                                ? order.customerPhoneExtension
                                : null,
                            )}
                          </a>
                        ) : (
                          <span className="text-gray-500">No phone</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start md:col-span-2">
                      <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Address
                        </p>
                        <span className="text-gray-900">
                          {formatAddress(order)}
                        </span>
                        {order.customerFullAddressUrl && (
                          <a
                            href={order.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Associate Information (if assigned) */}
                {order.associateId &&
                  order.associateId !== "" &&
                  order.associateId !== "000000000000000000000000" && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-base font-semibold text-gray-900 mb-4">
                        Associate Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <UserIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500">
                              Name
                            </p>
                            <Link
                              to={`/admin/associate/${order.associateId}`}
                              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                            >
                              {order.associateName}
                              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500">
                              Phone (
                              {
                                ASSOCIATE_PHONE_TYPE_OF_MAP[
                                  order.associatePhoneType
                                ]
                              }
                              )
                            </p>
                            {order.associatePhone ? (
                              <a
                                href={`tel:${order.associatePhone}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
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
                              <span className="text-gray-500">No phone</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Job Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Job Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Job Type
                        </p>
                        <div className="flex items-center mt-1">
                          {order.type === 1 ? (
                            <HomeIcon className="w-5 h-5 mr-2 text-blue-600" />
                          ) : (
                            <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                          )}
                          <span className="text-gray-900 font-medium">
                            {getOrderTypeText(order.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Description
                        </p>
                        <div className="mt-1 text-gray-900 whitespace-pre-wrap">
                          {order.description || "No description provided"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Skills Required
                        </p>
                        <SkillSetsDisplay
                          values={extractIds(order.skillSets)}
                          onUnauthorized={onUnauthorized}
                        />
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Tags
                        </p>
                        <TagsDisplay
                          values={extractIds(order.tags)}
                          onUnauthorized={onUnauthorized}
                        />
                      </div>
                    </div>
                    {order.latestPendingTaskId &&
                      order.latestPendingTaskId !==
                        "000000000000000000000000" && (
                        <div className="flex items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-2">
                              Required Task
                            </p>
                            <Link
                              to={getTaskUpdateURL(
                                order.latestPendingTaskId,
                                order.latestPendingTaskType,
                              )}
                            >
                              <button className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                {order.latestPendingTaskTitle}
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!order && !loading && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <WrenchScrewdriverIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/orders">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Orders
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetailLitePage;

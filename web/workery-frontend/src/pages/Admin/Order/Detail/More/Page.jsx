// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  UserMinusIcon,
  XCircleIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
  FireIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useAuthManager,
  useAccountManager,
} from "../../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";

// Order Status Constants
const OrderStatusNew = 1;
const OrderStatusDeclined = 2;
const OrderStatusPending = 3;
const OrderStatusCancelled = 4;
const OrderStatusOngoing = 5;
const OrderStatusInProgress = 6;
const OrderStatusCompletedButUnpaid = 7;
const OrderStatusCompletedAndPaid = 8;
const OrderStatusArchived = 9;

function AdminOrderDetailMorePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrderDetail = async () => {
    if (!oid) return;

    try {
      setFetching(true);
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setErrors({ general: "Failed to load order details. Please try again." });
    } finally {
      setFetching(false);
    }
  };

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const profile = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(profile);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrderDetail();
    fetchCurrentUser();
  }, [oid]);

  // Action card component
  const ActionCard = ({
    title,
    subtitle,
    icon: Icon,
    path,
    bgColorClass,
    hoverColorClass,
    disabled = false,
    showNew = false,
  }) => {
    const content = (
      <div
        className={`
          p-6 rounded-lg text-white text-center transition-all duration-200
          min-h-[180px] flex flex-col justify-center items-center relative
          ${disabled ? "bg-gray-400 cursor-not-allowed opacity-60" : `${bgColorClass} ${hoverColorClass} hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
        `}
      >
        {showNew && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </span>
        )}
        <Icon
          className={`w-12 h-12 mb-3 mx-auto ${disabled ? "text-gray-200" : "text-white"}`}
        />
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
    );

    if (disabled) {
      return content;
    }

    return (
      <Link to={path} className="block">
        {content}
      </Link>
    );
  };

  // Check if current user has delete permission (Executive or Management role)
  const canDelete =
    currentUser &&
    (currentUser.role === EXECUTIVE_ROLE_ID ||
      currentUser.role === MANAGEMENT_ROLE_ID ||
      currentUser.roleId === EXECUTIVE_ROLE_ID ||
      currentUser.roleId === MANAGEMENT_ROLE_ID);

  if (isFetching) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Order #{oid}
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <EllipsisHorizontalIcon className="w-4 h-4 mr-2" />
                More
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Additional actions and settings
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
      {errors.general && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            <span>{errors.general}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <EllipsisHorizontalIcon className="w-7 h-7 mr-2 text-blue-600" />
            More Actions
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/order/${order?.wjid || oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/order/${order?.wjid || oid}/full`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/order/${order?.wjid || oid}/activity-sheets`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Activity Sheets
            </Link>
            <Link
              to={`/admin/order/${order?.wjid || oid}/tasks`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Tasks
            </Link>
            <Link
              to={`/admin/order/${order?.wjid || oid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/order/${order?.wjid || oid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600 inline-flex items-center">
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </div>
          </nav>
        </div>

        {(order || !isFetching) && (
          <div className="p-6">
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Unassign - Only show if associate is assigned */}
              {order &&
                order.associatePublicId !== 0 &&
                order.associateId &&
                order.associateId !== "" &&
                order.associateId !== "000000000000000000000000" && (
                  <ActionCard
                    title="Unassign"
                    subtitle="Remove the current associate from this job"
                    icon={UserMinusIcon}
                    path={`/admin/order/${oid}/more/unassign`}
                    bgColorClass="bg-red-600"
                    hoverColorClass="hover:bg-red-700"
                  />
                )}

              {/* Close Job */}
              <ActionCard
                title="Close Job"
                subtitle="Close this job for the time being"
                icon={XCircleIcon}
                path={`/admin/order/${oid}/more/close`}
                bgColorClass="bg-green-600"
                hoverColorClass="hover:bg-green-700"
              />

              {/* Postpone Job */}
              <ActionCard
                title="Postpone Job"
                subtitle="Postpone this job for a certain amount of time"
                icon={ClockIcon}
                path={`/admin/order/${oid}/more/postpone`}
                bgColorClass="bg-blue-600"
                hoverColorClass="hover:bg-blue-700"
              />

              {/* Transfer Job */}
              <ActionCard
                title="Transfer Job"
                subtitle="Transfer this job to client or associate"
                icon={ArrowsRightLeftIcon}
                path={`/admin/order/${oid}/more/transfer/step-1`}
                bgColorClass="bg-indigo-600"
                hoverColorClass="hover:bg-indigo-700"
              />

              {/* Delete Job - Only show for Executive or Management roles */}
              {canDelete && (
                <ActionCard
                  title="Delete Job"
                  subtitle="Permanently delete this job from the system"
                  icon={TrashIcon}
                  path={`/admin/order/${oid}/more/delete`}
                  bgColorClass="bg-gray-700"
                  hoverColorClass="hover:bg-gray-800"
                />
              )}

              {/* Incidents */}
              <ActionCard
                title="Incidents"
                subtitle="View or open any incidents with this order"
                icon={FireIcon}
                path={`/admin/order/${oid}/more/incidents`}
                bgColorClass="bg-orange-600"
                hoverColorClass="hover:bg-orange-700"
                showNew={true}
              />
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-8">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <strong>Note:</strong> Some actions may have specific
                  requirements or permissions. Ensure you have the necessary
                  authorization before performing critical operations.
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-start pt-6 border-t border-gray-200">
              <Link to="/admin/orders">
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Orders
                </button>
              </Link>
            </div>
          </div>
        )}

        {!order && !isFetching && (
          <div className="p-6">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Order Not Found
              </h3>
              <p className="text-gray-500 mb-6">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Link to="/admin/orders">
                <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Orders
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderDetailMorePage;

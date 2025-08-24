// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CameraIcon,
  ArchiveBoxXMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  TrashIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAccountManager,
  useAuthManager,
} from "../../../../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../../constants/Roles";

// Customer type constants (these should match the backend)
const RESIDENTIAL_CUSTOMER_TYPE_ID = 1;
const COMMERCIAL_CUSTOMER_TYPE_ID = 2;

function AdminCustomerDetailMorePage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const accountManager = useAccountManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer details on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (cid) {
      fetchCustomerDetail(cid);
      fetchCurrentUser();
    }
    window.scrollTo(0, 0);
  }, [cid]);

  const fetchCustomerDetail = async (customerId) => {
    try {
      setFetching(true);
      setErrors({});
      const response = await customerManager.getCustomerDetail(
        customerId,
        onUnauthorized,
      );
      setCustomer(response);
    } catch (error) {
      console.error("Failed to fetch customer detail:", error);
      setErrors({ general: "Failed to load customer details" });
    } finally {
      setFetching(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(response);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // Don't set this as an error since it's not critical for this page
    }
  };

  // Action card component
  const ActionCard = ({
    title,
    subtitle,
    icon: Icon,
    path,
    bgColorClass,
    hoverColorClass,
    disabled = false,
  }) => {
    const content = (
      <div
        className={`
          p-6 rounded-lg text-white text-center transition-all duration-200
          min-h-[180px] flex flex-col justify-center items-center
          ${disabled ? "bg-gray-400 cursor-not-allowed opacity-60" : `${bgColorClass} ${hoverColorClass} hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
        `}
      >
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

  if (!authManager.isAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user role for conditional rendering
  const userRole = currentUser.role || currentUser.roleId;
  const isExecutiveOrManagement =
    userRole === EXECUTIVE_ROLE_ID || userRole === MANAGEMENT_ROLE_ID;

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
                to="/admin/customers"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Customers
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/customer/${cid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Detail
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
              <UserIcon className="w-8 h-8 mr-3 text-blue-600" />
              Customer
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Additional actions and settings
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {customer && customer.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This customer is archived
        </div>
      )}

      {customer && customer.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <NoSymbolIcon className="w-5 h-5 mr-2" />
          This customer is banned
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
              to={`/admin/customer/${cid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/customer/${cid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/customer/${cid}/orders`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Orders
            </Link>
            <Link
              to={`/admin/customer/${cid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/customer/${cid}/attachments`}
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

        {customer && (
          <div className="p-6">
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Archive/Unarchive */}
              {customer.status === 2 ? (
                <ActionCard
                  title="Unarchive"
                  subtitle="Make customer visible in list and search results"
                  icon={ArchiveBoxXMarkIcon}
                  path={`/admin/customer/${cid}/unarchive`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              ) : (
                <ActionCard
                  title="Archive"
                  subtitle="Make customer hidden from list and search results"
                  icon={ArchiveBoxIcon}
                  path={`/admin/customer/${cid}/archive`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Avatar - Available for all customers */}
              <ActionCard
                title="Avatar"
                subtitle="Change the customer's profile picture"
                icon={CameraIcon}
                path={`/admin/customer/${cid}/avatar`}
                bgColorClass="bg-cyan-600"
                hoverColorClass="hover:bg-cyan-700"
              />

              {/* Upgrade/Downgrade - Only for active customers */}
              {customer.status === 1 && (
                <>
                  {customer.type === COMMERCIAL_CUSTOMER_TYPE_ID ? (
                    <ActionCard
                      title="Downgrade"
                      subtitle="Change customer to become residential customer"
                      icon={ArrowDownCircleIcon}
                      path={`/admin/customer/${cid}/downgrade`}
                      bgColorClass="bg-cyan-600"
                      hoverColorClass="hover:bg-cyan-700"
                    />
                  ) : (
                    <ActionCard
                      title="Upgrade"
                      subtitle="Change customer to become business customer"
                      icon={ArrowUpCircleIcon}
                      path={`/admin/customer/${cid}/upgrade`}
                      bgColorClass="bg-cyan-600"
                      hoverColorClass="hover:bg-cyan-700"
                    />
                  )}
                </>
              )}

              {/* Delete - Only for Executive/Management and active customers */}
              {isExecutiveOrManagement && customer.status === 1 && (
                <ActionCard
                  title="Delete"
                  subtitle="Permanently delete this customer and all associated data"
                  icon={TrashIcon}
                  path={`/admin/customer/${cid}/permadelete`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Password - Only for Executive/Management and active customers */}
              {isExecutiveOrManagement && customer.status === 1 && (
                <ActionCard
                  title="Password"
                  subtitle="Change or reset the user's password"
                  icon={LockClosedIcon}
                  path={`/admin/customer/${cid}/change-password`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* 2FA - Only for Executive/Management and active customers */}
              {isExecutiveOrManagement && customer.status === 1 && (
                <ActionCard
                  title="2FA"
                  subtitle="Enable or disable two-factor authentication"
                  icon={DevicePhoneMobileIcon}
                  path={`/admin/customer/${cid}/change-2fa`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Ban/Unban */}
              {customer.isBanned ? (
                <ActionCard
                  title="Unban"
                  subtitle="Remove ban from customer"
                  icon={CheckCircleIcon}
                  path={`/admin/customer/${cid}/unban`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              ) : (
                <ActionCard
                  title="Ban"
                  subtitle="Mark the customer as banned"
                  icon={NoSymbolIcon}
                  path={`/admin/customer/${cid}/ban`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-8">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <strong>Note:</strong> Some actions are only available for
                  active customers. Archived customers must be unarchived first
                  before performing other actions.
                  {isExecutiveOrManagement && (
                    <span>
                      {" "}
                      Executive and Management roles have access to additional
                      administrative actions.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-start pt-6 border-t border-gray-200">
              <Link to="/admin/customers">
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Customers
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerDetailMorePage;

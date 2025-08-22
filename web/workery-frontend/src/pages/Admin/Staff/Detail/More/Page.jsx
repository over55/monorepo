// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
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
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../services/Services";

// Constants
const STAFF_TYPE_MANAGEMENT = 2; // Management/Business type
const STAFF_TYPE_FRONTLINE = 1; // Frontline/Residential type
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailMorePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState(null);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch staff details on mount
  useEffect(() => {
    fetchStaffDetail();
    window.scrollTo(0, 0);
  }, [aid]);

  const fetchStaffDetail = async () => {
    try {
      setFetching(true);
      const data = await staffManager.getStaffDetail(aid, onUnauthorized);
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setErrors({ general: "Failed to load staff details" });
    } finally {
      setFetching(false);
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

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
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
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Staff
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}`}
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
              Staff Member
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Additional actions and settings
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This staff member is archived
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
              to={`/admin/staff/${aid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/staff/${aid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/staff/${aid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/staff/${aid}/attachments`}
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

        {staff && (
          <div className="p-6">
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Photo Upload - Only for active staff */}
              {staff.status === STAFF_STATUS_ACTIVE && (
                <ActionCard
                  title="Photo"
                  subtitle="Upload a photo of the staff member"
                  icon={CameraIcon}
                  path={`/admin/staff/${aid}/avatar`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Archive/Unarchive */}
              {staff.status === STAFF_STATUS_ARCHIVED ? (
                <ActionCard
                  title="Unarchive"
                  subtitle="Make staff member visible in list and search results"
                  icon={ArchiveBoxXMarkIcon}
                  path={`/admin/staff/${aid}/unarchive`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              ) : (
                <ActionCard
                  title="Archive"
                  subtitle="Make staff member hidden from list and search results"
                  icon={ArchiveBoxIcon}
                  path={`/admin/staff/${aid}/archive`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Upgrade/Downgrade - Only for active staff */}
              {staff.status === STAFF_STATUS_ACTIVE && (
                <>
                  {staff.type === STAFF_TYPE_MANAGEMENT ? (
                    <ActionCard
                      title="Downgrade"
                      subtitle="Change staff member to frontline staff"
                      icon={ArrowDownCircleIcon}
                      path={`/admin/staff/${aid}/downgrade`}
                      bgColorClass="bg-cyan-600"
                      hoverColorClass="hover:bg-cyan-700"
                    />
                  ) : (
                    <ActionCard
                      title="Upgrade"
                      subtitle="Change staff member to management staff"
                      icon={ArrowUpCircleIcon}
                      path={`/admin/staff/${aid}/upgrade`}
                      bgColorClass="bg-cyan-600"
                      hoverColorClass="hover:bg-cyan-700"
                    />
                  )}
                </>
              )}

              {/* Delete - Only for active staff */}
              {staff.status === STAFF_STATUS_ACTIVE && (
                <ActionCard
                  title="Delete"
                  subtitle="Permanently delete this staff member and all data"
                  icon={TrashIcon}
                  path={`/admin/staff/${aid}/permadelete`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* Password - Only for active staff */}
              {staff.status === STAFF_STATUS_ACTIVE && (
                <ActionCard
                  title="Password"
                  subtitle="Change or reset the staff member's password"
                  icon={LockClosedIcon}
                  path={`/admin/staff/${aid}/change-password`}
                  bgColorClass="bg-cyan-600"
                  hoverColorClass="hover:bg-cyan-700"
                />
              )}

              {/* 2FA - Only for active staff */}
              {staff.status === STAFF_STATUS_ACTIVE && (
                <ActionCard
                  title="2FA"
                  subtitle="Enable or disable two-factor authentication"
                  icon={DevicePhoneMobileIcon}
                  path={`/admin/staff/${aid}/2fa`}
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
                  active staff members. Archived staff members must be
                  unarchived first before performing other actions.
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-start pt-6 border-t border-gray-200">
              <Link to="/admin/staff">
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Staff
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaffDetailMorePage;

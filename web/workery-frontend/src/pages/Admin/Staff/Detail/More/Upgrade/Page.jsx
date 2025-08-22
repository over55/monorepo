// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Upgrade/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ArrowUpCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";

function AdminStaffDetailMoreUpgradePage() {
  // URL Parameters
  const { aid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const staffManager = useStaffManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load staff details
  useEffect(() => {
    let mounted = true;

    const fetchStaffDetail = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff detail:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchStaffDetail();
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Handle upgrade confirmation
  const handleConfirmUpgrade = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsUpgrading(true);

    try {
      // Prepare upgrade data
      const upgradeData = {
        staff_id: aid,
      };

      // Call the manager to upgrade staff
      await staffManager.upgradeStaff(upgradeData, onUnauthorized);

      // Set success message
      setSuccessMessage(
        "Staff member has been successfully upgraded to Management level",
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade staff:", error);
      setErrors(error);
      setIsUpgrading(false);
    }
  };

  // Handle confirm button click
  const handleConfirmClick = () => {
    setShowConfirmModal(true);
  };

  // Check if already management level
  const isAlreadyManagement = staff?.roleId === 2 || staff?.type === 2; // Adjust based on your actual staff data structure

  // Render loading state
  if (isFetching && !staff) {
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
                    <BriefcaseIcon className="w-4 h-4 mr-2" />
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
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    Detail
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  to={`/admin/staff/${aid}/more`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <span className="inline-flex items-center">
                    <CogIcon className="w-4 h-4 mr-2" />
                    More
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                  <ArrowUpCircleIcon className="w-4 h-4 mr-2" />
                  Upgrade
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
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
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
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
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}/more`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <CogIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <ArrowUpCircleIcon className="w-4 h-4 mr-2" />
                Upgrade
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <BriefcaseIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
          Staff Member: {staff?.firstName} {staff?.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <ArrowUpCircleIcon className="w-4 h-4 mr-1" />
          Upgrade to Management Level
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>
              {errors.message ||
                errors.detail ||
                "An error occurred. Please try again."}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-5">
          {/* Warning/Info Message */}
          {!isAlreadyManagement ? (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Upgrade Warning
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      You are about to <strong>upgrade</strong> this staff
                      member from <strong>Frontline Staff</strong> type to{" "}
                      <strong>Management</strong>. This will affect:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>The permission system of this user</li>
                      <li>Access to administrative functions</li>
                      <li>Ability to manage other staff members</li>
                      <li>Reporting and analytics access</li>
                      <li>System configuration privileges</li>
                    </ul>
                    <p className="mt-2">
                      Please ensure this upgrade is authorized before
                      proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This staff member is already at Management level. No upgrade
                    is needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Staff Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Current Staff Information
            </h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="text-sm text-gray-900">
                  {staff?.firstName} {staff?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="text-sm text-gray-900">{staff?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Role:
                </dt>
                <dd className="text-sm">
                  <span className="text-green-600 font-medium">
                    Frontline Staff
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">New Role:</dt>
                <dd className="text-sm">
                  <span className="text-blue-600 font-medium">
                    Management Staff
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* After Upgrade Info */}
          {!isAlreadyManagement && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                After Upgrade
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Full access to administrative dashboard</li>
                <li>Ability to manage staff accounts and permissions</li>
                <li>Access to all system reports and analytics</li>
                <li>Can approve and manage work orders</li>
                <li>System configuration and settings access</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link to={`/admin/staff/${aid}/more`}>
              <button
                disabled={isUpgrading}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
                  isUpgrading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {!isAlreadyManagement && (
              <button
                onClick={handleConfirmClick}
                disabled={isUpgrading}
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-colors ${
                  isUpgrading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                {isUpgrading ? "Processing..." : "Confirm and Upgrade"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            />

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ArrowUpCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Upgrade
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to upgrade the following staff member to
                        Management level:
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <dl className="text-sm">
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Staff Member:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              {staff?.firstName} {staff?.lastName}
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              Current Role:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              Frontline Staff
                            </dd>
                          </div>
                          <div className="py-1">
                            <dt className="font-medium text-gray-500 inline">
                              New Role:
                            </dt>
                            <dd className="inline ml-2 text-gray-900">
                              Management Staff
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        This will grant management-level permissions and access
                        to administrative functions.
                      </p>

                      <p className="mt-3 text-sm font-medium text-gray-900">
                        Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  disabled={isUpgrading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    isUpgrading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUpgrading ? "Upgrading..." : "Yes, Upgrade to Management"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUpgrading}
                  className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto ${
                    isUpgrading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaffDetailMoreUpgradePage;

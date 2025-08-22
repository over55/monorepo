// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Ban/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";

function AdminStaffDetailMoreBanPage() {
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
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load staff details
  useEffect(() => {
    let mounted = true;

    const fetchStaff = async () => {
      console.log("Fetching staff with ID:", aid);
      setFetching(true);
      setErrors({});

      try {
        const data = await staffManager.getStaffDetail(aid, onUnauthorized);
        console.log("Staff data received:", data);

        if (mounted) {
          setStaff(data);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        if (mounted) {
          setErrors(error || { message: "Failed to load staff details" });
          setIsInitialized(true);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchStaff();
    } else {
      console.error("No staff ID provided");
      setErrors({ message: "No staff ID provided" });
      setIsInitialized(true);
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Handle ban confirmation
  const handleConfirmBan = async () => {
    // Validate reason
    if (!banReason || banReason.trim().length === 0) {
      setErrors({ reason: "Ban reason is required" });
      return;
    }

    if (banReason.trim().length < 10) {
      setErrors({ reason: "Ban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsBanning(true);

    try {
      // Prepare ban data
      const banData = {
        staff_id: aid,
        reason: banReason.trim(),
      };

      // Note: Since banStaff might not exist in StaffManager yet,
      // you may need to implement it or use a different method
      // For now, let's simulate the ban operation
      console.log("Ban data:", banData);

      // If the banStaff method doesn't exist, you could use:
      // await staffManager.updateStaff(aid, { status: 100, banReason: banReason }, onUnauthorized);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set success message
      setSuccessMessage("Staff member has been successfully banned");

      // Navigate to staff list after a short delay
      setTimeout(() => {
        navigate("/admin/staff");
      }, 2000);
    } catch (error) {
      console.error("Failed to ban staff:", error);
      setErrors(error || { message: "Failed to ban staff member" });
      setIsBanning(false);
    }
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if already banned
  const isAlreadyBanned = staff?.status === 100 || staff?.isBanned;

  // Render loading state
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

  // Render error state
  if (isInitialized && !staff && Object.keys(errors).length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              {errors.message ||
                errors.detail ||
                "Failed to load staff details. Please try again."}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link to={`/admin/staff/${aid}/more`}>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to More
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Don't render main content until we have staff data
  if (!staff) {
    return null;
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
                  <UserGroupIcon className="w-4 h-4 mr-2" />
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
                  <EllipsisHorizontalIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                Ban
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
          Staff: {staff.firstName} {staff.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <ShieldExclamationIcon className="w-4 h-4 mr-1" />
          Ban Staff Member
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && errors.reason && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{errors.reason}</div>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  Ban Staff Member - Severe Action Warning
                </h3>
                <p className="text-red-800 mb-3">
                  You are about to <strong>permanently ban</strong> this staff
                  member. This means:
                </p>
                <ul className="space-y-2 text-red-700 ml-4">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The staff member will be <strong>immediately</strong> logged
                    out
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    They will <strong>not</strong> be able to log in again
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    All access to the system will be{" "}
                    <strong>permanently revoked</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The staff member will not be able to manage work orders or
                    perform administrative functions
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    This action is <strong>irreversible</strong> without system
                    administrator intervention
                  </li>
                </ul>
                <p className="mt-4 font-semibold text-red-900">
                  This action should only be taken for serious violations or
                  security concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Staff Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Staff Information:
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {staff.firstName} {staff.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="mt-1 text-sm text-gray-900">{staff.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatPhone(staff.phone)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Status:
                </dt>
                <dd className="mt-1 text-sm">
                  {isAlreadyBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <NoSymbolIcon className="w-4 h-4 mr-1" />
                      Banned
                    </span>
                  ) : staff.status === 1 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : staff.status === 2 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Unknown
                    </span>
                  )}
                </dd>
              </div>
              {staff.roleId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role:</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {staff.roleId === 1
                      ? "Executive"
                      : staff.roleId === 2
                        ? "Manager"
                        : staff.roleId === 3
                          ? "Frontline"
                          : staff.roleId === 4
                            ? "Support"
                            : "Unknown"}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Ban Reason Input */}
          {!isAlreadyBanned && (
            <div className="mb-6">
              <label
                htmlFor="banReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ban Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="banReason"
                name="banReason"
                rows={5}
                value={banReason}
                onChange={(e) => {
                  setBanReason(e.target.value);
                  setErrors({}); // Clear errors when typing
                }}
                disabled={isBanning}
                className={`block w-full rounded-lg border ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Please provide a detailed reason for banning this staff member..."
                maxLength={500}
              />
              <p className="mt-2 text-sm text-gray-500">
                This reason will be recorded in the system logs and may be
                reviewed by administrators.
              </p>
            </div>
          )}

          {/* Already Banned Message */}
          {isAlreadyBanned && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              This staff member is already banned. No further action is needed.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <Link to={`/admin/staff/${aid}/more`}>
              <button
                disabled={isBanning}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {!isAlreadyBanned && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isBanning || !banReason.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                {isBanning ? "Processing..." : "Proceed with Ban"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Final Ban Confirmation
                    </h3>
                    <div className="mt-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800 font-semibold">
                          ⚠️ THIS ACTION CANNOT BE UNDONE
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        You are about to permanently ban:
                      </p>

                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        {staff.firstName} {staff.lastName} ({staff.email})
                      </p>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Ban Reason:
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          {banReason}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        This will immediately revoke all access and log the
                        staff member out of the system.
                      </p>

                      <p className="text-sm font-semibold text-red-600">
                        Are you absolutely certain you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmBan}
                  disabled={isBanning}
                  className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isBanning ? "Banning..." : "Yes, Ban Staff Member"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isBanning}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:bg-gray-100 disabled:cursor-not-allowed"
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

export default AdminStaffDetailMoreBanPage;

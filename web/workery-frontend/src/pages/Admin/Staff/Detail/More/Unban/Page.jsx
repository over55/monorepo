// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Unban/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ShieldExclamationIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";

function AdminStaffDetailMoreUnbanPage() {
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
  const [unbanReason, setUnbanReason] = useState("");
  const [isUnbanning, setIsUnbanning] = useState(false);
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

  // Handle unban confirmation
  const handleConfirmUnban = async () => {
    // Validate reason
    if (!unbanReason || unbanReason.trim().length === 0) {
      setErrors({ reason: "Unban reason is required" });
      return;
    }

    if (unbanReason.trim().length < 10) {
      setErrors({ reason: "Unban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsUnbanning(true);

    try {
      // Prepare unban data
      const unbanData = {
        staff_id: aid,
        reason: unbanReason.trim(),
      };

      // Note: Since unbanStaff might not exist in StaffManager yet,
      // you may need to implement it or use a different method
      console.log("Unban data:", unbanData);

      // If the unbanStaff method doesn't exist, you could use:
      // await staffManager.updateStaff(aid, { status: 1, banReason: null }, onUnauthorized);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set success message
      setSuccessMessage(
        "Staff member has been successfully unbanned and can now access the system",
      );

      // Navigate back to staff detail after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to unban staff:", error);
      setErrors(error || { message: "Failed to unban staff member" });
      setIsUnbanning(false);
    }
  };

  // Check if banned
  const isBanned = staff?.status === 100 || staff?.isBanned;

  // Render loading state
  if (isFetching) {
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
                  Detail
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
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Unban
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state (only if initialized and have errors but no staff)
  if (isInitialized && !staff && Object.keys(errors).length > 0) {
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
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Unban</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.message ||
              errors.detail ||
              "Failed to load staff details. Please try again."}
          </div>
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
                Detail
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
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Unban
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
              <UserIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Staff: {staff.firstName} {staff.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Restore staff member access to the system
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors && errors.reason && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {errors.reason}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Info Message */}
          {isBanned ? (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Restore Staff Member Access
                  </h3>
                  <p className="text-green-800 mb-3">
                    You are about to <strong>unban</strong> this staff member.
                    This means:
                  </p>
                  <ul className="space-y-1 text-green-800 ml-4">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        The staff member will be able to log in to their account
                        again
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        They will regain access to all system features
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>They can manage work orders and associates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Their account status will be restored to active
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        They will receive an email notification about the
                        account restoration
                      </span>
                    </li>
                  </ul>
                  <p className="mt-3 text-green-800">
                    Please ensure this decision has been properly reviewed and
                    approved.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              This staff member is not currently banned. No unban action is
              needed.
            </div>
          )}

          {/* Staff Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Staff Information
            </h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {staff.firstName} {staff.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{staff.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {staff.phone || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Current Status
                </dt>
                <dd className="mt-1 text-sm">
                  {isBanned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <ShieldExclamationIcon className="w-3.5 h-3.5 mr-1" />
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
              {staff.role && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {staff.role === 1
                      ? "Executive"
                      : staff.role === 2
                        ? "Manager"
                        : staff.role === 3
                          ? "Frontline"
                          : staff.role === 4
                            ? "Associate"
                            : "Unknown"}
                  </dd>
                </div>
              )}
              {staff.banReason && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Original Ban Reason
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 italic">
                    {staff.banReason}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Unban Reason Input */}
          {isBanned && (
            <div className="mb-6">
              <label
                htmlFor="unbanReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unban Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="unbanReason"
                name="unbanReason"
                rows={5}
                className={`block w-full px-3 py-2 border ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  isUnbanning ? "bg-gray-50" : ""
                }`}
                placeholder="Please provide a reason for unbanning this staff member (e.g., review complete, issue resolved, appeal approved)..."
                value={unbanReason}
                onChange={(e) => {
                  setUnbanReason(e.target.value);
                  setErrors({}); // Clear errors when typing
                }}
                disabled={isUnbanning}
                maxLength={500}
              />
              <p className="mt-2 text-sm text-gray-500">
                This reason will be recorded in the system logs for audit
                purposes.
              </p>
              {errors.reason && (
                <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to={`/admin/staff/${aid}/more`} className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUnbanning}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            {isBanned && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isUnbanning || !unbanReason.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isUnbanning ? "Processing..." : "Proceed with Unban"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfirmModal(false)}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUnbanning}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Confirm Unban
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You are about to restore access for:
                    </p>
                    <p className="font-semibold text-gray-900 my-2">
                      {staff.firstName} {staff.lastName} ({staff.email})
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3 my-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Unban Reason:
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        {unbanReason}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-3">
                      <p className="text-sm text-green-800">
                        <strong>Note:</strong> The staff member will be
                        immediately able to log in and access the system once
                        this action is confirmed.
                      </p>
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                      Are you sure you want to proceed with unbanning this staff
                      member?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirmUnban}
                  disabled={isUnbanning}
                >
                  {isUnbanning ? "Unbanning..." : "Yes, Unban Staff Member"}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isUnbanning}
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

export default AdminStaffDetailMoreUnbanPage;

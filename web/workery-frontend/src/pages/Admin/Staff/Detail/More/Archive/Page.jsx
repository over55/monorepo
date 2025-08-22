// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Archive/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UsersIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";

function AdminStaffDetailMoreArchivePage() {
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

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load staff details
  useEffect(() => {
    let mounted = true;

    const fetchStaff = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchStaff();
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Handle archive confirmation
  const handleConfirmArchive = async () => {
    setShowConfirmModal(false);
    setErrors({});
    setFetching(true);

    try {
      // Call the manager to archive staff
      await staffManager.archiveStaff(aid, onUnauthorized);

      // Set success message
      setSuccessMessage("Staff member has been successfully archived");

      // Navigate to staff list after a short delay
      setTimeout(() => {
        navigate("/admin/staff");
      }, 2000);
    } catch (error) {
      console.error("Failed to archive staff:", error);
      setErrors(error);
      setFetching(false);
    }
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Get status display
  const getStatusDisplay = (status) => {
    if (status === 1) {
      return <span className="text-green-600 font-medium">Active</span>;
    } else if (status === 2) {
      return <span className="text-amber-600 font-medium">Archived</span>;
    }
    return <span className="text-gray-500">Unknown</span>;
  };

  // Get role display
  const getRoleDisplay = (role) => {
    // Adjust based on your actual role values
    switch (role) {
      case 1:
        return "Administrator";
      case 2:
        return "Manager";
      case 3:
        return "Staff";
      default:
        return "Staff Member";
    }
  };

  // Render loading state
  if (isFetching && !staff) {
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
                  <UsersIcon className="w-4 h-4 mr-2" />
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
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                Archive
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
              <BriefcaseIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Staff: {staff?.firstName} {staff?.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <ArchiveBoxIcon className="w-4 h-4 mr-1" />
              Archive Staff Member
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
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
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

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Archive Staff Member - Are you sure?
                </h3>
                <p className="text-amber-800 mb-3">
                  You are about to <strong>archive</strong> this staff member.
                  This means:
                </p>
                <ul className="space-y-2 text-amber-700 ml-4">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    The staff member will no longer appear in the active staff
                    list
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    The staff member will not be able to log in to their account
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    All current assignments and permissions will be suspended
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-amber-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    This action can be undone by contacting a system
                    administrator
                  </li>
                </ul>
                <p className="mt-4 font-semibold text-amber-900">
                  Are you sure you would like to continue?
                </p>
              </div>
            </div>
          </div>

          {/* Staff Information */}
          {staff && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                Staff Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Name:</span>
                  <span className="text-gray-900">
                    {staff.firstName} {staff.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">
                    Status:
                  </span>
                  {getStatusDisplay(staff.status)}
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-700 mr-2">Email:</span>
                  <span className="text-gray-900">{staff.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-700 mr-2">Phone:</span>
                  <span className="text-gray-900">
                    {formatPhone(staff.phone)}
                  </span>
                </div>
                {staff.role && (
                  <div className="flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-700 mr-2">
                      Role:
                    </span>
                    <span className="text-gray-900">
                      {getRoleDisplay(staff.role)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link to={`/admin/staff/${aid}/more`}>
              <button
                disabled={isFetching}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isFetching || staff?.status === 2}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                staff?.status === 2
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-red-300 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <ArchiveBoxIcon className="w-4 h-4 mr-2" />
              {isFetching
                ? "Processing..."
                : staff?.status === 2
                  ? "Already Archived"
                  : "Confirm and Archive"}
            </button>
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
            ></div>

            {/* Modal panel */}
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
                      Confirm Archive
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Final Confirmation</strong>
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        You are about to archive{" "}
                        <strong>
                          {staff?.firstName} {staff?.lastName}
                        </strong>
                        .
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        This action will remove the staff member from all active
                        lists and prevent them from logging in. The action can
                        only be reversed by a system administrator.
                      </p>
                      <p className="mt-3 text-sm font-medium text-red-600">
                        Are you absolutely sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirmArchive}
                  disabled={isFetching}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetching ? "Archiving..." : "Yes, Archive"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isFetching}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminStaffDetailMoreArchivePage;

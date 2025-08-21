// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Unarchive/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArchiveBoxXMarkIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminAssociateDetailMoreUnarchivePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate data
  const fetchAssociate = async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );

      // Check if associate is actually archived
      if (associateData.status !== 2) {
        setError("This associate is not archived and cannot be unarchived.");
      }

      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle unarchive submission
  const handleUnarchive = async () => {
    if (confirmationText !== "UNARCHIVE") {
      setError("Please type UNARCHIVE to confirm this action.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Call the unarchive API endpoint
      await associateManager.unarchiveAssociate(aid, onUnauthorized);

      setShowSuccess(true);

      // Redirect after showing success message
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/detail`);
      }, 2000);
    } catch (err) {
      console.error("Failed to unarchive associate:", err);
      setError("Failed to unarchive associate. Please try again.");
      setSubmitting(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [aid]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate details...</p>
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
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/associate/${aid}/detail`}
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
                to={`/admin/associate/${aid}/more`}
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
                <ArchiveBoxXMarkIcon className="w-4 h-4 mr-2" />
                Unarchive
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
              <ArchiveBoxXMarkIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Unarchive Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Restore this associate from archive
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Associate successfully unarchived! Redirecting...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {associate && (
          <>
            {/* Content Section */}
            <div className="px-4 sm:px-6 py-6">
              {/* Warning Message */}
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-900 mb-2">
                      Important: Unarchiving Consequences
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                      <li>This associate will become active again</li>
                      <li>They will be available for new work orders</li>
                      <li>They will appear in active associate searches</li>
                      <li>All previous settings and data will be restored</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Associate Information */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Associate Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {associate.name ||
                        `${associate.firstName} ${associate.lastName}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {associate.email || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {associate.phone || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current Status
                    </dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <ArchiveBoxXMarkIcon className="w-3 h-3 mr-1" />
                        Archived
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Confirmation Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    UNARCHIVE
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type UNARCHIVE here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  This action will restore the associate to active status.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUnarchive}
                  disabled={submitting || confirmationText !== "UNARCHIVE"}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border rounded-lg text-base font-medium transition-colors ${
                    submitting || confirmationText !== "UNARCHIVE"
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "border-transparent text-white bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Unarchiving...
                    </>
                  ) : (
                    <>
                      <ArchiveBoxXMarkIcon className="w-5 h-5 mr-2" />
                      Unarchive Associate
                    </>
                  )}
                </button>

                <Link
                  to={`/admin/associate/${aid}/more`}
                  className="flex-1 sm:flex-none"
                >
                  <button
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!associate && !loading && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Associate Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Associates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateDetailMoreUnarchivePage;

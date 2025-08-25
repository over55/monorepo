// monorepo/web/workery-frontend/src/pages/Admin/Setting/Bulletin/Detail/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
import {
  NewspaperIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

function SettingBulletinDetailPage() {
  const { id } = useParams();
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Component state
  const [bulletin, setBulletin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletin details
  const loadBulletin = async () => {
    if (!id) {
      setError("Bulletin ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const bulletinData = await bulletinManager.getBulletinDetail(
        id,
        onUnauthorized,
      );

      setBulletin(bulletinData);
    } catch (err) {
      console.error("Failed to load bulletin:", err);
      setError(err.message || "Failed to load bulletin details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadBulletin();
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleDelete = async () => {
    if (!bulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.deleteBulletin(bulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin deleted successfully");
      setShowDeleteModal(false);

      // Redirect to list after deletion
      setTimeout(() => {
        navigate("/admin/settings/bulletins");
      }, 1000);
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!bulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.archiveBulletin(bulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin archived successfully");
      loadBulletin(); // Reload to show updated status
    } catch (err) {
      console.error("Failed to archive bulletin:", err);
      setError(err.message || "Failed to archive bulletin");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !bulletin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bulletin details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !bulletin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/settings/bulletins"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Bulletins
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
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
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings/bulletins"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <NewspaperIcon className="w-4 h-4 mr-2" />
                    Bulletins
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {bulletin && (
          <>
            {/* Main Details Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <NewspaperIcon className="w-6 h-6 mr-2" />
                  Bulletin Details
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/settings/bulletin/${bulletin.id}/update`)
                    }
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={handleArchive}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArchiveBoxIcon className="w-4 h-4 mr-1" />
                    Archive
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Bulletin Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Bulletin Text
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {bulletin.text}
                    </p>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Creation Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Creation Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Created At:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {bulletin.createdAt
                            ? new Date(bulletin.createdAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Created By:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {bulletin.createdByUserName || "System"}
                        </p>
                      </div>
                      {bulletin.createdFromIpAddress && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Created From IP:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {bulletin.createdFromIpAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modification Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Modification Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Modified At:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {bulletin.modifiedAt
                            ? new Date(bulletin.modifiedAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Modified By:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {bulletin.modifiedByUserName || "N/A"}
                        </p>
                      </div>
                      {bulletin.modifiedFromIpAddress && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Modified From IP:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {bulletin.modifiedFromIpAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <InformationCircleIcon className="w-4 h-4 mr-2" />
                      System Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">
                          Bulletin ID:
                        </span>
                        <p className="text-gray-900 mt-0.5">{bulletin.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Status:
                        </span>
                        <p className="mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              bulletin.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {bulletin.status === 1 ? "Active" : "Archived"}
                          </span>
                        </p>
                      </div>
                      {bulletin.howDidYouHearAboutUsText && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Source:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {bulletin.howDidYouHearAboutUsText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8">
              <Link
                to="/admin/settings/bulletins"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Bulletins List
              </Link>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Bulletin
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this bulletin? This action
                  cannot be undone.
                </p>
                {bulletin && (
                  <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Bulletin to be deleted:
                    </p>
                    <p className="text-sm text-gray-900">{bulletin.text}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Bulletin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingBulletinDetailPage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTagManager } from "../../../../../services/Services";
import {
  TagIcon,
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
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function SettingTagDetailPage() {
  const { id } = useParams();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tag, setTag] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTagDetail = async (tagId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const tagData = await tagManager.getTagDetail(tagId, onUnauthorized);

      setTag(tagData);

      console.log("TagDetailPage: Tag detail fetched successfully:", {
        id: tagData.id,
        text: tagData.text,
      });
    } catch (error) {
      console.error("TagDetailPage: Failed to fetch tag detail:", error);
      setErrors({
        fetch: error.message || "Failed to load tag details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);

    try {
      await tagManager.deleteTag(id, onUnauthorized);
      console.log("TagDetailPage: Tag deleted successfully");
      setSuccessMessage("Tag deleted successfully");
      setShowDeleteModal(false);

      // Redirect to list after deletion
      setTimeout(() => {
        navigate("/admin/settings/tags");
      }, 1000);
    } catch (error) {
      console.error("TagDetailPage: Failed to delete tag:", error);
      setErrors({ delete: error.message || "Failed to delete tag" });
      window.scrollTo(0, 0);
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!id || typeof id !== "string" || id.trim() === "") {
        setErrors({ tagId: "Invalid tag ID" });
        return;
      }

      fetchTagDetail(id);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (isLoading && !tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Tag Details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if ((errors.fetch || errors.tagId) && !tag) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {errors.fetch || errors.tagId}
          </div>
          <Link
            to="/admin/settings/tags"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Tags
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
                  to="/admin/settings/tags"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <TagIcon className="w-4 h-4 mr-2" />
                    Tags
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
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

        {errors.delete && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{errors.delete}</span>
            <button
              onClick={() => setErrors({ ...errors, delete: null })}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {tag && (
          <>
            {/* Main Details Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TagIcon className="w-6 h-6 mr-2" />
                  Tag Details
                </h1>
                <div className="flex items-center space-x-2">
                  <Link to={`/admin/settings/tag/${id}/update`}>
                    <button
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Tag Information Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Tag Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{tag.text || "N/A"}</p>
                      </div>
                    </div>

                    {tag.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {tag.description}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div>
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            tag.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tag.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information Grid */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    System Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Creation Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Creation Information
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">
                            Created At:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {tag.createdAt
                              ? new Date(tag.createdAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            Created By:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {tag.createdByUserName || "N/A"}
                          </p>
                        </div>
                        {tag.createdFromIpAddress && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Created From IP:
                            </span>
                            <p className="text-gray-900 mt-0.5">
                              {tag.createdFromIpAddress}
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
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">
                            Modified At:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {tag.modifiedAt
                              ? new Date(tag.modifiedAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            Modified By:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {tag.modifiedByUserName || "N/A"}
                          </p>
                        </div>
                        {tag.modifiedFromIpAddress && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Modified From IP:
                            </span>
                            <p className="text-gray-900 mt-0.5">
                              {tag.modifiedFromIpAddress}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    to="/admin/settings/tags"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to List
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="mt-8 bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  Additional Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-gray-500 mb-1">Tag ID:</p>
                    <p className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {tag.id}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 mb-1">
                      Current Status:
                    </p>
                    <p className="text-gray-900">
                      {tag.status === 1 ? (
                        <span className="flex items-center text-green-700">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Active - Available for use
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Inactive - Hidden from selections
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 mb-1">Usage:</p>
                    <p className="text-gray-900">
                      Tags help categorize and organize content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!tag && !isLoading && (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-8 text-center">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                Tag Not Found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                The requested tag could not be found.
              </p>
              <Link to="/admin/settings/tags">
                <button className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Tags List
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                  Confirm Deletion
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete the tag "
                  <strong>{tag?.text}</strong>"?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone and will permanently remove this
                  tag from the system.
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Deleting..." : "Confirm and Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingTagDetailPage;

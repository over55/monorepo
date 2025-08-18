// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTagManager } from "../../../../../services/Services";
import {
  TagIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

function SettingTagDeletePage() {
  const { id } = useParams();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tag, setTag] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTagDetail = async (tagId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const tagData = await tagManager.getTagDetail(tagId, onUnauthorized);

      setTag(tagData);

      console.log("TagDeletePage: Tag detail loaded for deletion:", {
        id: tagData.id,
        text: tagData.text,
      });
    } catch (error) {
      console.error("TagDeletePage: Failed to fetch tag detail:", error);
      setErrors({
        fetch: error.message || "Failed to load tag details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tag) return;

    // Require confirmation text
    if (confirmText.toLowerCase() !== "delete") {
      setErrors({ confirm: 'Please type "delete" to confirm' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await tagManager.deleteTag(id, onUnauthorized);

      console.log("TagDeletePage: Tag deleted successfully");

      // Show success message and redirect
      alert("Tag deleted successfully!");
      navigate("/admin/settings/tags");
    } catch (error) {
      console.error("TagDeletePage: Failed to delete tag:", error);
      setErrors({ delete: error.message || "Failed to delete tag" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/settings/tag/${id}/detail`);
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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Tag for Deletion...</p>
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
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/tag/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    Detail
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {tag && (
          <>
            {/* Warning Alert */}
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg flex items-start">
              <ShieldExclamationIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  WARNING: This action cannot be undone!
                </p>
                <p className="text-sm mt-1">
                  You are about to permanently delete this tag from the system.
                </p>
              </div>
            </div>

            {/* Main Delete Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
                  Delete Tag
                </h1>
              </div>

              <div className="p-6">
                {/* Error Messages */}
                {(errors.delete || errors.confirm) && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{errors.delete || errors.confirm}</span>
                    <button
                      onClick={() => setErrors({})}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Tag Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">
                    Tag to be deleted:
                  </h3>

                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text:
                      </label>
                      <div className="p-3 bg-white rounded border border-gray-300">
                        {tag.text || "N/A"}
                      </div>
                    </div>

                    {tag.description && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description:
                        </label>
                        <div className="p-3 bg-white rounded border border-gray-300">
                          {tag.description}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">ID:</span>{" "}
                        <span className="text-gray-900">{tag.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Status:
                        </span>{" "}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                            tag.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tag.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Created:
                        </span>{" "}
                        <span className="text-gray-900">
                          {tag.createdAt
                            ? new Date(tag.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <h4 className="text-base font-medium text-amber-800 mb-3 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Important Considerations
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-2 ml-7">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        This tag will be completely removed from the system
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Any content currently tagged with this tag may be
                        affected
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Historical records referencing this tag will still exist
                        but may show as "Deleted"
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        You will not be able to recover this tag once deleted
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Confirmation Section */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <h4 className="text-base font-medium text-red-700 mb-3 flex items-center">
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Confirmation Required
                  </h4>

                  <p className="text-sm text-gray-700 mb-3">
                    This action will permanently remove the tag from the system.
                    All associated data will be lost and cannot be recovered.
                  </p>

                  <p className="text-sm font-medium text-gray-900 mb-3">
                    To confirm deletion, please type{" "}
                    <code className="px-2 py-1 bg-gray-200 rounded text-red-600 font-mono">
                      delete
                    </code>{" "}
                    in the box below:
                  </p>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      // Clear confirmation error when typing
                      if (errors.confirm) {
                        setErrors({ ...errors, confirm: null });
                      }
                    }}
                    placeholder="Type 'delete' to confirm"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      confirmText.toLowerCase() === "delete"
                        ? "border-green-500 bg-green-50 focus:ring-green-500"
                        : "border-red-300 bg-red-50 focus:ring-red-500"
                    }`}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Alternative Actions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2" />
                    Consider These Alternatives:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1 ml-7">
                    <li>• Set the tag to "Inactive" instead of deleting it</li>
                    <li>• Edit the tag to update its text or description</li>
                    <li>
                      • Export or document the tag information before deletion
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <Link
                    to={`/admin/settings/tag/${id}/detail`}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back to Tag Detail
                  </Link>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    <Link to={`/admin/settings/tag/${id}/update`}>
                      <button
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                        Edit Instead
                      </button>
                    </Link>

                    <button
                      onClick={handleDeleteConfirm}
                      disabled={
                        isLoading || confirmText.toLowerCase() !== "delete"
                      }
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {isLoading ? "Deleting..." : "Delete Permanently"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information Card */}
            <div className="mt-8 bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  System Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-gray-500 mb-1 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Created At:
                    </p>
                    <p className="text-gray-900 ml-6">
                      {tag.createdAt
                        ? new Date(tag.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 mb-1 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Created By:
                    </p>
                    <p className="text-gray-900 ml-6">
                      {tag.createdByUserName || "N/A"}
                    </p>
                  </div>
                  {tag.modifiedAt && (
                    <div>
                      <p className="font-medium text-gray-500 mb-1 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Last Modified:
                      </p>
                      <p className="text-gray-900 ml-6">
                        {new Date(tag.modifiedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {tag.modifiedByUserName && (
                    <div>
                      <p className="font-medium text-gray-500 mb-1 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Modified By:
                      </p>
                      <p className="text-gray-900 ml-6">
                        {tag.modifiedByUserName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!tag && !isFetching && (
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

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="text-gray-700">Deleting tag...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingTagDeletePage;

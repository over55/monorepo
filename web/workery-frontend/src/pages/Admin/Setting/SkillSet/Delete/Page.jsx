// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSkillSetManager } from "../../../../../services/Services";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  PencilSquareIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function SettingSkillSetDeletePage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  // Component state
  const [skillSet, setSkillSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load skill set details
  const loadSkillSet = async () => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      setError("Invalid skill set ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const skillSetData = await skillSetManager.getSkillSetDetail(
        id,
        onUnauthorized,
      );

      setSkillSet(skillSetData);

      console.log("SkillSetDeletePage: Skill set detail loaded for deletion:", {
        id: skillSetData.id,
        category: skillSetData.category,
        subCategory: skillSetData.subCategory,
      });
    } catch (error) {
      console.error(
        "SkillSetDeletePage: Failed to fetch skill set detail:",
        error,
      );
      setError(error.message || "Failed to load skill set details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    window.scrollTo(0, 0);
    loadSkillSet();
  }, [id]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!skillSet) return;

    // Require confirmation text
    if (confirmText.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await skillSetManager.deleteSkillSet(skillSet.id, onUnauthorized);

      console.log("SkillSetDeletePage: Skill set deleted successfully");

      // Show success message and redirect
      alert("Skill set deleted successfully!");
      navigate("/admin/settings/skill-sets");
    } catch (error) {
      console.error("SkillSetDeletePage: Failed to delete skill set:", error);
      setError(error.message || "Failed to delete skill set");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/skill-set/${id}/detail`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skill set details...</p>
        </div>
      </div>
    );
  }

  // Error state (no skill set found)
  if (error && !skillSet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/settings/skill-sets"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Skill Sets
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
                  to="/admin/settings/skill-sets"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-2" />
                    Skill Sets
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/skill-set/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
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

        {skillSet && (
          <>
            {/* Warning Alert */}
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg flex items-start">
              <ShieldExclamationIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  WARNING: This action cannot be undone!
                </p>
                <p className="text-sm mt-1">
                  You are about to permanently delete this skill set from the
                  system.
                </p>
              </div>
            </div>

            {/* Main Delete Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
                  Delete Skill Set
                </h1>
              </div>

              <div className="p-6">
                {/* Error Messages */}
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

                {/* Skill Set Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">
                    Skill set to be deleted:
                  </h3>

                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category:
                        </label>
                        <div className="p-2 bg-white rounded border border-gray-300">
                          {skillSet.category}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sub-Category:
                        </label>
                        <div className="p-2 bg-white rounded border border-gray-300">
                          {skillSet.subCategory}
                        </div>
                      </div>
                    </div>

                    {skillSet.description && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description:
                        </label>
                        <div className="p-2 bg-white rounded border border-gray-300">
                          {skillSet.description}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">ID:</span>{" "}
                        <span className="text-gray-900">{skillSet.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Status:
                        </span>{" "}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-1 ${
                            skillSet.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {skillSet.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Insurance:
                        </span>{" "}
                        <span className="text-gray-900">
                          {skillSet.insuranceRequirement === 1 && "None"}
                          {skillSet.insuranceRequirement === 2 && "CGL"}
                          {skillSet.insuranceRequirement === 3 && "WSIB"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Important Considerations:
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1 ml-7">
                    <li>
                      • Any associates currently assigned to this skill set may
                      be affected
                    </li>
                    <li>
                      • Work orders that reference this skill set may lose this
                      requirement information
                    </li>
                    <li>
                      • Historical records referencing this skill set will still
                      exist but may show as "Deleted"
                    </li>
                    <li>
                      • You will not be able to recover this skill set once
                      deleted
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
                    This action will permanently remove the skill set from the
                    system. All associated data will be lost and cannot be
                    recovered.
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
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      confirmText.toLowerCase() === "delete"
                        ? "border-green-500 bg-green-50 focus:ring-green-500"
                        : "border-red-300 bg-red-50 focus:ring-red-500"
                    }`}
                    disabled={isDeleting}
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
                    <li>
                      • Set the skill set to "Inactive" instead of deleting it
                    </li>
                    <li>
                      • Edit the skill set to update its categories or
                      requirements
                    </li>
                    <li>
                      • Export or document the skill set information before
                      deletion
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <Link
                    to={`/admin/settings/skill-set/${id}/detail`}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back to Skill Set Detail
                  </Link>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isDeleting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/settings/skill-set/${id}/update`)
                      }
                      disabled={isDeleting}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Edit Instead
                    </button>

                    <button
                      onClick={handleDeleteConfirm}
                      disabled={
                        isDeleting || confirmText.toLowerCase() !== "delete"
                      }
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Permanently"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-gray-500 mb-1">
                      Created At:
                    </p>
                    <p className="text-gray-900">
                      {skillSet.createdAt
                        ? new Date(skillSet.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 mb-1">
                      Created By:
                    </p>
                    <p className="text-gray-900">
                      {skillSet.createdByUserName || "System"}
                    </p>
                  </div>
                  {skillSet.createdFromIpAddress && (
                    <div>
                      <p className="font-medium text-gray-500 mb-1">
                        Created From IP:
                      </p>
                      <p className="text-gray-900">
                        {skillSet.createdFromIpAddress}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-500 mb-1">
                      Last Modified:
                    </p>
                    <p className="text-gray-900">
                      {skillSet.modifiedAt
                        ? new Date(skillSet.modifiedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 mb-1">
                      Modified By:
                    </p>
                    <p className="text-gray-900">
                      {skillSet.modifiedByUserName || "N/A"}
                    </p>
                  </div>
                  {skillSet.modifiedFromIpAddress && (
                    <div>
                      <p className="font-medium text-gray-500 mb-1">
                        Modified From IP:
                      </p>
                      <p className="text-gray-900">
                        {skillSet.modifiedFromIpAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!skillSet && !isLoading && (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                Skill Set Not Found
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                The requested skill set could not be found.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/settings/skill-sets"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Skill Sets List
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="text-gray-700">Deleting skill set...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingSkillSetDeletePage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSkillSetManager } from "../../../../../services/Services";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

function SettingSkillSetDetailPage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  // Component state
  const [skillSet, setSkillSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      console.log(
        "SkillSetDetailPage: Skill set detail fetched successfully:",
        {
          id: skillSetData.id,
          category: skillSetData.category,
          subCategory: skillSetData.subCategory,
        },
      );
    } catch (error) {
      console.error(
        "SkillSetDetailPage: Failed to fetch skill set detail:",
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleDelete = async () => {
    if (!skillSet) return;

    try {
      setIsLoading(true);
      await skillSetManager.deleteSkillSet(skillSet.id, onUnauthorized);
      console.log("SkillSetDetailPage: Skill set deleted successfully");
      setSuccessMessage("Skill set deleted successfully");
      setShowDeleteModal(false);

      // Redirect to list after deletion
      setTimeout(() => {
        navigate("/admin/settings/skill-sets");
      }, 1000);
    } catch (error) {
      console.error("SkillSetDetailPage: Failed to delete skill set:", error);
      setError(error.message || "Failed to delete skill set");
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !skillSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skill set details...</p>
        </div>
      </div>
    );
  }

  // Error state
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

        {skillSet && (
          <>
            {/* Main Details Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2" />
                  Skill Set Details
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/settings/skill-set/${skillSet.id}/update`,
                      )
                    }
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                    Edit
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
                {/* Skill Set Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Skill Set Information
                  </h3>

                  {/* Category and Sub-Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Category
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {skillSet.category || "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Sub-Category
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {skillSet.subCategory || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {skillSet.description && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Description
                      </p>
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {skillSet.description}
                      </p>
                    </div>
                  )}

                  {/* Status and Insurance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">
                        Status:
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          skillSet.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {skillSet.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500 flex items-center">
                        <ShieldCheckIcon className="w-4 h-4 mr-1" />
                        Insurance:
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {skillSet.insuranceRequirement === 1 && "None"}
                        {skillSet.insuranceRequirement === 2 && "CGL"}
                        {skillSet.insuranceRequirement === 3 && "WSIB"}
                        {skillSet.insuranceRequirement > 3 && "Other"}
                      </span>
                    </div>
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
                          {skillSet.createdAt
                            ? new Date(skillSet.createdAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Created By:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {skillSet.createdByUserName || "System"}
                        </p>
                      </div>
                      {skillSet.createdFromIpAddress && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Created From IP:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {skillSet.createdFromIpAddress}
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
                          {skillSet.modifiedAt
                            ? new Date(skillSet.modifiedAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Modified By:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {skillSet.modifiedByUserName || "N/A"}
                        </p>
                      </div>
                      {skillSet.modifiedFromIpAddress && (
                        <div>
                          <span className="font-medium text-gray-500">
                            Modified From IP:
                          </span>
                          <p className="text-gray-900 mt-0.5">
                            {skillSet.modifiedFromIpAddress}
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
                          Skill Set ID:
                        </span>
                        <p className="text-gray-900 mt-0.5">{skillSet.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Insurance Type:
                        </span>
                        <p className="text-gray-900 mt-0.5">
                          {skillSet.insuranceRequirement === 1 &&
                            "None Required"}
                          {skillSet.insuranceRequirement === 2 &&
                            "Commercial General Liability"}
                          {skillSet.insuranceRequirement === 3 && "WSIB"}
                          {skillSet.insuranceRequirement > 3 && "Other"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Status:
                        </span>
                        <p className="mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              skillSet.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {skillSet.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8">
              <Link
                to="/admin/settings/skill-sets"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Skill Sets List
              </Link>
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && skillSet && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 mr-2 text-red-600" />
                  Delete Skill Set
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this skill set? This action
                  cannot be undone and will permanently remove this skill set
                  from the system.
                </p>
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Skill set to be deleted:
                  </p>
                  <p className="text-sm text-gray-900">
                    <strong>Category:</strong> {skillSet.category}
                  </p>
                  <p className="text-sm text-gray-900">
                    <strong>Sub-Category:</strong> {skillSet.subCategory}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Deleting..." : "Delete Skill Set"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingSkillSetDetailPage;

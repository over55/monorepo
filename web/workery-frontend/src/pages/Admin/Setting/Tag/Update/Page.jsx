// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTagManager } from "../../../../../services/Services";
import {
  TagIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  LightBulbIcon,
  SparklesIcon,
  KeyIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function SettingTagUpdatePage() {
  const { id } = useParams();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    text: "",
    description: "",
    status: 1,
  });

  // Store original data for comparison
  const [originalData, setOriginalData] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTagDetail = async (tagId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const tagData = await tagManager.getTagDetail(tagId, onUnauthorized);

      // Populate form fields
      const loadedData = {
        text: tagData.text || "",
        description: tagData.description || "",
        status: tagData.status || 1,
      };

      setFormData(loadedData);
      setOriginalData(loadedData);

      console.log("TagUpdatePage: Tag detail loaded for editing:", {
        id: tagData.id,
        text: tagData.text,
      });
    } catch (error) {
      console.error("TagUpdatePage: Failed to fetch tag detail:", error);
      setErrors({
        fetch: error.message || "Failed to load tag details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.text.trim()) {
      newErrors.text = "Tag text is required";
    } else if (formData.text.length > 100) {
      newErrors.text = "Tag text must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    if (!hasChanges) {
      setErrors({ submit: "No changes detected" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const tagData = {
        text: formData.text.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      console.log("TagUpdatePage: Submitting tag update:", tagData);

      await tagManager.updateTag(id, tagData, onUnauthorized);

      console.log("TagUpdatePage: Tag updated successfully");
      setSuccessMessage("Tag updated successfully!");
      setOriginalData(formData);
      setHasChanges(false);

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/tag/${id}/detail`);
      }, 1500);
    } catch (error) {
      console.error("TagUpdatePage: Failed to update tag:", error);
      setErrors({ submit: error.message || "Failed to update tag" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/tag/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/tag/${id}/detail`);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
    }
  };

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasFormChanges =
        formData.text !== originalData.text ||
        formData.description !== originalData.description ||
        formData.status !== originalData.status;

      setHasChanges(hasFormChanges);
    }
  }, [formData, originalData]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
          <p className="mt-4 text-gray-600">Loading Tag for Editing...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.fetch || errors.tagId) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
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
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Update
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <TagIcon className="w-7 h-7 mr-3" />
            Update Tag
          </h1>
          {hasChanges && (
            <div className="flex items-center text-amber-600 text-sm font-medium">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Unsaved changes
            </div>
          )}
        </div>

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

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{errors.submit}</span>
            <button
              onClick={() => setErrors({ ...errors, submit: null })}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className={isLoading ? "opacity-60" : ""}>
                  {/* Tag Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.text}
                      onChange={(e) =>
                        handleFieldChange("text", e.target.value)
                      }
                      placeholder="Enter tag text"
                      maxLength={100}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.text ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.text && (
                      <p className="mt-1 text-sm text-red-600">{errors.text}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.text.length}/100 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      placeholder="Enter description (optional)"
                      rows={4}
                      maxLength={500}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleFieldChange("status", parseInt(e.target.value))
                        }
                        disabled={isLoading}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.status ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value={1}>Active</option>
                        <option value={2}>Inactive</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.status}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Changing to "Inactive" will hide it from new selections
                    </p>
                  </div>

                  {/* Change Summary */}
                  {hasChanges && originalData && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        Changes Made
                      </h3>
                      <div className="space-y-1 text-xs">
                        {formData.text !== originalData.text && (
                          <div className="flex items-start">
                            <span className="text-gray-600 w-20">Text:</span>
                            <span className="text-gray-900">Modified</span>
                          </div>
                        )}
                        {formData.description !== originalData.description && (
                          <div className="flex items-start">
                            <span className="text-gray-600 w-20">
                              Description:
                            </span>
                            <span className="text-gray-900">Modified</span>
                          </div>
                        )}
                        {formData.status !== originalData.status && (
                          <div className="flex items-start">
                            <span className="text-gray-600 w-20">Status:</span>
                            <span className="text-gray-900">
                              {originalData.status === 1
                                ? "Active"
                                : "Inactive"}{" "}
                              → {formData.status === 1 ? "Active" : "Inactive"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {hasChanges ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading || !hasChanges}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-6">
            {/* Guidelines */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Guidelines
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <SparklesIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Choose a clear and descriptive text for the tag</span>
                  </li>
                  <li className="flex items-start">
                    <KeyIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      The text should be unique and easily recognizable
                    </span>
                  </li>
                  <li className="flex items-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Use the description to provide additional context or
                      details
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FolderIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Tags help categorize and organize content throughout the
                      system
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Changing the status to "Inactive" will hide it from new
                      selections
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Keep tag text concise for better usability</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Update Tips
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Consider the impact before changing tag text - it may
                      affect existing associations
                    </span>
                  </div>
                  <div className="flex items-start">
                    <ArrowPathIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Use the Reset button to quickly revert all changes
                    </span>
                  </div>
                  <div className="flex items-start">
                    <TagIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Inactive tags remain in the system but won't appear in new
                      selections
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/settings/tag/${id}/detail`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Tag Detail
          </Link>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="text-gray-700">Saving changes...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingTagUpdatePage;

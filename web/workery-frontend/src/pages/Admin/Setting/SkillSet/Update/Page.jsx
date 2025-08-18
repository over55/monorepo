// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSkillSetManager } from "../../../../../services/Services";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  LightBulbIcon,
  TagIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function SettingSkillSetUpdatePage() {
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    status: 1,
    insuranceRequirement: 1,
  });

  // Component state
  const [originalSkillSet, setOriginalSkillSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load skill set data
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

      setOriginalSkillSet(skillSetData);
      setFormData({
        category: skillSetData.category || "",
        subCategory: skillSetData.subCategory || "",
        description: skillSetData.description || "",
        status: skillSetData.status || 1,
        insuranceRequirement: skillSetData.insuranceRequirement || 1,
      });

      console.log("SkillSetUpdatePage: Skill set detail loaded for editing:", {
        id: skillSetData.id,
        category: skillSetData.category,
        subCategory: skillSetData.subCategory,
      });
    } catch (error) {
      console.error(
        "SkillSetUpdatePage: Failed to fetch skill set detail:",
        error,
      );
      setError(error.message || "Failed to load skill set details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadSkillSet();
  }, [id]);

  // Check for changes
  useEffect(() => {
    if (originalSkillSet) {
      const hasFormChanges =
        formData.category !== (originalSkillSet.category || "") ||
        formData.subCategory !== (originalSkillSet.subCategory || "") ||
        formData.description !== (originalSkillSet.description || "") ||
        formData.status !== (originalSkillSet.status || 1) ||
        formData.insuranceRequirement !==
          (originalSkillSet.insuranceRequirement || 1);

      setHasChanges(hasFormChanges);
    }
  }, [formData, originalSkillSet]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (formData.category.length > 127) {
      newErrors.category = "Category must be less than 127 characters";
    }

    if (!formData.subCategory.trim()) {
      newErrors.subCategory = "Sub-category is required";
    } else if (formData.subCategory.length > 127) {
      newErrors.subCategory = "Sub-category must be less than 127 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please correct the errors below");
      window.scrollTo(0, 0);
      return;
    }

    if (!hasChanges) {
      setError("No changes detected");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const skillSetData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        status: formData.status,
        insuranceRequirement: formData.insuranceRequirement,
      };

      console.log(
        "SkillSetUpdatePage: Submitting skill set update:",
        skillSetData,
      );

      const updatedSkillSet = await skillSetManager.updateSkillSet(
        id,
        skillSetData,
        onUnauthorized,
      );

      console.log("SkillSetUpdatePage: Skill set updated successfully");
      setSuccessMessage("Skill set updated successfully!");
      setOriginalSkillSet(updatedSkillSet);
      setHasChanges(false);

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/skill-set/${id}/detail`);
      }, 1500);
    } catch (error) {
      console.error("SkillSetUpdatePage: Failed to update skill set:", error);

      // Handle validation errors from server
      if (typeof error === "object" && error !== null) {
        setErrors(error);
        setError("Please correct the errors below");
      } else {
        setError(error.message || "Failed to update skill set");
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/skill-set/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/skill-set/${id}/detail`);
    }
  };

  const handleReset = () => {
    if (originalSkillSet) {
      setFormData({
        category: originalSkillSet.category || "",
        subCategory: originalSkillSet.subCategory || "",
        description: originalSkillSet.description || "",
        status: originalSkillSet.status || 1,
        insuranceRequirement: originalSkillSet.insuranceRequirement || 1,
      });
      setErrors({});
      setError(null);
    }
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

  // Error state
  if (error && !originalSkillSet) {
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
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Edit
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PencilSquareIcon className="w-7 h-7 mr-3" />
            Edit Skill Set
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

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Edit Form */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Update Skill Set
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className={isSaving ? "opacity-60" : ""}>
                {/* Category Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                    placeholder="e.g., Electrical, Plumbing, Carpentry"
                    disabled={isSaving}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                  <div className="mt-1 text-right">
                    <span
                      className={`text-xs ${formData.category.length > 100 ? "text-amber-600" : "text-gray-500"}`}
                    >
                      {formData.category.length}/127
                    </span>
                  </div>
                </div>

                {/* Sub-Category Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) =>
                      handleFieldChange("subCategory", e.target.value)
                    }
                    placeholder="e.g., Residential Wiring, Commercial Installation"
                    disabled={isSaving}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.subCategory ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.subCategory && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subCategory}
                    </p>
                  )}
                  <div className="mt-1 text-right">
                    <span
                      className={`text-xs ${formData.subCategory.length > 100 ? "text-amber-600" : "text-gray-500"}`}
                    >
                      {formData.subCategory.length}/127
                    </span>
                  </div>
                </div>

                {/* Description Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Provide additional context or requirements (optional)"
                    maxLength={500}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Optional - Add any special requirements
                    </p>
                    <span
                      className={`text-xs ${formData.description.length > 400 ? "text-amber-600" : "text-gray-500"}`}
                    >
                      {formData.description.length}/500
                    </span>
                  </div>
                </div>

                {/* Status Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleFieldChange("status", parseInt(e.target.value))
                    }
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                  </select>
                </div>

                {/* Insurance Requirement Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Requirement
                  </label>
                  <select
                    value={formData.insuranceRequirement}
                    onChange={(e) =>
                      handleFieldChange(
                        "insuranceRequirement",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>None</option>
                    <option value={2}>Commercial General Liability</option>
                    <option value={3}>WSIB</option>
                  </select>
                </div>

                {/* Change Summary */}
                {hasChanges && originalSkillSet && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      Change Summary
                    </h3>
                    <div className="space-y-2 text-xs">
                      {formData.category !== originalSkillSet.category && (
                        <div>
                          <span className="font-medium">Category:</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-gray-700">
                                {originalSkillSet.category}
                              </span>
                            </div>
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <span className="text-gray-900">
                                {formData.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {formData.subCategory !==
                        originalSkillSet.subCategory && (
                        <div>
                          <span className="font-medium">Sub-Category:</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-gray-700">
                                {originalSkillSet.subCategory}
                              </span>
                            </div>
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <span className="text-gray-900">
                                {formData.subCategory}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {formData.status !== originalSkillSet.status && (
                        <div>
                          <span className="font-medium">Status:</span>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                              <span className="text-gray-700">
                                {originalSkillSet.status === 1
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <span className="text-gray-900">
                                {formData.status === 1 ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Changes will affect all associates and jobs using this
                      skill set.
                    </span>
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between">
                  {hasChanges ? (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSaving}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-1" />
                      Reset
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      isSaving ||
                      !formData.category.trim() ||
                      !formData.subCategory.trim() ||
                      !hasChanges
                    }
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isSaving ? "Updating..." : "Update Skill Set"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Tips & Metadata */}
          <div className="space-y-6">
            {/* Best Practices */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Best Practices
                </h2>
              </div>
              <div className="p-5">
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <TagIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Keep category names consistent across related skills
                    </span>
                  </li>
                  <li className="flex items-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Update descriptions when requirements change</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Review insurance requirements periodically</span>
                  </li>
                  <li className="flex items-start">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Set to inactive instead of deleting if no longer needed
                    </span>
                  </li>
                  <li className="flex items-start">
                    <SparklesIcon className="w-4 h-4 mr-2 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Consider impact on existing assignments before changes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Metadata Information */}
            {originalSkillSet && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Skill Set Information
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {originalSkillSet.createdAt
                        ? new Date(originalSkillSet.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  {originalSkillSet.createdByUserName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created By:</span>
                      <span className="text-gray-900">
                        {originalSkillSet.createdByUserName}
                      </span>
                    </div>
                  )}
                  {originalSkillSet.modifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Modified:</span>
                      <span className="text-gray-900">
                        {new Date(originalSkillSet.modifiedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {originalSkillSet.modifiedByUserName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Modified By:</span>
                      <span className="text-gray-900">
                        {originalSkillSet.modifiedByUserName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Status:</span>
                    <span
                      className={`font-medium ${originalSkillSet.status === 1 ? "text-green-600" : "text-red-600"}`}
                    >
                      {originalSkillSet.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/settings/skill-set/${id}/detail`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Skill Set Detail
          </Link>
        </div>

        {/* Loading Overlay */}
        {isSaving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Updating skill set...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingSkillSetUpdatePage;

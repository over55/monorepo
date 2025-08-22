// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSkillSetManager } from "../../../../../services/Services";
import { InsuranceRequirementsMultiSelect } from "../../../../../components/business/selects";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function SettingSkillSetCreatePage() {
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields - Note: insuranceRequirements is now an array
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    status: 1, // Active by default - hidden from UI but sent to API
    insuranceRequirements: [], // Changed from single value to array
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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

    // Validate insurance requirements (optional, but if provided should be valid)
    if (
      formData.insuranceRequirements &&
      formData.insuranceRequirements.length > 0
    ) {
      // Check if all selected values are valid IDs
      const invalidIds = formData.insuranceRequirements.filter(
        (id) => !id || id === "" || id === "0",
      );
      if (invalidIds.length > 0) {
        newErrors.insuranceRequirements =
          "Invalid insurance requirements selected";
      }
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

    setIsLoading(true);
    setError(null);

    try {
      const skillSetData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        status: formData.status,
        insuranceRequirements: formData.insuranceRequirements, // Now sending array
      };

      console.log(
        "SkillSetCreatePage: Submitting skill set creation:",
        skillSetData,
      );

      const createdSkillSet = await skillSetManager.createSkillSet(
        skillSetData,
        onUnauthorized,
      );

      console.log("SkillSetCreatePage: Skill set created successfully");
      setSuccessMessage("Skill set created successfully!");

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/skill-set/${createdSkillSet.id}/detail`);
      }, 1500);
    } catch (error) {
      console.error("SkillSetCreatePage: Failed to create skill set:", error);

      // Handle validation errors from server
      if (typeof error === "object" && error !== null) {
        setErrors(error);
        setError("Please correct the errors below");
      } else {
        setError(error.message || "Failed to create skill set");
      }
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges =
      formData.category.trim() ||
      formData.subCategory.trim() ||
      formData.description.trim() ||
      formData.insuranceRequirements.length > 0;

    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate("/admin/settings/skill-sets");
      }
    } else {
      navigate("/admin/settings/skill-sets");
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
    }

    return () => {
      mounted = false;
    };
  }, []);

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
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AcademicCapIcon className="w-7 h-7 mr-3" />
            Create New Skill Set
          </h1>
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
          {/* Left Column - Create Form */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Skill Set Information
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className={isLoading ? "opacity-60" : ""}>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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

                {/* Insurance Requirements Multi-Select Field */}
                <InsuranceRequirementsMultiSelect
                  label="Insurance Requirements"
                  value={formData.insuranceRequirements}
                  onChange={(value) =>
                    handleFieldChange("insuranceRequirements", value)
                  }
                  error={errors.insuranceRequirements}
                  disabled={isLoading}
                  required={false}
                  placeholder="Select insurance requirements..."
                  helperText="Select one or more insurance requirements for this skill set"
                  onUnauthorized={onUnauthorized}
                />

                {/* Info Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Skill sets will be created as active and available for
                      selection when assigning to associates and job
                      requirements. Multiple insurance requirements can be
                      selected if needed.
                    </span>
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.category.trim() ||
                      !formData.subCategory.trim()
                    }
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Skill Set"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Guidelines & Tips */}
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
                    <span>Use clear, industry-standard category names</span>
                  </li>
                  <li className="flex items-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Keep sub-categories specific but not too narrow</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Select all applicable insurance requirements for the skill
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Add descriptions for skills requiring certifications
                    </span>
                  </li>
                  <li className="flex items-start">
                    <SparklesIcon className="w-4 h-4 mr-2 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span>Review existing skill sets to avoid duplicates</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Guidelines
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Categories
                    </h3>
                    <p>
                      Should represent broad skill areas like "Electrical",
                      "Plumbing", or "Carpentry".
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Sub-Categories
                    </h3>
                    <p>
                      More specific skills like "Residential Wiring" or
                      "Commercial Installation".
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Insurance Requirements
                    </h3>
                    <p>
                      Select all insurance types required for this skill set.
                      You can choose multiple requirements based on the risk
                      level and legal requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-2 flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                About Insurance Requirements
              </h3>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Multiple requirements can be selected</li>
                <li>
                  • Requirements are filtered dynamically from the backend
                </li>
                <li>• Use the search to find specific insurance types</li>
                <li>
                  • Selected requirements will apply to all associates with this
                  skill
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/skill-sets"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Skill Sets List
          </Link>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-gray-700">Creating skill set...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingSkillSetCreatePage;

// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Update/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
import {
  WrenchScrewdriverIcon,
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
  CalendarIcon,
  UserIcon,
  ClockIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import InsuranceRequirementsMultiSelect from "../../../../../components/business/selects/InsuranceRequirementsMultiSelect";

function SettingSkillSetUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const skillSetManager = useSkillSetManager();

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [skillSet, setSkillSet] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    insuranceRequirements: [], // This should be an array of IDs
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch skill set details
  const fetchSkillSetDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await skillSetManager.getSkillSetDetail(
        id,
        onUnauthorized,
      );

      setSkillSet(response);

      // Populate form with existing data
      // IMPORTANT: Extract just the IDs from insurance requirements
      const insuranceRequirementIds = response.insuranceRequirements
        ? response.insuranceRequirements.map((item) => {
            // Handle both object format and ID format
            if (typeof item === "object" && item !== null) {
              return item.id || item.value;
            }
            return item;
          })
        : [];

      setFormData({
        category: response.category || "",
        subCategory: response.subCategory || "",
        description: response.description || "",
        insuranceRequirements: insuranceRequirementIds, // Array of IDs only
      });
    } catch (err) {
      console.error("Failed to fetch skill set detail:", err);
      setError(err.message || "Failed to load skill set details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Check if form has changes compared to original data
      if (skillSet) {
        const originalInsuranceRequirementIds = skillSet.insuranceRequirements
          ? skillSet.insuranceRequirements.map((item) => {
              if (typeof item === "object" && item !== null) {
                return item.id || item.value;
              }
              return item;
            })
          : [];

        const originalData = {
          category: skillSet.category || "",
          subCategory: skillSet.subCategory || "",
          description: skillSet.description || "",
          insuranceRequirements: originalInsuranceRequirementIds,
        };

        const hasFormChanges =
          newData.category !== originalData.category ||
          newData.subCategory !== originalData.subCategory ||
          newData.description !== originalData.description ||
          JSON.stringify(newData.insuranceRequirements.sort()) !==
            JSON.stringify(originalData.insuranceRequirements.sort());

        setHasChanges(hasFormChanges);
      }

      return newData;
    });

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle insurance requirements change
  const handleInsuranceRequirementsChange = (selectedIds) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        insuranceRequirements: selectedIds, // This should already be an array of IDs
      };

      // Check if form has changes
      if (skillSet) {
        const originalInsuranceRequirementIds = skillSet.insuranceRequirements
          ? skillSet.insuranceRequirements.map((item) => {
              if (typeof item === "object" && item !== null) {
                return item.id || item.value;
              }
              return item;
            })
          : [];

        const originalData = {
          category: skillSet.category || "",
          subCategory: skillSet.subCategory || "",
          description: skillSet.description || "",
          insuranceRequirements: originalInsuranceRequirementIds,
        };

        const hasFormChanges =
          newData.category !== originalData.category ||
          newData.subCategory !== originalData.subCategory ||
          newData.description !== originalData.description ||
          JSON.stringify(newData.insuranceRequirements.sort()) !==
            JSON.stringify(originalData.insuranceRequirements.sort());

        setHasChanges(hasFormChanges);
      }

      return newData;
    });

    // Clear validation error
    if (validationErrors.insuranceRequirements) {
      setValidationErrors((prev) => ({
        ...prev,
        insuranceRequirements: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.category || !formData.category.trim()) {
      errors.category = "Category is required";
    } else if (formData.category.length > 100) {
      errors.category = "Category must be less than 100 characters";
    }

    if (!formData.subCategory || !formData.subCategory.trim()) {
      errors.subCategory = "Sub-category is required";
    } else if (formData.subCategory.length > 100) {
      errors.subCategory = "Sub-category must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please correct the errors below");
      return;
    }

    if (!hasChanges) {
      setError("No changes detected");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API - ensure insurance requirements are IDs only
      const submitData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim() || null,
        insuranceRequirements: formData.insuranceRequirements.filter(
          (id) => id,
        ), // Filter out any null/undefined values
      };

      await skillSetManager.updateSkillSet(id, submitData, onUnauthorized);

      setSuccessMessage("Skill set updated successfully!");

      setTimeout(() => {
        navigate(`/admin/settings/skill-set/${id}/detail`, {
          state: {
            successMessage: "Skill set updated successfully",
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Failed to update skill set:", err);

      if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to update skill set");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Your changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/skill-set/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/skill-set/${id}/detail`);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (skillSet) {
      // Extract IDs properly when resetting
      const insuranceRequirementIds = skillSet.insuranceRequirements
        ? skillSet.insuranceRequirements.map((item) => {
            if (typeof item === "object" && item !== null) {
              return item.id || item.value;
            }
            return item;
          })
        : [];

      setFormData({
        category: skillSet.category || "",
        subCategory: skillSet.subCategory || "",
        description: skillSet.description || "",
        insuranceRequirements: insuranceRequirementIds,
      });
      setValidationErrors({});
      setError(null);
      setHasChanges(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchSkillSetDetail();
    } else {
      setError("Invalid skill set ID");
      setIsLoading(false);
    }
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Error state (no data loaded)
  if (error && !skillSet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
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
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
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
                    {skillSet?.subCategory || "Detail"}
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
            <PencilSquareIcon className="w-7 h-7 mr-3 text-amber-600" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Edit Form (2 cols wide) */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentCheckIcon className="w-5 h-5 mr-2" />
                  Skill Set Information
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Category Field */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      maxLength={100}
                      placeholder="Enter category"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.category
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.category}
                      </p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.category.length > 80
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.category.length}/100 characters
                      </span>
                    </div>
                  </div>

                  {/* Sub-Category Field */}
                  <div>
                    <label
                      htmlFor="subCategory"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Sub-Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subCategory"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      maxLength={100}
                      placeholder="Enter sub-category"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.subCategory
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.subCategory && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.subCategory}
                      </p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.subCategory.length > 80
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.subCategory.length}/100 characters
                      </span>
                    </div>
                  </div>

                  {/* Insurance Requirements Multi-Select */}
                  <InsuranceRequirementsMultiSelect
                    label="Insurance Requirements"
                    value={formData.insuranceRequirements}
                    onChange={handleInsuranceRequirementsChange}
                    error={validationErrors.insuranceRequirements}
                    disabled={isSubmitting}
                    required={false}
                    placeholder="Select insurance requirements..."
                    helperText="Select all applicable insurance requirements for this skill set"
                    onUnauthorized={onUnauthorized}
                  />

                  {/* Description Field */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description{" "}
                      <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      placeholder="Enter description (optional)"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        validationErrors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.description}
                      </p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.description.length > 400
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.description.length}/500 characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    {hasChanges ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                        Reset Changes
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !hasChanges}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Update Skill Set
                      </>
                    )}
                  </button>
                </div>

                {!hasChanges && !isSubmitting && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500">
                      Make changes above to enable the update button
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - System Info & Tips */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Information */}
            {skillSet && (
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                    System Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Created At
                      </div>
                      <p className="text-gray-900 ml-5">
                        {skillSet.createdAt || "Not available"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Created By
                      </div>
                      <p className="text-gray-900 ml-5">
                        {skillSet.createdByUserName || "Not available"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Last Modified
                      </div>
                      <p className="text-gray-900 ml-5">
                        {skillSet.modifiedAt || "Never modified"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Modified By
                      </div>
                      <p className="text-gray-900 ml-5">
                        {skillSet.modifiedByUserName || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Guidelines
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Use clear, descriptive categories and sub-categories
                    </span>
                  </li>
                  <li className="flex items-start">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Select all relevant insurance requirements</span>
                  </li>
                  <li className="flex items-start">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Keep skill sets specific and actionable</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Review changes before saving</span>
                  </li>
                </ul>
              </div>
            </div>
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
      </div>
    </div>
  );
}

export default SettingSkillSetUpdatePage;

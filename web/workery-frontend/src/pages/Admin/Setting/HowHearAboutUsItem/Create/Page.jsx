// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Create/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import {
  MegaphoneIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  UsersIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

function SettingHowHearAboutUsItemCreatePage() {
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Form state
  const [formData, setFormData] = useState({
    sortNumber: 0,
    text: "",
    isForAssociate: false,
    isForCustomer: false,
    isForStaff: false,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle sortNumber as integer
    if (name === "sortNumber") {
      processedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    // Clear role validation error
    if (validationErrors.roles) {
      setValidationErrors((prev) => ({
        ...prev,
        roles: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate text (required, max length)
    if (!formData.text || !formData.text.trim()) {
      errors.text = "Text is required";
    } else if (formData.text.length > 255) {
      errors.text = "Text must be less than 255 characters";
    }

    // Validate sort number
    if (typeof formData.sortNumber !== "number" || formData.sortNumber < 0) {
      errors.sortNumber = "Sort number must be a positive number";
    }

    // Validate at least one role is selected
    if (
      !formData.isForAssociate &&
      !formData.isForCustomer &&
      !formData.isForStaff
    ) {
      errors.roles = "At least one role must be selected";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setError(null);
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please correct the errors below");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const submitData = {
        sortNumber: formData.sortNumber,
        text: formData.text.trim(),
        isForAssociate: formData.isForAssociate,
        isForCustomer: formData.isForCustomer,
        isForStaff: formData.isForStaff,
      };

      // Create how hear about us item
      const createdItem = await howHearAboutUsItemManager.create(
        submitData,
        onUnauthorized,
      );

      setSuccessMessage("How Hear About Us Item created successfully!");

      // Navigate to detail page with success message
      setTimeout(() => {
        navigate(
          `/admin/settings/how-hear-about-us-item/${createdItem.id}/detail`,
          {
            state: {
              successMessage: "How Hear About Us Item created successfully",
            },
          },
        );
      }, 1500);
    } catch (err) {
      console.error("Failed to create How Hear About Us Item:", err);

      // Handle validation errors from API
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
        setError("Please correct the errors below and try again.");
      } else if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to create item");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      formData.text ||
      formData.sortNumber !== 0 ||
      formData.isForAssociate ||
      formData.isForCustomer ||
      formData.isForStaff
    ) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Your changes will be lost.",
        )
      ) {
        navigate("/admin/settings/how-hear-about-us-items");
      }
    } else {
      navigate("/admin/settings/how-hear-about-us-items");
    }
  };

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
                  to="/admin/settings/how-hear-about-us-items"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <MegaphoneIcon className="w-4 h-4 mr-2" />
                    How Hear About Us Items
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MegaphoneIcon className="w-7 h-7 mr-3 text-blue-600" />
            Create How Hear About Us Item
          </h1>
        </div>

        {/* Success Message */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
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
          {/* Left Column - Form (2 cols wide) */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentCheckIcon className="w-5 h-5 mr-2" />
                  Item Information
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Sort Number Field */}
                  <div>
                    <label
                      htmlFor="sortNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Sort Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="sortNumber"
                      name="sortNumber"
                      value={formData.sortNumber}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Enter sort number (e.g., 1, 2, 3...)"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.sortNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.sortNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.sortNumber}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Lower numbers appear first in lists
                    </p>
                  </div>

                  {/* Text Field */}
                  <div>
                    <label
                      htmlFor="text"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="text"
                      name="text"
                      value={formData.text}
                      onChange={handleInputChange}
                      maxLength={255}
                      placeholder="Enter the display text (e.g., 'Google Search', 'Referral from friend')"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.text
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.text && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.text}
                      </p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.text.length > 200
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.text.length}/255 characters
                      </span>
                    </div>
                  </div>

                  {/* Role Configuration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Configuration <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select which user roles can use this option
                    </p>
                    {validationErrors.roles && (
                      <p className="mb-2 text-sm text-red-600">
                        {validationErrors.roles}
                      </p>
                    )}

                    <div className="space-y-3">
                      {/* Associate Checkbox */}
                      <label
                        className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.isForAssociate
                            ? "bg-green-50 border-green-500"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.isForAssociate}
                          onChange={() =>
                            handleCheckboxChange("isForAssociate")
                          }
                          disabled={isSubmitting}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <BriefcaseIcon className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900">
                              For Associates
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Associates can select this option when registering
                          </p>
                        </div>
                      </label>

                      {/* Customer Checkbox */}
                      <label
                        className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.isForCustomer
                            ? "bg-green-50 border-green-500"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.isForCustomer}
                          onChange={() => handleCheckboxChange("isForCustomer")}
                          disabled={isSubmitting}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <UsersIcon className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900">
                              For Customers
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Customers can select this option when registering
                          </p>
                        </div>
                      </label>

                      {/* Staff Checkbox */}
                      <label
                        className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.isForStaff
                            ? "bg-green-50 border-green-500"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.isForStaff}
                          onChange={() => handleCheckboxChange("isForStaff")}
                          disabled={isSubmitting}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">
                              For Staff
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Staff can select this option when creating records
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preview Section */}
                  {formData.text && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                        <InformationCircleIcon className="w-4 h-4 mr-2" />
                        Preview
                      </h3>
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <p className="text-xs text-gray-600 mb-2">
                          How this will appear in forms:
                        </p>
                        <label className="flex items-center">
                          <input type="radio" disabled className="mr-2" />
                          <span className="text-sm text-gray-900">
                            {formData.text}
                          </span>
                        </label>
                      </div>
                      <div className="mt-2 text-xs text-blue-700">
                        Sort order: {formData.sortNumber} | Available for:{" "}
                        {[
                          formData.isForAssociate && "Associates",
                          formData.isForCustomer && "Customers",
                          formData.isForStaff && "Staff",
                        ]
                          .filter(Boolean)
                          .join(", ") || "None"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Create Item
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Help & Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Examples */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-green-600" />
                  Common Examples
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Google Search</span>
                  </li>
                  <li className="flex items-start">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Referral from friend</span>
                  </li>
                  <li className="flex items-start">
                    <GlobeAltIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Social Media</span>
                  </li>
                  <li className="flex items-start">
                    <NewspaperIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Newspaper Advertisement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Guidelines
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    Create clear, specific options that help track marketing
                    effectiveness.
                  </p>
                  <p>
                    Use consistent terminology that's easy for users to
                    understand.
                  </p>
                  <p>
                    Assign appropriate sort numbers to control the display order
                    in dropdown lists.
                  </p>
                  <p>
                    Select the appropriate user roles to ensure the option
                    appears for the right audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/how-hear-about-us-items"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to How Hear About Us Items
          </Link>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Creating How Hear About Us Item...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we save your changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemCreatePage;

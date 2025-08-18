import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
import {
  NewspaperIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function SettingBulletinCreatePage() {
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    text: "",
    status: 1, // Default to active - hidden but always set
  });

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate text (required)
    if (!formData.text.trim()) {
      newErrors.text = "Bulletin text is required";
    } else if (formData.text.length > 1000) {
      newErrors.text = "Bulletin text must be less than 1000 characters";
    }

    // Status is always set to 1 (Active) so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please correct the errors below");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare submission data
      const submissionData = {
        text: formData.text.trim(),
        status: parseInt(formData.status), // Always 1 (Active)
      };

      // Create bulletin
      const createdBulletin = await bulletinManager.createBulletin(
        submissionData,
        onUnauthorized,
      );

      setSuccessMessage("Bulletin created successfully!");

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/bulletin/${createdBulletin.id}/detail`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create bulletin:", err);

      // Handle validation errors from server
      if (typeof err === "object" && err !== null) {
        setErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to create bulletin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (formData.text.trim()) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate("/admin/settings/bulletins");
      }
    } else {
      navigate("/admin/settings/bulletins");
    }
  };

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
            <NewspaperIcon className="w-7 h-7 mr-3" />
            Create New Bulletin
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
            <span>{error}</span>
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
          {/* Left Column - Create Widget */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Compose Bulletin
              </h2>
            </div>

            <div className="p-5">
              <div className={isLoading ? "opacity-60" : ""}>
                {/* Bulletin Text */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulletin Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={1000}
                    placeholder="Type your bulletin message here..."
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.text ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.text && (
                    <p className="mt-1 text-sm text-red-600">{errors.text}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Keep it short and clear
                    </p>
                    <p
                      className={`text-sm ${
                        formData.text.length > 280
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.text.length}/1000
                    </p>
                  </div>
                </div>

                {/* Info Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Bulletin will be active and visible to all users
                      immediately after creation.
                    </span>
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.text.trim()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Bulletin"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tips & Guidelines */}
          <div className="space-y-6">
            {/* Writing Tips */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Writing Tips
                </h2>
              </div>
              <div className="p-5">
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <SparklesIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Keep under 280 characters for best impact</span>
                  </li>
                  <li className="flex items-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use clear, simple language</span>
                  </li>
                  <li className="flex items-start">
                    <ClockIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Include dates and deadlines</span>
                  </li>
                  <li className="flex items-start">
                    <UsersIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Make it relevant to all users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Proofread before publishing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/bulletins"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Bulletins List
          </Link>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-gray-700">Creating bulletin...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingBulletinCreatePage;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
import {
  NewspaperIcon,
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
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function SettingBulletinUpdatePage() {
  const { id } = useParams();
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    text: "",
    status: 1, // Always active - hidden from UI
  });

  // Component state
  const [originalBulletin, setOriginalBulletin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletin data
  const loadBulletin = async () => {
    if (!id) {
      setError("Bulletin ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const bulletinData = await bulletinManager.getBulletinDetail(
        id,
        onUnauthorized,
      );

      setOriginalBulletin(bulletinData);
      setFormData({
        text: bulletinData.text || "",
        status: bulletinData.status || 1,
      });
    } catch (err) {
      console.error("Failed to load bulletin:", err);
      setError(err.message || "Failed to load bulletin details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadBulletin();
  }, [id]);

  // Check for changes
  useEffect(() => {
    if (originalBulletin) {
      const hasFormChanges =
        formData.text !== (originalBulletin.text || "") ||
        formData.status !== (originalBulletin.status || 1);

      setHasChanges(hasFormChanges);
    }
  }, [formData, originalBulletin]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please correct the errors below");
      return;
    }

    if (!hasChanges) {
      setError("No changes detected");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Prepare submission data
      const submissionData = {
        id: id,
        text: formData.text.trim(),
        status: parseInt(formData.status),
      };

      // Update bulletin
      const updatedBulletin = await bulletinManager.updateBulletin(
        id,
        submissionData,
        onUnauthorized,
      );

      setSuccessMessage("Bulletin updated successfully!");
      setOriginalBulletin(updatedBulletin);
      setHasChanges(false);

      // Optionally redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/bulletin/${id}/detail`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update bulletin:", err);

      // Handle validation errors from server
      if (typeof err === "object" && err !== null) {
        setErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to update bulletin");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/bulletin/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/bulletin/${id}/detail`);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (originalBulletin) {
      setFormData({
        text: originalBulletin.text || "",
        status: originalBulletin.status || 1,
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
          <p className="mt-4 text-gray-600">Loading bulletin details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !originalBulletin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/settings/bulletins"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Bulletins
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
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/bulletin/${id}/detail`}
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
            Edit Bulletin
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
          {/* Left Column - Edit Widget */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Update Bulletin
              </h2>
            </div>

            <div className="p-5">
              <div className={isSaving ? "opacity-60" : ""}>
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
                    disabled={isSaving}
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

                {/* Change Summary */}
                {hasChanges && originalBulletin && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      Change Summary
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Original:
                        </p>
                        <div className="p-2 bg-red-50 rounded border border-red-200 text-xs italic text-gray-700">
                          {originalBulletin.text}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          New:
                        </p>
                        <div className="p-2 bg-green-50 rounded border border-green-200 text-xs text-gray-900">
                          {formData.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Changes will be visible to all users immediately after
                      updating.
                    </span>
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between">
                  {hasChanges ? (
                    <button
                      onClick={handleReset}
                      disabled={isSaving}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-1" />
                      Reset
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving || !formData.text.trim() || !hasChanges}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isSaving ? "Updating..." : "Update Bulletin"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tips & Metadata */}
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

            {/* Metadata Information */}
            {originalBulletin && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Bulletin Information
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {originalBulletin.createdAt
                        ? new Date(originalBulletin.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created By:</span>
                    <span className="text-gray-900">
                      {originalBulletin.createdByUserName || "System"}
                    </span>
                  </div>
                  {originalBulletin.modifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Modified:</span>
                      <span className="text-gray-900">
                        {new Date(originalBulletin.modifiedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {originalBulletin.modifiedByUserName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Modified By:</span>
                      <span className="text-gray-900">
                        {originalBulletin.modifiedByUserName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/settings/bulletin/${id}/detail`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Bulletin Detail
          </Link>
        </div>

        {/* Loading Overlay */}
        {isSaving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Updating bulletin...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingBulletinUpdatePage;

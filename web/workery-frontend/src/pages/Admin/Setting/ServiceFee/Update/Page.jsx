import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import {
  CreditCardIcon,
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
  LightBulbIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";

function SettingServiceFeeUpdatePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [serviceFee, setServiceFee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
  });

  // Component state
  const [originalData, setOriginalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchServiceFeeDetail = async () => {
    if (!id) {
      setGeneralError("Service fee ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await serviceFeeManager.getServiceFeeDetail(
        id,
        onUnauthorized,
      );

      setServiceFee(response);
      setOriginalData(response);

      setFormData({
        name: response.name || "",
        description: response.description || "",
        percentage: response.percentage || "",
      });
    } catch (err) {
      console.error("Failed to fetch service fee detail:", err);
      setGeneralError(err.message || "Failed to load service fee details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceFeeDetail();
  }, [id]);

  // Check for changes
  useEffect(() => {
    if (!originalData) {
      setHasChanges(false);
      return;
    }

    const changed =
      formData.name !== (originalData.name || "") ||
      formData.description !== (originalData.description || "") ||
      String(formData.percentage) !== String(originalData.percentage || "");

    setHasChanges(changed);
  }, [formData, originalData]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Service fee name is required";
    } else if (formData.name.length > 127) {
      newErrors.name = "Name must be less than 127 characters";
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Percentage validation
    if (String(formData.percentage).trim() === "") {
      newErrors.percentage = "Percentage is required.";
    } else {
      const percentageValue = parseFloat(formData.percentage);
      if (
        isNaN(percentageValue) ||
        percentageValue < 0 ||
        percentageValue > 100
      ) {
        newErrors.percentage = "Percentage must be a number between 0 and 100.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneralError(validationErrors.general || null);
      return;
    }

    if (!hasChanges) {
      setGeneralError("No changes detected");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        percentage: parseFloat(formData.percentage),
      };

      const response = await serviceFeeManager.updateServiceFee(
        id,
        submitData,
        onUnauthorized,
      );

      setSuccessMessage("Service fee updated successfully!");
      setOriginalData(response);

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/service-fee/${id}/detail`, {
          state: { successMessage: "Service fee updated successfully" },
        });
      }, 1500);
    } catch (err) {
      console.error("Failed to update service fee:", err);

      if (typeof err === "object" && err !== null) {
        setErrors(err);
        setGeneralError(
          err.general || err.message || "Failed to update service fee",
        );
      } else {
        setGeneralError(err || "Failed to update service fee");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear related errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate(`/admin/settings/service-fee/${id}/detail`);
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate(`/admin/settings/service-fee/${id}/detail`);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.name || "",
        description: originalData.description || "",
        percentage: originalData.percentage || "",
      });
      setErrors({});
      setGeneralError(null);
    }
  };

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
          <p className="mt-4 text-gray-600">Loading service fee details...</p>
        </div>
      </div>
    );
  }

  // Error state (no data loaded)
  if (generalError && !serviceFee) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {generalError}
            </div>
          </div>
          <Link
            to="/admin/settings/service-fees"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Service Fees
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
                  to="/admin/settings/service-fees"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Service Fees
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/service-fee/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                    {serviceFee?.name || "Detail"}
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
            Edit Service Fee
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

        {generalError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {generalError}
            </span>
            <button
              onClick={() => setGeneralError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Edit Form (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentCheckIcon className="w-5 h-5 mr-2" />
                  Basic Information
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Service Fee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      maxLength={127}
                      placeholder="Enter service fee name"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.name.length > 100
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.name.length}/127 characters
                      </span>
                    </div>
                  </div>

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
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      maxLength={500}
                      placeholder="Enter optional description"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
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
            </div>

            {/* Rate Configuration Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Rate Configuration
                </h2>
              </div>

              <div className="p-6">
                {/* Instructions */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Rate Configuration:</strong> Set the service fee
                      as a percentage of the transaction amount.
                    </span>
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Percentage Input Field */}
                  <div>
                    <label
                      htmlFor="percentage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="flex items-center">
                        <PercentBadgeIcon className="w-4 h-4 mr-2" />
                        Percentage Rate (%)
                      </span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      id="percentage"
                      name="percentage"
                      value={formData.percentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          handleInputChange("percentage", value);
                        }
                      }}
                      placeholder="Enter percentage (e.g., 2.5)"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.percentage ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {errors.percentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.percentage}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a value between 0 and 100. Example: 2.5 for 2.5%
                    </p>
                  </div>

                  {/* Rate Preview */}
                  {formData.percentage !== "" &&
                    !isNaN(parseFloat(formData.percentage)) && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                          <CalculatorIcon className="w-4 h-4 mr-2" />
                          Updated Rate Preview
                        </h3>
                        <div>
                          <p className="text-sm text-green-700">
                            This service fee will charge{" "}
                            <strong>{formData.percentage}%</strong> of the
                            transaction amount.
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            Example: On a $100 transaction, the fee would be $
                            {(
                              (100 * parseFloat(formData.percentage)) /
                              100
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Change Summary */}
                  {hasChanges && originalData && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Change Summary
                      </h3>
                      <div className="space-y-3 text-sm">
                        {formData.name !== originalData.name && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Name:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-50 rounded border border-red-200">
                                <span className="text-xs text-gray-600">
                                  Original:
                                </span>
                                <p className="text-gray-900">
                                  {originalData.name}
                                </p>
                              </div>
                              <div className="p-2 bg-green-50 rounded border border-green-200">
                                <span className="text-xs text-gray-600">
                                  New:
                                </span>
                                <p className="text-gray-900">{formData.name}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {formData.description !== originalData.description && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Description:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-50 rounded border border-red-200">
                                <span className="text-xs text-gray-600">
                                  Original:
                                </span>
                                <p className="text-gray-900">
                                  {originalData.description || (
                                    <span className="italic text-gray-400">
                                      Empty
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="p-2 bg-green-50 rounded border border-green-200">
                                <span className="text-xs text-gray-600">
                                  New:
                                </span>
                                <p className="text-gray-900">
                                  {formData.description || (
                                    <span className="italic text-gray-400">
                                      Empty
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {String(formData.percentage) !==
                          String(originalData.percentage || "") && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Percentage:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-50 rounded border border-red-200">
                                <span className="text-xs text-gray-600">
                                  Original:
                                </span>
                                <p className="text-gray-900">
                                  {originalData.percentage != null
                                    ? `${originalData.percentage}%`
                                    : "Not set"}
                                </p>
                              </div>
                              <div className="p-2 bg-green-50 rounded border border-green-200">
                                <span className="text-xs text-gray-600">
                                  New:
                                </span>
                                <p className="text-gray-900">
                                  {formData.percentage !== ""
                                    ? `${formData.percentage}%`
                                    : "Not set"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                        Update Service Fee
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
            {serviceFee && (
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
                        {serviceFee.createdAt
                          ? new Date(serviceFee.createdAt).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                    {serviceFee.createdByUserName && (
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <UserIcon className="w-4 h-4 mr-1" />
                          Created By
                        </div>
                        <p className="text-gray-900 ml-5">
                          {serviceFee.createdByUserName}
                        </p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Last Modified
                      </div>
                      <p className="text-gray-900 ml-5">
                        {serviceFee.modifiedAt
                          ? new Date(serviceFee.modifiedAt).toLocaleString()
                          : "Never modified"}
                      </p>
                    </div>
                    {serviceFee.modifiedByUserName && (
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <UserIcon className="w-4 h-4 mr-1" />
                          Modified By
                        </div>
                        <p className="text-gray-900 ml-5">
                          {serviceFee.modifiedByUserName}
                        </p>
                      </div>
                    )}
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
                    <span>Use clear names that identify the fee purpose</span>
                  </li>
                  <li className="flex items-start">
                    <CalculatorIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Consider customer impact when adjusting rates</span>
                  </li>
                  <li className="flex items-start">
                    <CreditCardIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Review rate changes before implementation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Test changes in a staging environment first</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/settings/service-fee/${id}/detail`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Service Fee Detail
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
                    Updating Service Fee...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we save your changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-600" />
                  Unsaved Changes
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  You have unsaved changes that will be lost if you leave this
                  page.
                </p>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-amber-800">
                        <strong>Current changes will be discarded:</strong>
                      </p>
                      <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                        {formData.name !== originalData?.name && (
                          <li>Service fee name changed</li>
                        )}
                        {formData.description !== originalData?.description && (
                          <li>Description changed</li>
                        )}
                        {String(formData.percentage) !==
                          String(originalData?.percentage || "") && (
                          <li>Percentage changed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Are you sure you want to cancel and lose these changes?
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Continue Editing
                </button>
                <button
                  onClick={confirmCancel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingServiceFeeUpdatePage;

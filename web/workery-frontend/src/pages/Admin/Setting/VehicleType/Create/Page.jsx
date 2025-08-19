// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Create/Page.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import {
  TruckIcon,
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
  RectangleStackIcon,
  CubeIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function SettingVehicleTypeCreatePage() {
  const navigate = useNavigate();
  const vehicleTypeManager = useVehicleTypeManager();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: 1, // Active by default
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate name (required, max length)
    if (!formData.name || !formData.name.trim()) {
      errors.name = "Vehicle type name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Vehicle type name must be less than 100 characters";
    }

    // Validate description (optional, max length)
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
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
      window.scrollTo(0, 0);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const vehicleTypeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      console.log(
        "VehicleTypeCreatePage: Submitting vehicle type creation:",
        vehicleTypeData,
      );

      // Create vehicle type
      const createdVehicleType = await vehicleTypeManager.createVehicleType(
        vehicleTypeData,
        onUnauthorized,
      );

      console.log("VehicleTypeCreatePage: Vehicle type created successfully");
      setSuccessMessage("Vehicle type created successfully!");

      // Navigate to detail page with success message
      setTimeout(() => {
        navigate(
          `/admin/settings/vehicle-type/${createdVehicleType.id}/detail`,
          {
            state: {
              successMessage: "Vehicle type created successfully",
            },
          },
        );
      }, 1500);
    } catch (err) {
      console.error(
        "VehicleTypeCreatePage: Failed to create vehicle type:",
        err,
      );

      // Handle validation errors from API
      if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to create vehicle type");
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (formData.name || formData.description) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Your changes will be lost.",
        )
      ) {
        navigate("/admin/settings/vehicle-types");
      }
    } else {
      navigate("/admin/settings/vehicle-types");
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
                  to="/admin/settings/vehicle-types"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Vehicle Types
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
            <TruckIcon className="w-7 h-7 mr-3 text-blue-600" />
            Create Vehicle Type
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
                  Vehicle Type Information
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
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={100}
                      placeholder="Enter vehicle type name"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.name
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.name}
                      </p>
                    )}
                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          formData.name.length > 80
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.name.length}/100 characters
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

                  {/* Info Note */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start">
                      <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Vehicle types help categorize and
                        organize associate vehicles in the system.
                      </span>
                    </p>
                  </div>
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
                        Create Vehicle Type
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
                    <RectangleStackIcon className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Sedan</span>
                  </li>
                  <li className="flex items-start">
                    <TruckIcon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Pickup Truck</span>
                  </li>
                  <li className="flex items-start">
                    <CubeIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Van</span>
                  </li>
                  <li className="flex items-start">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Service Vehicle</span>
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
                    Choose a clear and descriptive name for the vehicle type.
                  </p>
                  <p>The name should be unique and easily recognizable.</p>
                  <p>
                    Use the description to provide additional context or
                    details.
                  </p>
                  <p>
                    Vehicle types help categorize and organize associate
                    vehicles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/settings/vehicle-types"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Vehicle Types
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
                    Creating Vehicle Type...
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

export default SettingVehicleTypeCreatePage;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import {
  CalendarDaysIcon,
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
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  BriefcaseIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const REASON_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 2, label: "Going on vacation" },
  { value: 3, label: "Personal reasons" },
  { value: 4, label: "Commercial insurance expired" },
  { value: 5, label: "Policy check expired" },
  { value: 6, label: "Auto Insurance Expired" },
  { value: 7, label: "WSIB Expired" },
  { value: 8, label: "Dues Date Expired" },
  { value: 1, label: "Other" },
];

const UNTIL_FURTHER_NOTICE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

function SettingAssociateAwayLogUpdatePage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    associateId: "",
    reason: "",
    reasonOther: "",
    untilFurtherNotice: "",
    untilDate: "",
    startDate: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState(null);

  // Associates for selection
  const [associates, setAssociates] = useState([]);
  const [loadingAssociates, setLoadingAssociates] = useState(true);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associates for selection
  const fetchAssociates = async () => {
    try {
      setLoadingAssociates(true);
      const response = await associateManager.getAssociates(
        { limit: 1000, status: 1 }, // Get active associates
        onUnauthorized,
      );
      setAssociates(response.results || []);
    } catch (err) {
      console.error("Failed to fetch associates:", err);
      setError("Failed to load associates");
    } finally {
      setLoadingAssociates(false);
    }
  };

  // Fetch associate away log data
  const fetchAssociateAwayLogData = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const response = await associateAwayLogManager.getAssociateAwayLogDetail(
        id,
        onUnauthorized,
      );

      // Format dates for input fields
      const formattedData = {
        associateId: response.associateId?.toString() || "",
        reason: response.reason?.toString() || "",
        reasonOther: response.reasonOther || "",
        untilFurtherNotice: response.untilFurtherNotice?.toString() || "",
        untilDate: response.untilDate
          ? formatDateForInput(response.untilDate)
          : "",
        startDate: response.startDate
          ? formatDateForInput(response.startDate)
          : "",
      };

      setFormData(formattedData);
      setOriginalData(response);
    } catch (err) {
      console.error("Failed to fetch associate away log data:", err);
      setError(err.message || "Failed to load associate away log data");
    } finally {
      setInitialLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.associateId) {
      errors.associateId = "Associate is required";
    }

    if (!formData.reason) {
      errors.reason = "Reason is required";
    }

    if (formData.reason === "1" && !formData.reasonOther?.trim()) {
      errors.reasonOther = "Please specify the reason";
    }

    if (!formData.untilFurtherNotice) {
      errors.untilFurtherNotice =
        "Please specify if this is until further notice";
    }

    if (formData.untilFurtherNotice === "2" && !formData.untilDate) {
      errors.untilDate = "Until date is required when not until further notice";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    // Validate dates
    if (formData.startDate && formData.untilDate) {
      const startDate = new Date(formData.startDate);
      const untilDate = new Date(formData.untilDate);

      if (untilDate <= startDate) {
        errors.untilDate = "Until date must be after start date";
      }
    }

    return errors;
  };

  // Check if form has changes
  useEffect(() => {
    if (originalData) {
      const changed =
        formData.associateId !== originalData.associateId?.toString() ||
        formData.reason !== originalData.reason?.toString() ||
        formData.reasonOther !== (originalData.reasonOther || "") ||
        formData.untilFurtherNotice !==
          originalData.untilFurtherNotice?.toString() ||
        formData.untilDate !==
          (originalData.untilDate
            ? formatDateForInput(originalData.untilDate)
            : "") ||
        formData.startDate !==
          (originalData.startDate
            ? formatDateForInput(originalData.startDate)
            : "");

      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are changes
    if (!hasChanges) {
      setError("No changes detected");
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFormErrors({});

      // Prepare data for API
      const submitData = {
        associateId: parseInt(formData.associateId),
        reason: parseInt(formData.reason),
        reasonOther: formData.reasonOther?.trim() || "",
        untilFurtherNotice: parseInt(formData.untilFurtherNotice),
        untilDate:
          formData.untilFurtherNotice === "2" ? formData.untilDate : "",
        startDate: formData.startDate,
      };

      await associateAwayLogManager.updateAssociateAwayLogModern(
        id,
        submitData,
        onUnauthorized,
      );

      setSuccess("Associate away log updated successfully!");

      // Navigate back to detail page after short delay
      setTimeout(() => {
        navigate(`/admin/settings/associate-away-log/${id}/detail`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update associate away log:", err);

      if (err && typeof err === "object") {
        // Handle validation errors from API
        setFormErrors(err);
      } else {
        setError(err.message || "Failed to update associate away log");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (originalData) {
      setFormData({
        associateId: originalData.associateId?.toString() || "",
        reason: originalData.reason?.toString() || "",
        reasonOther: originalData.reasonOther || "",
        untilFurtherNotice: originalData.untilFurtherNotice?.toString() || "",
        untilDate: originalData.untilDate
          ? formatDateForInput(originalData.untilDate)
          : "",
        startDate: originalData.startDate
          ? formatDateForInput(originalData.startDate)
          : "",
      });
      setFormErrors({});
      setError(null);
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
        navigate(`/admin/settings/associate-away-log/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/associate-away-log/${id}/detail`);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      Promise.all([fetchAssociateAwayLogData(), fetchAssociates()]);
    } else {
      setError("No associate away log ID provided");
      setInitialLoading(false);
    }
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Loading state
  if (initialLoading || loadingAssociates) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading associate away log...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !originalData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/settings/associate-away-logs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Associate Away Logs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb - Responsive */}
        <nav className="flex mb-4 overflow-x-auto" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li className="hidden sm:flex">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/settings/associate-away-logs"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Away Logs
                  </span>
                </Link>
              </div>
            </li>
            <li className="hidden md:flex">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/associate-away-log/${id}/detail`}
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Detail
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center whitespace-nowrap">
                  <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Edit
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <PencilSquareIcon className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
            Edit Away Log
          </h1>
          {hasChanges && (
            <div className="flex items-center text-amber-600 text-xs sm:text-sm font-medium">
              <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Unsaved changes
            </div>
          )}
        </div>

        {/* Success/Error Messages - Responsive */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {success}
            </span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Responsive Layout - Stack on mobile, 2 columns on tablet, 3 columns on desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form - Full width on mobile/tablet, 2 columns on desktop */}
          <div className="xl:col-span-2 bg-white shadow-sm rounded-lg">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Update Away Log Details
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 sm:space-y-6">
                  {/* Associate Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Associate <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.associateId}
                      onChange={(e) =>
                        handleInputChange("associateId", e.target.value)
                      }
                      disabled={loading}
                      className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.associateId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Please select an associate</option>
                      {associates.map((associate) => (
                        <option key={associate.id} value={associate.id}>
                          {associate.firstName} {associate.lastName}{" "}
                          {associate.email && `(${associate.email})`}
                        </option>
                      ))}
                    </select>
                    {formErrors.associateId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {formErrors.associateId}
                      </p>
                    )}
                  </div>

                  {/* Reason Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) =>
                        handleInputChange("reason", e.target.value)
                      }
                      disabled={loading}
                      className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.reason ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {REASON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.reason && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {formErrors.reason}
                      </p>
                    )}
                  </div>

                  {/* Other Reason (conditional) */}
                  {formData.reason === "1" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Specify Reason <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.reasonOther}
                        onChange={(e) =>
                          handleInputChange("reasonOther", e.target.value)
                        }
                        placeholder="Please specify the reason"
                        disabled={loading}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.reasonOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.reasonOther && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {formErrors.reasonOther}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date Fields - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        disabled={loading}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.startDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.startDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {formErrors.startDate}
                        </p>
                      )}
                    </div>

                    {/* Until Further Notice */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Until Further Notice?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.untilFurtherNotice}
                        onChange={(e) =>
                          handleInputChange(
                            "untilFurtherNotice",
                            e.target.value,
                          )
                        }
                        disabled={loading}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.untilFurtherNotice
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {UNTIL_FURTHER_NOTICE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.untilFurtherNotice && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {formErrors.untilFurtherNotice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Until Date (conditional) */}
                  {formData.untilFurtherNotice === "2" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Until Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.untilDate}
                        onChange={(e) =>
                          handleInputChange("untilDate", e.target.value)
                        }
                        disabled={loading}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.untilDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.untilDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {formErrors.untilDate}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Info Note - Responsive */}
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                      <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        Changes will take effect immediately and affect the
                        associate's availability for new work orders.
                      </span>
                    </p>
                  </div>

                  {/* Form Actions - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                    {hasChanges ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading || !hasChanges}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {loading ? "Updating..." : "Update Away Log"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Important Notes - Responsive */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500" />
                  Important Notes
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Changing dates affects assignment availability</span>
                  </li>
                  <li className="flex items-start">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Existing work orders remain unaffected</span>
                  </li>
                  <li className="flex items-start">
                    <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Associates retain account access</span>
                  </li>
                  <li className="flex items-start">
                    <BriefcaseIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Update insurance info before marking available</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Original Data - Responsive */}
            {originalData && hasChanges && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3 flex items-center">
                  <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Original Values
                </h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Associate:</span>
                    <span className="text-gray-900 truncate ml-2">
                      {originalData.associateName ||
                        `#${originalData.associateId}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="text-gray-900">
                      {originalData.startDate
                        ? new Date(originalData.startDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Until:</span>
                    <span className="text-gray-900">
                      {originalData.untilFurtherNotice === 1
                        ? "Further Notice"
                        : originalData.untilDate
                          ? new Date(
                              originalData.untilDate,
                            ).toLocaleDateString()
                          : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips - Responsive */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                  Quick Tips
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Review dates carefully before saving</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Notify teams of availability changes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Update when circumstances change</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link - Responsive */}
        <div className="mt-4 sm:mt-6">
          <Link
            to={`/admin/settings/associate-away-log/${id}/detail`}
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Back to Away Log Detail
          </Link>
        </div>

        {/* Loading Overlay - Responsive */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 max-w-xs">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm sm:text-base text-gray-700">
                Updating away log...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingAssociateAwayLogUpdatePage;

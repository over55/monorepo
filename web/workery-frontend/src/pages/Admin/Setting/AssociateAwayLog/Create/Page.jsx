// File Path: monorepo/web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ensureISODateForAPI } from "../../../../../services/Helpers/DateFormatter";
import { AssociateSelect } from "../../../../../components/business/selects";

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

function SettingAssociateAwayLogCreatePage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    associateId: "",
    reason: "",
    reasonOther: "",
    untilFurtherNotice: "",
    untilDate: "",
    startDate: "",
  });

  // Associates for selection
  const [associateID, setAssociateID] = useState("");
  const [associates, setAssociates] = useState([]);
  const [loadingAssociates, setLoadingAssociates] = useState(true);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const handleAssociateChange = (value) => {
    handleInputChange("associateId", value);

    // Clear associate error if it exists
    if (formData.associateID) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.associateID;
        return newErrors;
      });
    }
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        associateId: formData.associateId,
        reason: parseInt(formData.reason),
        reasonOther: formData.reasonOther?.trim() || "",
        untilFurtherNotice: parseInt(formData.untilFurtherNotice),
        untilDate:
          formData.untilFurtherNotice === "2"
            ? formData.startDate
              ? ensureISODateForAPI(formData.untilDate)
              : ""
            : "",
        startDate: formData.startDate
          ? ensureISODateForAPI(formData.startDate)
          : "",
      };

      await associateAwayLogManager.createAssociateAwayLog(
        submitData,
        onUnauthorized,
      );

      setSuccess("Associate away log created successfully!");

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate("/admin/settings/associate-away-logs");
      }, 1500);
    } catch (err) {
      console.error("Failed to create associate away log:", err);

      if (err && typeof err === "object") {
        // Handle validation errors from API
        setFormErrors(err);
      } else {
        setError(err.message || "Failed to create associate away log");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAssociates();
  }, []);

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        {/* Breadcrumb - Responsive */}
        <nav
          className="flex mb-3 sm:mb-4 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Link
                  to="/admin/settings"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li className="hidden sm:flex">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Link
                  to="/admin/settings/associate-away-logs"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden md:inline">
                      Associate Away Logs
                    </span>
                    <span className="md:hidden">Away Logs</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Create
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3" />
            <span className="hidden sm:inline">Create Associate Away Log</span>
            <span className="sm:hidden">Create Away Log</span>
          </h1>
        </div>

        {/* Success/Error Messages - Responsive */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{success}</span>
            </span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Two Column Layout - Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Form (2 columns wide on xl) */}
          <div className="xl:col-span-2 bg-white shadow-sm rounded-lg order-1">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Away Log Details
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {loadingAssociates ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-600">
                      Loading associates...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Associate Selection */}
                    <AssociateSelect
                      value={formData.associateId}
                      onChange={handleAssociateChange}
                      error={formErrors.associateID}
                      required={true}
                      label="Associate"
                      helperText="Start typing to search for an associate by name"
                      onUnauthorized={onUnauthorized}
                      placeholder="Please select an associate"
                      statusFilter={1} // Only show active associates
                    />

                    {/* Reason Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.reason}
                        onChange={(e) =>
                          handleInputChange("reason", e.target.value)
                        }
                        disabled={loading}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.reason
                            ? "border-red-500"
                            : "border-gray-300"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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

                    {/* Date Fields Row - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          min={today}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Until Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.untilDate}
                          onChange={(e) =>
                            handleInputChange("untilDate", e.target.value)
                          }
                          min={today}
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
                        <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          This log will mark the associate as unavailable for
                          new work orders during the specified period.
                        </span>
                      </p>
                    </div>

                    {/* Form Actions - Responsive */}
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/admin/settings/associate-away-logs")
                        }
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        {loading ? "Creating..." : "Create Away Log"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Guidelines - Responsive */}
          <div className="space-y-4 sm:space-y-6 order-2 xl:order-2">
            {/* Important Notes */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500" />
                  Important Notes
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start">
                    <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Away logs prevent associates from being assigned new work
                      orders
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Existing work orders remain unaffected</span>
                  </li>
                  <li className="flex items-start">
                    <UserGroupIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Associates can still access their account</span>
                  </li>
                  <li className="flex items-start">
                    <BriefcaseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Update insurance/policy info before marking available
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Tips */}
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
                    <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Use "Until Further Notice" for indefinite periods
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Set specific end dates for planned vacations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Update logs when circumstances change</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link - Responsive */}
        <div className="mt-4 sm:mt-6">
          <Link
            to="/admin/settings/associate-away-logs"
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Back to Associate Away Logs
          </Link>
        </div>

        {/* Loading Overlay - Responsive */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 max-w-xs sm:max-w-sm">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              <span className="text-sm sm:text-base text-gray-700">
                Creating away log...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingAssociateAwayLogCreatePage;

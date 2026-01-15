// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Create/Page.jsx
// UIX Upgraded - Uses UIX primitives (requires conditional form fields and guidelines sidebar not supported by SettingsFormView)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import {
  CalendarDaysIcon,
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
import {
  Card,
  Button,
  Alert,
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
  Select,
  DatePicker,
  Input,
} from "../../../../../components/UIX";

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
  const { getThemeClasses } = useUIXTheme();

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

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
    { label: "Associate Away Logs", to: "/admin/settings/associate-away-logs", icon: CalendarDaysIcon },
    { label: "Create", icon: PlusIcon, isActive: true },
  ], []);

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
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* Page Title */}
        <div className="mb-3 sm:mb-4">
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <CalendarDaysIcon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3 ${themeClasses.linkPrimary}`} />
            <span className="hidden sm:inline">Create Associate Away Log</span>
            <span className="sm:hidden">Create Away Log</span>
          </h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert type="success" dismissible onDismiss={() => setSuccess(null)} className="mb-4">
            {success}
          </Alert>
        )}

        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Form */}
          <div className="xl:col-span-2 order-1">
            <Card>
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
                      <Spinner size="lg" />
                      <p className="mt-4 text-sm sm:text-base text-gray-600">
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
                      <Select
                        label="Reason"
                        value={String(formData.reason)}
                        onChange={(value) => handleInputChange("reason", value)}
                        disabled={loading}
                        required
                        error={formErrors.reason}
                        options={REASON_OPTIONS.map((opt) => ({
                          value: String(opt.value),
                          label: opt.label,
                        }))}
                        placeholder="Please select"
                      />

                      {/* Other Reason (conditional) */}
                      {formData.reason === "1" && (
                        <Input
                          label="Specify Reason"
                          value={formData.reasonOther}
                          onChange={(value) =>
                            handleInputChange("reasonOther", value)
                          }
                          placeholder="Please specify the reason"
                          disabled={loading}
                          required
                          error={formErrors.reasonOther}
                        />
                      )}

                      {/* Date Fields Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Start Date */}
                        <DatePicker
                          label="Start Date"
                          value={formData.startDate}
                          onChange={(value) =>
                            handleInputChange("startDate", value)
                          }
                          min={today}
                          disabled={loading}
                          required
                          error={formErrors.startDate}
                          placeholder="Select a date"
                        />

                        {/* Until Further Notice */}
                        <Select
                          label="Until Further Notice?"
                          value={String(formData.untilFurtherNotice)}
                          onChange={(value) =>
                            handleInputChange("untilFurtherNotice", value)
                          }
                          disabled={loading}
                          required
                          error={formErrors.untilFurtherNotice}
                          options={UNTIL_FURTHER_NOTICE_OPTIONS.map((opt) => ({
                            value: String(opt.value),
                            label: opt.label,
                          }))}
                          placeholder="Please select"
                        />
                      </div>

                      {/* Until Date (conditional) */}
                      {formData.untilFurtherNotice === "2" && (
                        <DatePicker
                          label="Until Date"
                          value={formData.untilDate}
                          onChange={(value) =>
                            handleInputChange("untilDate", value)
                          }
                          min={today}
                          disabled={loading}
                          required
                          error={formErrors.untilDate}
                          placeholder="Select a date"
                        />
                      )}

                      {/* Info Note */}
                      <Alert type="info">
                        <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0 inline" />
                        This log will mark the associate as unavailable for
                        new work orders during the specified period.
                      </Alert>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate("/admin/settings/associate-away-logs")
                          }
                          disabled={loading}
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="success"
                          disabled={loading}
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          {loading ? "Creating..." : "Create Away Log"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-4 sm:space-y-6 order-2 xl:order-2">
            {/* Important Notes */}
            <Card>
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
            </Card>

            {/* Quick Tips */}
            <Card>
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
            </Card>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 sm:mt-6">
          <Link
            to="/admin/settings/associate-away-logs"
            className={`inline-flex items-center text-xs sm:text-sm ${themeClasses.linkPrimary}`}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Back to Associate Away Logs
          </Link>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 max-w-xs sm:max-w-sm">
              <Spinner size="md" />
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

// Wrapper with UIXThemeProvider
function SettingAssociateAwayLogCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingAssociateAwayLogCreatePage />
    </UIXThemeProvider>
  );
}

export default SettingAssociateAwayLogCreatePageWithProvider;

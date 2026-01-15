// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Update/Page.jsx
// UIX Upgraded - Uses UIX primitives (requires conditional form fields and guidelines sidebar not supported by SettingsFormView)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import {
  CalendarDaysIcon,
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

function SettingAssociateAwayLogUpdatePage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getThemeClasses } = useUIXTheme();

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
    { label: "Detail", to: `/admin/settings/associate-away-log/${id}/detail`, icon: ClipboardDocumentIcon },
    { label: "Edit", icon: PencilSquareIcon, isActive: true },
  ], [id]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
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

  // Loading state
  if (initialLoading || loadingAssociates) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" />
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
          <Alert type="error" className="mb-4">{error}</Alert>
          <Link
            to="/admin/settings/associate-away-logs"
            className={`inline-flex items-center ${themeClasses.linkPrimary}`}
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
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* Page Title */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className={`text-xl sm:text-2xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <PencilSquareIcon className={`w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 ${themeClasses.linkPrimary}`} />
            Edit Away Log
          </h1>
          {hasChanges && (
            <div className="flex items-center text-amber-600 text-xs sm:text-sm font-medium">
              <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Unsaved changes
            </div>
          )}
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

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="xl:col-span-2">
            <Card>
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
                    <Select
                      label="Associate"
                      value={String(formData.associateId)}
                      onChange={(value) =>
                        handleInputChange("associateId", value)
                      }
                      disabled={loading}
                      required
                      error={formErrors.associateId}
                      options={[
                        { value: "", label: "Please select an associate" },
                        ...associates.map((associate) => ({
                          value: String(associate.id),
                          label: `${associate.firstName} ${associate.lastName}${associate.email ? ` (${associate.email})` : ""}`,
                        })),
                      ]}
                      placeholder="Please select an associate"
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

                    {/* Date Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Start Date */}
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(value) =>
                          handleInputChange("startDate", value)
                        }
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
                        disabled={loading}
                        required
                        error={formErrors.untilDate}
                        placeholder="Select a date"
                      />
                    )}

                    {/* Info Note */}
                    <Alert type="info">
                      <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 inline" />
                      Changes will take effect immediately and affect the
                      associate's availability for new work orders.
                    </Alert>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                      {hasChanges ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleReset}
                          disabled={loading}
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="success"
                        disabled={loading || !hasChanges}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        {loading ? "Updating..." : "Update Away Log"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Important Notes */}
            <Card>
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
            </Card>

            {/* Original Data */}
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
            </Card>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 sm:mt-6">
          <Link
            to={`/admin/settings/associate-away-log/${id}/detail`}
            className={`inline-flex items-center text-xs sm:text-sm ${themeClasses.linkPrimary}`}
          >
            <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Back to Away Log Detail
          </Link>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 max-w-xs">
              <Spinner size="md" />
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

// Wrapper with UIXThemeProvider
function SettingAssociateAwayLogUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingAssociateAwayLogUpdatePage />
    </UIXThemeProvider>
  );
}

export default SettingAssociateAwayLogUpdatePageWithProvider;

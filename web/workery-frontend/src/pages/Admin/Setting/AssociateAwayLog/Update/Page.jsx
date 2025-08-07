// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateAwayLogManager,
  useAssociateManager,
} from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  FormGroup,
} from "../../../../../components/UI";

const REASON_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 2, label: "Going on vacation" },
  { value: 3, label: "Personal reasons" },
  { value: 4, label: "Commercial insurance expired" },
  { value: 5, label: "Policy check expired" },
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
  const hasChanges = () => {
    if (!originalData) return false;

    return (
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
          : "")
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are changes
    if (!hasChanges()) {
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

  // Initial load
  useEffect(() => {
    if (id) {
      Promise.all([fetchAssociateAwayLogData(), fetchAssociates()]);
    } else {
      setError("No associate away log ID provided");
      setInitialLoading(false);
    }
  }, [id]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Associate Away Logs",
      path: "/admin/settings/associate-away-logs",
      icon: "📅",
    },
    { label: "Edit", icon: "✏️" },
  ];

  if (initialLoading || loadingAssociates) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading associate away log..." />
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            onClick={() => navigate("/admin/settings/associate-away-logs")}
          >
            ← Back to Associate Away Logs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          ✏️ Edit Associate Away Log
        </h1>
      </div>

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Associate Selection */}
            <FormGroup>
              <label style={globalStyles.label}>
                Associate <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={formData.associateId}
                onChange={(e) =>
                  handleInputChange("associateId", e.target.value)
                }
                style={{
                  ...globalStyles.input,
                  borderColor: formErrors.associateId
                    ? theme.colors.error
                    : "#ddd",
                }}
                disabled={loading}
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
                <div style={globalStyles.errorMessage}>
                  {formErrors.associateId}
                </div>
              )}
            </FormGroup>

            {/* Reason Selection */}
            <FormGroup>
              <label style={globalStyles.label}>
                Reason <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                style={{
                  ...globalStyles.input,
                  borderColor: formErrors.reason ? theme.colors.error : "#ddd",
                }}
                disabled={loading}
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.reason && (
                <div style={globalStyles.errorMessage}>{formErrors.reason}</div>
              )}
            </FormGroup>

            {/* Other Reason (if selected) */}
            {formData.reason === "1" && (
              <FormGroup>
                <label style={globalStyles.label}>
                  Specify Reason <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.reasonOther}
                  onChange={(e) =>
                    handleInputChange("reasonOther", e.target.value)
                  }
                  placeholder="Please specify the reason"
                  style={{
                    ...globalStyles.input,
                    borderColor: formErrors.reasonOther
                      ? theme.colors.error
                      : "#ddd",
                  }}
                  disabled={loading}
                />
                {formErrors.reasonOther && (
                  <div style={globalStyles.errorMessage}>
                    {formErrors.reasonOther}
                  </div>
                )}
              </FormGroup>
            )}

            {/* Until Further Notice */}
            <FormGroup>
              <label style={globalStyles.label}>
                Until Further Notice? <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={formData.untilFurtherNotice}
                onChange={(e) =>
                  handleInputChange("untilFurtherNotice", e.target.value)
                }
                style={{
                  ...globalStyles.input,
                  borderColor: formErrors.untilFurtherNotice
                    ? theme.colors.error
                    : "#ddd",
                }}
                disabled={loading}
              >
                {UNTIL_FURTHER_NOTICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.untilFurtherNotice && (
                <div style={globalStyles.errorMessage}>
                  {formErrors.untilFurtherNotice}
                </div>
              )}
            </FormGroup>

            {/* Until Date (if not further notice) */}
            {formData.untilFurtherNotice === "2" && (
              <FormGroup>
                <label style={globalStyles.label}>
                  Until Date <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.untilDate}
                  onChange={(e) =>
                    handleInputChange("untilDate", e.target.value)
                  }
                  style={{
                    ...globalStyles.input,
                    borderColor: formErrors.untilDate
                      ? theme.colors.error
                      : "#ddd",
                  }}
                  disabled={loading}
                />
                {formErrors.untilDate && (
                  <div style={globalStyles.errorMessage}>
                    {formErrors.untilDate}
                  </div>
                )}
              </FormGroup>
            )}

            {/* Start Date */}
            <FormGroup>
              <label style={globalStyles.label}>
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                style={{
                  ...globalStyles.input,
                  borderColor: formErrors.startDate
                    ? theme.colors.error
                    : "#ddd",
                }}
                disabled={loading}
              />
              {formErrors.startDate && (
                <div style={globalStyles.errorMessage}>
                  {formErrors.startDate}
                </div>
              )}
            </FormGroup>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              type="button"
              onClick={() =>
                navigate(`/admin/settings/associate-away-log/${id}/detail`)
              }
              variant="outline"
              disabled={loading}
            >
              ← Cancel
            </Button>
            <div style={{ display: "flex", gap: "10px" }}>
              {hasChanges() && (
                <div
                  style={{
                    fontSize: "14px",
                    color: theme.colors.warning,
                    alignSelf: "center",
                    marginRight: "10px",
                  }}
                >
                  ⚠️ You have unsaved changes
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !hasChanges()}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SettingAssociateAwayLogUpdatePage;

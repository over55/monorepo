// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  FormGroup,
} from "../../../../../components/UI";

function SettingHowHearAboutUsItemUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    sortNumber: 0,
    text: "",
    isForAssociate: false,
    isForCustomer: false,
    isForStaff: false,
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch existing data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await howHearAboutUsItemManager.getDetail(
        id,
        onUnauthorized,
        true, // Force refresh
      );

      // Check if item is locked (Other)
      if (result.text === "Other") {
        setError("This item is system-protected and cannot be edited.");
        setTimeout(() => {
          navigate(`/admin/settings/how-hear-about-us-item/${id}/detail`);
        }, 3000);
        return;
      }

      setOriginalData(result);
      setFormData({
        sortNumber: result.sortNumber || 0,
        text: result.text || "",
        isForAssociate: result.isForAssociate || false,
        isForCustomer: result.isForCustomer || false,
        isForStaff: result.isForStaff || false,
      });
    } catch (err) {
      console.error("Failed to fetch How Hear About Us Item:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
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

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Text validation
    if (!formData.text?.trim()) {
      errors.text = "Text is required";
    } else if (formData.text.length > 255) {
      errors.text = "Text must be less than 255 characters";
    }

    // Sort number validation
    if (typeof formData.sortNumber !== "number" || formData.sortNumber < 0) {
      errors.sortNumber = "Sort number must be a positive number";
    }

    // Role validation
    if (
      !formData.isForAssociate &&
      !formData.isForCustomer &&
      !formData.isForStaff
    ) {
      errors.roles = "At least one role must be selected";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;

    return (
      formData.sortNumber !== originalData.sortNumber ||
      formData.text !== originalData.text ||
      formData.isForAssociate !== originalData.isForAssociate ||
      formData.isForCustomer !== originalData.isForCustomer ||
      formData.isForStaff !== originalData.isForStaff
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setError("No changes were made to update.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const result = await howHearAboutUsItemManager.update(
        id,
        formData,
        onUnauthorized,
      );

      // Navigate to detail page
      navigate(`/admin/settings/how-hear-about-us-item/${id}/detail`);
    } catch (err) {
      console.error("Failed to update How Hear About Us Item:", err);

      // Handle validation errors from server
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
        setError("Please correct the errors below and try again.");
      } else {
        setError(err.message || "Failed to update item");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      if (!confirmed) return;
    }
    navigate(`/admin/settings/how-hear-about-us-item/${id}/detail`);
  };

  // Reset form to original data
  const handleReset = () => {
    if (originalData) {
      setFormData({
        sortNumber: originalData.sortNumber || 0,
        text: originalData.text || "",
        isForAssociate: originalData.isForAssociate || false,
        isForCustomer: originalData.isForCustomer || false,
        isForStaff: originalData.isForStaff || false,
      });
      setValidationErrors({});
      setError(null);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check if item ID is valid
  if (!id) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">Invalid item ID</Alert>
        <Link to="/admin/settings/how-hear-about-us-items">
          ← Back to How Hear About Us Items
        </Link>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          {
            path: "/admin/settings/how-hear-about-us-items",
            label: "How Hear About Us Items",
            icon: "📞",
          },
          {
            path: `/admin/settings/how-hear-about-us-item/${id}/detail`,
            label: originalData?.text || "Item Detail",
            icon: "👁️",
          },
          { label: "Edit", icon: "✏️" },
        ]}
      />

      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: theme.colors.dark }}>
          ✏️ Edit How Hear About Us Item
        </h1>
        {originalData && (
          <p style={{ margin: "8px 0 0 0", color: theme.colors.secondary }}>
            Editing "{originalData.text}"
          </p>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Loading message="Loading item data..." />
      ) : (
        <>
          {/* Main Form */}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Basic Information */}
              <Card title="📋 Basic Information">
                <FormGroup>
                  <Input
                    label="Sort Number"
                    type="number"
                    value={formData.sortNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "sortNumber",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    error={validationErrors.sortNumber}
                    required
                    placeholder="Enter sort number (e.g., 1, 2, 3...)"
                  />
                  <div
                    style={{ fontSize: "12px", color: theme.colors.secondary }}
                  >
                    Lower numbers appear first in lists
                  </div>
                </FormGroup>

                <Input
                  label="Text"
                  value={formData.text}
                  onChange={(e) => handleInputChange("text", e.target.value)}
                  error={validationErrors.text}
                  required
                  placeholder="Enter the display text (e.g., 'Google Search', 'Referral from friend')"
                  maxLength={255}
                />
              </Card>

              {/* Role Configuration */}
              <Card title="👥 Role Configuration">
                <div style={{ marginBottom: "15px" }}>
                  <label style={globalStyles.label}>
                    Select which user roles can use this option:
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  {validationErrors.roles && (
                    <div style={globalStyles.errorMessage}>
                      {validationErrors.roles}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: "15px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: formData.isForAssociate
                        ? theme.colors.successBg
                        : theme.colors.light,
                      border: `2px solid ${
                        formData.isForAssociate
                          ? theme.colors.success
                          : "transparent"
                      }`,
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isForAssociate}
                      onChange={() => handleCheckboxChange("isForAssociate")}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>For Associates</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: theme.colors.secondary,
                        }}
                      >
                        Associates can select this option when registering
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: formData.isForCustomer
                        ? theme.colors.successBg
                        : theme.colors.light,
                      border: `2px solid ${
                        formData.isForCustomer
                          ? theme.colors.success
                          : "transparent"
                      }`,
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isForCustomer}
                      onChange={() => handleCheckboxChange("isForCustomer")}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>For Customers</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: theme.colors.secondary,
                        }}
                      >
                        Customers can select this option when registering
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: formData.isForStaff
                        ? theme.colors.successBg
                        : theme.colors.light,
                      border: `2px solid ${
                        formData.isForStaff
                          ? theme.colors.success
                          : "transparent"
                      }`,
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isForStaff}
                      onChange={() => handleCheckboxChange("isForStaff")}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <div>
                      <div style={{ fontWeight: "500" }}>For Staff</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: theme.colors.secondary,
                        }}
                      >
                        Staff can select this option when creating records
                      </div>
                    </div>
                  </label>
                </div>
              </Card>
            </div>

            {/* Form Actions */}
            <Card style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                <div
                  style={{ fontSize: "14px", color: theme.colors.secondary }}
                >
                  <span style={{ color: "red" }}>*</span> Required fields
                  {hasChanges() && (
                    <span
                      style={{
                        marginLeft: "15px",
                        color: theme.colors.warning,
                      }}
                    >
                      ⚠️ You have unsaved changes
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  {hasChanges() && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSaving}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSaving || !hasChanges()}
                    style={{ minWidth: "120px" }}
                  >
                    {isSaving ? (
                      <>
                        <span style={{ marginRight: "8px" }}>⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: "8px" }}>💾</span>
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </form>

          {/* Preview Card */}
          {formData.text && (
            <Card title="👁️ Preview" style={{ marginTop: "20px" }}>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <strong>How this will appear in forms:</strong>
                </div>
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input type="radio" disabled />
                    {formData.text}
                  </label>
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: theme.colors.secondary,
                  }}
                >
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
            </Card>
          )}
        </>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <Loading message="Saving changes..." />
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to={`/admin/settings/how-hear-about-us-item/${id}/detail`}
          style={{
            textDecoration: "none",
            color: theme.colors.primary,
            fontSize: "16px",
          }}
        >
          ← Back to Item Detail
        </Link>
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemUpdatePage;

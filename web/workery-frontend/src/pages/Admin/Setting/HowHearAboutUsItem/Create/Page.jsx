// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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

function SettingHowHearAboutUsItemCreatePage() {
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await howHearAboutUsItemManager.create(
        formData,
        onUnauthorized,
      );

      // Navigate to detail page
      navigate(`/admin/settings/how-hear-about-us-item/${result.id}/detail`);
    } catch (err) {
      console.error("Failed to create How Hear About Us Item:", err);

      // Handle validation errors from server
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
        setError("Please correct the errors below and try again.");
      } else {
        setError(err.message || "Failed to create item");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/admin/settings/how-hear-about-us-items");
  };

  // Auto-clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
          { label: "Create New Item", icon: "➕" },
        ]}
      />

      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: theme.colors.dark }}>
          ➕ Create New How Hear About Us Item
        </h1>
        <p style={{ margin: "8px 0 0 0", color: theme.colors.secondary }}>
          Add a new option for how customers and associates can indicate how
          they heard about your organization
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                  handleInputChange("sortNumber", parseInt(e.target.value) || 0)
                }
                error={validationErrors.sortNumber}
                required
                placeholder="Enter sort number (e.g., 1, 2, 3...)"
              />
              <div style={{ fontSize: "12px", color: theme.colors.secondary }}>
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
                    formData.isForStaff ? theme.colors.success : "transparent"
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
            <div style={{ fontSize: "14px", color: theme.colors.secondary }}>
              <span style={{ color: "red" }}>*</span> Required fields
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                style={{ minWidth: "120px" }}
              >
                {isLoading ? (
                  <>
                    <span style={{ marginRight: "8px" }}>⏳</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: "8px" }}>✅</span>
                    Create Item
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
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
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

      {/* Loading Overlay */}
      {isLoading && (
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
          <Loading message="Creating How Hear About Us Item..." />
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to="/admin/settings/how-hear-about-us-items"
          style={{
            textDecoration: "none",
            color: theme.colors.primary,
            fontSize: "16px",
          }}
        >
          ← Back to How Hear About Us Items
        </Link>
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemCreatePage;

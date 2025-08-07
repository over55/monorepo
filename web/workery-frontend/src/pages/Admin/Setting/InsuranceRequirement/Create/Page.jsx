// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Create/Page.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  FormGroup,
} from "../../../../../components/UI";

function SettingInsuranceRequirementCreatePage() {
  const navigate = useNavigate();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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
      errors.name = "Insurance requirement name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }

    // Validate description (optional, max length)
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      // Create insurance requirement
      const createdInsuranceRequirement =
        await insuranceRequirementManager.createInsuranceRequirement(
          submitData,
          onUnauthorized,
        );

      // Navigate to detail page with success message
      navigate(
        `/admin/settings/insurance-requirement/${createdInsuranceRequirement.id}/detail`,
        {
          state: {
            successMessage: "Insurance requirement created successfully",
          },
        },
      );
    } catch (err) {
      console.error("Failed to create insurance requirement:", err);

      // Handle validation errors from API
      if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
      } else {
        setError(err.message || "Failed to create insurance requirement");
      }
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
        navigate("/admin/settings/insurance-requirements");
      }
    } else {
      navigate("/admin/settings/insurance-requirements");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Insurance Requirements",
      path: "/admin/settings/insurance-requirements",
      icon: "🛡️",
    },
    { label: "Create New", icon: "➕" },
  ];

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
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          ➕ Create Insurance Requirement
        </h1>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Insurance Requirement Information">
          <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={validationErrors.name}
              required
              placeholder="Enter insurance requirement name"
              disabled={isSubmitting}
            />

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={validationErrors.description}
              placeholder="Enter description (optional)"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />

            <div style={{ fontSize: "14px", color: "#666" }}>
              <strong>Note:</strong> Insurance requirements are used to specify
              different types of insurance coverage needed for jobs or
              associates.
            </div>
          </div>
        </Card>

        <Card>
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span style={{ marginRight: "8px" }}>Creating...</span>⏳
                </>
              ) : (
                <>
                  <span style={{ marginRight: "8px" }}>
                    Create Insurance Requirement
                  </span>
                  ✅
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* Show loading overlay when submitting */}
      {isSubmitting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>
              Creating Insurance Requirement...
            </div>
            <div style={{ color: "#666" }}>
              Please wait while we save your changes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingInsuranceRequirementCreatePage;

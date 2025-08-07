// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Create/Page.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
  FormGroup,
} from "../../../../../components/UI";

function SettingServiceFeeCreatePage() {
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
    amount: "",
    status: 1, // Active by default
    type: 1, // Default type
  });

  // Component state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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

    // Rate validation - must have either percentage or amount, but not both
    const hasPercentage =
      formData.percentage && parseFloat(formData.percentage) > 0;
    const hasAmount = formData.amount && parseFloat(formData.amount) > 0;

    if (!hasPercentage && !hasAmount) {
      newErrors.general = "Must specify either a percentage or fixed amount";
    } else if (hasPercentage && hasAmount) {
      newErrors.general =
        "Cannot specify both percentage and fixed amount. Choose one.";
    }

    // Percentage validation
    if (hasPercentage) {
      const percentage = parseFloat(formData.percentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        newErrors.percentage = "Percentage must be between 0 and 100";
      }
    }

    // Amount validation
    if (hasAmount) {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < 0) {
        newErrors.amount = "Amount must be a positive number";
      } else if (amount > 999999.99) {
        newErrors.amount = "Amount must be less than $1,000,000";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneralError(validationErrors.general || null);
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
        status: parseInt(formData.status),
        type: parseInt(formData.type),
      };

      // Add either percentage or amount
      if (formData.percentage && parseFloat(formData.percentage) > 0) {
        submitData.percentage = parseFloat(formData.percentage);
      } else if (formData.amount && parseFloat(formData.amount) > 0) {
        submitData.amount = parseFloat(formData.amount);
      }

      const response = await serviceFeeManager.createServiceFee(
        submitData,
        onUnauthorized,
      );

      // Success - redirect to detail page
      navigate(`/admin/settings/service-fee/${response.id}/detail`);
    } catch (err) {
      console.error("Failed to create service fee:", err);

      if (typeof err === "object" && err !== null) {
        // Handle field-specific errors
        setErrors(err);
        setGeneralError(
          err.general || err.message || "Failed to create service fee",
        );
      } else {
        setGeneralError(err || "Failed to create service fee");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear general error when changing rate fields
    if ((field === "percentage" || field === "amount") && generalError) {
      setGeneralError(null);
    }
  };

  const handleCancel = () => {
    navigate("/admin/settings/service-fees");
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Service Fees", path: "/admin/settings/service-fees", icon: "💳" },
    { label: "Create", icon: "➕" },
  ];

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "1", label: "Standard Service Fee" },
    { value: "2", label: "Premium Service Fee" },
    { value: "3", label: "Special Service Fee" },
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
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            ➕ Create Service Fee
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Add a new service fee to your system
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          ← Back to Service Fees
        </Button>
      </div>

      {generalError && (
        <Alert type="error" onClose={() => setGeneralError(null)}>
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Basic Information */}
          <Card title="📋 Basic Information">
            <Input
              label="Service Fee Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              required
              placeholder="Enter service fee name"
              maxLength={127}
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              placeholder="Enter optional description"
              rows={4}
              maxLength={500}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <Select
                label="Status"
                value={formData.status.toString()}
                onChange={(e) => handleInputChange("status", e.target.value)}
                options={statusOptions}
                required
              />

              <Select
                label="Type"
                value={formData.type.toString()}
                onChange={(e) => handleInputChange("type", e.target.value)}
                options={typeOptions}
                required
              />
            </div>
          </Card>

          {/* Rate Configuration */}
          <Card title="💰 Rate Configuration">
            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.infoBg,
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                ℹ️ Rate Setup Instructions
              </p>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.4" }}>
                Choose either a <strong>percentage rate</strong> (e.g., 2.5%) or
                a <strong>fixed amount</strong> (e.g., $25.00), but not both.
                The rate will be applied to applicable transactions.
              </p>
            </div>

            <Input
              label="Percentage Rate (%)"
              type="number"
              value={formData.percentage}
              onChange={(e) => handleInputChange("percentage", e.target.value)}
              error={errors.percentage}
              placeholder="e.g., 2.5"
              min="0"
              max="100"
              step="0.01"
            />

            <div
              style={{ textAlign: "center", margin: "15px 0", color: "#666" }}
            >
              — OR —
            </div>

            <Input
              label="Fixed Amount ($)"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              error={errors.amount}
              placeholder="e.g., 25.00"
              min="0"
              max="999999.99"
              step="0.01"
            />

            {/* Rate Preview */}
            {(formData.percentage || formData.amount) && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: theme.colors.successBg,
                  borderRadius: "4px",
                  border: `1px solid ${theme.colors.success}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  📊 Rate Preview
                </p>
                {formData.percentage && parseFloat(formData.percentage) > 0 ? (
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    This service fee will charge{" "}
                    <strong>{formData.percentage}%</strong> of the transaction
                    amount.
                  </p>
                ) : formData.amount && parseFloat(formData.amount) > 0 ? (
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    This service fee will charge a fixed amount of{" "}
                    <strong>${parseFloat(formData.amount).toFixed(2)}</strong>{" "}
                    per transaction.
                  </p>
                ) : null}
              </div>
            )}
          </Card>
        </div>

        {/* Form Actions */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 5px 0" }}>💾 Save Service Fee</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Review your information and create the service fee
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "✓ Create Service Fee"}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {isSubmitting && (
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
          <Card style={{ minWidth: "300px", textAlign: "center" }}>
            <Loading message="Creating service fee..." />
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingServiceFeeCreatePage;

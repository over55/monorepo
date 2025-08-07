// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
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

function SettingServiceFeeUpdatePage() {
  const { id } = useParams();
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
    amount: "",
    status: 1,
    type: 1,
  });

  // Component state
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchServiceFeeDetail = async () => {
    if (!id) {
      setGeneralError("Service fee ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await serviceFeeManager.getServiceFeeDetail(
        id,
        onUnauthorized,
      );

      setOriginalData(response);
      setFormData({
        name: response.name || "",
        description: response.description || "",
        percentage: response.percentage || "",
        amount: response.amount || "",
        status: response.status || 1,
        type: response.type || 1,
      });
    } catch (err) {
      console.error("Failed to fetch service fee detail:", err);
      setGeneralError(err.message || "Failed to load service fee details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceFeeDetail();
  }, [id]);

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

  const hasChanges = () => {
    if (!originalData) return false;

    return (
      formData.name !== (originalData.name || "") ||
      formData.description !== (originalData.description || "") ||
      formData.percentage !== (originalData.percentage || "") ||
      formData.amount !== (originalData.amount || "") ||
      parseInt(formData.status) !== (originalData.status || 1) ||
      parseInt(formData.type) !== (originalData.type || 1)
    );
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

      // Add either percentage or amount, clear the other
      if (formData.percentage && parseFloat(formData.percentage) > 0) {
        submitData.percentage = parseFloat(formData.percentage);
        submitData.amount = null; // Clear amount when using percentage
      } else if (formData.amount && parseFloat(formData.amount) > 0) {
        submitData.amount = parseFloat(formData.amount);
        submitData.percentage = null; // Clear percentage when using amount
      }

      const response = await serviceFeeManager.updateServiceFee(
        id,
        submitData,
        onUnauthorized,
      );

      setSuccess("Service fee updated successfully");
      setOriginalData(response);

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/service-fee/${id}/detail`);
      }, 2000);
    } catch (err) {
      console.error("Failed to update service fee:", err);

      if (typeof err === "object" && err !== null) {
        // Handle field-specific errors
        setErrors(err);
        setGeneralError(
          err.general || err.message || "Failed to update service fee",
        );
      } else {
        setGeneralError(err || "Failed to update service fee");
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

    // Clear success message when making changes
    if (success) {
      setSuccess(null);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/settings/service-fee/${id}/detail`);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData({
        name: originalData.name || "",
        description: originalData.description || "",
        percentage: originalData.percentage || "",
        amount: originalData.amount || "",
        status: originalData.status || 1,
        type: originalData.type || 1,
      });
      setErrors({});
      setGeneralError(null);
      setSuccess(null);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Service Fees", path: "/admin/settings/service-fees", icon: "💳" },
    {
      label: originalData?.name || "Edit",
      path: `/admin/settings/service-fee/${id}/detail`,
      icon: "🔍",
    },
    { label: "Edit", icon: "✏️" },
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

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading service fee details..." />
      </div>
    );
  }

  if (generalError && !originalData) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">
          {generalError}
          <div style={{ marginTop: "15px" }}>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/settings/service-fees")}
            >
              ← Back to Service Fees
            </Button>
          </div>
        </Alert>
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
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
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
            ✏️ Edit Service Fee
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Update the details for "{originalData?.name}"
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={handleCancel}>
            ← Back to Details
          </Button>
          {hasChanges() && (
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              🔄 Reset Changes
            </Button>
          )}
        </div>
      </div>

      {generalError && (
        <Alert type="error" onClose={() => setGeneralError(null)}>
          {generalError}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Show changes indicator */}
      {hasChanges() && !success && (
        <Alert type="warning">
          <strong>📝 Unsaved Changes:</strong> You have made changes that
          haven't been saved yet.
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
                ℹ️ Rate Update Instructions
              </p>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.4" }}>
                You can change between percentage and fixed amount rates. When
                you choose one, the other will be automatically cleared.
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
                  📊 Updated Rate Preview
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

            {/* Original vs New Comparison */}
            {originalData && hasChanges() && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: theme.colors.warningBg,
                  borderRadius: "4px",
                  border: `1px solid ${theme.colors.warning}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  📋 Summary of Changes
                </p>
                <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                  {formData.name !== originalData.name && (
                    <div>
                      • Name: "{originalData.name}" → "{formData.name}"
                    </div>
                  )}
                  {formData.percentage !== (originalData.percentage || "") && (
                    <div>
                      • Percentage: {originalData.percentage || "None"} →{" "}
                      {formData.percentage || "None"}
                    </div>
                  )}
                  {formData.amount !== (originalData.amount || "") && (
                    <div>
                      • Amount: ${originalData.amount || "0"} → $
                      {formData.amount || "0"}
                    </div>
                  )}
                  {parseInt(formData.status) !== originalData.status && (
                    <div>
                      • Status:{" "}
                      {originalData.status === 1 ? "Active" : "Inactive"} →{" "}
                      {parseInt(formData.status) === 1 ? "Active" : "Inactive"}
                    </div>
                  )}
                </div>
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
              <h3 style={{ margin: "0 0 5px 0" }}>💾 Save Changes</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {hasChanges()
                  ? "Review and save your changes"
                  : "No changes have been made"}
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
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !hasChanges()}
              >
                {isSubmitting ? "Saving..." : "✓ Save Changes"}
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
            <Loading message="Saving changes..." />
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingServiceFeeUpdatePage;

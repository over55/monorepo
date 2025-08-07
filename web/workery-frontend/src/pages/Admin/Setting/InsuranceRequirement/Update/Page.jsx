// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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

function SettingInsuranceRequirementUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [insuranceRequirement, setInsuranceRequirement] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch insurance requirement details
  const fetchInsuranceRequirementDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await insuranceRequirementManager.getInsuranceRequirementDetail(
          id,
          onUnauthorized,
        );

      setInsuranceRequirement(response);

      // Populate form with existing data
      setFormData({
        name: response.name || "",
        description: response.description || "",
      });
    } catch (err) {
      console.error("Failed to fetch insurance requirement detail:", err);
      setError(err.message || "Failed to load insurance requirement details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Check if form has changes compared to original data
      if (insuranceRequirement) {
        const originalData = {
          name: insuranceRequirement.name || "",
          description: insuranceRequirement.description || "",
        };

        const hasFormChanges = Object.keys(newData).some(
          (key) => newData[key] !== originalData[key],
        );

        setHasChanges(hasFormChanges);
      }

      return newData;
    });

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

      // Update insurance requirement
      await insuranceRequirementManager.updateInsuranceRequirement(
        id,
        submitData,
        onUnauthorized,
      );

      // Navigate to detail page with success message
      navigate(`/admin/settings/insurance-requirement/${id}/detail`, {
        state: { successMessage: "Insurance requirement updated successfully" },
      });
    } catch (err) {
      console.error("Failed to update insurance requirement:", err);

      // Handle validation errors from API
      if (err && typeof err === "object" && !err.message) {
        setValidationErrors(err);
      } else {
        setError(err.message || "Failed to update insurance requirement");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Your changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/insurance-requirement/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/insurance-requirement/${id}/detail`);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchInsuranceRequirementDetail();
    } else {
      setError("Invalid insurance requirement ID");
      setIsLoading(false);
    }
  }, [id]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      label: "Insurance Requirements",
      path: "/admin/settings/insurance-requirements",
      icon: "🛡️",
    },
    {
      label: insuranceRequirement?.name || "Loading...",
      path: `/admin/settings/insurance-requirement/${id}/detail`,
      icon: "📄",
    },
    { label: "Edit", icon: "✏️" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading insurance requirement details..." />
      </div>
    );
  }

  if (error && !insuranceRequirement) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems.slice(0, -2)} />
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/insurance-requirements")}
          >
            ← Back to Insurance Requirements
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
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          ✏️ Edit Insurance Requirement
        </h1>
        {hasChanges && (
          <div
            style={{
              fontSize: "14px",
              color: theme.colors.warning,
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ⚠️ Unsaved changes
          </div>
        )}
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

        {/* System Information Display */}
        {insuranceRequirement && (
          <Card
            title="System Information"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label style={globalStyles.label}>Created At</label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.createdAt || "Not available"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Created By</label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.createdByUserName || "Not available"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Last Modified</label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.modifiedAt || "Not available"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Modified By</label>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {insuranceRequirement.modifiedByUserName || "Not available"}
                </div>
              </div>
            </div>
          </Card>
        )}

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
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? (
                <>
                  <span style={{ marginRight: "8px" }}>Updating...</span>⏳
                </>
              ) : (
                <>
                  <span style={{ marginRight: "8px" }}>
                    Update Insurance Requirement
                  </span>
                  ✅
                </>
              )}
            </Button>
          </div>

          {!hasChanges && !isSubmitting && (
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Make changes above to enable the update button
            </div>
          )}
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
              Updating Insurance Requirement...
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

export default SettingInsuranceRequirementUpdatePage;

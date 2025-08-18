// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Modal,
} from "../../../../components/UI";

function AdminCustomerAddStep1PartAPage() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Clear form data on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  // Create specific handlers for each field
  const handleFieldChange = (fieldName) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  // Event handling
  const onAddClientClick = () => {
    console.log("Navigate to add client step 2");
    navigate("/admin/customers/add/step-2");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (
      !formData.firstName &&
      !formData.lastName &&
      !formData.email &&
      !formData.phone
    ) {
      setError("Please enter at least one search criteria");
      return;
    }

    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams();
    if (formData.firstName) searchParams.append("fn", formData.firstName);
    if (formData.lastName) searchParams.append("ln", formData.lastName);
    if (formData.email) searchParams.append("e", formData.email);
    if (formData.phone) searchParams.append("p", formData.phone);

    navigate(`/admin/customers/add/step-1-results?${searchParams.toString()}`);
  };

  const handleCancel = () => {
    if (
      formData.firstName ||
      formData.lastName ||
      formData.email ||
      formData.phone
    ) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/customers");
    }
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
          { path: "/admin/customers", label: "Customers", icon: "👥" },
          { label: "New Customer", icon: "➕" },
        ]}
      />

      {/* Progress Indicator */}
      <Card>
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Step 1 of 6
          </p>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "17%",
                height: "100%",
                backgroundColor: theme.colors.success,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#6c757d", marginTop: "5px" }}>
            17% Complete
          </p>
        </div>
      </Card>

      <Card title="🔍 Search for Existing Customer">
        {/* Cancel Warning Modal */}
        {showCancelWarning && (
          <Modal
            isOpen={showCancelWarning}
            onClose={() => setShowCancelWarning(false)}
            title="Are you sure?"
          >
            <p>
              Your Customer record will be cancelled and your work will be lost.
              This cannot be undone. Do you want to continue?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button
                variant="success"
                onClick={() => navigate("/admin/customers")}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCancelWarning(false)}
              >
                No
              </Button>
            </div>
          </Modal>
        )}

        {/* Error Messages */}
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Overlay */}
        {isLoading && <Loading message="Searching..." />}

        {/* Form */}
        <form onSubmit={onSubmitClick}>
          <div style={{ opacity: isLoading ? 0.6 : 1 }}>
            {/* Search Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={handleFieldChange("firstName")}
                error={errors.firstName}
                placeholder="Enter first name"
                disabled={isLoading}
              />

              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={handleFieldChange("lastName")}
                error={errors.lastName}
                placeholder="Enter last name"
                disabled={isLoading}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleFieldChange("email")}
                error={errors.email}
                placeholder="Enter email address"
                disabled={isLoading}
              />

              <Input
                label="Phone"
                value={formData.phone}
                onChange={handleFieldChange("phone")}
                error={errors.phone}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>

            {/* Form Info */}
            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.infoBg,
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#0c5460",
              }}
            >
              <strong>💡 Tip:</strong> Enter any combination of the fields above
              to search for existing customers. If no matches are found, you can
              proceed to add a new customer.
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                paddingTop: "20px",
                borderTop: "1px solid #eee",
              }}
            >
              <Link
                to="/admin/customers"
                style={{
                  textDecoration: "none",
                  color: theme.colors.secondary,
                  fontSize: "14px",
                }}
              >
                ← Back to Customers
              </Link>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? "Searching..." : "🔍 Search"}
                </Button>
              </div>
            </div>

            {/* OR Divider */}
            <div
              style={{
                textAlign: "center",
                margin: "30px 0",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  height: "1px",
                  backgroundColor: "#ddd",
                }}
              />
              <span
                style={{
                  background: "white",
                  padding: "0 20px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#6c757d",
                  position: "relative",
                }}
              >
                OR
              </span>
            </div>

            {/* Add New Customer Button */}
            <div style={{ textAlign: "center" }}>
              <Button
                type="button"
                variant="success"
                onClick={onAddClientClick}
                disabled={isLoading}
                style={{ fontSize: "16px", padding: "12px 24px" }}
              >
                ➕ Add New Customer
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Help Section */}
      <Card title="💡 Search Tips" style={{ marginTop: "30px" }}>
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <ul style={{ marginLeft: "20px" }}>
            <li>Enter partial names to find similar matches</li>
            <li>Use email or phone number for exact matches</li>
            <li>Leave fields empty that you don't want to search by</li>
            <li>Search is case-insensitive</li>
            <li>
              If no results are found, you can create a new customer record
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep1PartAPage;

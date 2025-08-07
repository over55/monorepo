// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  FormGroup,
} from "../../../../components/UI";

// Customer type constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const CLIENT_PHONE_TYPE_WORK = 1;

// Organization type options
const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

// Phone type options
const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Work" },
  { value: 2, label: "Home" },
  { value: 3, label: "Mobile" },
];

function AdminCustomerAddStep3Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Form state
  const [formData, setFormData] = useState({
    organizationName: customerData.organizationName || "",
    organizationType: customerData.organizationType || 0,
    firstName: customerData.firstName || "",
    lastName: customerData.lastName || "",
    email: customerData.email || "",
    phone: customerData.phone || "",
    phoneType: customerData.phoneType || 0,
    phoneExtension: customerData.phoneExtension || "",
    otherPhone: customerData.otherPhone || "",
    otherPhoneType: customerData.otherPhoneType || 0,
    otherPhoneExtension: customerData.otherPhoneExtension || "",
    isOkToText: customerData.isOkToText || false,
    isOkToEmail: customerData.isOkToEmail || false,
  });

  // Component state
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(false);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit: Beginning...");
    let newErrors = {};

    // Validation
    if (customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      if (!formData.organizationName) {
        newErrors.organizationName = "Organization name is required";
      }
      if (formData.organizationType === 0) {
        newErrors.organizationType = "Organization type is required";
      }
    }
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }
    if (formData.phoneType === 0) {
      newErrors.phoneType = "Phone type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save data to sessionStorage
    const updatedCustomerData = {
      ...customerData,
      ...formData,
    };

    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );

    // Navigate to next step
    navigate("/admin/customers/add/step-4");
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Customers", path: "/admin/customers", icon: "👥" },
    { label: "New", icon: "➕" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "20px 0" }}>
        👥 New Customer
      </h1>

      {/* Progress Wizard */}
      <nav className="box has-background-light mb-5">
        <p className="subtitle is-5">Step 3 of 6</p>
        <progress className="progress is-success" value="50" max="100">
          50%
        </progress>
      </nav>

      <Card>
        <form onSubmit={handleSubmit}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            🆔 Contact Information
          </h2>
          <p style={{ color: "#888", marginBottom: "30px" }}>
            Please fill out all the required fields before continuing.
          </p>

          {loading ? (
            <Loading message="Loading..." />
          ) : (
            <>
              {error && (
                <Alert type="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Organization fields for commercial customers */}
                {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                  <>
                    <FormGroup>
                      <label style={globalStyles.label}>
                        Organization Name{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter organization name"
                        value={formData.organizationName}
                        onChange={(e) =>
                          handleInputChange("organizationName", e.target.value)
                        }
                        style={{
                          ...globalStyles.input,
                          borderColor: formErrors.organizationName
                            ? theme.colors.error
                            : "#ddd",
                        }}
                      />
                      {formErrors.organizationName && (
                        <div style={globalStyles.errorMessage}>
                          {formErrors.organizationName}
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <label style={globalStyles.label}>
                        Organization Type{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) =>
                          handleInputChange(
                            "organizationType",
                            parseInt(e.target.value),
                          )
                        }
                        style={{
                          ...globalStyles.input,
                          borderColor: formErrors.organizationType
                            ? theme.colors.error
                            : "#ddd",
                        }}
                      >
                        {CLIENT_ORGANIZATION_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.organizationType && (
                        <div style={globalStyles.errorMessage}>
                          {formErrors.organizationType}
                        </div>
                      )}
                    </FormGroup>
                  </>
                )}

                <FormGroup>
                  <label style={globalStyles.label}>
                    First Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    style={{
                      ...globalStyles.input,
                      borderColor: formErrors.firstName
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  />
                  {formErrors.firstName && (
                    <div style={globalStyles.errorMessage}>
                      {formErrors.firstName}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Last Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    style={{
                      ...globalStyles.input,
                      borderColor: formErrors.lastName
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  />
                  {formErrors.lastName && (
                    <div style={globalStyles.errorMessage}>
                      {formErrors.lastName}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: formErrors.email
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  />
                  <p className="help">
                    If not set, a temporary email will be generated.
                  </p>
                  {formErrors.email && (
                    <div style={globalStyles.errorMessage}>
                      {formErrors.email}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginTop: "25px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isOkToEmail}
                      onChange={(e) =>
                        handleInputChange("isOkToEmail", e.target.checked)
                      }
                      style={{ marginRight: "10px" }}
                    />
                    I agree to receive electronic email
                  </label>
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Phone <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: formErrors.phone
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  />
                  {formErrors.phone && (
                    <div style={globalStyles.errorMessage}>
                      {formErrors.phone}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Phone Type <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.phoneType}
                    onChange={(e) =>
                      handleInputChange("phoneType", parseInt(e.target.value))
                    }
                    style={{
                      ...globalStyles.input,
                      borderColor: formErrors.phoneType
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  >
                    {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.phoneType && (
                    <div style={globalStyles.errorMessage}>
                      {formErrors.phoneType}
                    </div>
                  )}
                </FormGroup>

                {formData.phoneType === CLIENT_PHONE_TYPE_WORK && (
                  <FormGroup>
                    <label style={globalStyles.label}>
                      Phone Extension (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 123"
                      value={formData.phoneExtension}
                      onChange={(e) =>
                        handleInputChange("phoneExtension", e.target.value)
                      }
                      style={globalStyles.input}
                    />
                  </FormGroup>
                )}

                <FormGroup>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginTop: "25px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isOkToText}
                      onChange={(e) =>
                        handleInputChange("isOkToText", e.target.checked)
                      }
                      style={{ marginRight: "10px" }}
                    />
                    I agree to receive texts to my phone
                  </label>
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Other Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter other phone number"
                    value={formData.otherPhone}
                    onChange={(e) =>
                      handleInputChange("otherPhone", e.target.value)
                    }
                    style={globalStyles.input}
                  />
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Other Phone Type (Optional)
                  </label>
                  <select
                    value={formData.otherPhoneType}
                    onChange={(e) =>
                      handleInputChange(
                        "otherPhoneType",
                        parseInt(e.target.value),
                      )
                    }
                    style={globalStyles.input}
                  >
                    {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                {formData.otherPhoneType === CLIENT_PHONE_TYPE_WORK && (
                  <FormGroup>
                    <label style={globalStyles.label}>
                      Other Phone Extension (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 456"
                      value={formData.otherPhoneExtension}
                      onChange={(e) =>
                        handleInputChange("otherPhoneExtension", e.target.value)
                      }
                      style={globalStyles.input}
                    />
                  </FormGroup>
                )}
              </div>

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
                  onClick={() => navigate("/admin/customers/add/step-2")}
                  variant="outline"
                  disabled={loading}
                >
                  ← Back
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Saving..." : "Next →"}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep3Page;

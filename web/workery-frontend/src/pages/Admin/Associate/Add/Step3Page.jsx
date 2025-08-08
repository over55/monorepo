// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  FormGroup,
} from "../../../../components/UI";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

function AdminAssociateAddStep3Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [associateType, setAssociateType] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [phoneExtension, setPhoneExtension] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToText, setIsOkToText] = useState(false);
  const [isOkToEmail, setIsOkToEmail] = useState(false);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Load existing associate creation state
    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        const associateState = JSON.parse(existing);

        setAssociateType(associateState.type || null);
        setOrganizationName(associateState.organizationName || "");
        setOrganizationType(associateState.organizationType || 0);
        setEmail(associateState.email || "");
        setPhone(associateState.phone || "");
        setPhoneType(associateState.phoneType || 0);
        setPhoneExtension(associateState.phoneExtension || "");
        setFirstName(associateState.firstName || "");
        setLastName(associateState.lastName || "");
        setOtherPhone(associateState.otherPhone || "");
        setOtherPhoneType(associateState.otherPhoneType || 0);
        setOtherPhoneExtension(associateState.otherPhoneExtension || "");
        setIsOkToText(associateState.isOkToText || false);
        setIsOkToEmail(associateState.isOkToEmail || false);
      } else {
        // No state found, redirect back to step 2
        navigate("/admin/associates/add/step-2");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-2");
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Validation for commercial associates
    if (associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      if (!organizationName.trim()) {
        newErrors.organizationName = "Organization name is required";
        hasErrors = true;
      }
      if (organizationType === 0) {
        newErrors.organizationType = "Organization type is required";
        hasErrors = true;
      }
    }

    // General validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors.phoneType = "Phone type is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Save to session storage
    const associateState = {
      type: associateType,
      organizationName,
      organizationType,
      firstName,
      lastName,
      email,
      phone,
      phoneType,
      phoneExtension,
      otherPhone,
      otherPhoneType,
      otherPhoneExtension,
      isOkToText,
      isOkToEmail,
      // Keep any existing data from previous steps
      ...getExistingState(),
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-4");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ general: "Failed to save data. Please try again." });
    }
  };

  const getExistingState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      return existing ? JSON.parse(existing) : {};
    } catch (error) {
      return {};
    }
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    { label: "New", icon: "➕" },
  ];

  const organizationTypeOptions = [
    { value: 0, label: "Please select" },
    { value: 1, label: "Private" },
    { value: 2, label: "Non-profit" },
    { value: 3, label: "Government" },
  ];

  const phoneTypeOptions = [
    { value: 0, label: "Please select" },
    { value: 1, label: "Mobile" },
    { value: 2, label: "Work" },
    { value: 3, label: "Home" },
  ];

  if (associateType === null) {
    return <Loading message="Loading..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div style={globalStyles.section}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          👷 Associates
        </h1>
        <h2 style={{ fontSize: "1.5rem", color: "#666", marginBottom: "2rem" }}>
          ➕ New Associate
        </h2>
        <hr style={{ marginBottom: "2rem" }} />
      </div>

      {/* Progress Wizard */}
      <Card
        style={{ backgroundColor: theme.colors.light, marginBottom: "2rem" }}
      >
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Step 3 of 7
        </h3>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "43%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          43%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🆔 Contact</h2>

        <p style={{ color: "#666", marginBottom: "2rem" }}>
          Please fill out all the required fields before submitting this form.
        </p>

        {isLoading ? (
          <Loading message="Submitting..." />
        ) : (
          <>
            {errors.general && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {errors.general}
              </Alert>
            )}

            <form onSubmit={onSubmitClick}>
              <div style={{ display: "grid", gap: "1rem", maxWidth: "600px" }}>
                {/* Commercial Associate Fields */}
                {associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                  <>
                    <Input
                      label="Organization Name"
                      name="organizationName"
                      placeholder="Enter organization name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      error={errors.organizationName}
                      required
                    />

                    <Select
                      label="Organization Type"
                      name="organizationType"
                      value={organizationType}
                      onChange={(e) =>
                        setOrganizationType(parseInt(e.target.value))
                      }
                      options={organizationTypeOptions}
                      error={errors.organizationType}
                      required
                    />
                  </>
                )}

                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                  required
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <FormGroup>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isOkToEmail}
                      onChange={(e) => setIsOkToEmail(e.target.checked)}
                    />
                    I agree to receive electronic email
                  </label>
                </FormGroup>

                <Input
                  label="Phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  required
                />

                <Select
                  label="Phone Type"
                  name="phoneType"
                  value={phoneType}
                  onChange={(e) => setPhoneType(parseInt(e.target.value))}
                  options={phoneTypeOptions}
                  error={errors.phoneType}
                  required
                />

                {phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
                  <Input
                    label="Phone Extension (Optional)"
                    name="phoneExtension"
                    placeholder="Enter extension"
                    value={phoneExtension}
                    onChange={(e) => setPhoneExtension(e.target.value)}
                    error={errors.phoneExtension}
                  />
                )}

                <FormGroup>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isOkToText}
                      onChange={(e) => setIsOkToText(e.target.checked)}
                    />
                    I agree to receive texts to my phone
                  </label>
                </FormGroup>

                <Input
                  label="Other Phone (Optional)"
                  name="otherPhone"
                  placeholder="Enter other phone number"
                  value={otherPhone}
                  onChange={(e) => setOtherPhone(e.target.value)}
                  error={errors.otherPhone}
                />

                {otherPhone && (
                  <Select
                    label="Other Phone Type"
                    name="otherPhoneType"
                    value={otherPhoneType}
                    onChange={(e) =>
                      setOtherPhoneType(parseInt(e.target.value))
                    }
                    options={phoneTypeOptions}
                    error={errors.otherPhoneType}
                  />
                )}

                {otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK && otherPhone && (
                  <Input
                    label="Other Phone Extension (Optional)"
                    name="otherPhoneExtension"
                    placeholder="Enter extension"
                    value={otherPhoneExtension}
                    onChange={(e) => setOtherPhoneExtension(e.target.value)}
                    error={errors.otherPhoneExtension}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/admin/associates/add/step-2"
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  <Button type="button" variant="secondary" fullWidth>
                    ← Back
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  Next →
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateAddStep3Page;

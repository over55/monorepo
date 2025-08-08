// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step5Page.jsx

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
  TextArea,
  FormGroup,
} from "../../../../components/UI";

function AdminAssociateAddStep5Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Account form data
  const [skillSets, setSkillSets] = useState([]);
  const [insuranceRequirements, setInsuranceRequirements] = useState([]);
  const [hourlySalaryDesired, setHourlySalaryDesired] = useState("");
  const [limitSpecial, setLimitSpecial] = useState("");
  const [duesDate, setDuesDate] = useState("");
  const [commercialInsuranceExpiryDate, setCommercialInsuranceExpiryDate] =
    useState("");
  const [autoInsuranceExpiryDate, setAutoInsuranceExpiryDate] = useState("");
  const [wsibNumber, setWsibNumber] = useState("");
  const [wsibInsuranceDate, setWsibInsuranceDate] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [taxId, setTaxId] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [serviceFeeId, setServiceFeeId] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState("");
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState("");
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        const associateState = JSON.parse(existing);

        setSkillSets(associateState.skillSets || []);
        setInsuranceRequirements(associateState.insuranceRequirements || []);
        setHourlySalaryDesired(associateState.hourlySalaryDesired || "");
        setLimitSpecial(associateState.limitSpecial || "");
        setDuesDate(associateState.duesDate || "");
        setCommercialInsuranceExpiryDate(
          associateState.commercialInsuranceExpiryDate || "",
        );
        setAutoInsuranceExpiryDate(
          associateState.autoInsuranceExpiryDate || "",
        );
        setWsibNumber(associateState.wsibNumber || "");
        setWsibInsuranceDate(associateState.wsibInsuranceDate || "");
        setPoliceCheck(associateState.policeCheck || "");
        setTaxId(associateState.taxId || "");
        setDriversLicenseClass(associateState.driversLicenseClass || "");
        setVehicleTypes(associateState.vehicleTypes || []);
        setServiceFeeId(associateState.serviceFeeId || "");
        setEmergencyContactName(associateState.emergencyContactName || "");
        setEmergencyContactRelationship(
          associateState.emergencyContactRelationship || "",
        );
        setEmergencyContactTelephone(
          associateState.emergencyContactTelephone || "",
        );
        setEmergencyContactAlternativeTelephone(
          associateState.emergencyContactAlternativeTelephone || "",
        );
        setDescription(associateState.description || "");
        setPreferredLanguage(associateState.preferredLanguage || "English");
        setPassword(associateState.password || "");
        setPasswordRepeated(associateState.passwordRepeated || "");
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Basic validation
    if (skillSets.length === 0) {
      newErrors.skillSets = "At least one skill set is required";
      hasErrors = true;
    }
    if (insuranceRequirements.length === 0) {
      newErrors.insuranceRequirements =
        "At least one insurance requirement is required";
      hasErrors = true;
    }
    if (!duesDate.trim()) {
      newErrors.duesDate = "Member dues date is required";
      hasErrors = true;
    }
    if (!policeCheck.trim()) {
      newErrors.policeCheck = "Police check date is required";
      hasErrors = true;
    }
    if (!serviceFeeId.trim()) {
      newErrors.serviceFeeId = "Service fee is required";
      hasErrors = true;
    }
    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
      hasErrors = true;
    }
    if (!emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
      hasErrors = true;
    }
    if (!emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
      hasErrors = true;
    }
    if (!preferredLanguage.trim()) {
      newErrors.preferredLanguage = "Preferred language is required";
      hasErrors = true;
    }
    if (password !== passwordRepeated) {
      newErrors.password = "Passwords do not match";
      newErrors.passwordRepeated = "Passwords do not match";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Save to session storage
    const associateState = {
      ...getExistingState(),
      skillSets,
      insuranceRequirements,
      hourlySalaryDesired,
      limitSpecial,
      duesDate,
      commercialInsuranceExpiryDate,
      autoInsuranceExpiryDate,
      wsibNumber,
      wsibInsuranceDate,
      policeCheck,
      taxId,
      driversLicenseClass,
      vehicleTypes,
      serviceFeeId,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactTelephone,
      emergencyContactAlternativeTelephone,
      description,
      preferredLanguage,
      password,
      passwordRepeated,
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-6");
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

  const skillSetOptions = [
    { value: "1", label: "Carpentry" },
    { value: "2", label: "Plumbing" },
    { value: "3", label: "Electrical" },
    { value: "4", label: "Painting" },
    { value: "5", label: "General Labor" },
  ];

  const insuranceOptions = [
    { value: "1", label: "General Liability" },
    { value: "2", label: "WSIB Coverage" },
    { value: "3", label: "Commercial Auto" },
  ];

  const vehicleTypeOptions = [
    { value: "1", label: "Car" },
    { value: "2", label: "Truck" },
    { value: "3", label: "Van" },
  ];

  const serviceFeeOptions = [
    { value: "", label: "Please select" },
    { value: "1", label: "Standard Rate" },
    { value: "2", label: "Premium Rate" },
    { value: "3", label: "Custom Rate" },
  ];

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
  ];

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
          Step 5 of 7
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
              width: "71%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          71%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>👷 Account</h2>

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
              <div style={{ display: "grid", gap: "2rem", maxWidth: "800px" }}>
                {/* Skill Sets Section */}
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                    🎓 Skill Sets
                  </h3>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {skillSetOptions.map((option) => (
                      <label
                        key={option.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={skillSets.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSkillSets([...skillSets, option.value]);
                            } else {
                              setSkillSets(
                                skillSets.filter((id) => id !== option.value),
                              );
                            }
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors.skillSets && (
                    <div
                      style={{
                        color: theme.colors.error,
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.skillSets}
                    </div>
                  )}
                </div>

                {/* Insurance Requirements Section */}
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                    ⚖️ Insurance Requirements
                  </h3>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {insuranceOptions.map((option) => (
                      <label
                        key={option.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={insuranceRequirements.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInsuranceRequirements([
                                ...insuranceRequirements,
                                option.value,
                              ]);
                            } else {
                              setInsuranceRequirements(
                                insuranceRequirements.filter(
                                  (id) => id !== option.value,
                                ),
                              );
                            }
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors.insuranceRequirements && (
                    <div
                      style={{
                        color: theme.colors.error,
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {errors.insuranceRequirements}
                    </div>
                  )}
                </div>

                {/* Financial Information */}
                <Input
                  label="Hourly Rate (Optional)"
                  name="hourlySalaryDesired"
                  type="number"
                  placeholder="$ / hr"
                  value={hourlySalaryDesired}
                  onChange={(e) => setHourlySalaryDesired(e.target.value)}
                  error={errors.hourlySalaryDesired}
                />

                <TextArea
                  label="Limitations or Special Considerations (Optional)"
                  name="limitSpecial"
                  placeholder="Enter any limitations or special considerations"
                  value={limitSpecial}
                  onChange={(e) => setLimitSpecial(e.target.value)}
                  error={errors.limitSpecial}
                  rows={3}
                  maxLength={638}
                />

                <Input
                  label="Member Dues Date"
                  name="duesDate"
                  type="date"
                  value={duesDate}
                  onChange={(e) => setDuesDate(e.target.value)}
                  error={errors.duesDate}
                  required
                />

                <Input
                  label="Police Check Expiry"
                  name="policeCheck"
                  type="date"
                  value={policeCheck}
                  onChange={(e) => setPoliceCheck(e.target.value)}
                  error={errors.policeCheck}
                  required
                />

                <Input
                  label="Commercial Insurance Expiry Date (Optional)"
                  name="commercialInsuranceExpiryDate"
                  type="date"
                  value={commercialInsuranceExpiryDate}
                  onChange={(e) =>
                    setCommercialInsuranceExpiryDate(e.target.value)
                  }
                  error={errors.commercialInsuranceExpiryDate}
                />

                <Input
                  label="Auto Insurance Expiry Date (Optional)"
                  name="autoInsuranceExpiryDate"
                  type="date"
                  value={autoInsuranceExpiryDate}
                  onChange={(e) => setAutoInsuranceExpiryDate(e.target.value)}
                  error={errors.autoInsuranceExpiryDate}
                />

                <Input
                  label="WSIB # (Optional)"
                  name="wsibNumber"
                  placeholder="Enter WSIB number"
                  value={wsibNumber}
                  onChange={(e) => setWsibNumber(e.target.value)}
                  error={errors.wsibNumber}
                />

                <Input
                  label="WSIB Insurance Date (Optional)"
                  name="wsibInsuranceDate"
                  type="date"
                  value={wsibInsuranceDate}
                  onChange={(e) => setWsibInsuranceDate(e.target.value)}
                  error={errors.wsibInsuranceDate}
                />

                <Input
                  label="HST # (Optional)"
                  name="taxId"
                  placeholder="Enter HST number"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  error={errors.taxId}
                />

                <Input
                  label="Driver's License Class (Optional)"
                  name="driversLicenseClass"
                  placeholder="Enter license class"
                  value={driversLicenseClass}
                  onChange={(e) => setDriversLicenseClass(e.target.value)}
                  error={errors.driversLicenseClass}
                />

                {/* Vehicle Types */}
                <div>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Vehicle Types (Optional)
                  </h4>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {vehicleTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={vehicleTypes.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVehicleTypes([...vehicleTypes, option.value]);
                            } else {
                              setVehicleTypes(
                                vehicleTypes.filter(
                                  (id) => id !== option.value,
                                ),
                              );
                            }
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <Select
                  label="Service Fee"
                  name="serviceFeeId"
                  value={serviceFeeId}
                  onChange={(e) => setServiceFeeId(e.target.value)}
                  options={serviceFeeOptions}
                  error={errors.serviceFeeId}
                  required
                />

                <Select
                  label="Preferred Language"
                  name="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  options={languageOptions}
                  error={errors.preferredLanguage}
                  required
                />

                {/* Emergency Contact Section */}
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                    👥 Emergency Contact
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <Input
                      label="Contact Name"
                      name="emergencyContactName"
                      placeholder="Enter emergency contact name"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      error={errors.emergencyContactName}
                      required
                    />

                    <Input
                      label="Contact Relationship"
                      name="emergencyContactRelationship"
                      placeholder="Enter relationship"
                      value={emergencyContactRelationship}
                      onChange={(e) =>
                        setEmergencyContactRelationship(e.target.value)
                      }
                      error={errors.emergencyContactRelationship}
                      required
                    />

                    <Input
                      label="Contact Telephone"
                      name="emergencyContactTelephone"
                      placeholder="Enter phone number"
                      value={emergencyContactTelephone}
                      onChange={(e) =>
                        setEmergencyContactTelephone(e.target.value)
                      }
                      error={errors.emergencyContactTelephone}
                      required
                    />

                    <Input
                      label="Contact Alternative Telephone (Optional)"
                      name="emergencyContactAlternativeTelephone"
                      placeholder="Enter alternative phone number"
                      value={emergencyContactAlternativeTelephone}
                      onChange={(e) =>
                        setEmergencyContactAlternativeTelephone(e.target.value)
                      }
                      error={errors.emergencyContactAlternativeTelephone}
                    />
                  </div>
                </div>

                {/* Login Credentials Section */}
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                    🔑 Login Credentials
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <Input
                      label="Password (Optional)"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                    />

                    <Input
                      label="Password Repeated (Optional)"
                      name="passwordRepeated"
                      type="password"
                      placeholder="Repeat password"
                      value={passwordRepeated}
                      onChange={(e) => setPasswordRepeated(e.target.value)}
                      error={errors.passwordRepeated}
                    />
                  </div>
                </div>

                {/* System Section */}
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                    💻 System
                  </h3>
                  <TextArea
                    label="Description (Optional)"
                    name="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={errors.description}
                    rows={4}
                    maxLength={638}
                  />
                </div>
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
                  to="/admin/associates/add/step-4"
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

export default AdminAssociateAddStep5Page;

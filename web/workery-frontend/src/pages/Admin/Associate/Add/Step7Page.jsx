// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step7Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import {
  HowHearAboutUsDisplay,
  InsuranceRequirementsDisplay,
  ServiceFeeDisplay,
  SkillSetsDisplay,
  TagsDisplay,
  VehicleTypesDisplay,
} from "../../../../components/Display";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;
const ASSOCIATE_IS_JOB_SEEKER_NO = 2;

function AdminAssociateAddStep7Page() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [associateData, setAssociateData] = useState(null);

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
        setAssociateData(associateState);
      } else {
        // No state found, redirect back to step 1
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (!associateData) {
        throw new Error("No associate data found");
      }

      // Process the data for API submission
      const processedData = processAssociateData(associateData);

      console.log("Submitting associate data:", processedData);

      // Submit to API
      const response = await associateManager.createAssociate(
        processedData,
        () => navigate("/login?unauthorized=true"),
      );

      console.log("Associate created successfully:", response);

      // Clear the session storage
      sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");

      // Show success message and redirect
      navigate(`/admin/associate/${response.id}`, {
        state: { successMessage: "Associate created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create associate:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAssociateData = (data) => {
    // Convert dates to proper ISO format and handle data transformation
    const processed = { ...data };

    // Handle date conversions - only convert if not already in ISO format
    if (processed.duesDate && !processed.duesDate.includes("T")) {
      processed.duesDate = new Date(processed.duesDate).toISOString();
    }
    if (processed.policeCheck && !processed.policeCheck.includes("T")) {
      processed.policeCheck = new Date(processed.policeCheck).toISOString();
    }
    if (processed.birthDate && !processed.birthDate.includes("T")) {
      processed.birthDate = new Date(processed.birthDate).toISOString();
    }
    if (processed.joinDate && !processed.joinDate.includes("T")) {
      processed.joinDate = new Date(processed.joinDate).toISOString();
    }
    if (
      processed.commercialInsuranceExpiryDate &&
      !processed.commercialInsuranceExpiryDate.includes("T")
    ) {
      processed.commercialInsuranceExpiryDate = new Date(
        processed.commercialInsuranceExpiryDate,
      ).toISOString();
    }
    if (
      processed.autoInsuranceExpiryDate &&
      !processed.autoInsuranceExpiryDate.includes("T")
    ) {
      processed.autoInsuranceExpiryDate = new Date(
        processed.autoInsuranceExpiryDate,
      ).toISOString();
    }
    if (
      processed.wsibInsuranceDate &&
      !processed.wsibInsuranceDate.includes("T")
    ) {
      processed.wsibInsuranceDate = new Date(
        processed.wsibInsuranceDate,
      ).toISOString();
    }
    if (
      processed.dateOfEntryIntoCountry &&
      !processed.dateOfEntryIntoCountry.includes("T")
    ) {
      processed.dateOfEntryIntoCountry = new Date(
        processed.dateOfEntryIntoCountry,
      ).toISOString();
    }

    // Convert string arrays to proper arrays
    if (typeof processed.skillSets === "string") {
      processed.skillSets = processed.skillSets
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.insuranceRequirements === "string") {
      processed.insuranceRequirements = processed.insuranceRequirements
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.vehicleTypes === "string") {
      processed.vehicleTypes = processed.vehicleTypes
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.tags === "string") {
      processed.tags = processed.tags
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    if (typeof processed.identifyAs === "string") {
      processed.identifyAs = processed.identifyAs
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter(Boolean);
    } else if (Array.isArray(processed.identifyAs)) {
      // Ensure identifyAs array contains integers
      processed.identifyAs = processed.identifyAs.map((id) =>
        typeof id === "string" ? parseInt(id) : id,
      );
    }

    // Convert numeric fields - IMPORTANT: Convert string values to integers
    if (processed.hourlySalaryDesired) {
      processed.hourlySalaryDesired = parseInt(processed.hourlySalaryDesired);
    }

    // Convert all int8 fields from strings/numbers to ensure they are integers
    if (
      processed.statusInCountry !== undefined &&
      processed.statusInCountry !== "" &&
      processed.statusInCountry !== 0
    ) {
      processed.statusInCountry = parseInt(processed.statusInCountry);
    }
    if (
      processed.maritalStatus !== undefined &&
      processed.maritalStatus !== "" &&
      processed.maritalStatus !== 0
    ) {
      processed.maritalStatus = parseInt(processed.maritalStatus);
    }
    if (
      processed.accomplishedEducation !== undefined &&
      processed.accomplishedEducation !== "" &&
      processed.accomplishedEducation !== 0
    ) {
      processed.accomplishedEducation = parseInt(
        processed.accomplishedEducation,
      );
    }
    if (processed.gender !== undefined && processed.gender !== 0) {
      processed.gender = parseInt(processed.gender);
    }
    if (processed.type !== undefined) {
      processed.type = parseInt(processed.type);
    }
    if (
      processed.organizationType !== undefined &&
      processed.organizationType !== 0
    ) {
      processed.organizationType = parseInt(processed.organizationType);
    }
    if (processed.phoneType !== undefined) {
      processed.phoneType = parseInt(processed.phoneType);
    }
    if (
      processed.otherPhoneType !== undefined &&
      processed.otherPhoneType !== 0
    ) {
      processed.otherPhoneType = parseInt(processed.otherPhoneType);
    }
    if (processed.isJobSeeker !== undefined) {
      processed.isJobSeeker = parseInt(processed.isJobSeeker);
    }

    // Remove empty/zero values for optional numeric fields to avoid sending 0 when field should be null
    if (processed.statusInCountry === 0) delete processed.statusInCountry;
    if (processed.maritalStatus === 0) delete processed.maritalStatus;
    if (processed.accomplishedEducation === 0)
      delete processed.accomplishedEducation;
    if (processed.otherPhoneType === 0) delete processed.otherPhoneType;
    if (processed.organizationType === 0) delete processed.organizationType;

    return processed;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 2:
        return "Residential";
      case 3:
        return "Commercial";
      default:
        return "Unknown";
    }
  };

  const getPhoneTypeLabel = (phoneType) => {
    switch (phoneType) {
      case 1:
        return "Mobile";
      case 2:
        return "Work";
      case 3:
        return "Home";
      default:
        return "Unknown";
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 1:
        return "Other";
      case 2:
        return "Male";
      case 3:
        return "Female";
      default:
        return "Unknown";
    }
  };

  // Helper function to parse array values
  const parseArrayValue = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return [];
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    { label: "New", icon: "➕" },
  ];

  if (!associateData) {
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
        style={{
          backgroundColor: theme.colors.successBg,
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Step 7 of 7
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
              width: "100%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          100%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          ❓ Are you ready to submit?
        </h2>

        <p style={{ color: "#666", marginBottom: "2rem" }}>
          Please carefully review the following associate details and if you are
          ready click the <strong>Submit</strong> button to complete.
        </p>

        {isLoading ? (
          <Loading message="Creating associate..." />
        ) : (
          <>
            {errors.message && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {errors.message}
              </Alert>
            )}

            <div style={{ display: "grid", gap: "2rem" }}>
              {/* Contact Information */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ fontSize: "1.3rem", margin: 0 }}>
                    🆔 Contact Information
                  </h3>
                  <Link
                    to="/admin/associates/add/step-3"
                    style={{
                      color: theme.colors.primary,
                      textDecoration: "none",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <strong>Type:</strong> {getTypeLabel(associateData.type)}
                  </div>

                  {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                    <>
                      <div>
                        <strong>Organization Name:</strong>{" "}
                        {associateData.organizationName}
                      </div>
                      <div>
                        <strong>Organization Type:</strong>{" "}
                        {associateData.organizationType}
                      </div>
                    </>
                  )}

                  <div>
                    <strong>First Name:</strong> {associateData.firstName}
                  </div>
                  <div>
                    <strong>Last Name:</strong> {associateData.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> {associateData.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {associateData.phone} (
                    {getPhoneTypeLabel(associateData.phoneType)})
                  </div>

                  {associateData.phoneType === ASSOCIATE_PHONE_TYPE_WORK &&
                    associateData.phoneExtension && (
                      <div>
                        <strong>Phone Extension:</strong>{" "}
                        {associateData.phoneExtension}
                      </div>
                    )}

                  <div>
                    <strong>OK to Email:</strong>{" "}
                    {associateData.isOkToEmail ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>OK to Text:</strong>{" "}
                    {associateData.isOkToText ? "Yes" : "No"}
                  </div>

                  {associateData.otherPhone && (
                    <div>
                      <strong>Other Phone:</strong> {associateData.otherPhone} (
                      {getPhoneTypeLabel(associateData.otherPhoneType)})
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ fontSize: "1.3rem", margin: 0 }}>📍 Address</h3>
                  <Link
                    to="/admin/associates/add/step-4"
                    style={{
                      color: theme.colors.primary,
                      textDecoration: "none",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <strong>Address:</strong> {associateData.addressLine1}
                  </div>
                  {associateData.addressLine2 && (
                    <div>
                      <strong>Address Line 2:</strong>{" "}
                      {associateData.addressLine2}
                    </div>
                  )}
                  <div>
                    <strong>City:</strong> {associateData.city}
                  </div>
                  <div>
                    <strong>Province/Territory:</strong> {associateData.region}
                  </div>
                  <div>
                    <strong>Postal Code:</strong> {associateData.postalCode}
                  </div>
                  <div>
                    <strong>Country:</strong> {associateData.country}
                  </div>

                  {associateData.hasShippingAddress && (
                    <>
                      <hr style={{ margin: "1rem 0" }} />
                      <div>
                        <strong>Shipping Address:</strong>
                      </div>
                      <div>
                        <strong>Name:</strong> {associateData.shippingName}
                      </div>
                      <div>
                        <strong>Phone:</strong> {associateData.shippingPhone}
                      </div>
                      <div>
                        <strong>Address:</strong>{" "}
                        {associateData.shippingAddressLine1}
                      </div>
                      {associateData.shippingAddressLine2 && (
                        <div>
                          <strong>Address Line 2:</strong>{" "}
                          {associateData.shippingAddressLine2}
                        </div>
                      )}
                      <div>
                        <strong>City:</strong> {associateData.shippingCity}
                      </div>
                      <div>
                        <strong>Province/Territory:</strong>{" "}
                        {associateData.shippingRegion}
                      </div>
                      <div>
                        <strong>Postal Code:</strong>{" "}
                        {associateData.shippingPostalCode}
                      </div>
                      <div>
                        <strong>Country:</strong>{" "}
                        {associateData.shippingCountry}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ fontSize: "1.3rem", margin: 0 }}>
                    👷 Account Information
                  </h3>
                  <Link
                    to="/admin/associates/add/step-5"
                    style={{
                      color: theme.colors.primary,
                      textDecoration: "none",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  {/* Skill Sets Display */}
                  {associateData.skillSets && (
                    <SkillSetsDisplay
                      values={parseArrayValue(associateData.skillSets)}
                      label="Skill Sets"
                      variant="primary"
                    />
                  )}

                  {/* Insurance Requirements Display */}
                  {associateData.insuranceRequirements && (
                    <InsuranceRequirementsDisplay
                      values={parseArrayValue(
                        associateData.insuranceRequirements,
                      )}
                      label="Insurance Requirements"
                      variant="info"
                    />
                  )}

                  {/* Vehicle Types Display */}
                  {associateData.vehicleTypes && (
                    <VehicleTypesDisplay
                      values={parseArrayValue(associateData.vehicleTypes)}
                      label="Vehicle Types"
                      variant="warning"
                    />
                  )}

                  {/* Service Fee Display */}
                  {associateData.serviceFeeId && (
                    <ServiceFeeDisplay
                      value={associateData.serviceFeeId}
                      label="Service Fee"
                      showAmount={true}
                    />
                  )}

                  {associateData.hourlySalaryDesired && (
                    <div>
                      <strong>Hourly Rate:</strong> $
                      {associateData.hourlySalaryDesired}/hr
                    </div>
                  )}

                  <div>
                    <strong>Member Dues Date:</strong> {associateData.duesDate}
                  </div>
                  <div>
                    <strong>Police Check Expiry:</strong>{" "}
                    {associateData.policeCheck}
                  </div>

                  {associateData.emergencyContactName && (
                    <>
                      <hr style={{ margin: "1rem 0" }} />
                      <div>
                        <strong>Emergency Contact:</strong>
                      </div>
                      <div>
                        <strong>Name:</strong>{" "}
                        {associateData.emergencyContactName}
                      </div>
                      <div>
                        <strong>Relationship:</strong>{" "}
                        {associateData.emergencyContactRelationship}
                      </div>
                      <div>
                        <strong>Phone:</strong>{" "}
                        {associateData.emergencyContactTelephone}
                      </div>
                    </>
                  )}

                  <div>
                    <strong>Preferred Language:</strong>{" "}
                    {associateData.preferredLanguage}
                  </div>
                </div>
              </div>

              {/* Job Seeker & Metrics */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ fontSize: "1.3rem", margin: 0 }}>
                    📊 Job Seeker & Metrics
                  </h3>
                  <Link
                    to="/admin/associates/add/step-6"
                    style={{
                      color: theme.colors.primary,
                      textDecoration: "none",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                    borderRadius: "8px",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <strong>Is Job Seeker:</strong>{" "}
                    {associateData.isJobSeeker === ASSOCIATE_IS_JOB_SEEKER_YES
                      ? "Yes"
                      : "No"}
                  </div>

                  {associateData.isJobSeeker ===
                    ASSOCIATE_IS_JOB_SEEKER_YES && (
                    <>
                      <div>
                        <strong>Status in Country:</strong>{" "}
                        {associateData.statusInCountry}
                      </div>
                      {associateData.maritalStatus && (
                        <div>
                          <strong>Marital Status:</strong>{" "}
                          {associateData.maritalStatus}
                        </div>
                      )}
                      {associateData.accomplishedEducation && (
                        <div>
                          <strong>Education Level:</strong>{" "}
                          {associateData.accomplishedEducation}
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <strong>Gender:</strong>{" "}
                    {getGenderLabel(associateData.gender)}
                  </div>
                  {associateData.gender === 1 && (
                    <div>
                      <strong>Gender (Other):</strong>{" "}
                      {associateData.genderOther}
                    </div>
                  )}

                  <div>
                    <strong>Birth Date:</strong> {associateData.birthDate}
                  </div>

                  {/* How Heard About Us Display */}
                  {associateData.howDidYouHearAboutUsID && (
                    <HowHearAboutUsDisplay
                      value={associateData.howDidYouHearAboutUsID}
                      label="How did you hear about us?"
                    />
                  )}

                  {/* Tags Display */}
                  {associateData.tags && (
                    <TagsDisplay
                      values={parseArrayValue(associateData.tags)}
                      label="Tags"
                      variant="success"
                    />
                  )}
                </div>
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
                to="/admin/associates/add/step-6"
                style={{ flex: "1", minWidth: "150px" }}
              >
                <Button type="button" variant="secondary" fullWidth>
                  ← Back
                </Button>
              </Link>
              <Button
                onClick={onSubmitClick}
                variant="success"
                style={{ flex: "1", minWidth: "150px" }}
                disabled={isLoading}
              >
                ✅ Submit
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateAddStep7Page;

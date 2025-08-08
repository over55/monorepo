// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step4Page.jsx

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

function AdminAssociateAddStep4Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Address form data
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Canada");
  const [hasShippingAddress, setHasShippingAddress] = useState(false);

  // Shipping address data
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Canada");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

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

        // Load billing address
        setPostalCode(associateState.postalCode || "");
        setAddressLine1(associateState.addressLine1 || "");
        setAddressLine2(associateState.addressLine2 || "");
        setCity(associateState.city || "");
        setRegion(associateState.region || "");
        setCountry(associateState.country || "Canada");
        setHasShippingAddress(associateState.hasShippingAddress || false);

        // Load shipping address
        setShippingName(associateState.shippingName || "");
        setShippingPhone(associateState.shippingPhone || "");
        setShippingCountry(associateState.shippingCountry || "Canada");
        setShippingRegion(associateState.shippingRegion || "");
        setShippingCity(associateState.shippingCity || "");
        setShippingAddressLine1(associateState.shippingAddressLine1 || "");
        setShippingAddressLine2(associateState.shippingAddressLine2 || "");
        setShippingPostalCode(associateState.shippingPostalCode || "");
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

    // Billing address validation
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
      hasErrors = true;
    }
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
      hasErrors = true;
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!region.trim()) {
      newErrors.region = "Province/Territory is required";
      hasErrors = true;
    }
    if (!country.trim()) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }

    // Shipping address validation (if enabled)
    if (hasShippingAddress) {
      if (!shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
        hasErrors = true;
      }
      if (!shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
        hasErrors = true;
      }
      if (!shippingCountry.trim()) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
        hasErrors = true;
      }
      if (!shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
        hasErrors = true;
      }
      if (!shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
        hasErrors = true;
      }
      if (!shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Save to session storage
    const associateState = {
      ...getExistingState(),
      postalCode,
      addressLine1,
      addressLine2,
      city,
      region,
      country,
      hasShippingAddress,
      shippingName,
      shippingPhone,
      shippingCountry,
      shippingRegion,
      shippingCity,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingPostalCode,
    };

    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-5");
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

  const countryOptions = [
    { value: "Canada", label: "Canada" },
    { value: "United States", label: "United States" },
    { value: "Mexico", label: "Mexico" },
  ];

  const regionOptions = [
    { value: "", label: "Please select" },
    { value: "Alberta", label: "Alberta" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Manitoba", label: "Manitoba" },
    { value: "New Brunswick", label: "New Brunswick" },
    { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
    { value: "Northwest Territories", label: "Northwest Territories" },
    { value: "Nova Scotia", label: "Nova Scotia" },
    { value: "Nunavut", label: "Nunavut" },
    { value: "Ontario", label: "Ontario" },
    { value: "Prince Edward Island", label: "Prince Edward Island" },
    { value: "Quebec", label: "Quebec" },
    { value: "Saskatchewan", label: "Saskatchewan" },
    { value: "Yukon", label: "Yukon" },
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
          Step 4 of 7
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
              width: "57%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          57%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📍 Address</h2>

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
                    checked={hasShippingAddress}
                    onChange={(e) => setHasShippingAddress(e.target.checked)}
                  />
                  Has shipping address different from billing address
                </label>
              </FormGroup>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: hasShippingAddress ? "1fr 1fr" : "1fr",
                  gap: "2rem",
                  marginTop: "1rem",
                }}
              >
                {/* Billing Address */}
                <div>
                  {hasShippingAddress && (
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        marginBottom: "1rem",
                        color: "#666",
                      }}
                    >
                      Billing Address
                    </h3>
                  )}

                  <div style={{ display: "grid", gap: "1rem" }}>
                    <Select
                      label="Country"
                      name="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      options={countryOptions}
                      error={errors.country}
                      required
                    />

                    <Select
                      label="Province/Territory"
                      name="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      options={regionOptions}
                      error={errors.region}
                      required
                    />

                    <Input
                      label="City"
                      name="city"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      error={errors.city}
                      required
                    />

                    <Input
                      label="Address Line 1"
                      name="addressLine1"
                      placeholder="Enter street address"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      error={errors.addressLine1}
                      required
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      name="addressLine2"
                      placeholder="Apartment, suite, etc."
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      error={errors.addressLine2}
                    />

                    <Input
                      label="Postal Code"
                      name="postalCode"
                      placeholder="Enter postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      error={errors.postalCode}
                      required
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                {hasShippingAddress && (
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        marginBottom: "1rem",
                        color: "#666",
                      }}
                    >
                      Shipping Address
                    </h3>

                    <div style={{ display: "grid", gap: "1rem" }}>
                      <Input
                        label="Name"
                        name="shippingName"
                        placeholder="Contact name for shipping"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        error={errors.shippingName}
                        required
                      />

                      <Input
                        label="Phone"
                        name="shippingPhone"
                        placeholder="Contact phone for shipping"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        error={errors.shippingPhone}
                        required
                      />

                      <Select
                        label="Country"
                        name="shippingCountry"
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        options={countryOptions}
                        error={errors.shippingCountry}
                        required
                      />

                      <Select
                        label="Province/Territory"
                        name="shippingRegion"
                        value={shippingRegion}
                        onChange={(e) => setShippingRegion(e.target.value)}
                        options={regionOptions}
                        error={errors.shippingRegion}
                        required
                      />

                      <Input
                        label="City"
                        name="shippingCity"
                        placeholder="Enter city"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        error={errors.shippingCity}
                        required
                      />

                      <Input
                        label="Address Line 1"
                        name="shippingAddressLine1"
                        placeholder="Enter street address"
                        value={shippingAddressLine1}
                        onChange={(e) =>
                          setShippingAddressLine1(e.target.value)
                        }
                        error={errors.shippingAddressLine1}
                        required
                      />

                      <Input
                        label="Address Line 2 (Optional)"
                        name="shippingAddressLine2"
                        placeholder="Apartment, suite, etc."
                        value={shippingAddressLine2}
                        onChange={(e) =>
                          setShippingAddressLine2(e.target.value)
                        }
                        error={errors.shippingAddressLine2}
                      />

                      <Input
                        label="Postal Code"
                        name="shippingPostalCode"
                        placeholder="Enter postal code"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        error={errors.shippingPostalCode}
                        required
                      />
                    </div>
                  </div>
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
                  to="/admin/associates/add/step-3"
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

export default AdminAssociateAddStep4Page;

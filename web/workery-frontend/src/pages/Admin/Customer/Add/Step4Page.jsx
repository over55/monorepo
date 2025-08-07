// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  FormGroup,
} from "../../../../components/UI";

// Country options
const COUNTRY_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Region options for Canada
const CANADA_REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "YT", label: "Yukon" },
];

// Region options for US
const US_REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  // Add more states as needed...
];

function AdminCustomerAddStep4Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [postalCode, setPostalCode] = useState(customerData.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(
    customerData.addressLine1 || "",
  );
  const [addressLine2, setAddressLine2] = useState(
    customerData.addressLine2 || "",
  );
  const [city, setCity] = useState(customerData.city || "");
  const [region, setRegion] = useState(customerData.region || "");
  const [country, setCountry] = useState(customerData.country || "CA");
  const [hasShippingAddress, setHasShippingAddress] = useState(
    customerData.hasShippingAddress || false,
  );
  const [shippingName, setShippingName] = useState(
    customerData.shippingName || "",
  );
  const [shippingPhone, setShippingPhone] = useState(
    customerData.shippingPhone || "",
  );
  const [shippingCountry, setShippingCountry] = useState(
    customerData.shippingCountry || "CA",
  );
  const [shippingRegion, setShippingRegion] = useState(
    customerData.shippingRegion || "",
  );
  const [shippingCity, setShippingCity] = useState(
    customerData.shippingCity || "",
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    customerData.shippingAddressLine1 || "",
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    customerData.shippingAddressLine2 || "",
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    customerData.shippingPostalCode || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  // Get region options based on selected country
  const getRegionOptions = (selectedCountry) => {
    switch (selectedCountry) {
      case "CA":
        return CANADA_REGION_OPTIONS;
      case "US":
        return US_REGION_OPTIONS;
      default:
        return [{ value: "", label: "Please select" }];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit: Beginning...");

    let newErrors = {};

    // Validation for billing address
    if (!country) newErrors.country = "Country is required";
    if (!region) newErrors.region = "Province/Territory is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!addressLine1.trim())
      newErrors.addressLine1 = "Address Line 1 is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required";

    // Validation for shipping address if enabled
    if (hasShippingAddress) {
      if (!shippingName.trim()) newErrors.shippingName = "Name is required";
      if (!shippingPhone.trim()) newErrors.shippingPhone = "Phone is required";
      if (!shippingCountry) newErrors.shippingCountry = "Country is required";
      if (!shippingRegion)
        newErrors.shippingRegion = "Province/Territory is required";
      if (!shippingCity.trim()) newErrors.shippingCity = "City is required";
      if (!shippingAddressLine1.trim())
        newErrors.shippingAddressLine1 = "Address Line 1 is required";
      if (!shippingPostalCode.trim())
        newErrors.shippingPostalCode = "Postal Code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      console.log("handleSubmit: Ending with error.");
      return;
    }

    setErrors({});

    // Save data to sessionStorage
    const updatedCustomerData = {
      ...customerData,
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

    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    console.log("handleSubmit: Ending with success.");

    // Navigate to next step
    navigate("/admin/customers/add/step-5");
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Customers", path: "/admin/customers", icon: "👥" },
    { label: "New", icon: "➕" },
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
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          ➕ New Customer
        </h1>
      </div>

      <div
        style={{
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
          marginBottom: "20px",
        }}
      >
        <p style={{ ...globalStyles.label, marginBottom: "0.5rem" }}>
          Step 4 of 6: Address
        </p>
        <progress
          style={{ width: "100%" }}
          className="progress is-success"
          value="67"
          max="100"
        >
          67%
        </progress>
      </div>

      <Card>
        {isFetching ? (
          <Loading message="Saving..." />
        ) : (
          <form onSubmit={handleSubmit}>
            {errors.message && (
              <Alert
                type="error"
                onClose={() => setErrors((prev) => ({ ...prev, message: "" }))}
              >
                {errors.message}
              </Alert>
            )}

            <FormGroup>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={hasShippingAddress}
                  onChange={(e) => setHasShippingAddress(e.target.checked)}
                  style={{ marginRight: "10px" }}
                />
                Has shipping address different than billing address
              </label>
            </FormGroup>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: hasShippingAddress ? "1fr 1fr" : "1fr",
                gap: "40px",
                marginTop: "20px",
              }}
            >
              {/* Billing Address Column */}
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "10px",
                  }}
                >
                  {hasShippingAddress ? "Billing Address" : "Address"}
                </h3>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Country <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.country ? theme.colors.error : "#ddd",
                    }}
                  >
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <div style={globalStyles.errorMessage}>
                      {errors.country}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Province/Territory <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.region ? theme.colors.error : "#ddd",
                    }}
                  >
                    {getRegionOptions(country).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <div style={globalStyles.errorMessage}>{errors.region}</div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    City <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toronto"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.city ? theme.colors.error : "#ddd",
                    }}
                  />
                  {errors.city && (
                    <div style={globalStyles.errorMessage}>{errors.city}</div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Address Line 1 <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.addressLine1
                        ? theme.colors.error
                        : "#ddd",
                    }}
                  />
                  {errors.addressLine1 && (
                    <div style={globalStyles.errorMessage}>
                      {errors.addressLine1}
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>Address Line 2</label>
                  <input
                    type="text"
                    placeholder="e.g. Apt 4B"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    style={globalStyles.input}
                  />
                </FormGroup>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Postal Code <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A1A 1A1"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.postalCode
                        ? theme.colors.error
                        : "#ddd",
                      maxWidth: "150px",
                    }}
                  />
                  {errors.postalCode && (
                    <div style={globalStyles.errorMessage}>
                      {errors.postalCode}
                    </div>
                  )}
                </FormGroup>
              </div>

              {/* Shipping Address Column */}
              {hasShippingAddress && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginBottom: "20px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                    }}
                  >
                    Shipping Address
                  </h3>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingName
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    />
                    {errors.shippingName && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingName}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Phone <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 555-555-5555"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingPhone
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    />
                    {errors.shippingPhone && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingPhone}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Country <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingCountry
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    >
                      {COUNTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.shippingCountry && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingCountry}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Province/Territory <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      value={shippingRegion}
                      onChange={(e) => setShippingRegion(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingRegion
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    >
                      {getRegionOptions(shippingCountry).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.shippingRegion && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingRegion}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      City <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vancouver"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingCity
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    />
                    {errors.shippingCity && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingCity}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Address Line 1 <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 456 Oak Ave"
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingAddressLine1
                          ? theme.colors.error
                          : "#ddd",
                      }}
                    />
                    {errors.shippingAddressLine1 && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingAddressLine1}
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>Address Line 2</label>
                    <input
                      type="text"
                      placeholder="e.g. Suite 100"
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                      style={globalStyles.input}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label style={globalStyles.label}>
                      Postal Code <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B2B 2B2"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      style={{
                        ...globalStyles.input,
                        borderColor: errors.shippingPostalCode
                          ? theme.colors.error
                          : "#ddd",
                        maxWidth: "150px",
                      }}
                    />
                    {errors.shippingPostalCode && (
                      <div style={globalStyles.errorMessage}>
                        {errors.shippingPostalCode}
                      </div>
                    )}
                  </FormGroup>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
                onClick={() => navigate("/admin/customers/add/step-3")}
                variant="outline"
                disabled={isFetching}
              >
                ← Back
              </Button>
              <Button type="submit" variant="primary" disabled={isFetching}>
                {isFetching ? "Saving..." : "Next →"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep4Page;

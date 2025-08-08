// File Path: monorepo/web/workery-frontend/src/pages/Admin/Customer/Search/CriteriaPage.jsx
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
  FormGroup,
} from "../../../../components/UI";

function AdminCustomerSearchCriteriaPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Form states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Handle form submission
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Validation
    if (
      firstName === "" &&
      lastName === "" &&
      email === "" &&
      phone === "" &&
      organizationName === ""
    ) {
      setErrors({
        message: "Please enter at least one search field",
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append("fn", firstName);
    if (lastName) queryParams.append("ln", lastName);
    if (email) queryParams.append("e", email);
    if (phone) queryParams.append("p", phone);
    if (organizationName) queryParams.append("on", organizationName);
    queryParams.append("active", showOnlyActive ? "1" : "0");

    // Navigate to results page with query params
    const searchUrl = `/admin/customers/search-result?${queryParams.toString()}`;

    console.log("Navigating to:", searchUrl);
    navigate(searchUrl);
  };

  // Handle cancel
  const onCancelClick = (e) => {
    e.preventDefault();
    navigate("/admin/customers");
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Customers", path: "/admin/customers", icon: "👤" },
    { label: "Search", icon: "🔍" },
  ];

  if (isFetching) {
    return <Loading message="Loading..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>👤 Customers</h1>
      <h4 style={{ marginBottom: "30px", color: "#666" }}>🔍 Search</h4>
      <hr style={{ marginBottom: "30px" }} />

      {/* Search Form Card */}
      <Card title="🔍 Search for existing customer">
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Please enter one or more of the following fields to begin searching.
        </p>

        {/* Error Alert */}
        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <form onSubmit={onSubmitClick}>
          {/* First Name */}
          <FormGroup>
            <label style={globalStyles.label}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              style={{
                ...globalStyles.input,
                maxWidth: "380px",
              }}
            />
          </FormGroup>

          {/* Last Name */}
          <FormGroup>
            <label style={globalStyles.label}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              style={{
                ...globalStyles.input,
                maxWidth: "380px",
              }}
            />
          </FormGroup>

          {/* Email */}
          <FormGroup>
            <label style={globalStyles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              style={{
                ...globalStyles.input,
                maxWidth: "380px",
              }}
            />
          </FormGroup>

          {/* Phone */}
          <FormGroup>
            <label style={globalStyles.label}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              style={{
                ...globalStyles.input,
                maxWidth: "200px",
              }}
            />
          </FormGroup>

          {/* Organization Name */}
          <FormGroup>
            <label style={globalStyles.label}>Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Enter organization name"
              style={{
                ...globalStyles.input,
                maxWidth: "380px",
              }}
            />
          </FormGroup>

          {/* Show Only Active Checkbox */}
          <FormGroup>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Search active Customers only
            </label>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              By selecting this checkbox, you will be shown only customers which
              are active, else unselecting checkbox will search all customers.
            </p>
          </FormGroup>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Button variant="secondary" onClick={onCancelClick} type="button">
              ← Back to Customers
            </Button>
            <Button variant="primary" type="submit">
              🔍 Search
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminCustomerSearchCriteriaPage;

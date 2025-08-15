// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Search/CriteriaPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  Button,
  Alert,
  Breadcrumb,
  Input,
  FormGroup,
} from "../../../../components/UI";

function AdminStaffSearchCriteriaPage() {
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [errors, setErrors] = useState({});

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Search", icon: "🔍" },
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validate that at least one field is filled
    if (!firstName && !lastName && !email && !phone) {
      setErrors({
        general: "Please enter at least one search criterion",
      });
      return;
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (firstName) params.append("fn", firstName);
    if (lastName) params.append("ln", lastName);
    if (email) params.append("e", email);
    if (phone) params.append("p", phone);
    params.append("active", showOnlyActive ? "1" : "0");

    // Navigate to results page with query parameters
    navigate(`/admin/staff/search-result?${params.toString()}`);
  };

  // Handle clear form
  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setShowOnlyActive(true);
    setErrors({});
  };

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        🔍 Search Staff
      </h1>

      <Card title="Search Criteria">
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Please enter one or more of the following fields to begin searching.
        </p>

        {errors.general && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <Input
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              error={errors.lastName}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              error={errors.email}
            />

            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              error={errors.phone}
            />
          </div>

          <FormGroup style={{ marginTop: "20px" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                style={{ marginRight: "10px" }}
              />
              Search active staff only
            </label>
            <small style={{ color: "#666", marginTop: "5px" }}>
              When checked, only active staff members will be included in the
              search results. Uncheck to search all staff including archived.
            </small>
          </FormGroup>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/admin/staff">
                <Button variant="secondary">← Back to Staff</Button>
              </Link>
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear Form
              </Button>
            </div>
            <Button type="submit" variant="primary">
              🔍 Search
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminStaffSearchCriteriaPage;

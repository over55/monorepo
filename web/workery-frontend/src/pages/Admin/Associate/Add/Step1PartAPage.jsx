// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartAPage.jsx

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
  Modal,
  Input,
  FormGroup,
} from "../../../../components/UI";

function AdminAssociateAddStep1PartAPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

  // Event handlers
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search value",
      });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Navigate to results page with search parameters
    const searchParams = new URLSearchParams();
    if (firstName) searchParams.append("fn", firstName);
    if (lastName) searchParams.append("ln", lastName);
    if (email) searchParams.append("e", email);
    if (phone) searchParams.append("p", phone);

    navigate(`/admin/associates/add/step-1-results?${searchParams.toString()}`);
  };

  const onAddAssociateClick = (e) => {
    e.preventDefault();
    console.log("Creating new associate");

    // Clear any existing associate creation state
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");

    // Navigate directly to step 2
    navigate("/admin/associates/add/step-2");
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    { label: "New", icon: "➕" },
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
          Step 1 of 7
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
              width: "14%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          14%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          🔍 Search for existing associate:
        </h2>

        {isLoading ? (
          <Loading message="Searching..." />
        ) : (
          <>
            {errors.message && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {errors.message}
              </Alert>
            )}

            <form onSubmit={onSubmitClick}>
              <div style={{ display: "grid", gap: "1rem", maxWidth: "600px" }}>
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <Input
                  label="Phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCancelWarning(true)}
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  ❌ Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: "1", minWidth: "150px" }}
                >
                  🔍 Search
                </Button>
              </div>
            </form>

            <div
              style={{
                textAlign: "center",
                margin: "2rem 0",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              - OR -
            </div>

            <div style={{ textAlign: "center" }}>
              <Button onClick={onAddAssociateClick} variant="success" size="lg">
                ➕ Add associate
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setShowCancelWarning(false)}
              variant="secondary"
            >
              No
            </Button>
            <Link to="/admin/associates">
              <Button variant="success">Yes</Button>
            </Link>
          </>
        }
      >
        <p>
          Your Associate record will be cancelled and your work will be lost.
          This cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateAddStep1PartAPage;

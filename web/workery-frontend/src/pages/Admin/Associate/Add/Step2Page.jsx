// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../components/UI";

const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

function AdminAssociateAddStep2Page() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Fetch current user for country info
    fetchCurrentUser();
  }, [authManager, navigate]);

  const fetchCurrentUser = async () => {
    try {
      const user = await accountManager.getAccountDetail(() =>
        navigate("/login?unauthorized=true"),
      );
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const onSelectType = (typeId) => {
    // Get existing associate creation state or create new one
    let associateState = {};
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        associateState = JSON.parse(existing);
      }
    } catch (error) {
      console.error("Error parsing associate state:", error);
    }

    // Set the type
    associateState.type = typeId;

    // Set default country based on current user's country
    if (currentUser?.country) {
      associateState.country = currentUser.country;
    } else {
      associateState.country = "Canada"; // Default fallback
    }

    // Save to session storage
    try {
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
    } catch (error) {
      console.error("Error saving associate state:", error);
    }

    // Navigate to next step
    navigate("/admin/associates/add/step-3");
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
          Step 2 of 7
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
              width: "29%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          29%
        </small>
      </Card>

      {/* Main Content */}
      <Card>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          👤 Select Associate Type:
        </h2>

        <p style={{ color: "#666", marginBottom: "2rem" }}>
          Please select the type of associate this is.
        </p>

        {errors.message && (
          <Alert type="error" style={{ marginBottom: "1rem" }}>
            {errors.message}
          </Alert>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Residential */}
          <Card
            style={{
              border: "none",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                backgroundColor: theme.colors.info,
                color: "white",
                textAlign: "center",
                padding: "3rem",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>🏠</div>
            </div>
            <div style={{ padding: "1rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                🏠 Residential User
              </h3>
              <p style={{ marginBottom: "1rem", color: "#666" }}>
                Add a Residential Associate.
              </p>
            </div>
            <div
              style={{
                borderTop: "1px solid #ddd",
                padding: "1rem",
              }}
            >
              <Button
                onClick={() => onSelectType(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID)}
                variant="primary"
                size="lg"
                fullWidth
              >
                Pick →
              </Button>
            </div>
          </Card>

          {/* Commercial */}
          <Card
            style={{
              border: "none",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                backgroundColor: theme.colors.info,
                color: "white",
                textAlign: "center",
                padding: "3rem",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>🏢</div>
            </div>
            <div style={{ padding: "1rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                🏢 Business User
              </h3>
              <p style={{ marginBottom: "1rem", color: "#666" }}>
                Add a Commercial Associate.
              </p>
            </div>
            <div
              style={{
                borderTop: "1px solid #ddd",
                padding: "1rem",
              }}
            >
              <Button
                onClick={() => onSelectType(COMMERCIAL_ASSOCIATE_TYPE_OF_ID)}
                variant="primary"
                size="lg"
                fullWidth
              >
                Pick →
              </Button>
            </div>
          </Card>
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
        </div>
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
            <Link to="/admin/associates/add/step-1-search">
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

export default AdminAssociateAddStep2Page;

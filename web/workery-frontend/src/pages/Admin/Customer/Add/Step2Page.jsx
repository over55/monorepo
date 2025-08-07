// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../components/UI";

// Customer type constants
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerAddStep2Page() {
  const navigate = useNavigate();

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [customerData, setCustomerData] = useState(() => {
    // Get any existing data from sessionStorage
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : { country: "Canada" };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSelectType = (typeOfId) => {
    setIsLoading(true);

    // Update customer data with selected type
    const updatedCustomerData = {
      ...customerData,
      type: typeOfId,
      country: "Canada", // Default country
    };

    // Save to sessionStorage
    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    // Simulate brief loading then navigate
    setTimeout(() => {
      setIsLoading(false);
      navigate("/admin/customers/add/step-3");
    }, 500);
  };

  const handleCancel = () => {
    if (customerData.type) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/customers/add/step-1-search");
    }
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
          { path: "/admin/customers", label: "Customers", icon: "👥" },
          { label: "New Customer", icon: "➕" },
        ]}
      />

      {/* Progress Indicator */}
      <Card>
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Step 2 of 6
          </p>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "33%",
                height: "100%",
                backgroundColor: theme.colors.success,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#6c757d", marginTop: "5px" }}>
            33% Complete
          </p>
        </div>
      </Card>

      <Card title="⚙️ Select Customer Type">
        {/* Cancel Warning Modal */}
        {showCancelWarning && (
          <Modal
            isOpen={showCancelWarning}
            onClose={() => setShowCancelWarning(false)}
            title="Are you sure?"
          >
            <p>
              Your Customer record will be cancelled and your work will be lost.
              This cannot be undone. Do you want to continue?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Button
                variant="success"
                onClick={() => navigate("/admin/customers/add/step-1-search")}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCancelWarning(false)}
              >
                No
              </Button>
            </div>
          </Modal>
        )}

        {/* Error Messages */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Overlay */}
        {isLoading && <Loading message="Setting up customer type..." />}

        <div style={{ opacity: isLoading ? 0.6 : 1 }}>
          {/* Description */}
          <div
            style={{
              padding: "15px",
              backgroundColor: theme.colors.infoBg,
              borderRadius: "4px",
              marginBottom: "30px",
              fontSize: "14px",
              color: "#0c5460",
            }}
          >
            <strong>📝 Note:</strong> Please select the type of customer this
            is. This will determine what information we collect in the following
            steps.
          </div>

          {/* Customer Type Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            {/* Residential Customer */}
            <div
              style={{
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
              onClick={() =>
                !isLoading && onSelectType(RESIDENTIAL_CUSTOMER_TYPE_OF_ID)
              }
            >
              {/* Icon Section */}
              <div
                style={{
                  backgroundColor: theme.colors.info,
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "6rem" }}>🏠</span>
              </div>

              {/* Content Section */}
              <div style={{ padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  🏠 Residential Customer
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    marginBottom: "20px",
                    lineHeight: "1.5",
                  }}
                >
                  Individual customers who need services for their personal
                  residence or property.
                </p>

                {/* Features */}
                <ul
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginLeft: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <li>Personal contact information</li>
                  <li>Single residential address</li>
                  <li>Individual billing</li>
                </ul>

                <Button
                  variant="primary"
                  style={{ width: "100%" }}
                  disabled={isLoading}
                >
                  Select Residential →
                </Button>
              </div>
            </div>

            {/* Commercial Customer */}
            <div
              style={{
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
              onClick={() =>
                !isLoading && onSelectType(COMMERCIAL_CUSTOMER_TYPE_OF_ID)
              }
            >
              {/* Icon Section */}
              <div
                style={{
                  backgroundColor: theme.colors.info,
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "6rem" }}>🏢</span>
              </div>

              {/* Content Section */}
              <div style={{ padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "10px",
                    color: "#333",
                  }}
                >
                  🏢 Commercial Customer
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    marginBottom: "20px",
                    lineHeight: "1.5",
                  }}
                >
                  Business organizations, companies, or commercial entities
                  requiring services.
                </p>

                {/* Features */}
                <ul
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginLeft: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <li>Organization details</li>
                  <li>Business contact information</li>
                  <li>Commercial billing options</li>
                </ul>

                <Button
                  variant="primary"
                  style={{ width: "100%" }}
                  disabled={isLoading}
                >
                  Select Commercial →
                </Button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
            }}
          >
            <Link
              to="/admin/customers/add/step-1-search"
              style={{
                textDecoration: "none",
                color: theme.colors.secondary,
                fontSize: "14px",
              }}
            >
              ← Back to Search
            </Link>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card title="💡 Customer Type Guide" style={{ marginTop: "30px" }}>
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <h4 style={{ fontWeight: "600", marginBottom: "10px" }}>
                🏠 Residential
              </h4>
              <ul style={{ marginLeft: "20px" }}>
                <li>Homeowners</li>
                <li>Renters</li>
                <li>Individual property owners</li>
                <li>Personal service requests</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: "600", marginBottom: "10px" }}>
                🏢 Commercial
              </h4>
              <ul style={{ marginLeft: "20px" }}>
                <li>Businesses</li>
                <li>Corporations</li>
                <li>Non-profit organizations</li>
                <li>Government entities</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep2Page;

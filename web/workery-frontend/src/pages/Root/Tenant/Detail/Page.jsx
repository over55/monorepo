// File Path: monorepo/web/workery-frontend/src/pages/Root/Tenant/Detail/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";

function RootTenantDetailPage() {
  ////
  //// URL Parameters.
  ////

  const { tid } = useParams();

  ////
  //// Services.
  ////

  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenantDetail = async (tenantId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );

      setTenant(tenantData);

      console.log("RootTenantDetailPage: Tenant detail fetched successfully:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error(
        "RootTenantDetailPage: Failed to fetch tenant detail:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authManager.logout();
      navigate("/login");
    } catch (error) {
      console.error("RootTenantDetailPage: Logout failed:", error);
      navigate("/login");
    }
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      // Check authentication
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Validate tenant ID
      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        return;
      }

      // Fetch tenant details
      fetchTenantDetail(tid);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  ////
  //// Component rendering.
  ////

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Loading Tenant Details...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        {/* Desktop Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            display: window.innerWidth > 768 ? "block" : "none",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/root/dashboard" style={{ textDecoration: "none" }}>
                📊 Admin Dashboard
              </Link>
              {" > "}
              <Link to="/root/tenants" style={{ textDecoration: "none" }}>
                🏢 Tenants
              </Link>
              {" > "}
              <span>ℹ️ Detail</span>
            </li>
          </ul>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            display: window.innerWidth <= 768 ? "block" : "none",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/root/tenants" style={{ textDecoration: "none" }}>
                ← Back to Organizations
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          {/* Page Header */}
          {tenant && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: "24px" }}>🏢 Tenant</h1>
              </div>
              <div>
                <Link
                  to={`/root/tenant/${tid}/edit`}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffc107",
                    color: "black",
                    textDecoration: "none",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  ✏️ Edit
                </Link>
              </div>
            </div>
          )}

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div
              style={{
                color: "red",
                border: "1px solid red",
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "4px",
                backgroundColor: "#ffebee",
              }}
            >
              <strong>Error occurred:</strong>
              {Object.entries(errors).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong>{" "}
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </div>
              ))}
            </div>
          )}

          {/* Tenant Details */}
          {tenant && (
            <div>
              {/* Identification Section */}
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    marginBottom: "15px",
                    color: "#666",
                  }}
                >
                  🆔 Identification
                </h2>
                <hr style={{ marginBottom: "15px" }} />

                <div
                  style={{
                    display: "grid",
                    gap: "15px",
                    gridTemplateColumns: "1fr",
                    maxWidth: "600px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Schema Name:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.schemaName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Name:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Alternate Name:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.alternateName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Description:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    marginBottom: "15px",
                    color: "#666",
                  }}
                >
                  📞 Contact
                </h2>
                <hr style={{ marginBottom: "15px" }} />

                <div
                  style={{
                    display: "grid",
                    gap: "15px",
                    gridTemplateColumns: "1fr",
                    maxWidth: "600px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Email:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.email || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Telephone:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.telephone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    marginBottom: "15px",
                    color: "#666",
                  }}
                >
                  📍 Address
                </h2>
                <hr style={{ marginBottom: "15px" }} />

                <div
                  style={{
                    display: "grid",
                    gap: "15px",
                    gridTemplateColumns: "1fr",
                    maxWidth: "600px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Country:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.addressCountry || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      State/Province:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.addressRegion || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      City:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.addressLocality || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Postal Code:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.postalCode || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Address:
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.streetAddress || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Address (Extra line):
                    </label>
                    <p
                      style={{
                        margin: 0,
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      {tenant.streetAddressExtra || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "40px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  {/* Desktop Back Button */}
                  <Link
                    to="/root/tenants"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      display:
                        window.innerWidth > 768 ? "inline-block" : "none",
                    }}
                  >
                    ← Back
                  </Link>
                  {/* Mobile Back Button */}
                  <Link
                    to="/root/tenants"
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      display: window.innerWidth <= 768 ? "block" : "none",
                      width: "100%",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    ← Back
                  </Link>
                </div>
                <div>
                  {/* Desktop Edit Button */}
                  <Link
                    to={`/root/tenant/${tid}/edit`}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      display:
                        window.innerWidth > 768 ? "inline-block" : "none",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                  {/* Mobile Edit Button */}
                  <Link
                    to={`/root/tenant/${tid}/edit`}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      display: window.innerWidth <= 768 ? "block" : "none",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* No Tenant Found */}
          {!tenant && !isLoading && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <h2>Tenant Not Found</h2>
              <p>The requested tenant could not be found.</p>
              <Link
                to="/root/tenants"
                style={{ color: "#007bff", textDecoration: "none" }}
              >
                ← Back to Tenants List
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Page Logout Link */}
        <div style={{ textAlign: "right", color: "#666", marginTop: "20px" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout →
          </button>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <h4>Debug Info (Development Only):</h4>
            <ul>
              <li>
                Authenticated: {authManager.isAuthenticated() ? "Yes" : "No"}
              </li>
              <li>Tenant ID from URL: {tid}</li>
              <li>Loading: {isLoading ? "Yes" : "No"}</li>
              <li>Has Tenant Data: {tenant ? "Yes" : "No"}</li>
              <li>
                Has Errors: {Object.keys(errors).length > 0 ? "Yes" : "No"}
              </li>
            </ul>

            {tenant && (
              <div>
                <h5>Tenant Data Summary:</h5>
                <pre
                  style={{
                    fontSize: "10px",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {JSON.stringify(
                    {
                      id: tenant.id,
                      name: tenant.name,
                      schemaName: tenant.schemaName,
                      email: tenant.email,
                      hasAddress: !!(
                        tenant.streetAddress || tenant.addressLocality
                      ),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div>
                <h5>Current Errors:</h5>
                <pre
                  style={{
                    fontSize: "10px",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default RootTenantDetailPage;

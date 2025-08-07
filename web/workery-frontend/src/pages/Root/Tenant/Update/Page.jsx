// File Path: monorepo/web/workery-frontend/src/pages/Root/Tenant/Update/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";

function RootTenantUpdatePage() {
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
  const [isFetching, setIsFetching] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [alternateName, setAlternateName] = useState("");
  const [description, setDescription] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [addressLocality, setAddressLocality] = useState("");
  const [addressRegion, setAddressRegion] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [streetAddressExtra, setStreetAddressExtra] = useState("");
  const [postalCode, setPostalCode] = useState("");

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenantDetail = async (tenantId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );

      // Populate form fields
      setName(tenantData.name || "");
      setAlternateName(tenantData.alternateName || "");
      setDescription(tenantData.description || "");
      setSchemaName(tenantData.schemaName || "");
      setAddressCountry(tenantData.addressCountry || "");
      setAddressRegion(tenantData.addressRegion || "");
      setAddressLocality(tenantData.addressLocality || "");
      setPostalCode(tenantData.postalCode || "");
      setEmail(tenantData.email || "");
      setTelephone(tenantData.telephone || "");
      setStreetAddress(tenantData.streetAddress || "");
      setStreetAddressExtra(tenantData.streetAddressExtra || "");

      console.log("RootTenantUpdatePage: Tenant detail loaded for editing:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error(
        "RootTenantUpdatePage: Failed to fetch tenant detail:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = {
        name: name.trim(),
        alternateName: alternateName.trim(),
        description: description.trim(),
        schemaName: schemaName.trim(),
        addressLocality: addressLocality.trim(),
        addressRegion: addressRegion.trim(),
        addressCountry: addressCountry.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        streetAddress: streetAddress.trim(),
        streetAddressExtra: streetAddressExtra.trim(),
        postalCode: postalCode.trim(),
        state: 1, // Active state
      };

      console.log(
        "RootTenantUpdatePage: Submitting tenant update:",
        tenantData,
      );

      const updatedTenant = await tenantManager.updateTenant(
        tid,
        tenantData,
        onUnauthorized,
      );

      console.log("RootTenantUpdatePage: Tenant updated successfully");

      // Redirect to detail page
      navigate(`/root/tenant/${tid}`);
    } catch (error) {
      console.error("RootTenantUpdatePage: Failed to update tenant:", error);
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
      console.error("RootTenantUpdatePage: Logout failed:", error);
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

      // Fetch tenant details for editing
      fetchTenantDetail(tid);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  ////
  //// Component rendering.
  ////

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Loading Tenant for Editing...</h1>
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
              <Link
                to={`/root/tenant/${tid}`}
                style={{ textDecoration: "none" }}
              >
                ℹ️ Detail
              </Link>
              {" > "}
              <span>✏️ Update</span>
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
              <Link
                to={`/root/tenant/${tid}`}
                style={{ textDecoration: "none" }}
              >
                ← Back to Detail
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
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ margin: 0, fontSize: "24px" }}>🏢 Tenant</h1>
          </div>

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

          {/* Form */}
          <form onSubmit={handleSubmit}>
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
                    Name: <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter tenant name"
                    required
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.name ? "2px solid red" : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.name && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.name}
                    </div>
                  )}
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
                  <input
                    type="text"
                    value={alternateName}
                    onChange={(e) => setAlternateName(e.target.value)}
                    placeholder="Enter alternate name"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.alternateName
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.alternateName && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.alternateName}
                    </div>
                  )}
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
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (max 500 characters)"
                    disabled={isLoading}
                    rows={4}
                    maxLength={500}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.description
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    {description.length}/500 characters
                  </div>
                  {errors.description && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.description}
                    </div>
                  )}
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
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.email ? "2px solid red" : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.email && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
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
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Enter telephone number"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.telephone
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.telephone && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.telephone}
                    </div>
                  )}
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
                  <select
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.addressCountry
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="CA">Canada</option>
                    <option value="US">United States</option>
                    <option value="MX">Mexico</option>
                  </select>
                  {errors.addressCountry && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.addressCountry}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Province/Territory:
                  </label>
                  <input
                    type="text"
                    value={addressRegion}
                    onChange={(e) => setAddressRegion(e.target.value)}
                    placeholder="Enter province/state/region"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.addressRegion
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.addressRegion && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.addressRegion}
                    </div>
                  )}
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
                  <input
                    type="text"
                    value={addressLocality}
                    onChange={(e) => setAddressLocality(e.target.value)}
                    placeholder="Enter city"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.addressLocality
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.addressLocality && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.addressLocality}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Street Address:
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Enter street address"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.streetAddress
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.streetAddress && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.streetAddress}
                    </div>
                  )}
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
                  <input
                    type="text"
                    value={streetAddressExtra}
                    onChange={(e) => setStreetAddressExtra(e.target.value)}
                    placeholder="Enter additional address info (optional)"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.streetAddressExtra
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.streetAddressExtra && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.streetAddressExtra}
                    </div>
                  )}
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
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter postal/zip code"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: errors.postalCode
                        ? "2px solid red"
                        : "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.postalCode && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {errors.postalCode}
                    </div>
                  )}
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
                  to={`/root/tenant/${tid}`}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    display: window.innerWidth > 768 ? "inline-block" : "none",
                  }}
                >
                  ← Back
                </Link>
                {/* Mobile Back Button */}
                <Link
                  to={`/root/tenant/${tid}`}
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
                {/* Desktop Save Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isLoading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: window.innerWidth > 768 ? "inline-block" : "none",
                  }}
                >
                  {isLoading ? "Saving..." : "✓ Save"}
                </button>
                {/* Mobile Save Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isLoading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: window.innerWidth <= 768 ? "block" : "none",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {isLoading ? "Saving..." : "✓ Save"}
                </button>
              </div>
            </div>
          </form>
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
              <li>Fetching: {isFetching ? "Yes" : "No"}</li>
              <li>Loading: {isLoading ? "Yes" : "No"}</li>
              <li>
                Has Errors: {Object.keys(errors).length > 0 ? "Yes" : "No"}
              </li>
              <li>Name Length: {name.length}</li>
              <li>Description Length: {description.length}</li>
            </ul>

            <h5>Form Data Summary:</h5>
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
                  name: name,
                  alternateName: alternateName,
                  schemaName: schemaName,
                  email: email,
                  addressCountry: addressCountry,
                  addressRegion: addressRegion,
                  addressLocality: addressLocality,
                },
                null,
                2,
              )}
            </pre>

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

export default RootTenantUpdatePage;

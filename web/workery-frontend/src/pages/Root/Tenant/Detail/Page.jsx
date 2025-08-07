// File Path: web/workery-frontend/src/pages/Root/Tenant/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";

function RootTenantDetailPage() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenant, setTenant] = useState(null);

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
      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        return;
      }

      fetchTenantDetail(tid);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  if (isLoading) {
    return <Loading message="Loading Tenant Details..." />;
  }

  const styles = {
    detailSection: {
      marginBottom: "30px",
    },
    sectionTitle: {
      fontSize: "18px",
      marginBottom: "15px",
      color: theme.colors.secondary,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    detailGrid: {
      display: "grid",
      gap: "15px",
      gridTemplateColumns: "1fr",
      maxWidth: "600px",
    },
    detailItem: {
      display: "flex",
      flexDirection: "column",
    },
    detailLabel: {
      fontWeight: "bold",
      marginBottom: "5px",
      fontSize: "14px",
      color: "#333",
    },
    detailValue: {
      padding: "10px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
      color: "#666",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "40px",
      flexWrap: "wrap",
      gap: "10px",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Root Dashboard", path: "/root/dashboard", icon: "📊" },
          { label: "Tenants", path: "/root/tenants", icon: "🏢" },
          { label: "Detail", icon: "ℹ️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.tenantId && <Alert type="error">{errors.tenantId}</Alert>}

      {tenant && (
        <Card
          title="🏢 Tenant Details"
          actions={
            <Link to={`/root/tenant/${tid}/edit`}>
              <Button variant="warning">✏️ Edit</Button>
            </Link>
          }
        >
          {/* Identification Section */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🆔 Identification</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Schema Name:</label>
                <div style={styles.detailValue}>
                  {tenant.schemaName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Name:</label>
                <div style={styles.detailValue}>{tenant.name || "N/A"}</div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Alternate Name:</label>
                <div style={styles.detailValue}>
                  {tenant.alternateName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Description:</label>
                <div style={styles.detailValue}>
                  {tenant.description || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>📞 Contact</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Email:</label>
                <div style={styles.detailValue}>{tenant.email || "N/A"}</div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Telephone:</label>
                <div style={styles.detailValue}>
                  {tenant.telephone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>📍 Address</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Country:</label>
                <div style={styles.detailValue}>
                  {tenant.addressCountry || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>State/Province:</label>
                <div style={styles.detailValue}>
                  {tenant.addressRegion || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>City:</label>
                <div style={styles.detailValue}>
                  {tenant.addressLocality || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Postal Code:</label>
                <div style={styles.detailValue}>
                  {tenant.postalCode || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Street Address:</label>
                <div style={styles.detailValue}>
                  {tenant.streetAddress || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Address (Extra line):</label>
                <div style={styles.detailValue}>
                  {tenant.streetAddressExtra || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/root/tenants">
              <Button variant="secondary">← Back</Button>
            </Link>
            <Link to={`/root/tenant/${tid}/edit`}>
              <Button variant="primary">✏️ Edit</Button>
            </Link>
          </div>
        </Card>
      )}

      {!tenant && !isLoading && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Tenant Not Found</h2>
            <p>The requested tenant could not be found.</p>
            <Link to="/root/tenants">
              <Button variant="primary">← Back to Tenants List</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default RootTenantDetailPage;

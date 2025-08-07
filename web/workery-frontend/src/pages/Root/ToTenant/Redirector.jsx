// File Path: web/workery-frontend/src/pages/Root/ToTenant/Redirector.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTenantManager, useAuthManager } from "../../../services/Services";
import { Loading, Alert } from "../../../components/UI";
import { globalStyles } from "../../../constants/Theme";

function ToTenantRedirector() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted && tid) {
      console.log(
        "ToTenantRedirector: Starting executive visit for tenant:",
        tid,
      );
      setIsLoading(true);
      setErrors({});
      setStatus("Accessing tenant...");

      // Validate tenant ID
      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        setIsLoading(false);
        return;
      }

      // Execute the tenant visit
      tenantManager
        .executiveVisitsTenant(tid, onUnauthorized)
        .then((response) => {
          console.log(
            "ToTenantRedirector: Executive visit successful:",
            response,
          );
          setStatus("Access granted! Redirecting...");

          // Small delay to show success message
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 500);
        })
        .catch((error) => {
          console.error("ToTenantRedirector: Executive visit failed:", error);
          setErrors({
            access:
              error.message || "Failed to access tenant. Please try again.",
          });
          setStatus("Access failed");
          window.scrollTo(0, 0);
        })
        .finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [tid, tenantManager, navigate]);

  const styles = {
    container: {
      ...globalStyles.container,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      textAlign: "center",
    },
    statusCard: {
      ...globalStyles.card,
      maxWidth: "500px",
      width: "100%",
      padding: "40px",
    },
    statusIcon: {
      fontSize: "48px",
      marginBottom: "20px",
    },
    statusTitle: {
      fontSize: "24px",
      marginBottom: "10px",
    },
    statusMessage: {
      fontSize: "16px",
      color: "#666",
      marginBottom: "20px",
    },
    errorContainer: {
      marginTop: "20px",
    },
    backButton: {
      marginTop: "20px",
      padding: "10px 20px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.statusCard}>
        {isLoading ? (
          <>
            <div style={styles.statusIcon}>🔄</div>
            <h1 style={styles.statusTitle}>ACCESSING TENANT</h1>
            <p style={styles.statusMessage}>{status}</p>
            <Loading message="Please wait while we set up your tenant access..." />
          </>
        ) : Object.keys(errors).length > 0 ? (
          <>
            <div style={styles.statusIcon}>❌</div>
            <h1 style={styles.statusTitle}>ACCESS FAILED</h1>
            <div style={styles.errorContainer}>
              {errors.tenantId && <Alert type="error">{errors.tenantId}</Alert>}
              {errors.access && <Alert type="error">{errors.access}</Alert>}
            </div>
            <button
              onClick={() => navigate("/root/tenants")}
              style={styles.backButton}
            >
              ← Back to Tenants
            </button>
          </>
        ) : (
          <>
            <div style={styles.statusIcon}>✅</div>
            <h1 style={styles.statusTitle}>ACCESS GRANTED</h1>
            <p style={styles.statusMessage}>Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ToTenantRedirector;

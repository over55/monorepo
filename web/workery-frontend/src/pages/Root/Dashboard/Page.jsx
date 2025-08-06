// File Path: monorepo/web/workery-frontend/src/pages/Root/Dashboard/Page.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager, useTenantManager } from "../../../services/Services";

function RootDashboard() {
  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  ////
  //// Event handling.
  ////

  const handleLogout = async () => {
    try {
      console.log("RootDashboard: Initiating logout...");
      await authManager.logout();
      console.log("RootDashboard: Logout successful, redirecting to login");
      navigate("/login");
    } catch (error) {
      console.error("RootDashboard: Logout failed:", error);
      // Still redirect to login even if logout API fails
      navigate("/login");
    }
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Start the page at the top
      window.scrollTo(0, 0);

      // Check authentication status
      const authenticated = authManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        console.log(
          "RootDashboard: User not authenticated, redirecting to login",
        );
        navigate("/login?unauthorized=true");
      } else {
        console.log("RootDashboard: User authenticated, loading dashboard");
      }

      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate]);

  ////
  //// Component rendering.
  ////

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  // Show unauthorized state (shouldn't reach here due to redirect, but just in case)
  if (!isAuthenticated) {
    return (
      <div>
        <h1>Unauthorized Access</h1>
        <p>
          Please <Link to="/login">login</Link> to access this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <section>
        {/* Desktop Breadcrumbs */}
        <nav aria-label="breadcrumbs">
          <ul>
            <li>
              <Link to="/dashboard" aria-current="page">
                Root Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <nav>
          <div>
            <div>
              <h1>Root Dashboard</h1>
            </div>
          </div>

          {/* Organizations Section */}
          <section>
            <div>
              <p>
                <strong>Organizations</strong>
              </p>
              <p>
                Manage all the organizations in your system:
                <br />
                <br />
                <Link to={"/root/tenants"}>View Organizations →</Link>
              </p>
            </div>
          </section>
        </nav>

        {/* Bottom Page Logout Link */}
        <div style={{ textAlign: "right", color: "grey", marginTop: "40px" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "grey",
              textDecoration: "underline",
              cursor: "pointer",
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
            }}
          >
            <h4>Debug Info (Development Only):</h4>
            <ul>
              <li>Authenticated: {isAuthenticated ? "Yes" : "No"}</li>
              <li>Auth Manager Available: {authManager ? "Yes" : "No"}</li>
              <li>Tenant Manager Available: {tenantManager ? "Yes" : "No"}</li>
            </ul>

            <h5>Available Actions:</h5>
            <ul>
              <li>
                <Link to="/root/tenants">View Tenants List</Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "1px solid #ccc",
                    padding: "4px 8px",
                  }}
                >
                  Test Logout
                </button>
              </li>
            </ul>

            <h5>Authentication State:</h5>
            <pre
              style={{
                fontSize: "12px",
                backgroundColor: "#fff",
                padding: "10px",
              }}
            >
              {JSON.stringify(authManager.getAuthState(), null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}

export default RootDashboard;

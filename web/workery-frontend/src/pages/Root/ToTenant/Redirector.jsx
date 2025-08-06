// File Path: monorepo/web/workery-frontend/src/pages/Root/ToTenant/Redirector.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTenantManager } from "../../../services/Services";

function ToTenantRedirector() {
  ////
  //// URL Parameters.
  ////

  const { tid } = useParams();

  ////
  //// Services.
  ////

  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted && tid) {
      console.log(
        "ToTenantRedirector: Starting executive visit for tenant:",
        tid,
      );
      setIsLoading(true);
      setErrors({});

      // Convert tid to number since it comes as string from URL params
      const tenantId = parseInt(tid, 10);

      if (isNaN(tenantId)) {
        setErrors({ tenantId: "Invalid tenant ID" });
        setIsLoading(false);
        return;
      }

      // Use the modern async/await approach
      tenantManager
        .executiveVisitsTenant(tenantId, onUnauthorized)
        .then((response) => {
          console.log(
            "ToTenantRedirector: Executive visit successful:",
            response,
          );

          // Redirect to admin dashboard after successful visit
          navigate("/admin/dashboard");
        })
        .catch((error) => {
          console.error("ToTenantRedirector: Executive visit failed:", error);
          setErrors(error);

          // Scroll to top to show errors
          window.scrollTo(0, 0);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => (mounted = false);
  }, [tid, tenantManager, navigate]);

  ////
  //// Component rendering.
  ////

  return (
    <div>
      <div>
        <section>
          <div>
            <div>
              <div>
                <div>
                  <h1>ACCESSING...</h1>

                  {/* Loading indicator */}
                  {isLoading && (
                    <div>
                      <p>Please wait while we set up your tenant access...</p>
                    </div>
                  )}

                  {/* Error display */}
                  {Object.keys(errors).length > 0 && (
                    <div style={{ color: "red", marginTop: "20px" }}>
                      <h3>Error occurred:</h3>
                      {Object.entries(errors).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong>{" "}
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Debug info in development */}
                  {import.meta.env.DEV && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <h4>Debug Info:</h4>
                      <p>Tenant ID from URL: {tid}</p>
                      <p>Loading: {isLoading ? "Yes" : "No"}</p>
                      <p>
                        Has Errors:{" "}
                        {Object.keys(errors).length > 0 ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ToTenantRedirector;

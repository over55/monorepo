// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/BackupCodeGeneratePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";

function TwoFABackupCodeGeneratePage() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams();
  const backupCode = searchParams.get("v");

  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const twoFactorAuthManager = useTwoFactorAuthManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  ////
  //// Event handling.
  ////

  /**
   * Handle confirmation and redirect to dashboard
   */
  const handleConfirm = () => {
    // Clear 2FA setup state since we're done
    twoFactorAuthManager.clearSetupState();

    // Determine redirect path based on user role
    if (currentUser && currentUser.role) {
      const redirectPath = getRoleRedirectPath(currentUser.role);
      console.log(
        `TwoFABackupCodeGeneratePage: Redirecting to ${redirectPath} for role ${currentUser.role}`,
      );
      navigate(redirectPath);
    } else {
      // Fallback redirect
      console.log(
        "TwoFABackupCodeGeneratePage: No user role found, redirecting to dashboard",
      );
      navigate("/dashboard");
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

      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFABackupCodeGeneratePage: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      // Check if backup code is provided
      if (!backupCode) {
        console.log(
          "TwoFABackupCodeGeneratePage: No backup code provided, redirecting to 2FA setup",
        );
        navigate("/login/2fa/step-1");
        return;
      }

      // Try to get current user from auth state (this might not be available in our current setup)
      // For now, we'll use a placeholder
      setCurrentUser({ role: 1 }); // Default to executive role for demo

      console.log(
        "TwoFABackupCodeGeneratePage: Backup code displayed successfully",
      );
    }

    return () => (mounted = false);
  }, [authManager, twoFactorAuthManager, navigate, backupCode]);

  ////
  //// Component rendering.
  ////

  if (!backupCode) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Invalid Access</h1>
        <p>No backup code provided. Please complete the 2FA setup process.</p>
        <button
          onClick={() => navigate("/login/2fa/step-1")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Return to 2FA Setup
        </button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <section>
          <div>
            <div>
              <div>
                <div>
                  {/* Success Notification */}
                  <div
                    style={{
                      backgroundColor: "#d4edda",
                      border: "1px solid #c3e6cb",
                      color: "#155724",
                      padding: "15px",
                      borderRadius: "4px",
                      marginBottom: "20px",
                    }}
                  >
                    <strong>✓ Successful 2FA Verification</strong>
                  </div>

                  {/* Page Content */}
                  <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
                    2FA Backup Code
                  </h1>

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
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <p style={{ color: "#666", marginBottom: "15px" }}>
                      You have successfully verified your 2FA code and now are
                      granted backup code which you can use in case you lose
                      your phone or experience data loss.
                    </p>

                    <p style={{ color: "#666", marginBottom: "20px" }}>
                      Please save this backup code in safe location. When you
                      have successfully saved this code, please continue.
                    </p>

                    {/* Backup Code Display */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "bold",
                          marginBottom: "5px",
                        }}
                      >
                        Backup Code:
                      </label>
                      <textarea
                        readOnly
                        value={backupCode}
                        style={{
                          width: "100%",
                          padding: "15px",
                          border: "2px solid #28a745",
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                          fontFamily: "monospace",
                          fontSize: "16px",
                          fontWeight: "bold",
                          textAlign: "center",
                          resize: "none",
                          minHeight: "80px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "5px",
                          textAlign: "center",
                        }}
                      >
                        Save this code in a secure location. You'll need it if
                        you lose access to your 2FA device.
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div
                      style={{
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        color: "#856404",
                        padding: "15px",
                        borderRadius: "4px",
                        marginBottom: "20px",
                      }}
                    >
                      <strong>⚠ Important:</strong>
                      <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
                        <li>This backup code can only be used once</li>
                        <li>
                          Store it in a secure password manager or safe location
                        </li>
                        <li>Don't share this code with anyone</li>
                        <li>
                          You can generate a new backup code from your account
                          settings
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Confirmation Button */}
                  <div style={{ textAlign: "right", marginTop: "30px" }}>
                    <button
                      onClick={handleConfirm}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                    >
                      ✓ Confirm
                    </button>
                  </div>

                  {/* Copyright */}
                  <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <p>© 2024 Workery</p>
                  </div>

                  {/* Debug info in development */}
                  {import.meta.env.DEV && (
                    <div
                      style={{
                        marginTop: "30px",
                        padding: "15px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <h4>Debug Info (Development Only):</h4>
                      <ul>
                        <li>
                          Authenticated:{" "}
                          {authManager.isAuthenticated() ? "Yes" : "No"}
                        </li>
                        <li>
                          Backup Code Length:{" "}
                          {backupCode ? backupCode.length : 0}
                        </li>
                        <li>
                          Current User Role:{" "}
                          {currentUser ? currentUser.role : "Unknown"}
                        </li>
                        <li>
                          Redirect Path:{" "}
                          {currentUser
                            ? getRoleRedirectPath(currentUser.role)
                            : "Unknown"}
                        </li>
                      </ul>

                      <h5>Backup Code (First 10 chars):</h5>
                      <pre>
                        {backupCode
                          ? backupCode.substring(0, 10) + "..."
                          : "None"}
                      </pre>

                      <h5>Setup State:</h5>
                      <pre>
                        {JSON.stringify(
                          twoFactorAuthManager.getSetupState(),
                          null,
                          2,
                        )}
                      </pre>
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

export default TwoFABackupCodeGeneratePage;

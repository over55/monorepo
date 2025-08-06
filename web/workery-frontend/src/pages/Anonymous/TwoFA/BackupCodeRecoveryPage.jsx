// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/BackupCodeRecoveryPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";

function TwoFABackupCodeRecoveryPage() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate backup code
    const validationError =
      twoFactorAuthManager.validateRecoveryCode(backupCode);
    if (validationError) {
      setErrors(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        "TwoFABackupCodeRecoveryPage: Using backup code for recovery",
      );

      // Clean backup code (remove whitespace)
      const cleanedBackupCode = backupCode.replace(/\s/g, "");

      // Use recovery code
      const recoveryResponse = await twoFactorAuthManager.recoveryOTP(
        { backup_code: cleanedBackupCode },
        onUnauthorized,
      );

      console.log(
        "TwoFABackupCodeRecoveryPage: Backup code recovery successful",
        recoveryResponse,
      );

      // Handle successful recovery - redirect based on user role
      if (recoveryResponse.user && recoveryResponse.user.role) {
        const redirectPath = getRoleRedirectPath(recoveryResponse.user.role);
        console.log(
          `TwoFABackupCodeRecoveryPage: Redirecting to ${redirectPath} for role ${recoveryResponse.user.role}`,
        );
        navigate(redirectPath);
      } else {
        // Fallback redirect
        console.log(
          "TwoFABackupCodeRecoveryPage: No user role in response, redirecting to dashboard",
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(
        "TwoFABackupCodeRecoveryPage: Backup code recovery failed",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleBackupCodeChange = (e) => {
    setBackupCode(e.target.value);

    // Clear errors when user starts typing
    if (errors.backupCode || errors.backup_code || errors.recoveryCode) {
      setErrors((prev) => ({
        ...prev,
        backupCode: null,
        backup_code: null,
        recoveryCode: null,
      }));
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

      // Check if user is authenticated (they should be to access backup code recovery)
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFABackupCodeRecoveryPage: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }
    }

    return () => (mounted = false);
  }, [authManager, navigate]);

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
                  {/* Logo */}
                  <nav style={{ textAlign: "center", marginBottom: "20px" }}>
                    <figure>
                      <Link to="/">
                        <img
                          src="/img/workery-logo.jpeg"
                          alt="Workery Logo"
                          style={{ width: "256px" }}
                        />
                      </Link>
                    </figure>
                  </nav>

                  {/* Page Content */}
                  <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
                    Two-Factor Authentication
                  </h1>

                  <h2
                    style={{
                      textAlign: "center",
                      marginBottom: "20px",
                      fontSize: "18px",
                    }}
                  >
                    Backup Code Recovery
                  </h2>

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

                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    Copy and paste your <strong>2FA backup code</strong> into
                    the following field and submit into the system to disable
                    2FA and log into your dashboard.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="backupCode"
                        style={{
                          display: "block",
                          fontWeight: "bold",
                          marginBottom: "5px",
                        }}
                      >
                        Enter your 2FA Backup Code:
                      </label>
                      <input
                        id="backupCode"
                        type="text"
                        placeholder="Please enter here..."
                        value={backupCode}
                        onChange={handleBackupCodeChange}
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          maxWidth: "380px",
                          padding: "10px",
                          border:
                            errors.backupCode ||
                            errors.backup_code ||
                            errors.recoveryCode
                              ? "2px solid red"
                              : "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "16px",
                          fontFamily: "monospace",
                        }}
                      />
                      {(errors.backupCode ||
                        errors.backup_code ||
                        errors.recoveryCode) && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "5px",
                          }}
                        >
                          {errors.backupCode ||
                            errors.backup_code ||
                            errors.recoveryCode}
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "30px",
                      }}
                    >
                      <Link
                        to="/login/2fa"
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "transparent",
                          border: "1px solid #007bff",
                          color: "#007bff",
                          textDecoration: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ← Back to 2FA
                      </Link>

                      <button
                        type="submit"
                        disabled={isLoading || !backupCode.trim()}
                        style={{
                          padding: "10px 20px",
                          backgroundColor:
                            isLoading || !backupCode.trim()
                              ? "#ccc"
                              : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            isLoading || !backupCode.trim()
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isLoading ? "Submitting..." : "✓ Submit"}
                      </button>
                    </div>
                  </form>

                  {/* Help Text */}
                  <div
                    style={{
                      backgroundColor: "#e9ecef",
                      border: "1px solid #dee2e6",
                      padding: "15px",
                      borderRadius: "4px",
                      marginTop: "30px",
                      fontSize: "14px",
                    }}
                  >
                    <strong>Need Help?</strong>
                    <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
                      <li>Backup codes are typically 8-16 characters long</li>
                      <li>They may contain letters, numbers, or dashes</li>
                      <li>Each backup code can only be used once</li>
                      <li>
                        If you don't have your backup code, contact your
                        administrator
                      </li>
                    </ul>
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
                        <li>Backup Code Length: {backupCode.length}</li>
                        <li>Loading: {isLoading ? "Yes" : "No"}</li>
                        <li>
                          Has Errors:{" "}
                          {Object.keys(errors).length > 0 ? "Yes" : "No"}
                        </li>
                      </ul>

                      <h5>Auth State:</h5>
                      <pre>
                        {JSON.stringify(authManager.getAuthState(), null, 2)}
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

export default TwoFABackupCodeRecoveryPage;

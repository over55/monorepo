// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step3Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";

function TwoFAStep3Page() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams();
  const paramToken = searchParams.get("token");

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
  const [verificationToken, setVerificationToken] = useState("");
  const [submittedParamToken, setSubmittedParamToken] = useState(false);

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

    // Validate token
    const validationError =
      twoFactorAuthManager.validateOTPCode(verificationToken);
    if (validationError) {
      setErrors(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    try {
      console.log("TwoFAStep3Page: Verifying OTP token");

      // Clean token (remove whitespace)
      const cleanedToken = verificationToken.replace(/\s/g, "");

      // Verify OTP during setup
      const verifyResponse = await twoFactorAuthManager.verifyOTP(
        { verification_token: cleanedToken },
        onUnauthorized,
      );

      console.log(
        "TwoFAStep3Page: OTP verification successful",
        verifyResponse,
      );

      // Check if we have a backup code in the response
      if (verifyResponse.otp_backup_code || verifyResponse.otpBackupCode) {
        const backupCode =
          verifyResponse.otp_backup_code || verifyResponse.otpBackupCode;
        navigate(`/login/2fa/backup-code?v=${backupCode}`);
      } else {
        // No backup code provided, redirect based on role
        // This shouldn't happen in normal flow, but handle gracefully
        console.log(
          "TwoFAStep3Page: No backup code in response, redirecting to dashboard",
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("TwoFAStep3Page: OTP verification failed", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleTokenChange = (e) => {
    setVerificationToken(e.target.value);

    // Clear errors when user starts typing
    if (errors.verificationToken || errors.verification_token) {
      setErrors((prev) => ({
        ...prev,
        verificationToken: null,
        verification_token: null,
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

      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAStep3Page: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      // Handle Apple 2FA automatic submission via URL parameter
      if (
        submittedParamToken === false &&
        paramToken !== undefined &&
        paramToken !== null &&
        paramToken !== ""
      ) {
        console.log("TwoFAStep3Page: Auto-submitting token from URL parameter");
        setVerificationToken(paramToken);
        setSubmittedParamToken(true);

        // Auto-submit the token
        handleAutoSubmit(paramToken);
      }
    }

    return () => (mounted = false);
  }, [paramToken, submittedParamToken, authManager, navigate]);

  /**
   * Handle automatic submission for Apple 2FA
   */
  const handleAutoSubmit = async (token) => {
    setIsLoading(true);

    try {
      const verifyResponse = await twoFactorAuthManager.verifyOTP(
        { verification_token: token },
        onUnauthorized,
      );

      console.log(
        "TwoFAStep3Page: Auto-verification successful",
        verifyResponse,
      );

      if (verifyResponse.otp_backup_code || verifyResponse.otpBackupCode) {
        const backupCode =
          verifyResponse.otp_backup_code || verifyResponse.otpBackupCode;
        navigate(`/login/2fa/backup-code?v=${backupCode}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("TwoFAStep3Page: Auto-verification failed", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

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
                  {/* Progress Wizard */}
                  <nav
                    style={{
                      backgroundColor: "#d4edda",
                      padding: "15px",
                      borderRadius: "4px",
                      marginBottom: "20px",
                    }}
                  >
                    <p>
                      <strong>Step 3 of 3</strong>
                    </p>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        height: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          backgroundColor: "#28a745",
                          height: "8px",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  </nav>

                  {/* Page Content */}
                  <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
                    Setup Two-Factor Authentication
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

                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    Open the two-step verification app on your mobile device to
                    get your verification code.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="verificationToken"
                        style={{
                          display: "block",
                          fontWeight: "bold",
                          marginBottom: "5px",
                        }}
                      >
                        Enter your Verification Token:
                      </label>
                      <input
                        id="verificationToken"
                        type="text"
                        placeholder="See your authenticator app"
                        value={verificationToken}
                        onChange={handleTokenChange}
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          maxWidth: "380px",
                          padding: "10px",
                          border:
                            errors.verificationToken ||
                            errors.verification_token
                              ? "2px solid red"
                              : "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "16px",
                        }}
                      />
                      {(errors.verificationToken ||
                        errors.verification_token) && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "5px",
                          }}
                        >
                          {errors.verificationToken ||
                            errors.verification_token}
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
                        to="/login/2fa/step-2"
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
                        ← Back
                      </Link>

                      <button
                        type="submit"
                        disabled={isLoading || !verificationToken.trim()}
                        style={{
                          padding: "10px 20px",
                          backgroundColor:
                            isLoading || !verificationToken.trim()
                              ? "#ccc"
                              : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            isLoading || !verificationToken.trim()
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isLoading ? "Verifying..." : "✓ Submit and Verify"}
                      </button>
                    </div>
                  </form>

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
                        <li>Step: 3 of 3 (Verification)</li>
                        <li>Token Length: {verificationToken.length}</li>
                        <li>Has URL Token: {paramToken ? "Yes" : "No"}</li>
                        <li>
                          Submitted Param Token:{" "}
                          {submittedParamToken ? "Yes" : "No"}
                        </li>
                        <li>Loading: {isLoading ? "Yes" : "No"}</li>
                      </ul>

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

export default TwoFAStep3Page;

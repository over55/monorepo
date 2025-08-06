// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step2Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";

function TwoFAStep2Page() {
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
  const [otpData, setOtpData] = useState(null);
  const [qrCodeBlobUrl, setQrCodeBlobUrl] = useState(null);

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

    if (mounted) {
      // Start the page at the top
      window.scrollTo(0, 0);

      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAStep2Page: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      // Check if we already have setup data
      const setupState = twoFactorAuthManager.getSetupState();
      if (setupState.qrCodeBlobUrl && setupState.base32Secret) {
        console.log("TwoFAStep2Page: Using existing setup data");
        setOtpData({
          base32: setupState.base32Secret,
          optAuthURL: setupState.optAuthURL,
        });
        setQrCodeBlobUrl(setupState.qrCodeBlobUrl);
      } else {
        // Generate new OTP data
        console.log("TwoFAStep2Page: Generating new OTP data");
        generateOTPData();
      }
    }

    return () => (mounted = false);
  }, [authManager, twoFactorAuthManager, navigate]);

  /**
   * Generate OTP data and QR code
   */
  const generateOTPData = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Generate OTP secret first
      console.log("TwoFAStep2Page: Generating OTP secret");
      const otpResponse =
        await twoFactorAuthManager.generateOTP(onUnauthorized);
      setOtpData(otpResponse);

      // Generate QR code
      console.log("TwoFAStep2Page: Generating QR code");
      const qrBlobUrl =
        await twoFactorAuthManager.generateOTPAndQRCode(onUnauthorized);
      setQrCodeBlobUrl(qrBlobUrl);

      console.log(
        "TwoFAStep2Page: OTP data and QR code generated successfully",
      );
    } catch (error) {
      console.error("TwoFAStep2Page: Failed to generate OTP data", error);
      setErrors(error);

      // Scroll to top to show errors
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  ////
  //// Component rendering.
  ////

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Generating 2FA Setup...</h1>
        <p>
          Please wait while we prepare your two-factor authentication setup.
        </p>
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
                  {/* Progress Wizard */}
                  <nav
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "15px",
                      borderRadius: "4px",
                      marginBottom: "20px",
                    }}
                  >
                    <p>
                      <strong>Step 2 of 3</strong>
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
                          width: "66%",
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
                    With your 2FA application open, please scan the following QR
                    code with your device and click next when ready.
                  </p>

                  {/* QR Code Display */}
                  <div style={{ textAlign: "center", margin: "30px 0" }}>
                    {qrCodeBlobUrl ? (
                      <div>
                        <img
                          src={qrCodeBlobUrl}
                          alt="2FA QR Code"
                          style={{
                            width: "250px",
                            height: "250px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                        <br />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          Scan with your app
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "250px",
                          height: "250px",
                          border: "2px dashed #ccc",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          color: "#666",
                        }}
                      >
                        QR Code Loading...
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "center", margin: "30px 0" }}>
                    <h2 style={{ color: "#666" }}>- OR -</h2>
                  </div>

                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    Copy and paste the following values into your device:
                  </p>

                  {/* Manual Entry Fields */}
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Account Name:
                    </label>
                    <textarea
                      readOnly
                      value={`${window.location.hostname}: user@example.com`}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9",
                        resize: "vertical",
                        minHeight: "60px",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Your Key:
                    </label>
                    <textarea
                      readOnly
                      value={otpData ? otpData.base32 : "Loading..."}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9",
                        resize: "vertical",
                        minHeight: "60px",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Type of Key:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Time based"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9",
                      }}
                    />
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
                      to="/login/2fa/step-1"
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

                    <Link
                      to="/login/2fa/step-3"
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Next →
                    </Link>
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
                        <li>Step: 2 of 3 (QR Code Generation)</li>
                        <li>Has OTP Data: {otpData ? "Yes" : "No"}</li>
                        <li>Has QR Code: {qrCodeBlobUrl ? "Yes" : "No"}</li>
                        <li>Loading: {isLoading ? "Yes" : "No"}</li>
                      </ul>

                      {otpData && (
                        <>
                          <h5>OTP Data:</h5>
                          <pre>
                            {JSON.stringify(
                              {
                                base32:
                                  otpData.base32?.substring(0, 20) + "...",
                                hasOptAuthURL: !!otpData.optAuthURL,
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </>
                      )}

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

export default TwoFAStep2Page;

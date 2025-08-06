// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step1Page.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../services/Services";

function TwoFAStep1Page() {
  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const navigate = useNavigate();

  ////
  //// Event handling.
  ////

  const handleCancel = () => {
    // Clear auth data and redirect to login
    authManager.clearAuthData();
    navigate("/login");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Start the page at the top
      window.scrollTo(0, 0);

      // Check if user is authenticated (they should be to access 2FA setup)
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAStep1Page: User not authenticated, redirecting to login",
        );
        navigate("/login");
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
                      <strong>Step 1 of 3</strong>
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
                          width: "33%",
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

                  <div>
                    <p style={{ color: "#666", marginBottom: "15px" }}>
                      To ensure your account stays secure, you need to sign in
                      using <em>two-factor Authentication (2FA)</em>. The
                      following wizard will help you get setup with 2FA.
                    </p>

                    <p style={{ color: "#666", marginBottom: "15px" }}>
                      To make initial 2FA setup easier, we encourage you to
                      login on a device BESIDES the mobile device with the
                      camera that you wish to use. We recommend the following
                      setup:
                    </p>

                    <ul
                      style={{
                        color: "#666",
                        marginBottom: "20px",
                        marginLeft: "20px",
                      }}
                    >
                      <li>Login on a desktop device</li>
                      <li>
                        Use your mobile phone to scan the QR code and complete
                        setup
                      </li>
                    </ul>

                    <p style={{ color: "#666", marginBottom: "20px" }}>
                      To begin, please download any of the following
                      applications for your mobile device.
                    </p>

                    {/* Apple 2FA Authenticator */}
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <h3
                        style={{
                          textDecoration: "underline",
                          marginBottom: "10px",
                        }}
                      >
                        Apple 2FA
                      </h3>
                      <p>
                        All iOS and Mac devices with a{" "}
                        <strong>Safari Web Browser</strong> come with build in a
                        2FA verification services. Sign in with your{" "}
                        <em>Apple ID</em> in Safari and you can take advantage
                        of this service.
                      </p>
                    </div>

                    {/* Google Authenticator */}
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <h3
                        style={{
                          textDecoration: "underline",
                          marginBottom: "10px",
                        }}
                      >
                        Google Authenticator
                      </h3>
                      <p style={{ marginBottom: "10px" }}>
                        This 2FA app is created by <strong>Google, Inc.</strong>
                      </p>
                      <p>
                        <strong>Download for iOS:</strong>&nbsp;
                        <a
                          href="https://apps.apple.com/ca/app/google-authenticator/id388497605"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit App Store ↗
                        </a>
                      </p>
                      <p>
                        <strong>Download for Android:</strong>&nbsp;
                        <a
                          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pli=1"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit Google Play ↗
                        </a>
                      </p>
                    </div>

                    {/* Authenticator Chrome Extension */}
                    <div
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <h3
                        style={{
                          textDecoration: "underline",
                          marginBottom: "10px",
                        }}
                      >
                        Authenticator
                      </h3>
                      <p style={{ marginBottom: "10px" }}>
                        This 2FA app is created by{" "}
                        <strong>authenticator.cc</strong>
                      </p>
                      <p>
                        <strong>Download for Chrome:</strong>&nbsp;
                        <a
                          href="https://chromewebstore.google.com/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?pli=1"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit Chrome web store ↗
                        </a>
                      </p>
                    </div>
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
                    <button
                      onClick={handleCancel}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "transparent",
                        border: "1px solid #007bff",
                        color: "#007bff",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ← Cancel
                    </button>

                    <Link
                      to="/login/2fa/step-2"
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
                        <li>Step: 1 of 3 (Introduction & App Downloads)</li>
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

export default TwoFAStep1Page;

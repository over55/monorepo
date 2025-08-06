// File Path: web/workery-frontend/src/pages/Anonymous/Login/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager } from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";

function LoginPage() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams();
  const isUnauthorized = searchParams.get("unauthorized");

  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validation, setValidation] = useState({
    email: false,
    password: false,
  });
  const [rememberMe, setRememberMe] = useState(false);

  ////
  //// Event handling.
  ////

  /**
   * Check if user is already authenticated on component mount
   */
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Start the page at the top
      window.scrollTo(0, 0);

      // Check if user is already authenticated
      if (authManager.isAuthenticated()) {
        console.log("LoginPage: User already authenticated, redirecting...");
        navigate("/dashboard");
      }
    }

    return () => (mounted = false);
  }, [authManager, navigate]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific error and validation when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }

    if (validation[field]) {
      setValidation((prev) => ({
        ...prev,
        [field]: false,
      }));
    }

    // Clear general auth error when user modifies form
    if (errors.auth) {
      setErrors((prev) => ({
        ...prev,
        auth: null,
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};
    const newValidation = {};

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "value is missing";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else {
      newValidation.email = true;
    }

    // Password validation
    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "value is missing";
    } else {
      newValidation.password = true;
    }

    return { newErrors, newValidation };
  };

  /**
   * Handle successful login with proper role-based and 2FA redirects
   */
  const handleLoginSuccess = (profile) => {
    console.log("LoginPage: Login successful", {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      otpEnabled: profile.otpEnabled,
      otpVerified: profile.otpVerified,
    });

    // Clear form and errors
    setFormData({ email: "", password: "" });
    setErrors({});
    setValidation({ email: false, password: false });

    // Determine redirect URL based on 2FA status and role
    let redirectUrl;

    if (profile.otpEnabled === false) {
      // No 2FA enabled, redirect based on role
      console.log(
        "LoginPage: No 2FA enabled, redirecting based on role:",
        profile.role,
      );
      redirectUrl = getRoleRedirectPath(profile.role);
    } else {
      // 2FA is enabled, check if it's verified
      if (profile.otpVerified === false) {
        console.log(
          "LoginPage: 2FA enabled but not verified, redirecting to setup wizard",
        );
        redirectUrl = "/login/2fa/step-1";
      } else {
        console.log(
          "LoginPage: 2FA enabled and verified, redirecting to validation",
        );
        redirectUrl = "/login/2fa";
      }
    }

    console.log(`LoginPage: Redirecting to: ${redirectUrl}`);
    navigate(redirectUrl);
  };

  /**
   * Handle login error
   */
  const handleLoginError = (error) => {
    console.error("LoginPage: Login failed", error);

    // Format errors for display
    let formattedErrors = {};

    if (error.auth) {
      formattedErrors.auth = error.auth;
    } else if (error.email) {
      formattedErrors.email = error.email;
    } else if (error.password) {
      formattedErrors.password = error.password;
    } else if (error.message) {
      formattedErrors.auth = error.message;
    } else {
      formattedErrors.auth = "An unexpected error occurred. Please try again.";
    }

    setErrors(formattedErrors);

    // Scroll to top to show errors
    window.scrollTo(0, 0);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newErrors, newValidation } = validateForm();

    // Update validation state
    setValidation(newValidation);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("LoginPage: Form validation failed");
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    try {
      console.log("LoginPage: Attempting login", { email: formData.email });

      // Attempt login
      const profile = await authManager.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      handleLoginSuccess(profile);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Utility functions
   */
  const resetForm = () => {
    setFormData({ email: "", password: "" });
    setErrors({});
    setValidation({ email: false, password: false });
    setLoading(false);
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
                  {/* Logo */}
                  <nav>
                    <div style={{ textAlign: "center" }}>
                      <figure>
                        <img
                          src="/img/workery-logo.jpeg"
                          alt="Workery Logo"
                          style={{ width: "256px" }}
                        />
                      </figure>
                    </div>
                  </nav>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    <h1 style={{ textAlign: "center" }}>Sign In</h1>

                    {/* Unauthorized Message */}
                    {isUnauthorized === "true" && (
                      <div
                        style={{
                          color: "red",
                          border: "1px solid red",
                          padding: "10px",
                          marginBottom: "15px",
                          borderRadius: "4px",
                          backgroundColor: "#ffebee",
                        }}
                      >
                        <strong>⚠ Your session has ended.</strong>
                        <br />
                        Please login again
                      </div>
                    )}

                    {/* General Error Display */}
                    {errors.auth && (
                      <div
                        style={{
                          color: "red",
                          border: "1px solid red",
                          padding: "10px",
                          marginBottom: "15px",
                          borderRadius: "4px",
                          backgroundColor: "#ffebee",
                        }}
                      >
                        <strong>Error:</strong> {errors.auth}
                      </div>
                    )}

                    {/* Email Field */}
                    <div style={{ marginBottom: "15px" }}>
                      <label htmlFor="email">
                        <strong>Email:</strong>
                      </label>
                      <br />
                      <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        disabled={loading}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: errors.email
                            ? "2px solid red"
                            : validation.email
                              ? "2px solid green"
                              : "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "16px",
                        }}
                      />
                      {errors.email && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "5px",
                          }}
                        >
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: "15px" }}>
                      <label htmlFor="password">
                        <strong>Password:</strong>
                      </label>
                      <br />
                      <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                          handleFieldChange("password", e.target.value)
                        }
                        disabled={loading}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: errors.password
                            ? "2px solid red"
                            : validation.password
                              ? "2px solid green"
                              : "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "16px",
                        }}
                      />
                      {errors.password && (
                        <div
                          style={{
                            color: "red",
                            fontSize: "14px",
                            marginTop: "5px",
                          }}
                        >
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div style={{ marginBottom: "20px" }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label
                        htmlFor="rememberMe"
                        style={{ marginLeft: "8px", fontSize: "14px" }}
                      >
                        Remember Me
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: loading ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading ? "Signing In..." : "Submit →"}
                    </button>

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "transparent",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginTop: "10px",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Clear Form
                    </button>
                  </form>

                  {/* Additional Links */}
                  <nav style={{ textAlign: "center", marginTop: "20px" }}>
                    <div>
                      <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                  </nav>

                  {/* Copyright */}
                  <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <p>© 2024 Over 55 (London) Inc.</p>
                  </div>

                  {/* Debug Info (Development Only) */}
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
                        <li>Email: {formData.email || "(empty)"}</li>
                        <li>
                          Password: {formData.password ? "[HIDDEN]" : "(empty)"}
                        </li>
                        <li>Loading: {loading ? "Yes" : "No"}</li>
                        <li>Remember Me: {rememberMe ? "Yes" : "No"}</li>
                        <li>Is Unauthorized: {isUnauthorized || "No"}</li>
                        <li>
                          Has Errors:{" "}
                          {Object.keys(errors).length > 0 ? "Yes" : "No"}
                        </li>
                        <li>
                          Validation: Email={validation.email ? "✓" : "✗"},
                          Password={validation.password ? "✓" : "✗"}
                        </li>
                      </ul>

                      {Object.keys(errors).length > 0 && (
                        <>
                          <h5>Current Errors:</h5>
                          <pre>{JSON.stringify(errors, null, 2)}</pre>
                        </>
                      )}

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

export default LoginPage;

// File Path: web/workery-frontend/src/pages/Anonymous/Login/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager } from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import { theme, globalStyles } from "../../../constants/Theme";
import { Card, Input, Button, Alert } from "../../../components/UI";

function LoginPage() {
  const [searchParams] = useSearchParams();
  const isUnauthorized = searchParams.get("unauthorized");

  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (authManager.isAuthenticated()) {
        console.log("LoginPage: User already authenticated, redirecting...");
        navigate("/dashboard");
      }
    }

    return () => (mounted = false);
  }, [authManager, navigate]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log("LoginPage: Attempting login", { email: formData.email });

      const loginResponse = await authManager.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("LoginPage: Login successful", {
        id: loginResponse.user.id,
        role: loginResponse.user.role,
        otpEnabled: loginResponse.user.otpEnabled,
        otpVerified: loginResponse.user.otpVerified,
      });

      // Clear form
      setFormData({ email: "", password: "" });

      // Handle redirect based on 2FA status
      if (loginResponse.user.otpEnabled === false) {
        const redirectUrl = getRoleRedirectPath(loginResponse.user.role);
        console.log(`LoginPage: Redirecting to ${redirectUrl}`);
        navigate(redirectUrl);
      } else if (!loginResponse.user.otpVerified) {
        console.log("LoginPage: 2FA not verified, redirecting to setup");
        navigate("/login/2fa/step-1");
      } else {
        console.log("LoginPage: 2FA enabled, redirecting to validation");
        navigate("/login/2fa");
      }
    } catch (error) {
      console.error("LoginPage: Login failed", error);
      setErrors({
        auth: error.message || "Invalid email or password. Please try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: theme.colors.light,
      padding: "20px",
    },
    loginCard: {
      maxWidth: "400px",
      width: "100%",
    },
    logoContainer: {
      textAlign: "center",
      marginBottom: "30px",
    },
    logo: {
      width: "200px",
      maxWidth: "80%",
      height: "auto",
    },
    title: {
      textAlign: "center",
      marginTop: "20px",
      marginBottom: "10px",
      fontSize: "24px",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
    },
    checkbox: {
      marginRight: "8px",
    },
    linksContainer: {
      textAlign: "center",
      marginTop: "20px",
    },
    copyright: {
      textAlign: "center",
      marginTop: "30px",
      color: "#666",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <Card style={styles.loginCard}>
        <div style={styles.logoContainer}>
          <img
            src="/img/workery-logo.jpeg"
            alt="Workery Logo"
            style={styles.logo}
          />
        </div>

        <h1 style={styles.title}>Sign In</h1>

        {isUnauthorized === "true" && (
          <Alert type="warning">
            <strong>⚠ Your session has ended.</strong>
            <br />
            Please login again
          </Alert>
        )}

        {errors.auth && <Alert type="error">{errors.auth}</Alert>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            error={errors.email}
            disabled={loading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            error={errors.password}
            disabled={loading}
            required
          />

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              style={styles.checkbox}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Signing In..." : "Submit →"}
          </Button>
        </form>

        <div style={styles.linksContainer}>
          <Link to="/forgot-password" style={{ color: theme.colors.primary }}>
            Forgot Password?
          </Link>
        </div>

        <div style={styles.copyright}>
          <p>© 2024 Over 55 (London) Inc.</p>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;

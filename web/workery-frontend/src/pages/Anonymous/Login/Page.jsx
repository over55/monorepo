// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: src/pages/Anonymous/Login/Page.jsx
// Login Page with UIX Components

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager } from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import { Card, Input, Button, Alert, Checkbox, UIXThemeProvider } from "../../../components/UIX";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

function LoginPageContent() {
  const [searchParams] = useSearchParams();
  const isUnauthorized = searchParams.get("unauthorized");

  const authManager = useAuthManager();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Auto-focus email field on mount
    emailInputRef.current?.focus();

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (authManager.isAuthenticated()) {
      console.log("LoginPage: User already authenticated, redirecting...");
      navigate("/dashboard");
    }

    // Check for remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, [authManager, navigate]);

  // UIX Input onChange receives value directly
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user types
    setErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  }, [formData.email, formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log("LoginPage: Attempting login", { email: formData.email });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

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
    } finally {
      setLoading(false);
    }
  };

  // Password visibility toggle button for rightIcon
  const PasswordToggleButton = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
      tabIndex={-1}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      ) : (
        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      )}
    </button>
  );

  return (
    // Force light mode on login page for consistent branding
    <div className="light min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob" />
        <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg">
              <img
                src="/img/workery-logo.jpeg"
                alt="Workery"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
            {/* Session expired alert */}
            {isUnauthorized === "true" && (
              <Alert type="warning" className="mb-6">
                <div>
                  <strong className="font-semibold">Session Expired</strong>
                  <p className="mt-1">Please sign in again to continue</p>
                </div>
              </Alert>
            )}

            {/* Auth error alert */}
            {errors.auth && (
              <Alert
                type="error"
                dismissible
                onDismiss={() => setErrors({})}
                className="mb-6"
              >
                {errors.auth}
              </Alert>
            )}

            <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <Input
                ref={emailInputRef}
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(value) => handleFieldChange("email", value)}
                error={errors.email}
                disabled={loading}
                required
                icon={EnvelopeIcon}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                inputMode="email"
              />

              {/* Password Input */}
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(value) => handleFieldChange("password", value)}
                error={errors.password}
                disabled={loading}
                required
                icon={LockClosedIcon}
                rightIcon={PasswordToggleButton}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(checked) => setRememberMe(checked)}
                  disabled={loading}
                />

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors touch-manipulation"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={loading}
                loading={loading}
                loadingText="Signing in..."
                icon={!loading ? ArrowRightIcon : undefined}
              >
                Sign In
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors touch-manipulation"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 px-4">
            <p className="text-xs text-gray-500">
              © 2024 Over 55 (London) Inc. All rights reserved.
            </p>
            <div className="mt-2 space-x-4">
              <Link
                to="/privacy"
                className="text-xs text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-xs text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper with UIXThemeProvider forcing light mode for consistent branding
function LoginPage() {
  return (
    <UIXThemeProvider forceTheme="blue">
      <LoginPageContent />
    </UIXThemeProvider>
  );
}

export default LoginPage;

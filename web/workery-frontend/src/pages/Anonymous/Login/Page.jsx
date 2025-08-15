// File Path: src/pages/Anonymous/Login/Page.jsx
// Enhanced Login Page with Modern UI/UX Features (No OAuth)

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthManager } from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import { Card, Input, Button, Alert, Checkbox } from "../../../components/UI";
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function LoginPage() {
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
  const [focusedField, setFocusedField] = useState(null);

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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus on first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.focus();
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

      // Shake animation on error
      const form = document.getElementById("login-form");
      form.classList.add("animate-shake");
      setTimeout(() => form.classList.remove("animate-shake"), 500);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key submission
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
              <img
                src="/img/workery-logo.jpeg"
                alt="Workery"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-600 mt-2">
              Sign in to access your account
            </p>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl animate-slide-up">
            {/* Alerts */}
            {isUnauthorized === "true" && (
              <Alert type="warning" dismissible className="mb-6">
                <div>
                  <strong className="font-semibold">Session Expired</strong>
                  <p className="mt-1">Please sign in again to continue</p>
                </div>
              </Alert>
            )}

            {errors.auth && (
              <Alert type="error" dismissible onDismiss={() => setErrors({})}>
                {errors.auth}
              </Alert>
            )}

            {/* Login Form */}
            <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div
                className={`transition-all duration-200 ${focusedField === "email" ? "scale-[1.02]" : ""}`}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon
                      className={`h-5 w-5 transition-colors ${focusedField === "email" ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    required
                    className={`
                      w-full pl-10 pr-4 py-3
                      border rounded-lg
                      transition-all duration-200
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      }
                      ${loading ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
                    `}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div
                className={`transition-all duration-200 ${focusedField === "password" ? "scale-[1.02]" : ""}`}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon
                      className={`h-5 w-5 transition-colors ${focusedField === "password" ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    required
                    className={`
                      w-full pl-10 pr-12 py-3
                      border rounded-lg
                      transition-all duration-200
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      }
                      ${loading ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                loading={loading}
                className="group"
              >
                {!loading && (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
                {loading && "Signing in..."}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2024 Over 55 (London) Inc. All rights reserved.
            </p>
            <div className="mt-2 space-x-4">
              <Link
                to="/privacy"
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-xs text-gray-400 hover:text-gray-600"
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

export default LoginPage;

// File Path: src/pages/Anonymous/Login/Page.jsx
// Enhanced Login Page with Modern UI/UX Features (No OAuth) - Desktop Fix

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

    // iOS-specific optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // Prevent zoom on input focus
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        const handleFocus = (e) => {
          viewportMeta.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
          );

          // Add keyboard-open class for iOS keyboard handling
          const form = document.getElementById("login-form");
          if (form) {
            form.classList.add("keyboard-open");
          }

          // Scroll to input with offset for iOS keyboard
          setTimeout(() => {
            if (e.target) {
              const rect = e.target.getBoundingClientRect();
              const offset = window.innerHeight * 0.3; // 30% of viewport height

              if (rect.bottom > window.innerHeight - offset) {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
          }, 300);
        };

        const handleBlur = () => {
          viewportMeta.setAttribute(
            "content",
            originalContent || "width=device-width, initial-scale=1.0",
          );

          // Remove keyboard-open class
          const form = document.getElementById("login-form");
          if (form) {
            form.classList.remove("keyboard-open");
          }
        };

        // Add event listeners to all inputs
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
          input.addEventListener("focus", handleFocus);
          input.addEventListener("blur", handleBlur);
        });

        // Cleanup
        return () => {
          inputs.forEach((input) => {
            input.removeEventListener("focus", handleFocus);
            input.removeEventListener("blur", handleBlur);
          });
        };
      }

      // Handle iOS keyboard viewport changes
      const handleResize = () => {
        // Force a repaint to handle viewport changes
        document.documentElement.style.height = `${window.innerHeight}px`;
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    // Android-specific optimizations
    if (isAndroid) {
      // Handle Android Chrome viewport and keyboard behavior
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        const handleAndroidFocus = (e) => {
          // Prevent zoom on Android Chrome
          viewportMeta.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
          );

          // Android keyboard handling
          const form = document.getElementById("login-form");
          if (form) {
            form.classList.add("android-keyboard-open");
          }

          // Android-specific scroll behavior
          setTimeout(() => {
            if (e.target) {
              const rect = e.target.getBoundingClientRect();
              const viewportHeight = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;
              const offset = viewportHeight * 0.2; // 20% offset for Android

              if (rect.bottom > viewportHeight - offset) {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }
            }
          }, 100); // Shorter delay for Android
        };

        const handleAndroidBlur = () => {
          viewportMeta.setAttribute(
            "content",
            originalContent || "width=device-width, initial-scale=1.0",
          );

          const form = document.getElementById("login-form");
          if (form) {
            form.classList.remove("android-keyboard-open");
          }
        };

        // Add Android event listeners
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
          input.addEventListener("focus", handleAndroidFocus);
          input.addEventListener("blur", handleAndroidBlur);
        });

        // Android Visual Viewport API support
        if (window.visualViewport) {
          const handleViewportChange = () => {
            document.documentElement.style.setProperty(
              "--android-vh",
              `${window.visualViewport.height * 0.01}px`,
            );
          };

          window.visualViewport.addEventListener(
            "resize",
            handleViewportChange,
          );
          handleViewportChange(); // Set initial value

          return () => {
            window.visualViewport.removeEventListener(
              "resize",
              handleViewportChange,
            );
            inputs.forEach((input) => {
              input.removeEventListener("focus", handleAndroidFocus);
              input.removeEventListener("blur", handleAndroidBlur);
            });
          };
        } else {
          // Fallback for older Android versions
          const handleAndroidResize = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
          };

          window.addEventListener("resize", handleAndroidResize);
          handleAndroidResize();

          return () => {
            window.removeEventListener("resize", handleAndroidResize);
            inputs.forEach((input) => {
              input.removeEventListener("focus", handleAndroidFocus);
              input.removeEventListener("blur", handleAndroidBlur);
            });
          };
        }
      }
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
    <div>
      <style>
        {`
          /* Desktop-specific fixes */
          @media (min-width: 1024px) {
            .desktop-button-fix {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.5rem !important;
              white-space: nowrap !important;
            }

            .desktop-form-width {
              width: 100%;
              max-width: 24rem; /* 384px */
            }
          }

          @media (min-width: 1920px) {
            .desktop-form-width {
              max-width: 28rem; /* 448px */
            }
          }

          /* iOS-specific styles */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
          }

          .ios-input-fix {
            -webkit-appearance: none;
            -webkit-border-radius: 0;
            border-radius: 0.5rem;
            -webkit-box-shadow: none;
            box-shadow: none;
            -webkit-tap-highlight-color: transparent;
            font-size: 16px; /* Prevents zoom on iOS */
          }

          .ios-input-fix:focus {
            -webkit-box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }

          .ios-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }

          .ios-touch-target {
            min-height: 44px;
            min-width: 44px;
          }

          @media screen and (max-device-width: 768px) {
            .ios-keyboard-adjust {
              transition: all 0.3s ease;
            }

            .ios-keyboard-adjust.keyboard-open {
              transform: translateY(-50px);
            }
          }

          /* Android-specific styles */
          .android-input-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.5rem;
            -webkit-box-shadow: none;
            box-shadow: none;
            -webkit-tap-highlight-color: transparent;
            font-size: 16px; /* Prevents zoom on Android Chrome */
            /* Android text rendering optimization */
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .android-input-fix:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            /* Android focus ring optimization */
            border-color: #3b82f6;
          }

          .android-touch-target {
            min-height: 48px; /* Android Material Design guidelines */
            min-width: 48px;
            touch-action: manipulation;
          }

          .android-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            /* Android-specific touch optimizations */
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          /* Android keyboard handling */
          @media screen and (max-device-width: 768px) {
            .android-keyboard-adjust {
              transition: all 0.2s ease-out; /* Faster transition for Android */
            }

            .android-keyboard-adjust.android-keyboard-open {
              transform: translateY(-40px); /* Less aggressive offset */
            }
          }

          /* Android Chrome viewport fix */
          .android-viewport-fix {
            min-height: 100vh;
            min-height: calc(var(--android-vh, 1vh) * 100);
            /* Android-specific overflow handling */
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          /* Android Material Design touch feedback */
          .android-ripple {
            position: relative;
            overflow: hidden;
          }

          .android-ripple:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transition: width 0.6s, height 0.6s;
            transform: translate(-50%, -50%);
            pointer-events: none;
          }

          .android-ripple:active:before {
            width: 300px;
            height: 300px;
          }

          /* Android accessibility improvements */
          @media (prefers-reduced-motion: reduce) {
            .android-keyboard-adjust,
            .ios-keyboard-adjust {
              transition: none;
            }
          }

          /* Android performance optimizations */
          .android-gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000;
            perspective: 1000;
          }

          /* Cross-platform optimizations */
          .mobile-input-fix {
            font-size: 16px !important; /* Prevent zoom on both platforms */
            -webkit-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .mobile-touch-target {
            min-height: 44px; /* iOS standard */
            min-width: 44px;
          }

          @media (max-width: 768px) and (orientation: landscape) {
            /* Landscape mode optimizations for both platforms */
            .mobile-keyboard-adjust {
              padding-top: 10px;
              padding-bottom: 10px;
            }
          }

          /* High DPI Android devices */
          @media (-webkit-min-device-pixel-ratio: 2) and (max-device-width: 768px) {
            .android-high-dpi {
              -webkit-font-smoothing: subpixel-antialiased;
            }
          }
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix android-viewport-fix android-gpu-accelerated">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-sm sm:max-w-md desktop-form-width">
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg">
                <img
                  src="/img/workery-logo.jpeg"
                  alt="Workery"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
            </div>

            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl animate-slide-up p-6 sm:p-8">
              {isUnauthorized === "true" && (
                <Alert type="warning" dismissible className="mb-6">
                  <div>
                    <strong className="font-semibold">Session Expired</strong>
                    <p className="mt-1">Please sign in again to continue</p>
                  </div>
                </Alert>
              )}

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

              <form
                id="login-form"
                onSubmit={handleSubmit}
                className="space-y-5 ios-keyboard-adjust android-keyboard-adjust mobile-keyboard-adjust"
              >
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
                      onChange={(e) =>
                        handleFieldChange("email", e.target.value)
                      }
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      inputMode="email"
                      className={`
                        w-full pl-10 pr-4 py-3
                        text-base
                        border rounded-lg
                        transition-all duration-200
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ios-input-fix android-input-fix mobile-input-fix android-high-dpi
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
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

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
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className={`
                        w-full pl-10 pr-12 py-3
                        text-base
                        border rounded-lg
                        transition-all duration-200
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ios-input-fix android-input-fix mobile-input-fix android-high-dpi
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation ios-touch-target android-touch-target mobile-touch-target"
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
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="text-sm"
                  />

                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors touch-manipulation android-touch-target mobile-touch-target"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  loading={loading}
                  className="group py-3 text-base touch-manipulation android-ripple android-touch-target mobile-touch-target desktop-button-fix"
                >
                  {!loading && (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                  {loading && "Signing in..."}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors touch-manipulation android-touch-target mobile-touch-target"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </Card>

            <div className="text-center mt-8 px-4">
              <p className="text-xs text-gray-500">
                © 2024 Over 55 (London) Inc. All rights reserved.
              </p>
              <div className="mt-2 space-x-4">
                <Link
                  to="/privacy"
                  className="text-xs text-gray-400 hover:text-gray-600 touch-manipulation android-touch-target mobile-touch-target"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-xs text-gray-400 hover:text-gray-600 touch-manipulation android-touch-target mobile-touch-target"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

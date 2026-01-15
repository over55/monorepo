// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step1Page.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../services/Services";
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

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
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Check if user is authenticated (they should be to access 2FA setup)
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAStep1Page: User not authenticated, redirecting to login",
        );
        navigate("/login");
      }
    }

    // iOS and Android optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // iOS viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Set initial iOS-optimized viewport
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover",
        );

        const handleResize = () => {
          // iOS Safari viewport height fix
          document.documentElement.style.height = `${window.innerHeight}px`;
          document.documentElement.style.setProperty(
            "--ios-vh",
            `${window.innerHeight * 0.01}px`,
          );
        };

        // iOS touch event optimizations
        const handleTouchStart = (e) => {
          // Prevent iOS scroll bounce on main container
          if (
            e.target === document.body ||
            e.target === document.documentElement
          ) {
            e.preventDefault();
          }
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });

        // Set initial values
        handleResize();

        return () => {
          if (originalContent) {
            viewportMeta.setAttribute("content", originalContent);
          }
          window.removeEventListener("resize", handleResize);
          document.removeEventListener("touchstart", handleTouchStart);
          mounted = false;
        };
      }
    }

    if (isAndroid) {
      // Android Chrome viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Android-optimized viewport
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
        );

        // Android Visual Viewport API support
        if (window.visualViewport) {
          const handleViewportChange = () => {
            const vh = window.visualViewport.height * 0.01;
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );

            // Handle Android keyboard visibility
            const heightDifference =
              window.innerHeight - window.visualViewport.height;
            if (heightDifference > 150) {
              // Keyboard likely open
              document.body.classList.add("android-keyboard-open");
            } else {
              document.body.classList.remove("android-keyboard-open");
            }
          };

          window.visualViewport.addEventListener(
            "resize",
            handleViewportChange,
          );
          handleViewportChange(); // Set initial value

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }
            window.visualViewport.removeEventListener(
              "resize",
              handleViewportChange,
            );
            document.body.classList.remove("android-keyboard-open");
            mounted = false;
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
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }
            window.removeEventListener("resize", handleAndroidResize);
            mounted = false;
          };
        }
      }
    }

    // General mobile optimizations
    if (isIOS || isAndroid) {
      // Disable pull-to-refresh on mobile browsers
      document.body.style.overscrollBehavior = "none";

      // Optimize touch events
      const options = { passive: true };

      // Add touch event listeners for better mobile experience
      const handleTouchMove = (e) => {
        // Allow scrolling within the main container
        if (!e.target.closest(".mobile-smooth-scroll")) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", handleTouchMove, options);

      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.body.style.overscrollBehavior = "";
        mounted = false;
      };
    }

    return () => (mounted = false);
  }, [authManager, navigate]);

  ////
  //// Component rendering.
  ////

  return (
    <div>
      <style>
        {`
          /* iOS-specific styles */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
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
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          /* iOS Safe Area and additional optimizations */
          .ios-safe-area {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }

          .ios-button-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.5rem;
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            cursor: pointer;
          }

          .ios-link-fix {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
          }

          /* iOS momentum scrolling optimization */
          .ios-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          /* iOS Safari viewport fix */
          @supports (-webkit-touch-callout: none) {
            .ios-vh-fix {
              min-height: -webkit-fill-available;
            }
          }

          /* Android keyboard handling */
          body.android-keyboard-open {
            position: fixed;
            width: 100%;
          }

          .android-keyboard-open .main-content {
            transform: translateY(-20px);
            transition: transform 0.3s ease;
          }

          /* Android-specific styles */
          .android-touch-target {
            min-height: 48px;
            min-width: 48px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .android-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .android-viewport-fix {
            min-height: 100vh;
            min-height: calc(var(--android-vh, 1vh) * 100);
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          .android-gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000;
            perspective: 1000;
          }

          .android-button-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            /* Android text rendering optimization */
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

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

          /* High DPI Android devices */
          @media (-webkit-min-device-pixel-ratio: 2) and (max-device-width: 768px) {
            .android-high-dpi {
              -webkit-font-smoothing: subpixel-antialiased;
            }
          }

          /* Cross-platform mobile optimizations */
          .mobile-touch-target {
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-no-zoom {
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          .mobile-smooth-scroll {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          /* Performance optimizations */
          .gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
          }

          /* Animations with performance consideration */
          @keyframes blob {
            0% {
              transform: translate3d(0px, 0px, 0) scale(1);
            }
            33% {
              transform: translate3d(30px, -50px, 0) scale(1.1);
            }
            66% {
              transform: translate3d(-20px, 20px, 0) scale(0.9);
            }
            100% {
              transform: translate3d(0px, 0px, 0) scale(1);
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
            will-change: transform;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translate3d(0, 10px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
            will-change: transform, opacity;
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translate3d(0, 20px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          .animate-slide-up {
            animation: slide-up 0.8s ease-out;
            will-change: transform, opacity;
          }

          /* Landscape mode optimizations */
          @media (max-height: 500px) and (orientation: landscape) {
            .landscape-compact {
              padding-top: 1rem;
              padding-bottom: 1rem;
            }

            .landscape-compact .animate-blob {
              animation: none; /* Disable heavy animations in landscape */
            }
          }

          /* Accessibility and reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .animate-blob,
            .animate-fade-in,
            .animate-slide-up {
              animation: none;
            }

            * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }

          /* Dark mode support for system preference */
          @media (prefers-color-scheme: dark) {
            .auto-dark-bg {
              background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
            }
          }

          /* Print optimizations */
          @media print {
            .no-print {
              display: none !important;
            }

            .print-friendly {
              background: white !important;
              color: black !important;
              box-shadow: none !important;
            }
          }

          /* Focus management for accessibility */
          .focus-visible:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* Better text rendering on mobile */
          .mobile-text-optimize {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: "liga", "kern";
          }
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix ios-vh-fix android-viewport-fix android-gpu-accelerated mobile-smooth-scroll landscape-compact">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area mobile-text-optimize main-content">
          <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg gpu-accelerated">
                <img
                  src="/img/workery-logo.jpeg"
                  alt="Workery"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

            {/* Main Card */}
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl animate-slide-up p-6 sm:p-8 lg:p-10 gpu-accelerated print-friendly">
              {/* Progress Wizard */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Two-Factor Authentication Setup
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Step 1 of 3
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: "33%" }}
                  ></div>
                </div>
              </div>

              {/* Page Content */}
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Setup Two-Factor Authentication
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                    To ensure your account stays secure, you need to sign in
                    using{" "}
                    <span className="font-semibold text-blue-600">
                      two-factor Authentication (2FA)
                    </span>
                    . The following wizard will help you get setup with 2FA.
                  </p>
                </div>

                {/* Setup Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <QrCodeIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Recommended Setup Process
                      </h3>
                      <p className="text-blue-800 mb-4">
                        To make initial 2FA setup easier, we encourage you to
                        login on a device BESIDES the mobile device with the
                        camera that you wish to use.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3">
                          <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Login on a desktop device
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3">
                          <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Use mobile to scan QR code
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Apps Section */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                    Choose Your Authenticator App
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Apple 2FA Authenticator */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto bg-gray-900 rounded-xl flex items-center justify-center mb-3">
                          <span className="text-white text-lg font-bold">
                            🍎
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Apple 2FA
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        All iOS and Mac devices with a{" "}
                        <strong>Safari Web Browser</strong> come with built-in
                        2FA verification services. Sign in with your{" "}
                        <em>Apple ID</em> in Safari and you can take advantage
                        of this service.
                      </p>
                      <div className="flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700 ml-2">
                          Built-in Solution
                        </span>
                      </div>
                    </div>

                    {/* Google Authenticator */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                          <span className="text-white text-lg font-bold">
                            G
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Google Authenticator
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        This 2FA app is created by <strong>Google, Inc.</strong>{" "}
                        and works on both iOS and Android devices.
                      </p>
                      <div className="space-y-2">
                        <a
                          href="https://apps.apple.com/ca/app/google-authenticator/id388497605"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full py-2 px-3 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors ios-link-fix ios-touch-target android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                          role="button"
                          aria-label="Download Google Authenticator for iOS"
                        >
                          Download for iOS →
                        </a>
                        <a
                          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pli=1"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full py-2 px-3 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors ios-link-fix ios-touch-target android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                          role="button"
                          aria-label="Download Google Authenticator for Android"
                        >
                          Download for Android →
                        </a>
                      </div>
                    </div>

                    {/* Authenticator Chrome Extension */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                          <span className="text-white text-lg font-bold">
                            A
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Authenticator
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        This 2FA app is created by{" "}
                        <strong>authenticator.cc</strong> and works as a Chrome
                        browser extension.
                      </p>
                      <a
                        href="https://chromewebstore.google.com/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?pli=1"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors ios-link-fix ios-touch-target android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                        role="button"
                        aria-label="Add Authenticator extension to Chrome"
                      >
                        Add to Chrome →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ios-button-fix ios-touch-target android-button-fix android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                    type="button"
                    aria-label="Cancel 2FA setup and return to login"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Cancel Setup
                  </button>

                  <Link
                    to="/login/2fa/step-2"
                    className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium ios-link-fix ios-touch-target android-ripple android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                    role="button"
                    aria-label="Continue to step 2 of 2FA setup"
                  >
                    Continue Setup
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Debug info in development */}
              {import.meta.env.DEV && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Debug Info (Development Only):
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Authenticated:</span>
                      <span
                        className={`font-medium ${authManager.isAuthenticated() ? "text-green-600" : "text-red-600"}`}
                      >
                        {authManager.isAuthenticated() ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Step:</span>
                      <span className="font-medium">
                        1 of 3 (Introduction & App Downloads)
                      </span>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                      Auth State
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(authManager.getAuthState(), null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            {/* Copyright */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-sm text-gray-500">© 2024 Workery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFAStep1Page;

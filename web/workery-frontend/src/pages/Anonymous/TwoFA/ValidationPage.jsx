// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/ValidationPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

function TwoFAValidationPage() {
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
  const [token, setToken] = useState("");
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
    const validationError = twoFactorAuthManager.validateOTPCode(token);
    if (validationError) {
      setErrors(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    try {
      console.log("TwoFAValidationPage: Validating OTP token for login");

      // Clean token (remove whitespace)
      const cleanedToken = token.replace(/\s/g, "");

      // Validate OTP for login
      const validateResponse = await twoFactorAuthManager.validateOTP(
        { token: cleanedToken },
        onUnauthorized,
      );

      console.log(
        "TwoFAValidationPage: OTP validation successful",
        validateResponse,
      );

      // Handle successful validation - redirect based on user role
      if (validateResponse.user && validateResponse.user.role) {
        const redirectPath = getRoleRedirectPath(validateResponse.user.role);
        console.log(
          `TwoFAValidationPage: Redirecting to ${redirectPath} for role ${validateResponse.user.role}`,
        );
        navigate(redirectPath);
      } else {
        // Fallback redirect
        console.log(
          "TwoFAValidationPage: No user role in response, redirecting to dashboard",
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("TwoFAValidationPage: OTP validation failed", error);
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
    setToken(e.target.value);

    // Clear errors when user starts typing
    if (errors.token) {
      setErrors((prev) => ({
        ...prev,
        token: null,
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

      // Check if user is authenticated (they should be to access 2FA validation)
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAValidationPage: User not authenticated, redirecting to login",
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
        console.log(
          "TwoFAValidationPage: Auto-submitting token from URL parameter",
        );
        setToken(paramToken);
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
  const handleAutoSubmit = async (autoToken) => {
    setIsLoading(true);

    try {
      const validateResponse = await twoFactorAuthManager.validateOTP(
        { token: autoToken },
        onUnauthorized,
      );

      console.log(
        "TwoFAValidationPage: Auto-validation successful",
        validateResponse,
      );

      if (validateResponse.user && validateResponse.user.role) {
        const redirectPath = getRoleRedirectPath(validateResponse.user.role);
        navigate(redirectPath);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("TwoFAValidationPage: Auto-validation failed", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced iOS optimizations with comprehensive Safari and device support
  useEffect(() => {
    let mounted = true;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isiOSChrome = isIOS && isChrome;

    if (isIOS) {
      // Add iOS device class to body for CSS targeting
      document.body.classList.add("ios-device");
      if (isSafari) document.body.classList.add("ios-safari");
      if (isiOSChrome) document.body.classList.add("ios-chrome");
      if (isStandalone) document.body.classList.add("ios-standalone");

      // Store original scroll position for restoration
      let originalScrollY = 0;

      // Enhanced iOS viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // iOS 16+ optimized viewport settings
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, shrink-to-fit=no, interactive-widget=resizes-content",
        );

        // Add iOS-specific meta tags for better PWA support
        let appleTouchIcon = document.querySelector(
          'link[rel="apple-touch-icon"]',
        );
        if (!appleTouchIcon) {
          appleTouchIcon = document.createElement("link");
          appleTouchIcon.rel = "apple-touch-icon";
          appleTouchIcon.href = "/img/workery-logo.jpeg";
          document.head.appendChild(appleTouchIcon);
        }

        let appleStatusBar = document.querySelector(
          'meta[name="apple-mobile-web-app-status-bar-style"]',
        );
        if (!appleStatusBar) {
          appleStatusBar = document.createElement("meta");
          appleStatusBar.name = "apple-mobile-web-app-status-bar-style";
          appleStatusBar.content = "default";
          document.head.appendChild(appleStatusBar);
        }

        // Enhanced iOS viewport height calculations
        const updateViewportHeight = () => {
          const vh = window.innerHeight * 0.01;
          const visualVh = window.visualViewport
            ? window.visualViewport.height * 0.01
            : vh;

          document.documentElement.style.setProperty("--ios-vh", `${vh}px`);
          document.documentElement.style.setProperty(
            "--ios-visual-vh",
            `${visualVh}px`,
          );
          document.documentElement.style.setProperty("--ios-dvh", `${vh}px`);

          // Handle iOS Safari dynamic viewport
          if (isSafari && !isStandalone) {
            const safariVh =
              Math.min(window.innerHeight, window.screen.height) * 0.01;
            document.documentElement.style.setProperty(
              "--ios-safari-vh",
              `${safariVh}px`,
            );
          }
        };

        // iOS orientation change with improved handling
        const handleOrientationChange = () => {
          // Prevent Safari bounce during orientation change
          document.body.style.overflow = "hidden";

          setTimeout(() => {
            updateViewportHeight();
            window.scrollTo(0, 0);
            document.body.style.overflow = "";
          }, 500); // Increased timeout for iOS 16+
        };

        // Enhanced iOS keyboard handling
        const handleIOSKeyboard = () => {
          if (!window.visualViewport) return;

          const viewport = window.visualViewport;
          const heightDifference = window.innerHeight - viewport.height;
          const keyboardHeight = Math.max(0, heightDifference);

          document.documentElement.style.setProperty(
            "--ios-keyboard-height",
            `${keyboardHeight}px`,
          );

          if (heightDifference > 150) {
            document.body.classList.add("ios-keyboard-open");

            // Store scroll position before keyboard opens
            originalScrollY = window.scrollY;

            // Prevent background scroll when keyboard is open
            document.body.style.position = "fixed";
            document.body.style.top = `-${originalScrollY}px`;
            document.body.style.width = "100%";

            // Ensure focused input is visible
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === "INPUT") {
              setTimeout(() => {
                activeElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }, 100);
            }
          } else {
            document.body.classList.remove("ios-keyboard-open");

            // Restore scroll position when keyboard closes
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";

            setTimeout(() => {
              window.scrollTo(0, originalScrollY);
            }, 50);
          }
        };

        // iOS touch event optimizations
        const handleTouchStart = (e) => {
          // Prevent Safari zoom on double tap
          if (e.touches.length > 1) {
            e.preventDefault();
          }

          // Add iOS haptic feedback for buttons
          if (e.target.closest(".ios-haptic") && "vibrate" in navigator) {
            navigator.vibrate(10);
          }

          // iOS button press feedback
          const pressTarget = e.target.closest(".ios-press-feedback");
          if (pressTarget) {
            pressTarget.style.transform = "scale(0.96)";
            pressTarget.style.opacity = "0.8";
          }
        };

        const handleTouchEnd = (e) => {
          // Reset iOS button press feedback
          const pressTarget = e.target.closest(".ios-press-feedback");
          if (pressTarget) {
            setTimeout(() => {
              pressTarget.style.transform = "";
              pressTarget.style.opacity = "";
            }, 100);
          }
        };

        // iOS scroll optimization
        const handleScroll = () => {
          // Throttle scroll events for better performance
          if (window.iosScrollTimeout) {
            clearTimeout(window.iosScrollTimeout);
          }

          window.iosScrollTimeout = setTimeout(() => {
            // Update scroll-dependent styles
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty(
              "--ios-scroll-y",
              `${scrollY}px`,
            );
          }, 16); // ~60fps
        };

        // iOS input focus handling
        const handleFocusIn = (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            // Add focused class for styling
            e.target.classList.add("ios-input-focused");

            // Ensure input is visible above keyboard
            setTimeout(() => {
              if (window.visualViewport) {
                const rect = e.target.getBoundingClientRect();
                const viewportHeight = window.visualViewport.height;
                const inputBottom = rect.bottom;

                if (inputBottom > viewportHeight * 0.5) {
                  e.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                  });
                }
              }
            }, 300);
          }
        };

        const handleFocusOut = (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            e.target.classList.remove("ios-input-focused");
          }
        };

        // Visual Viewport API for iOS 13+
        if (window.visualViewport) {
          window.visualViewport.addEventListener("resize", handleIOSKeyboard, {
            passive: true,
          });
          window.visualViewport.addEventListener("scroll", handleIOSKeyboard, {
            passive: true,
          });
        }

        // Event listeners
        window.addEventListener("resize", updateViewportHeight, {
          passive: true,
        });
        window.addEventListener("orientationchange", handleOrientationChange, {
          passive: true,
        });
        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd, {
          passive: true,
        });
        document.addEventListener("focusin", handleFocusIn, { passive: true });
        document.addEventListener("focusout", handleFocusOut, {
          passive: true,
        });

        // Set initial values
        updateViewportHeight();

        // iOS performance optimizations
        document.body.style.webkitTransform = "translateZ(0)";
        document.body.style.webkitBackfaceVisibility = "hidden";
        document.body.style.webkitPerspective = "1000";

        // iOS scroll behavior optimization
        document.body.style.webkitOverflowScrolling = "touch";
        document.body.style.overscrollBehavior = "none";

        return () => {
          if (originalContent) {
            viewportMeta.setAttribute("content", originalContent);
          }

          // Cleanup event listeners
          window.removeEventListener("resize", updateViewportHeight);
          window.removeEventListener(
            "orientationchange",
            handleOrientationChange,
          );
          window.removeEventListener("scroll", handleScroll);
          document.removeEventListener("touchstart", handleTouchStart);
          document.removeEventListener("touchend", handleTouchEnd);
          document.removeEventListener("focusin", handleFocusIn);
          document.removeEventListener("focusout", handleFocusOut);

          if (window.visualViewport) {
            window.visualViewport.removeEventListener(
              "resize",
              handleIOSKeyboard,
            );
            window.visualViewport.removeEventListener(
              "scroll",
              handleIOSKeyboard,
            );
          }

          // Clear timeouts
          if (window.iosScrollTimeout) {
            clearTimeout(window.iosScrollTimeout);
          }

          // Cleanup classes and styles
          document.body.classList.remove(
            "ios-device",
            "ios-safari",
            "ios-chrome",
            "ios-standalone",
            "ios-keyboard-open",
          );

          document.body.style.webkitTransform = "";
          document.body.style.webkitBackfaceVisibility = "";
          document.body.style.webkitPerspective = "";
          document.body.style.webkitOverflowScrolling = "";
          document.body.style.overscrollBehavior = "";

          mounted = false;
        };
      }
    }

    if (isAndroid) {
      // Simplified Android handling since focus is on iOS
      document.body.classList.add("android-device");

      if (window.visualViewport) {
        const handleViewportChange = () => {
          const vh = window.visualViewport.height * 0.01;
          document.documentElement.style.setProperty("--android-vh", `${vh}px`);
        };

        window.visualViewport.addEventListener("resize", handleViewportChange, {
          passive: true,
        });
        handleViewportChange();

        return () => {
          window.visualViewport.removeEventListener(
            "resize",
            handleViewportChange,
          );
          document.body.classList.remove("android-device");
          mounted = false;
        };
      }
    }

    return () => (mounted = false);
  }, []);

  ////
  //// Component rendering.
  ////

  return (
    <div>
      <style>
        {`
          /* Comprehensive iOS-specific optimizations */

          /* iOS Device Detection and Base Styles */
          .ios-device {
            /* Enhanced iOS momentum scrolling */
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;

            /* iOS GPU acceleration */
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000px;
            perspective: 1000px;

            /* iOS font rendering */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;

            /* iOS touch optimization */
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          /* iOS Safari-specific optimizations */
          .ios-safari {
            /* Safari dynamic viewport fix */
            height: 100vh;
            height: calc(var(--ios-safari-vh, 1vh) * 100);
            height: -webkit-fill-available;
          }

          /* iOS Chrome-specific optimizations */
          .ios-chrome {
            /* Chrome on iOS viewport handling */
            min-height: 100vh;
            min-height: calc(var(--ios-vh, 1vh) * 100);
          }

          /* iOS PWA/Standalone mode */
          .ios-standalone {
            /* Remove default iOS PWA margins */
            margin: 0;
            padding: 0;

            /* Full viewport coverage */
            height: 100vh;
            height: -webkit-fill-available;
          }

          /* Enhanced iOS Safe Area Support */
          .ios-safe-area {
            /* Dynamic safe area with fallbacks */
            padding-left: max(env(safe-area-inset-left), 16px);
            padding-right: max(env(safe-area-inset-right), 16px);
            padding-top: max(env(safe-area-inset-top), 20px);
            padding-bottom: max(env(safe-area-inset-bottom), 20px);

            /* Additional safe areas for notched devices */
            padding-top: max(env(safe-area-inset-top), env(titlebar-area-height, 20px));
          }

          /* iOS Touch Targets and Interaction */
          .ios-touch-target {
            /* Apple HIG compliant touch targets */
            min-height: 44px;
            min-width: 44px;

            /* Touch optimization */
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;

            /* Layer promotion for smooth interactions */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            position: relative;
            z-index: 1;
          }

          /* Enhanced iOS Button Styling */
          .ios-button-fix {
            /* Remove default iOS styling */
            -webkit-appearance: none;
            appearance: none;

            /* Custom styling */
            border-radius: 0.75rem;
            border: none;
            outline: none;

            /* Touch optimization */
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            cursor: pointer;

            /* Performance optimization */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            will-change: transform, opacity;

            /* Prevent iOS button artifacts */
            position: relative;
            overflow: hidden;

            /* iOS focus handling */
            -webkit-focus-ring-color: transparent;
          }

          /* iOS Haptic Feedback */
          .ios-haptic {
            /* Enable haptic feedback on supported devices */
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          /* Enhanced iOS Input Styling */
          .ios-input-fix {
            /* Remove default iOS input styling */
            -webkit-appearance: none;
            appearance: none;

            /* Prevent iOS zoom on focus */
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;

            /* Custom styling */
            border-radius: 0.75rem;
            border: none;
            outline: none;

            /* Performance optimization */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;

            /* iOS autocomplete styling */
            -webkit-autofill-strong-password-viewable: false;
          }

          /* iOS Input Focus States */
          .ios-input-focused {
            /* Enhanced focus styling for iOS */
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
            border-color: #3b82f6 !important;

            /* Ensure visibility above keyboard */
            z-index: 1000;
            position: relative;
          }

          /* iOS Keyboard Handling */
          .ios-keyboard-safe {
            /* Dynamic keyboard height adjustment */
            padding-bottom: calc(env(keyboard-inset-height, 0px) + 20px);
            padding-bottom: calc(var(--ios-keyboard-height, 0px) + 20px);
            transition: padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          body.ios-keyboard-open {
            /* Prevent background scroll when keyboard is open */
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;

            /* Maintain scroll position */
            top: calc(var(--ios-scroll-y, 0px) * -1);
          }

          /* iOS Viewport Fixes */
          @supports (-webkit-touch-callout: none) {
            /* iOS Safari specific viewport fixes */
            .ios-vh-fix {
              min-height: 100vh;
              min-height: -webkit-fill-available;
              height: -webkit-fill-available;
            }

            .ios-dynamic-viewport {
              /* Multi-level fallbacks for iOS viewport */
              height: 100vh;
              height: calc(var(--ios-vh, 1vh) * 100);
              height: calc(var(--ios-visual-vh, 1vh) * 100);
              height: -webkit-fill-available;
            }

            /* iOS 16+ dvh support */
            .ios-dvh-support {
              height: 100dvh;
              min-height: 100dvh;
            }
          }

          /* iOS Content Container */
          .ios-content-container {
            /* Full height with safe scrolling */
            height: 100vh;
            height: calc(var(--ios-vh, 1vh) * 100);
            height: -webkit-fill-available;

            /* Optimized scrolling */
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;

            /* Prevent bounce */
            overscroll-behavior-y: none;
            -webkit-overscroll-behavior-y: none;
          }

          /* iOS Text Optimization */
          .ios-text-optimize {
            /* Enhanced iOS text rendering */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;

            /* Prevent iOS text size adjustment */
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;

            /* Better font features */
            font-feature-settings: "liga", "kern", "calt";
            font-variant-ligatures: common-ligatures;

            /* Improve readability on iOS */
            text-align: optimize-legibility;
          }

          /* iOS Animation and Performance */
          .ios-press-feedback {
            /* Smooth press animations */
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
                       opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform, opacity;
          }

          .ios-press-feedback:active {
            /* iOS-style press feedback */
            transform: scale(0.96);
            opacity: 0.8;
          }

          /* iOS GPU Layer Promotion */
          .ios-gpu-layer {
            /* Force GPU acceleration */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            perspective: 1000px;
            -webkit-perspective: 1000px;
            will-change: transform;

            /* Ensure crisp rendering */
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }

          /* iOS Selection and Interaction */
          .ios-no-select {
            /* Disable iOS text selection and callouts */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;

            /* Prevent iOS context menu */
            pointer-events: auto;
            -webkit-touch-callout: none;
          }

          /* iOS PWA Status Bar */
          @media (display-mode: standalone) {
            .ios-pwa-status-bar {
              /* Account for iOS status bar in PWA mode */
              padding-top: calc(env(safe-area-inset-top) + 20px);
              padding-top: calc(env(titlebar-area-height, 44px) + 20px);
            }
          }

          /* iOS Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            .ios-device {
              /* iOS dark mode color scheme */
              color-scheme: dark;
              -webkit-color-scheme: dark;

              /* Dark mode scrollbar */
              scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
            }
          }

          /* iOS Accessibility */
          .ios-accessibility-enhanced {
            /* Better contrast for iOS accessibility */
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;

            /* Support for iOS voice control */
            speak: normal;
            -webkit-speak: normal;
          }

          @media (prefers-reduced-motion: reduce) {
            .ios-device * {
              /* Respect iOS reduced motion preference */
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

          /* iOS Orientation Handling */
          @media (orientation: landscape) and (max-height: 500px) {
            .ios-landscape-compact {
              /* Compact layout for iOS landscape */
              padding: 0.5rem;
              min-height: auto;
            }

            .ios-landscape-compact .animate-blob {
              /* Disable heavy animations in compact landscape */
              animation: none;
            }
          }

          /* iOS 16+ Interactive Widget Support */
          @supports (height: 1dvh) {
            .ios-dynamic-viewport-new {
              height: 100dvh;
              min-height: 100dvh;
            }
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
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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

          /* Responsive typography */
          @media (max-width: 640px) {
            .responsive-text-xl {
              font-size: 1.125rem;
              line-height: 1.75rem;
            }

            .responsive-text-3xl {
              font-size: 1.875rem;
              line-height: 2.25rem;
            }
          }

          /* Landscape mode optimizations */
          @media (max-height: 500px) and (orientation: landscape) {
            .landscape-compact {
              padding-top: 1rem;
              padding-bottom: 1rem;
            }

            .landscape-compact .animate-blob {
              animation: none;
            }
          }
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix ios-vh-fix ios-dynamic-viewport android-viewport-fix android-gpu-accelerated mobile-smooth-scroll landscape-compact ios-no-bounce ios-gesture-safe">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ios-gpu-layer android-gpu-accelerated">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-indigo-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area ios-keyboard-safe android-status-bar-fix android-nav-bar-fix mobile-text-optimize ios-text-optimize main-content ios-content-container">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select ios-gpu-layer android-gpu-accelerated">
              <Link
                to="/"
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg gpu-accelerated ios-gpu-layer ios-button-fix android-button-fix ios-touch-target android-touch-target mobile-touch-target focus-visible"
              >
                <img
                  src="/img/workery-logo.jpeg"
                  alt="Workery"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  loading="eager"
                  decoding="async"
                />
              </Link>
            </div>

            {/* Main Card */}
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl animate-slide-up p-6 sm:p-8 lg:p-10 gpu-accelerated ios-gpu-layer android-gpu-accelerated">
              {/* Progress Wizard */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ios-text-optimize android-text-optimize">
                      Two-Factor Authentication
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full ios-text-optimize android-text-optimize">
                    Verification
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ios-gpu-layer android-gpu-accelerated">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl ios-gpu-layer android-gpu-accelerated">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2 ios-text-optimize android-text-optimize">
                        Error occurred:
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(errors).map(([key, value]) => (
                          <div
                            key={key}
                            className="text-sm text-red-800 ios-text-optimize android-text-optimize"
                          >
                            <strong>{key}:</strong>{" "}
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page Content */}
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 responsive-text-3xl ios-text-optimize android-text-optimize">
                    Enter Verification Code
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto ios-text-optimize android-text-optimize">
                    Open the two-step verification app on your mobile device,
                    get your token and enter it below to complete your login.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="token"
                      className="block text-lg font-semibold text-gray-900 ios-text-optimize android-text-optimize"
                    >
                      <KeyIcon className="inline h-5 w-5 mr-2 text-gray-600" />
                      Authentication Code
                    </label>
                    <input
                      id="token"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={token}
                      onChange={handleTokenChange}
                      disabled={isLoading}
                      className={`w-full p-4 sm:p-5 border-2 rounded-xl text-center text-lg sm:text-xl font-mono tracking-wider transition-all duration-200 mobile-no-zoom ios-input-fix android-input-fix ios-text-optimize android-text-optimize focus-visible ${
                        errors.token
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      maxLength="6"
                      autoComplete="one-time-code"
                    />
                    {errors.token && (
                      <div className="text-red-600 text-sm font-medium mt-2 ios-text-optimize android-text-optimize">
                        {errors.token}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 text-center ios-text-optimize android-text-optimize">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium ios-button-fix ios-touch-target ios-press-feedback android-button-fix android-touch-target mobile-touch-target mobile-no-zoom ios-text-optimize android-text-optimize focus-visible"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Back to Login
                    </Link>

                    <button
                      type="submit"
                      disabled={isLoading || !token.trim()}
                      className={`flex items-center justify-center px-6 py-4 rounded-xl font-medium transition-all duration-200 ios-button-fix ios-touch-target ios-press-feedback android-button-fix android-touch-target mobile-touch-target mobile-no-zoom ios-text-optimize android-text-optimize focus-visible ${
                        isLoading || !token.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          Verify Code
                          <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Backup Code Recovery Link */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <Link
                    to="/login/2fa/backup-code-recovery"
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 ios-button-fix ios-touch-target android-button-fix android-touch-target mobile-touch-target ios-text-optimize android-text-optimize focus-visible"
                  >
                    Can't access your device? Use backup code
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
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
                        className={`font-medium ${
                          authManager.isAuthenticated()
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {authManager.isAuthenticated() ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Token Length:</span>
                      <span className="font-medium">{token.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has URL Token:</span>
                      <span className="font-medium">
                        {paramToken ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Submitted Param Token:</span>
                      <span className="font-medium">
                        {submittedParamToken ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Loading:</span>
                      <span className="font-medium">
                        {isLoading ? "Yes" : "No"}
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
              <p className="text-sm text-gray-500 ios-text-optimize android-text-optimize">
                © 2024 Workery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFAValidationPage;

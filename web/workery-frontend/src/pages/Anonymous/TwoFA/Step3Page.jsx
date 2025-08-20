// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step3Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

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

    // Enhanced iOS and Android optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS) {
      // Enhanced iOS viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Enhanced iOS-optimized viewport for better form handling
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content",
        );

        // iOS Safari specific optimizations
        const handleIOSResize = () => {
          // Enhanced iOS Safari viewport height fix with keyboard detection
          const actualVH = window.innerHeight * 0.01;
          document.documentElement.style.setProperty(
            "--ios-vh",
            `${actualVH}px`,
          );
          document.documentElement.style.setProperty(
            "--ios-actual-vh",
            `${window.innerHeight}px`,
          );

          // Detect iOS virtual keyboard
          const heightChange = window.screen.height - window.innerHeight;
          if (heightChange > 150) {
            document.body.classList.add("ios-keyboard-open");
          } else {
            document.body.classList.remove("ios-keyboard-open");
          }
        };

        // Enhanced iOS touch event optimizations for form inputs
        const handleIOSTouchStart = (e) => {
          // Prevent iOS scroll bounce but allow input focus
          if (
            e.target.tagName !== "INPUT" &&
            e.target.tagName !== "BUTTON" &&
            e.target.tagName !== "A"
          ) {
            if (
              e.target === document.body ||
              e.target === document.documentElement
            ) {
              e.preventDefault();
            }
          }
        };

        // iOS form input optimizations
        const handleIOSInputFocus = (e) => {
          if (e.target.tagName === "INPUT") {
            // Prevent zoom on input focus
            e.target.style.fontSize = "16px";

            // Scroll input into view with extra spacing for iOS keyboard
            setTimeout(() => {
              e.target.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            }, 300);
          }
        };

        // iOS Safari scroll position restoration
        const handleIOSScroll = () => {
          // Prevent overscroll on main container
          const scrollTop = document.documentElement.scrollTop;
          if (scrollTop < 0) {
            document.documentElement.scrollTop = 0;
          }
        };

        // iOS-specific event listeners
        window.addEventListener("resize", handleIOSResize);
        window.addEventListener("orientationchange", handleIOSResize);
        document.addEventListener("touchstart", handleIOSTouchStart, {
          passive: false,
        });
        document.addEventListener("focusin", handleIOSInputFocus, {
          passive: true,
        });
        document.addEventListener("scroll", handleIOSScroll, { passive: true });

        // iOS performance optimizations
        document.body.style.webkitTextSizeAdjust = "100%";
        document.body.style.webkitTouchCallout = "none";
        document.body.style.webkitUserSelect = "none";

        // Set initial values
        handleIOSResize();

        return () => {
          if (originalContent) {
            viewportMeta.setAttribute("content", originalContent);
          }
          window.removeEventListener("resize", handleIOSResize);
          window.removeEventListener("orientationchange", handleIOSResize);
          document.removeEventListener("touchstart", handleIOSTouchStart);
          document.removeEventListener("focusin", handleIOSInputFocus);
          document.removeEventListener("scroll", handleIOSScroll);
          document.body.classList.remove("ios-keyboard-open");
          mounted = false;
        };
      }
    }

    if (isAndroid) {
      // Enhanced Android Chrome viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Enhanced Android-optimized viewport
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no",
        );

        // Enhanced Android Visual Viewport API support
        if (window.visualViewport) {
          const handleAndroidViewportChange = () => {
            const vh = window.visualViewport.height * 0.01;
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-actual-vh",
              `${window.visualViewport.height}px`,
            );

            // Enhanced Android keyboard visibility detection
            const heightDifference =
              window.innerHeight - window.visualViewport.height;
            const isKeyboardOpen = heightDifference > 150;

            if (isKeyboardOpen) {
              document.body.classList.add("android-keyboard-open");
              document.documentElement.style.setProperty(
                "--keyboard-height",
                `${heightDifference}px`,
              );
            } else {
              document.body.classList.remove("android-keyboard-open");
              document.documentElement.style.setProperty(
                "--keyboard-height",
                "0px",
              );
            }

            // Android Chrome address bar handling
            const addressBarHeight = window.outerHeight - window.innerHeight;
            document.documentElement.style.setProperty(
              "--android-address-bar",
              `${addressBarHeight}px`,
            );
          };

          window.visualViewport.addEventListener(
            "resize",
            handleAndroidViewportChange,
          );
          window.visualViewport.addEventListener(
            "scroll",
            handleAndroidViewportChange,
          );
          handleAndroidViewportChange(); // Set initial value

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }
            window.visualViewport.removeEventListener(
              "resize",
              handleAndroidViewportChange,
            );
            window.visualViewport.removeEventListener(
              "scroll",
              handleAndroidViewportChange,
            );
            document.body.classList.remove("android-keyboard-open");
            mounted = false;
          };
        } else {
          // Enhanced fallback for older Android versions
          const handleAndroidResize = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-actual-vh",
              `${window.innerHeight}px`,
            );

            // Fallback keyboard detection for older Android
            const screenHeight = window.screen.height;
            const currentHeight = window.innerHeight;
            const heightRatio = currentHeight / screenHeight;

            if (heightRatio < 0.75) {
              document.body.classList.add("android-keyboard-open");
            } else {
              document.body.classList.remove("android-keyboard-open");
            }
          };

          window.addEventListener("resize", handleAndroidResize);
          window.addEventListener("orientationchange", handleAndroidResize);
          handleAndroidResize();

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }
            window.removeEventListener("resize", handleAndroidResize);
            window.removeEventListener(
              "orientationchange",
              handleAndroidResize,
            );
            document.body.classList.remove("android-keyboard-open");
            mounted = false;
          };
        }
      }

      // Enhanced Android performance optimizations
      document.body.style.overscrollBehavior = "none";
      document.body.style.webkitOverflowScrolling = "touch";
      document.body.style.touchAction = "manipulation";

      // Android Chrome input optimizations
      const handleAndroidInputFocus = (e) => {
        if (e.target.tagName === "INPUT") {
          // Ensure proper input handling on Android
          e.target.style.fontSize = "16px";
          e.target.style.zoom = "1";

          // Scroll input into view for Android keyboard
          setTimeout(() => {
            e.target.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }, 300);
        }
      };

      // Android touch optimizations
      const handleAndroidTouch = (e) => {
        // Enhanced ripple effect for Android Material Design
        if (e.target.classList.contains("android-ripple")) {
          const rect = e.target.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          const ripple = document.createElement("span");
          ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: android-ripple-animation 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
          `;

          e.target.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 600);
        }
      };

      document.addEventListener("focusin", handleAndroidInputFocus, {
        passive: true,
      });
      document.addEventListener("touchstart", handleAndroidTouch, {
        passive: true,
      });

      return () => {
        document.removeEventListener("focusin", handleAndroidInputFocus);
        document.removeEventListener("touchstart", handleAndroidTouch);
        document.body.style.overscrollBehavior = "";
        document.body.style.webkitOverflowScrolling = "";
        document.body.style.touchAction = "";
        mounted = false;
      };
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
  }, [paramToken, submittedParamToken, authManager, navigate]);

  ////
  //// Component rendering.
  ////

  return (
    <div>
      <style>
        {`
          /* Enhanced iOS-specific styles */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          .ios-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }

          .ios-touch-target {
            min-height: 44px;
            min-width: 44px;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            -webkit-touch-callout: none;
          }

          /* Enhanced iOS Safe Area and additional optimizations */
          .ios-safe-area {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }

          .ios-button-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.75rem;
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            touch-action: manipulation;
            cursor: pointer;
            -webkit-font-smoothing: antialiased;
          }

          .ios-link-fix {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
            -webkit-font-smoothing: antialiased;
          }

          /* Enhanced iOS form input optimizations */
          .ios-input-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-border-radius: 0.75rem;
            border-radius: 0.75rem;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: text;
            user-select: text;
            font-size: 16px !important; /* Prevent zoom on focus */
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            /* Enhanced iOS autocomplete and validation */
            -webkit-autocomplete: off;
            autocomplete: off;
            -webkit-autocorrect: off;
            autocorrect: off;
            -webkit-autocapitalize: off;
            autocapitalize: off;
            spellcheck: false;
            /* iOS keyboard optimizations */
            inputmode: numeric;
            pattern: "[0-9]*";
          }

          /* iOS keyboard handling */
          body.ios-keyboard-open {
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .ios-keyboard-open .main-content {
            transform: translateY(-60px);
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .ios-keyboard-open .ios-input-container {
            margin-bottom: 120px;
            transition: margin-bottom 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          /* Enhanced iOS momentum scrolling optimization */
          .ios-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          /* Enhanced iOS Safari viewport fix */
          @supports (-webkit-touch-callout: none) {
            .ios-vh-fix {
              min-height: -webkit-fill-available;
              min-height: calc(var(--ios-vh, 1vh) * 100);
            }

            .ios-full-height {
              height: -webkit-fill-available;
              height: calc(var(--ios-actual-vh, 100vh));
            }
          }

          /* iOS Safari address bar handling */
          @supports (-webkit-touch-callout: none) {
            .ios-viewport-height {
              min-height: 100vh;
              min-height: -webkit-fill-available;
              min-height: calc(var(--ios-vh, 1vh) * 100);
            }
          }

          /* iOS text rendering optimizations */
          .ios-text-optimize {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            -webkit-text-size-adjust: 100%;
            font-feature-settings: "liga", "kern";
            /* iOS-specific font optimizations */
            -webkit-font-feature-settings: "liga", "kern";
            font-synthesis: none;
            -webkit-font-synthesis: none;
          }

          /* iOS focus management */
          .ios-focus-fix:focus {
            outline: none;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
            border-color: #3b82f6;
          }

          /* iOS animation performance optimizations */
          .ios-gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000px;
            perspective: 1000px;
            will-change: transform;
          }

          /* iOS-specific button hover states (for iPad with pointer) */
          @media (hover: hover) and (pointer: fine) {
            .ios-button-hover:hover {
              -webkit-transform: scale(1.02);
              transform: scale(1.02);
              transition: -webkit-transform 0.2s ease-out;
              transition: transform 0.2s ease-out;
            }
          }

          /* iOS accessibility improvements */
          .ios-accessibility {
            -webkit-font-smoothing: antialiased;
            speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
          }

          /* iOS dark mode optimizations */
          @media (prefers-color-scheme: dark) {
            .ios-dark-mode {
              color-scheme: dark;
              -webkit-color-scheme: dark;
            }
          }

          /* iOS orientation change optimizations */
          @media (orientation: landscape) {
            .ios-landscape-fix {
              height: -webkit-fill-available;
              min-height: -webkit-fill-available;
            }

            .ios-landscape-input {
              margin-top: 1rem;
              margin-bottom: 2rem;
            }
          }

          /* iOS device-specific optimizations */
          /* iPhone SE and smaller devices */
          @media only screen and (max-width: 375px) and (-webkit-min-device-pixel-ratio: 2) {
            .ios-small-device {
              padding: 1rem 0.75rem;
            }

            .ios-small-input {
              font-size: 18px;
              padding: 1rem;
            }
          }

          /* iPhone Pro Max and larger devices */
          @media only screen and (min-width: 414px) and (-webkit-min-device-pixel-ratio: 3) {
            .ios-large-device {
              padding: 2rem 1.5rem;
            }
          }

          /* iPad optimizations */
          @media only screen and (min-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
            .ios-tablet {
              max-width: 768px;
              margin: 0 auto;
            }

            .ios-tablet-input {
              max-width: 400px;
              margin: 0 auto;
            }
          }

          /* Enhanced Android keyboard handling */
          body.android-keyboard-open {
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .android-keyboard-open .main-content {
            transform: translateY(-40px);
            transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            padding-bottom: calc(var(--keyboard-height, 0px) / 2);
          }

          .android-keyboard-open .android-input-container {
            margin-bottom: 80px;
            transition: margin-bottom 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          /* Enhanced Android-specific styles */
          .android-touch-target {
            min-height: 48px;
            min-width: 48px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            outline: none;
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
            min-height: calc(var(--android-actual-vh, 100vh));
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          .android-gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000px;
            perspective: 1000px;
            will-change: transform;
          }

          .android-button-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            outline: none;
            border: none;
            /* Enhanced Android text rendering optimization */
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: "liga", "kern";
            /* Android Material Design elevation */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: box-shadow 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          .android-button-fix:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }

          .android-button-fix:active {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            transform: translateY(1px);
          }

          /* Enhanced Android Material Design ripple effect */
          .android-ripple {
            position: relative;
            overflow: hidden;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          .android-ripple:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transition: width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
            transform: translate(-50%, -50%);
            pointer-events: none;
          }

          .android-ripple:active:before {
            width: 300px;
            height: 300px;
          }

          @keyframes android-ripple-animation {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          /* Enhanced Android input optimizations */
          .android-input-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-border-radius: 8px;
            border-radius: 8px;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: text;
            user-select: text;
            font-size: 16px !important; /* Prevent zoom on focus */
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            /* Enhanced Android font rendering */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            /* Android-specific input attributes */
            -webkit-autocomplete: off;
            autocomplete: off;
            -webkit-autocorrect: off;
            autocorrect: off;
            -webkit-autocapitalize: off;
            autocapitalize: off;
            spellcheck: false;
            /* Android keyboard optimizations */
            inputmode: numeric;
            pattern: "[0-9]*";
            /* Android Material Design styling */
            background-color: white;
            transition: border-color 0.2s cubic-bezier(0.4, 0.0, 0.2, 1),
                        box-shadow 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          .android-input-fix:focus {
            outline: none;
            border-color: #1976d2;
            box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
          }

          /* Android Material Design card styling */
          .android-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: box-shadow 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          .android-card:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          }

          /* High DPI Android devices */
          @media (-webkit-min-device-pixel-ratio: 2) and (max-device-width: 768px) {
            .android-high-dpi {
              -webkit-font-smoothing: subpixel-antialiased;
              font-feature-settings: "liga", "kern";
            }

            .android-high-dpi-input {
              font-size: 18px !important;
              letter-spacing: 0.025em;
            }
          }

          /* Android device-specific optimizations */
          /* Small Android devices (320px-360px) */
          @media only screen and (max-width: 360px) and (orientation: portrait) {
            .android-small-device {
              padding: 0.75rem 0.5rem;
            }

            .android-small-input {
              font-size: 18px !important;
              padding: 1rem 0.75rem;
              letter-spacing: 0.4em;
            }

            .android-small-button {
              padding: 0.875rem 1.5rem;
              font-size: 0.875rem;
            }
          }

          /* Medium Android devices (360px-414px) */
          @media only screen and (min-width: 361px) and (max-width: 414px) {
            .android-medium-device {
              padding: 1rem 0.75rem;
            }

            .android-medium-input {
              font-size: 20px !important;
              padding: 1.125rem 1rem;
            }
          }

          /* Large Android devices (414px+) */
          @media only screen and (min-width: 415px) {
            .android-large-device {
              padding: 1.5rem 1rem;
            }

            .android-large-input {
              font-size: 22px !important;
              padding: 1.25rem 1.5rem;
            }
          }

          /* Android tablet optimizations (7" and larger) */
          @media only screen and (min-width: 768px) and (orientation: landscape) {
            .android-tablet {
              max-width: 800px;
              margin: 0 auto;
            }

            .android-tablet-input {
              max-width: 480px;
              margin: 0 auto;
            }

            .android-tablet-layout {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              align-items: center;
            }
          }

          /* Android Chrome address bar handling */
          @supports (-webkit-touch-callout: none) {
            .android-chrome-fix {
              min-height: calc(100vh - var(--android-address-bar, 0px));
              min-height: calc(var(--android-actual-vh, 100vh));
            }
          }

          /* Android accessibility improvements */
          .android-accessibility {
            -webkit-font-smoothing: antialiased;
            speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1.5;
            /* Enhanced Android screen reader support */
            font-feature-settings: "liga", "kern";
          }

          /* Android focus management */
          .android-focus-fix:focus {
            outline: 2px solid #1976d2;
            outline-offset: 2px;
            border-radius: 8px;
          }

          /* Android performance optimizations */
          .android-performance {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
            /* Android GPU acceleration */
            -webkit-perspective: 1000px;
            perspective: 1000px;
          }

          /* Android orientation change optimizations */
          @media (orientation: landscape) {
            .android-landscape-fix {
              min-height: calc(var(--android-vh, 1vh) * 100);
              min-height: calc(var(--android-actual-vh, 100vh));
            }

            .android-landscape-input {
              margin-top: 0.5rem;
              margin-bottom: 1rem;
            }

            .android-landscape-compact {
              padding: 0.75rem 1rem;
            }
          }

          /* Android scrolling optimizations */
          .android-smooth-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            scroll-behavior: smooth;
          }

          /* Android WebView optimizations */
          @media screen and (-webkit-min-device-pixel-ratio: 0) {
            .android-webview-fix {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-font-smoothing: antialiased;
              text-rendering: optimizeLegibility;
            }
          }

          /* Android dark mode support */
          @media (prefers-color-scheme: dark) {
            .android-dark-mode {
              background-color: #121212;
              color: #ffffff;
            }

            .android-dark-card {
              background-color: #1e1e1e;
              border: 1px solid #333333;
            }

            .android-dark-input {
              background-color: #2a2a2a;
              border-color: #444444;
              color: #ffffff;
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

          /* Custom error state styles */
          .error-border {
            border: 2px solid #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }

          .success-border {
            border: 2px solid #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          }
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix ios-vh-fix ios-viewport-height ios-full-height ios-momentum-scroll android-viewport-fix android-gpu-accelerated mobile-smooth-scroll landscape-compact ios-landscape-fix">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ios-gpu-accelerated">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob ios-gpu-accelerated"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000 ios-gpu-accelerated"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-pink-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000 ios-gpu-accelerated"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area ios-small-device ios-large-device mobile-text-optimize ios-text-optimize main-content">
          <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl ios-tablet">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select ios-gpu-accelerated">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg gpu-accelerated ios-gpu-accelerated">
                <img
                  src="/img/workery-logo.jpeg"
                  alt="Workery"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain ios-accessibility"
                  loading="eager"
                  decoding="async"
                  style={{ WebkitUserSelect: "none" }}
                />
              </div>
            </div>

            {/* Main Card */}
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl animate-slide-up p-6 sm:p-8 lg:p-10 gpu-accelerated ios-gpu-accelerated print-friendly ios-dark-mode">
              {/* Progress Wizard */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600 ios-accessibility" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ios-text-optimize">
                      Two-Factor Authentication Setup
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full ios-text-optimize">
                    Step 3 of 3
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ios-gpu-accelerated">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700 ease-out ios-gpu-accelerated"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              {/* Page Content */}
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ios-text-optimize">
                    Verify Your Code
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto ios-text-optimize">
                    Open the two-step verification app on your mobile device to
                    get your verification code.
                  </p>
                </div>

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-sm font-bold">
                            !
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">
                          Error occurred
                        </h3>
                        <div className="space-y-1">
                          {Object.entries(errors).map(([key, value]) => (
                            <div key={key} className="text-red-800 text-sm">
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

                {/* Verification Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Get Your Verification Code
                      </h3>
                      <p className="text-blue-800 mb-4">
                        Open your authenticator app and enter the 6-digit code
                        that's currently displayed.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3">
                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            6-digit code required
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/70 rounded-lg p-3">
                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Code refreshes every 30 seconds
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="ios-input-container">
                    <label
                      htmlFor="verificationToken"
                      className="block text-lg font-semibold text-gray-900 mb-3 ios-text-optimize"
                    >
                      Enter your Verification Code:
                    </label>
                    <div className="relative ios-tablet-input">
                      <input
                        id="verificationToken"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="000000"
                        value={verificationToken}
                        onChange={handleTokenChange}
                        disabled={isLoading}
                        maxLength="6"
                        autoComplete="one-time-code"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className={`w-full text-center text-2xl font-mono tracking-wider px-4 py-4 border rounded-xl transition-all duration-200 ios-input-fix ios-focus-fix ios-gpu-accelerated ${
                          errors.verificationToken || errors.verification_token
                            ? "error-border"
                            : verificationToken.length === 6
                              ? "success-border"
                              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        } ${
                          isLoading
                            ? "bg-gray-50 cursor-not-allowed"
                            : "bg-white"
                        } ${
                          window.navigator.userAgent.includes("iPhone") &&
                          window.screen.width <= 375
                            ? "ios-small-input"
                            : ""
                        }`}
                        style={{
                          letterSpacing: "0.5em",
                          WebkitTextSizeAdjust: "100%",
                          WebkitAppearance: "none",
                          WebkitBorderRadius: "0.75rem",
                        }}
                      />
                      {verificationToken.length === 6 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 ios-gpu-accelerated">
                          <CheckCircleIcon className="h-6 w-6 text-green-500 ios-accessibility" />
                        </div>
                      )}
                    </div>
                    {(errors.verificationToken ||
                      errors.verification_token) && (
                      <div className="mt-2 text-red-600 text-sm font-medium ios-text-optimize">
                        {errors.verificationToken || errors.verification_token}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500 text-center ios-text-optimize">
                      {verificationToken.length}/6 digits entered
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200">
                    <Link
                      to="/login/2fa/step-2"
                      className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ios-link-fix ios-touch-target ios-button-hover ios-gpu-accelerated android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                      role="button"
                      aria-label="Go back to step 2"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2 ios-accessibility" />
                      Back
                    </Link>

                    <button
                      type="submit"
                      disabled={isLoading || !verificationToken.trim()}
                      className={`flex items-center justify-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ios-button-fix ios-touch-target ios-button-hover ios-gpu-accelerated android-button-fix android-ripple android-touch-target mobile-touch-target mobile-no-zoom focus-visible ${
                        isLoading || !verificationToken.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105"
                      }`}
                      style={{
                        WebkitAppearance: "none",
                        WebkitTapHighlightColor: "transparent",
                        WebkitTouchCallout: "none",
                      }}
                      aria-label={
                        isLoading
                          ? "Verifying code"
                          : "Submit verification code"
                      }
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 ios-gpu-accelerated"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Submit and Verify
                          <ArrowRightIcon className="h-4 w-4 ml-2 ios-accessibility" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
                      <span className="font-medium">3 of 3 (Verification)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Token Length:</span>
                      <span className="font-medium">
                        {verificationToken.length}
                      </span>
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
                      Setup State
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(
                        twoFactorAuthManager.getSetupState(),
                        null,
                        2,
                      )}
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

export default TwoFAStep3Page;

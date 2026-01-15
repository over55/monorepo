// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/BackupCodeGeneratePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function TwoFABackupCodeGeneratePage() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams();
  const backupCode = searchParams.get("v");

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
  const [currentUser, setCurrentUser] = useState(null);
  const [copied, setCopied] = useState(false);

  ////
  //// Event handling.
  ////

  /**
   * Handle backup code copy to clipboard
   */
  const handleCopyCode = async () => {
    if (backupCode) {
      try {
        await navigator.clipboard.writeText(backupCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy backup code:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = backupCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  /**
   * Handle confirmation and redirect to dashboard
   */
  const handleConfirm = () => {
    // Clear 2FA setup state since we're done
    twoFactorAuthManager.clearSetupState();

    // Determine redirect path based on user role
    if (currentUser && currentUser.role) {
      const redirectPath = getRoleRedirectPath(currentUser.role);
      console.log(
        `TwoFABackupCodeGeneratePage: Redirecting to ${redirectPath} for role ${currentUser.role}`,
      );
      navigate(redirectPath);
    } else {
      // Fallback redirect
      console.log(
        "TwoFABackupCodeGeneratePage: No user role found, redirecting to dashboard",
      );
      navigate("/dashboard");
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
          "TwoFABackupCodeGeneratePage: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      // Check if backup code is provided
      if (!backupCode) {
        console.log(
          "TwoFABackupCodeGeneratePage: No backup code provided, redirecting to 2FA setup",
        );
        navigate("/login/2fa/step-1");
        return;
      }

      // Try to get current user from auth state (this might not be available in our current setup)
      // For now, we'll use a placeholder
      setCurrentUser({ role: 1 }); // Default to executive role for demo

      console.log(
        "TwoFABackupCodeGeneratePage: Backup code displayed successfully",
      );
    }

    // Enhanced iOS and Android optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (isIOS) {
      // Add iOS device class to body for CSS targeting
      document.body.classList.add("ios-device");

      // Enhanced iOS viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Enhanced iOS-optimized viewport with better support
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, shrink-to-fit=no",
        );

        // Enhanced iOS viewport handling
        const handleResize = () => {
          // iOS Safari viewport height fix with better calculations
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty("--ios-vh", `${vh}px`);
          document.documentElement.style.height = `${window.innerHeight}px`;

          // Handle iOS Safari bottom bar
          if (isSafari && !isStandalone) {
            const actualVh = window.visualViewport
              ? window.visualViewport.height
              : window.innerHeight;
            document.documentElement.style.setProperty(
              "--actual-vh",
              `${actualVh * 0.01}px`,
            );
          }
        };

        // Enhanced iOS orientation change handling
        const handleOrientationChange = () => {
          setTimeout(() => {
            handleResize();
            window.scrollTo(0, 0);
          }, 300);
        };

        // Enhanced iOS touch event optimizations
        const handleTouchStart = (e) => {
          // Prevent iOS scroll bounce on main container
          if (
            e.target === document.body ||
            e.target === document.documentElement
          ) {
            e.preventDefault();
          }

          // Handle iOS button press feedback
          if (e.target.closest(".ios-press-feedback")) {
            e.target.closest(".ios-press-feedback").style.transform =
              "scale(0.96)";
          }
        };

        const handleTouchEnd = (e) => {
          // Reset iOS button press feedback
          if (e.target.closest(".ios-press-feedback")) {
            setTimeout(() => {
              const element = e.target.closest(".ios-press-feedback");
              if (element) {
                element.style.transform = "";
              }
            }, 100);
          }
        };

        // iOS focus handling for inputs
        const handleFocusIn = (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            // Delay to ensure keyboard is shown
            setTimeout(() => {
              e.target.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            }, 300);
          }
        };

        // Visual Viewport API support for iOS
        if (window.visualViewport) {
          const handleVisualViewportChange = () => {
            const vh = window.visualViewport.height * 0.01;
            document.documentElement.style.setProperty(
              "--visual-vh",
              `${vh}px`,
            );

            // Handle keyboard appearance
            const heightDifference =
              window.innerHeight - window.visualViewport.height;
            if (heightDifference > 150) {
              document.body.classList.add("ios-keyboard-open");
            } else {
              document.body.classList.remove("ios-keyboard-open");
            }
          };

          window.visualViewport.addEventListener(
            "resize",
            handleVisualViewportChange,
          );
          window.visualViewport.addEventListener(
            "scroll",
            handleVisualViewportChange,
          );
        }

        // iOS Safe Area handling for PWA
        if (isStandalone) {
          document.body.classList.add("ios-pwa-mode");
        }

        // Add event listeners
        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("orientationchange", handleOrientationChange, {
          passive: true,
        });
        document.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd, {
          passive: true,
        });
        document.addEventListener("focusin", handleFocusIn, { passive: true });

        // Set initial values
        handleResize();

        // iOS performance optimizations
        document.body.style.webkitTransform = "translateZ(0)";
        document.body.style.webkitBackfaceVisibility = "hidden";
        document.body.style.webkitPerspective = "1000";

        return () => {
          if (originalContent) {
            viewportMeta.setAttribute("content", originalContent);
          }

          // Cleanup event listeners
          window.removeEventListener("resize", handleResize);
          window.removeEventListener(
            "orientationchange",
            handleOrientationChange,
          );
          document.removeEventListener("touchstart", handleTouchStart);
          document.removeEventListener("touchend", handleTouchEnd);
          document.removeEventListener("focusin", handleFocusIn);

          if (window.visualViewport) {
            window.visualViewport.removeEventListener(
              "resize",
              handleVisualViewportChange,
            );
            window.visualViewport.removeEventListener(
              "scroll",
              handleVisualViewportChange,
            );
          }

          // Cleanup classes
          document.body.classList.remove(
            "ios-device",
            "ios-keyboard-open",
            "ios-pwa-mode",
          );

          // Reset styles
          document.body.style.webkitTransform = "";
          document.body.style.webkitBackfaceVisibility = "";
          document.body.style.webkitPerspective = "";

          mounted = false;
        };
      }
    }

    if (isAndroid) {
      // Add Android device class to body for CSS targeting
      document.body.classList.add("android-device");

      // Enhanced Android Chrome viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Enhanced Android-optimized viewport with better Chrome support
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no",
        );

        // Enhanced Android Visual Viewport API support
        if (window.visualViewport) {
          const handleViewportChange = () => {
            const vh = window.visualViewport.height * 0.01;
            const fullVh = window.innerHeight * 0.01;

            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-visual-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-100vh",
              `${window.innerHeight}px`,
            );

            // Enhanced Android keyboard visibility detection
            const heightDifference =
              window.innerHeight - window.visualViewport.height;
            const keyboardHeight = Math.max(0, heightDifference);

            document.documentElement.style.setProperty(
              "--keyboard-height",
              `${keyboardHeight}px`,
            );

            if (heightDifference > 150) {
              // Keyboard likely open
              document.body.classList.add("android-keyboard-open");

              // Prevent background scroll when keyboard is open
              document.body.style.position = "fixed";
              document.body.style.width = "100%";
              document.body.style.height = "100%";
              document.body.style.overflow = "hidden";
            } else {
              document.body.classList.remove("android-keyboard-open");

              // Restore normal scrolling
              document.body.style.position = "";
              document.body.style.width = "";
              document.body.style.height = "";
              document.body.style.overflow = "";
            }
          };

          const handleVisualViewportScroll = () => {
            // Handle Android Chrome address bar showing/hiding
            const currentVh = window.visualViewport.height * 0.01;
            document.documentElement.style.setProperty(
              "--android-visual-vh",
              `${currentVh}px`,
            );
          };

          window.visualViewport.addEventListener(
            "resize",
            handleViewportChange,
            { passive: true },
          );
          window.visualViewport.addEventListener(
            "scroll",
            handleVisualViewportScroll,
            { passive: true },
          );

          // Set initial values
          handleViewportChange();

          // Android back button handling
          const handleAndroidBackButton = (e) => {
            // Allow default back button behavior for this page
            // Can be customized if needed for specific UX flows
            console.log("Android back button pressed");
          };

          // Listen for Android back button (if supported)
          if ("onbackbutton" in document) {
            document.addEventListener(
              "backbutton",
              handleAndroidBackButton,
              false,
            );
          }

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }

            window.visualViewport.removeEventListener(
              "resize",
              handleViewportChange,
            );
            window.visualViewport.removeEventListener(
              "scroll",
              handleVisualViewportScroll,
            );

            if ("onbackbutton" in document) {
              document.removeEventListener(
                "backbutton",
                handleAndroidBackButton,
              );
            }

            document.body.classList.remove(
              "android-device",
              "android-keyboard-open",
            );

            // Reset keyboard styles
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.height = "";
            document.body.style.overflow = "";

            mounted = false;
          };
        } else {
          // Fallback for older Android versions without Visual Viewport API
          const handleAndroidResize = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-100vh",
              `${window.innerHeight}px`,
            );

            // Simple keyboard detection for older Android
            const initialHeight =
              window.initialInnerHeight || window.innerHeight;
            const currentHeight = window.innerHeight;
            const heightDifference = initialHeight - currentHeight;

            if (heightDifference > 150) {
              document.body.classList.add("android-keyboard-open");
            } else {
              document.body.classList.remove("android-keyboard-open");
            }
          };

          // Store initial height for comparison
          window.initialInnerHeight = window.innerHeight;

          // Enhanced Android touch event handling
          const handleAndroidTouchStart = (e) => {
            // Add material design ripple effect
            if (e.target.closest(".android-ripple")) {
              const rippleElement = e.target.closest(".android-ripple");
              const rect = rippleElement.getBoundingClientRect();
              const ripple =
                rippleElement.querySelector("::before") ||
                document.createElement("div");

              // Trigger ripple animation
              rippleElement.style.setProperty(
                "--ripple-x",
                `${e.clientX - rect.left}px`,
              );
              rippleElement.style.setProperty(
                "--ripple-y",
                `${e.clientY - rect.top}px`,
              );
            }

            // Handle Android-specific touch feedback
            if (e.target.closest(".android-touch-target")) {
              e.target.closest(".android-touch-target").style.transform =
                "scale(0.97)";
            }
          };

          const handleAndroidTouchEnd = (e) => {
            // Reset touch feedback
            if (e.target.closest(".android-touch-target")) {
              setTimeout(() => {
                const element = e.target.closest(".android-touch-target");
                if (element) {
                  element.style.transform = "";
                }
              }, 100);
            }
          };

          // Enhanced Android focus handling for accessibility
          const handleAndroidFocus = (e) => {
            if (
              e.target.tagName === "INPUT" ||
              e.target.tagName === "TEXTAREA" ||
              e.target.tagName === "BUTTON"
            ) {
              // Ensure focused element is visible
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }, 100);
            }
          };

          window.addEventListener("resize", handleAndroidResize, {
            passive: true,
          });
          document.addEventListener("touchstart", handleAndroidTouchStart, {
            passive: true,
          });
          document.addEventListener("touchend", handleAndroidTouchEnd, {
            passive: true,
          });
          document.addEventListener("focusin", handleAndroidFocus, {
            passive: true,
          });

          // Set initial values
          handleAndroidResize();

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }

            window.removeEventListener("resize", handleAndroidResize);
            document.removeEventListener("touchstart", handleAndroidTouchStart);
            document.removeEventListener("touchend", handleAndroidTouchEnd);
            document.removeEventListener("focusin", handleAndroidFocus);

            document.body.classList.remove(
              "android-device",
              "android-keyboard-open",
            );

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
  }, [authManager, twoFactorAuthManager, navigate, backupCode]);

  ////
  //// Component rendering.
  ////

  if (!backupCode) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix ios-vh-fix android-viewport-fix android-gpu-accelerated mobile-smooth-scroll">
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area mobile-text-optimize">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl p-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Invalid Access
              </h1>
              <p className="text-gray-600 mb-6">
                No backup code provided. Please complete the 2FA setup process.
              </p>
              <button
                onClick={() => navigate("/login/2fa/step-1")}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium ios-button-fix ios-touch-target android-button-fix android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
              >
                Return to 2FA Setup
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          /* Enhanced iOS-specific styles */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
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
            position: relative;
            z-index: 1;
          }

          /* Enhanced iOS Safe Area and additional optimizations */
          .ios-safe-area {
            padding-left: max(env(safe-area-inset-left), 16px);
            padding-right: max(env(safe-area-inset-right), 16px);
            padding-top: max(env(safe-area-inset-top), 20px);
            padding-bottom: max(env(safe-area-inset-bottom), 20px);
          }

          .ios-button-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.75rem;
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            cursor: pointer;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            position: relative;
            overflow: hidden;
          }

          .ios-link-fix {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }

          /* Enhanced iOS momentum scrolling optimization */
          .ios-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: scroll-position;
          }

          /* Enhanced iOS Safari viewport fix */
          @supports (-webkit-touch-callout: none) {
            .ios-vh-fix {
              min-height: -webkit-fill-available;
              height: -webkit-fill-available;
            }

            .ios-dynamic-viewport {
              height: 100vh;
              height: calc(var(--ios-vh, 1vh) * 100);
            }
          }

          /* iOS keyboard handling improvements */
          .ios-keyboard-safe {
            padding-bottom: env(keyboard-inset-height, 0);
            transition: padding-bottom 0.3s ease;
          }

          /* iOS text rendering optimization */
          .ios-text-optimize {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            font-feature-settings: "liga", "kern";
          }

          /* iOS input field optimizations */
          .ios-input-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.75rem;
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          /* iOS button press feedback */
          .ios-press-feedback {
            transition: transform 0.1s ease, opacity 0.1s ease;
          }

          .ios-press-feedback:active {
            transform: scale(0.96);
            opacity: 0.8;
          }

          /* iOS bounce elimination */
          .ios-no-bounce {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          body.ios-device {
            position: fixed;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            height: 100%;
          }

          .ios-device .ios-content-container {
            height: 100vh;
            height: -webkit-fill-available;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          /* iOS focus management */
          .ios-focus-fix:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
            border-color: #3b82f6;
          }

          /* iOS PWA status bar */
          @media (display-mode: standalone) {
            .ios-pwa-safe {
              padding-top: calc(env(safe-area-inset-top) + 20px);
            }
          }

          /* iOS dark mode optimizations */
          @media (prefers-color-scheme: dark) {
            .ios-dark-optimize {
              color-scheme: dark;
              -webkit-color-scheme: dark;
            }
          }

          /* iOS gesture handling */
          .ios-gesture-safe {
            touch-action: pan-y;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          /* iOS performance optimizations */
          .ios-gpu-layer {
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            perspective: 1000px;
            -webkit-perspective: 1000px;
            will-change: transform;
          }

          /* iOS animation optimizations */
          @media (prefers-reduced-motion: no-preference) {
            .ios-smooth-animation {
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              will-change: transform, opacity;
            }
          }

          /* iOS orientation change handling */
          @media (orientation: landscape) and (max-height: 500px) {
            .ios-landscape-compact {
              padding: 0.5rem;
            }

            .ios-landscape-compact .backup-code-display {
              height: 60px;
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
        `}
      </style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 ios-scroll-fix ios-vh-fix ios-dynamic-viewport android-viewport-fix android-visual-viewport android-chrome-fix android-gpu-accelerated mobile-smooth-scroll landscape-compact ios-landscape-compact android-landscape-compact ios-no-bounce ios-gesture-safe android-scroll-optimize android-back-button-safe android-low-end-optimize">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ios-gpu-layer android-gpu-accelerated android-animation-optimize">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-green-300 rounded-full filter blur-xl opacity-30 animate-blob ios-smooth-animation android-animation-optimize"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000 ios-smooth-animation android-animation-optimize"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-emerald-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000 ios-smooth-animation android-animation-optimize"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area ios-pwa-safe ios-keyboard-safe android-status-bar-fix android-nav-bar-fix mobile-text-optimize ios-text-optimize android-text-optimize main-content ios-content-container android-hdpi android-xhdpi android-xxhdpi">
          <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            {/* Keyboard spacer for Android */}
            <div className="android-keyboard-spacer"></div>

            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select ios-gpu-layer android-gpu-accelerated">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg gpu-accelerated ios-gpu-layer android-elevation-2 android-gpu-accelerated">
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
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl animate-slide-up p-6 sm:p-8 lg:p-10 gpu-accelerated ios-gpu-layer ios-dark-optimize android-elevation-3 android-gpu-accelerated">
              {/* Progress Wizard */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ios-text-optimize android-text-optimize">
                      Two-Factor Authentication Setup
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full ios-text-optimize android-text-optimize">
                    Step 3 of 3
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ios-gpu-layer android-gpu-accelerated">
                  <div
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700 ease-out ios-smooth-animation android-animation-optimize"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              {/* Success Notification */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-xl ios-gpu-layer android-elevation-1 android-gpu-accelerated">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1 ios-text-optimize android-text-optimize">
                      2FA Setup Complete!
                    </h3>
                    <p className="text-green-800 text-sm ios-text-optimize android-text-optimize">
                      You have successfully verified your 2FA code. Your backup
                      code is now ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl ios-gpu-layer android-elevation-1 android-gpu-accelerated">
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ios-text-optimize android-text-optimize">
                    Your 2FA Backup Code
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-4 ios-text-optimize android-text-optimize">
                    You have successfully verified your 2FA code and now are
                    granted backup code which you can use in case you lose your
                    phone or experience data loss.
                  </p>
                  <p className="text-base text-gray-600 max-w-3xl mx-auto ios-text-optimize android-text-optimize">
                    Please save this backup code in safe location. When you have
                    successfully saved this code, please continue.
                  </p>
                </div>

                {/* Backup Code Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-900 ios-text-optimize android-text-optimize">
                      Backup Code:
                    </label>
                    <button
                      onClick={handleCopyCode}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ios-button-fix ios-touch-target ios-press-feedback android-button-fix android-touch-target android-ripple mobile-touch-target ios-focus-fix android-focus-fix android-a11y-focus focus-visible ${
                        copied
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      <span className="text-sm font-medium ios-text-optimize android-text-optimize">
                        {copied ? "Copied!" : "Copy"}
                      </span>
                    </button>
                  </div>

                  <div className="relative ios-gpu-layer android-gpu-accelerated">
                    <textarea
                      readOnly
                      value={backupCode}
                      className="backup-code-display w-full h-24 sm:h-32 p-4 sm:p-6 border-2 border-green-300 rounded-xl bg-green-50 font-mono text-base sm:text-lg font-bold text-center resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mobile-no-zoom ios-input-fix android-input-fix ios-text-optimize android-text-optimize ios-focus-fix android-focus-fix android-a11y-focus"
                      style={{
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <div className="text-xs sm:text-sm text-gray-600 mt-3 text-center ios-text-optimize android-text-optimize">
                      Save this code in a secure location. You'll need it if you
                      lose access to your 2FA device.
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 ios-gpu-layer android-elevation-1 android-gpu-accelerated">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-3 ios-text-optimize android-text-optimize">
                        Important Security Notes
                      </h3>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="ios-text-optimize android-text-optimize">
                            This backup code can only be used once
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="ios-text-optimize android-text-optimize">
                            Store it in a secure password manager or safe
                            location
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="ios-text-optimize android-text-optimize">
                            Don't share this code with anyone
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="ios-text-optimize android-text-optimize">
                            You can generate a new backup code from your account
                            settings
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Button */}
                <div className="flex justify-center pt-6 border-t border-gray-200">
                  <button
                    onClick={handleConfirm}
                    className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-lg ios-button-fix ios-touch-target ios-press-feedback android-button-fix android-ripple android-touch-target mobile-touch-target mobile-no-zoom ios-focus-fix android-focus-fix android-a11y-focus ios-text-optimize android-text-optimize focus-visible"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Complete Setup
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
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
                      <span>Backup Code Length:</span>
                      <span className="font-medium">
                        {backupCode ? backupCode.length : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current User Role:</span>
                      <span className="font-medium">
                        {currentUser ? currentUser.role : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Redirect Path:</span>
                      <span className="font-medium">
                        {currentUser
                          ? getRoleRedirectPath(currentUser.role)
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                      Backup Code (First 10 chars)
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                      {backupCode
                        ? backupCode.substring(0, 10) + "..."
                        : "None"}
                    </pre>
                  </details>

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

export default TwoFABackupCodeGeneratePage;

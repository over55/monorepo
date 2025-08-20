// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/Step2Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import {
  QrCodeIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

function TwoFAStep2Page() {
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
  const [otpData, setOtpData] = useState(null);
  const [qrCodeBlobUrl, setQrCodeBlobUrl] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const handleCopyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);

      // iOS haptic feedback
      if (isIOS && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      // Android haptic feedback
      if (isAndroid && window.navigator.vibrate) {
        window.navigator.vibrate([25, 50, 25]);
      }

      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleImageLoad = (event) => {
    // Optimize image loading on mobile
    if (isMobile) {
      const img = event.target;
      img.style.willChange = "auto";
    }
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Enhanced mobile device detection
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      const isAndroidDevice = /Android/.test(userAgent);

      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);
      setIsAndroid(isAndroidDevice);

      // Start the page at the top with smooth behavior on mobile
      if (isMobileDevice) {
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        window.scrollTo(0, 0);
      }

      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFAStep2Page: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      // Check if we already have setup data
      const setupState = twoFactorAuthManager.getSetupState();
      if (setupState.qrCodeBlobUrl && setupState.base32Secret) {
        console.log("TwoFAStep2Page: Using existing setup data");
        setOtpData({
          base32: setupState.base32Secret,
          optAuthURL: setupState.optAuthURL,
        });
        setQrCodeBlobUrl(setupState.qrCodeBlobUrl);
      } else {
        // Generate new OTP data
        console.log("TwoFAStep2Page: Generating new OTP data");
        generateOTPData();
      }
    }

    // Enhanced iOS optimizations
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroidDevice = /Android/.test(navigator.userAgent);
    const isMobileDevice = isIOSDevice || isAndroidDevice;

    if (isIOSDevice) {
      // iOS-specific performance optimizations
      document.documentElement.style.setProperty("--ios-device", "1");

      // Enhanced viewport handling for iOS
      const viewportMeta =
        document.querySelector('meta[name="viewport"]') ||
        document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      const originalContent = viewportMeta.getAttribute("content");

      // iOS 15+ safe area and viewport optimizations
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content",
      );

      if (!document.querySelector('meta[name="viewport"]')) {
        document.head.appendChild(viewportMeta);
      }

      // iOS Safari address bar handling
      const handleIOSResize = () => {
        const viewportHeight = window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;
        const windowHeight = window.innerHeight;

        document.documentElement.style.setProperty(
          "--ios-vh",
          `${viewportHeight * 0.01}px`,
        );
        document.documentElement.style.setProperty(
          "--ios-window-height",
          `${windowHeight}px`,
        );
        document.documentElement.style.setProperty(
          "--ios-viewport-height",
          `${viewportHeight}px`,
        );

        // Handle iOS Safari bottom bar
        if (viewportHeight !== windowHeight) {
          document.body.classList.add("ios-safari-ui-visible");
        } else {
          document.body.classList.remove("ios-safari-ui-visible");
        }
      };

      // iOS touch optimization
      const handleIOSTouchStart = (e) => {
        // Prevent iOS scroll bounce on main container
        if (
          e.target === document.body ||
          e.target === document.documentElement
        ) {
          e.preventDefault();
        }

        // Add active state for better touch feedback
        if (e.target.closest('button, a, [role="button"]')) {
          e.target
            .closest('button, a, [role="button"]')
            .classList.add("ios-touch-active");
        }
      };

      const handleIOSTouchEnd = (e) => {
        // Remove active state
        if (e.target.closest('button, a, [role="button"]')) {
          setTimeout(() => {
            e.target
              .closest('button, a, [role="button"]')
              ?.classList.remove("ios-touch-active");
          }, 150);
        }
      };

      // iOS scroll behavior optimization
      const handleIOSScroll = () => {
        // Optimize scroll performance on iOS
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            document.body.style.transform = "translateZ(0)";
          });
        }
      };

      // Event listeners
      window.addEventListener("resize", handleIOSResize, { passive: true });
      window.addEventListener("orientationchange", handleIOSResize, {
        passive: true,
      });
      document.addEventListener("touchstart", handleIOSTouchStart, {
        passive: false,
      });
      document.addEventListener("touchend", handleIOSTouchEnd, {
        passive: true,
      });
      document.addEventListener("scroll", handleIOSScroll, { passive: true });

      // iOS Visual Viewport API support
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleIOSResize, {
          passive: true,
        });
        window.visualViewport.addEventListener("scroll", handleIOSResize, {
          passive: true,
        });
      }

      // Initial setup
      handleIOSResize();

      // iOS PWA detection and optimization
      const isIOSPWA = window.navigator.standalone === true;
      if (isIOSPWA) {
        document.body.classList.add("ios-pwa");
        document.documentElement.style.setProperty("--ios-pwa-offset", "0px");
      }

      return () => {
        if (originalContent && viewportMeta.parentNode) {
          viewportMeta.setAttribute("content", originalContent);
        }
        window.removeEventListener("resize", handleIOSResize);
        window.removeEventListener("orientationchange", handleIOSResize);
        document.removeEventListener("touchstart", handleIOSTouchStart);
        document.removeEventListener("touchend", handleIOSTouchEnd);
        document.removeEventListener("scroll", handleIOSScroll);

        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", handleIOSResize);
          window.visualViewport.removeEventListener("scroll", handleIOSResize);
        }

        document.body.classList.remove("ios-safari-ui-visible", "ios-pwa");
        mounted = false;
      };
    }

    if (isAndroidDevice) {
      // Android-specific performance optimizations
      document.documentElement.style.setProperty("--android-device", "1");

      // Enhanced Android viewport handling
      const viewportMeta =
        document.querySelector('meta[name="viewport"]') ||
        document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      const originalContent = viewportMeta.getAttribute("content");

      // Android Chrome optimizations
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, minimal-ui",
      );

      if (!document.querySelector('meta[name="viewport"]')) {
        document.head.appendChild(viewportMeta);
      }

      // Android keyboard and UI handling
      const handleAndroidViewportChange = () => {
        const viewportHeight = window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;
        const windowHeight = window.innerHeight;

        document.documentElement.style.setProperty(
          "--android-vh",
          `${viewportHeight * 0.01}px`,
        );
        document.documentElement.style.setProperty(
          "--android-window-height",
          `${windowHeight}px`,
        );
        document.documentElement.style.setProperty(
          "--android-viewport-height",
          `${viewportHeight}px`,
        );

        // Enhanced Android keyboard detection
        const heightDifference = windowHeight - viewportHeight;
        const keyboardThreshold = windowHeight * 0.25; // 25% of screen height

        if (heightDifference > keyboardThreshold) {
          document.body.classList.add("android-keyboard-open");
          document.documentElement.style.setProperty(
            "--android-keyboard-height",
            `${heightDifference}px`,
          );
        } else {
          document.body.classList.remove("android-keyboard-open");
          document.documentElement.style.setProperty(
            "--android-keyboard-height",
            "0px",
          );
        }
      };

      // Android touch optimization with material ripple
      const handleAndroidTouchStart = (e) => {
        const target = e.target.closest('button, a, [role="button"]');
        if (target && target.classList.contains("android-ripple")) {
          const rect = target.getBoundingClientRect();
          const ripple = document.createElement("span");
          const size = Math.max(rect.width, rect.height);
          const x = e.touches[0].clientX - rect.left - size / 2;
          const y = e.touches[0].clientY - rect.top - size / 2;

          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: android-ripple-animation 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
          `;

          target.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
      };

      // Android performance optimization
      const handleAndroidScroll = () => {
        // Throttle scroll events on Android
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            // Optimize scroll performance
            document.documentElement.style.setProperty(
              "--scroll-y",
              window.scrollY + "px",
            );
          });
        }
      };

      // Event listeners
      window.addEventListener("resize", handleAndroidViewportChange, {
        passive: true,
      });
      window.addEventListener(
        "orientationchange",
        handleAndroidViewportChange,
        { passive: true },
      );
      document.addEventListener("touchstart", handleAndroidTouchStart, {
        passive: true,
      });
      document.addEventListener("scroll", handleAndroidScroll, {
        passive: true,
      });

      // Android Visual Viewport API support
      if (window.visualViewport) {
        window.visualViewport.addEventListener(
          "resize",
          handleAndroidViewportChange,
          { passive: true },
        );
        window.visualViewport.addEventListener(
          "scroll",
          handleAndroidViewportChange,
          { passive: true },
        );
      } else {
        // Fallback for older Android versions
        const handleAndroidFallbackResize = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty("--android-vh", `${vh}px`);
        };
        window.addEventListener("resize", handleAndroidFallbackResize, {
          passive: true,
        });
      }

      // Initial setup
      handleAndroidViewportChange();

      // Android PWA detection
      const isAndroidPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      if (isAndroidPWA) {
        document.body.classList.add("android-pwa");
      }

      return () => {
        if (originalContent && viewportMeta.parentNode) {
          viewportMeta.setAttribute("content", originalContent);
        }
        window.removeEventListener("resize", handleAndroidViewportChange);
        window.removeEventListener(
          "orientationchange",
          handleAndroidViewportChange,
        );
        document.removeEventListener("touchstart", handleAndroidTouchStart);
        document.removeEventListener("scroll", handleAndroidScroll);

        if (window.visualViewport) {
          window.visualViewport.removeEventListener(
            "resize",
            handleAndroidViewportChange,
          );
          window.visualViewport.removeEventListener(
            "scroll",
            handleAndroidViewportChange,
          );
        }

        document.body.classList.remove("android-keyboard-open", "android-pwa");
        mounted = false;
      };
    }

    // General mobile optimizations
    if (isMobileDevice) {
      // Mobile performance optimizations
      document.body.style.overscrollBehavior = "none";
      document.body.style.touchAction = "pan-x pan-y";

      // Optimize font rendering on mobile
      document.documentElement.style.setProperty(
        "--mobile-font-smooth",
        "antialiased",
      );

      // Mobile-specific CSS custom properties
      document.documentElement.style.setProperty("--mobile-device", "1");
      document.documentElement.style.setProperty(
        "--mobile-vh",
        `${window.innerHeight * 0.01}px`,
      );

      // Touch event optimization
      const handleMobileTouchMove = (e) => {
        // Allow scrolling within designated scroll areas
        if (!e.target.closest(".mobile-smooth-scroll")) {
          e.preventDefault();
        }
      };

      // Network status optimization
      const handleNetworkChange = () => {
        if ("connection" in navigator) {
          const connection = navigator.connection;
          if (
            connection.effectiveType === "slow-2g" ||
            connection.effectiveType === "2g"
          ) {
            document.body.classList.add("slow-network");
          } else {
            document.body.classList.remove("slow-network");
          }
        }
      };

      // Battery optimization
      const handleBatteryChange = (battery) => {
        if (battery.level < 0.2 || battery.chargingTime < 1800) {
          document.body.classList.add("low-battery");
        } else {
          document.body.classList.remove("low-battery");
        }
      };

      // Event listeners
      document.addEventListener("touchmove", handleMobileTouchMove, {
        passive: false,
      });

      if ("connection" in navigator) {
        navigator.connection.addEventListener("change", handleNetworkChange, {
          passive: true,
        });
        handleNetworkChange(); // Initial check
      }

      if ("getBattery" in navigator) {
        navigator.getBattery().then((battery) => {
          battery.addEventListener(
            "levelchange",
            () => handleBatteryChange(battery),
            { passive: true },
          );
          battery.addEventListener(
            "chargingtimechange",
            () => handleBatteryChange(battery),
            { passive: true },
          );
          handleBatteryChange(battery); // Initial check
        });
      }

      // Optimize animations based on device performance
      const isLowEndDevice =
        navigator.hardwareConcurrency <= 2 ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2);
      if (isLowEndDevice) {
        document.body.classList.add("low-end-device");
      }

      return () => {
        document.removeEventListener("touchmove", handleMobileTouchMove);
        if ("connection" in navigator) {
          navigator.connection.removeEventListener(
            "change",
            handleNetworkChange,
          );
        }
        document.body.style.overscrollBehavior = "";
        document.body.style.touchAction = "";
        document.body.classList.remove(
          "slow-network",
          "low-battery",
          "low-end-device",
        );
        mounted = false;
      };
    }

    return () => (mounted = false);
  }, [authManager, twoFactorAuthManager, navigate]);

  /**
   * Generate OTP data and QR code
   */
  const generateOTPData = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Generate OTP secret first
      console.log("TwoFAStep2Page: Generating OTP secret");
      const otpResponse =
        await twoFactorAuthManager.generateOTP(onUnauthorized);
      setOtpData(otpResponse);

      // Generate QR code
      console.log("TwoFAStep2Page: Generating QR code");
      const qrBlobUrl =
        await twoFactorAuthManager.generateOTPAndQRCode(onUnauthorized);
      setQrCodeBlobUrl(qrBlobUrl);

      console.log(
        "TwoFAStep2Page: OTP data and QR code generated successfully",
      );
    } catch (error) {
      console.error("TwoFAStep2Page: Failed to generate OTP data", error);
      setErrors(error);

      // Scroll to top to show errors
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  ////
  //// Component rendering.
  ////

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 ios-scroll-fix ios-vh-fix android-viewport-fix android-gpu-accelerated mobile-smooth-scroll">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area mobile-text-optimize">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg mb-6">
              <img
                src="/img/workery-logo.jpeg"
                alt="Workery"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Generating 2FA Setup...
            </h1>
            <p className="text-gray-600 text-lg">
              Please wait while we prepare your two-factor authentication setup.
            </p>
            <div className="mt-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          :root {
            --ios-device: 0;
            --android-device: 0;
            --mobile-device: 0;
            --ios-vh: 1vh;
            --android-vh: 1vh;
            --mobile-vh: 1vh;
            --ios-window-height: 100vh;
            --android-window-height: 100vh;
            --ios-viewport-height: 100vh;
            --android-viewport-height: 100vh;
            --ios-keyboard-height: 0px;
            --android-keyboard-height: 0px;
            --ios-pwa-offset: 0px;
          }

          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            scroll-behavior: smooth;
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
            cursor: pointer;
          }

          .ios-safe-area {
            padding-left: max(env(safe-area-inset-left), 16px);
            padding-right: max(env(safe-area-inset-right), 16px);
            padding-top: max(env(safe-area-inset-top), 16px);
            padding-bottom: max(env(safe-area-inset-bottom), 16px);
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
            transition: transform 0.1s ease, background-color 0.2s ease;
          }

          .ios-button-fix:active,
          .ios-touch-active {
            transform: scale(0.97);
            transition: transform 0.05s ease;
          }

          .ios-link-fix {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
            cursor: pointer;
          }

          .ios-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            scroll-behavior: smooth;
          }

          /* Enhanced iOS viewport handling */
          @supports (-webkit-touch-callout: none) {
            .ios-vh-fix {
              min-height: -webkit-fill-available;
              min-height: calc(var(--ios-vh, 1vh) * 100);
            }

            html[style*="--ios-device"] body {
              min-height: calc(var(--ios-viewport-height, 100vh));
            }
          }

          /* iOS Safari UI visibility handling */
          body.ios-safari-ui-visible {
            padding-bottom: env(keyboard-inset-height, 0);
          }

          /* iOS PWA optimizations */
          body.ios-pwa {
            margin-top: var(--ios-pwa-offset);
          }

          .ios-pwa .main-content {
            padding-top: calc(env(safe-area-inset-top) + 20px);
          }

          /* Enhanced Android-specific styles */
          body.android-keyboard-open {
            position: relative;
            overflow: hidden;
          }

          .android-keyboard-open .main-content {
            transform: translateY(-10px);
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: calc(var(--android-viewport-height, 100vh) - var(--android-keyboard-height, 0px));
            overflow-y: auto;
          }

          .android-touch-target {
            min-height: 48px;
            min-width: 48px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            cursor: pointer;
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
            -webkit-perspective: 1000px;
            perspective: 1000px;
            will-change: transform;
          }

          .android-button-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            cursor: pointer;
          }

          /* Enhanced Android Material Design ripple effect */
          .android-ripple {
            position: relative;
            overflow: hidden;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          .android-ripple::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1;
          }

          .android-ripple:active::before {
            width: 300px;
            height: 300px;
          }

          @keyframes android-ripple-animation {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(4);
              opacity: 0;
            }
          }

          /* Android PWA optimizations */
          body.android-pwa {
            padding-top: 0;
          }

          .android-pwa .main-content {
            padding-top: 20px;
          }

          /* Cross-platform mobile optimizations */
          .mobile-touch-target {
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            cursor: pointer;
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
            scroll-snap-type: y proximity;
          }

          /* Enhanced mobile performance optimizations */
          .gpu-accelerated {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: transform;
            contain: layout style paint;
          }

          /* Mobile device-specific optimizations */
          html[style*="--mobile-device"] {
            font-synthesis: none;
            text-rendering: optimizeSpeed;
          }

          html[style*="--mobile-device"] * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Low-end device optimizations */
          body.low-end-device .animate-blob,
          body.low-end-device .animate-fade-in,
          body.low-end-device .animate-slide-up {
            animation: none;
          }

          body.low-end-device * {
            transition-duration: 0.1s !important;
            will-change: auto !important;
          }

          /* Network-aware optimizations */
          body.slow-network .animate-blob {
            animation: none;
          }

          body.slow-network img {
            loading: lazy;
          }

          /* Battery-aware optimizations */
          body.low-battery .animate-blob,
          body.low-battery .gpu-accelerated {
            animation: none;
            will-change: auto;
            transform: none;
          }

          /* Enhanced animations with performance consideration */
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
            contain: layout style paint;
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
            contain: layout style paint;
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
            contain: layout style paint;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            contain: layout style paint;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin {
            animation: spin 1s linear infinite;
            contain: layout style paint;
          }

          /* Responsive and orientation optimizations */
          @media (max-height: 500px) and (orientation: landscape) {
            .landscape-compact {
              padding-top: 1rem;
              padding-bottom: 1rem;
            }

            .landscape-compact .animate-blob {
              animation: none;
            }

            .landscape-compact .main-content {
              padding: 1rem;
            }
          }

          /* High DPI displays */
          @media (-webkit-min-device-pixel-ratio: 2) {
            .mobile-text-optimize {
              -webkit-font-smoothing: subpixel-antialiased;
              text-rendering: optimizeLegibility;
            }
          }

          /* Reduced motion preferences */
          @media (prefers-reduced-motion: reduce) {
            .animate-blob,
            .animate-fade-in,
            .animate-slide-up,
            .animate-pulse,
            .animate-spin {
              animation: none !important;
            }

            * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
            }
          }

          /* Dark mode support for system preference */
          @media (prefers-color-scheme: dark) {
            .auto-dark-bg {
              background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
            }
          }

          /* Focus management for accessibility */
          .focus-visible:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* Enhanced mobile text rendering */
          .mobile-text-optimize {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: "liga" 1, "kern" 1;
            font-variant-ligatures: common-ligatures;
          }

          /* Copy functionality enhancements */
          .copy-button-container {
            position: relative;
          }

          .copy-success {
            position: absolute;
            top: -35px;
            right: 0;
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            animation: fade-in 0.3s ease-out;
            white-space: nowrap;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .copy-success::after {
            content: '';
            position: absolute;
            top: 100%;
            right: 12px;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #10b981;
          }

          /* Mobile-specific input optimizations */
          @media (max-width: 768px) {
            input, textarea, select {
              font-size: 16px !important;
              border-radius: 8px;
              transition: all 0.2s ease;
            }

            input:focus, textarea:focus, select:focus {
              transform: scale(1.02);
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .copy-button-container button {
              padding: 12px;
              min-width: 44px;
              min-height: 44px;
            }
          }

          /* Touch feedback improvements */
          @media (hover: none) and (pointer: coarse) {
            .ios-button-fix:active,
            .android-button-fix:active,
            .mobile-touch-target:active {
              background-color: rgba(0, 0, 0, 0.05);
            }

            .bg-blue-600:active {
              background-color: rgb(29 78 216) !important;
            }

            .border-gray-300:active {
              border-color: rgb(156 163 175) !important;
            }
          }

          /* Memory optimization for images */
          img {
            content-visibility: auto;
            contain-intrinsic-size: 250px 250px;
          }

          /* Scroll performance optimization */
          .main-content {
            contain: layout style paint;
            isolation: isolate;
          }

          /* QR Code specific mobile optimizations */
          @media (max-width: 768px) {
            .qr-code-container img {
              width: min(80vw, 300px);
              height: min(80vw, 300px);
              max-width: 300px;
              max-height: 300px;
            }
          }

          /* Enhanced error display for mobile */
          @media (max-width: 640px) {
            .error-container {
              margin: 0 -1rem;
              border-radius: 0;
              border-left: none;
              border-right: none;
            }
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
                    Step 2 of 3
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: "66%" }}
                  ></div>
                </div>
              </div>

              {/* Page Content */}
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Scan QR Code
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                    With your 2FA application open, please scan the following QR
                    code with your device and click next when ready.
                  </p>
                </div>

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-900 mb-2">
                          Error occurred:
                        </h3>
                        <div className="space-y-1">
                          {Object.entries(errors).map(([key, value]) => (
                            <div key={key} className="text-red-800">
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

                {/* QR Code Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-6">
                      <QrCodeIcon className="h-8 w-8 text-blue-600 mr-2" />
                      <h3 className="text-xl font-semibold text-blue-900">
                        QR Code Scanner
                      </h3>
                    </div>

                    {qrCodeBlobUrl ? (
                      <div className="inline-block bg-white p-4 rounded-2xl shadow-lg qr-code-container">
                        <img
                          src={qrCodeBlobUrl}
                          alt="2FA QR Code"
                          className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 mx-auto rounded-lg"
                          loading="eager"
                          decoding="async"
                          onLoad={handleImageLoad}
                          style={{ willChange: "auto" }}
                        />
                        <p className="text-sm text-gray-600 mt-4 font-medium">
                          Scan with your authenticator app
                        </p>
                      </div>
                    ) : (
                      <div className="inline-block bg-white p-4 rounded-2xl shadow-lg">
                        <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 border-2 dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">
                              QR Code Loading...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Manual Entry Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    Manual Entry Method
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Copy and paste the following values into your authenticator
                    app:
                  </p>

                  <div className="space-y-4">
                    {/* Account Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Name:
                      </label>
                      <div className="relative copy-button-container">
                        <textarea
                          readOnly
                          value={`${window.location.hostname}: user@example.com`}
                          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-no-zoom"
                          rows="2"
                        />
                        <button
                          onClick={() =>
                            handleCopyToClipboard(
                              `${window.location.hostname}: user@example.com`,
                              "account",
                            )
                          }
                          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-blue-600 transition-colors ios-button-fix android-button-fix mobile-touch-target focus-visible"
                          title="Copy to clipboard"
                        >
                          {copiedField === "account" ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                        {copiedField === "account" && (
                          <div className="copy-success">Copied!</div>
                        )}
                      </div>
                    </div>

                    {/* Your Key */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Key:
                      </label>
                      <div className="relative copy-button-container">
                        <textarea
                          readOnly
                          value={otpData ? otpData.base32 : "Loading..."}
                          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-no-zoom"
                          rows="3"
                        />
                        <button
                          onClick={() =>
                            handleCopyToClipboard(
                              otpData ? otpData.base32 : "",
                              "key",
                            )
                          }
                          disabled={!otpData}
                          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ios-button-fix android-button-fix mobile-touch-target focus-visible"
                          title="Copy to clipboard"
                        >
                          {copiedField === "key" ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                        {copiedField === "key" && (
                          <div className="copy-success">Copied!</div>
                        )}
                      </div>
                    </div>

                    {/* Type of Key */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type of Key:
                      </label>
                      <div className="relative copy-button-container">
                        <input
                          type="text"
                          readOnly
                          value="Time based"
                          className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-no-zoom"
                        />
                        <button
                          onClick={() =>
                            handleCopyToClipboard("Time based", "type")
                          }
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors ios-button-fix android-button-fix mobile-touch-target focus-visible"
                          title="Copy to clipboard"
                        >
                          {copiedField === "type" ? (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                        {copiedField === "type" && (
                          <div className="copy-success">Copied!</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200">
                  <Link
                    to="/login/2fa/step-1"
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ios-link-fix ios-touch-target android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                    role="button"
                    aria-label="Go back to step 1"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Link>

                  <Link
                    to="/login/2fa/step-3"
                    className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium ios-link-fix ios-touch-target android-ripple android-touch-target mobile-touch-target mobile-no-zoom focus-visible"
                    role="button"
                    aria-label="Continue to step 3"
                  >
                    Next
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
                        2 of 3 (QR Code Generation)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has OTP Data:</span>
                      <span
                        className={`font-medium ${otpData ? "text-green-600" : "text-red-600"}`}
                      >
                        {otpData ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has QR Code:</span>
                      <span
                        className={`font-medium ${qrCodeBlobUrl ? "text-green-600" : "text-red-600"}`}
                      >
                        {qrCodeBlobUrl ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Loading:</span>
                      <span
                        className={`font-medium ${isLoading ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {isLoading ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {otpData && (
                    <details className="mt-3">
                      <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                        OTP Data
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(
                          {
                            base32: otpData.base32?.substring(0, 20) + "...",
                            hasOptAuthURL: !!otpData.optAuthURL,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  )}

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

export default TwoFAStep2Page;

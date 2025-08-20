// File Path: monorepo/web/workery-frontend/src/pages/Anonymous/TwoFA/BackupCodeRecoveryPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../services/Services";
import { getRoleRedirectPath } from "../../../constants/Roles";
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

function TwoFABackupCodeRecoveryPage() {
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
  const [backupCode, setBackupCode] = useState("");

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

    // Validate backup code
    const validationError =
      twoFactorAuthManager.validateRecoveryCode(backupCode);
    if (validationError) {
      setErrors(validationError);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        "TwoFABackupCodeRecoveryPage: Using backup code for recovery",
      );

      // Clean backup code (remove whitespace)
      const cleanedBackupCode = backupCode.replace(/\s/g, "");

      // Use recovery code
      const recoveryResponse = await twoFactorAuthManager.recoveryOTP(
        { backup_code: cleanedBackupCode },
        onUnauthorized,
      );

      console.log(
        "TwoFABackupCodeRecoveryPage: Backup code recovery successful",
        recoveryResponse,
      );

      // Handle successful recovery - redirect based on user role
      if (recoveryResponse.user && recoveryResponse.user.role) {
        const redirectPath = getRoleRedirectPath(recoveryResponse.user.role);
        console.log(
          `TwoFABackupCodeRecoveryPage: Redirecting to ${redirectPath} for role ${recoveryResponse.user.role}`,
        );
        navigate(redirectPath);
      } else {
        // Fallback redirect
        console.log(
          "TwoFABackupCodeRecoveryPage: No user role in response, redirecting to dashboard",
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(
        "TwoFABackupCodeRecoveryPage: Backup code recovery failed",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleBackupCodeChange = (e) => {
    setBackupCode(e.target.value);

    // Clear errors when user starts typing
    if (errors.backupCode || errors.backup_code || errors.recoveryCode) {
      setErrors((prev) => ({
        ...prev,
        backupCode: null,
        backup_code: null,
        recoveryCode: null,
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

      // Check if user is authenticated (they should be to access backup code recovery)
      if (!authManager.isAuthenticated()) {
        console.log(
          "TwoFABackupCodeRecoveryPage: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }
    }

    // Enhanced iOS and Android optimizations with comprehensive device detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isIOSChrome = /CriOS/.test(navigator.userAgent);
    const isIOSFirefox = /FxiOS/.test(navigator.userAgent);
    const isIOSEdge = /EdgiOS/.test(navigator.userAgent);

    // Enhanced Android browser detection
    const isAndroidChrome =
      /Chrome/.test(navigator.userAgent) && /Android/.test(navigator.userAgent);
    const isAndroidFirefox =
      /Firefox/.test(navigator.userAgent) &&
      /Android/.test(navigator.userAgent);
    const isAndroidEdge = /EdgA/.test(navigator.userAgent);
    const isAndroidSamsung = /SamsungBrowser/.test(navigator.userAgent);
    const isAndroidWebView =
      /wv/.test(navigator.userAgent) && /Android/.test(navigator.userAgent);

    // Android device capabilities and specifications detection
    const androidVersion = isAndroid
      ? parseFloat(
          navigator.userAgent.match(/Android (\d+(?:\.\d+)?)/)?.[1] || "0",
        )
      : 0;
    const hasAndroidGestureNavigation = androidVersion >= 10;
    const supportsAndroidWebApk = isAndroidChrome && androidVersion >= 7;
    const hasAndroidDynamicColors = androidVersion >= 12;

    // iOS device capabilities detection
    const hasNotch =
      window.screen.height === 812 ||
      window.screen.height === 844 ||
      window.screen.height === 896 ||
      window.screen.height === 926 ||
      window.screen.height === 932 ||
      window.screen.height === 956;
    const isDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Enhanced device performance detection
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const connectionType = navigator.connection?.effectiveType || "4g";
    const isLowEndDevice = deviceMemory <= 2 || hardwareConcurrency <= 2;

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
      // Add Android device class and device-specific classes
      document.body.classList.add("android-device");
      if (isLowEndDevice) document.body.classList.add("android-low-end");
      if (hasAndroidGestureNavigation)
        document.body.classList.add("android-gesture-nav");
      if (supportsAndroidWebApk)
        document.body.classList.add("android-webapk-support");
      if (hasAndroidDynamicColors)
        document.body.classList.add("android-dynamic-colors");
      if (isAndroidWebView) document.body.classList.add("android-webview");

      // Enhanced Android Chrome viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute("content");

        // Enhanced Android-optimized viewport with comprehensive Chrome support
        let androidViewportContent =
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no";

        // Android-specific viewport optimizations
        if (isAndroidChrome && androidVersion >= 10) {
          androidViewportContent += ", interactive-widget=resizes-content";
        }

        if (hasAndroidGestureNavigation) {
          androidViewportContent += ", viewport-fit=cover";
        }

        viewportMeta.setAttribute("content", androidViewportContent);

        // Enhanced Android Visual Viewport API support with comprehensive keyboard handling
        if (window.visualViewport) {
          const handleAndroidViewportChange = () => {
            const vh = window.visualViewport.height * 0.01;
            const vw = window.visualViewport.width * 0.01;
            const scale = window.visualViewport.scale || 1;
            const fullVh = window.innerHeight * 0.01;

            // Set comprehensive Android viewport variables
            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-vw",
              `${vw}px`,
            );
            document.documentElement.style.setProperty(
              "--android-visual-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-visual-vw",
              `${vw}px`,
            );
            document.documentElement.style.setProperty(
              "--android-100vh",
              `${window.innerHeight}px`,
            );
            document.documentElement.style.setProperty(
              "--android-scale",
              scale.toString(),
            );
            document.documentElement.style.setProperty(
              "--android-full-vh",
              `${fullVh}px`,
            );

            // Enhanced Android keyboard visibility detection with Chrome address bar compensation
            const heightDifference =
              window.innerHeight - window.visualViewport.height;
            const widthDifference =
              window.innerWidth - window.visualViewport.width;
            const keyboardHeight = Math.max(0, heightDifference);
            const isKeyboardVisible = keyboardHeight > 150;

            // Account for Android Chrome address bar (typically 56dp = ~56px)
            const addressBarHeight = isAndroidChrome
              ? Math.min(heightDifference, 60)
              : 0;
            const actualKeyboardHeight = Math.max(
              0,
              keyboardHeight - addressBarHeight,
            );

            document.documentElement.style.setProperty(
              "--keyboard-height",
              `${actualKeyboardHeight}px`,
            );
            document.documentElement.style.setProperty(
              "--android-address-bar-height",
              `${addressBarHeight}px`,
            );
            document.documentElement.style.setProperty(
              "--android-navigation-bar-height",
              "0px",
            );

            // Enhanced Android keyboard state management
            if (isKeyboardVisible) {
              document.body.classList.add("android-keyboard-open");
              document.body.classList.remove("android-keyboard-closed");

              // Enhanced Android keyboard scroll adjustment with improved UX
              const activeElement = document.activeElement;
              if (
                activeElement &&
                (activeElement.tagName === "INPUT" ||
                  activeElement.tagName === "TEXTAREA")
              ) {
                setTimeout(() => {
                  const elementRect = activeElement.getBoundingClientRect();
                  const viewportHeight = window.visualViewport.height;
                  const elementBottom = elementRect.bottom;
                  const elementTop = elementRect.top;

                  // More sophisticated Android keyboard avoidance
                  if (elementBottom > viewportHeight * 0.6) {
                    const scrollOffset = elementBottom - viewportHeight * 0.4;
                    window.scrollBy({
                      top: scrollOffset,
                      behavior: "smooth",
                    });
                  } else if (elementTop < viewportHeight * 0.1) {
                    const scrollOffset = viewportHeight * 0.2 - elementTop;
                    window.scrollBy({
                      top: -scrollOffset,
                      behavior: "smooth",
                    });
                  }
                }, 150);
              }

              // Android-specific keyboard optimization for low-end devices
              if (isLowEndDevice) {
                document.body.style.position = "fixed";
                document.body.style.width = "100%";
                document.body.style.height = "100%";
                document.body.style.overflow = "hidden";
              }
            } else {
              document.body.classList.remove("android-keyboard-open");
              document.body.classList.add("android-keyboard-closed");

              // Restore normal scrolling for low-end devices
              if (isLowEndDevice) {
                document.body.style.position = "";
                document.body.style.width = "";
                document.body.style.height = "";
                document.body.style.overflow = "";
              }
            }

            // Android gesture navigation detection and handling
            if (hasAndroidGestureNavigation) {
              const gestureNavHeight =
                window.innerHeight -
                window.visualViewport.height -
                keyboardHeight;
              if (gestureNavHeight > 0 && gestureNavHeight < 100) {
                document.documentElement.style.setProperty(
                  "--android-gesture-nav-height",
                  `${gestureNavHeight}px`,
                );
                document.body.classList.add("android-gesture-nav-visible");
              } else {
                document.body.classList.remove("android-gesture-nav-visible");
              }
            }

            // Android orientation change detection
            const isLandscape =
              window.visualViewport.width > window.visualViewport.height;
            document.body.classList.toggle("android-landscape", isLandscape);
            document.body.classList.toggle("android-portrait", !isLandscape);
          };

          const handleAndroidVisualViewportScroll = () => {
            // Enhanced Android Chrome address bar scroll handling
            const scrollTop = window.visualViewport.offsetTop || 0;
            const scrollLeft = window.visualViewport.offsetLeft || 0;

            document.documentElement.style.setProperty(
              "--android-viewport-offset-top",
              `${scrollTop}px`,
            );
            document.documentElement.style.setProperty(
              "--android-viewport-offset-left",
              `${scrollLeft}px`,
            );

            // Dynamic Chrome address bar compensation
            if (isAndroidChrome) {
              const currentVh = window.visualViewport.height * 0.01;
              document.documentElement.style.setProperty(
                "--android-dynamic-vh",
                `${currentVh}px`,
              );

              // Address bar visibility detection
              const addressBarVisible =
                window.innerHeight > window.visualViewport.height + 100;
              document.body.classList.toggle(
                "android-address-bar-visible",
                addressBarVisible,
              );
            }
          };

          // Enhanced Android event listeners with better performance
          window.visualViewport.addEventListener(
            "resize",
            handleAndroidViewportChange,
            { passive: true },
          );
          window.visualViewport.addEventListener(
            "scroll",
            handleAndroidVisualViewportScroll,
            { passive: true },
          );

          // Set initial Android viewport values
          handleAndroidViewportChange();
          handleAndroidVisualViewportScroll();

          // Enhanced Android back button handling with proper event management
          const handleAndroidBackButton = (e) => {
            // Custom Android back button behavior for better UX
            const activeModal = document.querySelector(
              ".modal.active, .popup.active, .overlay.active",
            );
            const focusedInput = document.activeElement;

            if (activeModal) {
              // Close modal/popup on back button
              e.preventDefault();
              activeModal.classList.remove("active");
              return false;
            } else if (
              focusedInput &&
              (focusedInput.tagName === "INPUT" ||
                focusedInput.tagName === "TEXTAREA")
            ) {
              // Blur focused input on back button
              e.preventDefault();
              focusedInput.blur();
              return false;
            } else {
              // Allow default back button behavior
              console.log(
                "Android back button pressed - allowing default navigation",
              );
              return true;
            }
          };

          // Enhanced Android back button event handling
          if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.addEventListener("popstate", handleAndroidBackButton, false);
          }

          // Android WebView specific optimizations
          if (isAndroidWebView) {
            // Enhanced WebView performance
            document.body.style.webkitTransform = "translateZ(0)";
            document.body.style.webkitBackfaceVisibility = "hidden";

            // WebView-specific event handling
            const handleWebViewOrientationChange = () => {
              setTimeout(() => {
                handleAndroidViewportChange();
                window.scrollTo(0, 0);
              }, 500);
            };

            window.addEventListener(
              "orientationchange",
              handleWebViewOrientationChange,
              { passive: true },
            );
          }

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
              handleAndroidVisualViewportScroll,
            );
            window.removeEventListener("popstate", handleAndroidBackButton);

            if (isAndroidWebView) {
              window.removeEventListener(
                "orientationchange",
                handleWebViewOrientationChange,
              );
            }

            document.body.classList.remove(
              "android-device",
              "android-keyboard-open",
              "android-keyboard-closed",
              "android-low-end",
              "android-gesture-nav",
              "android-webapk-support",
              "android-dynamic-colors",
              "android-webview",
              "android-landscape",
              "android-portrait",
              "android-address-bar-visible",
              "android-gesture-nav-visible",
            );

            // Reset Android keyboard styles
            if (isLowEndDevice) {
              document.body.style.position = "";
              document.body.style.width = "";
              document.body.style.height = "";
              document.body.style.overflow = "";
            }

            mounted = false;
          };
        } else {
          // Fallback for older Android versions without Visual Viewport API
          const handleAndroidResize = () => {
            const vh = window.innerHeight * 0.01;
            const vw = window.innerWidth * 0.01;

            document.documentElement.style.setProperty(
              "--android-vh",
              `${vh}px`,
            );
            document.documentElement.style.setProperty(
              "--android-vw",
              `${vw}px`,
            );
            document.documentElement.style.setProperty(
              "--android-100vh",
              `${window.innerHeight}px`,
            );

            // Enhanced keyboard detection for older Android versions
            const initialHeight =
              window.initialAndroidHeight || window.innerHeight;
            const currentHeight = window.innerHeight;
            const heightDifference = initialHeight - currentHeight;
            const keyboardThreshold = isLowEndDevice ? 120 : 150;

            if (heightDifference > keyboardThreshold) {
              document.body.classList.add("android-keyboard-open");
              document.body.classList.remove("android-keyboard-closed");
              document.documentElement.style.setProperty(
                "--keyboard-height",
                `${heightDifference}px`,
              );
            } else {
              document.body.classList.remove("android-keyboard-open");
              document.body.classList.add("android-keyboard-closed");
              document.documentElement.style.setProperty(
                "--keyboard-height",
                "0px",
              );
            }
          };

          // Store initial height for comparison
          window.initialAndroidHeight = window.innerHeight;

          // Enhanced Android touch event handling with Material Design ripple effects
          const handleAndroidTouchStart = (e) => {
            const touch = e.touches[0];

            // Enhanced Material Design ripple effect
            if (e.target.closest(".android-ripple")) {
              const rippleElement = e.target.closest(".android-ripple");
              const rect = rippleElement.getBoundingClientRect();
              const rippleX = touch.clientX - rect.left;
              const rippleY = touch.clientY - rect.top;

              // Create dynamic ripple effect
              rippleElement.style.setProperty("--ripple-x", `${rippleX}px`);
              rippleElement.style.setProperty("--ripple-y", `${rippleY}px`);
              rippleElement.classList.add("android-ripple-active");

              // Enhanced haptic feedback for Android
              if (navigator.vibrate) {
                const vibrationPattern = isLowEndDevice ? [1] : [2, 1, 2];
                navigator.vibrate(vibrationPattern);
              }
            }

            // Enhanced Android touch feedback with performance consideration
            if (e.target.closest(".android-touch-target")) {
              const element = e.target.closest(".android-touch-target");
              if (!isLowEndDevice) {
                element.style.transform = "scale(0.97)";
                element.style.transition =
                  "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)";
              }
            }

            // Android touch tracking for analytics and UX improvements
            document.documentElement.style.setProperty(
              "--android-touch-x",
              `${touch.clientX}px`,
            );
            document.documentElement.style.setProperty(
              "--android-touch-y",
              `${touch.clientY}px`,
            );
          };

          const handleAndroidTouchEnd = (e) => {
            // Reset Material Design ripple effect
            if (e.target.closest(".android-ripple")) {
              const rippleElement = e.target.closest(".android-ripple");
              setTimeout(() => {
                rippleElement.classList.remove("android-ripple-active");
              }, 300);
            }

            // Reset Android touch feedback
            if (e.target.closest(".android-touch-target")) {
              const element = e.target.closest(".android-touch-target");
              if (!isLowEndDevice) {
                setTimeout(() => {
                  element.style.transform = "";
                  element.style.transition =
                    "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
                }, 100);
              }
            }
          };

          // Enhanced Android touch move handling with scroll optimization
          const handleAndroidTouchMove = (e) => {
            const touch = e.touches[0];

            // Enhanced Android momentum scrolling
            const scrollContainer = e.target.closest(
              ".android-momentum-scroll, .android-content-container",
            );
            if (scrollContainer) {
              // Allow natural Android momentum scrolling
              return;
            }

            // Prevent overscroll with Android-specific threshold
            const overscrollThreshold = isLowEndDevice ? 5 : 10;
            if (
              (window.scrollY <= overscrollThreshold && e.deltaY < 0) ||
              (window.scrollY >=
                document.body.scrollHeight -
                  window.innerHeight -
                  overscrollThreshold &&
                e.deltaY > 0)
            ) {
              e.preventDefault();
            }
          };

          // Enhanced Android focus handling for accessibility and UX
          const handleAndroidFocus = (e) => {
            if (
              e.target.tagName === "INPUT" ||
              e.target.tagName === "TEXTAREA" ||
              e.target.tagName === "BUTTON"
            ) {
              // Enhanced Android accessibility focus
              e.target.style.outline = "2px solid #1976d2";
              e.target.style.outlineOffset = "2px";

              // Android-specific input focus optimization
              if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA"
              ) {
                setTimeout(() => {
                  const elementRect = e.target.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  const keyboardHeight =
                    parseInt(
                      getComputedStyle(
                        document.documentElement,
                      ).getPropertyValue("--keyboard-height"),
                    ) || 0;
                  const availableHeight = viewportHeight - keyboardHeight;

                  if (elementRect.bottom > availableHeight * 0.7) {
                    e.target.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "nearest",
                    });
                  }
                }, 200);
              }
            }
          };

          const handleAndroidBlur = (e) => {
            if (
              e.target.tagName === "INPUT" ||
              e.target.tagName === "TEXTAREA" ||
              e.target.tagName === "BUTTON"
            ) {
              e.target.style.outline = "";
              e.target.style.outlineOffset = "";
            }
          };

          // Enhanced Android event listeners
          window.addEventListener("resize", handleAndroidResize, {
            passive: true,
          });
          document.addEventListener("touchstart", handleAndroidTouchStart, {
            passive: true,
          });
          document.addEventListener("touchend", handleAndroidTouchEnd, {
            passive: true,
          });
          document.addEventListener("touchmove", handleAndroidTouchMove, {
            passive: false,
          });
          document.addEventListener("focusin", handleAndroidFocus, {
            passive: true,
          });
          document.addEventListener("focusout", handleAndroidBlur, {
            passive: true,
          });

          // Set initial Android values
          handleAndroidResize();

          // Enhanced Android performance optimizations
          const optimizeAndroidPerformance = () => {
            // Android memory management
            if (isLowEndDevice) {
              // Reduce animations and effects for low-end devices
              document.body.classList.add("android-reduced-effects");

              // Disable expensive CSS properties
              const expensiveElements = document.querySelectorAll(
                ".animate-blob, .filter, .backdrop-blur",
              );
              expensiveElements.forEach((el) => {
                el.style.animation = "none";
                el.style.filter = "none";
                el.style.backdropFilter = "none";
              });
            }

            // Android connection-aware optimizations
            if (connectionType === "2g" || connectionType === "slow-2g") {
              document.body.classList.add("android-slow-connection");
            }

            // Android battery optimization
            if ("getBattery" in navigator) {
              navigator.getBattery().then((battery) => {
                if (battery.level < 0.15 || !battery.charging) {
                  document.body.classList.add("android-power-save");
                }

                battery.addEventListener("levelchange", () => {
                  if (battery.level < 0.15) {
                    document.body.classList.add("android-power-save");
                  } else if (battery.level > 0.3) {
                    document.body.classList.remove("android-power-save");
                  }
                });
              });
            }
          };

          // Initialize Android performance optimizations
          optimizeAndroidPerformance();

          return () => {
            if (originalContent) {
              viewportMeta.setAttribute("content", originalContent);
            }

            window.removeEventListener("resize", handleAndroidResize);
            document.removeEventListener("touchstart", handleAndroidTouchStart);
            document.removeEventListener("touchend", handleAndroidTouchEnd);
            document.removeEventListener("touchmove", handleAndroidTouchMove);
            document.removeEventListener("focusin", handleAndroidFocus);
            document.removeEventListener("focusout", handleAndroidBlur);

            document.body.classList.remove(
              "android-device",
              "android-keyboard-open",
              "android-keyboard-closed",
              "android-low-end",
              "android-gesture-nav",
              "android-webapk-support",
              "android-dynamic-colors",
              "android-webview",
              "android-landscape",
              "android-portrait",
              "android-reduced-effects",
              "android-slow-connection",
              "android-power-save",
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
  }, [authManager, navigate]);

  ////
  //// Component rendering.
  ////

  return (
    <div>
      <style>
        {`
          /* Enhanced iOS-specific styles with comprehensive optimizations */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            scroll-snap-type: y proximity;
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
            cursor: pointer;
          }

          /* Enhanced iOS Safe Area with notch support */
          .ios-safe-area {
            padding-left: max(env(safe-area-inset-left), 16px);
            padding-right: max(env(safe-area-inset-right), 16px);
            padding-top: max(env(safe-area-inset-top), 20px);
            padding-bottom: max(env(safe-area-inset-bottom), 20px);
          }

          .ios-has-notch .ios-safe-area {
            padding-top: max(env(safe-area-inset-top), 44px);
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
            -webkit-font-smoothing: antialiased;
            font-feature-settings: "liga", "kern";
          }

          .ios-link-fix {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            text-decoration: none;
          }

          /* Enhanced iOS momentum scrolling with performance optimization */
          .ios-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            will-change: scroll-position;
            scroll-behavior: smooth;
            contain: layout style paint;
          }

          /* Enhanced iOS Safari viewport fix with dynamic height support */
          @supports (-webkit-touch-callout: none) {
            .ios-vh-fix {
              min-height: -webkit-fill-available;
              height: -webkit-fill-available;
            }

            .ios-dynamic-viewport {
              height: 100vh;
              height: calc(var(--ios-vh, 1vh) * 100);
              height: calc(var(--dynamic-vh, var(--ios-vh, 1vh)) * 100);
            }

            .ios-full-viewport {
              height: calc(var(--ios-full-vh, 1vh) * 100);
            }

            .ios-available-viewport {
              height: calc(var(--available-vh, var(--ios-vh, 1vh)) * 100);
            }
          }

          /* Enhanced iOS keyboard handling with visual viewport support */
          .ios-keyboard-safe {
            padding-bottom: env(keyboard-inset-height, 0);
            padding-bottom: var(--keyboard-height, 0);
            transition: padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          body.ios-keyboard-open {
            position: fixed;
            width: 100%;
            height: calc(var(--visual-vh, 1vh) * 100);
            overflow: hidden;
          }

          .ios-keyboard-open .main-content {
            height: calc(var(--visual-vh, 1vh) * 100);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Enhanced iOS text rendering optimization */
          .ios-text-optimize {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            font-feature-settings: "liga", "kern";
            font-variant-ligatures: common-ligatures;
            font-kerning: auto;
          }

          /* Enhanced iOS input field optimizations with zoom prevention */
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
            -webkit-user-select: text;
            -webkit-touch-callout: default;
          }

          .ios-input-fix:focus {
            -webkit-user-select: text;
            -webkit-touch-callout: default;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
            border-color: #3b82f6;
          }

          /* Enhanced iOS button press feedback with haptic simulation */
          .ios-press-feedback {
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform, opacity;
          }

          .ios-press-feedback:active {
            transform: scale(0.96);
            opacity: 0.8;
          }

          .ios-press-feedback:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          /* Enhanced iOS bounce elimination */
          .ios-no-bounce {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
            overflow-anchor: none;
          }

          body.ios-device {
            position: fixed;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            height: 100%;
            overscroll-behavior: none;
          }

          .ios-device .ios-content-container {
            height: 100vh;
            height: -webkit-fill-available;
            height: calc(var(--ios-vh, 1vh) * 100);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            scroll-behavior: smooth;
          }

          /* Enhanced iOS focus management with accessibility */
          .ios-focus-fix:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
            border-color: #3b82f6;
            z-index: 10;
            position: relative;
          }

          .ios-focus-fix:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          /* Enhanced iOS PWA status bar and safe area */
          @media (display-mode: standalone) {
            .ios-pwa-safe {
              padding-top: calc(env(safe-area-inset-top) + 20px);
            }

            body.ios-pwa-mode {
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              overscroll-behavior: none;
            }

            .ios-pwa-mode .ios-content-container {
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
            }
          }

          /* Enhanced iOS dark mode optimizations */
          @media (prefers-color-scheme: dark) {
            .ios-dark-optimize {
              color-scheme: dark;
              -webkit-color-scheme: dark;
            }

            body.ios-dark-mode {
              background-color: #000000;
              color: #ffffff;
            }
          }

          /* Enhanced iOS gesture handling */
          .ios-gesture-safe {
            touch-action: pan-y;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            overscroll-behavior: contain;
          }

          /* Enhanced iOS performance optimizations with GPU acceleration */
          .ios-gpu-layer {
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            perspective: 1000px;
            -webkit-perspective: 1000px;
            will-change: transform;
            contain: layout style paint;
          }

          /* Enhanced iOS animation optimizations */
          @media (prefers-reduced-motion: no-preference) {
            .ios-smooth-animation {
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              will-change: transform, opacity;
            }
          }

          body.ios-reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          /* Enhanced iOS orientation change handling */
          body.ios-landscape {
            --orientation-vh: calc(var(--ios-vh, 1vh) * 100);
          }

          body.ios-portrait {
            --orientation-vh: calc(var(--ios-vh, 1vh) * 100);
          }

          @media (orientation: landscape) and (max-height: 500px) {
            .ios-landscape-compact {
              padding: 0.5rem;
            }

            .ios-landscape-compact .backup-code-display {
              height: 60px;
              font-size: 14px;
            }

            .ios-landscape-compact h1 {
              font-size: 1.5rem;
            }

            .ios-landscape-compact .animate-blob {
              animation: none;
            }
          }

          /* iOS memory and performance optimizations */
          body.ios-low-memory .animate-blob,
          body.ios-power-save .animate-blob {
            animation: none;
          }

          body.ios-low-memory *,
          body.ios-power-save * {
            will-change: auto;
            contain: none;
          }

          body.ios-reload-optimize {
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }

          /* Enhanced Android-specific styles with comprehensive Material Design optimizations */
          .android-touch-target {
            min-height: 48px;
            min-width: 48px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            cursor: pointer;
            position: relative;
            overflow: hidden;
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
            min-height: calc(var(--android-dynamic-vh, var(--android-vh, 1vh)) * 100);
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
            will-change: transform;
            contain: layout style paint;
          }

          .android-button-fix {
            -webkit-appearance: none;
            appearance: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            border-radius: 0.75rem;
            position: relative;
            overflow: hidden;
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
            top: var(--ripple-y, 50%);
            left: var(--ripple-x, 50%);
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                        height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translate(-50%, -50%);
            pointer-events: none;
            opacity: 0;
          }

          .android-ripple.android-ripple-active::before {
            width: 300px;
            height: 300px;
            opacity: 1;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                        height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.3s ease-out;
          }

          /* Enhanced Android keyboard handling with comprehensive support */
          body.android-keyboard-open {
            position: fixed;
            width: 100%;
            height: calc(var(--android-visual-vh, 1vh) * 100);
            overflow: hidden;
          }

          body.android-keyboard-closed {
            position: static;
            width: auto;
            height: auto;
            overflow: visible;
          }

          .android-keyboard-open .main-content {
            height: calc(var(--android-visual-vh, 1vh) * 100);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            transform: translateY(calc(var(--android-viewport-offset-top, 0px) * -1));
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .android-keyboard-spacer {
            height: var(--keyboard-height, 0);
            transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Enhanced Android orientation handling */
          body.android-landscape {
            --android-orientation-vh: calc(var(--android-vh, 1vh) * 100);
          }

          body.android-portrait {
            --android-orientation-vh: calc(var(--android-vh, 1vh) * 100);
          }

          @media (orientation: landscape) and (max-height: 500px) {
            .android-landscape-compact {
              padding: 0.5rem;
            }

            .android-landscape-compact .backup-code-display {
              height: 60px;
              font-size: 14px;
            }

            .android-landscape-compact h1 {
              font-size: 1.5rem;
            }

            .android-landscape-compact .animate-blob {
              animation: none;
            }
          }

          /* Enhanced Android gesture navigation support */
          body.android-gesture-nav-visible {
            padding-bottom: var(--android-gesture-nav-height, 0);
          }

          .android-gesture-nav .android-safe-area {
            padding-bottom: max(var(--android-gesture-nav-height, 0), 16px);
          }

          /* Enhanced Android Chrome address bar handling */
          body.android-address-bar-visible .main-content {
            transform: translateY(calc(var(--android-address-bar-height, 0px) * -1));
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Enhanced Android input field optimizations */
          .android-input-fix {
            -webkit-appearance: none;
            appearance: none;
            border-radius: 0.75rem;
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            touch-action: manipulation;
          }

          .android-input-fix:focus {
            outline: 2px solid #1976d2;
            outline-offset: 2px;
            border-color: #1976d2;
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
          }

          /* Enhanced Android accessibility and focus management */
          .android-focus-fix:focus {
            outline: 2px solid #1976d2;
            outline-offset: 2px;
            z-index: 10;
            position: relative;
          }

          .android-focus-fix:focus-visible {
            outline: 2px solid #1976d2;
            outline-offset: 2px;
          }

          .android-a11y-focus:focus {
            outline: 3px solid #ff9800;
            outline-offset: 2px;
            box-shadow: 0 0 0 5px rgba(255, 152, 0, 0.2);
          }

          /* Enhanced Android text rendering optimization */
          .android-text-optimize {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: "liga", "kern";
            font-variant-ligatures: common-ligatures;
            font-kerning: auto;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          /* Enhanced Android WebView optimizations */
          body.android-webview {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }

          .android-webview .android-content-container {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          /* Enhanced Android performance optimizations for low-end devices */
          body.android-low-end .animate-blob,
          body.android-power-save .animate-blob,
          body.android-reduced-effects .animate-blob {
            animation: none;
            will-change: auto;
          }

          body.android-low-end *,
          body.android-power-save * {
            will-change: auto;
            contain: none;
            -webkit-transform: none;
            transform: none;
          }

          body.android-reduced-effects .filter,
          body.android-reduced-effects .backdrop-blur {
            filter: none !important;
            backdrop-filter: none !important;
          }

          body.android-slow-connection img {
            image-rendering: auto;
            image-rendering: crisp-edges;
          }

          /* Enhanced Android elevation and shadow system (Material Design) */
          .android-elevation-1 {
            box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
                        0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                        0px 1px 3px 0px rgba(0, 0, 0, 0.12);
          }

          .android-elevation-2 {
            box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                        0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                        0px 1px 5px 0px rgba(0, 0, 0, 0.12);
          }

          .android-elevation-3 {
            box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.2),
                        0px 3px 4px 0px rgba(0, 0, 0, 0.14),
                        0px 1px 8px 0px rgba(0, 0, 0, 0.12);
          }

          /* Enhanced Android scroll optimization */
          .android-momentum-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            overscroll-behavior: contain;
            scroll-behavior: smooth;
            will-change: scroll-position;
            contain: layout style paint;
          }

          .android-scroll-optimize {
            scroll-snap-type: y proximity;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }

          /* Enhanced Android animation optimizations */
          @media (prefers-reduced-motion: no-preference) {
            .android-animation-optimize {
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              will-change: transform, opacity;
            }
          }

          body.android-reduced-motion *,
          body.android-low-end * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          /* Enhanced Android back button and navigation */
          .android-back-button-safe {
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }

          /* Enhanced Android status bar and system UI */
          body.android-device {
            padding-top: var(--android-status-bar-height, 0);
          }

          .android-status-bar-fix {
            padding-top: var(--android-status-bar-height, 24px);
          }

          .android-nav-bar-fix {
            padding-bottom: var(--android-navigation-bar-height, 0);
          }

          /* Enhanced Android HDR and high-DPI support */
          @media (min-resolution: 2dppx) {
            .android-hdpi img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }

          @media (min-resolution: 3dppx) {
            .android-xhdpi img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }

          @media (min-resolution: 4dppx) {
            .android-xxhdpi img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }

          /* Enhanced Android dynamic color support (Android 12+) */
          @media (dynamic-range: high) {
            body.android-dynamic-colors {
              color-scheme: light dark;
            }
          }

          /* Enhanced Android dark mode optimizations */
          @media (prefers-color-scheme: dark) {
            body.android-device {
              background-color: #121212;
              color: #ffffff;
            }

            .android-elevation-1 {
              background-color: #1e1e1e;
            }

            .android-elevation-2 {
              background-color: #222222;
            }

            .android-elevation-3 {
              background-color: #252525;
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
              animation: none;
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
            outline: 2px solid #dc2626;
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

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 ios-scroll-fix ios-vh-fix ios-dynamic-viewport android-viewport-fix android-gpu-accelerated mobile-smooth-scroll landscape-compact ios-no-bounce ios-gesture-safe">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ios-gpu-layer android-gpu-accelerated">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-red-300 rounded-full filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-orange-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-yellow-300 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ios-safe-area ios-pwa-safe ios-keyboard-safe mobile-text-optimize ios-text-optimize main-content ios-content-container">
          <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in ios-no-select android-no-select ios-gpu-layer android-gpu-accelerated">
              <Link
                to="/"
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg gpu-accelerated ios-gpu-layer ios-link-fix android-touch-target mobile-touch-target focus-visible"
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
            <div className="backdrop-blur-sm bg-white/95 shadow-2xl rounded-2xl animate-slide-up p-6 sm:p-8 lg:p-10 gpu-accelerated ios-gpu-layer ios-dark-optimize android-gpu-accelerated">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 ios-gpu-layer android-gpu-accelerated">
                  <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ios-text-optimize mobile-text-optimize">
                  Two-Factor Authentication
                </h1>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 ios-text-optimize mobile-text-optimize">
                  Backup Code Recovery
                </h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto ios-text-optimize mobile-text-optimize">
                  Copy and paste your <strong>2FA backup code</strong> into the
                  following field and submit to disable 2FA and log into your
                  dashboard.
                </p>
              </div>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl ios-gpu-layer android-gpu-accelerated">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2 ios-text-optimize mobile-text-optimize">
                        Error occurred:
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(errors).map(([key, value]) => (
                          <div
                            key={key}
                            className="text-sm text-red-800 ios-text-optimize mobile-text-optimize"
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <label
                    htmlFor="backupCode"
                    className="block text-lg font-semibold text-gray-900 ios-text-optimize mobile-text-optimize"
                  >
                    <KeyIcon className="h-5 w-5 inline-block mr-2" />
                    Enter your 2FA Backup Code:
                  </label>
                  <div className="relative ios-gpu-layer android-gpu-accelerated">
                    <input
                      id="backupCode"
                      type="text"
                      placeholder="Please enter here..."
                      value={backupCode}
                      onChange={handleBackupCodeChange}
                      disabled={isLoading}
                      className={`w-full p-4 sm:p-6 border-2 rounded-xl font-mono text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 mobile-no-zoom ios-input-fix ios-focus-fix android-button-fix ios-text-optimize mobile-text-optimize ${
                        errors.backupCode ||
                        errors.backup_code ||
                        errors.recoveryCode
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    {(errors.backupCode ||
                      errors.backup_code ||
                      errors.recoveryCode) && (
                      <div className="text-red-600 text-sm mt-2 ios-text-optimize mobile-text-optimize">
                        {errors.backupCode ||
                          errors.backup_code ||
                          errors.recoveryCode}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                  <Link
                    to="/login/2fa"
                    className="flex items-center justify-center px-6 py-3 bg-transparent border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium ios-button-fix ios-touch-target ios-press-feedback ios-link-fix android-button-fix android-touch-target android-ripple mobile-touch-target mobile-no-zoom ios-text-optimize mobile-text-optimize focus-visible"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to 2FA
                  </Link>

                  <button
                    type="submit"
                    disabled={isLoading || !backupCode.trim()}
                    className={`flex items-center justify-center px-8 py-3 rounded-xl font-medium transition-all duration-200 ios-button-fix ios-touch-target ios-press-feedback android-button-fix android-ripple android-touch-target mobile-touch-target mobile-no-zoom ios-text-optimize mobile-text-optimize focus-visible ${
                      isLoading || !backupCode.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:scale-105"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 ios-gpu-layer android-gpu-accelerated">
                <h3 className="font-semibold text-gray-900 mb-3 ios-text-optimize mobile-text-optimize">
                  Need Help?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="ios-text-optimize mobile-text-optimize">
                      Backup codes are typically 8-16 characters long
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="ios-text-optimize mobile-text-optimize">
                      They may contain letters, numbers, or dashes
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="ios-text-optimize mobile-text-optimize">
                      Each backup code can only be used once
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="ios-text-optimize mobile-text-optimize">
                      If you don't have your backup code, contact your
                      administrator
                    </span>
                  </li>
                </ul>
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
                      <span className="font-medium">{backupCode.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Loading:</span>
                      <span className="font-medium">
                        {isLoading ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Has Errors:</span>
                      <span className="font-medium">
                        {Object.keys(errors).length > 0 ? "Yes" : "No"}
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
              <p className="text-sm text-gray-500 ios-text-optimize mobile-text-optimize">
                © 2024 Workery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFABackupCodeRecoveryPage;

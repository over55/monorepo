// File: src/components/UIX/hooks/useMobileOptimizations.jsx
// Hook for mobile device optimizations (iOS/Android)
// Extracts common mobile viewport, keyboard, and touch handling logic

import { useEffect } from "react";

/**
 * useMobileOptimizations Hook
 *
 * Provides comprehensive mobile optimizations for iOS and Android devices.
 * Handles viewport management, keyboard detection, touch events, and device-specific fixes.
 *
 * This hook extracts 500+ lines of duplicated mobile optimization code from TwoFA pages
 * into a single reusable hook.
 *
 * Features:
 * - iOS Safari viewport and keyboard handling
 * - Android viewport and keyboard detection
 * - Touch event optimizations
 * - Safe area insets support
 * - Orientation change handling
 * - Scroll behavior optimizations
 *
 * @returns {Object} Device detection and optimization state
 * @returns {boolean} returns.isIOS - True if running on iOS device
 * @returns {boolean} returns.isAndroid - True if running on Android device
 * @returns {boolean} returns.isMobile - True if running on any mobile device
 * @returns {boolean} returns.isSafari - True if running on Safari browser
 *
 * @example
 * function MyComponent() {
 *   const { isIOS, isAndroid, isMobile } = useMobileOptimizations();
 *
 *   return (
 *     <div className={isMobile ? 'mobile-optimized' : 'desktop'}>
 *       {isIOS && <p>iOS specific content</p>}
 *     </div>
 *   );
 * }
 */
function useMobileOptimizations() {
  useEffect(() => {
    let mounted = true;

    // Device detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    // Collect cleanup functions to run on unmount
    const cleanupFunctions = [];

    /**
     * General mobile optimizations (both iOS and Android)
     * Must run BEFORE platform-specific code to ensure it executes
     */
    if (isIOS || isAndroid) {
      // Prevent overscroll bounce
      document.body.style.overscrollBehavior = "none";

      // Touch event optimization for better mobile experience
      const handleTouchMove = (e) => {
        // Allow scrolling within scrollable containers
        if (!e.target.closest(".mobile-smooth-scroll")) {
          // Don't prevent default for now to allow normal scrolling
        }
      };

      const options = { passive: true };
      document.addEventListener("touchmove", handleTouchMove, options);

      // Add cleanup for general mobile optimizations
      cleanupFunctions.push(() => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.body.style.overscrollBehavior = "";
      });
    }

    /**
     * iOS-specific optimizations
     */
    if (isIOS) {
      // Enhanced iOS viewport and touch optimizations
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      let originalContent = null;

      if (viewportMeta) {
        originalContent = viewportMeta.getAttribute("content");

        // Enhanced iOS-optimized viewport for better form handling
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content"
        );
      }

      // iOS Safari viewport height fix with keyboard detection
      const handleIOSResize = () => {
        if (!mounted) return;

        const actualVH = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--ios-vh", `${actualVH}px`);
        document.documentElement.style.setProperty(
          "--ios-actual-vh",
          `${window.innerHeight}px`
        );

        // Detect iOS virtual keyboard
        const heightChange = window.screen.height - window.innerHeight;
        if (heightChange > 150) {
          document.body.classList.add("ios-keyboard-open");
        } else {
          document.body.classList.remove("ios-keyboard-open");
        }
      };

      // iOS touch event optimizations for form inputs
      const handleIOSTouchStart = (e) => {
        // Prevent iOS scroll bounce but allow input focus
        if (
          e.target.tagName !== "INPUT" &&
          e.target.tagName !== "BUTTON" &&
          e.target.tagName !== "A" &&
          e.target.tagName !== "TEXTAREA"
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
        if (!mounted) return;

        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          // Prevent zoom on input focus
          e.target.style.fontSize = "16px";

          // Scroll input into view with extra spacing for iOS keyboard
          setTimeout(() => {
            if (mounted) {
              e.target.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            }
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

      // Add iOS-specific event listeners
      window.addEventListener("resize", handleIOSResize);
      window.addEventListener("orientationchange", handleIOSResize);
      document.addEventListener("touchstart", handleIOSTouchStart, {
        passive: false,
      });
      document.addEventListener("focusin", handleIOSInputFocus, {
        passive: true,
      });
      document.addEventListener("scroll", handleIOSScroll, { passive: true });

      // Initial setup
      handleIOSResize();

      // Add cleanup for iOS-specific optimizations
      cleanupFunctions.push(() => {
        window.removeEventListener("resize", handleIOSResize);
        window.removeEventListener("orientationchange", handleIOSResize);
        document.removeEventListener("touchstart", handleIOSTouchStart);
        document.removeEventListener("focusin", handleIOSInputFocus);
        document.removeEventListener("scroll", handleIOSScroll);

        // Restore original viewport
        if (viewportMeta && originalContent) {
          viewportMeta.setAttribute("content", originalContent);
        }

        // Clean up classes
        document.body.classList.remove("ios-keyboard-open");
      });
    }

    /**
     * Android-specific optimizations
     */
    if (isAndroid && window.visualViewport) {
      // Android viewport and keyboard handling
      const handleAndroidViewportChange = () => {
        if (!mounted) return;

        const visualViewport = window.visualViewport;

        // Set custom viewport height property
        document.documentElement.style.setProperty(
          "--android-vh",
          `${visualViewport.height * 0.01}px`
        );

        // Detect Android virtual keyboard
        const heightDifference = window.innerHeight - visualViewport.height;
        if (heightDifference > 150) {
          document.body.classList.add("android-keyboard-open");
        } else {
          document.body.classList.remove("android-keyboard-open");
        }
      };

      // Add Android-specific event listeners
      window.visualViewport.addEventListener(
        "resize",
        handleAndroidViewportChange
      );
      window.visualViewport.addEventListener(
        "scroll",
        handleAndroidViewportChange
      );

      // Initial setup
      handleAndroidViewportChange();

      // Add cleanup for Android-specific optimizations
      cleanupFunctions.push(() => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener(
            "resize",
            handleAndroidViewportChange
          );
          window.visualViewport.removeEventListener(
            "scroll",
            handleAndroidViewportChange
          );
        }

        // Clean up classes
        document.body.classList.remove("android-keyboard-open");
      });
    }

    // Single cleanup function that runs all collected cleanups
    return () => {
      mounted = false;
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []); // Run once on mount

  // Return device detection state for conditional rendering
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return {
    isIOS,
    isAndroid,
    isMobile,
    isSafari,
  };
}

export default useMobileOptimizations;

// File Path: web/workery-frontend/src/components/Layout/Layout.jsx
// Enhanced Responsive Layout Component with Tailwind v4

import React, { useState, useEffect } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);
  const [androidKeyboardVisible, setAndroidKeyboardVisible] = useState(false);

  // iOS detection function
  const detectIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // Android detection function
  const detectAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  // Enhanced device detection with iOS and Android support
  const updateDeviceType = () => {
    const width = window.innerWidth;
    const mobile = width < 768;
    const tablet = width >= 768 && width < 1024;
    const ios = detectIOS();
    const android = detectAndroid();

    setIsMobile(mobile);
    setIsTablet(tablet);
    setIsIOS(ios);
    setIsAndroid(android);

    return { mobile, tablet, ios, android };
  };

  // Check localStorage for sidebar collapsed state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    const { mobile } = updateDeviceType();

    if (savedState === "true" && !mobile) {
      setSidebarCollapsed(true);
    }
  }, []);

  // iOS-specific optimizations
  useEffect(() => {
    if (!isIOS) return;

    // Fix iOS viewport height issues
    const setIOSViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // iOS keyboard handling
    const handleIOSKeyboard = () => {
      const initialViewport =
        window.visualViewport?.height || window.innerHeight;

      const onViewportChange = () => {
        if (window.visualViewport) {
          const currentHeight = window.visualViewport.height;
          const keyboardHeight = initialViewport - currentHeight;
          setIosKeyboardHeight(keyboardHeight > 150 ? keyboardHeight : 0);
        }
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", onViewportChange);
        return () =>
          window.visualViewport.removeEventListener("resize", onViewportChange);
      }
    };

    // Prevent iOS bounce/overscroll
    const preventBounce = (e) => {
      if (e.target.closest(".sidebar-content, .main-content")) return;
      e.preventDefault();
    };

    // Apply iOS fixes
    setIOSViewportHeight();
    const keyboardCleanup = handleIOSKeyboard();

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const preventZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add event listeners
    window.addEventListener("resize", setIOSViewportHeight);
    document.addEventListener("touchend", preventZoom, { passive: false });
    document.addEventListener("touchmove", preventBounce, { passive: false });

    return () => {
      window.removeEventListener("resize", setIOSViewportHeight);
      document.removeEventListener("touchend", preventZoom);
      document.removeEventListener("touchmove", preventBounce);
      keyboardCleanup?.();
    };
  }, [isIOS]);

  // Android-specific optimizations
  useEffect(() => {
    if (!isAndroid) return;

    // Android viewport height fixes for Chrome Mobile
    const setAndroidViewportHeight = () => {
      // Chrome on Android has dynamic toolbar behavior
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--android-vh", `${vh}px`);
    };

    // Android keyboard detection (different approach than iOS)
    const handleAndroidKeyboard = () => {
      const initialHeight = window.innerHeight;
      let resizeTimer;

      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const currentHeight = window.innerHeight;
          const heightDifference = initialHeight - currentHeight;

          // Android keyboard typically reduces viewport by 150px+
          const keyboardVisible = heightDifference > 150;
          setAndroidKeyboardVisible(keyboardVisible);

          // Update viewport height
          setAndroidViewportHeight();
        }, 100); // Debounce for performance
      };

      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
      };
    };

    // Android Chrome scroll behavior optimization
    const optimizeAndroidScroll = () => {
      // Prevent overscroll in Android Chrome
      const preventOverscroll = (e) => {
        const target = e.target;
        const scrollableParent = target.closest(
          ".scrollable, .main-content, .sidebar-content",
        );

        if (!scrollableParent) {
          e.preventDefault();
          return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      };

      // Android-specific touch optimizations
      const optimizeTouch = () => {
        // Improve scrolling performance on Android
        document.body.style.touchAction = "pan-y";
        document.body.style.overscrollBehavior = "none";
      };

      optimizeTouch();
      document.addEventListener("wheel", preventOverscroll, { passive: false });

      return () => {
        document.removeEventListener("wheel", preventOverscroll);
      };
    };

    // Apply Android fixes
    setAndroidViewportHeight();
    const keyboardCleanup = handleAndroidKeyboard();
    const scrollCleanup = optimizeAndroidScroll();

    return () => {
      keyboardCleanup?.();
      scrollCleanup?.();
    };
  }, [isAndroid]);

  // Listen for storage changes to sync collapsed state
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebarCollapsed");
      setSidebarCollapsed(savedState === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener("sidebarCollapsedChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sidebarCollapsedChanged",
        handleStorageChange,
      );
    };
  }, []);

  // Enhanced resize handler with iOS and Android detection
  useEffect(() => {
    const handleResize = () => {
      const { mobile, ios, android } = updateDeviceType();

      // Close sidebar when switching to mobile
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }

      // Reset collapsed state on mobile
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Calculate sidebar margins based on device type and state
  const getSidebarMargin = () => {
    if (isMobile) return "";

    if (isTablet) {
      // Tablet: smaller sidebar widths
      return sidebarCollapsed ? "ml-12" : "ml-48";
    }

    // Desktop: full sidebar widths
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  // Calculate responsive padding based on device
  const getContentPadding = () => {
    if (isMobile) {
      return "px-3 sm:px-4 py-4";
    }
    if (isTablet) {
      return "px-4 md:px-6 py-5";
    }
    // Desktop and larger screens
    return "px-4 sm:px-6 lg:px-8 py-6";
  };

  return (
    <div
      className={`
        min-h-screen bg-gray-50
        ${isIOS ? "ios-layout" : ""}
        ${isAndroid ? "android-layout" : ""}
      `}
      style={{
        ...(isIOS && {
          height: "100vh",
          height: "calc(var(--vh, 1vh) * 100)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          WebkitOverflowScrolling: "touch",
          touchAction: "manipulation",
        }),
        ...(isAndroid && {
          height: "100vh",
          height: "calc(var(--android-vh, 1vh) * 100)",
          touchAction: "pan-y",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }),
      }}
    >
      {/* Top Navigation Bar - iOS and Android Safe Area Aware */}
      <TopNavbar
        onMenuToggle={handleMenuToggle}
        isMobile={isMobile}
        isTablet={isTablet}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />

      {/* Sidebar - iOS and Android optimized */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isMobile={isMobile}
        isTablet={isTablet}
        sidebarCollapsed={sidebarCollapsed}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />

      {/* Main Content Area - iOS keyboard aware and Android optimized */}
      <main
        className={`
          pt-[60px] transition-all duration-300 ease-in-out
          main-content scrollable
          ${isIOS ? "ios-main-content" : ""}
          ${isAndroid ? "android-main-content" : ""}
        `}
        style={{
          ...(isIOS && {
            minHeight:
              iosKeyboardHeight > 0
                ? `calc(var(--vh, 1vh) * 100 - 60px - ${iosKeyboardHeight}px)`
                : "calc(var(--vh, 1vh) * 100 - 60px)",
            WebkitOverflowScrolling: "touch",
            overflowY: "auto",
          }),
          ...(isAndroid && {
            minHeight: androidKeyboardVisible
              ? "calc(var(--android-vh, 1vh) * 50)"
              : "calc(var(--android-vh, 1vh) * 100 - 60px)",
            WebkitOverflowScrolling: "touch",
            overflowY: "auto",
            touchAction: "pan-y",
            overscrollBehavior: "contain",
          }),
          ...(!isIOS &&
            !isAndroid && {
              minHeight: "calc(100vh - 60px)",
            }),
        }}
      >
        {/* Responsive margin based on device and sidebar state */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${getSidebarMargin()}
          `}
        >
          {/* Content Container with iOS and Android optimizations */}
          <div
            className={`
            ${getContentPadding()}
            max-w-full
            ${isIOS ? "ios-content-container" : ""}
            ${isAndroid ? "android-content-container" : ""}
            ${isMobile ? "min-h-[calc(100vh-120px)]" : "min-h-[calc(100vh-80px)]"}
          `}
            style={{
              ...(isIOS &&
                isMobile && {
                  minHeight:
                    iosKeyboardHeight > 0
                      ? `calc(var(--vh, 1vh) * 100 - 180px - ${iosKeyboardHeight}px)`
                      : "calc(var(--vh, 1vh) * 100 - 120px)",
                  touchAction: "pan-y",
                }),
              ...(isAndroid &&
                isMobile && {
                  minHeight: androidKeyboardVisible
                    ? "calc(var(--android-vh, 1vh) * 40)"
                    : "calc(var(--android-vh, 1vh) * 100 - 120px)",
                  touchAction: "pan-y",
                  overscrollBehavior: "contain",
                }),
            }}
          >
            {/* Responsive container for content */}
            <div
              className={`
              w-full
              ${!isMobile ? "max-w-[1400px] mx-auto" : ""}
              ${isTablet ? "max-w-[900px] mx-auto" : ""}
            `}
            >
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleSidebarClose}
          aria-label="Close sidebar"
        />
      )}

      {/* iOS and Android specific styles */}
      {(isIOS || isAndroid) && (
        <style jsx>{`
          /* iOS Optimizations */
          .ios-layout {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }

          .ios-main-content {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
          }

          .ios-content-container * {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          @supports (-webkit-backdrop-filter: blur(10px)) {
            .ios-layout .bg-white {
              background-color: rgba(255, 255, 255, 0.8);
              -webkit-backdrop-filter: blur(10px);
              backdrop-filter: blur(10px);
            }
          }

          /* Android Optimizations */
          .android-layout {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .android-main-content {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            scroll-behavior: smooth;
            will-change: scroll-position;
          }

          .android-content-container {
            contain: layout style paint;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }

          /* Android Chrome specific fixes */
          @media screen and (-webkit-device-pixel-ratio: 1) {
            .android-layout {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
          }

          /* Android keyboard adjustments */
          .android-layout.keyboard-visible {
            height: auto !important;
            min-height: auto !important;
          }

          /* Improve Android scroll performance */
          .android-layout .scrollable {
            -webkit-overflow-scrolling: touch;
            transform: translateZ(0);
            will-change: scroll-position;
          }

          /* Android-specific button optimizations */
          .android-layout button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            touch-action: manipulation;
          }

          /* Android Chrome address bar handling */
          @media screen and (max-width: 768px) {
            .android-layout {
              height: 100vh;
              height: calc(var(--android-vh, 1vh) * 100);
            }
          }
        `}</style>
      )}
    </div>
  );
}

export default Layout;

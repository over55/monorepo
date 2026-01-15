// File Path: web/workery-frontend/src/components/Layout/Layout.jsx
// Enhanced Responsive Layout Component with UIX Theme Support

import React, { useState, useEffect, useCallback } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import { useInactivityTimeout } from "../../hooks/useInactivityTimeout";
import { useAccountManager } from "../../services/Services";
import { useUIXTheme } from "../UIX/themes/useUIXTheme";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);
  const [androidKeyboardVisible, setAndroidKeyboardVisible] = useState(false);

  const accountManager = useAccountManager();
  const { switchTheme, getThemeClasses } = useUIXTheme();

  // Initialize inactivity timeout - auto-logout after 15 minutes of inactivity
  useInactivityTimeout(15 * 60 * 1000, true);

  // Load user's theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const userProfile = await accountManager.getAccountDetail();
        if (userProfile?.themePreference) {
          if (import.meta.env.DEV) {
            console.log("Layout: Applying user's saved theme preference:", userProfile.themePreference);
          }
          switchTheme(userProfile.themePreference);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Layout: Failed to load theme preference:", error);
        }
      }
    };

    loadThemePreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Enhanced device detection with iOS and Android support (memoized)
  const updateDeviceType = useCallback(() => {
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
  }, []);

  // Check localStorage for sidebar collapsed state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    const { mobile } = updateDeviceType();

    if (savedState === "true" && !mobile) {
      setSidebarCollapsed(true);
    }
  }, [updateDeviceType]);

  // iOS-specific optimizations
  useEffect(() => {
    if (!isIOS) return;

    const setIOSViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    const handleIOSKeyboard = () => {
      const initialViewport = window.visualViewport?.height || window.innerHeight;

      const onViewportChange = () => {
        if (window.visualViewport) {
          const currentHeight = window.visualViewport.height;
          const keyboardHeight = initialViewport - currentHeight;
          setIosKeyboardHeight(keyboardHeight > 150 ? keyboardHeight : 0);
        }
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", onViewportChange);
        return () => window.visualViewport.removeEventListener("resize", onViewportChange);
      }
    };

    const preventBounce = (e) => {
      if (e.target.closest(".sidebar-content, .main-content")) return;
      e.preventDefault();
    };

    setIOSViewportHeight();
    const keyboardCleanup = handleIOSKeyboard();

    let lastTouchEnd = 0;
    const preventZoom = (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

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

    const setAndroidViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--android-vh", `${vh}px`);
    };

    const handleAndroidKeyboard = () => {
      const initialHeight = window.innerHeight;
      let resizeTimer;

      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const currentHeight = window.innerHeight;
          const heightDifference = initialHeight - currentHeight;
          const keyboardVisible = heightDifference > 150;
          setAndroidKeyboardVisible(keyboardVisible);
          setAndroidViewportHeight();
        }, 100);
      };

      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
      };
    };

    const optimizeAndroidScroll = () => {
      const preventOverscroll = (e) => {
        const target = e.target;
        const scrollableParent = target.closest(".scrollable, .main-content, .sidebar-content");

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

      const optimizeTouch = () => {
        document.body.style.touchAction = "pan-y";
        document.body.style.overscrollBehavior = "none";
      };

      optimizeTouch();
      document.addEventListener("wheel", preventOverscroll, { passive: false });

      return () => {
        document.removeEventListener("wheel", preventOverscroll);
      };
    };

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
    window.addEventListener("sidebarCollapsedChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sidebarCollapsedChanged", handleStorageChange);
    };
  }, []);

  // Resize handler with proper dependencies
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const wasMobile = isMobile;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsIOS(detectIOS());
      setIsAndroid(detectAndroid());

      setIsSidebarOpen(currentIsOpen => {
        if (!wasMobile && mobile && currentIsOpen) {
          return false;
        }
        return currentIsOpen;
      });

      if (!wasMobile && mobile) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen(current => !current);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleProfileDropdownOpen = useCallback(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  const handleCollapseToggle = useCallback(() => {
    setSidebarCollapsed(current => {
      const newCollapsedState = !current;
      localStorage.setItem("sidebarCollapsed", newCollapsedState.toString());
      window.dispatchEvent(new Event("sidebarCollapsedChanged"));
      return newCollapsedState;
    });
  }, []);

  const getSidebarMargin = () => {
    if (isMobile) return "";
    if (isTablet) {
      return sidebarCollapsed ? "ml-12" : "ml-48";
    }
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  const getContentPadding = () => {
    if (isMobile) {
      return "px-3 sm:px-4 py-4";
    }
    if (isTablet) {
      return "px-4 md:px-6 py-5";
    }
    return "px-4 sm:px-6 lg:px-8 py-6";
  };

  return (
    <div
      className={`
        min-h-screen ${getThemeClasses('bg-page')}
        ${isIOS ? "ios-layout" : ""}
        ${isAndroid ? "android-layout" : ""}
      `}
      style={{
        ...(isIOS && {
          height: "calc(var(--vh, 1vh) * 100)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          WebkitOverflowScrolling: "touch",
          touchAction: "manipulation",
        }),
        ...(isAndroid && {
          height: "calc(var(--android-vh, 1vh) * 100)",
          touchAction: "pan-y",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }),
      }}
    >
      <TopNavbar
        onMenuToggle={handleMenuToggle}
        isMobile={isMobile}
        isTablet={isTablet}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isSidebarOpen={isSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onCollapseToggle={handleCollapseToggle}
        onProfileDropdownOpen={handleProfileDropdownOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isMobile={isMobile}
        isTablet={isTablet}
        sidebarCollapsed={sidebarCollapsed}
        onCollapseToggle={handleCollapseToggle}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />

      <main
        className={`
          pt-[60px] transition-all duration-300 ease-in-out
          main-content scrollable
          ${isIOS ? "ios-main-content" : ""}
          ${isAndroid ? "android-main-content" : ""}
        `}
        style={{
          ...(isIOS && {
            minHeight: iosKeyboardHeight > 0
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
          ...(!isIOS && !isAndroid && {
            minHeight: "calc(100vh - 60px)",
          }),
        }}
      >
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${getSidebarMargin()}
          `}
        >
          <div
            className={`
            ${getContentPadding()}
            max-w-full
            ${isIOS ? "ios-content-container" : ""}
            ${isAndroid ? "android-content-container" : ""}
            ${isMobile ? "min-h-[calc(100vh-120px)]" : "min-h-[calc(100vh-80px)]"}
          `}
            style={{
              ...(isIOS && isMobile && {
                minHeight: iosKeyboardHeight > 0
                  ? `calc(var(--vh, 1vh) * 100 - 180px - ${iosKeyboardHeight}px)`
                  : "calc(var(--vh, 1vh) * 100 - 120px)",
                touchAction: "pan-y",
              }),
              ...(isAndroid && isMobile && {
                minHeight: androidKeyboardVisible
                  ? "calc(var(--android-vh, 1vh) * 40)"
                  : "calc(var(--android-vh, 1vh) * 100 - 120px)",
                touchAction: "pan-y",
                overscrollBehavior: "contain",
              }),
            }}
          >
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

      {(isIOS || isAndroid) && (
        <style>{`
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

          @media screen and (-webkit-device-pixel-ratio: 1) {
            .android-layout {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
          }

          .android-layout.keyboard-visible {
            height: auto !important;
            min-height: auto !important;
          }

          .android-layout .scrollable {
            -webkit-overflow-scrolling: touch;
            transform: translateZ(0);
            will-change: scroll-position;
          }

          .android-layout button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
            touch-action: manipulation;
          }

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

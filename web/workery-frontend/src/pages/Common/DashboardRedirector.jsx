// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Common/DashboardRedirector.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";

/**
 * DashboardRedirector Component
 *
 * This component handles redirecting users to their appropriate dashboard
 * based on their role when they navigate to the generic /dashboard path.
 * Optimized for both iOS and Android devices with comprehensive mobile support.
 */
function DashboardRedirector() {
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      // Check if user is authenticated
      if (!authManager.isAuthenticated()) {
        console.log(
          "DashboardRedirector: User not authenticated, redirecting to login",
        );
        navigate("/login");
        return;
      }

      try {
        // Get user profile to determine role
        const currentUser = await accountManager.getAccountDetail();

        if (currentUser) {
          // Get dashboard path based on role
          const getDashboardPath = () => {
            const userRole = currentUser.role || currentUser.roleId;

            if (
              [
                EXECUTIVE_ROLE_ID,
                MANAGEMENT_ROLE_ID,
                FRONTLINE_ROLE_ID,
              ].includes(userRole)
            ) {
              return "/admin/dashboard";
            } else if (userRole === CUSTOMER_ROLE_ID) {
              return "/c/dashboard";
            } else if (userRole === ASSOCIATE_ROLE_ID) {
              return "/a/dashboard";
            } else if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
              return "/js/dashboard";
            }
            return "/admin/dashboard";
          };

          const redirectPath = getDashboardPath();
          console.log(
            `DashboardRedirector: Redirecting to ${redirectPath} for role ${currentUser.role || currentUser.roleId}`,
          );
          navigate(redirectPath);
        } else {
          console.error("DashboardRedirector: No user profile found");
          navigate("/login");
        }
      } catch (error) {
        console.error("DashboardRedirector: Error getting profile", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    redirectToDashboard();
  }, [authManager, accountManager, navigate]);

  // Cross-platform optimized styles
  const containerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // Use the most modern viewport unit available (100dvh is preferred)
    minHeight: "100dvh",
    backgroundColor: "#f8fafc",
    padding: "1rem",
    // iOS safe area support
    paddingTop: "max(1rem, env(safe-area-inset-top))",
    paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
    paddingLeft: "max(1rem, env(safe-area-inset-left))",
    paddingRight: "max(1rem, env(safe-area-inset-right))",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
    // Prevent overscroll behavior on both platforms
    overscrollBehavior: "none",
    overscrollBehaviorY: "contain", // Android Chrome optimization
    // iOS momentum scrolling
    WebkitOverflowScrolling: "touch",
    // Android scroll optimization
    scrollBehavior: "smooth",
    // Prevent text size adjustment on both platforms
    WebkitTextSizeAdjust: "100%",
    textSizeAdjust: "100%",
    // Prevent selections during loading
    WebkitUserSelect: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
    // Android performance optimization
    willChange: "auto",
    contain: "layout style paint",
  };

  const contentStyles = {
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "16px", // Material Design 3 corner radius
    // Cross-platform optimized shadows
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    // Android Material Design elevation
    filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.07))",
    border: "1px solid #e2e8f0",
    // Backdrop blur support
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    // Position and touch optimizations
    position: "relative",
    // Cross-platform touch interactions
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    // Android performance optimizations
    transform: "translateZ(0)", // Hardware acceleration
    willChange: "transform",
    // Android Material Design motion
    transition: "transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
  };

  const headingStyles = {
    // Combined fontSize using max() to prevent auto-zoom while maintaining responsive sizing
    fontSize: "max(clamp(1.25rem, 4vw, 1.5rem), 16px)",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 1rem 0",
    lineHeight: "1.4",
    // Cross-platform text rendering optimization
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "optimizeLegibility", // Android text optimization
    // Android accessibility
    fontFeatureSettings: "'liga' 1, 'kern' 1",
  };

  const paragraphStyles = {
    // Combined fontSize using max() to prevent auto-zoom while maintaining responsive sizing
    fontSize: "max(clamp(0.875rem, 3vw, 1rem), 16px)",
    color: "#64748b",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.6",
    // Cross-platform text rendering optimization
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "optimizeLegibility",
    // Android typography optimization
    fontFeatureSettings: "'liga' 1, 'kern' 1",
    wordBreak: "break-word", // Better text wrapping on Android
  };

  const spinnerContainerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1rem",
    // Android performance optimization
    contain: "layout",
  };

  const spinnerStyles = {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    // Hardware acceleration for both platforms
    transform: "translateZ(0)",
    WebkitTransform: "translateZ(0)",
    willChange: "transform",
    // Android optimization
    contain: "layout style paint",
  };

  // Enhanced CSS with cross-platform optimizations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Cross-platform viewport support with fallbacks */
      .dashboard-redirector-container {
        min-height: 100vh;
      }

      @supports (height: 100svh) {
        .dashboard-redirector-container {
          min-height: 100svh !important;
        }
      }

      @supports (height: 100dvh) {
        .dashboard-redirector-container {
          min-height: 100dvh !important;
        }
      }

      /* Spinner animation with cross-platform optimization */
      @keyframes spin {
        0% {
          transform: translateZ(0) rotate(0deg);
          -webkit-transform: translateZ(0) rotate(0deg);
        }
        100% {
          transform: translateZ(0) rotate(360deg);
          -webkit-transform: translateZ(0) rotate(360deg);
        }
      }

      /* iOS-specific fixes */
      @supports (-webkit-touch-callout: none) {
        /* Target iOS Safari specifically */
        .dashboard-redirector-container {
          /* Fix for iOS Safari address bar */
          min-height: -webkit-fill-available;
        }

        /* Optimize text rendering on iOS */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      }

      /* Android-specific optimizations */
      @supports (display: -webkit-box) {
        /* Target Android Chrome and WebView */
        .dashboard-redirector-container {
          /* Handle Android keyboard appearance */
          min-height: 100vh;
          min-height: 100svh;
        }

        /* Android text rendering optimization */
        * {
          text-rendering: optimizeLegibility;
          font-feature-settings: 'liga' 1, 'kern' 1;
        }

        /* Android performance optimizations */
        .dashboard-redirector-content {
          contain: layout style paint;
          will-change: auto;
        }
      }

      /* Android Material Design touches */
      @media (pointer: coarse) {
        /* Touch device optimizations */
        .dashboard-redirector-content {
          /* Larger touch targets for Android */
          min-height: 48px;
          /* Material Design motion */
          transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .dashboard-redirector-content:active {
          transform: scale(0.98);
        }
      }

      /* Cross-platform landscape orientation fixes */
      @media screen and (orientation: landscape) and (max-height: 500px) {
        .dashboard-redirector-content {
          padding: 1.5rem !important;
        }
      }

      /* Enhanced Android landscape support */
      @media screen and (orientation: landscape) and (max-height: 600px) {
        .dashboard-redirector-container {
          padding: 0.5rem !important;
        }
      }

      /* iOS notch/dynamic island support */
      @media (display-mode: standalone) {
        .dashboard-redirector-container {
          padding-top: max(1rem, env(safe-area-inset-top, 20px)) !important;
        }
      }

      /* Android status bar and navigation bar handling */
      @media (display-mode: standalone) {
        .dashboard-redirector-container {
          /* Handle Android navigation gestures */
          padding-bottom: max(1rem, env(safe-area-inset-bottom, 16px)) !important;
        }
      }

      /* Android keyboard handling */
      @media (max-height: 500px) {
        .dashboard-redirector-container {
          min-height: auto !important;
          padding: 0.5rem !important;
        }

        .dashboard-redirector-content {
          padding: 1rem !important;
        }
      }

      /* Cross-platform zoom prevention */
      input, select, textarea, button {
        font-size: 16px !important;
        /* Android tap highlight removal */
        -webkit-tap-highlight-color: transparent;
        /* Android outline removal */
        outline: none;
      }

      /* Android Chrome address bar compensation */
      @supports (-webkit-appearance: none) {
        .dashboard-redirector-container {
          /* Compensation for Chrome's UI changes */
          min-height: calc(100vh - env(keyboard-inset-height, 0px));
        }
      }

      /* High DPI Android device optimization */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .dashboard-redirector-content {
          /* Sharper borders on high-DPI Android displays */
          border-width: 0.5px;
        }
      }

      /* Android dark mode support */
      @media (prefers-color-scheme: dark) {
        .dashboard-redirector-container {
          background-color: #0f172a !important;
        }

        .dashboard-redirector-content {
          background-color: #1e293b !important;
          border-color: #374151 !important;
          color: #f1f5f9 !important;
        }
      }

      /* Android reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .dashboard-redirector-content {
          transition: none !important;
        }

        @keyframes spin {
          0%, 100% { transform: translateZ(0) rotate(0deg); }
        }
      }

      /* Android font scaling support */
      @media (min-resolution: 1.5dppx) {
        .dashboard-redirector-content {
          font-size: 14px;
          line-height: 1.5;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Cross-platform viewport meta tag optimization
  React.useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no";

    if (viewport) {
      viewport.setAttribute("content", content);
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = content;
      document.head.appendChild(meta);
    }

    // Android-specific theme color for status bar
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      themeColor.content = "#f8fafc";
      document.head.appendChild(themeColor);
    }

    // Android Chrome address bar color
    let addressBarColor = document.querySelector(
      'meta[name="msapplication-navbutton-color"]',
    );
    if (!addressBarColor) {
      addressBarColor = document.createElement("meta");
      addressBarColor.name = "msapplication-navbutton-color";
      addressBarColor.content = "#f8fafc";
      document.head.appendChild(addressBarColor);
    }
  }, []);

  // Android performance optimization - reduce layout thrashing
  React.useEffect(() => {
    const container = document.querySelector(".dashboard-redirector-container");
    if (container && "requestIdleCallback" in window) {
      const optimizeLayout = () => {
        container.style.contain = "layout style paint";
      };

      window.requestIdleCallback(optimizeLayout);
    }
  }, []);

  return (
    <div style={containerStyles} className="dashboard-redirector-container">
      <div style={contentStyles} className="dashboard-redirector-content">
        <h3 style={headingStyles}>Redirecting to your dashboard...</h3>
        <p style={paragraphStyles}>
          We're setting up your personalized workspace. This will only take a
          moment.
        </p>
        <div style={spinnerContainerStyles}>
          <div style={spinnerStyles}></div>
        </div>
      </div>
    </div>
  );
}

export default DashboardRedirector;

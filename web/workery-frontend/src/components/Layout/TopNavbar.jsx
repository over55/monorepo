// File Path: web/workery-frontend/src/components/Layout/TopNavbar.jsx
// Modernized TopNavbar Component with Enhanced Responsive Design

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { getRoleRedirectPath } from "../../constants/Roles";
import { Bars3Icon } from "@heroicons/react/24/outline";

/*
 * iOS & Android Cross-Platform Optimizations:
 *
 * iOS Optimizations:
 * - Safe area inset handling for devices with notches (iPhone X+)
 * - Hardware acceleration with transform-gpu and will-change
 * - Disabled text selection and touch callouts on UI elements
 * - Tap highlight color removal for cleaner interactions
 * - Font smoothing optimizations for crisp text rendering
 * - Backface visibility optimizations for better performance
 * - Active states with scale feedback for better touch response
 *
 * Android Optimizations:
 * - Material Design ripple effects and touch feedback
 * - Android Chrome performance optimizations
 * - Display cutout (notch/punch hole) handling
 * - Android font rendering optimizations
 * - WebView and Chrome mobile optimizations
 * - Android accessibility improvements
 * - System navigation bar handling
 * - Hardware acceleration for Android browsers
 */

function TopNavbar({ onMenuToggle }) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      if (!authManager.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        if (mounted) {
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, [location.pathname]); // Re-fetch when route changes

  // Paths where navbar should not be shown
  const hiddenPaths = [
    "/",
    "/register",
    "/index",
    "/login",
    "/logout",
    "/verify",
    "/forgot-password",
    "/password-reset",
    "/terms",
    "/privacy",
  ];

  const shouldHideNavbar = hiddenPaths.some(
    (path) =>
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path)),
  );

  if (shouldHideNavbar || isLoading || !currentUser) {
    return null;
  }

  const getDashboardPath = () => {
    return getRoleRedirectPath(currentUser.roleId) || "/dashboard";
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-[60px] bg-gray-900 text-white
                    flex items-center justify-between z-[900] shadow-md
                    /* iOS & Android Safe Area Optimizations */
                    supports-[padding:max(0px)]:pl-[max(16px,env(safe-area-inset-left))]
                    supports-[padding:max(0px)]:pr-[max(16px,env(safe-area-inset-right))]
                    supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]
                    /* Cross-platform Performance */
                    will-change-transform transform-gpu
                    /* Text Selection & Touch Optimizations */
                    select-none [-webkit-touch-callout:none] [-webkit-user-select:none]
                    /* Font Rendering Optimizations */
                    [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]
                    /* Android Material Design */
                    [text-rendering:optimizeLegibility] [font-feature-settings:'liga']"
      style={{
        /* Cross-platform Safe Area Fallbacks */
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",

        /* iOS Optimizations */
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitPerspective: 1000,
        perspective: 1000,

        /* Android Optimizations */
        // Display cutout support for Android devices with notches/punch holes
        // This also handles iOS safe area inset top
        paddingTop:
          "max(env(safe-area-inset-top), env(titlebar-area-height, 0px))",
        // Android Chrome performance
        contain: "layout style paint",
        // Android font rendering
        textRendering: "optimizeLegibility",
        fontFeatureSettings: '"liga", "kern"',
        // Android hardware acceleration
        transform: "translateZ(0)",
        // Android touch optimization
        touchAction: "manipulation",
        // Android WebView optimization
        WebkitTransform: "translateZ(0)",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center flex-1 min-w-0">
        {/* Mobile hamburger - shows on mobile and small tablets */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 ml-2 rounded-md hover:bg-white/10 active:bg-white/20
                     transition-colors duration-200 touch-manipulation
                     flex items-center justify-center min-w-[44px] min-h-[44px]
                     /* Cross-platform Touch Optimizations */
                     select-none [-webkit-touch-callout:none] [-webkit-user-select:none]
                     [-webkit-tap-highlight-color:transparent] focus:bg-white/10
                     /* iOS Optimizations */
                     will-change-transform transform-gpu active:scale-95
                     /* Android Material Design */
                     relative overflow-hidden
                     before:absolute before:inset-0 before:bg-white/20 before:rounded-md
                     before:scale-0 before:transition-transform before:duration-300
                     active:before:scale-100"
          title="Open menu"
          aria-label="Open navigation menu"
          style={{
            /* iOS Optimizations */
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",

            /* Android Optimizations */
            // Material Design ripple effect support
            outline: "none",
            // Android Chrome performance
            contain: "layout style paint",
            // Touch optimization for Android
            touchAction: "manipulation",
            // Android hardware acceleration
            transform: "translateZ(0)",
            // Android WebView optimization
            WebkitTransform: "translateZ(0)",
          }}
        >
          <Bars3Icon className="h-6 w-6 transition-transform duration-150 relative z-10" />
        </button>

        {/* Logo Container - responsive positioning */}
        <div className="flex-1 flex justify-center md:justify-start md:ml-4 lg:ml-[280px] xl:ml-[300px]">
          <Link
            to={getDashboardPath()}
            className="inline-block py-2 focus:outline-none focus:ring-2 focus:ring-white/50 rounded
                       /* Cross-platform Touch Optimizations */
                       [-webkit-tap-highlight-color:transparent] select-none
                       [-webkit-touch-callout:none] [-webkit-user-select:none]
                       /* iOS Optimizations */
                       active:opacity-80 transition-opacity duration-150
                       /* Android Material Design */
                       relative overflow-hidden
                       before:absolute before:inset-0 before:bg-white/10 before:rounded
                       before:scale-0 before:transition-transform before:duration-200
                       active:before:scale-100"
            style={{
              /* iOS Optimizations */
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",

              /* Android Optimizations */
              // Touch optimization
              touchAction: "manipulation",
              // Android Chrome performance
              contain: "layout style paint",
              // Hardware acceleration
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)",
            }}
          >
            <img
              src="/img/compressed-logo.png"
              alt="Workery Logo"
              className="h-8 w-auto sm:h-9 md:h-10 transition-all duration-200
                         /* Cross-platform Image Optimizations */
                         [-webkit-user-drag:none] [-webkit-touch-callout:none]
                         will-change-transform transform-gpu
                         /* Android Optimizations */
                         [image-rendering:crisp-edges] [image-rendering:-webkit-optimize-contrast]
                         relative z-10"
              draggable="false"
              style={{
                /* iOS Optimizations */
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",

                /* Android Optimizations */
                // Image rendering optimization for Android
                imageRendering: "crisp-edges",
                // Android hardware acceleration
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                // Android performance
                contain: "layout style paint",
              }}
            />
          </Link>
        </div>

        {/* Spacer for mobile to balance hamburger menu */}
        <div className="md:hidden w-[52px]" />
      </div>

      {/* Right Section - User Welcome */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 min-w-0">
        <div
          className="text-xs sm:text-sm text-gray-300 truncate
                        /* Cross-platform Text Optimizations */
                        select-none [-webkit-touch-callout:none] [-webkit-user-select:none]
                        /* iOS Font Rendering */
                        [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]
                        /* Android Font Rendering */
                        [text-rendering:optimizeLegibility] [font-feature-settings:'liga']"
          style={{
            /* Android Text Optimizations */
            textRendering: "optimizeLegibility",
            fontFeatureSettings: '"liga", "kern"',
            // Android performance
            contain: "layout style paint",
          }}
        >
          {/* Mobile: Show just first name or "User" */}
          <span className="sm:hidden">{currentUser.firstName || "User"}</span>

          {/* Tablet: Show "Hi, [Name]" */}
          <span className="hidden sm:inline md:hidden">
            Hi,{" "}
            {currentUser.firstName ||
              currentUser.email?.split("@")[0] ||
              "User"}
          </span>

          {/* Desktop: Show full welcome message */}
          <span className="hidden md:inline">
            Welcome, {currentUser.firstName || currentUser.email}
          </span>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;

// File Path: web/workery-frontend/src/components/Layout/TopNavbar.jsx
// Enhanced TopNavbar Component with Combined Mobile Menu and Desktop Collapse Controls
// Uses hamburger icon for both mobile menu and desktop sidebar collapse

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { getRoleRedirectPath } from "../../constants/Roles";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function TopNavbar({
  onMenuToggle,
  isMobile,
  isTablet,
  isIOS,
  isAndroid,
  isSidebarOpen,
  sidebarCollapsed,
  onCollapseToggle,
}) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Determine if we're on mobile/small tablet
  const shouldShowMobileMenu =
    isMobile || (isTablet && window.innerWidth < 768);

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
  }, [location.pathname]);

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

  // Handle button click - different behavior for mobile vs desktop
  const handleMenuButtonClick = () => {
    if (shouldShowMobileMenu) {
      onMenuToggle(); // Toggle mobile menu open/close
    } else {
      onCollapseToggle(); // Toggle desktop sidebar collapse
    }
  };

  // Determine which icon to show
  const getMenuIcon = () => {
    if (shouldShowMobileMenu) {
      // Mobile: Show X when open, hamburger when closed
      return isSidebarOpen ? (
        <XMarkIcon className="h-6 w-6 transition-transform duration-150" />
      ) : (
        <Bars3Icon className="h-6 w-6 transition-transform duration-150" />
      );
    } else {
      // Desktop: Always show hamburger icon for collapse/expand
      return (
        <Bars3Icon className="h-5 w-5 transition-transform duration-150" />
      );
    }
  };

  // Get button title based on state
  const getButtonTitle = () => {
    if (shouldShowMobileMenu) {
      return isSidebarOpen ? "Close menu" : "Open menu";
    } else {
      return sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";
    }
  };

  // Get button aria-label
  const getButtonAriaLabel = () => {
    if (shouldShowMobileMenu) {
      return isSidebarOpen ? "Close navigation menu" : "Open navigation menu";
    } else {
      return sidebarCollapsed
        ? "Expand sidebar navigation"
        : "Collapse sidebar navigation";
    }
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
        paddingTop:
          "max(env(safe-area-inset-top), env(titlebar-area-height, 0px))",
        contain: "layout style paint",
        textRendering: "optimizeLegibility",
        fontFeatureSettings: '"liga", "kern"',
        transform: "translateZ(0)",
        touchAction: "manipulation",
        WebkitTransform: "translateZ(0)",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center flex-1 min-w-0">
        {/* Menu Control Button - Shows for both mobile and desktop */}
        <button
          onClick={handleMenuButtonClick}
          className={`
            p-2 ml-2 rounded-md hover:bg-white/10 active:bg-white/20
            transition-all duration-200 touch-manipulation
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
            active:before:scale-100
            ${shouldShowMobileMenu ? "" : "hidden lg:flex"}
          `}
          title={getButtonTitle()}
          aria-label={getButtonAriaLabel()}
          style={{
            /* iOS Optimizations */
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",

            /* Android Optimizations */
            outline: "none",
            contain: "layout style paint",
            touchAction: "manipulation",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
          }}
        >
          {getMenuIcon()}
        </button>

        {/* Logo Container - responsive positioning */}
        <div
          className={`
          flex-1 flex justify-center
          ${shouldShowMobileMenu ? "" : "lg:justify-start lg:ml-4"}
          ${!shouldShowMobileMenu && !sidebarCollapsed ? "lg:ml-[280px] xl:ml-[300px]" : ""}
          ${!shouldShowMobileMenu && sidebarCollapsed ? "lg:ml-[100px] xl:ml-[120px]" : ""}
        `}
        >
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
              touchAction: "manipulation",
              contain: "layout style paint",
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
                imageRendering: "crisp-edges",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                contain: "layout style paint",
              }}
            />
          </Link>
        </div>

        {/* Spacer for mobile to balance hamburger menu */}
        {shouldShowMobileMenu && <div className="w-[52px]" />}
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

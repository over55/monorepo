// File Path: web/workery-frontend/src/components/Layout/TopNavbar.jsx
// Enhanced TopNavbar Component with UIX Theme Support and Profile Dropdown

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import {
  Bars3Icon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Modal, Button, useUIXTheme } from "../UIX";

function TopNavbar({
  onMenuToggle,
  isMobile,
  isTablet,
  isSidebarOpen,
  sidebarCollapsed,
  onCollapseToggle,
  onProfileDropdownOpen,
}) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();
  const { getThemeClasses } = useUIXTheme();

  const themeClasses = useMemo(
    () => ({
      dropdownActive: getThemeClasses("pagination-active"),
      navBg: getThemeClasses("nav-bg"),
      navText: getThemeClasses("nav-text"),
      sidebarHover: getThemeClasses("sidebar-hover"),
      bgCard: getThemeClasses("bg-card"),
      borderLight: getThemeClasses("border-light"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      bgHover: getThemeClasses("bg-hover"),
    }),
    [getThemeClasses],
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const dropdownMenuTimer = useRef(null);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  const shouldShowMobileMenu = isMobile || isTablet;

  // Fetch current user
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
        if (import.meta.env.DEV) {
          console.error("Failed to fetch current user:", error);
        }
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
  }, [location.pathname, authManager, accountManager, onUnauthorized]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(dropdownMenuTimer.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".account-menu-container")) {
        setShowAccountDropdown(false);
      }
    };

    if (showAccountDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showAccountDropdown]);

  // Close dropdown when navigating
  useEffect(() => {
    setShowAccountDropdown(false);
  }, [location.pathname]);

  // Close profile dropdown when sidebar opens on mobile
  useEffect(() => {
    if (shouldShowMobileMenu && isSidebarOpen) {
      setShowAccountDropdown(false);
    }
  }, [isSidebarOpen, shouldShowMobileMenu]);

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

  const handleMenuButtonClick = () => {
    if (shouldShowMobileMenu) {
      onMenuToggle();
    } else {
      onCollapseToggle();
    }
  };

  const getMenuIcon = () => {
    if (shouldShowMobileMenu) {
      return isSidebarOpen ? (
        <XMarkIcon className="h-6 w-6" />
      ) : (
        <Bars3Icon className="h-6 w-6" />
      );
    } else {
      return <Bars3Icon className="h-5 w-5" />;
    }
  };

  const getButtonTitle = () => {
    if (shouldShowMobileMenu) {
      return isSidebarOpen ? "Close menu" : "Open menu";
    } else {
      return sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar";
    }
  };

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogoutConfirm = async () => {
    try {
      setShowLogoutWarning(false);
      setShowAccountDropdown(false);
      navigate("/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout navigation failed:", error);
      }
      window.location.href = "/logout";
    }
  };

  const handleAccountMenuEnter = () => {
    if (!shouldShowMobileMenu) {
      clearTimeout(dropdownMenuTimer.current);
      setShowAccountDropdown(true);
    }
  };

  const handleAccountMenuLeave = () => {
    if (!shouldShowMobileMenu) {
      dropdownMenuTimer.current = setTimeout(() => {
        setShowAccountDropdown(false);
      }, 200);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-[60px] ${themeClasses.navBg} ${themeClasses.navText} flex items-center justify-between z-50 shadow-md`}>
        {/* Left Section */}
        <div className="flex items-center flex-1 min-w-0 px-4">
          {/* Menu Control Button */}
          <button
            onClick={handleMenuButtonClick}
            className={`p-2 rounded-md ${themeClasses.sidebarHover} cursor-pointer transition-colors duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]`}
            title={getButtonTitle()}
            aria-label={getButtonTitle()}
          >
            {getMenuIcon()}
          </button>

          {/* Logo Container */}
          <div
            className={`
              flex-1 flex
              ${isMobile ? "justify-center" : "justify-start ml-4"}
            `}
          >
            <span className="text-white font-bold text-lg sm:text-xl">
              Workery
            </span>
          </div>

          {/* Spacer for mobile */}
          {isMobile && <div className="w-[52px]" />}
        </div>

        {/* Right Section - User Account Menu */}
        <div
          className="account-menu-container relative px-3 sm:px-5"
          onMouseEnter={handleAccountMenuEnter}
          onMouseLeave={handleAccountMenuLeave}
        >
          <button
            onClick={() => {
              if (shouldShowMobileMenu) {
                const newState = !showAccountDropdown;
                setShowAccountDropdown(newState);
                if (newState && onProfileDropdownOpen) {
                  onProfileDropdownOpen();
                }
              }
            }}
            className={`flex items-center gap-1 text-xs sm:text-sm ${themeClasses.navText} opacity-80 hover:opacity-100 ${themeClasses.sidebarHover} transition-colors duration-200 cursor-pointer py-2 px-2 rounded-md`}
          >
            <span className="sm:hidden">{currentUser.firstName || "User"}</span>
            <span className="hidden sm:inline md:hidden">
              Hi,{" "}
              {currentUser.firstName ||
                currentUser.email?.split("@")[0] ||
                "User"}
            </span>
            <span className="hidden md:inline">
              Welcome, {currentUser.firstName || currentUser.email}
            </span>
            <ChevronDownIcon
              className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${
                showAccountDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Mobile Overlay */}
          {isMobile && showAccountDropdown && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
              style={{ top: "60px", touchAction: "none" }}
              onClick={() => setShowAccountDropdown(false)}
            />
          )}

          {/* Dropdown Menu */}
          {showAccountDropdown && (
            <div
              className={`
                ${isMobile
                  ? `fixed left-0 right-0 top-[60px] w-full ${themeClasses.bgCard} shadow-2xl border-b ${themeClasses.borderLight} py-2`
                  : `absolute right-0 top-full w-48 ${themeClasses.bgCard} rounded-md shadow-2xl border ${themeClasses.borderLight} py-1 mt-1`
                }
              `}
              style={{
                zIndex: isMobile ? 1000 : 9999999,
              }}
            >
              <Link
                to="/help"
                onClick={() => setShowAccountDropdown(false)}
                className={`
                  flex items-center transition-colors duration-200 cursor-pointer
                  ${isMobile ? "px-4 py-3 text-base" : "px-4 py-2 text-sm"}
                  ${
                    isActivePath("/help")
                      ? themeClasses.dropdownActive
                      : `${themeClasses.textPrimary} ${themeClasses.bgHover}`
                  }
                `}
              >
                <QuestionMarkCircleIcon className={`${isMobile ? "h-6 w-6" : "h-5 w-5"} mr-3 flex-shrink-0`} />
                <span>Help</span>
              </Link>

              <Link
                to="/admin/account"
                onClick={() => setShowAccountDropdown(false)}
                className={`
                  flex items-center transition-colors duration-200 cursor-pointer
                  ${isMobile ? "px-4 py-3 text-base" : "px-4 py-2 text-sm"}
                  ${
                    isActivePath("/account")
                      ? themeClasses.dropdownActive
                      : `${themeClasses.textPrimary} ${themeClasses.bgHover}`
                  }
                `}
              >
                <UserCircleIcon className={`${isMobile ? "h-6 w-6" : "h-5 w-5"} mr-3 flex-shrink-0`} />
                <span>My Profile</span>
              </Link>

              <hr className={`my-1 border ${themeClasses.borderLight}`} />

              <button
                onClick={() => {
                  setShowAccountDropdown(false);
                  setShowLogoutWarning(true);
                }}
                className={`flex items-center w-full ${isMobile ? "px-4 py-3 text-base" : "px-4 py-2 text-sm"} ${themeClasses.textPrimary} ${themeClasses.bgHover} cursor-pointer transition-colors duration-200`}
              >
                <ArrowRightOnRectangleIcon className={`${isMobile ? "h-6 w-6" : "h-5 w-5"} mr-3 flex-shrink-0`} />
                <span>Sign Off</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutWarning}
        onClose={() => setShowLogoutWarning(false)}
        title="Are you sure?"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutWarning(false)}
            >
              No
            </Button>
            <Button variant="success" onClick={handleLogoutConfirm}>
              Yes
            </Button>
          </div>
        }
      >
        <p>
          You are about to log out of the system and you'll need to log in again
          next time. Are you sure you want to continue?
        </p>
      </Modal>
    </>
  );
}

export default TopNavbar;

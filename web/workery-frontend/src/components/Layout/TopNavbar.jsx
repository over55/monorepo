// File Path: web/workery-frontend/src/components/Layout/TopNavbar.jsx
// Modernized TopNavbar Component with Tailwind v4

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { getRoleRedirectPath } from "../../constants/Roles";
import { Bars3Icon } from "@heroicons/react/24/outline";

function TopNavbar({ onMenuToggle, isMobile }) {
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
                    flex items-center justify-between z-[900] shadow-md"
    >
      {/* Left Section */}
      <div className="flex items-center flex-1">
        {/* Mobile hamburger to open sidebar */}
        {isMobile && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded hover:bg-white/10 transition-colors duration-200 ml-2"
            title="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}

        {/* Logo */}
        <div
          className={`${isMobile ? "flex-1 flex justify-center" : "ml-[275px]"}`}
        >
          <Link to={getDashboardPath()} className="inline-block py-2">
            <img
              src="/img/compressed-logo.png"
              alt="Workery Logo"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Spacer for mobile to balance hamburger */}
        {isMobile && <div className="w-10 mr-2" />}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 px-5">
        <div className="text-sm text-gray-300">
          {isMobile ? (
            <span>{currentUser.firstName || "User"}</span>
          ) : (
            <span>Welcome, {currentUser.firstName || currentUser.email}</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;

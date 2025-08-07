// File Path: web/workery-frontend/src/components/Layout/TopNavbar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { theme } from "../../constants/Theme";
import { getRoleRedirectPath } from "../../constants/Roles";

function TopNavbar({ onMenuToggle, isMenuOpen, isMobile }) {
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

  const styles = {
    navbar: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "60px",
      backgroundColor: theme.colors.dark,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 900,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
    },
    logoImage: {
      height: "30px",
      width: "auto",
    },
    hamburger: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "20px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "4px",
      transition: `background-color ${theme.transitions.fast}`,
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    userInfo: {
      fontSize: "14px",
      color: "#ccc",
    },
  };

  const getDashboardPath = () => {
    return getRoleRedirectPath(currentUser.roleId) || "/dashboard";
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        <button
          onClick={onMenuToggle}
          style={styles.hamburger}
          title="Toggle Menu"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div style={styles.logo}>
          <Link to={getDashboardPath()}>
            <img
              src="/img/compressed-logo.png"
              alt="Workery Logo"
              style={styles.logoImage}
            />
          </Link>
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.userInfo}>
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

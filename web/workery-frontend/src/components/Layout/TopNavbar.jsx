// File Path: monorepo/web/workery-frontend/src/components/Layout/TopNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";

function TopNavbar({ onMenuToggle, isMenuOpen }) {
  ////
  //// Services.
  ////

  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  ////
  //// Component states.
  ////

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  ////
  //// Misc.
  ////

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
  }, []);

  ////
  //// Component rendering.
  ////

  // Paths where top navbar should not be shown
  const ignorePathsArr = [
    "/",
    "/register",
    "/register-successful",
    "/index",
    "/login",
    "/login/2fa",
    "/login/2fa/step-1",
    "/login/2fa/step-2",
    "/login/2fa/step-3",
    "/login/2fa/step-3/backup-code",
    "/login/2fa/backup-code",
    "/login/2fa/backup-code-recovery",
    "/logout",
    "/verify",
    "/forgot-password",
    "/password-reset",
    "/root/dashboard",
    "/root/tenants",
    "/root/tenant",
    "/terms",
    "/privacy",
  ];

  const shouldHideNavbar = ignorePathsArr.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + "/"),
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
      backgroundColor: "#1a1a1a",
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
      height: "28px",
      width: "auto",
    },
    hamburger: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "18px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "4px",
      transition: "background-color 0.2s",
    },
    hamburgerHover: {
      backgroundColor: "rgba(255,255,255,0.1)",
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

  const getDashboardPath = (roleId) => {
    switch (roleId) {
      case EXECUTIVE_ROLE_ID:
      case MANAGEMENT_ROLE_ID:
      case FRONTLINE_ROLE_ID:
        return "/admin/dashboard";
      case CUSTOMER_ROLE_ID:
        return "/c/dashboard";
      case ASSOCIATE_ROLE_ID:
        return "/a/dashboard";
      case ASSOCIATE_JOB_SEEKER_ROLE_ID:
        return "/js/dashboard";
      default:
        return "/admin/dashboard";
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        <button
          onClick={onMenuToggle}
          style={styles.hamburger}
          title="Toggle Menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div style={styles.logo}>
          <Link to={getDashboardPath(currentUser.roleId)}>
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
          Welcome, {currentUser.firstName || currentUser.email}
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;

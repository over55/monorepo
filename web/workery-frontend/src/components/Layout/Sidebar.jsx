// File Path: monorepo/web/workery-frontend/src/components/Layout/Sidebar.jsx
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

function Sidebar({ isOpen, onClose }) {
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
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskItemActiveCount, setTaskItemActiveCount] = useState(0); // TODO: Implement with task service

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const handleLinkClick = () => {
    // Close hamburger menu on mobile
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      await authManager.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
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

  // Paths where sidebar should not be shown
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

  const shouldHideSidebar = ignorePathsArr.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(path + "/"),
  );

  if (shouldHideSidebar || isLoading || !currentUser) {
    return null;
  }

  const styles = {
    sidebar: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "250px",
      height: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0",
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s ease-in-out",
      zIndex: 1000,
      overflowY: "auto",
      padding: "20px 0",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
      display: isOpen ? "block" : "none",
    },
    logo: {
      padding: "20px",
      textAlign: "center",
      borderBottom: "1px solid #333",
      marginBottom: "20px",
    },
    logoImage: {
      maxWidth: "150px",
      height: "auto",
    },
    menuSection: {
      marginBottom: "30px",
      padding: "0 20px",
    },
    menuLabel: {
      fontSize: "12px",
      fontWeight: "bold",
      color: "#888",
      textTransform: "uppercase",
      marginBottom: "10px",
      letterSpacing: "1px",
    },
    menuList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    menuItem: {
      marginBottom: "5px",
    },
    menuLink: {
      display: "block",
      padding: "10px 15px",
      color: "#e0e0e0",
      textDecoration: "none",
      borderRadius: "4px",
      transition: "background-color 0.2s",
    },
    menuLinkHover: {
      backgroundColor: "#333",
    },
    menuLinkActive: {
      backgroundColor: "#007bff",
      color: "white",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    },
    modalCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "20px",
      maxWidth: "400px",
      width: "90%",
    },
    modalHeader: {
      marginBottom: "15px",
    },
    modalTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "bold",
    },
    modalBody: {
      marginBottom: "20px",
      color: "#666",
    },
    modalFooter: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
    },
    button: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    buttonPrimary: {
      backgroundColor: "#28a745",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#6c757d",
      color: "white",
    },
  };

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  const getLinkStyle = (path) => ({
    ...styles.menuLink,
    ...(isActivePath(path) ? styles.menuLinkActive : {}),
  });

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={onClose} />

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <Link to="/admin/dashboard" onClick={handleLinkClick}>
            <img
              src="/img/compressed-logo.png"
              alt="Workery Logo"
              style={styles.logoImage}
            />
          </Link>
        </div>

        {/* Staff Menu */}
        {(currentUser.roleId === EXECUTIVE_ROLE_ID ||
          currentUser.roleId === MANAGEMENT_ROLE_ID ||
          currentUser.roleId === FRONTLINE_ROLE_ID) && (
          <>
            <div style={styles.menuSection}>
              <div style={styles.menuLabel}>Staff</div>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/dashboard"
                    style={getLinkStyle("dashboard")}
                    onClick={handleLinkClick}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/tasks"
                    style={getLinkStyle("task")}
                    onClick={handleLinkClick}
                  >
                    📋 Tasks
                    {taskItemActiveCount > 0 && ` (${taskItemActiveCount})`}
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/clients"
                    style={getLinkStyle("client")}
                    onClick={handleLinkClick}
                  >
                    👤 Clients
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/associates"
                    style={getLinkStyle("associate")}
                    onClick={handleLinkClick}
                  >
                    👷 Associates
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/orders"
                    style={getLinkStyle("order")}
                    onClick={handleLinkClick}
                  >
                    🔧 Work Orders
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/skill-sets"
                    style={getLinkStyle("skill-set")}
                    onClick={handleLinkClick}
                  >
                    🎓 Skill Sets
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/incidents"
                    style={getLinkStyle("incidents")}
                    onClick={handleLinkClick}
                  >
                    🔥 Incidents
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/job-history"
                    style={getLinkStyle("job-history")}
                    onClick={handleLinkClick}
                  >
                    📊 Job History
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/all-comments"
                    style={getLinkStyle("all-comments")}
                    onClick={handleLinkClick}
                  >
                    💬 Comments
                  </Link>
                </li>
              </ul>
            </div>

            <div style={styles.menuSection}>
              <div style={styles.menuLabel}>Administration</div>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/financials"
                    style={getLinkStyle("financial")}
                    onClick={handleLinkClick}
                  >
                    💳 Financials
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/reports"
                    style={getLinkStyle("report")}
                    onClick={handleLinkClick}
                  >
                    📈 Reports
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/staff"
                    style={getLinkStyle("staff")}
                    onClick={handleLinkClick}
                  >
                    👔 Staff
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/admin/settings"
                    style={getLinkStyle("setting")}
                    onClick={handleLinkClick}
                  >
                    ⚙️ Settings
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Customer Menu */}
        {currentUser.roleId === CUSTOMER_ROLE_ID && (
          <>
            <div style={styles.menuSection}>
              <div style={styles.menuLabel}>Member</div>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  <Link
                    to="/c/dashboard"
                    style={getLinkStyle("dashboard")}
                    onClick={handleLinkClick}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/c/orders"
                    style={getLinkStyle("order")}
                    onClick={handleLinkClick}
                  >
                    🔧 My Service Requests
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/c/financials"
                    style={getLinkStyle("financial")}
                    onClick={handleLinkClick}
                  >
                    💳 My Financials
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/c/associates"
                    style={getLinkStyle("associate")}
                    onClick={handleLinkClick}
                  >
                    👷 My Associates
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Associate Menu */}
        {currentUser.roleId === ASSOCIATE_ROLE_ID && (
          <>
            <div style={styles.menuSection}>
              <div style={styles.menuLabel}>Associate</div>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  <Link
                    to="/a/dashboard"
                    style={getLinkStyle("dashboard")}
                    onClick={handleLinkClick}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/a/orders"
                    style={getLinkStyle("order")}
                    onClick={handleLinkClick}
                  >
                    🔧 My Work Orders
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/a/financials"
                    style={getLinkStyle("financial")}
                    onClick={handleLinkClick}
                  >
                    💳 My Financials
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/a/clients"
                    style={getLinkStyle("client")}
                    onClick={handleLinkClick}
                  >
                    👤 My Clients
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Job Seeker Menu */}
        {currentUser.roleId === ASSOCIATE_JOB_SEEKER_ROLE_ID && (
          <>
            <div style={styles.menuSection}>
              <div style={styles.menuLabel}>Job Seeker</div>
              <ul style={styles.menuList}>
                <li style={styles.menuItem}>
                  <Link
                    to="/js/dashboard"
                    style={getLinkStyle("dashboard")}
                    onClick={handleLinkClick}
                  >
                    📊 Dashboard
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/js/find-work"
                    style={getLinkStyle("find-work")}
                    onClick={handleLinkClick}
                  >
                    🔍 Find Work
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/js/documents"
                    style={getLinkStyle("documents")}
                    onClick={handleLinkClick}
                  >
                    💼 My Documents
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/js/advisor"
                    style={getLinkStyle("advisor")}
                    onClick={handleLinkClick}
                  >
                    👔 My Advisor
                  </Link>
                </li>
                <li style={styles.menuItem}>
                  <Link
                    to="/js/learning"
                    style={getLinkStyle("learning")}
                    onClick={handleLinkClick}
                  >
                    ⭐ Learning & Goals
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Account Menu */}
        <div style={styles.menuSection}>
          <div style={styles.menuLabel}>Account</div>
          <ul style={styles.menuList}>
            <li style={styles.menuItem}>
              <Link
                to="/help"
                style={getLinkStyle("help")}
                onClick={handleLinkClick}
              >
                ❓ Help
              </Link>
            </li>
            <li style={styles.menuItem}>
              <Link
                to="/account"
                style={getLinkStyle("account")}
                onClick={handleLinkClick}
              >
                👤 My Profile
              </Link>
            </li>
            <li style={styles.menuItem}>
              <button
                onClick={() => setShowLogoutWarning(true)}
                style={{
                  ...styles.menuLink,
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🚪 Sign Off
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutWarning && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Are you sure?</h3>
            </div>
            <div style={styles.modalBody}>
              You are about to log out of the system and you'll need to log in
              again next time. Are you sure you want to continue?
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowLogoutWarning(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                }}
              >
                No
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

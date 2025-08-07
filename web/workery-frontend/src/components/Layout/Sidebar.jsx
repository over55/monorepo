// File Path: web/workery-frontend/src/components/Layout/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { theme } from "../../constants/Theme";
import { Modal, Button } from "../UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";

function Sidebar({ isOpen, onClose, isMobile }) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskItemActiveCount, setTaskItemActiveCount] = useState(0); // TODO: Connect to actual task count

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const handleLinkClick = () => {
    if (isMobile) {
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

  // Paths where sidebar should not be shown
  const hiddenPaths = [
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

  const shouldHideSidebar = hiddenPaths.some(
    (path) =>
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path)),
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
      backgroundColor: theme.colors.dark,
      color: "#e0e0e0",
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      transition: `transform ${theme.transitions.normal}`,
      zIndex: 1000,
      overflowY: "auto",
      paddingTop: "80px",
      paddingBottom: "20px",
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
    logoSection: {
      textAlign: "center",
      padding: "20px",
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
      transition: `background-color ${theme.transitions.fast}`,
    },
    menuLinkActive: {
      backgroundColor: theme.colors.primary,
      color: "white",
    },
    logoutButton: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "10px 15px",
      color: "#e0e0e0",
      background: "none",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: `background-color ${theme.transitions.fast}`,
    },
    taskCount: {
      backgroundColor: "#28a745",
      color: "white",
      borderRadius: "10px",
      padding: "2px 6px",
      fontSize: "11px",
      marginLeft: "5px",
    },
  };

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  const getLinkStyle = (path) => ({
    ...styles.menuLink,
    ...(isActivePath(path) ? styles.menuLinkActive : {}),
  });

  // Get menu items based on user role
  const getMenuSections = () => {
    const sections = [];

    // Debug logging
    console.log("Current user in sidebar:", currentUser);
    console.log(
      "User role:",
      currentUser?.role,
      "User roleId:",
      currentUser?.roleId,
    );

    // Staff menu for executive, management, and frontline roles
    // Check both role and roleId properties for compatibility
    const userRole = currentUser.role || currentUser.roleId;
    if (
      [EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
        userRole,
      )
    ) {
      sections.push({
        label: "Staff",
        items: [
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          {
            path: "/admin/tasks",
            label: "Tasks",
            icon: "📋",
            badge: taskItemActiveCount > 0 ? taskItemActiveCount : null,
          },
          { path: "/admin/customers", label: "Customers", icon: "👤" },
          { path: "/admin/associates", label: "Associates", icon: "👷" },
          { path: "/admin/orders", label: "Work Orders", icon: "🔧" },
          { path: "/admin/skill-sets", label: "Skill Sets", icon: "🎓" },
          { path: "/admin/incidents", label: "Incidents", icon: "🔥" },
          { path: "/admin/job-history", label: "Job History", icon: "📊" },
          { path: "/admin/all-comments", label: "Comments", icon: "💬" },
        ],
      });

      sections.push({
        label: "Administration",
        items: [
          { path: "/admin/financials", label: "Financials", icon: "💳" },
          { path: "/admin/reports", label: "Reports", icon: "📈" },
          { path: "/admin/staff", label: "Staff", icon: "👔" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
        ],
      });
    }

    // Customer menu
    if (userRole === CUSTOMER_ROLE_ID) {
      sections.push({
        label: "Member",
        items: [
          { path: "/c/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/c/orders", label: "My Service Requests", icon: "🔧" },
          { path: "/c/financials", label: "My Financials", icon: "💳" },
          { path: "/c/associates", label: "My Associates", icon: "👷" },
        ],
      });
    }

    // Associate menu
    if (userRole === ASSOCIATE_ROLE_ID) {
      sections.push({
        label: "Associate",
        items: [
          { path: "/a/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/a/orders", label: "My Work Orders", icon: "🔧" },
          { path: "/a/financials", label: "My Financials", icon: "💳" },
          { path: "/a/clients", label: "My Clients", icon: "👤" },
        ],
      });
    }

    // Job Seeker menu
    if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
      sections.push({
        label: "Job Seeker",
        items: [
          { path: "/js/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/js/find-work", label: "Find Work", icon: "🔍" },
          { path: "/js/documents", label: "My Documents", icon: "💼" },
          { path: "/js/advisor", label: "My Advisor", icon: "👔" },
          { path: "/js/learning", label: "Learning & Goals", icon: "⭐" },
        ],
      });
    }

    return sections;
  };

  const menuSections = getMenuSections();

  // Get dashboard path based on role
  const getDashboardPath = () => {
    const userRole = currentUser.role || currentUser.roleId;
    if (
      [EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
        userRole,
      )
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

  return (
    <>
      {/* Overlay */}
      <div style={styles.overlay} onClick={onClose} />

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <Link to={getDashboardPath()} onClick={handleLinkClick}>
            <img
              src="/img/compressed-logo.png"
              alt="Workery Logo"
              style={styles.logoImage}
            />
          </Link>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <div key={index} style={styles.menuSection}>
            <div style={styles.menuLabel}>{section.label}</div>
            <ul style={styles.menuList}>
              {section.items.map((item, idx) => (
                <li key={idx} style={styles.menuItem}>
                  <Link
                    to={item.path}
                    style={getLinkStyle(item.path)}
                    onClick={handleLinkClick}
                    onMouseEnter={(e) => {
                      if (!isActivePath(item.path)) {
                        e.target.style.backgroundColor = "#333";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath(item.path)) {
                        e.target.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.icon} {item.label}
                    {item.badge && (
                      <span style={styles.taskCount}>({item.badge})</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Account Menu */}
        <div style={styles.menuSection}>
          <div style={styles.menuLabel}>Account</div>
          <ul style={styles.menuList}>
            <li style={styles.menuItem}>
              <Link
                to="/help"
                style={getLinkStyle("help")}
                onClick={handleLinkClick}
                onMouseEnter={(e) => {
                  if (!isActivePath("help")) {
                    e.target.style.backgroundColor = "#333";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath("help")) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                ❓ Help
              </Link>
            </li>
            <li style={styles.menuItem}>
              <Link
                to="/account"
                style={getLinkStyle("account")}
                onClick={handleLinkClick}
                onMouseEnter={(e) => {
                  if (!isActivePath("account")) {
                    e.target.style.backgroundColor = "#333";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath("account")) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                👤 My Profile
              </Link>
            </li>
            <li style={styles.menuItem}>
              <button
                onClick={() => setShowLogoutWarning(true)}
                style={styles.logoutButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#333";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                🚪 Sign Off
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutWarning}
        onClose={() => setShowLogoutWarning(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setShowLogoutWarning(false)}
              variant="secondary"
            >
              No
            </Button>
            <Button onClick={handleLogoutConfirm} variant="success">
              Yes
            </Button>
          </>
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

export default Sidebar;

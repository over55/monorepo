// File Path: web/workery-frontend/src/components/Layout/Sidebar.jsx
// Modernized Sidebar Component with Tailwind v4 and Collapse Feature

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { Modal, Button } from "../UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
} from "../../constants/Roles";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  FireIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Sidebar({ isOpen, onClose, isMobile }) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskItemActiveCount, setTaskItemActiveCount] = useState(833); // TODO: Connect to actual task count
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

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

  const toggleCollapse = () => {
    if (!isMobile) {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      // Store preference in localStorage
      localStorage.setItem("sidebarCollapsed", newCollapsedState.toString());
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("sidebarCollapsedChanged"));
    } else {
      onClose();
    }
  };

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true" && !isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

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

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  // Icon mapping for menu items
  const iconMap = {
    Dashboard: HomeIcon,
    Tasks: ClipboardDocumentListIcon,
    Customers: UserGroupIcon,
    Clients: UserGroupIcon,
    Associates: UserIcon,
    "Work Orders": WrenchScrewdriverIcon,
    "My Service Requests": WrenchScrewdriverIcon,
    "My Work Orders": WrenchScrewdriverIcon,
    "Skill Sets": AcademicCapIcon,
    Incidents: FireIcon,
    "Job History": ChartBarIcon,
    Comments: ChatBubbleLeftRightIcon,
    Financials: CreditCardIcon,
    "My Financials": CreditCardIcon,
    Reports: DocumentChartBarIcon,
    Staff: UsersIcon,
    Settings: Cog6ToothIcon,
    "My Associates": UserIcon,
    "My Clients": UserGroupIcon,
    "Find Work": MagnifyingGlassIcon,
    "My Documents": DocumentTextIcon,
    "My Advisor": UsersIcon,
    "Learning & Goals": StarIcon,
    Help: QuestionMarkCircleIcon,
    "My Profile": UserCircleIcon,
    "Sign Off": ArrowRightOnRectangleIcon,
  };

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
    const userRole = currentUser.role || currentUser.roleId;
    if (
      [EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID, FRONTLINE_ROLE_ID].includes(
        userRole,
      )
    ) {
      sections.push({
        label: "Staff",
        items: [
          { path: "/admin/dashboard", label: "Dashboard" },
          {
            path: "/admin/tasks",
            label: "Tasks",
            badge: taskItemActiveCount > 0 ? taskItemActiveCount : null,
          },
          { path: "/admin/customers", label: "Clients" },
          { path: "/admin/associates", label: "Associates" },
          { path: "/admin/orders", label: "Work Orders" },
          { path: "/admin/skill-sets", label: "Skill Sets" },
          { path: "/admin/incidents", label: "Incidents" },
          { path: "/admin/job-history", label: "Job History" },
          { path: "/admin/all-comments", label: "Comments" },
        ],
      });

      sections.push({
        label: "Administration",
        items: [
          { path: "/admin/financials", label: "Financials" },
          { path: "/admin/reports", label: "Reports" },
          { path: "/admin/staff", label: "Staff" },
          { path: "/admin/settings", label: "Settings" },
        ],
      });
    }

    // Customer menu
    if (userRole === CUSTOMER_ROLE_ID) {
      sections.push({
        label: "Member",
        items: [
          { path: "/c/dashboard", label: "Dashboard" },
          { path: "/c/orders", label: "My Service Requests" },
          { path: "/c/financials", label: "My Financials" },
          { path: "/c/associates", label: "My Associates" },
        ],
      });
    }

    // Associate menu
    if (userRole === ASSOCIATE_ROLE_ID) {
      sections.push({
        label: "Associate",
        items: [
          { path: "/a/dashboard", label: "Dashboard" },
          { path: "/a/orders", label: "My Work Orders" },
          { path: "/a/financials", label: "My Financials" },
          { path: "/a/clients", label: "My Clients" },
        ],
      });
    }

    // Job Seeker menu
    if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
      sections.push({
        label: "Job Seeker",
        items: [
          { path: "/js/dashboard", label: "Dashboard" },
          { path: "/js/find-work", label: "Find Work" },
          { path: "/js/documents", label: "My Documents" },
          { path: "/js/advisor", label: "My Advisor" },
          { path: "/js/learning", label: "Learning & Goals" },
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

  // Determine sidebar width based on state
  const sidebarWidth = isMobile ? "w-64" : isCollapsed ? "w-16" : "w-64";

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed top-[60px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[999]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <style jsx>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div
        className={`
        fixed top-[60px] left-0 ${sidebarWidth} h-[calc(100vh-60px)] bg-gray-900 text-gray-200
        transform transition-all duration-300 ease-in-out z-[1000]
        overflow-y-auto overflow-x-hidden custom-scrollbar
        ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }
      `}
      >
        {/* Hamburger Section - Minimal padding */}
        <div className="sticky top-0 bg-gray-900 z-10 p-1 border-b border-gray-700 mb-3">
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded hover:bg-gray-800 transition-colors w-full flex justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobile ? (
              <XMarkIcon className="h-5 w-5 text-white" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Menu Content */}
        <div className={`px-3 py-2 ${isCollapsed && !isMobile ? "px-2" : ""}`}>
          {/* Menu Sections */}
          {menuSections.map((section, index) => (
            <div key={index} className="mb-5">
              {/* Section label - hide when collapsed */}
              {(!isCollapsed || isMobile) && (
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-3">
                  {section.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item, idx) => {
                  const Icon = iconMap[item.label] || HomeIcon;
                  const isActive = isActivePath(item.path);

                  return (
                    <li key={idx}>
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        title={isCollapsed && !isMobile ? item.label : ""}
                        className={`
                          relative flex items-center ${!isCollapsed || isMobile ? "justify-between" : "justify-center"}
                          ${!isCollapsed || isMobile ? "px-3" : "px-2"} py-1.5 rounded-md text-sm
                          transition-colors duration-200
                          ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <div
                          className={`flex items-center ${!isCollapsed || isMobile ? "" : "justify-center w-full"}`}
                        >
                          <Icon
                            className={`h-5 w-5 ${!isCollapsed || isMobile ? "mr-3" : ""} flex-shrink-0`}
                          />
                          {(!isCollapsed || isMobile) && (
                            <span>{item.label}</span>
                          )}
                        </div>
                        {item.badge && (!isCollapsed || isMobile) && (
                          <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                            ({item.badge})
                          </span>
                        )}
                        {/* Show badge as dot when collapsed */}
                        {item.badge && isCollapsed && !isMobile && (
                          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-green-600" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Account Menu */}
          <div className="mb-5">
            {(!isCollapsed || isMobile) && (
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-3">
                Account
              </div>
            )}
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/help"
                  onClick={handleLinkClick}
                  title={isCollapsed && !isMobile ? "Help" : ""}
                  className={`
                    flex items-center ${!isCollapsed || isMobile ? "px-3" : "px-2 justify-center"} py-1.5 rounded-md text-sm
                    transition-colors duration-200
                    ${
                      isActivePath("/help")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <QuestionMarkCircleIcon
                    className={`h-5 w-5 ${!isCollapsed || isMobile ? "mr-3" : ""} flex-shrink-0`}
                  />
                  {(!isCollapsed || isMobile) && <span>Help</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={handleLinkClick}
                  title={isCollapsed && !isMobile ? "My Profile" : ""}
                  className={`
                    flex items-center ${!isCollapsed || isMobile ? "px-3" : "px-2 justify-center"} py-1.5 rounded-md text-sm
                    transition-colors duration-200
                    ${
                      isActivePath("/account")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <UserCircleIcon
                    className={`h-5 w-5 ${!isCollapsed || isMobile ? "mr-3" : ""} flex-shrink-0`}
                  />
                  {(!isCollapsed || isMobile) && <span>My Profile</span>}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowLogoutWarning(true)}
                  title={isCollapsed && !isMobile ? "Sign Off" : ""}
                  className={`
                    flex items-center w-full text-left ${!isCollapsed || isMobile ? "px-3" : "px-2 justify-center"} py-1.5 rounded-md text-sm
                    text-gray-300 hover:bg-gray-800 hover:text-white
                    transition-colors duration-200`}
                >
                  <ArrowRightOnRectangleIcon
                    className={`h-5 w-5 ${!isCollapsed || isMobile ? "mr-3" : ""} flex-shrink-0`}
                  />
                  {(!isCollapsed || isMobile) && <span>Sign Off</span>}
                </button>
              </li>
            </ul>
          </div>
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

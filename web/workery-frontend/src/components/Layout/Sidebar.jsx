// File Path: web/workery-frontend/src/components/Layout/Sidebar.jsx
// Enhanced Responsive Sidebar Component with UIX Theme Support

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  MagnifyingGlassIcon,
  DocumentTextIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../UIX";

function Sidebar({
  isOpen = false,
  onClose,
  taskItemActiveCount = 0,
  sidebarCollapsed = false,
  isMobile = false,
  isTablet = false,
}) {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const location = useLocation();
  const { getThemeClasses } = useUIXTheme();

  const themeClasses = useMemo(
    () => ({
      activeState: getThemeClasses("pagination-active"),
      badgeColor: getThemeClasses("pagination-active"),
      sidebarBg: getThemeClasses("sidebar-bg"),
      sidebarText: getThemeClasses("sidebar-text"),
      sidebarTextMuted: getThemeClasses("sidebar-text-muted"),
      sidebarHover: getThemeClasses("sidebar-hover"),
    }),
    [getThemeClasses],
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMobileOrTablet = isMobile || isTablet;

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle navigation and close sidebar on mobile
  const handleLinkClick = useCallback(
    (path) => {
      navigate(path);

      if (isMobileOrTablet && onClose) {
        setTimeout(() => {
          onClose();
        }, 50);
      }
    },
    [navigate, isMobileOrTablet, onClose],
  );

  // Fetch current user
  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      if (!authManager.isAuthenticated()) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const profile = await accountManager.getAccountDetail(onUnauthorized);
        if (mounted) {
          setCurrentUser(profile);
          setIsLoading(false);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch current user:", error);
        }
        if (mounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, [accountManager, authManager, onUnauthorized]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (!isMobileOrTablet || !isOpen) return;

    const scrollY = window.scrollY;
    const currentPath = location.pathname;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      if (location.pathname === currentPath) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isMobileOrTablet, isOpen, location.pathname]);

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
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Icon mapping for Workery menu items
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
  };

  // Get menu sections based on user role - Workery specific
  const getMenuSections = () => {
    const sections = [];
    const roleValue = currentUser.role || currentUser.roleId;
    const userRole = typeof roleValue === "string" ? parseInt(roleValue, 10) : roleValue;

    // Executive and Management - Full access
    if ([EXECUTIVE_ROLE_ID, MANAGEMENT_ROLE_ID].includes(userRole)) {
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

    // Frontline Staff - Limited access (no Administration section)
    else if (userRole === FRONTLINE_ROLE_ID) {
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
    }

    // Customer menu
    else if (userRole === CUSTOMER_ROLE_ID) {
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
    else if (userRole === ASSOCIATE_ROLE_ID) {
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
    else if (userRole === ASSOCIATE_JOB_SEEKER_ROLE_ID) {
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

  // Determine sidebar width
  const getSidebarWidth = () => {
    if (isMobile) return "w-full";
    if (isTablet) return sidebarCollapsed ? "w-16" : "w-56";
    return sidebarCollapsed ? "w-16" : "w-64";
  };

  const shouldShowLabels = !sidebarCollapsed || isMobileOrTablet;

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isMobileOrTablet && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
          style={{ top: "60px", touchAction: "none" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed left-0 top-[60px] h-[calc(100vh-60px)]
          ${themeClasses.sidebarBg} ${themeClasses.sidebarText}
          ${getSidebarWidth()}
          transition-transform duration-300 ease-in-out
          overflow-y-auto overflow-x-hidden
          z-[1000]
          ${
            isMobileOrTablet
              ? isOpen
                ? "transform translate-x-0"
                : "transform -translate-x-full"
              : "transform translate-x-0"
          }
        `}
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {/* Sidebar Content */}
        <div className={isMobile ? "px-4 py-4" : "px-3 py-3"}>
          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={sectionIndex < menuSections.length - 1 ? "mb-6" : ""}
            >
              {/* Section Label */}
              {shouldShowLabels && (
                <div className={`text-xs font-semibold ${themeClasses.sidebarTextMuted} uppercase tracking-wider mb-2 px-3`}>
                  {section.label}
                </div>
              )}

              {/* Menu Items */}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = iconMap[item.label] || HomeIcon;
                  const isActive = isActivePath(item.path);

                  return (
                    <li key={itemIndex}>
                      <button
                        onClick={() => handleLinkClick(item.path)}
                        className={`
                          w-full
                          relative flex items-center
                          ${shouldShowLabels ? "justify-between" : "justify-center"}
                          ${isMobile ? "px-4 py-3" : sidebarCollapsed && !isTablet ? "px-2 py-2" : "px-3 py-2"}
                          rounded-md
                          ${isMobile ? "text-base" : "text-sm"}
                          transition-all duration-200
                          cursor-pointer
                          ${
                            isActive
                              ? themeClasses.activeState
                              : `${themeClasses.sidebarText} ${themeClasses.sidebarHover}`
                          }
                        `}
                        title={!shouldShowLabels ? item.label : undefined}
                      >
                        <div
                          className={`flex items-center ${shouldShowLabels ? "" : "justify-center w-full"}`}
                        >
                          <Icon
                            className={`
                              ${isMobile ? "h-6 w-6" : "h-5 w-5"}
                              ${shouldShowLabels ? "mr-3" : ""}
                              flex-shrink-0
                            `}
                          />
                          {shouldShowLabels && (
                            <span className="text-left">{item.label}</span>
                          )}
                        </div>

                        {/* Badge */}
                        {item.badge && shouldShowLabels && (
                          <span className={`${themeClasses.badgeColor} text-xs rounded-full px-2 py-0.5 font-bold`}>
                            {item.badge}
                          </span>
                        )}

                        {/* Badge Dot for collapsed state */}
                        {item.badge && !shouldShowLabels && (
                          <span className={`absolute top-1 right-1 h-2 w-2 ${themeClasses.badgeColor} rounded-full`} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Sidebar;

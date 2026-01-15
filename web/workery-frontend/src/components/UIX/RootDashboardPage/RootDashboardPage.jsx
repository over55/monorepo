// File: src/components/UIX/RootDashboardPage/RootDashboardPage.jsx
// UIX Mobile Optimizations Applied
// Reusable Root Dashboard Page Component

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../index";
import {
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

/**
 * RootDashboardPage - Reusable Root Dashboard Page Component
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.authManager - Auth manager with isAuthenticated() and logout() methods
 * @param {React.Component} config.icon - Main icon for dashboard
 * @param {React.Component} config.headerIcon - Icon for header (solid version)
 * @param {string} config.title - Dashboard title
 * @param {string} config.heroTitle - Hero section title
 * @param {string} config.heroDescription - Hero section description
 * @param {Array} config.primaryActions - Primary action buttons [{label, to, icon, variant, className}]
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items
 * @param {Array} config.statusItems - System status items [{label, status, variant}]
 * @param {string} config.loginPath - Path to login page
 * @param {string} config.backgroundGradient - Optional custom background gradient class
 */
const RootDashboardPage = memo(({ config }) => {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(null);

  const handleLogout = useCallback(async () => {
    try {
      if (import.meta.env.DEV) {
        console.log("RootDashboardPage: Initiating logout...");
      }
      await config.authManager.logout();
      if (import.meta.env.DEV) {
        console.log("RootDashboardPage: Logout successful, redirecting to login");
      }
      navigate(config.loginPath || "/login");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("RootDashboardPage: Logout failed:", error);
      }
      navigate(config.loginPath || "/login");
    }
  }, [config.authManager, config.loginPath, navigate]);

  const handleMouseEnter = useCallback((index) => {
    setIsHovered(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      const authenticated = config.authManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        if (import.meta.env.DEV) {
          console.log("RootDashboardPage: User not authenticated, redirecting to login");
        }
        navigate(`${config.loginPath || "/login"}?unauthorized=true`);
      } else {
        if (import.meta.env.DEV) {
          console.log("RootDashboardPage: User authenticated, loading dashboard");
        }
      }

      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [config.authManager, config.loginPath, navigate]);

  // Memoized theme classes
  const themeClasses = useMemo(
    () => ({
      backgroundGradient: getThemeClasses("bg-gradient-secondary"),
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      linkPrimary: getThemeClasses("link-primary"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      cardBorder: getThemeClasses("card-border"),
      borderPrimary: getThemeClasses("border-primary"),
      // Hero section classes
      heroBg: getThemeClasses("hero-bg"),
      heroText: getThemeClasses("hero-text"),
      heroTextSecondary: getThemeClasses("hero-text-secondary"),
      heroIcon: getThemeClasses("hero-icon"),
      heroIconBg: getThemeClasses("hero-icon-bg"),
      heroButtonPrimary: getThemeClasses("hero-button-primary"),
      heroButtonSecondary: getThemeClasses("hero-button-secondary"),
      heroStatusSuccess: getThemeClasses("hero-status-success"),
      heroStatusWarning: getThemeClasses("hero-status-warning"),
      heroStatusError: getThemeClasses("hero-status-error"),
    }),
    [getThemeClasses],
  );

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (config.breadcrumbItems) {
      return config.breadcrumbItems;
    }
    return [
      {
        label: "Home",
        href: "/",
        icon: HomeIcon,
      },
      {
        label: config.title || "Dashboard",
        icon: config.icon,
      },
    ];
  }, [config.breadcrumbItems, config.title, config.icon]);

  if (isLoading) {
    return (
      <Card padding="p-0" className={`min-h-screen flex items-center justify-center ${themeClasses.bgGradientPrimary} px-4 border-0 shadow-none`}>
        <Loading size="lg" text="Loading Dashboard..." />
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card padding="p-4" className={`min-h-screen flex items-center justify-center ${themeClasses.bgGradientPrimary} border-0 shadow-none`}>
        <Card className="max-w-md w-full">
          <Alert type="error">
            <Badge variant="default" size="lg" className="!bg-transparent !text-inherit font-bold">
              Unauthorized Access
            </Badge>
            <Badge variant="default" size="md" className="!bg-transparent !text-inherit mt-1 block">
              Please{" "}
              <Link to={config.loginPath || "/login"} className={`font-medium underline ${themeClasses.linkPrimary}`}>
                login
              </Link>{" "}
              to access this page.
            </Badge>
          </Alert>
        </Card>
      </Card>
    );
  }

  const HeaderIcon = config.headerIcon || config.icon;

  return (
    <Card
      padding="p-0"
      className={`min-h-dvh ${themeClasses.bgGradientPrimary} border-0 shadow-none`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <Card padding="p-0" className={`${themeClasses.bgCard} shadow-sm border-x-0 border-t-0 border-b ${themeClasses.cardBorder} rounded-none`}>
        <Card padding="p-0" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-0 shadow-none bg-transparent">
          <Card padding="p-0" className="flex justify-between items-center py-3 sm:py-4 border-0 shadow-none bg-transparent">
            <Card padding="p-0" className="flex items-center border-0 shadow-none bg-transparent">
              <HeaderIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${themeClasses.linkPrimary}`} />
              <Badge variant="default" size="lg" className={`!bg-transparent ml-2 sm:ml-3 text-lg sm:text-xl font-semibold ${themeClasses.textPrimary}`}>
                {config.title || "Dashboard"}
              </Badge>
            </Card>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={ArrowRightOnRectangleIcon}
            >
              Logout
            </Button>
          </Card>
        </Card>
      </Card>

      {/* Main Content */}
      <Card padding="p-0" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-0 shadow-none bg-transparent">
        {/* Breadcrumb */}
        <Card padding="p-0" className="mb-4 sm:mb-6 border-0 shadow-none bg-transparent">
          <Breadcrumb items={breadcrumbItems} />
        </Card>

        {/* Hero Card */}
        <Card className={`overflow-hidden border-2 ${themeClasses.cardBorder}`}>
          <Card padding="p-6 sm:p-8 md:p-10 lg:p-12" className={`${themeClasses.heroBg} text-center border-0 shadow-none rounded-none`}>
            {/* Icon */}
            <Card padding="p-0" className="flex justify-center mb-4 sm:mb-6 border-0 shadow-none !bg-transparent">
              <Card padding="p-3 sm:p-4" className={`${themeClasses.heroIconBg} backdrop-blur-sm rounded-xl sm:rounded-2xl border-0 shadow-none`}>
                <config.icon className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 ${themeClasses.heroIcon}`} />
              </Card>
            </Card>

            {/* Title */}
            <Badge variant="default" size="lg" className={`!bg-transparent text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 block ${themeClasses.heroText}`}>
              {config.heroTitle || "Management Dashboard"}
            </Badge>

            {/* Description */}
            <Badge variant="default" size="md" className={`!bg-transparent text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2 block ${themeClasses.heroTextSecondary}`}>
              {config.heroDescription || "Manage your resources from this centralized dashboard."}
            </Badge>

            {/* CTA Buttons */}
            {config.primaryActions && config.primaryActions.length > 0 && (
              <Card padding="p-0" className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center border-0 shadow-none !bg-transparent">
                {config.primaryActions.map((action, index) => (
                  <Link key={action.label} to={action.to}>
                    <Button
                      variant={action.variant || (index === 0 ? "secondary" : "outline")}
                      size="lg"
                      icon={action.icon}
                      className={action.className || (index === 0
                        ? `${themeClasses.heroButtonPrimary} transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${isHovered === index ? "scale-105 shadow-xl" : ""}`
                        : `${themeClasses.heroButtonSecondary} transform transition-all duration-200 hover:scale-105 hover:shadow-xl`
                      )}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </Card>
            )}
          </Card>

          {/* System Status */}
          {config.statusItems && config.statusItems.length > 0 && (
            <Card padding="p-4 sm:p-5 md:p-6" className={`${themeClasses.bgCard} border-t ${themeClasses.cardBorder} rounded-none shadow-none border-x-0 border-b-0`}>
              <Card padding="p-0" className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center border-0 shadow-none bg-transparent">
                <Badge variant="default" size="md" className={`!bg-transparent text-xs sm:text-sm font-medium ${themeClasses.textPrimary}`}>
                  System Status
                </Badge>
                {config.statusItems.map((item, index) => {
                  // Map variant to hero status class
                  const variant = item.variant || "success";
                  const statusClass = variant === "success" ? themeClasses.heroStatusSuccess
                    : variant === "warning" ? themeClasses.heroStatusWarning
                    : variant === "error" ? themeClasses.heroStatusError
                    : themeClasses.heroStatusSuccess;

                  return (
                    <Card key={index} padding="p-0" className="flex items-center justify-between sm:justify-center gap-2 border-0 shadow-none bg-transparent">
                      <Badge variant="default" size="sm" className={`!bg-transparent text-xs sm:text-sm ${themeClasses.textPrimary}`}>
                        {item.label}
                      </Badge>
                      <Badge variant="default" size="sm" className={statusClass}>{item.status}</Badge>
                    </Card>
                  );
                })}
              </Card>
            </Card>
          )}
        </Card>
      </Card>
    </Card>
  );
});

RootDashboardPage.displayName = "RootDashboardPage";

// Wrapped component with theme provider
function RootDashboardPageWithProvider(props) {
  return (
    <UIXThemeProvider>
      <RootDashboardPage {...props} />
    </UIXThemeProvider>
  );
}

export default RootDashboardPageWithProvider;

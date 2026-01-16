// File Path: web/workery-frontend/src/pages/Admin/Account/More/Page.jsx
// @uix-page: AccountMorePage
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button, ActionCard)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bars3Icon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  ActionCard,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  getRoleRedirectPath,
} from "../../../../constants/Roles";

/**
 * Account More Page Component
 * Displays additional account management options like password change, 2FA, etc.
 */
function AccountMorePage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Fetch user data on mount
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Check authentication
        if (!authManager.isAuthenticated()) {
          navigate("/login");
          return;
        }

        // Fetch account details
        const userData = await accountManager.getAccountDetail(onUnauthorized);

        if (mounted && userData) {
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Error fetching account details:", err);
        if (mounted) {
          setError(
            err.message || "Failed to load account details. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [accountManager, authManager, navigate, onUnauthorized]);

  // Generate dashboard link based on user role
  const getDashboardLink = useCallback(() => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser]);

  // Menu options configuration
  const actionCards = useMemo(() => [
    {
      title: "Change Password",
      subtitle: "Update your account password",
      icon: KeyIcon,
      path: "/admin/account/more/change-password",
      bgColor: "bg-blue-600",
      hoverBgColor: "hover:bg-blue-700",
    },
    {
      title: "Two-Factor Authentication",
      subtitle: "Manage your 2FA security settings",
      icon: ShieldCheckIcon,
      path: "/admin/account/more/2fa",
      bgColor: "bg-green-600",
      hoverBgColor: "hover:bg-green-700",
    },
  ], []);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: getDashboardLink(),
      icon: Bars3Icon,
    },
    {
      label: "Profile",
      to: "/admin/account",
      icon: UserCircleIcon,
    },
    {
      label: "More Options",
      icon: EllipsisHorizontalIcon,
      isActive: true,
    },
  ], [getDashboardLink]);

  // Tab items
  const tabItems = useMemo(() => [
    { label: "Detail", to: "/admin/account" },
    { label: "More", to: "/admin/account/more", icon: EllipsisHorizontalIcon, isActive: true },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading account settings...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  // No user state
  if (!currentUser) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No user data available
          </h3>
          <p className="text-gray-500 mb-6">
            Please log in to access account settings
          </p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserCircleIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Profile Settings
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
          Manage additional account settings and security options
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-white rounded-lg shadow p-1">
          <Link
            to="/admin/account"
            className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Detail
          </Link>
          <span className="px-4 py-2 rounded-md bg-blue-500 text-white font-medium flex items-center">
            More
            <EllipsisHorizontalIcon className="h-4 w-4 ml-2" />
          </span>
        </nav>
      </div>

      {/* Main Content Card */}
      <Card className="mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bars3Icon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
            Additional Options
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Access advanced account management features
          </p>
        </div>

        <div className="p-6">
          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionCards.map((card, index) => (
              <ActionCard
                key={index}
                title={card.title}
                subtitle={card.subtitle}
                icon={card.icon}
                path={card.path}
                bgColor={card.bgColor}
                hoverBgColor={card.hoverBgColor}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center">
        <Link to={getDashboardLink()}>
          <Button variant="secondary" icon={ArrowLeftIcon}>
            Back to Dashboard
          </Button>
        </Link>

        {/* User Info */}
        <div className="text-sm text-gray-600">
          Logged in as:{" "}
          <span className="font-medium">
            {currentUser.email || currentUser.username}
          </span>
        </div>
      </div>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AccountMorePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AccountMorePage />
    </UIXThemeProvider>
  );
}

export default AccountMorePageWithProvider;

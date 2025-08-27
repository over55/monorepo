// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bars3Icon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
  EmptyState,
} from "../../../../components/UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
  CUSTOMER_ROLE_ID,
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

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unauthorized callback
  const onUnauthorized = () => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  };

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
  }, []);

  // Generate dashboard link based on user role
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Menu options configuration
  const menuOptions = [
    {
      id: "change-password",
      title: "Change Password",
      subtitle: "Update your account password",
      icon: KeyIcon,
      path: "/admin/account/more/change-password",
      color: "blue",
    },
    {
      id: "2fa",
      title: "Two-Factor Authentication",
      subtitle: "Manage your 2FA security settings",
      icon: ShieldCheckIcon,
      path: "/admin/account/more/2fa",
      color: "green",
    },
  ];

  // Render menu option card (desktop)
  const renderMenuCard = (option) => (
    <Link
      key={option.id}
      to={option.path}
      className="block transform transition-all duration-200 hover:scale-105"
    >
      <div
        className={`
        bg-${option.color}-50 border-2 border-${option.color}-100
        rounded-lg p-6 text-center
        hover:bg-${option.color}-100 hover:border-${option.color}-200
        transition-colors duration-200
      `}
      >
        <option.icon
          className={`
          h-12 w-12 mx-auto mb-4
          text-${option.color}-600
        `}
        />
        <h3 className={`text-lg font-semibold text-${option.color}-900 mb-2`}>
          {option.title}
        </h3>
        <p className={`text-sm text-${option.color}-700`}>{option.subtitle}</p>
      </div>
    </Link>
  );

  // Render menu option row (mobile)
  const renderMenuRow = (option) => (
    <Link
      key={option.id}
      to={option.path}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <option.icon className="h-5 w-5 text-gray-600" />
        <div>
          <div className="font-medium text-gray-900">{option.title}</div>
          <div className="text-sm text-gray-500">{option.subtitle}</div>
        </div>
      </div>
      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </Link>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading account settings..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" dismissible={false}>
          {error}
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // No user state
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={UserCircleIcon}
          title="No user data available"
          description="Please log in to access account settings"
          action={
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          }
        />
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: getDashboardLink(),
      icon: Bars3Icon,
    },
    {
      label: "Profile",
      href: "/admin/account",
      icon: UserCircleIcon,
    },
    {
      label: "More Options",
      icon: EllipsisHorizontalIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCircleIcon className="h-8 w-8 mr-3" />
            Profile Settings
          </h1>
          <p className="mt-2 text-gray-600">
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Bars3Icon className="h-5 w-5 mr-2" />
              Additional Options
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Access advanced account management features
            </p>
          </div>

          {/* Desktop View - Grid Layout */}
          {!isMobile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuOptions.map(renderMenuCard)}
            </div>
          ) : (
            // Mobile View - List Layout
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {menuOptions.map(renderMenuRow)}
            </div>
          )}
        </Card>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(getDashboardLink())}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* User Info */}
          <div className="text-sm text-gray-600">
            Logged in as:{" "}
            <span className="font-medium">
              {currentUser.email || currentUser.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountMorePage;

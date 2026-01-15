// File Path: web/workery-frontend/src/pages/Admin/Account/More/2FA/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button, Modal)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useAccountManager,
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  Modal,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  getRoleRedirectPath,
} from "../../../../../constants/Roles";

/**
 * Account Two-Factor Authentication Page Component
 * Manages 2FA settings - enable/disable functionality
 */
function AccountTwoFactorAuthenticationPage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const twoFactorAuthManager = useTwoFactorAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

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

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Generate dashboard link based on user role
  const getDashboardLink = useCallback(() => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser]);

  // Handle disable 2FA
  const handleDisable2FA = useCallback(async () => {
    try {
      setIsDisabling(true);
      setError("");

      // Call API to disable 2FA
      const response = await twoFactorAuthManager.disableOTP(onUnauthorized);

      // Update current user state
      setCurrentUser(response);

      // Show success message
      setSuccessMessage(
        "Two-factor authentication has been disabled successfully.",
      );
      setShowDisableModal(false);
    } catch (err) {
      console.error("Error disabling 2FA:", err);
      setError(
        err.message || err.error || "Failed to disable 2FA. Please try again.",
      );
    } finally {
      setIsDisabling(false);
    }
  }, [twoFactorAuthManager, onUnauthorized]);

  // Handle enable 2FA navigation
  const handleEnable2FA = useCallback(() => {
    navigate("/admin/account/2fa/setup/step-1");
  }, [navigate]);

  // Check if 2FA is enabled
  const is2FAEnabled = useMemo(() => {
    return currentUser?.otpEnabled === true || currentUser?.otpEnabled === 1;
  }, [currentUser]);

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
      label: "Two-Factor Authentication",
      icon: ShieldCheckIcon,
      isActive: true,
    },
  ], [getDashboardLink]);

  // Loading state
  if (isLoading) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading 2FA settings...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Error state (full page)
  if (error && !currentUser) {
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
            Please log in to access 2FA settings
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
          Profile
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
          Manage your two-factor authentication settings
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert
          type="success"
          className="mb-6"
          dismissible
          onDismiss={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert type="error" className="mb-6" dismissible onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

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
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ShieldCheckIcon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
              Two-Factor Authentication Status
            </h2>
          </div>
          <div>
            {is2FAEnabled ? (
              <Button
                variant="danger"
                onClick={() => setShowDisableModal(true)}
                disabled={currentUser.status === 2}
                icon={LockOpenIcon}
              >
                Disable
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleEnable2FA}
                disabled={currentUser.status === 2}
                icon={LockClosedIcon}
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Status Display */}
          {is2FAEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-green-900 mb-2">
                2FA Enabled
              </h3>
              <p className="text-green-700 max-w-md mx-auto">
                Your account is secure with two-factor authentication. You will
                be asked to provide a 2FA code from your authenticator app when
                you sign in.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <XCircleIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-yellow-900 mb-2">
                2FA Disabled
              </h3>
              <p className="text-yellow-700 max-w-md mx-auto mb-6">
                Your account does not have two-factor authentication enabled. We
                strongly recommend enabling 2FA to secure your account.
              </p>
              <Button
                variant="primary"
                onClick={handleEnable2FA}
                icon={ShieldCheckIcon}
                iconRight={ArrowRightIcon}
              >
                Enable 2FA Now
              </Button>
            </div>
          )}

          {/* Additional Information */}
          <Alert type="info" className="mt-8">
            <strong>What is Two-Factor Authentication?</strong>
            <p className="mt-2">
              Two-factor authentication (2FA) adds an extra layer of security to
              your account. In addition to your password, you'll need to enter a
              code from your mobile device to sign in. This helps protect your
              account even if your password is compromised.
            </p>
          </Alert>
        </div>
      </Card>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center">
        <Link to={getDashboardLink()}>
          <Button variant="secondary" icon={ArrowLeftIcon}>
            Back to Dashboard
          </Button>
        </Link>

        {/* Secondary Action Button */}
        {is2FAEnabled ? (
          <Button
            variant="danger"
            onClick={() => setShowDisableModal(true)}
            disabled={currentUser.status === 2}
            icon={LockOpenIcon}
          >
            Disable 2FA
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleEnable2FA}
            disabled={currentUser.status === 2}
            icon={LockClosedIcon}
          >
            Enable 2FA
          </Button>
        )}
      </div>

      {/* Disable 2FA Confirmation Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Disable Two-Factor Authentication?"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-700">
                You are about to{" "}
                <strong>disable two-factor authentication</strong> for your
                account. This will make your account less secure.
              </p>
              <p className="text-gray-700 mt-2">
                Without 2FA enabled, you will only need your password to sign
                in, which increases the risk if your password is compromised.
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Are you sure you want to continue?</strong>
              </p>
            </div>
          </div>

          {/* Show error in modal if any */}
          {error && (
            <Alert type="error">
              {error}
            </Alert>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => setShowDisableModal(false)}
            disabled={isDisabling}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDisable2FA}
            disabled={isDisabling}
            icon={isDisabling ? null : LockOpenIcon}
          >
            {isDisabling ? (
              <span className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                Disabling...
              </span>
            ) : (
              "Confirm Disable"
            )}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AccountTwoFactorAuthenticationPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AccountTwoFactorAuthenticationPage />
    </UIXThemeProvider>
  );
}

export default AccountTwoFactorAuthenticationPageWithProvider;

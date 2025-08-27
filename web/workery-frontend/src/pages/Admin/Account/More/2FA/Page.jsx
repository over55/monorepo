// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/2FA/Page.jsx

import React, { useState, useEffect } from "react";
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
  Loading,
  Breadcrumb,
  Button,
  Modal,
  EmptyState,
} from "../../../../../components/UI";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
  CUSTOMER_ROLE_ID,
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

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

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
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Handle disable 2FA
  const handleDisable2FA = async () => {
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
  };

  // Handle enable 2FA navigation
  const handleEnable2FA = () => {
    navigate("/admin/account/2fa/setup/step-1");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading 2FA settings..." />
      </div>
    );
  }

  // Error state (full page)
  if (error && !currentUser) {
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
          description="Please log in to access 2FA settings"
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
      label: "Two-Factor Authentication",
      icon: ShieldCheckIcon,
    },
  ];

  // Check if 2FA is enabled
  const is2FAEnabled =
    currentUser.otpEnabled === true || currentUser.otpEnabled === 1;

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
            Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your two-factor authentication settings
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <Alert
              type="success"
              dismissible
              onDismiss={() => setSuccessMessage("")}
            >
              {successMessage}
            </Alert>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <Alert type="error" dismissible onDismiss={() => setError("")}>
              {error}
            </Alert>
          </div>
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Two-Factor Authentication Status
              </h2>
            </div>
            <div>
              {is2FAEnabled ? (
                <Button
                  variant="danger"
                  onClick={() => setShowDisableModal(true)}
                  disabled={currentUser.status === 2}
                  className="flex items-center"
                >
                  <LockOpenIcon className="h-4 w-4 mr-2" />
                  Disable
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleEnable2FA}
                  disabled={currentUser.status === 2}
                  className="flex items-center"
                >
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              )}
            </div>
          </div>

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
                className="inline-flex items-center"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Enable 2FA Now
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              What is Two-Factor Authentication?
            </h4>
            <p className="text-sm text-blue-700">
              Two-factor authentication (2FA) adds an extra layer of security to
              your account. In addition to your password, you'll need to enter a
              code from your mobile device to sign in. This helps protect your
              account even if your password is compromised.
            </p>
          </div>
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

          {/* Secondary Action Button */}
          {is2FAEnabled ? (
            <Button
              variant="danger"
              onClick={() => setShowDisableModal(true)}
              disabled={currentUser.status === 2}
              className="flex items-center"
            >
              <LockOpenIcon className="h-4 w-4 mr-2" />
              Disable 2FA
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleEnable2FA}
              disabled={currentUser.status === 2}
              className="flex items-center"
            >
              <LockClosedIcon className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          )}
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Disable Two-Factor Authentication?"
        footer={
          <div className="flex justify-end space-x-3">
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
              className="flex items-center"
            >
              {isDisabling ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Disabling...
                </>
              ) : (
                <>
                  <LockOpenIcon className="h-4 w-4 mr-2" />
                  Confirm Disable
                </>
              )}
            </Button>
          </div>
        }
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
            <Alert type="error" dismissible={false}>
              {error}
            </Alert>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AccountTwoFactorAuthenticationPage;

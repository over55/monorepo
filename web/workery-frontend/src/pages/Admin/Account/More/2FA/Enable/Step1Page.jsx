// File Path: web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step1Page.jsx
// @uix-page: Account2FAEnableStep1
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserCircleIcon,
  Bars3Icon,
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useAccountManager,
  useAuthManager,
  useTwoFactorAuthManager,
} from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import { getRoleRedirectPath } from "../../../../../../constants/Roles";

/**
 * Two-Factor Authentication Setup - Step 1
 * Introduction and authenticator app download instructions
 */
function AccountTwoFactorAuthenticationEnableStep1Page() {
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
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [error, setError] = useState("");

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Fetch user data on mount
  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
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

          // Check if OTP response already exists in session
          const existingOTP = sessionStorage.getItem("WORKERY_2FA_SETUP_OTP");

          // If no OTP exists, generate one now
          if (!existingOTP) {
            setIsGeneratingOTP(true);
            try {
              const otpResponse =
                await twoFactorAuthManager.generateOTP(onUnauthorized);

              // Store OTP response in session storage for use across steps
              sessionStorage.setItem(
                "WORKERY_2FA_SETUP_OTP",
                JSON.stringify(otpResponse),
              );
            } catch (err) {
              console.error("Error generating OTP:", err);
              setError(
                err.message || "Failed to generate OTP. Please try again.",
              );
            } finally {
              setIsGeneratingOTP(false);
            }
          }
        }
      } catch (err) {
        console.error("Error initializing page:", err);
        if (mounted) {
          setError(err.message || "Failed to load page. Please try again.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
    };
  }, [accountManager, authManager, navigate, onUnauthorized, twoFactorAuthManager]);

  // Generate dashboard link
  const getDashboardLink = useCallback(() => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
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
      to: "/admin/account/more/2fa",
      icon: ShieldCheckIcon,
    },
    {
      label: "Enable 2FA",
      icon: LockClosedIcon,
      isActive: true,
    },
  ], [getDashboardLink]);

  // Loading state
  if (isLoading) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Error state
  if (error && !currentUser) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserCircleIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Profile
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary}`}>
          Two-Factor Authentication Setup
        </p>
      </div>

      {/* Main Card */}
      <Card>
        {/* Progress Indicator */}
        <div className="px-6 pt-6">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step 1 of 3</span>
              <span>33%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: "33%" }}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-8">
            Setup Two-Factor Authentication
          </h2>

          {/* Error Alert */}
          {error && (
            <Alert type="error" className="mb-6" dismissible onDismiss={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Introduction */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 mb-4">
              To ensure your account stays secure, you need to sign in using{" "}
              <strong>two-factor authentication (2FA)</strong>. The following
              wizard will help you get set up with 2FA.
            </p>

            <Alert type="info" className="mb-6">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Recommended Setup</h3>
                  <p className="mb-2">
                    To make initial 2FA setup easier, we encourage you to:
                  </p>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <ComputerDesktopIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Login on a desktop device</span>
                    </li>
                    <li className="flex items-start">
                      <DevicePhoneMobileIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Use your mobile phone to scan the QR code and complete setup
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Alert>

            <p className="text-gray-700 mb-4">
              To begin, please download any of the following applications for
              your mobile device:
            </p>
          </div>

          {/* Authenticator Apps */}
          <div className="space-y-4 mb-8">
            {/* Apple 2FA */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Apple 2FA</h3>
              <p className="text-gray-600 mb-3">
                All iOS and Mac devices with a{" "}
                <strong>Safari Web Browser</strong> come with built-in 2FA
                verification services. Sign in with your <em>Apple ID</em>
                in Safari and you can take advantage of this service.
              </p>
            </div>

            {/* Google Authenticator */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">
                Google Authenticator
              </h3>
              <p className="text-gray-600 mb-3">
                This 2FA app is created by <strong>Google, Inc.</strong>
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Download for iOS:</span>
                  <a
                    href="https://apps.apple.com/ca/app/google-authenticator/id388497605"
                    target="_blank"
                    rel="noreferrer"
                    className={`${themeClasses.linkPrimary} flex items-center`}
                  >
                    Visit App Store
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">
                    Download for Android:
                  </span>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pli=1"
                    target="_blank"
                    rel="noreferrer"
                    className={`${themeClasses.linkPrimary} flex items-center`}
                  >
                    Visit Google Play
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Authenticator Chrome Extension */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Authenticator</h3>
              <p className="text-gray-600 mb-3">
                This 2FA app is created by <strong>authenticator.cc</strong>
              </p>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Download for Chrome:</span>
                <a
                  href="https://chromewebstore.google.com/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?pli=1"
                  target="_blank"
                  rel="noreferrer"
                  className={`${themeClasses.linkPrimary} flex items-center`}
                >
                  Visit Chrome Web Store
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t pb-6">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/account/more/2fa")}
              icon={ArrowLeftIcon}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/admin/account/2fa/setup/step-2")}
              iconRight={ArrowRightIcon}
              disabled={isGeneratingOTP}
            >
              {isGeneratingOTP ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </span>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AccountTwoFactorAuthenticationEnableStep1PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AccountTwoFactorAuthenticationEnableStep1Page />
    </UIXThemeProvider>
  );
}

export default AccountTwoFactorAuthenticationEnableStep1PageWithProvider;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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
  Loading,
  Breadcrumb,
  Button,
  ProgressBar,
} from "../../../../../../components/UI";
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

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [error, setError] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  };

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
  }, []);

  // Generate dashboard link
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Error state
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
      href: "/admin/account/more/2fa",
      icon: ShieldCheckIcon,
    },
    {
      label: "Enable 2FA",
      icon: LockClosedIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <p className="mt-2 text-gray-600">Two-Factor Authentication Setup</p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step 1 of 3</span>
              <span>33%</span>
            </div>
            <ProgressBar value={33} max={100} color="green" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-8">
            Setup Two-Factor Authentication
          </h2>

          {/* Error Alert */}
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError("")}>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Recommended Setup
              </h3>
              <p className="text-blue-800 mb-2">
                To make initial 2FA setup easier, we encourage you to:
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
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
                    className="text-blue-600 hover:text-blue-700 flex items-center"
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
                    className="text-blue-600 hover:text-blue-700 flex items-center"
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
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  Visit Chrome Web Store
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/account/more/2fa")}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/admin/account/2fa/setup/step-2")}
              className="flex items-center"
              disabled={isGeneratingOTP}
            >
              {isGeneratingOTP ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AccountTwoFactorAuthenticationEnableStep1Page;

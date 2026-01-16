// File Path: web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step2Page.jsx
// @uix-page: Account2FAEnableStep2
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserCircleIcon,
  Bars3Icon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  CheckIcon,
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
import { getAppBaseURL } from "../../../../../../services/Config/APIConfig";

/**
 * Two-Factor Authentication Setup - Step 2
 * QR Code display and manual entry information
 */
function AccountTwoFactorAuthenticationEnableStep2Page() {
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
  const [otpResponse, setOtpResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Fetch user data and OTP response on mount
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

          // Get OTP response from session storage
          const storedOTP = sessionStorage.getItem("WORKERY_2FA_SETUP_OTP");

          if (storedOTP) {
            setOtpResponse(JSON.parse(storedOTP));
          } else {
            // If no OTP exists, generate one
            try {
              const newOtpResponse =
                await twoFactorAuthManager.generateOTP(onUnauthorized);

              // Store OTP response in session storage
              sessionStorage.setItem(
                "WORKERY_2FA_SETUP_OTP",
                JSON.stringify(newOtpResponse),
              );
              setOtpResponse(newOtpResponse);
            } catch (err) {
              console.error("Error generating OTP:", err);
              setError(
                err.message || "Failed to generate OTP. Please try again.",
              );
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

  // Copy to clipboard function
  const copyToClipboard = useCallback(async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Get account name for 2FA app
  const getAccountName = useCallback(() => {
    const appDomain = getAppBaseURL().replace(/^https?:\/\//, "");
    return `${appDomain}: ${currentUser?.email || ""}`;
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
        <div className="px-6 pt-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step 2 of 3</span>
              <span>66%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: "66%" }}
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

          {/* Instructions */}
          <p className="text-gray-700 mb-8">
            With your 2FA application open, please scan the following QR code
            with your device and click next when ready.
          </p>

          {/* QR Code Section */}
          {otpResponse && otpResponse.optAuthURL && (
            <div className="flex justify-center mb-8">
              <div className="text-center">
                <div className="bg-white p-4 border-2 border-gray-300 rounded-lg inline-block">
                  <QRCodeSVG
                    value={otpResponse.optAuthURL}
                    size={250}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 flex items-center justify-center">
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Scan with your authenticator app
                </p>
              </div>
            </div>
          )}

          {/* OR Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 text-lg font-semibold">
                OR
              </span>
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Copy and paste the following values into your device:
            </p>

            <div className="space-y-4">
              {/* Account Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getAccountName()}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(getAccountName(), "account")}
                    icon={copiedField === "account" ? CheckIcon : DocumentDuplicateIcon}
                  >
                    {copiedField === "account" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Secret Key Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Key
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={otpResponse?.base32 || ""}
                    readOnly
                    rows="2"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                  />
                  <Button
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(otpResponse?.base32 || "", "key")
                    }
                    icon={copiedField === "key" ? CheckIcon : DocumentDuplicateIcon}
                  >
                    {copiedField === "key" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Type of Key Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Key
                </label>
                <input
                  type="text"
                  value="Time based"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t pb-6">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/account/2fa/setup/step-1")}
              icon={ArrowLeftIcon}
            >
              Back to Step 1
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/admin/account/2fa/setup/step-3")}
              iconRight={ArrowRightIcon}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AccountTwoFactorAuthenticationEnableStep2PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AccountTwoFactorAuthenticationEnableStep2Page />
    </UIXThemeProvider>
  );
}

export default AccountTwoFactorAuthenticationEnableStep2PageWithProvider;

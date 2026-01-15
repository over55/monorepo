// File: monorepo/web/frontend/src/components/business/views/Account2FAEnableStep2View.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
} from "../../../services/Services";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
  ProgressBar,
} from "../../UIX";
import { getRoleRedirectPath } from "../../../constants/Roles";
import { getAppBaseURL } from "../../../services/Config/APIConfig";

/**
 * Account2FAEnableStep2View - 2FA Setup Step 2: QR Code display
 *
 * @param {Object} config - Configuration object
 * @param {string} config.portalType - Portal identifier
 * @param {string} config.basePath - Base path for account routes
 * @param {string} config.twoFAPath - Path to 2FA settings
 * @param {string} config.step1Path - Path to step 1
 * @param {string} config.step3Path - Path to step 3
 * @param {string} config.otpSessionKey - Session storage key for OTP data
 * @param {Function} config.getDashboardPath - Function to get dashboard path
 */
function Account2FAEnableStep2View({ config }) {
  return (
    <UIXThemeProvider>
      <Account2FAEnableStep2ViewContent config={config} />
    </UIXThemeProvider>
  );
}

const Account2FAEnableStep2ViewContent = memo(function Account2FAEnableStep2ViewContent({
  config,
}) {
  const {
    // eslint-disable-next-line no-unused-vars
    portalType = "admin",
    basePath = "/admin/account",
    twoFAPath = "/admin/account/more/2fa",
    step1Path = "/admin/account/2fa/setup/step-1",
    step3Path = "/admin/account/2fa/setup/step-3",
    otpSessionKey = "FLASHPOINTTRAINING_2FA_SETUP_OTP",
    getDashboardPath,
  } = config || {};

  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const twoFactorAuthManager = useTwoFactorAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [otpResponse, setOtpResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      cardBorder: getThemeClasses("card-border"),
      bgPage: getThemeClasses("bg-page") || "bg-gray-50",
      bgCard: getThemeClasses("bg-card") || "bg-white",
      bgMuted: getThemeClasses("bg-muted") || "bg-gray-50",
    }),
    [getThemeClasses]
  );

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
          const storedOTP = sessionStorage.getItem(otpSessionKey);

          if (storedOTP) {
            setOtpResponse(JSON.parse(storedOTP));
          } else {
            // If no OTP exists, generate one
            try {
              const newOtpResponse = await twoFactorAuthManager.generateOTP(onUnauthorized);

              // Store OTP response in session storage
              sessionStorage.setItem(otpSessionKey, JSON.stringify(newOtpResponse));
              setOtpResponse(newOtpResponse);
            } catch (err) {
              if (import.meta.env.DEV) {
                console.error("Error generating OTP:", err);
              }
              setError(err.message || "Failed to generate OTP. Please try again.");
            }
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error initializing page:", err);
        }
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
  }, [authManager, navigate, accountManager, onUnauthorized, twoFactorAuthManager, otpSessionKey]);

  // Generate dashboard link
  const getDashboardLink = useCallback(() => {
    if (getDashboardPath) {
      return getDashboardPath(currentUser);
    }
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser, getDashboardPath]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to copy:", err);
      }
    }
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      {
        label: "Dashboard",
        href: getDashboardLink(),
        icon: Bars3Icon,
      },
      {
        label: "Profile",
        href: basePath,
        icon: UserCircleIcon,
      },
      {
        label: "Two-Factor Authentication",
        href: twoFAPath,
        icon: ShieldCheckIcon,
      },
      {
        label: "Enable 2FA",
        icon: LockClosedIcon,
      },
    ],
    [getDashboardLink, basePath, twoFAPath]
  );

  // Get account name for 2FA app
  const getAccountName = useCallback(() => {
    const appDomain = getAppBaseURL().replace(/^https?:\/\//, "");
    return `${appDomain}: ${currentUser?.email || ""}`;
  }, [currentUser?.email]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="Loading..." />
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

  return (
    <div className={`min-h-screen ${themeClasses.bgPage}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}
          >
            <UserCircleIcon className="h-8 w-8 mr-3" />
            Profile
          </h1>
          <p className={`mt-2 ${themeClasses.textSecondary}`}>
            Two-Factor Authentication Setup
          </p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Progress Indicator */}
          <div className="mb-8">
            <div
              className={`flex justify-between text-sm ${themeClasses.textSecondary} mb-2`}
            >
              <span>Step 2 of 3</span>
              <span>66%</span>
            </div>
            <ProgressBar value={66} max={100} color="green" />
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

          {/* Instructions */}
          <p className={`${themeClasses.textPrimary} mb-8`}>
            With your 2FA application open, please scan the following QR code with your
            device and click next when ready.
          </p>

          {/* QR Code Section */}
          {otpResponse && otpResponse.optAuthURL && (
            <div className="flex justify-center mb-8">
              <div className="text-center">
                <div
                  className={`${themeClasses.bgCard} p-4 border-2 ${themeClasses.cardBorder} rounded-lg inline-block`}
                >
                  <QRCodeSVG
                    value={otpResponse.optAuthURL}
                    size={250}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p
                  className={`text-sm ${themeClasses.textSecondary} mt-3 flex items-center justify-center`}
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Scan with your authenticator app
                </p>
              </div>
            </div>
          )}

          {/* OR Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${themeClasses.cardBorder}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-4 ${themeClasses.bgCard} ${themeClasses.textMuted} text-lg font-semibold`}
              >
                OR
              </span>
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="mb-8">
            <p className={`${themeClasses.textPrimary} mb-4`}>
              Copy and paste the following values into your device:
            </p>

            <div className="space-y-4">
              {/* Account Name Field */}
              <div>
                <label
                  htmlFor="account-name-input"
                  className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
                >
                  Account Name
                </label>
                <div className="flex gap-2">
                  <input
                    id="account-name-input"
                    type="text"
                    value={getAccountName()}
                    readOnly
                    className={`flex-1 px-4 py-2 border ${themeClasses.cardBorder} rounded-lg ${themeClasses.bgMuted}`}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(getAccountName(), "account")}
                    className="flex items-center"
                  >
                    {copiedField === "account" ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Secret Key Field */}
              <div>
                <label
                  className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
                >
                  Your Key
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={otpResponse?.base32 || ""}
                    readOnly
                    rows="2"
                    className={`flex-1 px-4 py-2 border ${themeClasses.cardBorder} rounded-lg ${themeClasses.bgMuted} font-mono text-sm resize-none`}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => copyToClipboard(otpResponse?.base32 || "", "key")}
                    className="flex items-center"
                  >
                    {copiedField === "key" ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Type of Key Field */}
              <div>
                <label
                  htmlFor="key-type-input"
                  className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
                >
                  Type of Key
                </label>
                <input
                  id="key-type-input"
                  type="text"
                  value="Time based"
                  readOnly
                  className={`w-full px-4 py-2 border ${themeClasses.cardBorder} rounded-lg ${themeClasses.bgMuted}`}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate(step1Path)}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Step 1
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate(step3Path)}
              className="flex items-center"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

Account2FAEnableStep2ViewContent.displayName = "Account2FAEnableStep2ViewContent";

export default Account2FAEnableStep2View;

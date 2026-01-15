// File: monorepo/web/frontend/src/components/business/views/Account2FAEnableStep3View.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserCircleIcon,
  Bars3Icon,
  KeyIcon,
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
  Input,
} from "../../UIX";
import { getRoleRedirectPath } from "../../../constants/Roles";

/**
 * Account2FAEnableStep3View - 2FA Setup Step 3: Code verification
 *
 * @param {Object} config - Configuration object
 * @param {string} config.portalType - Portal identifier
 * @param {string} config.basePath - Base path for account routes
 * @param {string} config.twoFAPath - Path to 2FA settings
 * @param {string} config.step2Path - Path to step 2
 * @param {string} config.backupCodePath - Path to backup code page
 * @param {string} config.otpSessionKey - Session storage key for OTP data
 * @param {string} config.backupCodeSessionKey - Session storage key for backup code
 * @param {string} config.appleTokenSessionKey - Session storage key for Apple token
 * @param {Function} config.getDashboardPath - Function to get dashboard path
 */
function Account2FAEnableStep3View({ config }) {
  return (
    <UIXThemeProvider>
      <Account2FAEnableStep3ViewContent config={config} />
    </UIXThemeProvider>
  );
}

const Account2FAEnableStep3ViewContent = memo(function Account2FAEnableStep3ViewContent({
  config,
}) {
  const {
    // eslint-disable-next-line no-unused-vars
    portalType = "admin",
    basePath = "/admin/account",
    twoFAPath = "/admin/account/2fa",
    step2Path = "/admin/account/2fa/setup/step-2",
    backupCodePath = "/admin/account/2fa/backup-code",
    otpSessionKey = "FLASHPOINTTRAINING_2FA_SETUP_OTP",
    backupCodeSessionKey = "FLASHPOINTTRAINING_2FA_BACKUP_CODE",
    appleTokenSessionKey = "FLASHPOINTTRAINING_2FA_APPLE_TOKEN",
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
  const [verificationToken, setVerificationToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      bgPage: getThemeClasses("bg-page") || "bg-gray-50",
    }),
    [getThemeClasses]
  );

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Handle verification
  const handleVerification = useCallback(
    async (token = verificationToken) => {
      // Validation
      const cleanedToken = token.replace(/\s/g, "");

      if (!cleanedToken) {
        setFieldErrors({ verificationToken: "Verification code is required" });
        return;
      }

      if (cleanedToken.length !== 6 || !/^\d+$/.test(cleanedToken)) {
        setFieldErrors({
          verificationToken: "Please enter a valid 6-digit code",
        });
        return;
      }

      try {
        setIsVerifying(true);
        setError("");
        setFieldErrors({});

        // Call API to verify OTP
        const response = await twoFactorAuthManager.verifyOTP(
          { verificationToken: cleanedToken },
          onUnauthorized
        );

        // Clear the stored OTP from session
        sessionStorage.removeItem(otpSessionKey);

        // Update current user with the response
        if (response.user) {
          await accountManager.clearProfileCache();
          setCurrentUser(response.user);
        }

        // Store backup code in session for the next page (SECURITY: Never pass in URL!)
        if (response.otpBackupCode) {
          sessionStorage.setItem(backupCodeSessionKey, response.otpBackupCode);
        }

        // Navigate to backup code page (no sensitive data in URL)
        navigate(backupCodePath);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error verifying OTP:", err);
        }

        // Handle specific error cases
        if (err.verificationToken) {
          setFieldErrors({ verificationToken: err.verificationToken });
        } else {
          setError(
            err.message || err.error || "Failed to verify code. Please try again."
          );
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [
      verificationToken,
      twoFactorAuthManager,
      accountManager,
      navigate,
      onUnauthorized,
      otpSessionKey,
      backupCodeSessionKey,
      backupCodePath,
    ]
  );

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

          // Check if OTP response exists in session
          const storedOTP = sessionStorage.getItem(otpSessionKey);
          if (!storedOTP) {
            // If no OTP, redirect back to step 1
            navigate(
              config?.step1Path || "/admin/account/2fa/setup/step-1"
            );
            return;
          }

          // Check for Apple verification token in session storage (SECURITY: Never from URL!)
          const storedToken = sessionStorage.getItem(appleTokenSessionKey);
          if (storedToken && !hasAutoSubmitted) {
            // Auto-submit the token from Apple 2FA
            setVerificationToken(storedToken);
            // Clear it immediately after retrieving
            sessionStorage.removeItem(appleTokenSessionKey);
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
  }, [
    authManager,
    navigate,
    accountManager,
    onUnauthorized,
    otpSessionKey,
    appleTokenSessionKey,
    hasAutoSubmitted,
    config?.step1Path,
  ]);

  // Handle Apple verification auto-submit
  useEffect(() => {
    if (
      !hasAutoSubmitted &&
      verificationToken &&
      verificationToken.length === 6 &&
      !isLoading &&
      currentUser
    ) {
      handleVerification(verificationToken);
      setHasAutoSubmitted(true);
    }
  }, [verificationToken, hasAutoSubmitted, isLoading, currentUser, handleVerification]);

  // Generate dashboard link
  const getDashboardLink = useCallback(() => {
    if (getDashboardPath) {
      return getDashboardPath(currentUser);
    }
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser, getDashboardPath]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      handleVerification();
    },
    [handleVerification]
  );

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
        label: "2FA",
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="Loading..." />
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
              <span>Step 3 of 3</span>
              <span>100%</span>
            </div>
            <ProgressBar value={100} max={100} color="green" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-8">
            Setup Two-Factor Authentication
          </h2>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" dismissible onDismiss={() => setError("")}>
                {error}
              </Alert>
            </div>
          )}

          {/* Instructions */}
          <p className={`${themeClasses.textPrimary} mb-8`}>
            Open the two-step verification app on your mobile device to get your
            verification code.
          </p>

          {/* Verification Form */}
          <form onSubmit={handleSubmit}>
            <div className="max-w-md mx-auto mb-8">
              <Input
                label="Enter your Verification Code"
                type="text"
                placeholder="000000"
                value={verificationToken}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 6) {
                    setVerificationToken(value);
                    setFieldErrors({});
                  }
                }}
                error={fieldErrors.verificationToken}
                required
                helperText="Enter the 6-digit code from your authenticator app"
                className="text-center text-2xl font-mono tracking-widest"
                icon={KeyIcon}
                disabled={isVerifying}
              />
            </div>
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate(step2Path)}
              className="flex items-center"
              disabled={isVerifying}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Step 2
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex items-center"
              disabled={isVerifying || !verificationToken}
            >
              {isVerifying ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Submit and Verify
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

Account2FAEnableStep3ViewContent.displayName = "Account2FAEnableStep3ViewContent";

export default Account2FAEnableStep3View;

// File Path: web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step3Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
 * Two-Factor Authentication Setup - Step 3
 * Verification of 2FA code
 */
function AccountTwoFactorAuthenticationEnableStep3Page() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const twoFactorAuthManager = useTwoFactorAuthManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Get token from URL params (for Apple verification)
  const paramToken = searchParams.get("token");

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationToken, setVerificationToken] = useState(paramToken || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmittedParamToken, setHasSubmittedParamToken] = useState(false);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Handle verification
  const handleVerification = useCallback(async (token = verificationToken) => {
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
        onUnauthorized,
      );

      // Clear the stored OTP from session
      sessionStorage.removeItem("WORKERY_2FA_SETUP_OTP");

      // Update current user with the response
      if (response.user) {
        await accountManager.clearProfileCache();
        setCurrentUser(response.user);
      }

      // Store backup code in session for the next page
      if (response.otpBackupCode) {
        sessionStorage.setItem(
          "WORKERY_2FA_BACKUP_CODE",
          response.otpBackupCode,
        );
      }

      // Navigate to backup code page
      navigate(`/admin/account/2fa/backup-code?v=${response.otpBackupCode}`);
    } catch (err) {
      console.error("Error verifying OTP:", err);

      // Handle specific error cases
      if (err.verificationToken) {
        setFieldErrors({ verificationToken: err.verificationToken });
      } else {
        setError(
          err.message ||
            err.error ||
            "Failed to verify code. Please try again.",
        );
      }
    } finally {
      setIsVerifying(false);
    }
  }, [verificationToken, twoFactorAuthManager, onUnauthorized, accountManager, navigate]);

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
          const storedOTP = sessionStorage.getItem("WORKERY_2FA_SETUP_OTP");
          if (!storedOTP) {
            // If no OTP, redirect back to step 1
            navigate("/admin/account/2fa/setup/step-1");
            return;
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
  }, [accountManager, authManager, navigate, onUnauthorized]);

  // Handle Apple verification parameter token
  useEffect(() => {
    if (!hasSubmittedParamToken && paramToken && !isLoading && currentUser) {
      handleVerification(paramToken);
      setHasSubmittedParamToken(true);
    }
  }, [paramToken, hasSubmittedParamToken, isLoading, currentUser, handleVerification]);

  // Generate dashboard link
  const getDashboardLink = useCallback(() => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleVerification();
  }, [handleVerification]);

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
      label: "2FA",
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
              <span>Step 3 of 3</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: "100%" }}
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
            Open the two-step verification app on your mobile device to get your
            verification code.
          </p>

          {/* Verification Form */}
          <form onSubmit={handleSubmit}>
            <div className="max-w-md mx-auto mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Verification Code
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
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
                  className={`
                    w-full pl-10 px-4 py-3
                    text-center text-2xl font-mono tracking-widest
                    border rounded-lg
                    transition-all duration-200
                    placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${
                      fieldErrors.verificationToken
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                    }
                  `}
                  disabled={isVerifying}
                />
              </div>
              {fieldErrors.verificationToken && (
                <p className="mt-2 text-sm text-red-600">
                  {fieldErrors.verificationToken}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </form>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t pb-6">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/account/2fa/setup/step-2")}
              icon={ArrowLeftIcon}
              disabled={isVerifying}
            >
              Back to Step 2
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              icon={isVerifying ? null : CheckCircleIcon}
              disabled={isVerifying || !verificationToken}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Verifying...
                </span>
              ) : (
                "Submit and Verify"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AccountTwoFactorAuthenticationEnableStep3PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AccountTwoFactorAuthenticationEnableStep3Page />
    </UIXThemeProvider>
  );
}

export default AccountTwoFactorAuthenticationEnableStep3PageWithProvider;

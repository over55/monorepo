// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step3Page.jsx

import React, { useState, useEffect } from "react";
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
  Loading,
  Breadcrumb,
  Button,
  ProgressBar,
  Input,
} from "../../../../../../components/UI";
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

  // Get token from URL params (for Apple verification)
  const paramToken = searchParams.get("token");

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationToken, setVerificationToken] = useState(paramToken || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmittedParamToken, setHasSubmittedParamToken] = useState(false);

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
  }, []);

  // Handle Apple verification parameter token
  useEffect(() => {
    if (!hasSubmittedParamToken && paramToken && !isLoading && currentUser) {
      handleVerification(paramToken);
      setHasSubmittedParamToken(true);
    }
  }, [paramToken, hasSubmittedParamToken, isLoading, currentUser]);

  // Generate dashboard link
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Handle verification
  const handleVerification = async (token = verificationToken) => {
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
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerification();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
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
      label: "2FA",
      href: "/admin/account/2fa",
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
          <p className="text-gray-700 mb-8">
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
              onClick={() => navigate("/admin/account/2fa/setup/step-2")}
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
}

export default AccountTwoFactorAuthenticationEnableStep3Page;

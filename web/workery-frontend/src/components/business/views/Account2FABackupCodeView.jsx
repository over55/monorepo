// File: monorepo/web/frontend/src/components/business/views/Account2FABackupCodeView.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserCircleIcon,
  Bars3Icon,
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useAccountManager, useAuthManager } from "../../../services/Services";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../UIX";
import { getRoleRedirectPath } from "../../../constants/Roles";

/**
 * Account2FABackupCodeView - Displays the backup code after successful 2FA setup
 *
 * @param {Object} config - Configuration object
 * @param {string} config.portalType - Portal identifier (e.g., "admin", "customer", "facilitator")
 * @param {string} config.basePath - Base path for account routes (e.g., "/admin/account")
 * @param {string} config.twoFAPath - Path to 2FA settings (e.g., "/admin/account/2fa")
 * @param {string} config.sessionStorageKey - Key for backup code in session storage
 * @param {Function} config.getDashboardPath - Function to get dashboard path based on user
 */
function Account2FABackupCodeView({ config }) {
  return (
    <UIXThemeProvider>
      <Account2FABackupCodeViewContent config={config} />
    </UIXThemeProvider>
  );
}

const Account2FABackupCodeViewContent = memo(function Account2FABackupCodeViewContent({
  config,
}) {
  const {
    // eslint-disable-next-line no-unused-vars
    portalType = "admin",
    basePath = "/admin/account",
    twoFAPath = "/admin/account/2fa",
    sessionStorageKey = "FLASHPOINTTRAINING_2FA_BACKUP_CODE",
    getDashboardPath,
  } = config || {};

  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [backupCode, setBackupCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      borderPrimary: getThemeClasses("border-primary"),
      linkPrimary: getThemeClasses("link-primary"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      cardBorder: getThemeClasses("card-border"),
      bgCard: getThemeClasses("bg-card"),
      successText: getThemeClasses("text-success"),
      successBg: getThemeClasses("bg-success-light"),
      successBorder: getThemeClasses("border-success"),
      warningText: getThemeClasses("text-warning"),
      warningBg: getThemeClasses("bg-warning-light"),
      warningBorder: getThemeClasses("border-warning"),
      infoText: getThemeClasses("text-info"),
      infoBg: getThemeClasses("bg-info-light"),
      infoBorder: getThemeClasses("border-info"),
      bgPage: getThemeClasses("bg-page") || "bg-gray-50",
      bgMuted: getThemeClasses("bg-muted") || "bg-gray-50",
    }),
    [getThemeClasses]
  );

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

        // Get backup code from session storage (SECURITY: Never from URL!)
        const storedCode = sessionStorage.getItem(sessionStorageKey);

        if (!storedCode) {
          // No backup code found, redirect to 2FA settings
          navigate(twoFAPath);
          return;
        }

        // Set backup code from session storage
        if (mounted) {
          setBackupCode(storedCode);
        }

        // Fetch account details (with force refresh to get updated 2FA status)
        const userData = await accountManager.getAccountDetail(onUnauthorized, true);

        if (mounted && userData) {
          setCurrentUser(userData);

          // Clear the backup code from session storage (security)
          sessionStorage.removeItem(sessionStorageKey);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error fetching account details:", err);
        }
        if (mounted) {
          setError(err.message || "Failed to load account details. Please try again.");
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
  }, [authManager, navigate, accountManager, onUnauthorized, sessionStorageKey, twoFAPath]);

  // Generate dashboard link
  const getDashboardLink = useCallback(() => {
    if (getDashboardPath) {
      return getDashboardPath(currentUser);
    }
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  }, [currentUser, getDashboardPath]);

  // Copy backup code to clipboard
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to copy:", err);
      }
      setError("Failed to copy backup code. Please copy it manually.");
    }
  }, [backupCode]);

  // Download backup code as text file
  const handleDownloadCode = useCallback(() => {
    try {
      const content = `Flashpoint Training 2FA Backup Code
==============================
Account: ${currentUser?.email || "Unknown"}
Generated: ${new Date().toLocaleString()}
==============================

BACKUP CODE: ${backupCode}

==============================
IMPORTANT INSTRUCTIONS:
- Store this code in a secure location
- Do not share this code with anyone
- Use this code only if you lose access to your authenticator app
- Each backup code can only be used once
- After using this code, generate a new one
==============================`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flashpoint-2fa-backup-code-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to download:", err);
      }
      setError("Failed to download backup code. Please copy it manually.");
    }
  }, [currentUser?.email, backupCode]);

  // Handle confirmation and navigation
  const handleConfirm = useCallback(() => {
    navigate(twoFAPath);
  }, [navigate, twoFAPath]);

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
        label: "Backup Code",
        icon: KeyIcon,
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

  // No backup code state
  if (!backupCode && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" dismissible={false}>
          No backup code found. Please enable 2FA again.
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate(twoFAPath)}>Go to 2FA Settings</Button>
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
            Two-Factor Authentication Backup Code
          </p>
        </div>

        {/* Main Card */}
        <Card>
          {/* Success Message */}
          <div className="mb-6">
            <Alert type="success" dismissible={false}>
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Successfully Enabled 2FA!</strong>
                  <p className="mt-1">
                    Two-factor authentication has been successfully enabled for your
                    account.
                  </p>
                </div>
              </div>
            </Alert>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <KeyIcon className={`h-16 w-16 ${themeClasses.successText} mx-auto mb-4`} />
            <h2 className="text-2xl font-semibold mb-2">Your 2FA Backup Code</h2>
            <p className={themeClasses.textSecondary}>
              Save this backup code in a secure location
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" dismissible onDismiss={() => setError("")}>
                {error}
              </Alert>
            </div>
          )}

          {/* Instructions */}
          <div
            className={`${themeClasses.warningBg} border ${themeClasses.warningBorder} rounded-lg p-4 mb-6`}
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon
                className={`h-5 w-5 ${themeClasses.warningText} mr-2 flex-shrink-0 mt-0.5`}
              />
              <div className={`text-sm ${themeClasses.warningText}`}>
                <strong>Important Information:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>You have successfully verified your 2FA code</li>
                  <li>The backup code below provides full access to your account</li>
                  <li>Do not share this code with anyone</li>
                  <li>Store it in a safe, secure location</li>
                  <li>Use it only if you lose access to your authenticator app</li>
                  <li>Each backup code can only be used once</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Backup Code Display */}
          <div className="mb-8">
            <label
              className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
            >
              2FA Backup Code
            </label>
            <div
              className={`${themeClasses.bgMuted} border-2 ${themeClasses.cardBorder} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <code
                  className={`text-2xl font-mono tracking-wider ${themeClasses.textPrimary} select-all`}
                >
                  {backupCode}
                </code>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="secondary"
                    onClick={handleCopyCode}
                    className="flex items-center"
                    title="Copy to clipboard"
                  >
                    {copied ? (
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
                  <Button
                    variant="secondary"
                    onClick={handleDownloadCode}
                    className="flex items-center"
                    title="Download as text file"
                  >
                    {downloaded ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <p className={`mt-2 text-sm ${themeClasses.textMuted}`}>
              Click to copy or download this code for safekeeping
            </p>
          </div>

          {/* Security Tips */}
          <div
            className={`${themeClasses.infoBg} border ${themeClasses.infoBorder} rounded-lg p-4 mb-8`}
          >
            <h3
              className={`font-semibold ${themeClasses.infoText} mb-2 flex items-center`}
            >
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Security Tips
            </h3>
            <ul
              className={`text-sm ${themeClasses.infoText} space-y-1 list-disc list-inside`}
            >
              <li>Store this code offline (printed or written down)</li>
              <li>Keep it separate from your password</li>
              <li>Don't store it in plain text on your computer</li>
              <li>Consider using a password manager's secure notes feature</li>
              <li>Never share this code via email or messaging apps</li>
            </ul>
          </div>

          {/* Confirmation Section */}
          <div className={`${themeClasses.bgMuted} rounded-lg p-6 text-center`}>
            <p className={`${themeClasses.textPrimary} mb-4`}>
              Please confirm that you have safely stored your backup code before
              proceeding.
            </p>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="inline-flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />I have saved my backup code
            </Button>
          </div>

          {/* Additional Information */}
          <div className={`mt-8 pt-6 border-t ${themeClasses.cardBorder}`}>
            <h3 className={`font-semibold ${themeClasses.textPrimary} mb-2`}>
              What happens next?
            </h3>
            <ul className={`text-sm ${themeClasses.textSecondary} space-y-2`}>
              <li className="flex items-start">
                <CheckCircleIcon
                  className={`h-4 w-4 ${themeClasses.successText} mr-2 mt-0.5 flex-shrink-0`}
                />
                <span>Your account now requires 2FA for all future logins</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon
                  className={`h-4 w-4 ${themeClasses.successText} mr-2 mt-0.5 flex-shrink-0`}
                />
                <span>
                  You'll need your authenticator app to generate codes when signing in
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon
                  className={`h-4 w-4 ${themeClasses.successText} mr-2 mt-0.5 flex-shrink-0`}
                />
                <span>
                  If you lose access to your authenticator, use this backup code to
                  regain access
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon
                  className={`h-4 w-4 ${themeClasses.successText} mr-2 mt-0.5 flex-shrink-0`}
                />
                <span>
                  After using a backup code, you should generate a new one immediately
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
});

Account2FABackupCodeViewContent.displayName = "Account2FABackupCodeViewContent";

export default Account2FABackupCodeView;

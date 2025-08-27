// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/2FA/BackupCodeGenerate/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import {
  useAccountManager,
  useAuthManager,
} from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../../../../../components/UI";
import { getRoleRedirectPath } from "../../../../../../constants/Roles";

/**
 * Two-Factor Authentication Backup Code Page
 * Displays the backup code after successful 2FA setup
 */
function AccountTwoFactorAuthenticationBackupCodePage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get backup code from URL params
  const backupCode = searchParams.get("v");

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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

        // Check if backup code exists
        if (!backupCode) {
          // Try to get from session storage
          const storedCode = sessionStorage.getItem("WORKERY_2FA_BACKUP_CODE");
          if (!storedCode) {
            navigate("/admin/account/2fa");
            return;
          }
        }

        // Fetch account details (with force refresh to get updated 2FA status)
        const userData = await accountManager.getAccountDetail(
          onUnauthorized,
          true,
        );

        if (mounted && userData) {
          setCurrentUser(userData);

          // Clear the backup code from session storage (security)
          sessionStorage.removeItem("WORKERY_2FA_BACKUP_CODE");
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
  }, [backupCode]);

  // Generate dashboard link
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Copy backup code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy backup code. Please copy it manually.");
    }
  };

  // Download backup code as text file
  const handleDownloadCode = () => {
    try {
      const content = `Workery 2FA Backup Code
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
      link.download = `workery-2fa-backup-code-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("Failed to download:", err);
      setError("Failed to download backup code. Please copy it manually.");
    }
  };

  // Handle confirmation and navigation
  const handleConfirm = () => {
    navigate("/admin/account/2fa");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
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
          <Button onClick={() => navigate("/admin/account/2fa")}>
            Go to 2FA Settings
          </Button>
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
      label: "2FA",
      href: "/admin/account/2fa",
      icon: ShieldCheckIcon,
    },
    {
      label: "Backup Code",
      icon: KeyIcon,
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
          <p className="mt-2 text-gray-600">
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
                    Two-factor authentication has been successfully enabled for
                    your account.
                  </p>
                </div>
              </div>
            </Alert>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <KeyIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Your 2FA Backup Code
            </h2>
            <p className="text-gray-600">
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Important Information:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>You have successfully verified your 2FA code</li>
                  <li>
                    The backup code below provides full access to your account
                  </li>
                  <li>Do not share this code with anyone</li>
                  <li>Store it in a safe, secure location</li>
                  <li>
                    Use it only if you lose access to your authenticator app
                  </li>
                  <li>Each backup code can only be used once</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Backup Code Display */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2FA Backup Code
            </label>
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <code className="text-2xl font-mono tracking-wider text-gray-900 select-all">
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
            <p className="mt-2 text-sm text-gray-500">
              Click to copy or download this code for safekeeping
            </p>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Security Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Store this code offline (printed or written down)</li>
              <li>Keep it separate from your password</li>
              <li>Don't store it in plain text on your computer</li>
              <li>Consider using a password manager's secure notes feature</li>
              <li>Never share this code via email or messaging apps</li>
            </ul>
          </div>

          {/* Confirmation Section */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              Please confirm that you have safely stored your backup code before
              proceeding.
            </p>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="inline-flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />I have saved my backup
              code
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your account now requires 2FA for all future logins</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  You'll need your authenticator app to generate codes when
                  signing in
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  If you lose access to your authenticator, use this backup code
                  to regain access
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  After using a backup code, you should generate a new one
                  immediately
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AccountTwoFactorAuthenticationBackupCodePage;

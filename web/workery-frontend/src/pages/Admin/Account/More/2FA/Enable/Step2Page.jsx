// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/2FA/Enable/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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
  Loading,
  Breadcrumb,
  Button,
  ProgressBar,
  Input,
  Textarea,
} from "../../../../../../components/UI";
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

  // Component state
  const [currentUser, setCurrentUser] = useState(null);
  const [otpResponse, setOtpResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  };

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
  }, []);

  // Generate dashboard link
  const getDashboardLink = () => {
    if (!currentUser) return "/dashboard";
    return getRoleRedirectPath(currentUser.roleId || currentUser.role);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
      label: "2FA",
      href: "/admin/account/2fa",
      icon: ShieldCheckIcon,
    },
    {
      label: "Enable 2FA",
      icon: LockClosedIcon,
    },
  ];

  // Get account name for 2FA app
  const getAccountName = () => {
    const appDomain = getAppBaseURL().replace(/^https?:\/\//, "");
    return `${appDomain}: ${currentUser?.email || ""}`;
  };

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
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/account/2fa/setup/step-1")}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Step 1
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate("/admin/account/2fa/setup/step-3")}
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
}

export default AccountTwoFactorAuthenticationEnableStep2Page;

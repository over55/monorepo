// File: monorepo/web/frontend/src/components/business/views/Account2FAView.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  UserCircleIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChartBarIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Badge,
  Button,
  Alert,
  Modal,
  Card,
  Loading,
} from "../../UIX";
import {
  useAccountManager,
  useTwoFactorAuthManager,
  useAuthManager,
} from "../../../services/Services";

/**
 * Account2FAView - A reusable 2FA management component for user accounts
 *
 * @param {Object} config - Configuration object
 * @param {string} config.portalType - Portal identifier (e.g., "admin", "customer", "facilitator")
 * @param {string} config.basePath - Base path for account routes (e.g., "/admin/account")
 * @param {string} config.dashboardPath - Path to dashboard (e.g., "/admin/dashboard")
 * @param {string} config.setupPath - Path to 2FA setup wizard (e.g., "/admin/account/2fa/setup/step-1")
 * @param {string} config.pageTitle - Page title (default: "Account - Two-Factor Authentication")
 * @param {Array} config.breadcrumbs - Custom breadcrumb items (optional)
 * @param {Array} config.tabItems - Custom tab items (optional)
 */
function Account2FAView({ config }) {
  return (
    <UIXThemeProvider>
      <Account2FAViewContent config={config} />
    </UIXThemeProvider>
  );
}

const Account2FAViewContent = memo(function Account2FAViewContent({ config }) {
  const {
    // eslint-disable-next-line no-unused-vars
    portalType = "admin",
    basePath = "/admin/account",
    dashboardPath = "/admin/dashboard",
    setupPath = "/admin/account/2fa/setup/step-1",
    pageTitle = "Account - Two-Factor Authentication",
    breadcrumbs: customBreadcrumbs,
    tabItems: customTabItems,
  } = config || {};

  const accountManager = useAccountManager();
  const twoFactorAuthManager = useTwoFactorAuthManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [account, setAccount] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      borderPrimary: getThemeClasses("border-primary"),
      linkPrimary: getThemeClasses("link-primary"),
      linkHover: getThemeClasses("link-hover"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      cardBorder: getThemeClasses("card-border"),
      bgCard: getThemeClasses("bg-card"),
      accentText: getThemeClasses("text-accent"),
      successText: getThemeClasses("text-success"),
      successBg: getThemeClasses("bg-success-light"),
      successBorder: getThemeClasses("border-success"),
      warningText: getThemeClasses("text-warning"),
      warningBg: getThemeClasses("bg-warning-light"),
      warningBorder: getThemeClasses("border-warning"),
      errorText: getThemeClasses("text-error"),
      infoText: getThemeClasses("text-info"),
      infoBg: getThemeClasses("bg-info-light"),
      infoBorder: getThemeClasses("border-info"),
      loadingSpinner: getThemeClasses("loading-spinner"),
    }),
    [getThemeClasses]
  );

  // Default breadcrumb items
  const defaultBreadcrumbItems = useMemo(
    () => [
      {
        label: "Dashboard",
        to: dashboardPath,
        icon: ChartBarIcon,
      },
      {
        label: "Account",
        to: basePath,
        icon: UserCircleIcon,
      },
      {
        label: "Two-Factor Authentication",
        icon: DevicePhoneMobileIcon,
        isActive: true,
      },
    ],
    [dashboardPath, basePath]
  );

  // Default tab items
  const defaultTabItems = useMemo(
    () => [
      {
        label: "Detail",
        href: basePath,
        isActive: false,
        icon: InformationCircleIcon,
      },
      {
        label: "More",
        href: `${basePath}/more`,
        isActive: true,
        icon: EllipsisHorizontalIcon,
      },
    ],
    [basePath]
  );

  const breadcrumbItems = customBreadcrumbs || defaultBreadcrumbItems;
  const tabItems = customTabItems || defaultTabItems;

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [navigate, authManager]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const loadAccountDetails = async () => {
      setFetching(true);
      setErrors({});

      try {
        const accountData = await accountManager.getAccountDetail(onUnauthorized);
        if (mounted) {
          setAccount(accountData);
        }
      } catch {
        if (mounted) {
          setErrors({ general: "Failed to load account details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    loadAccountDetails();

    return () => {
      mounted = false;
    };
  }, [accountManager, onUnauthorized]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle enable 2FA
  const handleEnable2FA = useCallback(() => {
    navigate(setupPath);
  }, [navigate, setupPath]);

  // Handle disable 2FA
  const handleDisable2FA = useCallback(async () => {
    try {
      setIsProcessing(true);
      setErrors({});

      await twoFactorAuthManager.disableOTP(onUnauthorized);

      // Refresh account data to get updated state
      const accountData = await accountManager.getAccountDetail(onUnauthorized);
      setAccount(accountData);

      setSuccessMsg("2FA has been disabled for your account");
      setShowConfirmModal(false);
    } catch (error) {
      setErrors({
        general: error.message || "Failed to disable 2FA. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [twoFactorAuthManager, accountManager, onUnauthorized]);

  // Check if 2FA is enabled
  const is2FAEnabled = account?.otpEnabled === true || account?.otpEnabled === 1;

  // Loading state
  if (isFetching && !account) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" message="Loading account details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="shadow-sm mb-4 sm:mb-6">
        <div className={`rounded-lg ${themeClasses.bgGradientSecondary}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCircleIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3 text-white/80 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {pageTitle}
                </h2>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  icon={ChevronLeftIcon}
                  className="flex-1 sm:flex-initial"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className={`${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`}
          >
            {tabItems.length > 0 && (
              <div className={`px-4 sm:px-6 border-b ${themeClasses.cardBorder}`}>
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  {tabItems.map((tab, index) =>
                    tab.isActive ? (
                      <div
                        key={index}
                        className={`border-b-2 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium whitespace-nowrap ${themeClasses.borderPrimary} ${themeClasses.linkPrimary}`}
                      >
                        {tab.label}
                        {tab.icon && <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />}
                      </div>
                    ) : (
                      <a
                        key={index}
                        href={tab.href}
                        className={`border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium whitespace-nowrap ${themeClasses.textSecondary}`}
                      >
                        {tab.label}
                        {tab.icon && <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />}
                      </a>
                    )
                  )}
                </nav>
              </div>
            )}

            {/* Main Content */}
            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
              {/* Success Message */}
              {successMsg && (
                <div className="mb-6">
                  <Alert type="success" dismissible onDismiss={() => setSuccessMsg("")}>
                    {successMsg}
                  </Alert>
                </div>
              )}

              {/* Error Message */}
              {errors.general && (
                <div className="mb-6">
                  <Alert type="error" dismissible onDismiss={() => setErrors({})}>
                    {errors.general}
                  </Alert>
                </div>
              )}

              {/* Account Summary Card */}
              {account && (
                <Card className={`${themeClasses.bgCard} mb-8`} padding="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Avatar
                        src={account.avatarUrl}
                        fallback={`${account.firstName?.[0] || ""}${account.lastName?.[0] || ""}`}
                        size="lg"
                        className="mr-4"
                      />
                      <div>
                        <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                          {account.firstName} {account.lastName}
                        </h3>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          {account.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <Badge variant={is2FAEnabled ? "success" : "warning"} size="sm">
                            {is2FAEnabled ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                2FA Enabled
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                2FA Disabled
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Action Section */}
              <Card className={`${themeClasses.bgCard}`} padding="p-8">
                <div className="text-center">
                  <DevicePhoneMobileIcon
                    className={`w-16 h-16 mx-auto mb-4 ${themeClasses.textMuted}`}
                  />

                  <h3 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Two-Factor Authentication
                  </h3>

                  <div className="mb-6">
                    {is2FAEnabled ? (
                      <div className={themeClasses.successText}>
                        <CheckCircleIcon className="w-6 h-6 inline mr-2" />
                        <span className="font-medium">Enabled</span>
                        <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
                          You are about to remove 2FA for your account. This operation will
                          remove your previous 2FA setup codes and disable 2FA on login. This
                          is recommended if you lost your 2FA codes from your device.
                        </p>
                      </div>
                    ) : (
                      <div className={themeClasses.warningText}>
                        <XCircleIcon className="w-6 h-6 inline mr-2" />
                        <span className="font-medium">Disabled</span>
                        <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
                          You are about to enable 2FA for your account. This operation will
                          take you through a 3-step wizard to setup 2FA. Afterwards, every
                          time you log in, you will be asked to carry out a 2FA process.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4">
                    {is2FAEnabled ? (
                      <Button
                        variant="danger"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isProcessing}
                        icon={LockOpenIcon}
                      >
                        Disable 2FA
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleEnable2FA}
                        disabled={isProcessing}
                        icon={LockClosedIcon}
                      >
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Disable Two-Factor Authentication?"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisable2FA}
              disabled={isProcessing}
              icon={LockOpenIcon}
            >
              {isProcessing ? "Disabling..." : "Confirm Disable"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon
              className={`h-6 w-6 ${themeClasses.warningText} mr-3 flex-shrink-0 mt-1`}
            />
            <div>
              <p className={themeClasses.textPrimary}>
                You are about to <strong>disable two-factor authentication</strong> for
                your account. This will make your account less secure.
              </p>
              <p className={`${themeClasses.textPrimary} mt-2`}>
                Are you sure you want to continue?
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
});

Account2FAViewContent.displayName = "Account2FAViewContent";

export default Account2FAView;

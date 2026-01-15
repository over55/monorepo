import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Button,
  Alert,
} from "../../UIX";
import {
  Loading,
  Tabs,
} from "../../UIX";
import {
  UserCircleIcon,
  ArrowLeftIcon,
  HomeIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  KeyIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
  ACCOUNT_PATHS,
} from "../../../constants/Account";

function AccountMoreView({
  // User type configuration
  userType, // 'admin', 'customer', 'facilitator', 'jobseeker', 'root'

  // Services
  accountManager,
  authManager,

  // Display configuration
  title,
  subtitle,
  showTabs = true,

  // Action configuration
  customActions,
  hideChangePassword = false,
  hide2FA = false,
  hideBackupCodes = false,

  // Callbacks
  onActionClick,
  onDataLoad,
  onError,
}) {
  return (
    <UIXThemeProvider>
      <AccountMoreViewContent
        userType={userType}
        accountManager={accountManager}
        authManager={authManager}
        title={title}
        subtitle={subtitle}
        showTabs={showTabs}
        customActions={customActions}
        hideChangePassword={hideChangePassword}
        hide2FA={hide2FA}
        hideBackupCodes={hideBackupCodes}
        onActionClick={onActionClick}
        onDataLoad={onDataLoad}
        onError={onError}
      />
    </UIXThemeProvider>
  );
}

function AccountMoreViewContent({
  userType,
  accountManager,
  authManager,
  title,
  subtitle,
  showTabs,
  customActions,
  hideChangePassword,
  hide2FA,
  hideBackupCodes,
  // eslint-disable-next-line no-unused-vars
  onActionClick,
  onDataLoad,
  onError,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();

  // Get paths
  const paths = useMemo(() => ACCOUNT_PATHS[userType] || ACCOUNT_PATHS.admin, [userType]);

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("more");

  // Handlers
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

  // Fetch account details
  const fetchAccountDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const profileData = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(profileData);

      // Call onDataLoad callback if provided
      if (onDataLoad) {
        onDataLoad(profileData);
      }

    } catch (error) {
      console.error("Failed to fetch account details:", error);
      const errorMessage = error.message || "Failed to load account details";
      setErrors({ general: errorMessage });

      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accountManager, onUnauthorized, onDataLoad, onError]);

  // Load data on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAccountDetail();
  }, [fetchAccountDetail]);

  // Tab items configuration
  const tabItems = useMemo(() => [
    { id: "detail", label: "Detail", href: paths.detail },
    { id: "more", label: "More" },
  ], [paths.detail]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: paths.dashboard,
      icon: HomeIcon
    },
    {
      label: "My Profile",
      to: paths.detail,
      icon: UserCircleIcon,
    },
    {
      label: "More",
      icon: EllipsisHorizontalIcon,
    },
  ], [paths]);

  // Default actions
  const defaultActions = useMemo(() => {
    const actions = [];

    // Change Password
    if (!hideChangePassword) {
      actions.push({
        id: "change-password",
        title: "Change Password",
        description: "Update your account password for security",
        icon: KeyIcon,
        href: paths.changePassword,
        variant: "primary",
      });
    }

    // 2FA Management
    if (!hide2FA && currentUser) {
      if (currentUser.otpEnabled) {
        actions.push({
          id: "2fa-manage",
          title: "Manage Two-Factor Authentication",
          description: "View or disable two-factor authentication",
          icon: ShieldCheckIcon,
          href: `${paths.base}/more/2fa`,
          variant: "success",
          badge: "Enabled",
        });
      } else {
        actions.push({
          id: "2fa-enable",
          title: "Enable Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          icon: DevicePhoneMobileIcon,
          href: `${paths.base}/more/2fa/enable/step-1`,
          variant: "warning",
          badge: "Recommended",
        });
      }
    }

    // Backup Codes
    if (!hideBackupCodes && currentUser?.otpEnabled) {
      actions.push({
        id: "backup-codes",
        title: "Backup Codes",
        description: "Generate backup codes for account recovery",
        icon: QrCodeIcon,
        href: `${paths.base}/more/2fa/backup-code-generate`,
        variant: "secondary",
      });
    }

    return actions;
  }, [
    hideChangePassword,
    hide2FA,
    hideBackupCodes,
    currentUser,
    paths,
  ]);

  // Combine default and custom actions
  const allActions = useMemo(() => {
    const actions = [...defaultActions];
    if (customActions && customActions.length > 0) {
      actions.push(...customActions);
    }
    return actions;
  }, [defaultActions, customActions]);

  // Loading state
  if (isLoading) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  // Error state
  if (errors.general) {
    return (
      <div className={`min-h-screen p-8 ${getThemeClasses('page-bg')}`}>
        <div className="max-w-4xl mx-auto">
          <Alert type="error" className="mb-4">
            {errors.general}
          </Alert>
          <Link to={paths.dashboard}>
            <Button variant="secondary" icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentUser) {
    return (
      <div className={`min-h-screen p-8 ${getThemeClasses('page-bg')}`}>
        <div className="max-w-4xl mx-auto">
          <Alert type="warning">No account data found</Alert>
          <Link to={paths.dashboard} className="mt-4">
            <Button variant="secondary" icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <div className="shadow-sm">
        <div className={`rounded-lg ${getThemeClasses('bg-gradient-secondary')}`}>
          {/* Header with Actions */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                <CogIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" />
                {title || "Account Settings"}
              </h2>
              <div className="flex gap-2 sm:gap-3">
                <Link to={paths.dashboard}>
                  <Button variant="outline" icon={ArrowLeftIcon}>
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            {subtitle && (
              <p className="mt-2 text-white/80 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content Container */}
          <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 rounded-b-lg ${getThemeClasses('card-border')}`}>
            <div className="px-4 sm:px-6 py-6">

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {successMessage}
                  </span>
                  <button
                    onClick={() => setSuccessMessage("")}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Tabs */}
              {showTabs && (
                <div className="mb-6">
                  <Tabs
                    tabs={tabItems}
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                      const tab = tabItems.find((t) => t.id === tabId);
                      if (tab?.href) {
                        navigate(tab.href);
                      } else {
                        setActiveTab(tabId);
                      }
                    }}
                  />
                </div>
              )}

              {/* Main Content */}
              {activeTab === "more" && (
                <div className="space-y-6">

                  {/* Account Information Summary */}
                  <div className={`rounded-lg shadow-sm p-6 ${getThemeClasses('bg-gradient-light')}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${getThemeClasses('bg-primary')}`}>
                        <UserCircleIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${getThemeClasses("text-primary")}`}>
                          {`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "User"}
                        </h3>
                        <p className={`text-sm ${getThemeClasses("text-secondary")}`}>{currentUser.email}</p>
                        {currentUser.otpEnabled && (
                          <div className="flex items-center mt-1">
                            <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">2FA Enabled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allActions.map((action) => (
                      <div
                        key={action.id}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                          action.variant === "primary"
                            ? `${getThemeClasses('border-primary')} hover:${getThemeClasses('bg-primary-light')}`
                            : action.variant === "success"
                            ? "border-green-200 hover:bg-green-50"
                            : action.variant === "warning"
                            ? "border-orange-200 hover:bg-orange-50"
                            : `${getThemeClasses("border-secondary")} ${getThemeClasses("bg-disabled")}`
                        }`}
                        onClick={() => {
                          if (action.onClick) {
                            action.onClick();
                          } else if (action.href) {
                            navigate(action.href);
                          }
                        }}
                      >
                        {/* Badge */}
                        {action.badge && (
                          <div className="absolute -top-2 -right-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              action.variant === "success"
                                ? "bg-green-100 text-green-800"
                                : action.variant === "warning"
                                ? "bg-orange-100 text-orange-800"
                                : `${getThemeClasses('badge-primary')}`
                            }`}>
                              {action.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            action.variant === "primary"
                              ? getThemeClasses('bg-primary')
                              : action.variant === "success"
                              ? "bg-green-500"
                              : action.variant === "warning"
                              ? "bg-orange-500"
                              : getThemeClasses("bg-disabled")
                          }`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${getThemeClasses("text-primary")} mb-2`}>
                              {action.title}
                            </h3>
                            <p className={`text-sm ${getThemeClasses("text-secondary")} mb-3`}>
                              {action.description}
                            </p>
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                action.variant === "primary"
                                  ? getThemeClasses('text-primary')
                                  : action.variant === "success"
                                  ? "text-green-600"
                                  : action.variant === "warning"
                                  ? "text-orange-600"
                                  : getThemeClasses("text-secondary")
                              }`}>
                                {action.variant === "primary" ? "Manage" : action.variant === "warning" ? "Set Up" : "View"}
                              </span>
                              <ArrowLeftIcon className={`h-4 w-4 ml-1 rotate-180 ${
                                action.variant === "primary"
                                  ? getThemeClasses('text-primary')
                                  : action.variant === "success"
                                  ? "text-green-600"
                                  : action.variant === "warning"
                                  ? "text-orange-600"
                                  : getThemeClasses("text-secondary")
                              }`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Help Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex">
                      <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                          Account Security Tips
                        </h3>
                        <div className="text-sm text-blue-800">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Use a strong, unique password for your account</li>
                            <li>Enable two-factor authentication for extra security</li>
                            <li>Keep your backup codes in a safe place</li>
                            <li>Review your account settings regularly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountMoreView;
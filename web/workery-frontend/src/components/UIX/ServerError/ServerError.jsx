// File Path: src/components/UIX/ServerError/ServerError.jsx
// UIX ServerError Component - Reusable 500 page with theme support

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../index.jsx";
import { useAuthManager, useAccountManager } from "../../../services/Services";
import { getRoleRedirectPath, getRoleName } from "../../../constants/Roles";
import {
  ServerStackIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

/**
 * Reusable ServerError component for 500 errors
 * Features:
 * - Role-aware navigation
 * - Authentication detection
 * - Customizable title and message
 * - Responsive design matching app style guide
 * - Full theme support (including dark mode)
 *
 * @param {Object} props
 * @param {string} props.title - Page title (default: "Server Error")
 * @param {string} props.message - Error message to display
 * @param {boolean} props.showQuickLinks - Whether to show quick navigation links
 * @param {React.ReactNode} props.customActions - Custom action buttons to replace defaults
 */
function ServerErrorContent({
  title = "Server Error",
  message = "Something went wrong on our end. Our team has been notified and is working to fix the issue. Please try again in a few moments.",
  showQuickLinks = true,
  customActions = null
}) {
  const navigate = useNavigate();
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const { getThemeClasses } = useUIXTheme();

  const themeClasses = useMemo(
    () => ({
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      bgCard: getThemeClasses("bg-card"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      alertErrorText: getThemeClasses("alert-error-text"),
      alertErrorBg: getThemeClasses("alert-error-bg"),
      alertWarningBg: getThemeClasses("alert-warning-bg"),
      alertWarningText: getThemeClasses("alert-warning-text"),
      borderSecondary: getThemeClasses("border-secondary"),
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [roleDashboardPath, setRoleDashboardPath] = useState(null);

  const onUnauthorized = useCallback(() => {
    // If unauthorized during profile fetch, treat as not authenticated
    setIsAuthenticated(false);
    setUserProfile(null);
    setRoleDashboardPath(null);
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Check authentication status and get user profile
    const checkAuthAndProfile = async () => {
      try {
        const authStatus = authManager.isAuthenticated();
        setIsAuthenticated(authStatus);

        if (authStatus) {
          // Get user profile to determine role-based dashboard
          try {
            const profile = await accountManager.getAccountDetail(onUnauthorized);
            setUserProfile(profile);

            // Get role-specific dashboard path
            const dashboardPath = getRoleRedirectPath(profile.roleId);
            setRoleDashboardPath(dashboardPath);

            if (import.meta.env.DEV) {
              console.log("ServerError: User profile loaded:", {
                roleId: profile.roleId,
                roleName: getRoleName(profile.roleId),
                dashboardPath: dashboardPath,
              });
            }
          } catch (profileError) {
            if (import.meta.env.DEV) {
              console.error("ServerError: Failed to load user profile:", profileError);
            }
            // If profile fetch fails but user is authenticated, use fallback
            setRoleDashboardPath("/login");
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("ServerError: Error checking auth status:", error);
        }
        setIsAuthenticated(false);
        setUserProfile(null);
        setRoleDashboardPath(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndProfile();
  }, [authManager, accountManager, onUnauthorized]);

  const handleGoToMain = useCallback(() => {
    if (isAuthenticated) {
      if (roleDashboardPath && roleDashboardPath !== "/501") {
        if (import.meta.env.DEV) {
          console.log("ServerError: Navigating to role dashboard:", roleDashboardPath);
        }
        navigate(roleDashboardPath);
      } else {
        if (import.meta.env.DEV) {
          console.log("ServerError: Role dashboard not available, using fallback to /admin/dashboard");
        }
        // Fallback to admin dashboard if role path is not available
        navigate("/admin/dashboard");
      }
    } else {
      if (import.meta.env.DEV) {
        console.log("ServerError: Not authenticated, navigating to login");
      }
      navigate("/login");
    }
  }, [navigate, isAuthenticated, roleDashboardPath]);

  return (
    <div>
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-up {
            animation: slide-up 0.5s ease-out;
          }

          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          .animate-pulse-slow {
            animation: pulse-slow 3s infinite;
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }

          /* Error code styling */
          .error-code-gradient-500 {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Desktop-specific fixes */
          @media (min-width: 1024px) {
            .desktop-button-fix {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.5rem !important;
              white-space: nowrap !important;
            }
          }
        `}
      </style>

      <div className={`min-h-screen relative overflow-hidden ${themeClasses.bgGradientPrimary}`}>
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 sm:top-32 sm:left-32 lg:top-40 lg:left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-4 pt-16 sm:pt-20 lg:pt-24">
          <div className="w-full max-w-lg">
            {/* Main Card */}
            <Card className={`backdrop-blur-sm ${themeClasses.bgCard} shadow-2xl animate-slide-up p-6 lg:p-8 text-center`}>
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className={`absolute inset-0 ${themeClasses.bgGradientSecondary} rounded-full blur-lg opacity-20 animate-pulse`}></div>
                  <div className={`relative p-4 lg:p-5 rounded-full ${themeClasses.alertErrorBg || 'bg-red-50'}`}>
                    <div className="relative">
                      <ServerStackIcon className={`h-12 w-12 lg:h-16 lg:w-16 ${themeClasses.alertErrorText}`} />
                      <WrenchScrewdriverIcon className={`absolute -bottom-1 -right-1 h-6 w-6 lg:h-8 lg:w-8 ${themeClasses.alertErrorText} ${themeClasses.bgCard} rounded-full p-1 animate-spin-slow`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Code */}
              <h1 className="text-6xl lg:text-7xl font-bold mb-3 error-code-gradient-500">
                500
              </h1>

              {/* Error Message */}
              <h2 className={`text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} mb-2`}>
                {title}
              </h2>

              <p className={`${themeClasses.textSecondary} mb-5 max-w-md mx-auto text-sm lg:text-base`}>
                {message}
              </p>

              {/* Status Message */}
              <div className={`${themeClasses.alertWarningBg || 'bg-orange-50'} border ${themeClasses.borderSecondary} rounded-lg p-3 mb-5`}>
                <div className={`flex items-center justify-center text-sm ${themeClasses.alertWarningText || 'text-orange-800'}`}>
                  <div className="animate-pulse-slow flex items-center">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Our engineers are investigating the issue
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {customActions || (
                <div className="flex justify-center">
                  {isCheckingAuth ? (
                    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${themeClasses.alertErrorText}`}></div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleGoToMain}
                      className="group px-6 py-2.5 desktop-button-fix"
                      icon={isAuthenticated && userProfile ? Cog6ToothIcon : UserIcon}
                    >
                      {isAuthenticated && userProfile ? "Go to Dashboard" : "Go to Login"}
                    </Button>
                  )}
                </div>
              )}

              {/* Additional Links */}
              {showQuickLinks && !isCheckingAuth && (
                <div className={`mt-5 pt-4 border-t ${themeClasses.borderSecondary}`}>
                  <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>
                    Need immediate assistance?
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    {isAuthenticated && userProfile ? (
                      <>
                        {/* Role-specific links based on the user's role */}
                        {(userProfile.roleId === 1 || userProfile.roleId === 2 || userProfile.roleId === 3) && (
                          <Link
                            to="/admin/settings"
                            className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                          >
                            Settings
                          </Link>
                        )}
                        <Link
                          to="/admin/account"
                          className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                        >
                          Account
                        </Link>
                        <Link
                          to="/admin/help"
                          className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                        >
                          Help
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/forgot-password"
                          className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                        >
                          Forgot Password
                        </Link>
                        <a
                          href="mailto:support@workery.ca"
                          className={`${themeClasses.linkPrimary} hover:underline transition-colors`}
                        >
                          Email Support
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Footer */}
            <div className="text-center mt-5 px-4">
              <p className={`text-xs ${themeClasses.textMuted}`}>
                Error Reference: {new Date().getTime()}
              </p>
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                © 2025 Over 55 (London) Inc. All rights reserved.
              </p>
              <div className="mt-2 space-x-4">
                <Link
                  to="/privacy"
                  className={`text-xs ${themeClasses.textMuted} hover:underline transition-colors`}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className={`text-xs ${themeClasses.textMuted} hover:underline transition-colors`}
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerError(props) {
  return (
    <UIXThemeProvider>
      <ServerErrorContent {...props} />
    </UIXThemeProvider>
  );
}

export default ServerError;

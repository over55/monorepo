// File Path: web/workery-frontend/src/pages/Common/LogoutRedirector.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
import { Loading } from "../../components/UI";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

/**
 * LogoutRedirector Page
 *
 * This page handles the complete logout flow:
 * 1. Displays a logout in progress message
 * 2. Calls the logout API endpoint
 * 3. Clears all local storage and cached data
 * 4. Redirects to the login page
 */
function LogoutRedirector() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  const [logoutStatus, setLogoutStatus] = useState({
    message: "Signing out...",
    isComplete: false,
    hasError: false,
  });

  useEffect(() => {
    let mounted = true;

    const performLogout = async () => {
      try {
        // Set initial status
        if (mounted) {
          setLogoutStatus({
            message: "Signing out of your account...",
            isComplete: false,
            hasError: false,
          });
        }

        // Small delay for better UX - allows user to see the logout message
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Clear any cached account data first
        if (accountManager && accountManager.clearAllCachedData) {
          try {
            accountManager.clearAllCachedData();
            console.log("LogoutRedirector: Cleared account cache");
          } catch (error) {
            console.error(
              "LogoutRedirector: Error clearing account cache:",
              error,
            );
          }
        }

        // Clear any other cached data from localStorage
        // Get all keys that start with WORKERY_ and clear them
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("WORKERY_")) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });

        if (keysToRemove.length > 0) {
          console.log(
            `LogoutRedirector: Cleared ${keysToRemove.length} cached items`,
          );
        }

        // Clear session storage as well
        sessionStorage.clear();

        // Perform the actual logout
        await authManager.logout();

        console.log("LogoutRedirector: Logout successful");

        if (mounted) {
          setLogoutStatus({
            message: "You have been successfully signed out. Redirecting...",
            isComplete: true,
            hasError: false,
          });
        }

        // Short delay before redirect to show success message
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("LogoutRedirector: Logout error:", error);

        // Even if the API call fails, we should still clear local data
        // and redirect to login since the user intended to logout
        if (mounted) {
          setLogoutStatus({
            message: "Completing sign out...",
            isComplete: false,
            hasError: true,
          });
        }

        // Clear tokens even on error
        try {
          authManager.clearAuthData();
        } catch (clearError) {
          console.error(
            "LogoutRedirector: Error clearing auth data:",
            clearError,
          );
        }

        // Brief delay before redirect on error
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        // Always redirect to login page
        if (mounted) {
          // Clear any navigation history state
          navigate("/login", { replace: true, state: { fromLogout: true } });
        }
      }
    };

    // Start the logout process
    performLogout();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Render loading state with logout message
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ArrowRightOnRectangleIcon
              className={`w-8 h-8 ${
                logoutStatus.isComplete
                  ? "text-green-600"
                  : logoutStatus.hasError
                    ? "text-orange-600"
                    : "text-gray-600"
              }`}
            />
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {logoutStatus.isComplete ? "Sign Out Complete" : "Signing Out"}
          </h2>

          <p className="text-gray-600 mb-6">{logoutStatus.message}</p>

          {/* Loading indicator */}
          {!logoutStatus.isComplete && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Success checkmark */}
          {logoutStatus.isComplete && (
            <div className="flex justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Optional footer text */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            You will be redirected to the login page momentarily...
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogoutRedirector;

// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Common/LogoutRedirector.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../services/Services";
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

  // Use ref to prevent double execution in React StrictMode
  const logoutInitiated = useRef(false);

  const [logoutStatus, setLogoutStatus] = useState({
    message: "Signing out...",
    isComplete: false,
    hasError: false,
  });

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (logoutInitiated.current) {
      console.log("LogoutRedirector: Already running, skipping");
      return;
    }

    logoutInitiated.current = true;

    const performLogout = async () => {
      console.log("LogoutRedirector: Starting logout");

      try {
        // Update status
        setLogoutStatus({
          message: "Signing out of your account...",
          isComplete: false,
          hasError: false,
        });

        // Add a small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("LogoutRedirector: Calling authManager.logout()");

        // Call logout with a timeout to prevent hanging
        const logoutPromise = authManager.logout();
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.log("LogoutRedirector: Logout timeout reached");
            resolve();
          }, 5000); // 5 second timeout
        });

        // Wait for either logout to complete or timeout
        await Promise.race([logoutPromise, timeoutPromise]);

        console.log("LogoutRedirector: authManager.logout() completed");

        // Clear any additional cached data
        try {
          // Clear account manager cache if it exists
          if (accountManager?.clearAllCachedData) {
            accountManager.clearAllCachedData();
          }

          // Clear all WORKERY_ prefixed items from localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("WORKERY_")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // Clear session storage
          sessionStorage.clear();

          console.log("LogoutRedirector: Cleared all cached data");
        } catch (error) {
          console.error("LogoutRedirector: Error clearing cache:", error);
        }

        // Update status to complete
        setLogoutStatus({
          message: "You have been successfully signed out. Redirecting...",
          isComplete: true,
          hasError: false,
        });

        console.log("LogoutRedirector: Success, redirecting in 1 second");

        // Wait a moment before redirecting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("LogoutRedirector: Error during logout:", error);

        // Still clear tokens on error
        try {
          authManager.clearAuthData();
        } catch (e) {
          console.error("LogoutRedirector: Error clearing auth data:", e);
        }

        setLogoutStatus({
          message: "Completing sign out...",
          isComplete: true,
          hasError: true,
        });

        // Wait briefly before redirect
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Always redirect to login
      console.log("LogoutRedirector: Redirecting to login");
      navigate("/login", { replace: true, state: { fromLogout: true } });
    };

    // Start logout process
    performLogout().catch((error) => {
      console.error("LogoutRedirector: Unexpected error:", error);
      // Force redirect on any unexpected error
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    });
  }, []); // Empty dependency array

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

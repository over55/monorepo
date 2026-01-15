// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/ToTenant/Redirector.jsx
// Responsive Tenant Redirector with Countdown Animation
// Updated to use UIX components

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useTenantManager, useAuthManager } from "../../../services/Services";
import { Loading, Alert, Button, Card, UIXThemeProvider, useUIXTheme } from "../../../components/UIX";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  ClockIcon,
  LockOpenIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { BuildingOffice2Icon } from "@heroicons/react/24/solid";

function ToTenantRedirectorContent() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [accessGranted, setAccessGranted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-300",
    textMuted: getThemeClasses("text-muted") || "text-gray-500 dark:text-gray-400",
    bgPage: getThemeClasses("bg-page") || "bg-gray-50 dark:bg-gray-900",
  }), [getThemeClasses]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Countdown effect when access is granted
  useEffect(() => {
    if (accessGranted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (accessGranted && countdown === 0) {
      // Redirect when countdown reaches 0
      navigate("/admin/dashboard");
    }
  }, [accessGranted, countdown, navigate]);

  useEffect(() => {
    let mounted = true;

    if (mounted && tid) {
      console.log(
        "ToTenantRedirector: Starting executive visit for tenant:",
        tid,
      );
      setIsLoading(true);
      setErrors({});
      setStatus("Accessing tenant...");

      // Validate tenant ID
      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        setIsLoading(false);
        return;
      }

      // Execute the tenant visit
      tenantManager
        .executiveVisitsTenant(tid, onUnauthorized)
        .then((response) => {
          console.log(
            "ToTenantRedirector: Executive visit successful:",
            response,
          );
          setStatus("Access granted!");
          setIsLoading(false);
          setAccessGranted(true);
        })
        .catch((error) => {
          console.error("ToTenantRedirector: Executive visit failed:", error);
          setErrors({
            access:
              error.message || "Failed to access tenant. Please try again.",
          });
          setStatus("Access failed");
          setIsLoading(false);
          window.scrollTo(0, 0);
        });
    }

    return () => {
      mounted = false;
    };
  }, [tid, tenantManager, navigate]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`}>
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10 text-center">
          {/* Animated Loading Icon */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-100 dark:bg-blue-900 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <BuildingOffice2Icon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>

          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} mb-2 sm:mb-3`}>
            ACCESSING TENANT
          </h1>
          <p className={`text-sm sm:text-base lg:text-lg ${themeClasses.textSecondary} mb-4 sm:mb-6`}>
            {status}
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm ${themeClasses.textMuted}`}>
            <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span className="text-center">
              Please wait while we set up your tenant access...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (Object.keys(errors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10 text-center">
          {/* Error Icon */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-red-100 dark:bg-red-900 rounded-full animate-pulse opacity-50"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <XCircleIcon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} mb-2 sm:mb-3`}>
            ACCESS FAILED
          </h1>

          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {errors.tenantId && (
              <div className="px-3 sm:px-4">
                <Alert type="error">{errors.tenantId}</Alert>
              </div>
            )}
            {errors.access && (
              <div className="px-3 sm:px-4">
                <Alert type="error">{errors.access}</Alert>
              </div>
            )}
          </div>

          <div className="px-3 sm:px-4">
            <Button
              onClick={() => navigate("/root/tenants")}
              variant="secondary"
              icon={ArrowLeftIcon}
              fullWidth
              className="text-sm sm:text-base"
            >
              Back to Tenants
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render success state with countdown
  if (accessGranted) {
    // Calculate responsive SVG size
    const getCircleSize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 640) return 96; // Mobile
        if (window.innerWidth < 1024) return 112; // Tablet
        return 128; // Desktop
      }
      return 128;
    };

    const circleSize = getCircleSize();
    const radius = circleSize / 2 - 6;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10 text-center">
          {/* Success Icon with Animation */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-100 dark:bg-green-900 rounded-full animate-ping opacity-30"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <CheckCircleIcon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-green-600 dark:text-green-400 animate-bounce" />
                <LockOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400 absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 sm:p-1" />
              </div>
            </div>
          </div>

          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} mb-2 sm:mb-3`}>
            ACCESS GRANTED
          </h1>
          <p className={`text-sm sm:text-base lg:text-lg ${themeClasses.textSecondary} mb-6 sm:mb-8`}>
            Loading tenant dashboard...
          </p>

          {/* Countdown Display */}
          <div className="relative mb-6 sm:mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Circular Progress Ring - Responsive */}
                <svg
                  className="transform -rotate-90 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
                  viewBox={`0 0 ${circleSize} ${circleSize}`}
                >
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    className="stroke-blue-500 dark:stroke-blue-400"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - (3 - countdown) / 3)}
                    style={{ transition: 'all 1s linear' }}
                  />
                </svg>

                {/* Countdown Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {countdown > 0 ? (
                    <span
                      key={countdown}
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 animate-pulse"
                    >
                      {countdown}
                    </span>
                  ) : (
                    <RocketLaunchIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 dark:text-blue-400 animate-bounce" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className={`mt-3 sm:mt-4 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${themeClasses.textMuted}`}>
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </span>
            </div>
          </div>

          {/* Skip Button */}
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="ghost"
            size="sm"
            className="text-xs sm:text-sm"
          >
            Skip countdown
          </Button>
        </Card>
      </div>
    );
  }

  // Default loading state (shouldn't normally reach here)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Loading size="lg" text="Initializing..." />
    </div>
  );
}

// Wrapper component with UIXThemeProvider
function ToTenantRedirector() {
  return (
    <UIXThemeProvider>
      <ToTenantRedirectorContent />
    </UIXThemeProvider>
  );
}

export default ToTenantRedirector;

// File Path: web/workery-frontend/src/pages/Root/ToTenant/Redirector.jsx
// Modernized Tenant Redirector with Countdown Animation

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTenantManager, useAuthManager } from "../../../services/Services";
import { Loading, Alert, Button } from "../../../components/UI";
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

function ToTenantRedirector() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [accessGranted, setAccessGranted] = useState(false);
  const [countdown, setCountdown] = useState(3);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
          {/* Animated Loading Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <BuildingOffice2Icon className="h-16 w-16 text-blue-600 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ACCESSING TENANT
          </h1>
          <p className="text-gray-600 mb-6">{status}</p>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            <span>Please wait while we set up your tenant access...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (Object.keys(errors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
          {/* Error Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full animate-pulse opacity-50"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <XCircleIcon className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ACCESS FAILED
          </h1>

          <div className="space-y-3 mb-8">
            {errors.tenantId && <Alert type="error">{errors.tenantId}</Alert>}
            {errors.access && <Alert type="error">{errors.access}</Alert>}
          </div>

          <Button
            onClick={() => navigate("/root/tenants")}
            variant="secondary"
            icon={ArrowLeftIcon}
            fullWidth
          >
            Back to Tenants
          </Button>
        </div>
      </div>
    );
  }

  // Render success state with countdown
  if (accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
          {/* Success Icon with Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full animate-ping opacity-30"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <CheckCircleIcon className="h-16 w-16 text-green-600 animate-bounce" />
                <LockOpenIcon className="h-6 w-6 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ACCESS GRANTED
          </h1>
          <p className="text-gray-600 mb-8">Loading tenant dashboard...</p>

          {/* Countdown Display */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Circular Progress Ring */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - (3 - countdown) / 3)}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Countdown Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {countdown > 0 ? (
                    <span
                      key={countdown}
                      className="text-5xl font-bold text-blue-600 animate-pulse"
                    >
                      {countdown}
                    </span>
                  ) : (
                    <RocketLaunchIcon className="h-12 w-12 text-blue-600 animate-bounce" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <ClockIcon className="h-5 w-5" />
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
          >
            Skip countdown →
          </Button>
        </div>
      </div>
    );
  }

  // Default loading state (shouldn't normally reach here)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading size="lg" text="Initializing..." />
    </div>
  );
}

export default ToTenantRedirector;

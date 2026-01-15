// File Path: web/workery-frontend/src/pages/Admin/OrderHistory/LaunchpadView.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../components/UIX";
import {
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAccountManager } from "../../../services/Services";

function AdminJobHistoryLaunchpad() {
  const navigate = useNavigate();
  const accountManager = useAccountManager();
  const { getThemeClasses } = useUIXTheme();

  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch current user on mount
  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const profile = await accountManager.getAccountDetail(onUnauthorized);

        if (mounted) {
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        if (mounted) {
          setErrors({ general: "Failed to load user profile" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, [accountManager, onUnauthorized]);

  // Handle navigation to selected job history
  const handleMyJobHistoryClick = useCallback(() => {
    navigate("/admin/job-history/my-job-history");
  }, [navigate]);

  const handleTeamJobHistoryClick = useCallback(() => {
    navigate("/admin/job-history/team-job-history");
  }, [navigate]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Job History",
      icon: ChartBarIcon,
      isActive: true,
    },
  ], []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <ChartBarIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Job History (Launchpad)
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          Select which job history to view
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
            Select Job History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please select the job history to filter by
          </p>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {errors.general && (
            <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* My Job History Card */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-8 flex justify-center">
                <UserIcon className="h-24 w-24 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">My Job History</h3>
                <p className="text-gray-600 mb-6 min-h-[48px]">
                  View the job history for yourself.
                </p>
                <Button
                  onClick={handleMyJobHistoryClick}
                  variant="primary"
                  className="w-full flex items-center justify-center"
                >
                  Pick
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Team Job History Card */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-500 p-8 flex justify-center">
                <UserGroupIcon className="h-24 w-24 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Job History</h3>
                <p className="text-gray-600 mb-6 min-h-[48px]">
                  View the job history for the team.
                </p>
                <Button
                  onClick={handleTeamJobHistoryClick}
                  variant="primary"
                  className="w-full flex items-center justify-center"
                >
                  Pick
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-start pt-6 border-t border-gray-200">
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="secondary"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminJobHistoryLaunchpadWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminJobHistoryLaunchpad />
    </UIXThemeProvider>
  );
}

export default AdminJobHistoryLaunchpadWithProvider;

// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderHistory/LaunchpadView.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Alert, Breadcrumb } from "../../../components/UI";
import {
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useAccountManager } from "../../../services/Services";

function AdminJobHistoryLaunchpad() {
  const navigate = useNavigate();
  const accountManager = useAccountManager();

  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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
  }, []);

  // Handle navigation to selected job history
  const handleMyJobHistoryClick = () => {
    navigate("/admin/job-history/my-job-history");
  };

  const handleTeamJobHistoryClick = () => {
    navigate("/admin/job-history/team-job-history");
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Job History",
      icon: ChartBarIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3" />
          Job History (Launchpad)
        </h1>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-2">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Select Job History:
          </h2>
          <p className="text-gray-600">
            Please select the job history to filter by
          </p>
        </div>

        {/* Error Display */}
        {errors.general && (
          <Alert type="error" className="mb-6">
            {errors.general}
          </Alert>
        )}

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* My Job History Card */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-500 p-8 flex justify-center">
              <UserIcon className="h-24 w-24 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">My Job History</h3>
              <p className="text-gray-600 mb-6 min-h-[48px]">
                View the job history for yourself.
              </p>
              <Button
                onClick={handleMyJobHistoryClick}
                variant="primary"
                fullWidth
                className="flex items-center justify-center"
              >
                Pick
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Team Job History Card */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-500 p-8 flex justify-center">
              <UserGroupIcon className="h-24 w-24 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Team Job History</h3>
              <p className="text-gray-600 mb-6 min-h-[48px]">
                View the job history for the team.
              </p>
              <Button
                onClick={handleTeamJobHistoryClick}
                variant="primary"
                fullWidth
                className="flex items-center justify-center"
              >
                Pick
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="secondary"
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminJobHistoryLaunchpad;

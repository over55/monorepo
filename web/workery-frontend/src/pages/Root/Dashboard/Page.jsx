// File Path: web/workery-frontend/src/pages/Root/Dashboard/Page.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager, useTenantManager } from "../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../components/UI";
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingOffice2Icon,
  ChartBarIcon as ChartBarSolidIcon,
} from "@heroicons/react/24/solid";

function RootDashboardPage() {
  const authManager = useAuthManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("RootDashboard: Initiating logout...");
      await authManager.logout();
      console.log("RootDashboard: Logout successful, redirecting to login");
      navigate("/login");
    } catch (error) {
      console.error("RootDashboard: Logout failed:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      const authenticated = authManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        console.log(
          "RootDashboard: User not authenticated, redirecting to login",
        );
        navigate("/login?unauthorized=true");
      } else {
        console.log("RootDashboard: User authenticated, loading dashboard");
      }

      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Loading size="lg" text="Loading Dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert type="error">
            <div>
              <strong>Unauthorized Access</strong>
              <p className="mt-1">
                Please{" "}
                <Link to="/login" className="font-medium underline">
                  login
                </Link>{" "}
                to access this page.
              </p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      icon: HomeIcon,
    },
    {
      label: "Root Dashboard",
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Optimized for mobile */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <ChartBarSolidIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                  Root Dashboard
                </h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Better responsive padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Better mobile spacing */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Hero Card - Optimized for all screen sizes */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 sm:p-8 md:p-10 lg:p-12 text-center">
            {/* Icon - Responsive sizing */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <BuildingOffice2Icon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-white" />
              </div>
            </div>

            {/* Title - Responsive text sizing */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Organization Management
            </h2>

            {/* Description - Better mobile readability */}
            <p className="text-sm sm:text-base md:text-lg text-blue-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Manage all the organizations in your system. View, create, edit,
              and monitor tenant accounts from one centralized dashboard.
            </p>

            {/* CTA Button - Touch-friendly sizing */}
            <Link
              to="/root/tenants"
              className={`
                inline-flex items-center
                px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4
                bg-white text-blue-600
                text-sm sm:text-base font-semibold rounded-lg
                transform transition-all duration-200
                hover:scale-105 hover:shadow-xl
                focus:outline-none focus:ring-4 focus:ring-white/50
                ${isHovered ? "scale-105 shadow-xl" : ""}
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              <span className="whitespace-nowrap">View Organizations</span>
              <ArrowRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
            </Link>
          </div>

          {/* Stats Section - Always in one row */}
          <div className="bg-white p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Total Organizations
                </div>
              </div>
              <div className="text-center border-l border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Active Users
                </div>
              </div>
              <div className="text-center border-l border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Total Orders
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - 3 column layout on desktop */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                Quick Actions
              </h3>
              <Link
                to="/root/tenants/new"
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <BuildingOfficeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Create Organization
              </Link>
              <Link
                to="/root/reports"
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <ChartBarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                View Reports
              </Link>
            </div>
          </div>
        </Card>

        {/* Additional Cards Section - Stack on mobile, side-by-side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Recent Activity Card */}
          <Card>
            <div className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Recent Activity
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                No recent activity to display.
              </p>
            </div>
          </Card>

          {/* System Status Card */}
          <Card>
            <div className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                System Status
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    API Status
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Database
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default RootDashboardPage;

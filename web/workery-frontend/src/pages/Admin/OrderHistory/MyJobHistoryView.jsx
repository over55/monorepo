// File Path: web/workery-frontend/src/pages/Admin/OrderHistory/MyJobHistoryView.jsx
// @uix-page: MyJobHistoryListPage
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
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
  ArrowLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useJobHistoryManager } from "../../../services/Services";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

function AdminMyJobHistoryListView() {
  const navigate = useNavigate();
  const jobHistoryManager = useJobHistoryManager();
  const { getThemeClasses } = useUIXTheme();

  const [jobHistoryData, setJobHistoryData] = useState(null);
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

  // Fetch job history data
  useEffect(() => {
    let mounted = true;

    const fetchJobHistory = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        // Create filters map for user job history
        const filtersMap = new Map();
        filtersMap.set("filter_by", "user_job_history");

        // Fetch data using the JobHistoryManager with filters map
        const data = await jobHistoryManager.getJobHistoryWithFiltersMap(
          filtersMap,
          onUnauthorized,
          true, // force refresh
        );

        if (mounted) {
          setJobHistoryData(data);
        }
      } catch (error) {
        console.error("Failed to fetch job history:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load job history" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchJobHistory();

    // Scroll to top on mount
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [jobHistoryManager, onUnauthorized]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Job History (Launchpad)",
      to: "/admin/job-history",
      icon: ChartBarIcon,
    },
    {
      label: "My Job History",
      icon: UserIcon,
      isActive: true,
    },
  ], []);

  // Get the job history items from the response
  const jobHistoryItems = jobHistoryData?.userJobHistory || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          My Job History
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          View your recent job history
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
            List
          </h2>
          <p className="text-sm text-gray-600 mt-1">Maximum of 5 orders are listed here</p>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {errors.general && (
            <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Loading job history...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Data Table */}
              {jobHistoryItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Associate Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {/* Actions */}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobHistoryItems.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/admin/order/${row.wjid}`}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {row.wjid}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {row.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {row.associateName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateForDisplay(row.modifiedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              to={`/admin/order/${row.wjid}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              View
                              <ChevronRightIcon className="h-4 w-4 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Job History</h3>
                  <p className="text-gray-500">No job history found.</p>
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-start pt-6 mt-6 border-t border-gray-200">
            <Button
              onClick={() => navigate("/admin/job-history")}
              variant="secondary"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Job History (Launchpad)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminMyJobHistoryListViewWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminMyJobHistoryListView />
    </UIXThemeProvider>
  );
}

export default AdminMyJobHistoryListViewWithProvider;

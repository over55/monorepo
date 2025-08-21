// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderHistory/TeamJobHistoryView.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Alert,
  Table,
  Breadcrumb,
  Loading,
} from "../../../components/UI";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useJobHistoryManager } from "../../../services/Services";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

function AdminTeamJobHistoryListView() {
  const navigate = useNavigate();
  const jobHistoryManager = useJobHistoryManager();

  const [jobHistoryData, setJobHistoryData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch job history data
  useEffect(() => {
    let mounted = true;

    const fetchJobHistory = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        // Create filters map for team job history
        const filtersMap = new Map();
        filtersMap.set("filter_by", "team_job_history");

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
        console.error("Failed to fetch team job history:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load team job history" });
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
  }, []);

  // Prepare table columns
  const columns = [
    {
      header: "Job #",
      accessor: "wjid",
      render: (value, row) => (
        <Link
          to={`/admin/order/${row.wjid}`}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {value}
        </Link>
      ),
    },
    {
      header: "Client Name",
      accessor: "customerName",
    },
    {
      header: "Associate Name",
      accessor: "associateName",
    },
    {
      header: "Created",
      accessor: "modifiedAt",
      render: (value) => formatDateForDisplay(value),
    },
    {
      header: "",
      accessor: "actions",
      render: (value, row) => (
        <Link
          to={`/admin/order/${row.wjid}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      ),
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Job History (Launchpad)",
      href: "/admin/job-history",
      icon: ChartBarIcon,
    },
    {
      label: "Team Job History",
      icon: UserGroupIcon,
    },
  ];

  // Get the job history items from the response
  const jobHistoryItems = jobHistoryData?.teamJobHistory || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="h-8 w-8 mr-3" />
          Team Job History
        </h1>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-2">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            List
          </h2>
          <p className="text-gray-600">Maximum of 5 orders are listed here:</p>
        </div>

        {/* Error Display */}
        {errors.general && (
          <Alert type="error" className="mb-6">
            {errors.general}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Loading team job history..." />
          </div>
        ) : (
          <>
            {/* Data Table */}
            {jobHistoryItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table columns={columns} data={jobHistoryItems} />
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No team job history found.</p>
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 mt-6 border-t">
          <Button
            onClick={() => navigate("/admin/job-history")}
            variant="secondary"
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Job History (Launchpad)
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminTeamJobHistoryListView;

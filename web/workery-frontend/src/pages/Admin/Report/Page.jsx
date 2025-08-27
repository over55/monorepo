// File Path: monorepo/web/workery-frontend/src/pages/Admin/Report/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager, useAccountManager } from "../../../services/Services";
import {
  Breadcrumb,
  Alert,
  Card,
  Button,
  Loading,
} from "../../../components/UI";
import {
  HomeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BanknotesIcon,
  UserIcon,
  CreditCardIcon,
  XCircleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CakeIcon,
  WrenchIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  TagIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function AdminReportPage() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Define all available reports with icons
  const reports = [
    {
      id: 1,
      title: "Due Service Fees",
      description: "List due service fees for associates.",
      path: "/admin/report/1",
      category: "Financial",
      icon: BanknotesIcon,
    },
    {
      id: 2,
      title: "Associate Jobs",
      description: "List jobs by Associate.",
      path: "/admin/report/2",
      category: "Associates",
      icon: UserIcon,
    },
    {
      id: 3,
      title: "Service Fees by Types",
      description: "List revenue by service fee types.",
      path: "/admin/report/3",
      category: "Financial",
      icon: CreditCardIcon,
    },
    {
      id: 4,
      title: "Cancelled Jobs",
      description: "List all cancelled jobs.",
      path: "/admin/report/4",
      category: "Orders",
      icon: XCircleIcon,
    },
    {
      id: 5,
      title: "Associate Insurance",
      description: "List insurance due dates.",
      path: "/admin/report/5",
      category: "Associates",
      icon: ShieldCheckIcon,
    },
    {
      id: 6,
      title: "Associate Police Check",
      description: "List police check due dates.",
      path: "/admin/report/6",
      category: "Associates",
      icon: ShieldCheckIcon,
    },
    {
      id: 7,
      title: "Associate Birthdays",
      description: "List associates by birthdate.",
      path: "/admin/report/7",
      category: "Associates",
      icon: CakeIcon,
    },
    {
      id: 8,
      title: "Associate Skill Set",
      description: "List associate skill sets.",
      path: "/admin/report/8",
      category: "Associates",
      icon: WrenchIcon,
    },
    {
      id: 9,
      title: "Client Addresses",
      description: "List client addresses.",
      path: "/admin/report/9",
      category: "Clients",
      icon: UserGroupIcon,
    },
    {
      id: 10,
      title: "Residential Jobs",
      description: "List all residential jobs.",
      path: "/admin/report/10",
      category: "Orders",
      icon: HomeIcon,
    },
    {
      id: 11,
      title: "Commercial Jobs",
      description: "List only commercial jobs.",
      path: "/admin/report/11",
      category: "Orders",
      icon: BuildingOfficeIcon,
    },
    {
      id: 12,
      title: "Skill Sets",
      description: "List of all skill sets.",
      path: "/admin/report/12",
      category: "System",
      icon: BriefcaseIcon,
    },
    {
      id: 13,
      title: "Leads by Skill",
      description: "List of jobs by skill set.",
      path: "/admin/report/13",
      category: "Orders",
      icon: TagIcon,
    },
    {
      id: 15,
      title: "Associate Expiry Dates",
      description: "List upcoming expiry dates.",
      path: "/admin/report/15",
      category: "Associates",
      icon: CalendarDaysIcon,
    },
    {
      id: 16,
      title: "How Users Find Us (long)",
      description: "List how users discovered us.",
      path: "/admin/report/16",
      category: "Marketing",
      icon: GlobeAltIcon,
    },
    {
      id: 17,
      title: "How Users Find Us (short)",
      description: "List how users discovered us and referral sources.",
      path: "/admin/report/17",
      category: "Marketing",
      icon: GlobeAltIcon,
    },
    {
      id: 19,
      title: "Job Tags by Assignment Dates",
      description: "List jobs by tags using assignment dates as a filter.",
      path: "/admin/report/19",
      category: "Orders",
      icon: CalendarIcon,
    },
    {
      id: 22,
      title: "Job Tags by Completion Dates",
      description: "List jobs by tags using completion dates as a filter.",
      path: "/admin/report/22",
      category: "Orders",
      icon: CalendarIcon,
    },
    {
      id: 20,
      title: "Payments",
      description: "List all payments and related information.",
      path: "/admin/report/20",
      category: "Financial",
      icon: CreditCardIcon,
    },
    {
      id: 21,
      title: "Marketing Emails",
      description: "List all emails of consenting user's email addresses.",
      path: "/admin/report/21",
      category: "Marketing",
      icon: EnvelopeIcon,
    },
  ];

  // Group reports by category
  const reportsByCategory = reports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});

  // Get unique categories
  const categories = ["All", ...Object.keys(reportsByCategory).sort()];

  // Filter reports based on search and category
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || report.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setIsLoading(true);

        if (!authManager.isAuthenticated()) {
          navigate("/login?unauthorized=true");
          return;
        }

        const profile = await accountManager.getAccountDetail(onUnauthorized);

        if (mounted) {
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        if (mounted) {
          setError("Failed to load user information. Please try again.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    window.scrollTo(0, 0);
    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Reports",
      icon: ChartBarIcon,
    },
  ];

  if (isLoading) {
    return <Loading fullScreen message="Loading reports..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <Button onClick={() => navigate("/admin/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full xl:max-w-7xl">
      {/* Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 lg:mb-8 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2">
                Reports
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main Reports Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mr-2" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Reports
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}{" "}
                    {category !== "All" &&
                      `(${reportsByCategory[category]?.length || 0})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="p-4 sm:p-6">
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
              {filteredReports.map((report) => {
                const IconComponent = report.icon;
                return (
                  <div
                    key={report.id}
                    className="group bg-white rounded-lg shadow-sm border-2 border-slate-600 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    {/* Icon Header - Using Settings page styling */}
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-4 sm:p-6 lg:p-8 text-white flex justify-center">
                      <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />
                    </div>

                    {/* Content - Using Settings page styling */}
                    <div className="p-3 sm:p-4 flex-grow flex flex-col">
                      <div className="mb-1">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          {report.category}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 min-h-[40px] sm:min-h-[48px] lg:min-h-[56px] line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                        {report.description}
                      </p>
                    </div>

                    {/* Footer Button - Using Settings page styling */}
                    <div className="border-t border-gray-200">
                      <Link
                        to={report.path}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-blue-700 transition-colors duration-200 font-medium text-xs sm:text-sm"
                      >
                        View Report
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reports found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  variant="outline"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {filteredReports.length > 0 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Total Reports
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredReports.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Filtered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length - 1}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {reportsByCategory["Financial"]?.length || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Financial</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Section */}
      <Card className="mt-6">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Quick Access
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/admin/report/1"
              className="p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                Due Service Fees
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                View outstanding service fees
              </p>
            </Link>

            <Link
              to="/admin/report/2"
              className="p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                Associate Jobs
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Track jobs by associate
              </p>
            </Link>

            <Link
              to="/admin/report/20"
              className="p-3 sm:p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                Payments
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                View all payment transactions
              </p>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminReportPage;

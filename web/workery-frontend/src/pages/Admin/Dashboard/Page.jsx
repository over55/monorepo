import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
  useBulletinManager,
  useAssociateAwayLogManager,
} from "../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  TextArea,
} from "../../../components/UI";
import {
  ChartBarIcon,
  NewspaperIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  BellIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Constants for associate away log reasons
const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Police check expired",
};

const REASON_COMMERCIAL_INSURANCE_EXPIRED = 4;
const REASON_POLICE_CHECK_EXPIRED = 5;

function AdminDashboardPage() {
  const dashboardManager = useDashboardManager();
  const bulletinManager = useBulletinManager();
  const associateAwayLogManager = useAssociateAwayLogManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [dashboard, setDashboard] = useState({});

  // Modal states
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [bulletinText, setBulletinText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const MAX_BULLETINS_DISPLAY = 10;
  const MAX_AWAY_LOGS_DISPLAY = 10;

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch dashboard data (includes bulletins and associate away logs)
  const fetchDashboard = async () => {
    setErrors({});
    setFetching(true);

    try {
      const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
      setDashboard(dashboardData);
      console.log(
        "AdminDashboard: Dashboard data loaded successfully",
        dashboardData,
      );
    } catch (error) {
      console.error("AdminDashboard: Failed to fetch dashboard:", error);
      setErrors({ fetch: error.message || "Failed to load dashboard data" });
    } finally {
      setFetching(false);
    }
  };

  // Refresh only bulletins after create/delete operations
  const refreshDashboard = async () => {
    try {
      // Force refresh to get updated data
      const dashboardData = await dashboardManager.getDashboard(
        onUnauthorized,
        true,
      );
      setDashboard(dashboardData);
      console.log("AdminDashboard: Dashboard refreshed successfully");
    } catch (error) {
      console.error("AdminDashboard: Failed to refresh dashboard:", error);
    }
  };

  const handleCreateBulletin = async (e) => {
    e.preventDefault();

    // Validation
    if (!bulletinText.trim()) {
      setErrors({ bulletin: "Bulletin text is required" });
      return;
    }

    if (bulletinText.length > 1000) {
      setErrors({
        bulletin: "Bulletin text must be less than 1000 characters",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create the bulletin using bulletinManager
      const bulletinData = {
        text: bulletinText.trim(),
        status: 1, // Active status
      };

      await bulletinManager.createBulletin(bulletinData, onUnauthorized);

      console.log("Bulletin created successfully");

      // Clear form and close modal
      setBulletinText("");
      setShowBulletinModal(false);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to create bulletin:", error);
      setErrors({ bulletin: error.message || "Failed to create bulletin" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBulletin = async () => {
    if (!selectedBulletin) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Delete the bulletin using bulletinManager
      await bulletinManager.deleteBulletin(selectedBulletin.id, onUnauthorized);

      console.log("Bulletin deleted successfully:", selectedBulletin.id);

      // Close modal and clear selection
      setShowDeleteModal(false);
      setSelectedBulletin(null);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to delete bulletin:", error);
      setErrors({ delete: error.message || "Failed to delete bulletin" });
      // Still close the modal on error
      setShowDeleteModal(false);
      setSelectedBulletin(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get reason display with icon
  const getReasonDisplay = (awayLog) => {
    const hasExpiredDoc =
      awayLog.reason === REASON_COMMERCIAL_INSURANCE_EXPIRED ||
      awayLog.reason === REASON_POLICE_CHECK_EXPIRED;

    const reasonText =
      awayLog.reason === 1
        ? awayLog.reasonOther || "Other"
        : REASON_MAP[awayLog.reason] || "Unknown";

    return (
      <span className="flex items-center">
        {hasExpiredDoc && (
          <ShieldExclamationIcon className="w-4 h-4 mr-1 text-amber-500 flex-shrink-0" />
        )}
        <span className="truncate">{reasonText}</span>
      </span>
    );
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading fullScreen message="Loading Dashboard..." />;
  }

  // Extract data from dashboard response
  const bulletins = dashboard.bulletins || [];
  const associateAwayLogs = dashboard.associateAwayLogs || [];

  // Limit display to maximum allowed
  const displayBulletins = bulletins.slice(0, MAX_BULLETINS_DISPLAY);
  const displayAwayLogs = associateAwayLogs.slice(0, MAX_AWAY_LOGS_DISPLAY);

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const statsCards = [
    {
      title: "Clients",
      count: dashboard.clientsCount || 0,
      icon: UserGroupIcon,
      color: "blue",
      link: "/admin/customers",
      linkText: "View Clients",
      bgColor: "bg-blue-800",
    },
    {
      title: "Associates",
      count: dashboard.associatesCount || 0,
      icon: UserIcon,
      color: "purple",
      link: "/admin/associates",
      linkText: "View Associates",
      bgColor: "bg-purple-800",
    },
    {
      title: "Jobs",
      count: dashboard.jobsCount || 0,
      icon: WrenchScrewdriverIcon,
      color: "green",
      link: "/admin/orders",
      linkText: "View Jobs",
      bgColor: "bg-green-800",
    },
    {
      title: "Tasks",
      count: dashboard.tasksCount || 0,
      icon: ClipboardDocumentListIcon,
      color: "amber",
      link: "/admin/tasks",
      linkText: "View Tasks",
      bgColor: "bg-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Dashboard", icon: ChartBarIcon }]} />

        {/* Enhanced Page Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <ChartBarIcon className="w-7 h-7 text-white" />
                </div>
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 ml-16">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshDashboard()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {(errors.fetch || errors.delete) && (
          <Alert type="error" className="mb-8 shadow-lg border-red-200">
            {errors.fetch || errors.delete}
          </Alert>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className={`group relative overflow-hidden ${stat.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatNumber(stat.count)}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      {stat.title}
                    </div>
                  </div>
                </div>

                <Link
                  to={stat.link}
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg text-base font-bold text-white transition-all duration-200 border border-white/20 hover:border-white/40 group"
                >
                  {stat.linkText}
                  <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout for News and Away Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Enhanced Office News Section */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-gray-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <NewspaperIcon className="w-5 h-5 text-white" />
                    </div>
                    Office News
                  </h2>
                  {displayBulletins.length > 0 && (
                    <p className="text-gray-200 text-sm mt-1">
                      Latest {displayBulletins.length} announcements
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshDashboard()}
                    className="text-white hover:bg-white/20 border border-white hover:border-white/80"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setBulletinText("");
                      setErrors({});
                      setShowBulletinModal(true);
                    }}
                    className="bg-white text-slate-700 hover:bg-gray-50 shadow-lg border-white/20 font-medium"
                  >
                    Add News
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {displayBulletins.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {displayBulletins.map((bulletin, index) => (
                      <div
                        key={bulletin.id}
                        className="group relative bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200"
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 mr-4">
                            <div className="flex items-start mb-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <p className="text-gray-800 leading-relaxed">
                                {bulletin.text}
                              </p>
                            </div>
                            {bulletin.createdAt && (
                              <div className="flex items-center text-xs text-gray-500 ml-5">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {new Date(
                                  bulletin.createdAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBulletin(bulletin);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {bulletins.length > MAX_BULLETINS_DISPLAY && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <Link
                        to="/admin/settings/bulletins"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-medium rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300"
                      >
                        View All Bulletins ({bulletins.length} total)
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <NewspaperIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No news yet</p>
                  <p className="text-gray-500 text-sm">
                    Click "Add News" to create your first bulletin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Associate Away List Section */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-gray-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <CalendarDaysIcon className="w-5 h-5 text-white" />
                    </div>
                    Associate Away List
                  </h2>
                  {displayAwayLogs.length > 0 && (
                    <p className="text-gray-200 text-sm mt-1">
                      {displayAwayLogs.length} currently away
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshDashboard()}
                    className="text-white hover:bg-white/20 border border-white hover:border-white/80"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      navigate("/admin/settings/associate-away-log/create")
                    }
                    className="bg-white text-slate-700 hover:bg-gray-50 shadow-lg border-white/20 font-medium"
                  >
                    Add Entry
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {displayAwayLogs.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {displayAwayLogs.map((awayLog, index) => (
                      <div
                        key={awayLog.id}
                        className="group bg-gradient-to-r from-gray-50 to-amber-50/50 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-amber-200"
                        onClick={() =>
                          navigate(
                            `/admin/settings/associate-away-log/${awayLog.id}/detail`,
                          )
                        }
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/admin/associate/${awayLog.associateId}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-base mb-3 group-hover:text-blue-700 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <UserIcon className="w-4 h-4 mr-2" />
                              {awayLog.associateName ||
                                `Associate #${awayLog.associateId}`}
                            </Link>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2 font-medium">
                                  Reason:
                                </span>
                                {getReasonDisplay(awayLog)}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>
                                    From:{" "}
                                    <span className="font-medium">
                                      {formatDate(awayLog.startDate)}
                                    </span>
                                  </span>
                                </div>

                                {awayLog.untilFurtherNotice === 1 ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 font-medium rounded-full text-xs">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    Until further notice
                                  </span>
                                ) : (
                                  <span className="text-gray-600">
                                    To:{" "}
                                    <span className="font-medium">
                                      {formatDate(awayLog.untilDate)}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {associateAwayLogs.length > MAX_AWAY_LOGS_DISPLAY && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <Link
                        to="/admin/settings/associate-away-logs"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 font-medium rounded-xl transition-all duration-200 border border-amber-200 hover:border-amber-300"
                      >
                        View All Away Logs ({associateAwayLogs.length} total)
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarDaysIcon className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">
                    All associates available
                  </p>
                  <p className="text-gray-500 text-sm">
                    No associates are currently away.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Links Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-gray-700 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Squares2X2Icon className="w-5 h-5 text-white" />
              </div>
              Quick Actions
            </h2>
            <p className="text-gray-200 text-sm mt-1">
              Access frequently used features
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/job-history/my-job-history"
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-blue-200"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    My Job History
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    View your personal work order history and track your
                    completed assignments.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/job-history/team-job-history"
                className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-amber-200"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500 rounded-full -translate-y-10 translate-x-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    Team Job History
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    View the team's work order history and monitor overall team
                    performance.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/all-comments"
                className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-green-200"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full -translate-y-10 translate-x-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BellIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    Recent Comments
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    View recent comments and feedback from across the entire
                    system.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Create Bulletin Modal */}
      <Modal
        isOpen={showBulletinModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowBulletinModal(false);
            setBulletinText("");
            setErrors({});
          }
        }}
        title="Create New Bulletin"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <SparklesIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Create Office Announcement
              </span>
            </div>
            <p className="text-xs text-blue-600">
              This bulletin will be visible to all users on the dashboard.
            </p>
          </div>

          <TextArea
            label="Bulletin Text"
            value={bulletinText}
            onChange={(e) => {
              setBulletinText(e.target.value);
              if (errors.bulletin) {
                setErrors({});
              }
            }}
            placeholder="Enter your announcement here..."
            rows={5}
            error={errors.bulletin}
            required
            disabled={isSubmitting}
            className="resize-none"
          />

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {bulletinText.length}/1000 characters
            </span>
            <div
              className={`font-medium ${
                bulletinText.length > 800
                  ? "text-red-600"
                  : bulletinText.length > 600
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {bulletinText.length > 800 && "Character limit approaching"}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                if (!isSubmitting) {
                  setShowBulletinModal(false);
                  setBulletinText("");
                  setErrors({});
                }
              }}
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={(e) => handleCreateBulletin(e)}
              disabled={isSubmitting || !bulletinText.trim()}
              loading={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? "Creating..." : "Create Bulletin"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowDeleteModal(false);
            setSelectedBulletin(null);
          }
        }}
        title="Delete Bulletin"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">
                Warning: This action cannot be undone
              </span>
            </div>
            <p className="text-sm text-red-600">
              This bulletin will be permanently deleted from the system.
            </p>
          </div>

          <div>
            <p className="text-gray-700 mb-4 font-medium">
              Are you sure you want to delete this bulletin?
            </p>

            {selectedBulletin && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 italic">
                  "{selectedBulletin.text}"
                </p>
                {selectedBulletin.createdAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Created:{" "}
                    {new Date(selectedBulletin.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                if (!isSubmitting) {
                  setShowDeleteModal(false);
                  setSelectedBulletin(null);
                }
              }}
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteBulletin}
              disabled={isSubmitting}
              loading={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isSubmitting ? "Deleting..." : "Delete Bulletin"}
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboardPage;

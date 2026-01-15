// File Path: web/workery-frontend/src/pages/Admin/Dashboard/Page.jsx
// @uix-page: AdminDashboardPage
// Fully theme-aware dashboard with UIX components

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Modal,
  useUIXTheme,
  Badge,
} from "../../../components/UIX";
import {
  ChartBarIcon,
  NewspaperIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
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
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

// Constants for associate away log reasons
const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Police check expired",
  6: "Auto Insurance Expired",
  7: "WSIB Expired",
  8: "Dues Date Expired",
};

const REASON_COMMERCIAL_INSURANCE_EXPIRED = 4;
const REASON_POLICE_CHECK_EXPIRED = 5;

function AdminDashboardPage() {
  const dashboardManager = useDashboardManager();
  const bulletinManager = useBulletinManager();
  const _associateAwayLogManager = useAssociateAwayLogManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes - comprehensive set for full theme awareness
  const themeClasses = useMemo(() => ({
    bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
    bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
    cardBorder: getThemeClasses("card-border"),
    bgCard: getThemeClasses("bg-card"),
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    accentText: getThemeClasses("breadcrumb-active"),
    textWarning: getThemeClasses("text-warning"),
    textOnGradient: getThemeClasses("text-on-gradient"),
    alertErrorBg: getThemeClasses("alert-error-bg"),
    alertErrorBorder: getThemeClasses("alert-error-border"),
    alertErrorText: getThemeClasses("alert-error-text"),
    pageHeaderIconBg: getThemeClasses("page-header-icon-bg"),
    pageHeaderIcon: getThemeClasses("page-header-icon"),
    widgetHeaderBg: getThemeClasses("widget-header-bg"),
    widgetHeaderText: getThemeClasses("widget-header-text"),
    widgetHeaderIconBg: getThemeClasses("widget-header-icon-bg"),
    widgetHeaderIcon: getThemeClasses("widget-header-icon"),
    widgetHeaderSubtitle: getThemeClasses("widget-header-subtitle"),
    widgetHeaderButtonGhost: getThemeClasses("widget-header-button-ghost"),
    widgetHeaderButtonAction: getThemeClasses("widget-header-button-action"),
    statCardBg: getThemeClasses("stat-card-bg"),
    statCardIconBg: getThemeClasses("stat-card-icon-bg"),
    statCardIcon: getThemeClasses("stat-card-icon"),
    statCardText: getThemeClasses("stat-card-text"),
    statCardTextSecondary: getThemeClasses("stat-card-text-secondary"),
    statCardButton: getThemeClasses("stat-card-button"),
  }), [getThemeClasses]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch dashboard data (includes bulletins and associate away logs)
  const fetchDashboard = useCallback(async () => {
    setErrors({});
    setFetching(true);

    try {
      const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
      setDashboard(dashboardData);

      if (import.meta.env.DEV) {
        console.log("AdminDashboard: Dashboard data loaded successfully");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("AdminDashboard: Failed to fetch dashboard:", error);
      }
      setErrors({ fetch: error.message || "Failed to load dashboard data" });
    } finally {
      setFetching(false);
    }
  }, [dashboardManager, onUnauthorized]);

  // Refresh only bulletins after create/delete operations
  const refreshDashboard = useCallback(async () => {
    try {
      // Force refresh to get updated data
      const dashboardData = await dashboardManager.getDashboard(
        onUnauthorized,
        true,
      );
      setDashboard(dashboardData);

      if (import.meta.env.DEV) {
        console.log("AdminDashboard: Dashboard refreshed successfully");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("AdminDashboard: Failed to refresh dashboard:", error);
      }
    }
  }, [dashboardManager, onUnauthorized]);

  const handleCreateBulletin = useCallback(async (e) => {
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

      if (import.meta.env.DEV) {
        console.log("Bulletin created successfully");
      }

      // Clear form and close modal
      setBulletinText("");
      setShowBulletinModal(false);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to create bulletin:", error);
      }
      setErrors({ bulletin: error.message || "Failed to create bulletin" });
    } finally {
      setIsSubmitting(false);
    }
  }, [bulletinText, bulletinManager, onUnauthorized, refreshDashboard]);

  const handleDeleteBulletin = useCallback(async () => {
    if (!selectedBulletin) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Delete the bulletin using bulletinManager
      await bulletinManager.deleteBulletin(selectedBulletin.id, onUnauthorized);

      if (import.meta.env.DEV) {
        console.log("Bulletin deleted successfully:", selectedBulletin.id);
      }

      // Close modal and clear selection
      setShowDeleteModal(false);
      setSelectedBulletin(null);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to delete bulletin:", error);
      }
      setErrors({ delete: error.message || "Failed to delete bulletin" });
      // Still close the modal on error
      setShowDeleteModal(false);
      setSelectedBulletin(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBulletin, bulletinManager, onUnauthorized, refreshDashboard]);

  // Get reason display with icon
  const getReasonDisplay = useCallback((awayLog) => {
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
          <ShieldExclamationIcon className={`w-4 h-4 mr-1 ${themeClasses.textWarning || "text-amber-500"} flex-shrink-0`} />
        )}
        <span className="truncate">{reasonText}</span>
      </span>
    );
  }, [themeClasses.textWarning]);

  // Extract data from dashboard response - MUST be before any conditional returns
  const bulletins = useMemo(() => dashboard.bulletins || [], [dashboard.bulletins]);
  const associateAwayLogs = useMemo(() => dashboard.associateAwayLogs || [], [dashboard.associateAwayLogs]);

  // Limit display to maximum allowed
  const displayBulletins = useMemo(() => bulletins.slice(0, MAX_BULLETINS_DISPLAY), [bulletins]);
  const displayAwayLogs = useMemo(() => associateAwayLogs.slice(0, MAX_AWAY_LOGS_DISPLAY), [associateAwayLogs]);

  // Format numbers with commas
  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat().format(num || 0);
  }, []);

  const statsCards = useMemo(() => [
    {
      title: "Clients",
      count: dashboard.clientsCount || 0,
      icon: UserGroupIcon,
      link: "/admin/customers",
      linkText: "View Clients",
      themeClass: themeClasses.statCardBg,
    },
    {
      title: "Associates",
      count: dashboard.associatesCount || 0,
      icon: UserIcon,
      link: "/admin/associates",
      linkText: "View Associates",
      themeClass: themeClasses.statCardBg,
    },
    {
      title: "Jobs",
      count: dashboard.jobsCount || 0,
      icon: WrenchScrewdriverIcon,
      link: "/admin/orders",
      linkText: "View Jobs",
      themeClass: themeClasses.statCardBg,
    },
    {
      title: "Tasks",
      count: dashboard.tasksCount || 0,
      icon: ClipboardDocumentListIcon,
      link: "/admin/tasks",
      linkText: "View Tasks",
      themeClass: themeClasses.statCardBg,
    },
  ], [dashboard, themeClasses.statCardBg]);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      if (!mounted) return;

      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      await fetchDashboard();
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [authManager, navigate, fetchDashboard]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFetching ? (
          <div className="flex items-center justify-center py-32">
            <Loading message="Loading Dashboard..." />
          </div>
        ) : (
          <>
            {/* Enhanced Page Header */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-4xl font-bold ${themeClasses.textPrimary} flex items-center`}>
                    <div className={`w-12 h-12 ${themeClasses.pageHeaderIconBg} rounded-xl flex items-center justify-center mr-4`}>
                      <ChartBarIcon className={`w-7 h-7 ${themeClasses.pageHeaderIcon}`} />
                    </div>
                    Dashboard
                  </h1>
                </div>
                <div className="hidden lg:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshDashboard()}
                  >
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {(errors.fetch || errors.delete) && (
              <Alert type="error" className="mb-8">
                {errors.fetch || errors.delete}
              </Alert>
            )}

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {statsCards.map((stat, index) => (
                <div
                  key={stat.title}
                  className={`group relative overflow-hidden ${stat.themeClass} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 ${themeClasses.statCardIconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className={`w-6 h-6 ${themeClasses.statCardIcon}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${themeClasses.statCardText} mb-1`}>
                          {formatNumber(stat.count)}
                        </div>
                        <div className={`text-sm font-medium ${themeClasses.statCardTextSecondary}`}>
                          {stat.title}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={stat.link}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 ${themeClasses.statCardButton} backdrop-blur-sm rounded-lg text-base font-bold transition-all duration-200 group`}
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
              <Card padding="p-0" className="overflow-hidden">
                <div className={`${themeClasses.widgetHeaderBg} px-8 py-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-xl font-semibold ${themeClasses.widgetHeaderText} flex items-center`}>
                        <div className={`w-8 h-8 ${themeClasses.widgetHeaderIconBg} rounded-lg flex items-center justify-center mr-3`}>
                          <NewspaperIcon className={`w-5 h-5 ${themeClasses.widgetHeaderIcon}`} />
                        </div>
                        Office News
                      </h2>
                      {displayBulletins.length > 0 && (
                        <p className={`${themeClasses.widgetHeaderSubtitle} text-sm mt-1`}>
                          Latest {displayBulletins.length} announcements
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshDashboard()}
                        className={themeClasses.widgetHeaderButtonGhost}
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
                        className={`${themeClasses.widgetHeaderButtonAction} font-medium`}
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
                          <Card
                            key={bulletin.id}
                            padding="p-6"
                            className="group relative hover:shadow-md transition-all duration-200"
                            style={{
                              animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex-1 sm:mr-4">
                                <div className="flex items-start mb-3">
                                  <span className={`w-2 h-2 ${themeClasses.accentText} rounded-full mt-2 mr-3 flex-shrink-0`} style={{ backgroundColor: 'currentColor' }} />
                                  <p className={`${themeClasses.textPrimary} leading-relaxed`}>
                                    {bulletin.text}
                                  </p>
                                </div>
                                {bulletin.createdAt && (
                                  <div className={`flex items-center text-xs ${themeClasses.textSecondary} ml-5`}>
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
                              {/* Delete button - own row on mobile, side-by-side on tablet+ */}
                              <div className="flex justify-center mt-4 sm:mt-0 sm:block">
                                <button
                                  onClick={() => {
                                    setSelectedBulletin(bulletin);
                                    setShowDeleteModal(true);
                                  }}
                                  className="flex-shrink-0 p-2 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-red-600 dark:hover:border-red-600"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {bulletins.length > MAX_BULLETINS_DISPLAY && (
                        <div className={`mt-8 pt-6 border-t ${themeClasses.cardBorder}`}>
                          <Link
                            to="/admin/settings/bulletins"
                            className={`inline-flex items-center justify-center w-full px-4 py-3 ${themeClasses.bgCard} ${themeClasses.linkPrimary} font-medium rounded-xl transition-all duration-200 border ${themeClasses.cardBorder} hover:shadow-md`}
                          >
                            View All Bulletins ({bulletins.length} total)
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className={`w-16 h-16 ${themeClasses.bgCard} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${themeClasses.cardBorder}`}>
                        <NewspaperIcon className={`w-8 h-8 ${themeClasses.accentText}`} />
                      </div>
                      <p className={`${themeClasses.textSecondary} text-lg mb-2`}>No news yet</p>
                      <p className={`${themeClasses.textSecondary} text-sm`}>
                        Click "Add News" to create your first bulletin.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Enhanced Associate Away List Section */}
              <Card padding="p-0" className="overflow-hidden">
                <div className={`${themeClasses.widgetHeaderBg} px-8 py-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-xl font-semibold ${themeClasses.widgetHeaderText} flex items-center`}>
                        <div className={`w-8 h-8 ${themeClasses.widgetHeaderIconBg} rounded-lg flex items-center justify-center mr-3`}>
                          <CalendarDaysIcon className={`w-5 h-5 ${themeClasses.widgetHeaderIcon}`} />
                        </div>
                        Associate Away List
                      </h2>
                      {displayAwayLogs.length > 0 && (
                        <p className={`${themeClasses.widgetHeaderSubtitle} text-sm mt-1`}>
                          {displayAwayLogs.length} currently away
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshDashboard()}
                        className={themeClasses.widgetHeaderButtonGhost}
                      >
                        Refresh
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigate("/admin/settings/associate-away-log/create")
                        }
                        className={`${themeClasses.widgetHeaderButtonAction} font-medium`}
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
                          <Card
                            key={awayLog.id}
                            padding="p-6"
                            className="group hover:shadow-md transition-all duration-200 cursor-pointer"
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
                                  className={`inline-flex items-center ${themeClasses.linkPrimary} font-semibold text-base mb-3 transition-colors`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <UserIcon className="w-4 h-4 mr-2" />
                                  {awayLog.associateName ||
                                    `Associate #${awayLog.associateId}`}
                                </Link>

                                <div className={`space-y-2 text-sm ${themeClasses.textSecondary}`}>
                                  <div className="flex items-center">
                                    <span className={`${themeClasses.textSecondary} mr-2 font-medium`}>
                                      Reason:
                                    </span>
                                    {getReasonDisplay(awayLog)}
                                  </div>

                                  <div className="flex items-center">
                                    <CalendarIcon className={`w-4 h-4 mr-2 ${themeClasses.textSecondary}`} />
                                    <span>
                                      From:{" "}
                                      <span className="font-medium">
                                        {formatDateForDisplay(awayLog.startDate)}
                                      </span>
                                    </span>
                                  </div>

                                  <div className="flex items-center">
                                    {awayLog.untilFurtherNotice === 1 ? (
                                      <Badge variant="warning" size="sm" className="inline-flex items-center">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        Until further notice
                                      </Badge>
                                    ) : (
                                      <>
                                        <CalendarIcon className={`w-4 h-4 mr-2 ${themeClasses.textSecondary}`} />
                                        <span className={themeClasses.textSecondary}>
                                          To:{" "}
                                          <span className="font-medium">
                                            {formatDateForDisplay(awayLog.untilDate)}
                                          </span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRightIcon className={`w-5 h-5 ${themeClasses.textSecondary} transition-colors`} />
                            </div>
                          </Card>
                        ))}
                      </div>

                      {associateAwayLogs.length > MAX_AWAY_LOGS_DISPLAY && (
                        <div className={`mt-8 pt-6 border-t ${themeClasses.cardBorder}`}>
                          <Link
                            to="/admin/settings/associate-away-logs"
                            className={`inline-flex items-center justify-center w-full px-4 py-3 ${themeClasses.bgCard} ${themeClasses.linkPrimary} font-medium rounded-xl transition-all duration-200 border ${themeClasses.cardBorder} hover:shadow-md`}
                          >
                            View All Away Logs ({associateAwayLogs.length} total)
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className={`w-16 h-16 ${themeClasses.bgCard} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${themeClasses.cardBorder}`}>
                        <CalendarDaysIcon className={`w-8 h-8 ${themeClasses.accentText}`} />
                      </div>
                      <p className={`${themeClasses.textSecondary} text-lg mb-2`}>
                        All associates available
                      </p>
                      <p className={`${themeClasses.textSecondary} text-sm`}>
                        No associates are currently away.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Enhanced Quick Links Section */}
            <Card padding="p-0" className="overflow-hidden">
              <div className={`${themeClasses.widgetHeaderBg} px-8 py-6`}>
                <h2 className={`text-xl font-semibold ${themeClasses.widgetHeaderText} flex items-center`}>
                  <div className={`w-8 h-8 ${themeClasses.widgetHeaderIconBg} rounded-lg flex items-center justify-center mr-3`}>
                    <Squares2X2Icon className={`w-5 h-5 ${themeClasses.widgetHeaderIcon}`} />
                  </div>
                  Quick Actions
                </h2>
                <p className={`${themeClasses.widgetHeaderSubtitle} text-sm mt-1`}>
                  Access frequently used features
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    to="/admin/job-history/my-job-history"
                    className={`group relative overflow-hidden ${themeClasses.bgCard} rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border ${themeClasses.cardBorder}`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 ${themeClasses.pageHeaderIconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <UserIcon className={`w-6 h-6 ${themeClasses.pageHeaderIcon}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.textPrimary} mb-2 text-lg`}>
                        My Job History
                      </h3>
                      <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
                        View your personal work order history and track your
                        completed assignments.
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/admin/job-history/team-job-history"
                    className={`group relative overflow-hidden ${themeClasses.bgCard} rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border ${themeClasses.cardBorder}`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 ${themeClasses.pageHeaderIconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <UserGroupIcon className={`w-6 h-6 ${themeClasses.pageHeaderIcon}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.textPrimary} mb-2 text-lg`}>
                        Team Job History
                      </h3>
                      <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
                        View the team's work order history and monitor overall team
                        performance.
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/admin/all-comments"
                    className={`group relative overflow-hidden ${themeClasses.bgCard} rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border ${themeClasses.cardBorder}`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 ${themeClasses.pageHeaderIconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <BellIcon className={`w-6 h-6 ${themeClasses.pageHeaderIcon}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.textPrimary} mb-2 text-lg`}>
                        Recent Comments
                      </h3>
                      <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
                        View recent comments and feedback from across the entire
                        system.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </>
        )}
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
          <div className={`p-4 rounded-lg border ${themeClasses.bgCard} ${themeClasses.cardBorder}`}>
            <div className="flex items-center mb-2">
              <NewspaperIcon className={`w-5 h-5 mr-2 ${themeClasses.accentText}`} />
              <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                Create Office Announcement
              </span>
            </div>
            <p className={`text-xs ${themeClasses.textSecondary}`}>
              This bulletin will be visible to all users on the dashboard.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
              Bulletin Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={bulletinText}
              onChange={(e) => {
                setBulletinText(e.target.value);
                if (errors.bulletin) {
                  setErrors({});
                }
              }}
              placeholder="Enter your announcement here..."
              rows={5}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${themeClasses.bgCard} ${themeClasses.textPrimary} ${
                errors.bulletin ? "border-red-500" : themeClasses.cardBorder
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {errors.bulletin && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bulletin}</p>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className={themeClasses.textSecondary}>
              {bulletinText.length}/1000 characters
            </span>
            <div
              className={`font-medium ${
                bulletinText.length > 800
                  ? "text-red-600 dark:text-red-400"
                  : bulletinText.length > 600
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {bulletinText.length > 800 && "Character limit approaching"}
            </div>
          </div>

          <div className={`flex justify-end space-x-3 pt-4 border-t ${themeClasses.cardBorder}`}>
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
              className="px-6 py-2"
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
          <div className={`p-4 rounded-lg border ${themeClasses.alertErrorBg} ${themeClasses.alertErrorBorder}`}>
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className={`w-6 h-6 mr-2 ${themeClasses.alertErrorText}`} />
              <span className={`font-semibold ${themeClasses.alertErrorText}`}>
                Warning: This action cannot be undone
              </span>
            </div>
            <p className={`text-sm ${themeClasses.alertErrorText}`}>
              This bulletin will be permanently deleted from the system.
            </p>
          </div>

          <div>
            <p className={`${themeClasses.textPrimary} mb-4 font-medium`}>
              Are you sure you want to delete this bulletin?
            </p>

            {selectedBulletin && (
              <div className={`p-4 ${themeClasses.bgCard} rounded-lg border ${themeClasses.cardBorder}`}>
                <p className={`text-sm ${themeClasses.textPrimary} italic`}>
                  "{selectedBulletin.text}"
                </p>
                {selectedBulletin.createdAt && (
                  <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>
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

          <div className={`flex justify-end space-x-3 pt-4 border-t ${themeClasses.cardBorder}`}>
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
              className="px-6 py-2"
            >
              {isSubmitting ? "Deleting..." : "Delete Bulletin"}
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
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

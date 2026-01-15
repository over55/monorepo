// File: monorepo/web/frontend/src/components/business/views/DashboardView.jsx

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Button,
  Alert,
  Loading,
} from "../../UIX";
import { useAuthManager } from "../../../services/Services";

/**
 * DashboardView - A configurable dashboard page component
 *
 * @param {Object} config - Configuration object
 * @param {string} config.portalType - Portal identifier (e.g., "admin", "customer", "facilitator")
 * @param {string} config.title - Dashboard title (default: "Dashboard")
 * @param {string} config.subtitle - Optional subtitle/welcome message
 * @param {React.Component} config.titleIcon - Icon component for the title
 * @param {Function} config.fetchDashboardData - Async function to fetch dashboard data
 * @param {Function} config.buildStatsCards - Function to build stats cards config: (data, themeClasses) => []
 * @param {Function} config.buildSections - Function to build sections config: (data, themeClasses) => []
 * @param {Function} config.buildQuickActions - Function to build quick actions: (data, themeClasses) => []
 * @param {React.Component} config.customContent - Optional custom content component
 * @param {boolean} config.showRefreshButton - Whether to show refresh button (default: true)
 * @param {string} config.loginRedirectPath - Path to redirect on unauthorized (default: "/login")
 */
function DashboardView({ config }) {
  return (
    <UIXThemeProvider>
      <DashboardViewContent config={config} />
    </UIXThemeProvider>
  );
}

const DashboardViewContent = memo(function DashboardViewContent({ config }) {
  const {
    // eslint-disable-next-line no-unused-vars
    portalType = "admin",
    title = "Dashboard",
    subtitle,
    titleIcon: TitleIcon = ChartBarIcon,
    fetchDashboardData,
    buildStatsCards,
    buildSections,
    buildQuickActions,
    customContent: CustomContent,
    showRefreshButton = true,
    loginRedirectPath = "/login",
  } = config || {};

  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [dashboardData, setDashboardData] = useState({});

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      cardBorder: getThemeClasses("card-border"),
      bgCard: getThemeClasses("bg-card"),
      bgDisabled: getThemeClasses("bg-disabled"),
      bgSecondary: getThemeClasses("bg-secondary"),
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
      textOnWhite: getThemeClasses("text-primary"),
      pageHeaderIconBg: getThemeClasses("page-header-icon-bg"),
      pageHeaderIcon: getThemeClasses("page-header-icon"),
    }),
    [getThemeClasses]
  );

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate(`${loginRedirectPath}?unauthorized=true`);
  }, [navigate, loginRedirectPath]);

  // Fetch dashboard data
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!fetchDashboardData) return;

      setErrors({});
      setFetching(true);

      try {
        const data = await fetchDashboardData(onUnauthorized, forceRefresh);
        setDashboardData(data || {});
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("DashboardView: Failed to fetch data:", error);
        }
        setErrors({ fetch: error.message || "Failed to load dashboard data" });
      } finally {
        setFetching(false);
      }
    },
    [fetchDashboardData, onUnauthorized]
  );

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initialize
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate(`${loginRedirectPath}?unauthorized=true`);
        return;
      }

      await fetchData();
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [authManager, navigate, fetchData, loginRedirectPath]);

  // Build configurations
  const statsCards = useMemo(() => {
    if (!buildStatsCards) return [];
    return buildStatsCards(dashboardData, themeClasses);
  }, [buildStatsCards, dashboardData, themeClasses]);

  const sections = useMemo(() => {
    if (!buildSections) return [];
    return buildSections(dashboardData, themeClasses);
  }, [buildSections, dashboardData, themeClasses]);

  const quickActions = useMemo(() => {
    if (!buildQuickActions) return [];
    return buildQuickActions(dashboardData, themeClasses);
  }, [buildQuickActions, dashboardData, themeClasses]);

  // Format numbers with commas
  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat().format(num || 0);
  }, []);

  return (
    <div className={`min-h-screen ${themeClasses.bgGradientPrimary}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFetching && Object.keys(dashboardData).length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loading message="Loading Dashboard..." />
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className={`text-4xl font-bold ${themeClasses.textPrimary} flex items-center`}
                  >
                    <div
                      className={`w-12 h-12 ${themeClasses.pageHeaderIconBg} rounded-xl flex items-center justify-center mr-4`}
                    >
                      <TitleIcon className={`w-7 h-7 ${themeClasses.pageHeaderIcon}`} />
                    </div>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={`mt-2 ${themeClasses.textSecondary}`}>
                      {subtitle}
                    </p>
                  )}
                </div>
                {showRefreshButton && (
                  <div className="hidden lg:flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Error Alert */}
            {errors.fetch && (
              <Alert type="error" className="mb-8">
                {errors.fetch}
              </Alert>
            )}

            {/* Stats Cards */}
            {statsCards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <DashboardStatsCard
                    key={stat.title || index}
                    stat={stat}
                    index={index}
                    formatNumber={formatNumber}
                    themeClasses={themeClasses}
                  />
                ))}
              </div>
            )}

            {/* Custom Content */}
            {CustomContent && (
              <CustomContent
                dashboardData={dashboardData}
                themeClasses={themeClasses}
                onRefresh={handleRefresh}
                setErrors={setErrors}
                errors={errors}
              />
            )}

            {/* Sections Grid */}
            {sections.length > 0 && (
              <div
                className={`grid grid-cols-1 ${sections.length >= 2 ? "lg:grid-cols-2" : ""} gap-6 mb-8`}
              >
                {sections.map((section, index) => (
                  <DashboardSection
                    key={section.title || index}
                    section={section}
                    themeClasses={themeClasses}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <Card padding="p-0" className="overflow-hidden">
                <div
                  className={`${themeClasses.bgGradientSecondary} px-8 py-6`}
                >
                  <h2 className="text-xl font-semibold text-white">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <DashboardQuickAction
                        key={action.title || index}
                        action={action}
                        themeClasses={themeClasses}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

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
});

/**
 * DashboardStatsCard - A statistics card component
 */
const DashboardStatsCard = memo(function DashboardStatsCard({
  stat,
  index,
  formatNumber,
  themeClasses,
}) {
  const Icon = stat.icon;

  return (
    <div
      className={`group relative overflow-hidden ${stat.themeClass || themeClasses.bgGradientSecondary} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
            {Icon && <Icon className="w-6 h-6 text-white" />}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(stat.count)}
            </div>
            <div className="text-sm font-medium text-white/90">{stat.title}</div>
          </div>
        </div>

        {stat.link && stat.linkText ? (
          <Link
            to={stat.link}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg text-base font-bold text-white transition-all duration-200 border border-white/20 hover:border-white/40 group"
          >
            {stat.linkText}
            <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="h-12" />
        )}
      </div>
    </div>
  );
});

/**
 * DashboardSection - A section card with navigation items
 */
const DashboardSection = memo(function DashboardSection({
  section,
  themeClasses,
}) {
  const Icon = section.icon;

  return (
    <Card padding="p-0" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2
          className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center`}
        >
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          {section.title}
        </h2>
        {section.subtitle && (
          <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
            {section.subtitle}
          </p>
        )}
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {section.items?.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.title || index}
                to={item.link}
                className={`flex items-center justify-between p-4 ${themeClasses.bgDisabled} rounded-lg hover:${themeClasses.bgSecondary} transition-colors group`}
              >
                <div className="flex items-center">
                  {ItemIcon && (
                    <ItemIcon className={`w-6 h-6 ${item.iconColor || "text-blue-600"} mr-3`} />
                  )}
                  <div>
                    <h3 className={`font-medium ${themeClasses.textPrimary}`}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRightIcon
                  className={`w-5 h-5 ${themeClasses.textMuted} group-hover:${themeClasses.textSecondary}`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
});

/**
 * DashboardQuickAction - A quick action card
 */
const DashboardQuickAction = memo(function DashboardQuickAction({
  action,
  themeClasses,
}) {
  const Icon = action.icon;

  return (
    <Link
      to={action.link}
      className={`p-4 ${action.bgColor || "bg-blue-50"} rounded-lg hover:opacity-90 transition-colors`}
    >
      {Icon && (
        <Icon className={`w-6 h-6 ${action.iconColor || "text-blue-600"} mb-2`} />
      )}
      <h3 className={`font-medium ${themeClasses.textPrimary} mb-1`}>
        {action.title}
      </h3>
      {action.description && (
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          {action.description}
        </p>
      )}
    </Link>
  );
});

DashboardViewContent.displayName = "DashboardViewContent";
DashboardStatsCard.displayName = "DashboardStatsCard";
DashboardSection.displayName = "DashboardSection";
DashboardQuickAction.displayName = "DashboardQuickAction";

export default DashboardView;

// Export sub-components for custom composition
export { DashboardStatsCard, DashboardSection, DashboardQuickAction };

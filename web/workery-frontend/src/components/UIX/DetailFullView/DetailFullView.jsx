// File Path: src/components/UIX/DetailFullView/DetailFullView.jsx
// UIX Mobile Optimizations Applied
// Reusable DetailFullView component for comprehensive entity detail pages

import React, { useMemo, memo } from "react";
import { Link } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Button,
  Alert,
  InfoCard,
} from "../";
import { UserIcon } from "@heroicons/react/24/outline";

/**
 * Reusable DetailFullView Component
 * A complete entity detail view component that provides consistent layout and theming
 * for comprehensive detail pages with multiple information sections
 */

// Inner component that uses the theme hook
const DetailFullViewInner = memo(
  ({
    entityData,
    breadcrumbItems,
    headerConfig,
    mainInfoCard,
    contentSections,
    actionButtons,
    tabs,
    alerts,
    isLoading,
    error,
    onErrorClose,
    className,
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes for performance
    const themeClasses = useMemo(
      () => ({
        borderPrimary: getThemeClasses("border-primary") || "border-red-600",
        textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
        cardBorder: getThemeClasses("card-border") || "border-gray-200",
        textPrimary: getThemeClasses("text-primary") || "text-gray-900",
        bgDisabled: getThemeClasses("bg-disabled") || "bg-gray-100",
        textMuted: getThemeClasses("text-muted") || "text-gray-500",
        bgCard: getThemeClasses("bg-card") || "bg-white",
        // Detail header theme classes
        detailHeaderBg: getThemeClasses("detail-header-bg"),
        detailHeaderText: getThemeClasses("detail-header-text"),
        detailHeaderIcon: getThemeClasses("detail-header-icon"),
        detailButtonBack: getThemeClasses("detail-button-back"),
        detailButtonEdit: getThemeClasses("detail-button-edit"),
      }),
      [getThemeClasses],
    );

    // Memoize loading text
    const loadingText = useMemo(
      () => headerConfig.loadingText || "Loading details...",
      [headerConfig.loadingText],
    );

    // Memoize header title
    const headerTitle = useMemo(
      () => headerConfig.title || "Entity Details",
      [headerConfig.title],
    );

    // Memoize not found text
    const notFoundTitle = useMemo(
      () => headerConfig.notFoundTitle || "Item Not Found",
      [headerConfig.notFoundTitle],
    );

    const notFoundMessage = useMemo(
      () =>
        headerConfig.notFoundMessage ||
        "The item you're looking for doesn't exist or you don't have permission to view it.",
      [headerConfig.notFoundMessage],
    );

    // Memoize entity status checks
    const isArchived = useMemo(
      () => entityData && entityData.status === 2,
      [entityData],
    );

    const isBanned = useMemo(
      () => entityData && entityData.isBanned,
      [entityData],
    );

    // Memoize container classes
    const containerClasses = useMemo(
      () =>
        `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${className}`.trim(),
      [className],
    );

    // Memoize loading spinner classes
    const spinnerClasses = useMemo(
      () =>
        `animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary} mx-auto`,
      [themeClasses.borderPrimary],
    );

    // Memoize loading component
    const loadingComponent = useMemo(() => {
      if (!isLoading) return null;

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className={spinnerClasses}></div>
              <p
                className={`mt-4 text-sm sm:text-base ${themeClasses.textSecondary}`}
              >
                {loadingText}
              </p>
            </div>
          </div>
        </div>
      );
    }, [isLoading, spinnerClasses, themeClasses.textSecondary, loadingText]);

    // Memoize breadcrumb
    const breadcrumbComponent = useMemo(() => {
      if (!breadcrumbItems || breadcrumbItems.length === 0) return null;
      return <Breadcrumb items={breadcrumbItems} />;
    }, [breadcrumbItems]);

    // Memoize alerts
    const alertsComponent = useMemo(
      () => (
        <>
          {alerts.archived && isArchived && (
            <Alert
              type="info"
              message={alerts.archived.message || "This item is archived"}
              icon={alerts.archived.icon}
              className="mb-4"
            />
          )}
          {alerts.banned && isBanned && (
            <Alert
              type="error"
              message={alerts.banned.message || "This item is banned"}
              icon={alerts.banned.icon}
              className="mb-4"
            />
          )}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={onErrorClose}
              className="mb-4"
            />
          )}
        </>
      ),
      [
        alerts.archived,
        alerts.banned,
        isArchived,
        isBanned,
        error,
        onErrorClose,
      ],
    );

    // Memoize action buttons
    const actionButtonsComponent = useMemo(() => {
      if (!actionButtons || actionButtons.length === 0) return null;

      // Get theme-specific button classes based on variant
      const getButtonThemeClass = (variant) => {
        if (variant === "outline") return themeClasses.detailButtonBack;
        if (variant === "secondary") return themeClasses.detailButtonEdit;
        return "";
      };

      return (
        <div className="flex gap-2 sm:gap-3">
          {actionButtons.map((button, index) =>
            button.component ? (
              <div key={index}>{button.component}</div>
            ) : (
              <Button
                key={index}
                variant={button.variant}
                onClick={button.onClick}
                disabled={button.disabled}
                icon={button.icon}
                className={`flex-1 sm:flex-initial ${getButtonThemeClass(button.variant)}`}
              >
                {button.label}
              </Button>
            ),
          )}
        </div>
      );
    }, [actionButtons, themeClasses.detailButtonBack, themeClasses.detailButtonEdit]);

    // Memoize tabs navigation
    const tabsComponent = useMemo(() => {
      if (!tabs || tabs.length === 0) return null;

      return (
        <div className={`px-4 sm:px-6 border-b ${themeClasses.cardBorder}`}>
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) =>
              tab.isActive ? (
                <div
                  key={index}
                  className={`border-b-2 ${themeClasses.borderPrimary} py-3 sm:py-4 px-1 text-base sm:text-lg font-medium ${themeClasses.textPrimary} whitespace-nowrap flex items-center`}
                >
                  {tab.label}
                  {tab.icon && (
                    <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                  )}
                </div>
              ) : (
                <Link
                  key={index}
                  to={tab.to}
                  className={`border-b-2 border-transparent py-3 sm:py-4 px-1 text-base sm:text-lg font-medium ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:${themeClasses.cardBorder} whitespace-nowrap flex items-center`}
                >
                  {tab.label}
                  {tab.icon && (
                    <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                  )}
                </Link>
              ),
            )}
          </nav>
        </div>
      );
    }, [tabs, themeClasses]);

    // Memoize main info card
    const mainInfoCardComponent = useMemo(() => {
      if (!mainInfoCard) return null;

      return (
        <InfoCard
          title={mainInfoCard.title}
          icon={mainInfoCard.icon}
          avatar={mainInfoCard.avatar}
          primarySections={mainInfoCard.primarySections || []}
          secondarySections={mainInfoCard.secondarySections || []}
          maxWidth={mainInfoCard.maxWidth || "7xl"}
          showAvatar={mainInfoCard.showAvatar !== false}
          twoColumn={mainInfoCard.twoColumn !== false}
          className="mb-6"
        />
      );
    }, [mainInfoCard]);

    // Memoize content sections
    const contentSectionsComponent = useMemo(() => {
      if (!contentSections) return null;

      return contentSections.map((section, index) => {
        if (section.type === "infoCard") {
          return (
            <InfoCard
              key={index}
              title={section.title}
              icon={section.icon}
              avatar={section.avatar}
              primarySections={section.primarySections || []}
              secondarySections={section.secondarySections || []}
              maxWidth={section.maxWidth || "7xl"}
              showAvatar={
                section.showAvatar !== undefined ? section.showAvatar : false
              }
              twoColumn={
                section.twoColumn !== undefined ? section.twoColumn : true
              }
              className="mb-6"
            />
          );
        } else if (section.type === "detailSection") {
          return (
            <div key={index} className="mb-6">
              {section.component}
            </div>
          );
        } else if (section.type === "conditional") {
          return section.condition ? (
            <div key={index} className="mb-6">
              {section.component}
            </div>
          ) : null;
        }
        return null;
      });
    }, [contentSections]);

    // Memoize no data state
    const noDataComponent = useMemo(() => {
      if (entityData || isLoading) return null;

      return (
        <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
          <div
            className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${themeClasses.bgDisabled} rounded-full mb-4`}
          >
            <UserIcon
              className={`w-6 sm:w-8 h-6 sm:h-8 ${themeClasses.textMuted}`}
            />
          </div>
          <h3
            className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary} mb-2`}
          >
            {notFoundTitle}
          </h3>
          <p
            className={`text-sm sm:text-base ${themeClasses.textSecondary} mb-4 sm:mb-6`}
          >
            {notFoundMessage}
          </p>
          {headerConfig.notFoundAction && (
            <Button
              variant="primary"
              onClick={headerConfig.notFoundAction.onClick}
              icon={headerConfig.notFoundAction.icon}
              size="sm"
            >
              {headerConfig.notFoundAction.label}
            </Button>
          )}
        </div>
      );
    }, [
      entityData,
      isLoading,
      themeClasses,
      notFoundTitle,
      notFoundMessage,
      headerConfig.notFoundAction,
    ]);

    // Loading state - return early
    if (isLoading) {
      return loadingComponent;
    }

    return (
      <div className={containerClasses}>
        {/* Breadcrumb */}
        {breadcrumbComponent}

        {/* Status Alerts */}
        {alertsComponent}

        {/* Main Content with Header */}
        <div className="shadow-sm">
          {entityData && (
            <div className={`rounded-lg ${themeClasses.detailHeaderBg}`}>
              {/* Header with Actions */}
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <h2 className={`text-3xl sm:text-4xl font-bold ${themeClasses.detailHeaderText} flex items-center`}>
                    {headerConfig.icon && (
                      <headerConfig.icon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.detailHeaderIcon} flex-shrink-0`} />
                    )}
                    {headerTitle}
                  </h2>
                  {actionButtonsComponent}
                </div>
              </div>

              {/* Tab Navigation */}
              <div
                className={`${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`}
              >
                {tabsComponent}

                {/* Content Area */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-6">
                    {/* Main Information Card */}
                    {mainInfoCardComponent}

                    {/* Additional Content Sections */}
                    {contentSectionsComponent}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {noDataComponent}
        </div>
      </div>
    );
  },
);

// Add display name
DetailFullViewInner.displayName = "DetailFullViewInner";

// Main wrapper component that provides theme context
const DetailFullView = memo(
  ({
    // Core data
    entityData = null,
    breadcrumbItems = [],
    headerConfig = {},
    mainInfoCard = null,
    contentSections = [],
    actionButtons = [],
    tabs = [],

    // Alerts and status
    alerts = {},

    // Event handlers
    onUnauthorized = () => {},

    // State
    isLoading = false,
    error = null,
    onErrorClose = () => {},

    // Styling
    className = "",
  }) => {
    return (
      <UIXThemeProvider>
        <DetailFullViewInner
          entityData={entityData}
          breadcrumbItems={breadcrumbItems}
          headerConfig={headerConfig}
          mainInfoCard={mainInfoCard}
          contentSections={contentSections}
          actionButtons={actionButtons}
          tabs={tabs}
          alerts={alerts}
          onUnauthorized={onUnauthorized}
          isLoading={isLoading}
          error={error}
          onErrorClose={onErrorClose}
          className={className}
        />
      </UIXThemeProvider>
    );
  },
);

// Add display name
DetailFullView.displayName = "DetailFullView";

export default DetailFullView;

// Export helper function for reuse in other components
export { DetailFullView };

// File Path: web/frontend/src/components/UIX/DetailLiteView/DetailLiteView.jsx
// UIX Mobile Optimizations Applied
// Reusable DetailLiteView component for entity summary pages

import React, { useMemo, memo } from "react";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Button,
  Alert,
  Tabs,
} from "../";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

/**
 * Reusable DetailLiteView Component
 * A complete entity summary view component that provides consistent layout and theming
 */

// Inner component that uses the theme hook
const DetailLiteViewInner = memo(
  ({
    entityData,
    breadcrumbItems,
    headerConfig,
    fieldSections,
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
        badgeError: getThemeClasses("badge-error"),
        badgePrimary: getThemeClasses("badge-primary"),
        badgeSecondary: getThemeClasses("badge-secondary"),
        borderPrimary: getThemeClasses("border-primary"),
        textSecondary: getThemeClasses("text-secondary"),
        cardBorder: getThemeClasses("card-border"),
        bgDisabled: getThemeClasses("bg-disabled"),
        textMuted: getThemeClasses("text-muted"),
        textPrimary: getThemeClasses("text-primary"),
        bgCard: getThemeClasses("bg-card"),
        // Detail header theme classes
        detailHeaderBg: getThemeClasses("detail-header-bg"),
        detailHeaderText: getThemeClasses("detail-header-text"),
        detailHeaderIcon: getThemeClasses("detail-header-icon"),
        detailButtonBack: getThemeClasses("detail-button-back"),
        detailButtonEdit: getThemeClasses("detail-button-edit"),
      }),
      [getThemeClasses],
    );

    // Memoize text defaults
    const loadingText = useMemo(
      () => headerConfig.loadingText || "Loading details...",
      [headerConfig.loadingText],
    );

    const headerTitle = useMemo(
      () => headerConfig.title || "Entity Summary",
      [headerConfig.title],
    );

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

    const cardContainerClasses = useMemo(
      () =>
        `${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`,
      [themeClasses.bgCard, themeClasses.cardBorder],
    );

    const spinnerClasses = useMemo(
      () =>
        `animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary} mx-auto`,
      [themeClasses.borderPrimary],
    );

    // Memoize field section filters
    const fieldSectionsByType = useMemo(
      () => ({
        avatar: fieldSections.find((section) => section.type === "avatar"),
        primary: fieldSections.filter(
          (section) => section.column === "primary",
        ),
        secondary: fieldSections.filter(
          (section) => section.column === "secondary",
        ),
      }),
      [fieldSections],
    );

    // Create status badge component (reserved for future use)
    const _createStatusBadge = useMemo(() => {
      return (entity, statusConfig = {}) => {
        if (entity.isBanned) {
          return (
            <span
              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${themeClasses.badgeError}`}
            >
              <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              {statusConfig.bannedLabel || "Banned"}
            </span>
          );
        }
        if (entity.status === 1) {
          return (
            <span
              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${themeClasses.badgePrimary}`}
            >
              <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              {statusConfig.activeLabel || "Active"}
            </span>
          );
        }
        return (
          <span
            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${themeClasses.badgeSecondary}`}
          >
            {statusConfig.inactiveLabel || "Archived"}
          </span>
        );
      };
    }, [themeClasses]);

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

    // Memoize tabs component
    const tabsComponent = useMemo(() => {
      if (!tabs || tabs.length === 0) return null;
      return <Tabs tabs={tabs} mode="routing" />;
    }, [tabs]);

    // Memoize avatar section
    const avatarSection = useMemo(() => {
      if (!fieldSectionsByType.avatar) return null;

      return (
        <div className="flex-shrink-0 order-1 xl:order-1">
          {fieldSectionsByType.avatar.component}
        </div>
      );
    }, [fieldSectionsByType.avatar]);

    // Memoize primary column
    const primaryColumn = useMemo(() => {
      if (
        !fieldSectionsByType.primary ||
        fieldSectionsByType.primary.length === 0
      )
        return null;

      return (
        <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
          {fieldSectionsByType.primary.map((section, index) => (
            <div key={index} className={section.className || ""}>
              {section.component}
            </div>
          ))}
        </div>
      );
    }, [fieldSectionsByType.primary]);

    // Memoize secondary column
    const secondaryColumn = useMemo(() => {
      if (
        !fieldSectionsByType.secondary ||
        fieldSectionsByType.secondary.length === 0
      )
        return null;

      return (
        <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
          {fieldSectionsByType.secondary.map((section, index) => (
            <div key={index} className={section.className || ""}>
              {section.component}
            </div>
          ))}
        </div>
      );
    }, [fieldSectionsByType.secondary]);

    // Memoize no data component
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

        {/* Main Content */}
        <div className="shadow-sm">
          {entityData && (
            <div className={`rounded-lg ${themeClasses.detailHeaderBg}`}>
              {/* Header with Actions */}
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.detailHeaderText} flex items-center`}>
                    {headerConfig.icon && (
                      <headerConfig.icon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.detailHeaderIcon} flex-shrink-0`} />
                    )}
                    {headerTitle}
                  </h2>
                  {actionButtonsComponent}
                </div>
              </div>

              {/* Tab Navigation and Content */}
              <div className={cardContainerClasses}>
                {tabsComponent}

                {/* Entity Summary Layout */}
                <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                    {/* Avatar Section */}
                    {avatarSection}

                    {/* Main Content Container */}
                    <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                      {/* Primary Info Column */}
                      {primaryColumn}

                      {/* Secondary Info Column */}
                      {secondaryColumn}
                    </div>
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
DetailLiteViewInner.displayName = "DetailLiteViewInner";

// Main wrapper component that provides theme context
const DetailLiteView = memo(
  ({
    // Core data
    entityData = null,
    breadcrumbItems = [],
    headerConfig = {},
    fieldSections = [],
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
        <DetailLiteViewInner
          entityData={entityData}
          breadcrumbItems={breadcrumbItems}
          headerConfig={headerConfig}
          fieldSections={fieldSections}
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
DetailLiteView.displayName = "DetailLiteView";

export default DetailLiteView;

// Export helper function for reuse in other components
export { DetailLiteView };

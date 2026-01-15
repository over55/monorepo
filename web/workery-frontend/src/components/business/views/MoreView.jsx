// File: monorepo/web/frontend/src/components/business/views/MoreView.jsx

import React, { useMemo, useCallback } from "react";
import {
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Badge,
  Button,
  Alert,
  ContactLink,
  AddressDisplay,
  ActionCard,
  DeleteActionCard,
  Tabs,
  Card,
  Spinner,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";


// Constants for status mapping
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

/**
 * Reusable MoreView component for displaying additional actions and settings
 * Used for staff, customer, and other entity more actions pages
 *
 * @param {object} item - The main entity (staff, customer, etc.)
 * @param {string} itemType - Type of item (e.g., "Staff Member", "Customer")
 * @param {React.Component} itemIcon - Icon component for the item type
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} itemId - ID of the item for routing
 * @param {Array} tabItems - Array of tab navigation items
 * @param {Array} breadcrumbs - Breadcrumb navigation items
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message if any
 * @param {function} onErrorClear - Function to clear error
 * @param {Array} actionCards - Array of action card configurations
 * @param {string} infoMessage - Information message to display
 * @param {React.Node} additionalContent - Additional content to display
 * @param {React.Node} additionalActions - Additional action buttons
 * @param {function} onRefresh - Function to refresh data
 * @param {boolean} isFetching - Loading state for refresh
 * @param {function} buildFieldSections - Optional function to build custom field sections
 */
const MoreView = React.memo(function MoreView({
  item = null,
  itemType = "Item",
  itemIcon,
  // eslint-disable-next-line no-unused-vars
  basePath = "/admin",
  // eslint-disable-next-line no-unused-vars
  itemId,
  tabItems = [],
  breadcrumbs = [],
  loading = false,
  error = null,
  onErrorClear = null,
  actionCards = [],
  infoMessage = "Some actions may have different availability based on the item's status.",
  additionalContent = null,
  additionalActions = null,
  onRefresh = null,
  isFetching = false,
  buildFieldSections = null,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      bgMuted: getThemeClasses("bg-muted"),
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      cardBorder: getThemeClasses("card-border"),
      borderPrimary: getThemeClasses("border-primary"),
      // Detail header theme classes
      detailHeaderBg: getThemeClasses("detail-header-bg"),
      detailHeaderText: getThemeClasses("detail-header-text"),
      detailHeaderIcon: getThemeClasses("detail-header-icon"),
      detailButtonBack: getThemeClasses("detail-button-back"),
      detailButtonEdit: getThemeClasses("detail-button-edit"),
    }),
    [getThemeClasses]
  );

  // Create status badge component
  const createStatusBadge = useCallback((item) => {
    if (!item) return null;
    if (item.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (item.status === 1) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
        Archived
      </Badge>
    );
  }, []);

  // Memoize tab transformation to avoid re-mapping on every render
  const transformedTabs = useMemo(() =>
    tabItems.map(tab => ({
      ...tab,
      to: tab.href || tab.to
    })),
    [tabItems]
  );

  // Memoize field sections filtering to avoid multiple filter operations
  const fieldSections = useMemo(() => {
    if (!buildFieldSections || !item) return { avatar: [], primary: [], secondary: [] };

    const sections = buildFieldSections(item);
    return {
      avatar: sections.filter(s => s.type === 'avatar'),
      primary: sections.filter(s => s.column === 'primary'),
      secondary: sections.filter(s => s.column === 'secondary'),
    };
  }, [buildFieldSections, item]);

  // Memoize action cards rendering
  const renderedActionCards = useMemo(() =>
    actionCards.map((card, index) => {
      const CardComponent = card.key === 'delete' || card.title?.toLowerCase().includes('delete')
        ? DeleteActionCard
        : ActionCard;
      return (
        <CardComponent
          key={card.key || index}
          title={card.title}
          subtitle={card.subtitle}
          icon={card.icon}
          path={card.path}
          disabled={card.disabled}
        />
      );
    }),
    [actionCards]
  );

  // Loading state
  if (loading && !item) {
    return (
      <Card className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" padding="p-0">
        <Card className="flex items-center justify-center min-h-[400px]" padding="p-8">
          <Card padding="p-4" className="text-center border-0 shadow-none">
            <Spinner size="lg" />
            <Badge variant="info" size="md" className="mt-4">
              Loading {itemType.toLowerCase()} details...
            </Badge>
          </Card>
        </Card>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" padding="p-0">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* Status Alerts */}
      {item && item.status === 2 && (
        <Alert
          type="info"
          message={`This ${itemType.toLowerCase()} is archived`}
          icon={ArchiveBoxIcon}
          className="mb-4"
        />
      )}
      {item && item.isBanned && (
        <Alert
          type="error"
          message={`This ${itemType.toLowerCase()} is banned`}
          icon={XCircleIcon}
          className="mb-4"
        />
      )}

      {/* Error Display */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={onErrorClear}
          className="mb-4"
        />
      )}

      {/* Main Content with Header */}
      <Card padding="p-0" className="shadow-sm">
        {item && (
          <div className={`rounded-lg ${themeClasses.detailHeaderBg}`}>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className={`text-2xl sm:text-3xl font-bold ${themeClasses.detailHeaderText} flex items-center`}>
                  {itemIcon && React.createElement(itemIcon, { className: `w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.detailHeaderIcon} flex-shrink-0` })}
                  {itemType} - More
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    icon={ChevronLeftIcon}
                    className={`flex-1 sm:flex-initial ${themeClasses.detailButtonBack}`}
                  >
                    Back
                  </Button>
                  {onRefresh && (
                    <Button
                      variant="outline"
                      onClick={onRefresh}
                      icon={ArrowPathIcon}
                      disabled={isFetching}
                      className={`flex-1 sm:flex-initial ${themeClasses.detailButtonBack}`}
                    >
                      {isFetching ? "Refreshing..." : "Refresh"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation and Content */}
            <div
              className={`${themeClasses.bgCard} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`}
            >
              {tabItems.length > 0 && (
                <Tabs
                  tabs={transformedTabs}
                  mode="routing"
                />
              )}

              {/* Entity Summary Layout */}
              <Card padding="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8" className="border-0 shadow-none rounded-none">
                {buildFieldSections ? (
                  // Use custom field sections if provided
                  <Card
                    padding="p-0"
                    className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto border-0 shadow-none"
                  >
                    {/* Avatar Section */}
                    {fieldSections.avatar.map((section, idx) => (
                      <Card key={idx} padding="p-0" className="flex-shrink-0 order-1 xl:order-1 border-0 shadow-none">
                        {section.component}
                      </Card>
                    ))}

                    {/* Main Content Container */}
                    <Card
                      padding="p-0"
                      className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2 border-0 shadow-none"
                    >
                      {/* Primary Info Column */}
                      <Card padding="p-0" className="xl:flex-1 xl:min-w-0 text-center xl:text-left border-0 shadow-none">
                        {fieldSections.primary.map((section, idx) => (
                          <Card key={idx} padding="p-0" className={`border-0 shadow-none ${section.className || ''}`}>
                            {section.component}
                          </Card>
                        ))}
                      </Card>

                      {/* Secondary Info Column */}
                      <Card
                        padding="p-0"
                        className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left border-0 shadow-none"
                      >
                        {fieldSections.secondary.map((section, idx) => (
                          <Card key={idx} padding="p-0" className={`border-0 shadow-none ${section.className || ''}`}>
                            {section.component}
                          </Card>
                        ))}
                      </Card>
                    </Card>
                  </Card>
                ) : (
                  // Default entity display
                  <Card
                    padding="p-0"
                    className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto border-0 shadow-none"
                  >
                    {/* Avatar Section */}
                    <Card padding="p-0" className="flex-shrink-0 order-1 xl:order-1 border-0 shadow-none">
                      <Avatar
                        src={item.avatarObjectUrl}
                        alt={item.avatarObjectUrl ? "Profile Picture" : "No Profile Picture"}
                        size="lg"
                        borderStyle="default"
                        showFallbackIcon={true}
                      />
                    </Card>

                    {/* Main Content Container */}
                    <Card
                      padding="p-0"
                      className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2 border-0 shadow-none"
                    >
                      {/* Primary Info Column */}
                      <Card padding="p-0" className="xl:flex-1 xl:min-w-0 text-center xl:text-left border-0 shadow-none">
                        {/* Entity Name and Type */}
                        <Card padding="p-0" className="mb-3 sm:mb-4 lg:mb-5 border-0 shadow-none">
                          {item.type === 3 && item.organizationName && (
                            <Badge
                              variant="default"
                              size="lg"
                              className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start mb-2`}
                            >
                              {item.organizationName}
                            </Badge>
                          )}
                          <Badge
                            variant="default"
                            size="lg"
                            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start`}
                          >
                            {item.name || item.eventName || `${item.firstName} ${item.lastName}` || 'Unnamed Item'}
                          </Badge>
                          <Card padding="p-0" className={`mt-2 text-sm lg:text-base ${themeClasses.textSecondary} border-0 shadow-none`}>
                            <Badge variant="primary" size="md">
                              {STAFF_TYPE_MAP[item.type] || itemType}
                            </Badge>
                          </Card>
                        </Card>

                        {/* Address */}
                        <Card padding="p-0" className="mb-3 sm:mb-4 lg:mb-5 border-0 shadow-none">
                          <AddressDisplay
                            addressData={item}
                            size="md"
                            showIcon={true}
                            showMapsLink={true}
                          />
                        </Card>

                        {/* Contact Information */}
                        <Card padding="p-0" className="space-y-2 sm:space-y-3 border-0 shadow-none">
                          <ContactLink
                            type="email"
                            value={item.email}
                            size="md"
                            fallbackText="No email"
                          />
                          <ContactLink
                            type="phone"
                            value={item.phone}
                            size="md"
                            fallbackText="No phone"
                          />
                          {item.otherPhone && (
                            <ContactLink
                              type="phone"
                              value={item.otherPhone}
                              size="md"
                              fallbackText="No phone"
                            />
                          )}
                        </Card>
                      </Card>

                      {/* Secondary Info Column */}
                      <Card
                        padding="p-0"
                        className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left border-0 shadow-none"
                      >
                        <Card padding="p-0" className={`space-y-2 text-xs sm:text-sm lg:text-base ${themeClasses.textSecondary} border-0 shadow-none`}>
                          <Card padding="p-0" className="flex items-center justify-center xl:justify-start border-0 shadow-none">
                            <ClockIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`} />
                            <Badge variant="secondary" size="sm">Status:</Badge>
                            <Badge variant="default" size="sm" className="ml-2">
                              {createStatusBadge(item)}
                            </Badge>
                          </Card>
                          {item.createdAt && (
                            <Card padding="p-0" className="flex items-center justify-center xl:justify-start border-0 shadow-none">
                              <ClockIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`} />
                              <Badge variant="secondary" size="sm">Created:</Badge>
                              <Badge variant="default" size="sm" className="ml-2">
                                {formatDateForDisplay(item.createdAt)}
                              </Badge>
                            </Card>
                          )}
                          {item.modifiedAt && (
                            <Card padding="p-0" className="flex items-center justify-center xl:justify-start border-0 shadow-none">
                              <ClockIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`} />
                              <Badge variant="secondary" size="sm">Last Modified:</Badge>
                              <Badge variant="default" size="sm" className="ml-2">
                                {formatDateForDisplay(item.modifiedAt)}
                              </Badge>
                            </Card>
                          )}
                        </Card>
                      </Card>
                    </Card>
                  </Card>
                )}

                {/* Action Cards Section */}
                <Card padding="p-0" className={`mt-8 border-t ${themeClasses.cardBorder} pt-8 border-0 shadow-none rounded-none`}>
                  {/* Information Alert */}
                  {infoMessage && (
                    <Alert
                      type="info"
                      message={infoMessage}
                      icon={InformationCircleIcon}
                      className="mb-8"
                      title="Note"
                    />
                  )}

                  {/* Action Cards Grid */}
                  {actionCards.length > 0 && (
                    <Card padding="p-0" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 border-0 shadow-none">
                      {renderedActionCards}
                    </Card>
                  )}

                  {/* Additional Content */}
                  {additionalContent}

                  {/* Additional Actions */}
                  {additionalActions}
                </Card>
              </Card>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!item && !loading && (
          <Card padding="px-4 sm:px-6 py-8 sm:py-16" className="text-center">
            <Card
              padding="p-4"
              className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${themeClasses.bgMuted} rounded-full mb-4`}
            >
              {itemIcon && React.createElement(itemIcon, { className: `w-6 sm:w-8 h-6 sm:h-8 ${themeClasses.textMuted}` })}
            </Card>
            <Badge variant="primary" size="lg" className="mb-2 block">
              {itemType} Not Found
            </Badge>
            <Badge variant="secondary" size="md" className={`${themeClasses.textSecondary} mb-4 sm:mb-6 block`}>
              The {itemType.toLowerCase()} you're looking for doesn't exist or you don't have permission to view it.
            </Badge>
            <Button
              variant="primary"
              onClick={() => window.history.back()}
              icon={ChevronLeftIcon}
              size="sm"
            >
              Go Back
            </Button>
          </Card>
        )}
      </Card>
    </Card>
  );
});

export default MoreView;

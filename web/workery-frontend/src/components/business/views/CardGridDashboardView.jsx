// File: web/workery-frontend/src/components/business/views/CardGridDashboardView.jsx
// Whole page component for card grid dashboards (Settings, Reports, etc.)

import React, { useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  UIXThemeProvider,
  useUIXTheme,
  Card,
  Breadcrumb,
  PageHeader,
  Button,
  Loading,
  Alert,
} from "../../UIX";

// Theme-aware gradient configurations for cards
const THEME_GRADIENTS = {
  blue: "linear-gradient(135deg, #172554 0%, #1e3a8a 100%)",
  red: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  purple: "linear-gradient(135deg, #581c87 0%, #7c3aed 100%)",
  green: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
  charcoal: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
  dark: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
};

const THEME_HOVER_COLORS = {
  blue: "group-hover:text-blue-600",
  red: "group-hover:text-red-600",
  purple: "group-hover:text-purple-600",
  green: "group-hover:text-green-600",
  charcoal: "group-hover:text-slate-600",
  dark: "group-hover:text-blue-400",
};

const THEME_BUTTON_GRADIENTS = {
  blue: "bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100",
  red: "bg-gradient-to-r from-gray-50 to-red-50 hover:from-red-50 hover:to-red-100",
  purple: "bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-50 hover:to-purple-100",
  green: "bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-green-100",
  charcoal: "bg-gradient-to-r from-gray-50 to-slate-50 hover:from-slate-50 hover:to-slate-100",
  dark: "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500",
};

const THEME_BUTTON_TEXT_COLORS = {
  blue: "text-gray-700 hover:text-blue-950",
  red: "text-gray-700 hover:text-red-950",
  purple: "text-gray-700 hover:text-purple-950",
  green: "text-gray-700 hover:text-green-950",
  charcoal: "text-gray-700 hover:text-slate-950",
  dark: "text-gray-100 hover:text-white",
};

const THEME_CARD_BORDERS = {
  blue: "border-2 border-blue-800",
  red: "border-2 border-red-800",
  purple: "border-2 border-purple-800",
  green: "border-2 border-green-800",
  charcoal: "border-2 border-slate-700",
  dark: "border-2 border-white",
};

// Theme-aware input styling for search/filter fields
const THEME_INPUT_CLASSES = {
  blue: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  red: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  purple: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  green: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  charcoal: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  dark: "bg-gray-700 border-gray-500 text-white placeholder-gray-300",
};

const THEME_ICON_COLORS = {
  blue: "text-gray-400",
  red: "text-gray-400",
  purple: "text-gray-400",
  green: "text-gray-400",
  charcoal: "text-gray-400",
  dark: "text-gray-300",
};

const THEME_HELPER_TEXT_COLORS = {
  blue: "text-gray-500",
  red: "text-gray-500",
  purple: "text-gray-500",
  green: "text-gray-500",
  charcoal: "text-gray-500",
  dark: "text-gray-300",
};

const THEME_CLEAR_BUTTON_COLORS = {
  blue: "text-blue-600 hover:text-blue-800",
  red: "text-red-600 hover:text-red-800",
  purple: "text-purple-600 hover:text-purple-800",
  green: "text-green-600 hover:text-green-800",
  charcoal: "text-slate-600 hover:text-slate-800",
  dark: "text-blue-400 hover:text-blue-300",
};

const THEME_FOCUS_RING_COLORS = {
  blue: "focus:ring-blue-500 focus:border-blue-500",
  red: "focus:ring-red-500 focus:border-red-500",
  purple: "focus:ring-purple-500 focus:border-purple-500",
  green: "focus:ring-green-500 focus:border-green-500",
  charcoal: "focus:ring-slate-500 focus:border-slate-500",
  dark: "focus:ring-blue-400 focus:border-blue-400",
};

const THEME_STATISTICS_BG = {
  blue: "bg-gray-50",
  red: "bg-gray-50",
  purple: "bg-gray-50",
  green: "bg-gray-50",
  charcoal: "bg-gray-50",
  dark: "bg-gray-800",
};

const THEME_STATISTICS_LABEL = {
  blue: "text-gray-600",
  red: "text-gray-600",
  purple: "text-gray-600",
  green: "text-gray-600",
  charcoal: "text-gray-600",
  dark: "text-gray-300",
};

const THEME_CATEGORY_BADGE = {
  blue: "bg-gray-100 text-gray-600",
  red: "bg-gray-100 text-gray-600",
  purple: "bg-gray-100 text-gray-600",
  green: "bg-gray-100 text-gray-600",
  charcoal: "bg-gray-100 text-gray-600",
  dark: "bg-gray-700 text-gray-200",
};

const THEME_EMPTY_STATE_ICON = {
  blue: "text-gray-400",
  red: "text-gray-400",
  purple: "text-gray-400",
  green: "text-gray-400",
  charcoal: "text-gray-400",
  dark: "text-gray-500",
};

const THEME_EMPTY_STATE_TITLE = {
  blue: "text-gray-900",
  red: "text-gray-900",
  purple: "text-gray-900",
  green: "text-gray-900",
  charcoal: "text-gray-900",
  dark: "text-white",
};

const THEME_EMPTY_STATE_DESC = {
  blue: "text-gray-500",
  red: "text-gray-500",
  purple: "text-gray-500",
  green: "text-gray-500",
  charcoal: "text-gray-500",
  dark: "text-gray-400",
};

const THEME_QUICK_ACCESS_TITLE = {
  blue: "text-gray-900",
  red: "text-gray-900",
  purple: "text-gray-900",
  green: "text-gray-900",
  charcoal: "text-gray-900",
  dark: "text-white",
};

const THEME_QUICK_ACCESS_DESC = {
  blue: "text-gray-600",
  red: "text-gray-600",
  purple: "text-gray-600",
  green: "text-gray-600",
  charcoal: "text-gray-600",
  dark: "text-gray-300",
};

const THEME_QUICK_ACCESS_DEFAULT_BG = {
  blue: "bg-blue-50",
  red: "bg-red-50",
  purple: "bg-purple-50",
  green: "bg-green-50",
  charcoal: "bg-slate-100",
  dark: "bg-gray-700",
};

/**
 * CardGridDashboardView - A configurable card grid dashboard page component
 *
 * @param {Object} config - Configuration object
 * @param {Array} config.breadcrumbItems - Breadcrumb navigation items
 * @param {string} config.title - Page title
 * @param {string} config.subtitle - Optional page subtitle
 * @param {React.Component} config.titleIcon - Icon component for the title
 * @param {Array} config.items - Array of card items with { title, description, icon, path, category }
 * @param {string} config.itemLinkText - Text for item link buttons (default: "View Details")
 * @param {boolean} config.showSearch - Whether to show search input (default: false)
 * @param {boolean} config.showCategoryFilter - Whether to show category filter (default: false)
 * @param {boolean} config.showStatistics - Whether to show statistics section (default: false)
 * @param {boolean} config.showCategoryBadge - Whether to show category badge on cards (default: false)
 * @param {Function} config.buildStatistics - Function to build statistics: (filteredItems, allItems) => []
 * @param {Array} config.quickAccessItems - Optional quick access items
 * @param {React.Component} config.headerContent - Optional custom content after page header
 * @param {boolean} config.isLoading - Loading state
 * @param {string} config.error - Error message
 * @param {Function} config.onDismissError - Error dismiss handler
 */
function CardGridDashboardView({ config }) {
  return (
    <UIXThemeProvider>
      <CardGridDashboardViewContent config={config} />
    </UIXThemeProvider>
  );
}

const CardGridDashboardViewContent = memo(function CardGridDashboardViewContent({
  config,
}) {
  const { getThemeClasses, currentTheme } = useUIXTheme();

  const {
    breadcrumbItems = [],
    title = "Dashboard",
    subtitle,
    titleIcon,
    items = [],
    itemLinkText = "View Details",
    showSearch = false,
    showCategoryFilter = false,
    showStatistics = false,
    showCategoryBadge = false,
    buildStatistics,
    quickAccessItems = [],
    headerContent: HeaderContent,
    isLoading = false,
    error,
    onDismissError,
  } = config || {};

  // Local state for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      bgPrimary: getThemeClasses("bg-primary"),
      bgSecondary: getThemeClasses("bg-secondary"),
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      border: getThemeClasses("border"),
    }),
    [getThemeClasses],
  );

  // Get unique categories from items
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((item) => item.category).filter(Boolean))];
    return ["All", ...cats.sort()];
  }, [items]);

  // Group items by category for statistics
  const itemsByCategory = useMemo(() => {
    return items.reduce((acc, item) => {
      if (item.category) {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
      }
      return acc;
    }, {});
  }, [items]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  // Build statistics
  const statistics = useMemo(() => {
    if (!showStatistics || !buildStatistics) return [];
    return buildStatistics(filteredItems, items, itemsByCategory, categories);
  }, [showStatistics, buildStatistics, filteredItems, items, itemsByCategory, categories]);

  // Handlers
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("All");
  }, []);

  if (isLoading) {
    return (
      <Card
        padding="p-4"
        className={`min-h-screen ${themeClasses.bgGradientPrimary} flex items-center justify-center shadow-none border-0`}
      >
        <Loading size="lg" text="Loading..." />
      </Card>
    );
  }

  return (
    <Card
      padding="p-0"
      className={`min-h-screen ${themeClasses.bgGradientPrimary} shadow-none border-0`}
    >
      {/* Decorative background elements */}
      <Card
        padding="p-0"
        className="fixed inset-0 overflow-hidden pointer-events-none shadow-none border-0 bg-transparent"
      >
        <Card
          padding="p-0"
          className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob shadow-none border-0`}
        />
        <Card
          padding="p-0"
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 shadow-none border-0`}
        />
        <Card
          padding="p-0"
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.bgSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 shadow-none border-0`}
        />
      </Card>

      <Card
        padding="p-0"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 shadow-none border-0 bg-transparent"
      >
        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}

        {/* Page Header */}
        <PageHeader icon={titleIcon} title={title} subtitle={subtitle} />

        {/* Custom Header Content */}
        {HeaderContent && <HeaderContent />}

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={onDismissError}
            className="mb-6"
          />
        )}

        {/* Search and Filter Section */}
        {(showSearch || showCategoryFilter) && (
          <Card
            className={`mb-6 ${themeClasses.bgPrimary} shadow-lg rounded-xl ${themeClasses.border}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Search Input */}
              {showSearch && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${THEME_ICON_COLORS[currentTheme] || THEME_ICON_COLORS.blue}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full pl-9 sm:pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 ${THEME_FOCUS_RING_COLORS[currentTheme] || THEME_FOCUS_RING_COLORS.blue} ${THEME_INPUT_CLASSES[currentTheme] || THEME_INPUT_CLASSES.blue}`}
                  />
                </div>
              )}

              {/* Category Filter */}
              {showCategoryFilter && categories.length > 1 && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${THEME_ICON_COLORS[currentTheme] || THEME_ICON_COLORS.blue}`} />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`block w-full pl-9 sm:pl-10 pr-8 py-2.5 border rounded-lg text-sm focus:ring-2 ${THEME_FOCUS_RING_COLORS[currentTheme] || THEME_FOCUS_RING_COLORS.blue} appearance-none ${THEME_INPUT_CLASSES[currentTheme] || THEME_INPUT_CLASSES.blue}`}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                        {category !== "All" &&
                          ` (${itemsByCategory[category]?.length || 0})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filter Results Info */}
            {(showSearch || showCategoryFilter) && (
              <div className={`mt-3 flex items-center justify-between text-sm ${THEME_HELPER_TEXT_COLORS[currentTheme] || THEME_HELPER_TEXT_COLORS.blue}`}>
                <span>
                  Showing {filteredItems.length} of {items.length} items
                </span>
                {(searchTerm || selectedCategory !== "All") && (
                  <button
                    onClick={handleClearFilters}
                    className={`font-medium ${THEME_CLEAR_BUTTON_COLORS[currentTheme] || THEME_CLEAR_BUTTON_COLORS.blue}`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Main Grid Container */}
        <Card
          className={`${themeClasses.bgPrimary} shadow-xl rounded-2xl overflow-hidden ${themeClasses.border} hover:shadow-2xl transition-shadow duration-300`}
        >
          <Card
            padding="p-6 sm:p-8"
            className="shadow-none border-0 bg-transparent"
          >
            {filteredItems.length > 0 ? (
              <Card
                padding="p-0"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 shadow-none border-0 bg-transparent"
              >
                {filteredItems.map((item, index) => (
                  <GridCard
                    key={item.id || index}
                    item={item}
                    linkText={itemLinkText}
                    showCategoryBadge={showCategoryBadge}
                    currentTheme={currentTheme}
                    themeClasses={themeClasses}
                  />
                ))}
              </Card>
            ) : (
              <EmptyState onClearFilters={handleClearFilters} currentTheme={currentTheme} />
            )}
          </Card>

          {/* Statistics Section */}
          {showStatistics && statistics.length > 0 && filteredItems.length > 0 && (
            <div
              className={`px-6 sm:px-8 py-4 border-t ${themeClasses.border} ${THEME_STATISTICS_BG[currentTheme] || THEME_STATISTICS_BG.blue}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {statistics.map((stat, index) => (
                  <div key={stat.label || index}>
                    <p className={`text-2xl font-bold ${stat.color || themeClasses.textPrimary}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs sm:text-sm ${THEME_STATISTICS_LABEL[currentTheme] || THEME_STATISTICS_LABEL.blue}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Access Section */}
        {quickAccessItems.length > 0 && (
          <Card className={`mt-6 ${themeClasses.bgPrimary} shadow-lg rounded-xl ${themeClasses.border}`}>
            <h2 className={`text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {quickAccessItems.map((item, index) => (
                <Link
                  key={item.path || index}
                  to={item.path}
                  className={`p-3 sm:p-4 ${item.bgColor || THEME_QUICK_ACCESS_DEFAULT_BG[currentTheme] || THEME_QUICK_ACCESS_DEFAULT_BG.blue} rounded-lg hover:opacity-80 transition-colors`}
                >
                  <h3 className={`font-medium mb-1 text-sm sm:text-base ${THEME_QUICK_ACCESS_TITLE[currentTheme] || THEME_QUICK_ACCESS_TITLE.blue}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className={`text-xs sm:text-sm ${THEME_QUICK_ACCESS_DESC[currentTheme] || THEME_QUICK_ACCESS_DESC.blue}`}>
                      {item.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </Card>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Card>
  );
});

/**
 * GridCard - Individual card in the grid
 */
const GridCard = memo(function GridCard({
  item,
  linkText,
  showCategoryBadge = false,
  currentTheme,
  themeClasses,
}) {
  const IconComponent = item.icon;

  // Get theme-aware border class
  const cardBorderClass = THEME_CARD_BORDERS[currentTheme] || THEME_CARD_BORDERS.blue;

  return (
    <Card
      padding="p-0"
      className={`group ${themeClasses.bgPrimary} rounded-2xl shadow-lg ${cardBorderClass} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}
    >
      {/* Icon Header with theme-aware gradient */}
      <div
        className="p-6 text-white flex justify-center relative overflow-hidden"
        style={{
          background: THEME_GRADIENTS[currentTheme] || THEME_GRADIENTS.blue,
        }}
      >
        <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6 translate-y-12" />
        {IconComponent && (
          <IconComponent className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Category Badge - only shown if enabled */}
        {showCategoryBadge && item.category && (
          <div className="mb-2">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${THEME_CATEGORY_BADGE[currentTheme] || THEME_CATEGORY_BADGE.blue}`}>
              {item.category}
            </span>
          </div>
        )}
        <h3
          className={`text-lg font-extrabold ${themeClasses.textPrimary} mb-2 transition-colors duration-200 ${THEME_HOVER_COLORS[currentTheme] || THEME_HOVER_COLORS.blue}`}
        >
          {item.title}
        </h3>
        <p
          className={`text-sm ${themeClasses.textSecondary} line-clamp-3 mb-4 flex-grow`}
        >
          {item.description}
        </p>
      </div>

      {/* Footer Button */}
      <div className={`border-t ${themeClasses.border}`}>
        {item.path && (
          <Link
            to={item.path}
            className={`w-full p-4 ${THEME_BUTTON_GRADIENTS[currentTheme] || THEME_BUTTON_GRADIENTS.blue} flex items-center justify-between ${THEME_BUTTON_TEXT_COLORS[currentTheme] || THEME_BUTTON_TEXT_COLORS.blue} transition-all duration-200 font-extrabold`}
          >
            <span>{linkText}</span>
            <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </div>
    </Card>
  );
});

/**
 * EmptyState - Shown when no items match filters
 */
const EmptyState = memo(function EmptyState({ onClearFilters, currentTheme }) {
  return (
    <div className="text-center py-12">
      <DocumentTextIcon className={`mx-auto h-12 w-12 ${THEME_EMPTY_STATE_ICON[currentTheme] || THEME_EMPTY_STATE_ICON.blue}`} />
      <h3 className={`mt-2 text-sm font-medium ${THEME_EMPTY_STATE_TITLE[currentTheme] || THEME_EMPTY_STATE_TITLE.blue}`}>No items found</h3>
      <p className={`mt-1 text-sm ${THEME_EMPTY_STATE_DESC[currentTheme] || THEME_EMPTY_STATE_DESC.blue}`}>
        Try adjusting your search or filter criteria.
      </p>
      <div className="mt-6">
        <Button onClick={onClearFilters} variant="secondary">
          Clear filters
        </Button>
      </div>
    </div>
  );
});

// Set display names
CardGridDashboardViewContent.displayName = "CardGridDashboardViewContent";
GridCard.displayName = "GridCard";
EmptyState.displayName = "EmptyState";

export default CardGridDashboardView;

// Export sub-components for custom composition
export { GridCard, EmptyState };

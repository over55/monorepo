// File Path: web/frontend/src/components/UIX/DetailCard/DetailCard.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";

// Constants outside component to prevent recreation
const MAX_WIDTH_CLASSES = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * DetailCard Component
 * Blue-themed card for displaying information on detail pages
 * Provides consistent styling for information display sections
 *
 * @param {string} title - Card title
 * @param {React.ComponentType} icon - Icon component for header
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes for the container
 * @param {string} maxWidth - Maximum width constraint (2xl, 3xl, 4xl, 5xl, full)
 * @param {boolean} gradient - Whether to use gradient background in header (default: true)
 */
const DetailCard = memo(
  ({
    title,
    icon: Icon,
    children,
    className = "",
    maxWidth = "4xl",
    gradient = true,
    ...props
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes to prevent repeated calls
    const themeClasses = useMemo(
      () => ({
        bgCard: getThemeClasses("bg-card"),
        cardBorder: getThemeClasses("card-border"),
        shadowCard: getThemeClasses("shadow-card"),
        buttonPrimary: gradient ? null : getThemeClasses("button-primary"),
        // Use detail-card-header classes for theme-aware header styling
        detailCardHeaderBg: getThemeClasses("detail-card-header-bg"),
        detailCardHeaderText: getThemeClasses("detail-card-header-text"),
        detailCardHeaderIcon: getThemeClasses("detail-card-header-icon"),
        // Fallback to bg-gradient-secondary if detail-card-header-bg not defined
        bgGradientSecondary: gradient
          ? getThemeClasses("bg-gradient-secondary")
          : null,
      }),
      [getThemeClasses, gradient],
    );

    // Memoize the max width class
    const maxWidthClass = useMemo(
      () => MAX_WIDTH_CLASSES[maxWidth] || MAX_WIDTH_CLASSES["4xl"],
      [maxWidth],
    );

    // Memoize header classes based on gradient prop
    // Use detail-card-header-bg for theme-aware header styling
    const headerClasses = useMemo(() => {
      if (!gradient) {
        return themeClasses.buttonPrimary;
      }
      // Prefer detail-card-header-bg, fall back to bg-gradient-secondary
      return themeClasses.detailCardHeaderBg || themeClasses.bgGradientSecondary;
    }, [
      gradient,
      themeClasses.buttonPrimary,
      themeClasses.detailCardHeaderBg,
      themeClasses.bgGradientSecondary,
    ]);

    // Memoize container classes
    const containerClasses = useMemo(
      () => `${maxWidthClass} mx-auto ${className}`.trim(),
      [maxWidthClass, className],
    );

    // Memoize card classes
    const cardClasses = useMemo(
      () =>
        `${themeClasses.bgCard} ${themeClasses.shadowCard} rounded-2xl overflow-hidden border ${themeClasses.cardBorder} transition-shadow duration-300`.trim(),
      [themeClasses.bgCard, themeClasses.cardBorder, themeClasses.shadowCard],
    );

    // Memoize header content
    const headerContent = useMemo(() => {
      if (!title) return null;

      // Use theme-aware text and icon classes
      const textClass = themeClasses.detailCardHeaderText || "text-white";
      const iconClass = themeClasses.detailCardHeaderIcon || "text-white";

      return (
        <Card padding="px-6 py-4" className={`${headerClasses} shadow-none border-0`}>
          <h2 className={`text-xs sm:text-base font-bold ${textClass} uppercase tracking-wider flex items-center`}>
            {Icon && <Icon className={`w-5 h-5 mr-2 ${iconClass}`} />}
            {title}
          </h2>
        </Card>
      );
    }, [title, Icon, headerClasses, themeClasses.detailCardHeaderText, themeClasses.detailCardHeaderIcon]);

    return (
      <Card padding="p-0" className={`${containerClasses} shadow-none border-0 bg-transparent`} {...props}>
        <Card padding="p-0" className={cardClasses}>
          {/* Header */}
          {headerContent}

          {/* Content */}
          <Card padding="p-6" className="shadow-none border-0 bg-transparent">{children}</Card>
        </Card>
      </Card>
    );
  },
);

// Add display name for better debugging
DetailCard.displayName = "DetailCard";

export default DetailCard;

// File Path: src/components/UIX/InfoCard/InfoCard.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static object outside component to prevent recreation
const MAX_WIDTH_CLASSES = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * InfoCard Component - Performance Optimized
 * Modern card component for displaying entity information with gradient header and flexible content layout
 * Based on the design patterns from DetailLiteView
 *
 * Features:
 * - Theme-aware gradient header
 * - Avatar section support
 * - Two-column responsive content layout (primary/secondary)
 * - Mobile-first responsive design
 * - Flexible content sections configuration
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static objects moved outside component
 * - Memoized theme classes and sections
 * - Optimized className concatenation
 * - Prevented unnecessary re-renders
 *
 * @param {Object} props
 * @param {string} props.title - Card title for header
 * @param {React.ComponentType} props.icon - Icon component for header
 * @param {React.ReactNode} props.avatar - Avatar component to display
 * @param {Array} props.primarySections - Array of content sections for primary column
 * @param {Array} props.secondarySections - Array of content sections for secondary column
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.maxWidth - Maximum width constraint (4xl, 5xl, 6xl, 7xl, full)
 * @param {boolean} props.showAvatar - Whether to show avatar section (default: true)
 * @param {boolean} props.twoColumn - Whether to use two-column layout (default: true)
 */
const InfoCard = memo(function InfoCard({
  title,
  icon: Icon,
  avatar = null,
  primarySections = [],
  secondarySections = [],
  className = "",
  maxWidth = "6xl",
  showAvatar = true,
  twoColumn = true,
  ...props
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      cardBorder: getThemeClasses("card-border"),
      infoCardHeaderBg: getThemeClasses("info-card-header-bg"),
      infoCardHeaderText: getThemeClasses("info-card-header-text"),
      infoCardHeaderIcon: getThemeClasses("info-card-header-icon"),
      infoCardContentBg: getThemeClasses("info-card-content-bg"),
    }),
    [getThemeClasses],
  );

  // Memoize container className
  const containerClassName = useMemo(() => {
    const widthClass = MAX_WIDTH_CLASSES[maxWidth] || MAX_WIDTH_CLASSES["6xl"];
    const classes = [widthClass, "mx-auto"];
    if (className) classes.push(className);
    return classes.join(" ");
  }, [maxWidth, className]);

  // Memoize header section
  const headerSection = useMemo(() => {
    if (!title) return null;

    return (
      <div className={`px-4 sm:px-6 py-4 sm:py-5 ${themeClasses.infoCardHeaderBg}`}>
        <h2 className={`text-sm sm:text-xl lg:text-2xl font-bold ${themeClasses.infoCardHeaderText} flex items-center`}>
          {Icon && (
            <Icon className={`w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 ${themeClasses.infoCardHeaderIcon} flex-shrink-0`} />
          )}
          {title}
        </h2>
      </div>
    );
  }, [title, Icon, themeClasses.infoCardHeaderBg, themeClasses.infoCardHeaderText, themeClasses.infoCardHeaderIcon]);

  // Memoize avatar section
  const avatarSection = useMemo(() => {
    if (!showAvatar || !avatar) return null;

    return <div className="flex-shrink-0 order-1 xl:order-1">{avatar}</div>;
  }, [showAvatar, avatar]);

  // Memoize primary column sections
  const primaryColumn = useMemo(() => {
    if (!primarySections || primarySections.length === 0) return null;

    const columnClass = twoColumn ? "xl:flex-1 xl:min-w-0" : "w-full";

    return (
      <div className={`${columnClass} text-center xl:text-left`}>
        {primarySections.map((section, index) => (
          <div
            key={`primary-${index}`}
            className={section.className || "mb-4 sm:mb-6"}
          >
            {section.component}
          </div>
        ))}
      </div>
    );
  }, [primarySections, twoColumn]);

  // Memoize secondary column sections
  const secondaryColumn = useMemo(() => {
    if (!twoColumn || !secondarySections || secondarySections.length === 0)
      return null;

    return (
      <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
        {secondarySections.map((section, index) => (
          <div key={`secondary-${index}`} className={section.className || ""}>
            {section.component}
          </div>
        ))}
      </div>
    );
  }, [twoColumn, secondarySections]);

  // Memoize main content container className
  const contentContainerClassName = useMemo(() => {
    const baseClasses = "flex-1 w-full order-2 xl:order-2";
    if (twoColumn) {
      return `${baseClasses} xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0`;
    }
    return `${baseClasses} space-y-4 sm:space-y-6`;
  }, [twoColumn]);

  // Memoize content area className
  const contentAreaClassName = useMemo(() => {
    return `${themeClasses.infoCardContentBg} border-2 border-t-0 rounded-b-lg ${themeClasses.cardBorder}`;
  }, [themeClasses.cardBorder, themeClasses.infoCardContentBg]);

  // Memoize wrapper className (no longer has gradient - header has its own bg now)
  const wrapperClassName = useMemo(() => {
    return `rounded-lg overflow-hidden`;
  }, []);

  return (
    <div className={containerClassName} {...props}>
      <div className="shadow-sm">
        <div className={wrapperClassName}>
          {headerSection}

          {/* Content Area */}
          <div className={contentAreaClassName}>
            <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                {avatarSection}

                {/* Main Content Container */}
                {(primaryColumn || secondaryColumn) && (
                  <div className={contentContainerClassName}>
                    {primaryColumn}
                    {secondaryColumn}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for React DevTools
InfoCard.displayName = "InfoCard";

export default InfoCard;

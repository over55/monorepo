// File: src/components/UI/Form/FormCard.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";

// Move static object outside component to prevent recreation
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
 * FormCard Component - Performance Optimized
 * Card container with header, content, and actions sections
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static object moved outside component
 * - Memoized theme classes and sections
 * - Optimized className concatenation
 * - Prevented unnecessary re-renders
 *
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle
 * @param {React.Component} icon - Icon component
 * @param {React.ReactNode} children - Card content
 * @param {React.ReactNode} actions - Card actions
 * @param {React.ReactNode} headerAction - Optional action element in header (e.g., Edit link)
 * @param {string} className - Additional CSS classes
 * @param {string} maxWidth - Maximum width preset
 * @param {boolean} allowOverflow - Allow content overflow
 * @param {boolean} hasError - Whether to show error styling (red ring)
 */
const FormCard = memo(function FormCard({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  headerAction,
  className = "",
  maxWidth = "4xl",
  allowOverflow = false,
  hasError = false,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      bgCard: getThemeClasses("bg-card"),
      cardBorder: getThemeClasses("card-border"),
      shadowCard: getThemeClasses("shadow-card"),
      bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      bgGradientPrimary: getThemeClasses("bg-gradient-primary"),
      // Form card header theme classes
      formCardHeaderBg: getThemeClasses("form-card-header-bg"),
      formCardHeaderText: getThemeClasses("form-card-header-text"),
      formCardHeaderIcon: getThemeClasses("form-card-header-icon"),
      formCardHeaderSubtitle: getThemeClasses("form-card-header-subtitle"),
      // Error styling
      errorRing: getThemeClasses("error-ring") || "ring-2 ring-red-500",
    }),
    [getThemeClasses],
  );

  // Memoize container className
  const containerClassName = useMemo(() => {
    const widthClass = MAX_WIDTH_CLASSES[maxWidth] || MAX_WIDTH_CLASSES["4xl"];
    const classes = [widthClass, "mx-auto"];
    if (className) classes.push(className);
    return classes.join(" ");
  }, [maxWidth, className]);

  // Memoize card className
  const cardClassName = useMemo(() => {
    const classes = [
      themeClasses.bgCard,
      themeClasses.shadowCard,
      "rounded-2xl",
      "border",
      themeClasses.cardBorder,
      "transition-shadow",
      "duration-300",
    ];
    if (!allowOverflow) classes.push("overflow-hidden");
    if (hasError) classes.push(themeClasses.errorRing);
    return classes.join(" ");
  }, [themeClasses.bgCard, themeClasses.cardBorder, themeClasses.shadowCard, themeClasses.errorRing, allowOverflow, hasError]);

  // Memoize header section
  const headerSection = useMemo(() => {
    if (!title && !Icon) return null;

    // Use themed classes with fallback to gradient secondary for non-dark themes
    const headerBg = themeClasses.formCardHeaderBg || themeClasses.bgGradientSecondary;
    const headerText = themeClasses.formCardHeaderText || "text-white";
    const headerIcon = themeClasses.formCardHeaderIcon || "";
    const headerSubtitle = themeClasses.formCardHeaderSubtitle || "text-white/80";

    return (
      <Card
        padding="px-6 py-4"
        className={`!rounded-none rounded-t-2xl ${headerBg} shadow-none border-0`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xs sm:text-base font-bold uppercase tracking-wider flex items-center ${headerText}`}>
              {Icon && <Icon className={`w-5 h-5 mr-2 ${headerIcon}`} />}
              {title}
            </h2>
            {subtitle && <p className={`text-sm mt-1 ${headerSubtitle}`}>{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      </Card>
    );
  }, [title, subtitle, Icon, headerAction, themeClasses.bgGradientSecondary, themeClasses.formCardHeaderBg, themeClasses.formCardHeaderText, themeClasses.formCardHeaderIcon, themeClasses.formCardHeaderSubtitle]);

  // Memoize content section - use div instead of Card to avoid bg-card conflicts in dark mode
  const contentSection = useMemo(() => {
    if (!children) return null;

    return <div className="p-6">{children}</div>;
  }, [children]);

  // Memoize actions section
  const actionsSection = useMemo(() => {
    if (!actions) return null;

    return (
      <Card
        padding="px-6 py-4"
        className={`border-t ${themeClasses.cardBorder} ${themeClasses.bgGradientPrimary} shadow-none border-l-0 border-r-0 border-b-0`}
      >
        {actions}
      </Card>
    );
  }, [actions, themeClasses.cardBorder, themeClasses.bgGradientPrimary]);

  return (
    <Card padding="p-0" className={`${containerClassName} shadow-none border-0 bg-transparent`}>
      <Card padding="p-0" className={cardClassName}>
        {headerSection}
        {contentSection}
        {actionsSection}
      </Card>
    </Card>
  );
});

// Set display name for React DevTools
FormCard.displayName = "FormCard";

export default FormCard;

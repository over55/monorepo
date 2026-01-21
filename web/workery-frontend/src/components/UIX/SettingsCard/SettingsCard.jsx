// File: src/components/UIX/SettingsCard/SettingsCard.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Button text constant
const BUTTON_TEXT = 'Manage Settings';

/**
 * SettingsCard Component - Performance Optimized
 * Modern card design for settings dashboard pages
 * Features gradient headers, hover animations, and consistent theming
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Theme-aware styling using useUIXTheme
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handler with useCallback
 * - Memoized sections (icon header, icon, title, description, footer)
 * - Memoized style objects
 * - Prevented unnecessary re-renders
 *
 * @param {string} title - Card title
 * @param {string} description - Card description
 * @param {React.Component} icon - Icon component to display in header
 * @param {string} path - Navigation path (for Link components)
 * @param {function} action - Click handler (for button components)
 * @param {boolean} disabled - Whether the card is disabled
 * @param {string} className - Additional CSS classes
 */
const SettingsCard = memo(function SettingsCard({
  title,
  description,
  icon: Icon,
  path,
  action,
  disabled = false,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      borderLight: getThemeClasses("border-light") || "border-gray-100 dark:border-gray-700",
      textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
      textSecondary: getThemeClasses("text-secondary") || "text-gray-700 dark:text-gray-300",
      textMuted: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
      gradientEnabled: getThemeClasses("settings-card-gradient") || "bg-gradient-to-br from-red-700 to-red-600",
      gradientDisabled: getThemeClasses("settings-card-gradient-disabled") || "bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-600 dark:to-gray-500",
      hoverTextAccent: getThemeClasses("hover-text-accent") || "group-hover:text-red-600 dark:group-hover:text-red-400",
      footerGradient: getThemeClasses("settings-card-footer-gradient") || "bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20",
      footerGradientHover: getThemeClasses("settings-card-footer-gradient-hover") || "hover:from-red-50 hover:to-red-100 hover:text-red-600 dark:hover:from-red-900/20 dark:hover:to-red-900/30 dark:hover:text-red-400",
    }),
    [getThemeClasses],
  );

  // Memoize event handler to prevent unnecessary re-renders
  const handleClick = useCallback(
    (e) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      if (action) {
        action();
      }
    },
    [disabled, action],
  );

  // Memoize className strings
  const cardClassName = useMemo(() => {
    const baseClasses = `group ${themeClasses.bgCard} rounded-2xl shadow-lg border ${themeClasses.borderLight} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`;
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${baseClasses} ${disabledClasses} ${className}`.trim();
  }, [disabled, className, themeClasses]);

  const iconHeaderClassName = useMemo(() => {
    const baseClasses = `p-6 text-white flex justify-center relative overflow-hidden ${disabled ? themeClasses.gradientDisabled : themeClasses.gradientEnabled}`;
    const disabledClasses = disabled ? 'grayscale' : '';
    return `${baseClasses} ${disabledClasses}`.trim();
  }, [disabled, themeClasses]);

  const iconClassName = useMemo(() => {
    const baseClasses = 'w-12 h-12 relative z-10 transition-transform duration-300';
    const hoverClasses = disabled ? '' : 'group-hover:scale-110';
    return `${baseClasses} ${hoverClasses}`.trim();
  }, [disabled]);

  const titleClassName = useMemo(() => {
    const baseClasses = `text-sm sm:text-lg font-bold ${themeClasses.textPrimary} mb-2 transition-colors duration-200`;
    const hoverClasses = disabled ? '' : themeClasses.hoverTextAccent;
    return `${baseClasses} ${hoverClasses}`.trim();
  }, [disabled, themeClasses]);

  const footerLinkClassName = useMemo(() => {
    const baseClasses = `w-full p-4 min-h-[44px] ${themeClasses.footerGradient} flex items-center justify-between ${themeClasses.textSecondary} transition-all duration-200 font-medium touch-manipulation select-none`;
    const stateClasses = disabled
      ? 'cursor-not-allowed'
      : themeClasses.footerGradientHover;
    return `${baseClasses} ${stateClasses}`.trim();
  }, [disabled, themeClasses]);

  const chevronClassName = useMemo(() => {
    const baseClasses = 'w-5 h-5 transition-transform duration-200';
    const hoverClasses = disabled ? '' : 'group-hover:translate-x-1';
    return `${baseClasses} ${hoverClasses}`.trim();
  }, [disabled]);

  // Memoize icon section
  const iconSection = useMemo(() => {
    if (!Icon) return null;
    return <Icon className={iconClassName} />;
  }, [Icon, iconClassName]);

  // Memoize description section
  const descriptionSection = useMemo(() => {
    if (!description) return null;
    return (
      <p className={`text-sm ${themeClasses.textMuted} line-clamp-3 mb-4 flex-grow`}>
        {description}
      </p>
    );
  }, [description, themeClasses]);

  // Memoize footer section
  const footerSection = useMemo(() => {
    const linkContent = (
      <>
        <span>{BUTTON_TEXT}</span>
        <ChevronRightIcon className={chevronClassName} />
      </>
    );

    if (path) {
      return (
        <Link
          to={disabled ? '#' : path}
          className={footerLinkClassName}
          onClick={handleClick}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {linkContent}
        </Link>
      );
    }

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={footerLinkClassName}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {linkContent}
      </button>
    );
  }, [path, disabled, footerLinkClassName, chevronClassName, handleClick]);

  return (
    <div className={cardClassName}>
      {/* Icon Header with gradient theme */}
      <div className={iconHeaderClassName}>
        <div className="absolute inset-0 bg-white/10 transform -skew-y-6 translate-y-12"></div>
        {iconSection}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={titleClassName}>
          {title}
        </h3>
        {descriptionSection}
      </div>

      {/* Footer Button */}
      <div className={`border-t ${themeClasses.borderLight}`}>
        {footerSection}
      </div>
    </div>
  );
});

// Set display name for React DevTools
SettingsCard.displayName = 'SettingsCard';

export default SettingsCard;

// File: src/components/UIX/PageHeader/PageHeader.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from 'react';
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";

/**
 * PageHeader Component - Performance Optimized
 * Header section for pages with icon, title, subtitle, and action buttons
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Memoized sections (icon, subtitle, unsaved changes, actions)
 * - Prevented unnecessary re-renders
 *
 * @param {React.Component} icon - Icon component
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {Array} actions - Array of action button components
 * @param {boolean} hasChanges - Show unsaved changes indicator
 * @param {string} className - Additional CSS classes
 */
const PageHeader = memo(function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions = [],
  hasChanges = false,
  className = '',
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      bgGradientSecondary: getThemeClasses('bg-gradient-secondary'),
      alertInfoText: getThemeClasses('alert-info-text'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      pageHeaderIconBg: getThemeClasses('page-header-icon-bg'),
      pageHeaderIcon: getThemeClasses('page-header-icon'),
    }),
    [getThemeClasses],
  );

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className
      ? `mb-8 sm:mb-10 max-w-4xl mx-auto ${className}`
      : 'mb-8 sm:mb-10 max-w-4xl mx-auto';
  }, [className]);

  // Memoize icon section
  const iconSection = useMemo(() => {
    if (!Icon) return null;

    return (
      <Card
        padding="p-3"
        className={`rounded-2xl shadow-lg mr-4 flex-shrink-0 ${themeClasses.pageHeaderIconBg} border-0`}
      >
        <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${themeClasses.pageHeaderIcon}`} />
      </Card>
    );
  }, [Icon, themeClasses.pageHeaderIconBg, themeClasses.pageHeaderIcon]);

  // Memoize subtitle section
  const subtitleSection = useMemo(() => {
    if (!subtitle) return null;

    return (
      <Card
        padding="p-0"
        className={`mt-2 text-base sm:text-lg lg:text-xl ${themeClasses.textSecondary} font-medium shadow-none border-0 bg-transparent`}
      >
        {subtitle}
      </Card>
    );
  }, [subtitle, themeClasses.textSecondary]);

  // Memoize unsaved changes indicator
  const unsavedChangesIndicator = useMemo(() => {
    if (!hasChanges) return null;

    return (
      <Card
        padding="p-0"
        className={`mt-2 flex items-center justify-center lg:justify-start text-sm font-medium ${themeClasses.alertInfoText} shadow-none border-0 bg-transparent`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        Unsaved changes
      </Card>
    );
  }, [hasChanges, themeClasses.alertInfoText]);

  // Memoize actions section
  const actionsSection = useMemo(() => {
    // Handle no actions
    if (!actions) return null;

    // Handle array of actions
    if (Array.isArray(actions)) {
      if (actions.length === 0) return null;
      return (
        <Card padding="p-0" className="flex-shrink-0 flex items-center gap-3 shadow-none border-0 bg-transparent">
          {actions.map((action, index) => (
            <Card key={action?.key || `action-${index}`} padding="p-0" className="shadow-none border-0 bg-transparent">
              {action}
            </Card>
          ))}
        </Card>
      );
    }

    // Handle single action element (not an array)
    return (
      <Card padding="p-0" className="flex-shrink-0 flex items-center gap-3 shadow-none border-0 bg-transparent">
        {actions}
      </Card>
    );
  }, [actions]);

  return (
    <Card padding="p-0" className={`${containerClassName} shadow-none border-0 bg-transparent`}>
      <Card padding="p-0" className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0 shadow-none border-0 bg-transparent">
        <Card padding="p-0" className="flex-1 min-w-0 shadow-none border-0 bg-transparent">
          <Card padding="p-0" className="flex items-start shadow-none border-0 bg-transparent">
            {iconSection}
            <Card padding="p-0" className="text-center lg:text-left shadow-none border-0 bg-transparent">
              <Card
                padding="p-0"
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textPrimary} leading-tight shadow-none border-0 bg-transparent`}
              >
                {title}
              </Card>
              {subtitleSection}
              {unsavedChangesIndicator}
            </Card>
          </Card>
        </Card>
        {actionsSection}
      </Card>
    </Card>
  );
});

// Set display name for React DevTools
PageHeader.displayName = 'PageHeader';

export default PageHeader;

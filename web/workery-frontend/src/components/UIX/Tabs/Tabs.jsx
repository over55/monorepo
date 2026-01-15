// File: src/components/UIX/Tabs/Tabs.jsx
// UIX Mobile Optimizations Applied
// Tabs Component - Performance Optimized

import React, { memo, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Tabs Component - Performance Optimized
 * Enhanced tab navigation interface with responsive design and icon support
 *
 * @param {Array} tabs - Array of tab objects with id, label, icon (optional), to (optional), isActive (optional)
 * @param {string} activeTab - Active tab id (used when onTabChange is provided)
 * @param {function} onTabChange - Tab change handler for callback mode
 * @param {string} className - Additional CSS classes
 * @param {string} mode - 'callback' for onClick behavior, 'routing' for href navigation (default: 'callback')
 */

// Tab Item Component - Separated for performance
const TabItem = memo(
  function TabItem({ tab, isActive, mode, onTabChange, themeClasses }) {
    // Memoize click handler
    const handleClick = useCallback(() => {
      if (onTabChange && tab.id) {
        onTabChange(tab.id);
      }
    }, [onTabChange, tab.id]);

    // Memoize icon element
    const IconElement = useMemo(() => {
      if (!tab.icon) return null;
      return <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />;
    }, [tab.icon]);

    // Memoize classes based on active state with mobile optimizations
    const tabClasses = useMemo(() => {
      const baseClasses = [
        "border-b-2",
        "py-3",
        "sm:py-4",
        "px-2",
        "min-h-[44px]",
        "text-base",
        "sm:text-lg",
        "font-medium",
        "whitespace-nowrap",
        "flex",
        "items-center",
        "touch-manipulation",
        "select-none",
      ];

      if (isActive) {
        baseClasses.push(themeClasses.borderPrimary, themeClasses.textPrimary);
      } else {
        baseClasses.push(
          "border-transparent",
          themeClasses.textSecondary,
          themeClasses.hoverTextPrimary,
          themeClasses.hoverBorderMuted,
          "transition-colors",
          "duration-200",
        );
      }

      return baseClasses.filter(Boolean).join(" ");
    }, [isActive, themeClasses]);

    // Routing mode with active state (non-interactive)
    if (mode === "routing" && isActive) {
      return (
        <div
          className={tabClasses}
          role="tab"
          aria-selected={true}
          aria-controls={`tabpanel-${tab.id || tab.label}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {tab.label}
          {IconElement}
        </div>
      );
    }

    // Routing mode with link
    if (mode === "routing" && tab.to) {
      return (
        <Link
          to={tab.to}
          className={tabClasses}
          role="tab"
          aria-selected={false}
          aria-controls={`tabpanel-${tab.id || tab.label}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {tab.label}
          {IconElement}
        </Link>
      );
    }

    // Callback mode with button
    return (
      <button
        onClick={handleClick}
        className={tabClasses}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabpanel-${tab.id}`}
        type="button"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {tab.label}
        {IconElement}
      </button>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render when these props change
    return (
      prevProps.tab === nextProps.tab &&
      prevProps.index === nextProps.index &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.mode === nextProps.mode &&
      prevProps.onTabChange === nextProps.onTabChange &&
      prevProps.themeClasses === nextProps.themeClasses
    );
  },
);

TabItem.displayName = "TabItem";

// Main Tabs Component
const Tabs = memo(
  function Tabs({
    tabs = [],
    activeTab,
    onTabChange,
    className = "",
    mode = "callback",
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        cardBorder: getThemeClasses("card-border"),
        borderPrimary: getThemeClasses("border-primary"),
        textPrimary: getThemeClasses("text-primary"),
        textSecondary: getThemeClasses("text-secondary"),
        hoverTextPrimary: getThemeClasses("hover:text-primary"),
        hoverBorderMuted: getThemeClasses("hover:border-muted"),
      }),
      [getThemeClasses],
    );

    // Memoize container classes
    const containerClasses = useMemo(() => {
      const classes = [];
      if (className) {
        classes.push(className);
      }
      return classes.join(" ");
    }, [className]);

    // Memoize nav classes
    const navClasses = useMemo(
      () => `px-4 sm:px-6 border-b ${themeClasses.cardBorder}`,
      [themeClasses.cardBorder],
    );

    // Memoize tab items
    const TabItems = useMemo(() => {
      return tabs.map((tab, index) => {
        const isActive =
          mode === "routing" ? tab.isActive : activeTab === tab.id;

        return (
          <TabItem
            key={tab.id || index}
            tab={tab}
            index={index}
            isActive={isActive}
            mode={mode}
            onTabChange={onTabChange}
            themeClasses={themeClasses}
          />
        );
      });
    }, [tabs, mode, activeTab, onTabChange, themeClasses]);

    return (
      <div className={containerClasses}>
        <div className={navClasses}>
          <nav
            className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide"
            aria-label="Tabs"
          >
            {TabItems}
          </nav>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render when these props change
    // Note: Tabs can contain icon components, so use reference comparison
    return (
      prevProps.tabs === nextProps.tabs &&
      prevProps.tabs?.length === nextProps.tabs?.length &&
      prevProps.activeTab === nextProps.activeTab &&
      prevProps.onTabChange === nextProps.onTabChange &&
      prevProps.className === nextProps.className &&
      prevProps.mode === nextProps.mode
    );
  },
);

Tabs.displayName = "Tabs";

export default Tabs;

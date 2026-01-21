// File Path: src/components/UIX/ActionCard/ActionCard.jsx
// UIX Mobile Optimizations Applied
// Reusable ActionCard component for action grids - Performance Optimized

import React, { useMemo, memo } from "react";
import { Link } from "react-router";
import { useUIXTheme } from "../themes/useUIXTheme";

/**
 * Reusable ActionCard component - Performance Optimized
 * Theme-aware component using dark blue-grey slate color that complements both red and blue themes
 *
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle/description
 * @param {React.Component} icon - Heroicon component
 * @param {string} path - Navigation path
 * @param {boolean} disabled - Whether the card is disabled
 * @param {string} className - Additional CSS classes
 */
const ActionCard = memo(
  function ActionCard({
    title,
    subtitle,
    icon: Icon,
    path,
    disabled = false,
    className = "",
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        actionCard: getThemeClasses("action-card"),
      }),
      [getThemeClasses],
    );

    // Memoize all classes at once for better efficiency with mobile optimizations
    const classes = useMemo(() => {
      // Base classes array for cleaner composition with mobile optimizations
      const baseClasses = [
        "p-6",
        "rounded-lg",
        "text-center",
        "transition-all",
        "duration-200",
        "min-h-[180px]",
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "touch-manipulation",
        "select-none",
      ];

      // Build card classes based on disabled state
      let cardClasses;
      let iconClasses;

      if (disabled) {
        baseClasses.push(
          "bg-gray-400",
          "dark:bg-gray-600",
          "cursor-not-allowed",
          "opacity-60",
          "text-gray-200",
          "dark:text-gray-400",
        );
        iconClasses = "w-12 h-12 mb-3 mx-auto text-gray-200 dark:text-gray-400";
      } else {
        baseClasses.push(
          themeClasses.actionCard,
          "hover:shadow-lg",
          "hover:-translate-y-1",
          "active:scale-[0.98]",
          "cursor-pointer",
        );
        iconClasses = "w-12 h-12 mb-3 mx-auto text-white";
      }

      // Add custom className if provided
      if (className) {
        baseClasses.push(className);
      }

      cardClasses = baseClasses.join(" ");

      return {
        card: cardClasses,
        icon: iconClasses,
        title: "text-sm sm:text-lg font-bold mb-2 text-white",
        subtitle: "text-sm opacity-90 text-white",
      };
    }, [disabled, className, themeClasses.actionCard]);

    // Memoize the card content separately from the Icon rendering with mobile optimizations
    const CardContent = useMemo(() => {
      return (
        <div className={classes.card} style={{ WebkitTapHighlightColor: 'transparent' }}>
          <Icon className={classes.icon} />
          <h3 className={classes.title}>{title}</h3>
          <p className={classes.subtitle}>{subtitle}</p>
        </div>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes.card, classes.icon, classes.title, classes.subtitle, Icon, title, subtitle]);

    // Return content directly if disabled
    if (disabled) {
      return CardContent;
    }

    // Return content wrapped in Link for enabled cards with mobile optimizations
    return (
      <Link to={path} className="block" style={{ WebkitTapHighlightColor: 'transparent' }}>
        {CardContent}
      </Link>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.icon === nextProps.icon &&
      prevProps.path === nextProps.path &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.className === nextProps.className
    );
  },
);

// Set display name for debugging
ActionCard.displayName = "ActionCard";

export default ActionCard;

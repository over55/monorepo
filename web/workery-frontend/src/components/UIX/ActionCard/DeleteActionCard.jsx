// ===============================================
// File Path: src/components/UIX/ActionCard/DeleteActionCard.jsx
// UIX Mobile Optimizations Applied
// DeleteActionCard component for destructive actions - Performance Optimized

import React, { useMemo, memo } from "react";
import { Link } from "react-router";
import { useUIXTheme } from "../themes/useUIXTheme";

/**
 * DeleteActionCard component - Performance Optimized
 * Theme-aware component that always uses red warning colors regardless of theme
 *
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle/description
 * @param {React.Component} icon - Heroicon component
 * @param {string} path - Navigation path
 * @param {boolean} disabled - Whether the card is disabled
 * @param {string} className - Additional CSS classes
 */
const DeleteActionCard = memo(
  function DeleteActionCard({
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
        actionCardDelete: getThemeClasses("action-card-delete"),
      }),
      [getThemeClasses],
    );

    // Memoize all classes at once for better efficiency
    const classes = useMemo(() => {
      // Base classes array for cleaner composition
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
          themeClasses.actionCardDelete,
          "hover:shadow-lg",
          "hover:-translate-y-1",
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
    }, [disabled, className, themeClasses.actionCardDelete]);

    // Memoize the card content separately from the Icon rendering
    const CardContent = useMemo(() => {
      return (
        <div className={classes.card}>
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

    // Return content wrapped in Link for enabled cards
    return (
      <Link to={path} className="block">
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
DeleteActionCard.displayName = "DeleteActionCard";

export default DeleteActionCard;

// ===============================================
// File Path: src/components/UIX/ActionCard/index.js
// Export both action card variants

export { default as ActionCard } from "./ActionCard";
export { default as DeleteActionCard } from "./DeleteActionCard";

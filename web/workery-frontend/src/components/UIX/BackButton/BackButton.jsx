// File Path: web/frontend/src/components/UIX/BackButton/BackButton.jsx
// UIX Mobile Optimizations Applied
// BackButton Component - Performance Optimized

import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Size configurations moved outside component to prevent recreation
const SIZE_CLASSES = {
  sm: {
    button: "px-3 py-2 min-h-[44px] text-xs sm:text-sm",
    icon: "h-3 w-3 sm:h-4 sm:w-4",
  },
  md: {
    button: "px-5 py-3 min-h-[44px] text-sm sm:text-base",
    icon: "h-4 w-4 sm:h-5 sm:w-5",
  },
  lg: {
    button: "px-6 py-4 min-h-[48px] text-base sm:text-lg",
    icon: "h-5 w-5 sm:h-6 sm:w-6",
  },
  xl: {
    button: "px-8 py-5 min-h-[52px] text-lg sm:text-xl",
    icon: "h-6 w-6 sm:h-7 sm:w-7",
  },
};

/**
 * BackButton Component - Performance Optimized
 * Navigation button with consistent theming and accessibility
 *
 * @param {string} to - Navigation destination path
 * @param {string} label - Custom label text for the button
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} size - Button size (sm, md, lg, xl)
 * @param {React.ComponentType} icon - Icon component (defaults to ChevronLeftIcon)
 * @param {string} className - Additional CSS classes
 * @param {Function} onClick - Optional click handler
 */
const BackButton = memo(
  function BackButton({
    to,
    label = "Back",
    disabled = false,
    size = "lg",
    icon: Icon = ChevronLeftIcon,
    className = "",
    onClick,
    ...props
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Get size classes
    const sizeConfig = useMemo(
      () => SIZE_CLASSES[size] || SIZE_CLASSES.lg,
      [size],
    );

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        buttonSecondary:
          getThemeClasses("button-secondary") ||
          "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200",
      }),
      [getThemeClasses],
    );

    // Memoize all classes at once with mobile optimizations
    const classes = useMemo(() => {
      // Base button classes with mobile optimizations
      const baseClasses = [
        sizeConfig.button,
        "font-medium",
        "rounded-lg",
        "transition-colors",
        "inline-flex",
        "items-center",
        "justify-center",
        "touch-manipulation",
        "select-none",
        themeClasses.buttonSecondary,
      ];

      // Add disabled state classes
      if (disabled) {
        baseClasses.push("opacity-50", "cursor-not-allowed");
      } else {
        baseClasses.push("cursor-pointer");
      }

      // Add custom className if provided
      if (className) {
        baseClasses.push(className);
      }

      return {
        button: baseClasses.join(" "),
        icon: `${sizeConfig.icon} mr-2`,
      };
    }, [sizeConfig, themeClasses.buttonSecondary, disabled, className]);

    // Memoize click handler
    const handleClick = useCallback(
      (e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (onClick) {
          onClick(e);
        }
      },
      [onClick, disabled],
    );

    // Memoize button content
    const ButtonContent = useMemo(
      () => (
        <>
          {Icon && <Icon className={classes.icon} aria-hidden="true" />}
          <span>{label}</span>
        </>
      ),
      [Icon, classes.icon, label],
    );

    // Use Link for navigation when 'to' prop is provided and not disabled
    if (to && !disabled) {
      return (
        <Link
          to={to}
          className={classes.button}
          onClick={handleClick}
          aria-label={`Navigate back to ${label}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          {...props}
        >
          {ButtonContent}
        </Link>
      );
    }

    // Use button when no navigation target or when disabled
    return (
      <button
        type="button"
        className={classes.button}
        onClick={handleClick}
        disabled={disabled}
        aria-label={`${label} button`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...props}
      >
        {ButtonContent}
      </button>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.to === nextProps.to &&
      prevProps.label === nextProps.label &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.size === nextProps.size &&
      prevProps.icon === nextProps.icon &&
      prevProps.className === nextProps.className &&
      prevProps.onClick === nextProps.onClick
    );
  },
);

// Display name for debugging
BackButton.displayName = "BackButton";

export default BackButton;

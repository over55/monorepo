// File: src/components/UI/Badge/Badge.jsx
// UIX Mobile Optimizations Applied
// Badge Component - Performance Optimized
/* eslint-disable react-refresh/only-export-components */

import React, { memo, useMemo, useCallback } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Badge Component - Performance Optimized
 * Small label or indicator for counts, statuses, or categories
 *
 * @param {React.ReactNode} children - Badge content
 * @param {string} variant - Badge style variant
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 * @param {string} ariaLabel - Accessibility label
 * @param {boolean} dot - Show as dot indicator only
 * @param {boolean} animate - Add pulse animation
 * @param {Function} onClick - Optional click handler
 */

// Static configurations - frozen to prevent mutations
const SIZE_CLASSES = Object.freeze({
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
});

const DOT_SIZE_CLASSES = Object.freeze({
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
});

// Base classes that never change
const BASE_CLASSES =
  "inline-flex items-center font-medium rounded-full transition-colors duration-150";

// Variant to theme mapping
const VARIANT_THEME_KEYS = Object.freeze({
  default: "badge-default",
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  danger: "badge-error",
  info: "badge-info",
  secondary: "badge-secondary",
});

// Default fallback classes if theme is not available (uses red theme for primary)
const FALLBACK_VARIANT_CLASSES = Object.freeze({
  default: "bg-gray-100 text-gray-800",
  primary: "bg-red-100 text-red-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-cyan-100 text-cyan-800",
  secondary: "bg-gray-100 text-gray-700",
});

const Badge = memo(
  function Badge({
    children,
    variant = "default",
    size = "md",
    className = "",
    ariaLabel,
    dot = false,
    animate = false,
    onClick,
    ...props
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(() => {
      const themeKey =
        VARIANT_THEME_KEYS[variant] || VARIANT_THEME_KEYS.default;
      const classes = getThemeClasses(themeKey);

      return (
        classes ||
        FALLBACK_VARIANT_CLASSES[variant] ||
        FALLBACK_VARIANT_CLASSES.default
      );
    }, [variant, getThemeClasses]);

    // Memoize all classes at once
    const classes = useMemo(() => {
      // Handle dot mode separately
      if (dot) {
        const dotSize = DOT_SIZE_CLASSES[size] || DOT_SIZE_CLASSES.md;
        const dotClasses = [
          "inline-block",
          "rounded-full",
          dotSize,
          themeClasses,
        ];

        if (animate) {
          dotClasses.push("animate-pulse");
        }

        if (onClick) {
          dotClasses.push(
            "cursor-pointer",
            "hover:opacity-80",
            "touch-manipulation",
            "select-none",
            "min-w-[44px]",
            "min-h-[44px]",
            "flex",
            "items-center",
            "justify-center",
          );
        }

        if (className) {
          dotClasses.push(className);
        }

        return dotClasses.filter(Boolean).join(" ");
      }

      // Regular badge classes
      const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
      const badgeClasses = [BASE_CLASSES, sizeClass, themeClasses];

      if (animate) {
        badgeClasses.push("animate-pulse");
      }

      if (onClick) {
        badgeClasses.push(
          "cursor-pointer",
          "hover:opacity-80",
          "active:opacity-60",
          "active:scale-95",
          "touch-manipulation",
          "select-none",
          "min-h-[44px]",
        );
      }

      if (className) {
        badgeClasses.push(className);
      }

      return badgeClasses.filter(Boolean).join(" ");
    }, [size, themeClasses, dot, animate, onClick, className]);

    // Memoize accessibility props
    const accessibilityProps = useMemo(() => {
      const baseProps = {
        "aria-label":
          ariaLabel || (typeof children === "string" ? children : undefined),
      };

      // Add role based on usage
      if (onClick) {
        baseProps.role = "button";
        baseProps.tabIndex = 0;
      } else if (
        variant === "error" ||
        variant === "danger" ||
        variant === "warning"
      ) {
        baseProps.role = "alert";
      } else {
        baseProps.role = "status";
      }

      // Add live region for dynamic badges
      if (animate || baseProps.role === "alert") {
        baseProps["aria-live"] = "polite";
      }

      return baseProps;
    }, [ariaLabel, children, onClick, variant, animate]);

    // Memoize keyboard handler for clickable badges
    const handleKeyDown = useCallback(
      (event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(event);
        }
      },
      [onClick],
    );

    // Render dot indicator mode
    if (dot) {
      return (
        <span
          className={classes}
          onClick={onClick}
          onKeyDown={onClick ? handleKeyDown : undefined}
          style={onClick ? { WebkitTapHighlightColor: 'transparent' } : undefined}
          {...accessibilityProps}
          {...props}
        />
      );
    }

    // Render regular badge with content
    return (
      <span
        className={classes}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        style={onClick ? { WebkitTapHighlightColor: 'transparent' } : undefined}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </span>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.children === nextProps.children &&
      prevProps.variant === nextProps.variant &&
      prevProps.size === nextProps.size &&
      prevProps.className === nextProps.className &&
      prevProps.ariaLabel === nextProps.ariaLabel &&
      prevProps.dot === nextProps.dot &&
      prevProps.animate === nextProps.animate &&
      prevProps.onClick === nextProps.onClick
    );
  },
);

// Display name for debugging
Badge.displayName = "Badge";

export default Badge;

// Export common variants for consistency
export const BADGE_VARIANTS = Object.freeze({
  DEFAULT: "default",
  PRIMARY: "primary",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  DANGER: "danger",
  INFO: "info",
  SECONDARY: "secondary",
});

export const BADGE_SIZES = Object.freeze({
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
});

// File Path: web/frontend/src/components/UIX/Button/Button.jsx
// Button Component - Performance Optimized
// UIX Mobile Optimizations Applied
/* eslint-disable react-refresh/only-export-components */

import React, { memo, useMemo, useCallback, forwardRef } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Button Component - Performance Optimized
 * Versatile button with multiple variants, sizes, and states
 *
 * @param {React.ReactNode} children - Button content
 * @param {string} variant - Button style variant
 * @param {Function} onClick - Click handler function
 * @param {boolean} disabled - Disabled state
 * @param {string} type - HTML button type
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Custom loading text
 * @param {boolean} fullWidth - Full width button
 * @param {string} size - Button size: 'sm', 'md', 'lg', 'xl'
 * @param {React.ComponentType} icon - Icon component
 * @param {boolean} gradient - Apply gradient style
 * @param {string} ariaLabel - Accessibility label
 */

// Static configurations with mobile-friendly touch targets (min 44px height per Apple HIG)
const SIZE_CLASSES = Object.freeze({
  sm: "px-3 py-2.5 text-xs sm:text-sm min-h-[44px]",
  md: "px-4 py-3 text-sm sm:text-base min-h-[44px]",
  lg: "px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base min-h-[48px]",
  xl: "px-8 py-4 text-base sm:text-lg min-h-[52px]",
});

// Base classes with mobile optimizations: touch-manipulation prevents double-tap zoom, select-none prevents text selection
const BASE_CLASSES =
  "font-medium rounded-xl focus:outline-none transition-all duration-200 inline-flex items-center justify-center touch-manipulation select-none";
const DISABLED_CLASSES = "opacity-50 cursor-not-allowed";
const ENABLED_CLASSES = "cursor-pointer active:scale-[0.98]"; // Subtle press feedback for mobile

// Fallback classes if theme not available (uses red theme for primary)
const FALLBACK_CLASSES = Object.freeze({
  primary:
    "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-2 focus:ring-gray-500",
  outline:
    "border-2 border-gray-300 hover:border-gray-400 text-gray-700 focus:ring-2 focus:ring-gray-500",
  success:
    "bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500",
  danger:
    "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500",
  ghost: "hover:bg-gray-100 text-gray-700 focus:ring-2 focus:ring-gray-500",
  disabled: "bg-gray-300 text-gray-600 cursor-not-allowed",
});

// Variant to theme key mapping
const VARIANT_THEME_MAP = Object.freeze({
  primary: "button-primary",
  secondary: "button-secondary",
  outline: "button-outline",
  success: "button-success",
  danger: "button-danger",
  ghost: "button-ghost",
  disabled: "button-disabled",
});

// Loading Spinner Component - Separated for better performance
const LoadingSpinner = memo(function LoadingSpinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin -ml-1 mr-2 text-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

// Main Button Component
const Button = memo(
  forwardRef(function Button(
    {
      children,
      variant = "primary",
      onClick,
      disabled = false,
      type = "button",
      className = "",
      loading = false,
      loadingText = "Loading...",
      fullWidth = false,
      size = "md",
      icon: Icon,
      gradient = false,
      id,
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      ariaControls,
      ariaDescribedBy,
      tabIndex,
      // Destructure these to prevent them from being spread to DOM element
      iconPosition: _iconPosition,
      iconClassName: _iconClassName,
      ...props
    },
    ref,
  ) {
    const { getThemeClasses } = useUIXTheme();

    // Computed disabled state
    const isDisabled = disabled || loading;

    // Memoize theme classes
    const themeClasses = useMemo(() => {
      // Handle gradient primary variant
      if (variant === "primary" && gradient) {
        return (
          getThemeClasses("button-gradient") ||
          "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
        );
      }

      // Get theme class for variant
      const themeKey = VARIANT_THEME_MAP[variant] || VARIANT_THEME_MAP.primary;
      return (
        getThemeClasses(themeKey) ||
        FALLBACK_CLASSES[variant] ||
        FALLBACK_CLASSES.primary
      );
    }, [variant, gradient, getThemeClasses]);

    // Memoize complete button classes
    const buttonClasses = useMemo(() => {
      const classes = [
        BASE_CLASSES,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        themeClasses,
        isDisabled ? DISABLED_CLASSES : ENABLED_CLASSES,
      ];

      if (fullWidth) {
        classes.push("w-full");
      }

      if (className) {
        classes.push(className);
      }

      return classes.filter(Boolean).join(" ");
    }, [size, themeClasses, isDisabled, fullWidth, className]);

    // Memoize click handler
    const handleClick = useCallback(
      (event) => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (onClick && typeof onClick === "function") {
          onClick(event);
        }
      },
      [onClick, isDisabled],
    );

    // Memoize keyboard handler
    const handleKeyDown = useCallback(
      (event) => {
        if (isDisabled) return;

        // Activate on Enter or Space
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "Spacebar"
        ) {
          // Prevent default for space to avoid page scroll
          if (event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
          }

          // Only trigger for button type (submit buttons activate on Enter naturally)
          if (type === "button") {
            handleClick(event);
          }
        }
      },
      [isDisabled, type, handleClick],
    );

    // Memoize accessibility props
    const accessibilityProps = useMemo(
      () => ({
        "aria-label":
          ariaLabel || (typeof children === "string" ? children : undefined),
        "aria-pressed": ariaPressed,
        "aria-expanded": ariaExpanded,
        "aria-controls": ariaControls,
        "aria-describedby": ariaDescribedBy,
        "aria-busy": loading,
        "aria-disabled": isDisabled,
        tabIndex: isDisabled ? -1 : (tabIndex ?? 0),
      }),
      [
        ariaLabel,
        children,
        ariaPressed,
        ariaExpanded,
        ariaControls,
        ariaDescribedBy,
        loading,
        isDisabled,
        tabIndex,
      ],
    );

    // Memoize button content
    const ButtonContent = useMemo(() => {
      if (loading) {
        return (
          <>
            <LoadingSpinner />
            <span>{loadingText}</span>
          </>
        );
      }

      return (
        <>
          {Icon && (
            <Icon className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
          )}
          {children && <span className="inline-flex items-center">{children}</span>}
        </>
      );
    }, [loading, loadingText, Icon, children]);

    return (
      <button
        ref={ref}
        id={id}
        type={type}
        className={buttonClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...accessibilityProps}
        {...props}
      >
        {ButtonContent}
      </button>
    );
  }),
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.children === nextProps.children &&
      prevProps.variant === nextProps.variant &&
      prevProps.onClick === nextProps.onClick &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.type === nextProps.type &&
      prevProps.className === nextProps.className &&
      prevProps.loading === nextProps.loading &&
      prevProps.loadingText === nextProps.loadingText &&
      prevProps.fullWidth === nextProps.fullWidth &&
      prevProps.size === nextProps.size &&
      prevProps.icon === nextProps.icon &&
      prevProps.gradient === nextProps.gradient &&
      prevProps.id === nextProps.id &&
      prevProps.ariaLabel === nextProps.ariaLabel &&
      prevProps.ariaPressed === nextProps.ariaPressed &&
      prevProps.ariaExpanded === nextProps.ariaExpanded &&
      prevProps.ariaControls === nextProps.ariaControls &&
      prevProps.ariaDescribedBy === nextProps.ariaDescribedBy &&
      prevProps.tabIndex === nextProps.tabIndex
    );
  },
);

// Display name for debugging
Button.displayName = "Button";

export default Button;

// Export constants for consistency
export const BUTTON_VARIANTS = Object.freeze({
  PRIMARY: "primary",
  SECONDARY: "secondary",
  OUTLINE: "outline",
  SUCCESS: "success",
  DANGER: "danger",
  GHOST: "ghost",
  DISABLED: "disabled",
});

export const BUTTON_SIZES = Object.freeze({
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
  EXTRA_LARGE: "xl",
});

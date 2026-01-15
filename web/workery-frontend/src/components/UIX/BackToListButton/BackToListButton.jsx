// File Path: web/frontend/src/components/UIX/BackToListButton/BackToListButton.jsx
// UIX Mobile Optimizations Applied
// BackToListButton Component - Performance Optimized
/* eslint-disable react-refresh/only-export-components */

import React, { memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * BackToListButton Component - Performance Optimized
 *
 * @param {Function} onClick - Click handler function
 * @param {string} to - Navigation path (alternative to onClick)
 * @param {string} text - Button text (default: "Back to List")
 * @param {string} label - Alias for text prop
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {React.ComponentType} icon - Icon component (defaults to ArrowLeftIcon)
 * @param {string} size - Button size (sm, md, lg)
 * @param {string} title - Title attribute for accessibility
 * @param {string} ariaLabel - Aria label for screen readers
 */

// Static configurations - frozen to prevent mutations with mobile optimizations
const SIZE_CLASSES = Object.freeze({
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
});

// Base classes that never change with mobile optimizations
const BASE_CLASSES = [
  "inline-flex",
  "items-center",
  "rounded-xl",
  "shadow-sm",
  "font-medium",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-offset-2",
  "transition-all",
  "duration-200",
  "touch-manipulation",
  "select-none",
].join(" ");

const BackToListButton = memo(
  function BackToListButton({
    onClick,
    to,
    text,
    label,
    className = "",
    disabled = false,
    icon: Icon = ArrowLeftIcon,
    size = "md",
    title,
    ariaLabel,
    ...props
  }) {
    const { getThemeClasses } = useUIXTheme();
    const navigate = useNavigate();

    // Support both 'text' and 'label' props, with default
    const buttonText = text || label || "Back to List";

    // Handle navigation if 'to' prop is provided
    const handleClick = useCallback(
      (event) => {
        if (disabled) return;

        if (onClick) {
          onClick(event);
        } else if (to) {
          navigate(to);
        }
      },
      [onClick, to, navigate, disabled],
    );

    // Get size configuration
    const sizeConfig = useMemo(
      () => SIZE_CLASSES[size] || SIZE_CLASSES.md,
      [size],
    );

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        buttonSecondary: getThemeClasses("button-secondary"),
      }),
      [getThemeClasses],
    );

    // Memoize all classes at once
    const classes = useMemo(() => {
      // Build button classes array
      const buttonClasses = [
        BASE_CLASSES,
        sizeConfig.button,
        themeClasses.buttonSecondary,
      ];

      // Add state classes
      if (disabled) {
        buttonClasses.push("opacity-50", "cursor-not-allowed");
      } else {
        buttonClasses.push(
          "cursor-pointer",
          "hover:shadow-md",
          "active:shadow-sm",
        );
      }

      // Add custom className if provided
      if (className) {
        buttonClasses.push(className);
      }

      // Build icon classes
      const iconClasses = [sizeConfig.icon, "mr-2", "flex-shrink-0"];

      return {
        button: buttonClasses.filter(Boolean).join(" "),
        icon: iconClasses.join(" "),
      };
    }, [sizeConfig, themeClasses.buttonSecondary, disabled, className]);

    // Memoize button content
    const ButtonContent = useMemo(
      () => (
        <>
          {Icon && <Icon className={classes.icon} aria-hidden="true" />}
          <span className="truncate">{buttonText}</span>
        </>
      ),
      [Icon, classes.icon, buttonText],
    );

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={classes.button}
        aria-label={ariaLabel || buttonText}
        title={title || buttonText}
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
      prevProps.onClick === nextProps.onClick &&
      prevProps.to === nextProps.to &&
      prevProps.text === nextProps.text &&
      prevProps.label === nextProps.label &&
      prevProps.className === nextProps.className &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.icon === nextProps.icon &&
      prevProps.size === nextProps.size &&
      prevProps.title === nextProps.title &&
      prevProps.ariaLabel === nextProps.ariaLabel
    );
  },
);

// Display name for debugging
BackToListButton.displayName = "BackToListButton";

export default BackToListButton;

// Export size constants for use in other components
export const BUTTON_SIZES = Object.freeze({
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
});

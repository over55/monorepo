// File Path: web/frontend/src/components/UIX/EditButton/EditButton.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import { Link } from "react-router";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move constants outside component to prevent recreation with mobile optimizations
const SIZE_CLASSES = {
  sm: "px-3 py-2 min-h-[44px] text-xs sm:text-sm",
  md: "px-5 py-3 min-h-[44px] text-sm sm:text-base",
  lg: "px-6 py-4 min-h-[48px] text-base sm:text-lg",
};

const ICON_SIZE_CLASSES = {
  sm: "h-3 w-3 sm:h-4 sm:w-4",
  md: "h-4 w-4 sm:h-5 sm:w-5",
  lg: "h-5 w-5 sm:h-6 sm:w-6",
};

/**
 * EditButton Component
 * Standardized button for editing actions
 * Uses blue theme and consistent styling
 *
 * @param {Function} onClick - Click handler function
 * @param {string} to - Navigation path (for Link)
 * @param {string} text - Button text (default: "Edit")
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {React.ComponentType} icon - Icon component (defaults to PencilSquareIcon)
 * @param {string} size - Button size (sm, md, lg)
 * @param {string} variant - Button variant (default, primary)
 */
const EditButton = memo(
  ({
    onClick,
    to,
    text = "Edit",
    className = "",
    disabled = false,
    icon: Icon = PencilSquareIcon,
    size = "md",
    variant = "default",
    ...props
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        buttonOutline:
          variant === "primary" ? getThemeClasses("button-outline") : null,
        buttonSecondary:
          variant !== "primary" ? getThemeClasses("button-secondary") : null,
      }),
      [getThemeClasses, variant],
    );

    // Get the active variant class
    const variantClass = useMemo(
      () =>
        variant === "primary"
          ? themeClasses.buttonOutline
          : themeClasses.buttonSecondary,
      [variant, themeClasses.buttonOutline, themeClasses.buttonSecondary],
    );

    // Get size classes from constants
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const iconSizeClass = ICON_SIZE_CLASSES[size] || ICON_SIZE_CLASSES.md;

    // Memoize title
    const title = useMemo(() => `${text} Item`, [text]);

    // Memoize base classes with mobile optimizations
    const baseClasses = useMemo(
      () =>
        `
    inline-flex items-center
    ${sizeClass}
    rounded-xl shadow-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    touch-manipulation select-none
    ${variantClass}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [sizeClass, variantClass, disabled, className],
    );

    // Memoize icon classes
    const iconClasses = useMemo(() => `${iconSizeClass} mr-2`, [iconSizeClass]);

    // Memoize content
    const content = useMemo(
      () => (
        <>
          {Icon && <Icon className={iconClasses} />}
          {text}
        </>
      ),
      [Icon, iconClasses, text],
    );

    // Memoize click handler for Link
    const handleClick = useCallback(
      (e) => {
        if (onClick && !disabled) {
          onClick(e);
        }
      },
      [onClick, disabled],
    );

    // Render as Link if 'to' prop is provided and not disabled
    if (to && !disabled) {
      return (
        <Link
          to={to}
          className={baseClasses}
          title={title}
          onClick={handleClick}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          {...props}
        >
          {content}
        </Link>
      );
    }

    // Render as button
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        title={title}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...props}
      >
        {content}
      </button>
    );
  },
);

// Add display name for better debugging
EditButton.displayName = "EditButton";

export default EditButton;

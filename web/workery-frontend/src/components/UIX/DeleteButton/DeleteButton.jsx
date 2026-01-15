// File Path: web/frontend/src/components/UIX/DeleteButton/DeleteButton.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import { Link } from "react-router";
import { TrashIcon } from "@heroicons/react/24/outline";
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
 * DeleteButton Component
 * Standardized button/link for delete actions
 * Uses red theme for danger actions with blue focus ring for consistency
 *
 * @param {Function} onClick - Click handler function (for button)
 * @param {string} to - Navigation path (for Link - use this OR onClick, not both)
 * @param {string} text - Button text (default: "Delete")
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {React.ComponentType} icon - Icon component (defaults to TrashIcon)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} asLink - Whether to render as Link component (requires 'to' prop)
 */
const DeleteButton = memo(
  ({
    onClick,
    to,
    text = "Delete",
    className = "",
    disabled = false,
    icon: Icon = TrashIcon,
    size = "md",
    asLink = false,
    ...props
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes to prevent repeated calls
    const themeClasses = useMemo(
      () => ({
        inputFocusRing: getThemeClasses("input-focus-ring"),
      }),
      [getThemeClasses],
    );

    // Memoize size classes
    const sizeClass = SIZE_CLASSES[size];
    const iconSizeClass = ICON_SIZE_CLASSES[size];

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
    border border-red-200 text-red-700 bg-red-50
    hover:bg-red-100 hover:shadow-md
    touch-manipulation select-none
    ${themeClasses.inputFocusRing}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${className}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [sizeClass, themeClasses.inputFocusRing, disabled, className],
    );

    // Memoize icon classes
    const iconClasses = useMemo(() => `${iconSizeClass} mr-2`, [iconSizeClass]);

    // Memoize keydown handler for link-style button
    const handleKeyDown = useCallback(
      (e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick && !disabled) {
          e.preventDefault();
          onClick();
        }
      },
      [onClick, disabled],
    );

    // Memoize content to prevent recreation
    const content = useMemo(
      () => (
        <>
          {Icon && <Icon className={iconClasses} />}
          {text}
        </>
      ),
      [Icon, iconClasses, text],
    );

    // If 'to' prop is provided, render as a Link
    if (to) {
      return (
        <Link
          to={to}
          className={baseClasses}
          title={title}
          onClick={disabled ? (e) => e.preventDefault() : undefined}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          {...props}
        >
          {content}
        </Link>
      );
    }

    // If asLink is true but no 'to', render as a div with onClick
    if (asLink) {
      return (
        <div
          onClick={onClick}
          className={baseClasses}
          title={title}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          {...props}
        >
          {content}
        </div>
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
DeleteButton.displayName = "DeleteButton";

export default DeleteButton;

// File Path: web/frontend/src/components/UIX/SelectButton/SelectButton.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// Move static default values and objects outside component to prevent recreation
const DEFAULT_CHILDREN = "Select";
const DEFAULT_SIZE = "md";

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 min-h-[40px] text-xs",
  md: "px-4 py-2 min-h-[44px] text-sm",
  lg: "px-5 py-2.5 min-h-[48px] text-base",
};

const ICON_SIZE_CLASSES = {
  sm: "w-3 h-3 ml-1.5",
  md: "w-4 h-4 ml-2",
  lg: "w-4 h-4 ml-2",
};

const BASE_CLASSES = "font-semibold rounded-lg transition-all duration-200 focus:outline-none inline-flex items-center justify-center transform touch-manipulation select-none";
const DISABLED_CLASSES = "opacity-50 cursor-not-allowed";
const ENABLED_CLASSES = "cursor-pointer hover:scale-105 active:scale-[0.98]";

/**
 * SelectButton Component - Performance Optimized
 * A reusable button component specifically designed for selection actions in tables and lists
 * Uses the dark color of the current theme with border and arrow icon
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values and objects moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handler with useCallback
 * - Memoized icon section
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Theme-aware styling that switches based on selected theme
 * - Uses dark theme colors (blue-900/red-900) for a bold appearance
 * - Border and shadow for button-like appearance
 * - Arrow icon that matches theme color
 * - Optimized for table action columns
 * - Hover and focus states with animation
 *
 * @param {Object} props
 * @param {function} props.onClick - Click handler function
 * @param {React.Node} props.children - Button text/content (default: "Select")
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Button size ("sm", "md", "lg")
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.showIcon - Whether to show arrow icon (default: true)
 */
const SelectButton = memo(function SelectButton({
  onClick,
  children = DEFAULT_CHILDREN,
  disabled = false,
  className = "",
  size = DEFAULT_SIZE,
  fullWidth = false,
  showIcon = true,
  ...props
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      selectButton: getThemeClasses('select-button'),
    }),
    [getThemeClasses],
  );

  // Memoize event handler to prevent unnecessary re-renders
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onClick) {
        onClick(e);
      }
    },
    [onClick],
  );

  // Memoize button className
  const buttonClassName = useMemo(() => {
    const classes = [
      BASE_CLASSES,
      SIZE_CLASSES[size],
      themeClasses.selectButton,
      disabled ? DISABLED_CLASSES : ENABLED_CLASSES,
    ];

    if (fullWidth) {
      classes.push('w-full');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }, [size, themeClasses.selectButton, disabled, fullWidth, className]);

  // Memoize icon section
  const iconSection = useMemo(() => {
    if (!showIcon) return null;

    return <ArrowRightIcon className={ICON_SIZE_CLASSES[size]} />;
  }, [showIcon, size]);

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleClick}
      disabled={disabled}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      {...props}
    >
      <span>{children}</span>
      {iconSection}
    </button>
  );
});

// Set display name for React DevTools
SelectButton.displayName = 'SelectButton';

export default SelectButton;
// File Path: src/components/UIX/IconText/IconText.jsx
// UIX Mobile Optimizations Applied
// IconText Component - Theme-aware icon + text display

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * IconText Component
 * Theme-aware component for displaying icon with text, commonly used for:
 * - Metadata display (dates, IDs)
 * - Contact info (email, phone)
 * - Labels with values
 * - Info sections
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Heroicon component
 * @param {string} props.label - Optional label before value
 * @param {React.ReactNode} props.value - The main value/content to display
 * @param {React.ReactNode} props.children - Alternative to value prop
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.align - Alignment: 'left', 'center'
 * @param {boolean} props.iconMuted - Whether icon should use muted color (default: true)
 * @param {string} props.className - Additional CSS classes
 */

// Static size classes
const SIZE_CLASSES = Object.freeze({
  sm: {
    container: "text-xs sm:text-sm",
    icon: "w-3 sm:w-4 h-3 sm:h-4",
    iconMargin: "mr-2",
  },
  md: {
    container: "text-sm sm:text-base lg:text-lg",
    icon: "w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6",
    iconMargin: "mr-2 sm:mr-3",
  },
  lg: {
    container: "text-base sm:text-lg lg:text-xl",
    icon: "w-5 sm:w-6 h-5 sm:h-6 lg:w-7 lg:h-7",
    iconMargin: "mr-3",
  },
});

const IconText = memo(function IconText({
  icon: Icon,
  label,
  value,
  children,
  size = "md",
  align = "left",
  iconMuted = true,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      textMuted: getThemeClasses("text-muted"),
    }),
    [getThemeClasses],
  );

  // Memoize size classes
  const sizes = useMemo(
    () => SIZE_CLASSES[size] || SIZE_CLASSES.md,
    [size],
  );

  // Memoize alignment classes
  const alignClasses = useMemo(
    () => align === "center" ? "justify-center" : "justify-start xl:justify-start",
    [align],
  );

  // Memoize container classes
  const containerClasses = useMemo(
    () =>
      `flex items-center ${sizes.container} ${alignClasses} ${className}`.trim(),
    [sizes.container, alignClasses, className],
  );

  // Memoize icon classes
  const iconClasses = useMemo(
    () =>
      `${sizes.icon} ${sizes.iconMargin} flex-shrink-0 ${iconMuted ? (themeClasses.textMuted || "text-gray-600 dark:text-gray-400") : (themeClasses.textSecondary || "text-gray-600 dark:text-gray-400")}`,
    [sizes.icon, sizes.iconMargin, iconMuted, themeClasses.textMuted, themeClasses.textSecondary],
  );

  // Memoize label classes
  const labelClasses = useMemo(
    () => `${themeClasses.textSecondary || "text-gray-600 dark:text-gray-400"} mr-2`,
    [themeClasses.textSecondary],
  );

  // Memoize value classes
  const valueClasses = useMemo(
    () => `font-medium ${themeClasses.textPrimary || "text-gray-900 dark:text-gray-100"}`,
    [themeClasses.textPrimary],
  );

  const content = children || value;

  return (
    <div className={containerClasses}>
      {Icon && <Icon className={iconClasses} />}
      {label && <span className={labelClasses}>{label}:</span>}
      <span className={valueClasses}>{content}</span>
    </div>
  );
});

IconText.displayName = "IconText";

export default IconText;

// File: src/components/UI/ProgressBar/ProgressBar.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static values outside component to prevent recreation
const DEFAULT_VALUE = 0;
const DEFAULT_MAX = 100;
const DEFAULT_VARIANT = "primary";

/**
 * ProgressBar Component - Performance Optimized
 * Visual indicator of progress or completion
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Memoized percentage calculation
 * - Memoized style object to prevent recreation
 * - Prevented unnecessary re-renders
 *
 * @param {number} value - Current progress value
 * @param {number} max - Maximum value
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Progress bar variant (primary, success, danger, warning)
 */
const ProgressBar = memo(function ProgressBar({
  value = DEFAULT_VALUE,
  max = DEFAULT_MAX,
  className = "",
  variant = DEFAULT_VARIANT
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      bgDisabled: getThemeClasses('bg-disabled'),
      progressBar: getThemeClasses('progress-bar'),
      bgSuccess: getThemeClasses('bg-success'),
      bgDanger: getThemeClasses('bg-danger'),
      bgWarning: getThemeClasses('bg-warning'),
    }),
    [getThemeClasses],
  );

  // Memoize percentage calculation
  const percentage = useMemo(() => {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }, [value, max]);

  // Memoize progress bar variant class
  const progressBarClass = useMemo(() => {
    switch (variant) {
      case "primary":
        return themeClasses.progressBar;
      case "success":
        return themeClasses.bgSuccess;
      case "danger":
        return themeClasses.bgDanger;
      case "warning":
        return themeClasses.bgWarning;
      default:
        return themeClasses.progressBar;
    }
  }, [variant, themeClasses]);

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className
      ? `w-full ${themeClasses.bgDisabled} rounded-full h-2.5 ${className}`
      : `w-full ${themeClasses.bgDisabled} rounded-full h-2.5`;
  }, [className, themeClasses.bgDisabled]);

  // Memoize progress bar className
  const barClassName = useMemo(() => {
    return `${progressBarClass} h-2.5 rounded-full transition-all duration-300`;
  }, [progressBarClass]);

  // Memoize style object to prevent recreation
  const barStyle = useMemo(() => {
    return { width: `${percentage}%` };
  }, [percentage]);

  return (
    <div className={containerClassName}>
      <div
        className={barClassName}
        style={barStyle}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      />
    </div>
  );
});

// Set display name for React DevTools
ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

// File: src/components/UI/Tooltip/Tooltip.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Tooltip Component - Performance Optimized
 * Contextual information on hover
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings
 * - Prevented unnecessary re-renders
 *
 * @param {React.ReactNode} children - Element that triggers tooltip
 * @param {string} text - Tooltip text
 * @param {string} className - Additional CSS classes
 */
const Tooltip = memo(function Tooltip({ children, text, className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      bgTooltip: getThemeClasses('bg-tooltip'),
      textTooltip: getThemeClasses('text-tooltip'),
      textTooltipBg: getThemeClasses('text-tooltip-bg'),
    }),
    [getThemeClasses],
  );

  // Memoize className strings
  const containerClassName = useMemo(() => {
    return `relative inline-block group ${className}`;
  }, [className]);

  const tooltipClassName = useMemo(() => {
    return `absolute z-10 invisible group-hover:visible ${themeClasses.bgTooltip} ${themeClasses.textTooltip} text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap`;
  }, [themeClasses.bgTooltip, themeClasses.textTooltip]);

  const arrowClassName = useMemo(() => {
    return `absolute ${themeClasses.textTooltipBg} h-2 w-full left-0 top-full`;
  }, [themeClasses.textTooltipBg]);

  return (
    <div className={containerClassName}>
      {children}
      <div className={tooltipClassName}>
        {text}
        <svg
          className={arrowClassName}
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );
});

// Set display name for React DevTools
Tooltip.displayName = 'Tooltip';

export default Tooltip;

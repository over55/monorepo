// File: src/components/UI/Loading/Spinner.jsx
// UIX Mobile Optimizations Applied

import React from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Spinner Component
 * Animated loading spinner
 *
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
function Spinner({ size = "md", className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
        border-4 ${getThemeClasses('border-disabled')} ${getThemeClasses('border-t-primary')}
        rounded-full animate-spin
        ${sizeClasses[size]}
      `}
      />
    </div>
  );
}

// Export alias for backward compatibility
export const LoadingSpinner = Spinner;

export default Spinner;

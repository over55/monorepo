// File: src/components/UI/Loading/Spinner.jsx

import React from "react";

/**
 * Spinner Component
 * Animated loading spinner
 *
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
        border-4 border-gray-200 border-t-blue-500
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

// File: src/components/UI/Loading/Loading.jsx

import React from "react";

/**
 * Loading Component
 * Simple loading indicator with optional text
 *
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} text - Loading text to display
 * @param {boolean} fullScreen - Whether to cover full screen
 * @param {string} className - Additional CSS classes
 */
function Loading({
  size = "md",
  text = "",
  fullScreen = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
        <div
          className={`
          border-4 border-gray-200 border-t-blue-500
          rounded-full animate-spin
          ${sizeClasses[size]}
        `}
        />
        {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
        border-4 border-gray-200 border-t-blue-500
        rounded-full animate-spin
        ${sizeClasses[size]}
      `}
      />
      {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
    </div>
  );
}

// Export aliases for backward compatibility
export const Loader = Loading;
export const LoadingIndicator = Loading;

export default Loading;

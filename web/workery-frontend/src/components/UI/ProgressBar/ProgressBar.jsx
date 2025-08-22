// File: src/components/UI/ProgressBar/ProgressBar.jsx

import React from "react";

/**
 * ProgressBar Component
 * Visual indicator of progress or completion
 *
 * @param {number} value - Current progress value
 * @param {number} max - Maximum value
 * @param {string} className - Additional CSS classes
 * @param {string} color - Progress bar color
 */
function ProgressBar({ value = 0, max = 100, className = "", color = "blue" }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      />
    </div>
  );
}

export default ProgressBar;

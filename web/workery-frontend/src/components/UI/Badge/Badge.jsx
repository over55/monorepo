// File: src/components/UI/Badge/Badge.jsx

import React from "react";

/**
 * Badge Component
 * Small label or indicator for counts, statuses, or categories
 *
 * @param {React.ReactNode} children - Badge content
 * @param {string} variant - Badge style variant
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
function Badge({ children, variant = "default", size = "md", className = "" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;

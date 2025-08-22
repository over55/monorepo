// File: src/components/UI/EmptyState/EmptyState.jsx

import React from "react";

/**
 * EmptyState Component
 * Placeholder for when no data is available
 *
 * @param {string} title - Main empty state message
 * @param {string} description - Additional description
 * @param {React.Component} icon - Icon component to display
 * @param {React.ReactNode} action - Call-to-action element
 * @param {string} className - Additional CSS classes
 */
function EmptyState({
  title = "No data found",
  description = "",
  icon: Icon,
  action,
  className = "",
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;

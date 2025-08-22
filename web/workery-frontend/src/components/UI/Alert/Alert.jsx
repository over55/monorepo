// File: src/components/UI/Alert/Alert.jsx

import React from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/**
 * Alert Component
 * Displays contextual feedback messages for user actions
 *
 * @param {string} type - Type of alert: 'info', 'success', 'warning', 'error'
 * @param {React.ReactNode} children - Alert content
 * @param {boolean} dismissible - Whether the alert can be dismissed
 * @param {function} onDismiss - Callback when alert is dismissed
 * @param {string} className - Additional CSS classes
 */
function Alert({
  type = "info",
  children,
  dismissible = false,
  onDismiss,
  className = "",
}) {
  const alertStyles = {
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons = {
    warning: <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />,
    error: <XCircleIcon className="h-5 w-5 flex-shrink-0" />,
    success: <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />,
    info: <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />,
  };

  return (
    <div
      className={`p-4 rounded-lg flex gap-3 mb-5 border animate-fade-in ${alertStyles[type]} ${className}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm">{children}</div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
          aria-label="Dismiss alert"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Export aliases for backward compatibility
export const Notification = Alert;
export const Message = Alert;

export default Alert;

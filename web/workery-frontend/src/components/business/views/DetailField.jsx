// File: monorepo/web/frontend/src/components/business/views/DetailField.jsx

import React from "react";
import { useUIXTheme } from "../../UIX";

/**
 * Reusable DetailField component for displaying individual data fields
 * in a consistent format with label and value
 *
 * @param {string} label - Field label
 * @param {React.Node|string} value - Field value (can be JSX or string)
 * @param {boolean} fullWidth - Whether to span full width (2 columns)
 * @param {string} className - Additional CSS classes
 */
function DetailField({ label, value, fullWidth = false, className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  return (
    <div className={`${fullWidth ? "lg:col-span-2" : ""} ${className}`}>
      <dt className={`text-xs sm:text-sm font-semibold ${getThemeClasses("text-secondary")} mb-1`}>
        {label}
      </dt>
      <dd className={`text-base sm:text-lg font-medium ${getThemeClasses("text-primary")} break-words`}>
        {value || "-"}
      </dd>
    </div>
  );
}

export default DetailField;
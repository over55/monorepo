// File: monorepo/web/frontend/src/components/business/views/DetailSection.jsx

import React from "react";
import { useUIXTheme } from "../../UIX";

/**
 * Reusable DetailSection component for displaying grouped information
 * with a dark header and white content area
 *
 * @param {string} title - Section title
 * @param {React.Component} icon - Icon component for the section
 * @param {React.Node} children - Content to display in the section
 * @param {string} className - Additional CSS classes
 */
function DetailSection({ title, icon: Icon, children, className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  return (
    <div className={`${getThemeClasses('bg-gradient-secondary')} rounded-lg shadow-sm mb-4 sm:mb-6 ${className}`}>
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          {Icon && <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />}
          <span className="truncate">{title}</span>
        </h3>
      </div>
      <div className={`${getThemeClasses('bg-card')} border-2 border-t-0 ${getThemeClasses('card-border')} rounded-b-lg p-4 sm:p-6`}>
        <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {children}
        </dl>
      </div>
    </div>
  );
}

export default DetailSection;
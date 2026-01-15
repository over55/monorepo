// File: src/components/UIX/InfoField/InfoField.jsx
// UIX Mobile Optimizations Applied

import React from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * InfoField Component
 * Displays a labeled field with value in a consistent format
 * Used for detail pages and forms where data is displayed read-only
 *
 * @param {string} label - Field label
 * @param {any} value - Field value to display
 * @param {React.Component} icon - Optional icon component
 * @param {string} size - Size variant (sm, md, lg)
 * @param {string} variant - Style variant (default, highlighted)
 * @param {string} emptyText - Text to display when value is empty (default: "")
 * @param {string} className - Additional CSS classes
 */
function InfoField({
  label,
  value,
  icon: Icon,
  size = "lg",
  variant = "default",
  emptyText = "",
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();
  const sizeClasses = {
    sm: {
      label: "text-sm",
      value: "text-base",
      padding: "p-3",
    },
    md: {
      label: "text-base",
      value: "text-lg",
      padding: "p-4",
    },
    lg: {
      label: "text-base sm:text-lg",
      value: "text-lg",
      padding: "p-5",
    },
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "highlighted":
        return `${getThemeClasses("bg-primary-light")} ${getThemeClasses("border-primary")}`;
      default:
        return `${getThemeClasses("bg-disabled")} ${getThemeClasses("input-border")}`;
    }
  };

  return (
    <div className={className}>
      <label
        className={`block ${sizeClasses[size].label} font-semibold ${getThemeClasses("text-primary")} mb-3 flex items-center`}
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {label}
      </label>
      <div
        className={`${sizeClasses[size].padding} ${getVariantClasses()} rounded-xl border`}
      >
        <p
          className={`${sizeClasses[size].value} font-semibold ${getThemeClasses("text-primary")} whitespace-pre-wrap`}
        >
          {value || emptyText || "\u00A0"}
        </p>
      </div>
    </div>
  );
}

export default InfoField;

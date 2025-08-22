// File: src/components/UI/Select/Select.jsx

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Select Component
 * Dropdown selection from list of options
 *
 * @param {string} label - Select label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of {value, label} objects
 * @param {string} error - Error message
 * @param {boolean} disabled - Whether select is disabled
 * @param {boolean} required - Whether select is required
 * @param {string} placeholder - Placeholder text
 * @param {string} helperText - Helper text below select
 * @param {string} className - Additional CSS classes
 */
function Select({
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  helperText,
  className = "",
}) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3
          border rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          appearance-none
          bg-white
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;

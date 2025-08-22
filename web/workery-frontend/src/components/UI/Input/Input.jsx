// File: src/components/UI/Input/Input.jsx

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Input Component
 * Text input field with label, validation, and icon support
 *
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} required - Whether input is required
 * @param {React.Component} icon - Icon component to display
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional CSS classes
 */
function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3
            ${Icon ? "pl-10" : "pl-4"}
            border rounded-lg
            transition-all duration-200
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            }
            ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
          `}
        />
      </div>
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

export default Input;

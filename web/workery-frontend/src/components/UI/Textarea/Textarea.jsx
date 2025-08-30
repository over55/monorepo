// File: src/components/UI/Textarea/Textarea.jsx

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function Textarea({
  id, // Add id prop
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  helperText,
  className = "",
}) {
  // Generate a unique ID if none provided
  const textareaId =
    id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId} // Add htmlFor attribute
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId} // Add id attribute
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3
          border rounded-lg
          transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-1
          resize-y
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
        `}
      />
      {/* rest of component stays the same */}
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

// Export alias for backward compatibility
export const TextArea = Textarea;

export default Textarea;

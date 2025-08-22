// File: src/components/UI/Form/FormGroup.jsx

import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * FormGroup Component
 * Container for form field with label, helper text, and error
 *
 * @param {React.ReactNode} children - Form input element
 * @param {string} label - Field label
 * @param {string} error - Error message
 * @param {boolean} required - Whether field is required
 * @param {string} helperText - Helper text
 * @param {string} className - Additional CSS classes
 */
function FormGroup({
  children,
  label,
  error,
  required = false,
  helperText,
  className = "",
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

export default FormGroup;

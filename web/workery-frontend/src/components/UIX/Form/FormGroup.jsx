// File: src/components/UI/Form/FormGroup.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * FormGroup Component - Performance Optimized
 * Container for form field with label, helper text, and error
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized sub-elements to prevent re-renders
 * - Optimized className concatenation
 * - Prevented icon re-renders
 *
 * @param {React.ReactNode} children - Form input element
 * @param {string} label - Field label
 * @param {string} error - Error message
 * @param {boolean} required - Whether field is required
 * @param {string} helperText - Helper text
 * @param {string} className - Additional CSS classes
 */
const FormGroup = memo(function FormGroup({
  children,
  label,
  error,
  required = false,
  helperText,
  className = "",
}) {
  // Memoize container className to prevent recalculation
  const containerClassName = useMemo(() => {
    const classes = ["mb-6"];
    if (className) classes.push(className);
    return classes.join(" ");
  }, [className]);

  // Memoize label rendering
  const labelElement = useMemo(() => {
    if (!label) return null;

    return (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>
    );
  }, [label, required]);

  // Memoize helper text - only show if no error
  const helperTextElement = useMemo(() => {
    if (!helperText || error) return null;

    return <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>;
  }, [helperText, error]);

  // Memoize error message with icon
  const errorElement = useMemo(() => {
    if (!error) return null;

    return (
      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
        <ExclamationTriangleIcon
          className="h-4 w-4 mr-1 flex-shrink-0"
          aria-hidden="true"
        />
        <span>{error}</span>
      </p>
    );
  }, [error]);

  return (
    <div className={containerClassName}>
      {labelElement}
      {children}
      {helperTextElement}
      {errorElement}
    </div>
  );
});

// Set display name for React DevTools
FormGroup.displayName = "FormGroup";

export default FormGroup;

// File: src/components/UI/Form/FormRow.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";

/**
 * FormRow Component - Performance Optimized
 * Responsive grid container for form fields
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Optimized className concatenation
 * - Children processing optimization
 * - Early return for empty renders
 *
 * @param {React.ReactNode} children - Form fields
 * @param {string} className - Additional CSS classes
 */
const FormRow = memo(function FormRow({ children, className = "" }) {
  // Memoize the combined className string - all hooks MUST be before any conditional returns
  const containerClassName = useMemo(() => {
    const baseClasses = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4";
    return className ? `${baseClasses} ${className}` : baseClasses;
  }, [className]);

  // Process children only when they change
  const processedChildren = useMemo(() => {
    // Early return for no children
    if (!children) {
      return null;
    }

    // For single child, return as-is
    if (!Array.isArray(children)) {
      return children;
    }

    // For array of children, filter out null/undefined/false values
    // React.Children.toArray automatically handles keys and flattening
    const validChildren = React.Children.toArray(children).filter(Boolean);

    // Return null if all children are invalid
    return validChildren.length > 0 ? validChildren : null;
  }, [children]);

  // Don't render if no valid children after processing - AFTER all hooks
  if (!processedChildren) {
    return null;
  }

  return <div className={containerClassName}>{processedChildren}</div>;
});

// Set display name for React DevTools
FormRow.displayName = "FormRow";

export default FormRow;

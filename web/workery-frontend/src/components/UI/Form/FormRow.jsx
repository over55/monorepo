// File: src/components/UI/Form/FormRow.jsx

import React from "react";

/**
 * FormRow Component
 * Responsive grid container for form fields
 *
 * @param {React.ReactNode} children - Form fields
 * @param {string} className - Additional CSS classes
 */
function FormRow({ children, className = "" }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export default FormRow;

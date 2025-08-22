// File: src/components/UI/Form/FormSection.jsx

import React from "react";

/**
 * FormSection Component
 * Section container with title and description
 *
 * @param {string} title - Section title
 * @param {string} description - Section description
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional CSS classes
 */
function FormSection({ title, description, children, className = "" }) {
  return (
    <div className={`mb-8 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default FormSection;

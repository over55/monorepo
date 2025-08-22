// File: src/components/UI/Checkbox/Checkbox.jsx

import React from "react";

/**
 * Checkbox Component
 * Binary choice input element
 *
 * @param {string} label - Checkbox label text
 * @param {boolean} checked - Whether checkbox is checked
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Whether checkbox is disabled
 * @param {string} className - Additional CSS classes
 */
function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={`flex items-center cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
}

// Export alias for backward compatibility
export const CheckBox = Checkbox;

export default Checkbox;

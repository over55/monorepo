// File: src/components/UI/Radio/Radio.jsx

import React from "react";

/**
 * Radio Component
 * Single choice from multiple options
 *
 * @param {string} label - Radio label text
 * @param {string} name - Radio group name
 * @param {string} value - Radio value
 * @param {boolean} checked - Whether radio is checked
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Whether radio is disabled
 * @param {string} className - Additional CSS classes
 */
function Radio({
  label,
  name,
  value,
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
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 focus:ring-2"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
}

// Export alias for backward compatibility
export const RadioButton = Radio;

export default Radio;

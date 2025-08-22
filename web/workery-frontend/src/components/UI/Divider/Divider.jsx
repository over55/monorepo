// File: src/components/UI/Divider/Divider.jsx

import React from "react";

/**
 * Divider Component
 * Visual separator between content sections
 *
 * @param {string} className - Additional CSS classes
 * @param {string} text - Optional text to display in divider
 */
function Divider({ className = "", text = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      {text && (
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{text}</span>
        </div>
      )}
    </div>
  );
}

export default Divider;

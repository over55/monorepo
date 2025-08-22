// File: src/components/UI/Tooltip/Tooltip.jsx

import React from "react";

/**
 * Tooltip Component
 * Contextual information on hover
 *
 * @param {React.ReactNode} children - Element that triggers tooltip
 * @param {string} text - Tooltip text
 * @param {string} className - Additional CSS classes
 */
function Tooltip({ children, text, className = "" }) {
  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
        {text}
        <svg
          className="absolute text-gray-900 h-2 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );
}

export default Tooltip;

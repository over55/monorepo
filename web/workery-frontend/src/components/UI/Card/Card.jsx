// File: src/components/UI/Card/Card.jsx

import React from "react";

/**
 * Card Component
 * Container component for grouping related content
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} padding - Padding size
 */
function Card({ children, className = "", padding = "p-8" }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Export aliases for backward compatibility
export const Panel = Card;
export const Box = Card;

export default Card;

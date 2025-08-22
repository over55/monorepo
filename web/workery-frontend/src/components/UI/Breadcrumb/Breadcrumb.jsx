// File: src/components/UI/Breadcrumb/Breadcrumb.jsx

import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Breadcrumb Component
 * Navigation aid showing current page location
 *
 * @param {Array} items - Array of breadcrumb items with label, href, onClick, and optional icon
 * @param {string} className - Additional CSS classes
 */
function Breadcrumb({ items = [], className = "" }) {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-3 h-3 text-gray-400 mx-1" />
            )}
            {item.href ? (
              <a
                href={item.href}
                className={`inline-flex items-center text-sm font-medium ${
                  index === items.length - 1
                    ? "text-gray-500 cursor-default"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={item.onClick}
              >
                {item.icon &&
                  typeof item.icon === "function" &&
                  React.createElement(item.icon, {
                    className: "w-4 h-4 mr-2",
                  })}
                {item.icon && typeof item.icon === "string" && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.label}
              </a>
            ) : (
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  index === items.length - 1 ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {item.icon &&
                  typeof item.icon === "function" &&
                  React.createElement(item.icon, {
                    className: "w-4 h-4 mr-2",
                  })}
                {item.icon && typeof item.icon === "string" && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;

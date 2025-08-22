// File: src/components/UI/Tabs/Tabs.jsx

import React from "react";

/**
 * Tabs Component
 * Tab navigation interface
 *
 * @param {Array} tabs - Array of tab objects with id and label
 * @param {string} activeTab - Active tab id
 * @param {function} onTabChange - Tab change handler
 * @param {string} className - Additional CSS classes
 */
function Tabs({ tabs = [], activeTab, onTabChange, className = "" }) {
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Tabs;

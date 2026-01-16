// File: src/components/UIX/SettingsGrid/SettingsGrid.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import SettingsCard from "../SettingsCard/SettingsCard";

// Move static objects outside component to prevent recreation
const MAX_WIDTH_CLASSES = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

const DEFAULT_MAX_WIDTH = "7xl";

/**
 * SettingsGrid Component - Performance Optimized
 * Container for settings cards with responsive grid layout
 * Includes decorative background elements for visual appeal
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static MAX_WIDTH_CLASSES object moved outside component
 * - Memoized className strings to prevent re-concatenation
 * - Memoized items list rendering
 * - Memoized empty state section
 * - Prevented unnecessary re-renders
 *
 * @param {Array} items - Array of settings items with title, description, icon, path/action
 * @param {string} maxWidth - Maximum width constraint (4xl, 5xl, 6xl, 7xl)
 * @param {string} className - Additional CSS classes
 */
const SettingsGrid = memo(function SettingsGrid({
  items = [],
  maxWidth = DEFAULT_MAX_WIDTH,
  className = "",
}) {
  // Memoize className strings
  const containerClassName = useMemo(() => {
    return `relative ${MAX_WIDTH_CLASSES[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 ${className}`;
  }, [maxWidth, className]);

  // Memoize items list rendering
  const itemsList = useMemo(() => {
    return items.map((item, index) => (
      <SettingsCard
        key={item.path || item.title || index}
        title={item.title}
        description={item.description}
        icon={item.icon}
        path={item.path}
        action={item.action}
        disabled={item.disabled}
      />
    ));
  }, [items]);

  // Memoize empty state section
  const emptyState = useMemo(() => {
    if (items.length > 0) return null;

    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Settings Available</h3>
        <p className="text-gray-600">Settings will appear here when configured.</p>
      </div>
    );
  }, [items.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={containerClassName}>
        {/* Settings Grid Container */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="p-6 sm:p-8">
            {/* Settings Grid - Responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {itemsList}
            </div>

            {/* Empty state */}
            {emptyState}
          </div>
        </div>
      </div>

    </div>
  );
});

// Set display name for React DevTools
SettingsGrid.displayName = 'SettingsGrid';

export default SettingsGrid;
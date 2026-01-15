// File: src/components/UIX/ThemeSelector/ThemeSelector.jsx
// UIX Mobile Optimizations Applied
// Theme selector component for admin settings

import React, { memo, useMemo, useCallback } from 'react';
import { useUIXTheme, UIX_THEMES } from '../themes/useUIXTheme.jsx';
import { SwatchIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Move static theme configuration outside component to prevent recreation
const THEME_CONFIG = {
  [UIX_THEMES.BLUE]: {
    name: 'Blue Theme',
    description: 'Professional blue color scheme',
    previewColor: 'bg-blue-900',
    borderColor: 'border-blue-900',
  },
  [UIX_THEMES.RED]: {
    name: 'Red Theme',
    description: 'Bold red color scheme',
    previewColor: 'bg-red-900',
    borderColor: 'border-red-900',
  },
  [UIX_THEMES.PURPLE]: {
    name: 'Purple Theme',
    description: 'Elegant purple color scheme',
    previewColor: 'bg-purple-900',
    borderColor: 'border-purple-900',
  },
  [UIX_THEMES.GREEN]: {
    name: 'Green Theme',
    description: 'Natural green color scheme',
    previewColor: 'bg-green-900',
    borderColor: 'border-green-900',
  },
  [UIX_THEMES.CHARCOAL]: {
    name: 'Charcoal Theme',
    description: 'Sophisticated charcoal color scheme',
    previewColor: 'bg-slate-900',
    borderColor: 'border-slate-900',
  },
  [UIX_THEMES.DARK]: {
    name: 'Dark Theme',
    description: 'Dark mode color scheme',
    previewColor: 'bg-gray-950',
    borderColor: 'border-gray-950',
  }
};

const DEFAULT_LAYOUT = "horizontal";

/**
 * ThemeSelector Component - Performance Optimized
 * Allows users to switch between available UIX themes
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static theme configuration moved outside component
 * - Memoized event handler with useCallback (preserves theme switching)
 * - Memoized container classes
 * - Memoized theme button rendering
 * - Prevented unnecessary re-renders while maintaining theme switching functionality
 *
 * @param {string} className - Additional CSS classes
 * @param {boolean} showLabels - Whether to show theme labels
 * @param {string} layout - Layout style ('horizontal' or 'vertical')
 * @param {Function} onThemeChange - Optional callback when theme changes (receives theme key)
 */
const ThemeSelector = memo(function ThemeSelector({
  className = "",
  showLabels = true,
  layout = DEFAULT_LAYOUT,
  onThemeChange = null
}) {
  const { currentTheme, switchTheme, availableThemes, themeName, getThemeClasses } = useUIXTheme();

  // Memoize event handler - critical for theme switching functionality
  const handleThemeChange = useCallback((themeKey) => {
    switchTheme(themeKey);

    // Call optional callback for parent components (e.g., to save to backend)
    if (onThemeChange && typeof onThemeChange === 'function') {
      onThemeChange(themeKey);
    }
  }, [switchTheme, onThemeChange]);

  // Memoize container classes
  const containerClasses = useMemo(() => {
    return layout === 'horizontal'
      ? "flex flex-wrap gap-4 items-center justify-center"
      : "space-y-3";
  }, [layout]);

  // Memoize theme buttons section
  const themeButtons = useMemo(() => {
    return availableThemes.map(themeKey => {
      const config = THEME_CONFIG[themeKey];
      const isActive = currentTheme === themeKey;

      // Build button className based on active state and layout
      const buttonClassName = `
        group relative p-4 rounded-xl transition-all duration-200
        ${isActive
          ? `border-4 ${config.borderColor} bg-white shadow-lg`
          : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        focus:outline-none focus:ring-4 focus:ring-blue-500/20
        ${layout === 'horizontal' ? 'min-w-[140px]' : 'w-full'}
      `;

      const previewCircleClassName = `
        w-8 h-8 rounded-full ${config.previewColor}
        shadow-md group-hover:scale-110 transition-transform duration-200
        ${isActive ? 'ring-4 ring-offset-2 ring-blue-500/30' : ''}
      `;

      const nameClassName = `
        text-sm font-semibold transition-colors duration-200
        ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}
      `;

      return (
        <div key={themeKey} className="relative">
          <button
            onClick={() => handleThemeChange(themeKey)}
            className={buttonClassName}
            title={`Switch to ${config.name}`}
          >
            {/* Theme Preview Circle */}
            <div className="flex items-center justify-center mb-3">
              <div className={previewCircleClassName}>
                {isActive && (
                  <CheckCircleIcon className="w-5 h-5 text-white m-auto mt-1.5" />
                )}
              </div>
            </div>

            {/* Theme Info */}
            <div className="text-center">
              <p className={nameClassName}>
                {config.name}
              </p>
            </div>

            {/* Active Indicator */}
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm">
                  <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            )}
          </button>
        </div>
      );
    });
  }, [availableThemes, currentTheme, layout, handleThemeChange]);

  return (
    <div className={`${className}`}>
      {showLabels && (
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${getThemeClasses('text-primary')} flex items-center`}>
            <SwatchIcon className="w-5 h-5 mr-2" />
            Theme Selection
          </h3>
          <p className={`text-sm ${getThemeClasses('text-secondary')} mt-1`}>
            Choose your preferred color theme for the interface.
          </p>
          <p className={`text-xs ${getThemeClasses('text-secondary')} mt-1`}>
            Current: <span className="font-medium">{themeName}</span>
          </p>
        </div>
      )}

      <div className={containerClasses}>
        {themeButtons}
      </div>

    </div>
  );
});

// Set display name for React DevTools
ThemeSelector.displayName = 'ThemeSelector';

export default ThemeSelector;
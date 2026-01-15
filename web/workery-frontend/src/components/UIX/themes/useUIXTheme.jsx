// File Path: src/components/UIX/themes/useUIXTheme.jsx
// OPTIMIZED UIX Theme Context and Hook - Performance issues fixed
/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  UIX_THEMES,
  UIX_THEME_CONFIGS,
  DEFAULT_UIX_THEME,
  getUIXThemeClasses,
  isValidUIXTheme,
} from "./index";

// Create theme context - exported for components that need direct context access
export const UIXThemeContext = createContext(null);

// Cache for theme classes to prevent repeated lookups
const themeClassCache = new Map();

// Helper to get cached theme classes
const getCachedThemeClass = (themeName, classKey) => {
  const cacheKey = `${themeName}-${classKey}`;

  if (themeClassCache.has(cacheKey)) {
    return themeClassCache.get(cacheKey);
  }

  const value = getUIXThemeClasses(themeName, classKey);
  themeClassCache.set(cacheKey, value);

  // Limit cache size to prevent memory leaks
  if (themeClassCache.size > 500) {
    const firstKey = themeClassCache.keys().next().value;
    themeClassCache.delete(firstKey);
  }

  return value;
};

// Memoized default context value for when no provider exists
const defaultContextValue = {
  currentTheme: DEFAULT_UIX_THEME,
  themeName: UIX_THEME_CONFIGS[DEFAULT_UIX_THEME].name,
  getThemeClasses: (classKey) =>
    getCachedThemeClass(DEFAULT_UIX_THEME, classKey),
  switchTheme: () => {
    if (process.env.NODE_ENV === "development") {
      console.warn("UIXThemeProvider not found. Theme switching is disabled.");
    }
  },
  availableThemes: Object.keys(UIX_THEME_CONFIGS),
  isThemeProviderActive: false,
};

// Hook to use UIX theme
export const useUIXTheme = () => {
  const context = useContext(UIXThemeContext);

  // Return memoized default value if no provider
  if (!context) {
    return defaultContextValue;
  }

  return context;
};

// Theme Provider Component
export const UIXThemeProvider = React.memo(
  ({ children, defaultTheme = DEFAULT_UIX_THEME, forceTheme, onThemeChange }) => {
    // Initialize theme state with lazy initial state to avoid localStorage on every render
    const [currentTheme, setCurrentTheme] = useState(() => {
      // If forceTheme is provided, always use it (bypass localStorage)
      if (forceTheme && isValidUIXTheme(forceTheme)) {
        return forceTheme;
      }

      // Only access localStorage once on mount
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("uix-theme");
          if (saved && isValidUIXTheme(saved)) {
            return saved;
          }
        } catch (e) {
          // Handle localStorage errors gracefully
          console.warn("Could not access localStorage:", e);
        }
      }
      return isValidUIXTheme(defaultTheme) ? defaultTheme : DEFAULT_UIX_THEME;
    });

    // Use ref for callback to prevent recreation
    const onThemeChangeRef = useRef(onThemeChange);
    onThemeChangeRef.current = onThemeChange;

    // Add/remove 'dark' class on document element based on theme
    useEffect(() => {
      if (typeof document !== "undefined") {
        const isDarkTheme = currentTheme === UIX_THEMES.DARK;
        if (isDarkTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }, [currentTheme]);

    // Memoize getThemeClasses to prevent recreation
    const getThemeClasses = useCallback(
      (classKey) => {
        return getCachedThemeClass(currentTheme, classKey);
      },
      [currentTheme],
    );

    // Memoize switchTheme function
    const switchTheme = useCallback((themeName, { reload = true } = {}) => {
      console.log(`🎨 switchTheme called with: ${themeName}`);

      if (!isValidUIXTheme(themeName)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Invalid theme: ${themeName}. Available themes:`,
            Object.values(UIX_THEMES),
          );
        }
        return;
      }

      // Don't do anything if theme hasn't changed
      if (themeName === currentTheme) {
        console.log(`⏭️ Theme already set to ${themeName}, skipping`);
        return;
      }

      console.log(`✅ Switching theme from ${currentTheme} to ${themeName}`);

      // Clear the theme class cache to ensure fresh values on reload
      themeClassCache.clear();

      // Save to localStorage SYNCHRONOUSLY before reload
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("uix-theme", themeName);
          console.log(`💾 Theme saved to localStorage: ${themeName}`);
        } catch (e) {
          console.warn("Could not save theme to localStorage:", e);
        }
      }

      // Call optional callback before reload
      if (onThemeChangeRef.current) {
        onThemeChangeRef.current(themeName);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `UIX Theme switched to: ${UIX_THEME_CONFIGS[themeName].name}`,
        );
      }

      // Reload the page to apply the theme consistently across all components
      // This ensures all providers and memoized components get the new theme
      if (reload && typeof window !== "undefined") {
        console.log(`🔄 Reloading page to apply theme changes...`);
        // Use a small delay to ensure localStorage is flushed and React state is stable
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        // If no reload, still update state for immediate visual feedback
        setCurrentTheme(themeName);
      }
    }, [currentTheme]); // Add currentTheme to deps for logging

    // Memoize theme config
    const themeConfig = useMemo(
      () => UIX_THEME_CONFIGS[currentTheme],
      [currentTheme],
    );

    // Memoize available themes
    const availableThemes = useMemo(() => Object.keys(UIX_THEME_CONFIGS), []);

    // CRITICAL: Memoize the entire context value to prevent re-renders
    const contextValue = useMemo(
      () => ({
        currentTheme,
        themeName: themeConfig.name,
        getThemeClasses,
        switchTheme,
        availableThemes,
        themeConfig,
        isThemeProviderActive: true,
      }),
      [
        currentTheme,
        themeConfig,
        getThemeClasses,
        switchTheme,
        availableThemes,
      ],
    );

    return (
      <UIXThemeContext.Provider value={contextValue}>
        {children}
      </UIXThemeContext.Provider>
    );
  },
);

UIXThemeProvider.displayName = "UIXThemeProvider";

// Higher-order component for theme support - memoized
export const withUIXTheme = (Component) => {
  const ThemedComponent = React.memo((props) => {
    const themeProps = useUIXTheme();

    // Only pass theme props if they've changed
    return <Component {...props} {...themeProps} />;
  });

  ThemedComponent.displayName = `withUIXTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
};

// Hook for conditional theme classes with memoization
export const useUIXThemeClasses = (classKey, fallbackClasses = "") => {
  const { getThemeClasses } = useUIXTheme();

  // Memoize the result to prevent recalculation
  return useMemo(() => {
    return getThemeClasses(classKey) || fallbackClasses;
  }, [getThemeClasses, classKey, fallbackClasses]);
};

// Export theme constants for direct use
export { UIX_THEMES, DEFAULT_UIX_THEME } from "./index";

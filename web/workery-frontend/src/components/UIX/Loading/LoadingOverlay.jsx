// File: src/components/UIX/Loading/LoadingOverlay.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useEffect, useRef, useContext } from "react";
import { UIXThemeContext } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";

/**
 * Performance-Optimized LoadingOverlay Component
 *
 * Complete self-contained solution with all performance fixes:
 * - Integrated with UIX theme system when available
 * - Proper memoization and cleanup
 * - Body scroll management
 * - Dark mode support with fallbacks
 * - Zero unnecessary re-renders
 *
 * @param {boolean} isLoading - Whether to show the overlay
 * @param {string} title - Primary loading message (default: "Loading...")
 * @param {string} subtitle - Secondary loading message (default: "Please wait while we process your request.")
 * @param {string} variant - Style variant: 'default' | 'branded' (default: 'default')
 * @param {boolean} darkMode - Enable dark mode styling (default: auto-detect)
 * @param {string} className - Additional CSS classes for the overlay container
 * @param {string} cardClassName - Additional CSS classes for the card
 * @param {object} theme - Optional custom theme object (for advanced usage)
 */
const LoadingOverlay = React.memo(
  ({
    isLoading,
    title = "Loading...",
    subtitle = "Please wait while we process your request.",
    variant = "default",
    darkMode = null,
    className = "",
    cardClassName = "",
    theme = null,
  }) => {
    // Track mount state to prevent memory leaks
    const isMountedRef = useRef(true);
    const previousBodyOverflow = useRef(null);
    const previousBodyPaddingRight = useRef(null);

    // Try to get theme context - may be null if not within UIXThemeProvider
    const themeContext = useContext(UIXThemeContext);
    const getThemeClasses = themeContext?.getThemeClasses;

    // Auto-detect dark mode if not specified
    const isDarkMode = useMemo(() => {
      if (darkMode !== null) return darkMode;
      if (typeof window === "undefined") return false;
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }, [darkMode]);

    // Build theme configuration (computed once per theme change)
    const themeConfig = useMemo(() => {
      // Use provided theme if available
      if (theme) return theme;

      // Try to use UIX theme classes if available
      if (getThemeClasses) {
        return {
          // Overlay background
          bgOverlay: getThemeClasses("loading-overlay-bg") || (isDarkMode
            ? "bg-gray-900 bg-opacity-75"
            : "bg-black bg-opacity-60"),

          // Card background
          bgCard: getThemeClasses("bg-card") || (isDarkMode ? "bg-gray-800" : "bg-white"),

          // Text colors
          textPrimary: getThemeClasses("text-primary") || (isDarkMode ? "text-white" : "text-gray-900"),
          textMuted: getThemeClasses("text-muted") || (isDarkMode ? "text-gray-400" : "text-gray-600"),

          // Border colors for spinner
          borderBase: getThemeClasses("border-default") || (isDarkMode ? "border-gray-700" : "border-gray-200"),
          borderPrimary: getThemeClasses("loading-spinner-primary") || (isDarkMode ? "border-t-blue-400" : "border-t-blue-500"),
          borderBranded: getThemeClasses("loading-spinner-branded") || (isDarkMode ? "border-t-red-400" : "border-t-red-500"),

          // Card border for branded variant
          cardBorderBranded: getThemeClasses("loading-card-branded") || (isDarkMode
            ? "border-2 border-red-400"
            : "border-2 border-red-500"),

          // Shadow
          shadow: isDarkMode ? "shadow-2xl" : "shadow-xl",

          // Animation
          animation: "animate-spin",

          // Transition
          transition: "transition-all duration-200 ease-out",
        };
      }

      // Fallback theme configuration when no UIX theme context
      const baseTheme = {
        // Overlay background
        bgOverlay: isDarkMode
          ? "bg-gray-900 bg-opacity-75"
          : "bg-black bg-opacity-60",

        // Card background
        bgCard: isDarkMode ? "bg-gray-800" : "bg-white",

        // Text colors
        textPrimary: isDarkMode ? "text-white" : "text-gray-900",
        textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",

        // Border colors for spinner
        borderBase: isDarkMode ? "border-gray-700" : "border-gray-200",
        borderPrimary: isDarkMode ? "border-t-blue-400" : "border-t-blue-500",
        borderBranded: isDarkMode ? "border-t-red-400" : "border-t-red-500",

        // Card border for branded variant
        cardBorderBranded: isDarkMode
          ? "border-2 border-red-400"
          : "border-2 border-red-500",

        // Shadow
        shadow: isDarkMode ? "shadow-2xl" : "shadow-xl",

        // Animation
        animation: "animate-spin",

        // Transition
        transition: "transition-all duration-200 ease-out",
      };

      return baseTheme;
    }, [isDarkMode, theme, getThemeClasses]);

    // Memoize spinner classes based on variant
    const spinnerClasses = useMemo(() => {
      const baseClasses = `${themeConfig.animation} rounded-full h-8 w-8 border-b-2 border-l-2 border-transparent`;
      const borderColor =
        variant === "branded"
          ? themeConfig.borderBranded
          : themeConfig.borderPrimary;

      return `${baseClasses} ${borderColor}`;
    }, [variant, themeConfig]);

    // Memoize card classes based on variant
    const cardClasses = useMemo(() => {
      const baseClasses = `${themeConfig.bgCard} rounded-lg p-6 ${themeConfig.shadow} ${themeConfig.transition}`;
      const variantClasses =
        variant === "branded" ? themeConfig.cardBorderBranded : "";

      return `${baseClasses} ${variantClasses} ${cardClassName}`.trim();
    }, [variant, themeConfig, cardClassName]);

    // Manage body scroll and padding when overlay is active
    useEffect(() => {
      if (!isMountedRef.current) return;

      if (isLoading) {
        // Check if scrollbar is visible
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;

        // Store current body styles
        previousBodyOverflow.current = document.body.style.overflow;
        previousBodyPaddingRight.current = document.body.style.paddingRight;

        // Prevent scrolling
        document.body.style.overflow = "hidden";

        // Prevent layout shift from scrollbar removal
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Add aria attributes for accessibility
        document.body.setAttribute("aria-hidden", "true");
      } else if (previousBodyOverflow.current !== null) {
        // Restore previous body styles
        document.body.style.overflow = previousBodyOverflow.current || "";
        document.body.style.paddingRight =
          previousBodyPaddingRight.current || "";
        document.body.removeAttribute("aria-hidden");

        // Clear refs
        previousBodyOverflow.current = null;
        previousBodyPaddingRight.current = null;
      }

      // Cleanup function
      return () => {
        // Ensure cleanup on unmount
        if (previousBodyOverflow.current !== null) {
          document.body.style.overflow = previousBodyOverflow.current || "";
          document.body.style.paddingRight =
            previousBodyPaddingRight.current || "";
          document.body.removeAttribute("aria-hidden");
        }
        isMountedRef.current = false;
      };
    }, [isLoading]);

    // Don't render if not loading
    if (!isLoading) {
      return null;
    }

    // Render the overlay
    return (
      <Card
        padding="p-0"
        className={`fixed inset-0 ${themeConfig.bgOverlay} flex items-center justify-center z-[9999] ${themeConfig.transition} ${className} shadow-none border-0 rounded-none`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loading-overlay-title"
        aria-describedby={subtitle ? "loading-overlay-subtitle" : undefined}
        data-loading-overlay="true"
        style={{
          touchAction: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Card padding="p-0" className={cardClasses}>
          <Card padding="p-0" className="flex items-center space-x-4 shadow-none border-0 bg-transparent">
            {/* Spinner */}
            <Card padding="p-0" className={`${spinnerClasses} shadow-none border-0 bg-transparent`} role="status" aria-label="Loading">
              <span className="sr-only">Loading...</span>
            </Card>

            {/* Text Content */}
            <Card padding="p-0" className="flex-1 shadow-none border-0 bg-transparent">
              <h2
                id="loading-overlay-title"
                className={`text-lg font-medium ${themeConfig.textPrimary} leading-tight`}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  id="loading-overlay-subtitle"
                  className={`text-sm ${themeConfig.textMuted} mt-1 leading-relaxed`}
                >
                  {subtitle}
                </p>
              )}
            </Card>
          </Card>
        </Card>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if these props actually change
    return (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.variant === nextProps.variant &&
      prevProps.darkMode === nextProps.darkMode &&
      prevProps.className === nextProps.className &&
      prevProps.cardClassName === nextProps.cardClassName &&
      prevProps.theme === nextProps.theme
    );
  },
);

// Set display name for debugging
LoadingOverlay.displayName = "LoadingOverlay";

// Default export
export default LoadingOverlay;

/**
 * USAGE EXAMPLES:
 *
 * Basic usage:
 * ```jsx
 * <LoadingOverlay isLoading={isLoading} />
 * ```
 *
 * With custom text:
 * ```jsx
 * <LoadingOverlay
 *   isLoading={isLoading}
 *   title="Saving changes..."
 *   subtitle="This may take a few moments"
 * />
 * ```
 *
 * Branded variant with dark mode:
 * ```jsx
 * <LoadingOverlay
 *   isLoading={isLoading}
 *   variant="branded"
 *   darkMode={true}
 * />
 * ```
 *
 * With custom theme:
 * ```jsx
 * const customTheme = {
 *   bgOverlay: "bg-blue-900 bg-opacity-90",
 *   bgCard: "bg-blue-800",
 *   textPrimary: "text-white",
 *   textMuted: "text-blue-200",
 *   borderPrimary: "border-t-yellow-400",
 *   // ... other theme properties
 * };
 *
 * <LoadingOverlay
 *   isLoading={isLoading}
 *   theme={customTheme}
 * />
 * ```
 *
 * PERFORMANCE TIPS:
 *
 * 1. The component is fully optimized - just use it normally
 * 2. Theme objects should be memoized if created dynamically:
 *    ```jsx
 *    const theme = useMemo(() => ({ ... }), [dependencies]);
 *    ```
 * 3. The component handles all cleanup automatically
 * 4. No external dependencies or hooks required
 *
 * MIGRATION FROM OLD VERSION:
 *
 * If your old version used useUIXTheme hook:
 * 1. Remove the hook import
 * 2. Replace with this component directly
 * 3. Use darkMode prop or let it auto-detect
 *
 * Old: <LoadingOverlay isLoading={loading} />
 * New: <LoadingOverlay isLoading={loading} />
 * (It's a drop-in replacement!)
 */

// File: src/components/UI/Loading/Loading.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useEffect, useRef } from "react";

/**
 * Performance-optimized Loading Component
 * Addresses memory leaks and performance issues
 *
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} text - Loading text to display
 * @param {boolean} fullScreen - Whether to cover full screen
 * @param {string} className - Additional CSS classes
 * @param {object} theme - Theme configuration object (pass this as prop to avoid hook calls)
 */
const Loading = React.memo(
  ({
    size = "md",
    text = "",
    fullScreen = false,
    className = "",
    theme = null,
  }) => {
    // Use ref to track mount state and prevent memory leaks
    const isMountedRef = useRef(true);

    // Clean up on unmount
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    // Memoize size classes to prevent recreation on every render
    const sizeClasses = useMemo(
      () => ({
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
      }),
      [],
    );

    // Memoize the current size class
    const currentSizeClass = useMemo(
      () => sizeClasses[size] || sizeClasses.md,
      [size, sizeClasses],
    );

    // Build theme classes efficiently (only compute once per render)
    const themeClasses = useMemo(() => {
      // If no theme provided, use default classes
      if (!theme) {
        return {
          bgOverlay: "bg-black bg-opacity-50",
          borderDisabled: "border-gray-200 dark:border-gray-700",
          borderPrimary: "border-t-blue-500 dark:border-t-blue-400",
          textMuted: "text-gray-600 dark:text-gray-400",
        };
      }

      // Use theme configuration if provided
      return {
        bgOverlay: theme.bgOverlay || "bg-black bg-opacity-50",
        borderDisabled: theme.borderDisabled || "border-gray-200 dark:border-gray-700",
        borderPrimary: theme.borderPrimary || "border-t-blue-500 dark:border-t-blue-400",
        textMuted: theme.textMuted || "text-gray-600 dark:text-gray-400",
      };
    }, [theme]);

    // Memoize spinner element to prevent recreation
    const spinnerElement = useMemo(
      () => (
        <div
          className={`
        border-4 ${themeClasses.borderDisabled} ${themeClasses.borderPrimary}
        rounded-full animate-spin
        ${currentSizeClass}
      `}
          role="status"
          aria-label="Loading"
        />
      ),
      [themeClasses, currentSizeClass],
    );

    // Memoize text element
    const textElement = useMemo(
      () =>
        text ? (
          <p className={`mt-4 ${themeClasses.textMuted} text-center`}>{text}</p>
        ) : null,
      [text, themeClasses.textMuted],
    );

    // Check for duplicate fullscreen loaders (moved before conditional return)
    useEffect(() => {
      if (!fullScreen) return;

      const existingLoader = document.querySelector(
        '[data-loading-fullscreen="true"]',
      );
      if (
        existingLoader &&
        existingLoader.parentNode !==
          document.getElementById("loading-portal")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Multiple fullscreen loaders detected. This may cause performance issues.",
          );
        }
      }
    }, [fullScreen]);

    // Handle fullScreen mode
    if (fullScreen) {
      return (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${themeClasses.bgOverlay}`}
          data-loading-fullscreen="true"
          style={{
            touchAction: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {spinnerElement}
          {textElement}
        </div>
      );
    }

    // Regular loading indicator
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {spinnerElement}
        {textElement}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo - only re-render if these props actually change
    return (
      prevProps.size === nextProps.size &&
      prevProps.text === nextProps.text &&
      prevProps.fullScreen === nextProps.fullScreen &&
      prevProps.className === nextProps.className &&
      prevProps.theme === nextProps.theme
    );
  },
);

// Set display name for debugging
Loading.displayName = "Loading";

// Export aliases for backward compatibility
export const Loader = Loading;
export const LoadingIndicator = Loading;

export default Loading;

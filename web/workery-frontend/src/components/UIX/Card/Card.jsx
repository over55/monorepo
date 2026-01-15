// File: src/components/UIX/Card/Card.jsx
// UIX Mobile Optimizations Applied
// Card Component - Performance Optimized

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Card Component - Performance Optimized
 * Container component for grouping related content
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {string} padding - Padding size
 * @param {string|React.ElementType} as - Element type to render as (default: "div")
 * @param {Object} ...props - Additional props passed to the element (e.g., onSubmit for forms)
 */
const Card = memo(
  // eslint-disable-next-line no-unused-vars -- Component is used in JSX
  function Card({ children, className = "", padding = "p-8", as: Component = "div", ...props }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes with single retrieval
    // Use fallbacks that work for both light and dark modes
    const themeClasses = useMemo(
      () => ({
        bg: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
        border: getThemeClasses("card-border") || "border-gray-200 dark:border-gray-700",
      }),
      [getThemeClasses],
    );

    // Memoize the complete className
    const cardClasses = useMemo(() => {
      const classes = [
        themeClasses.bg,
        "rounded-xl",
        "shadow-lg",
        "border",
        themeClasses.border,
        padding,
      ];

      if (className) {
        classes.push(className);
      }

      return classes.filter(Boolean).join(" ");
    }, [themeClasses, padding, className]);

    return <Component className={cardClasses} {...props}>{children}</Component>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props change
    // Note: We check 'as' prop and use shallow comparison for additional props
    return (
      prevProps.className === nextProps.className &&
      prevProps.padding === nextProps.padding &&
      prevProps.children === nextProps.children &&
      prevProps.as === nextProps.as &&
      prevProps.onSubmit === nextProps.onSubmit &&
      prevProps.onClick === nextProps.onClick
    );
  },
);

// Display name for debugging
Card.displayName = "Card";

// Export aliases for backward compatibility
export const Panel = Card;
export const Box = Card;

export default Card;

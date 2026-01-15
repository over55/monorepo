// File: src/components/UIX/Text/Text.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Text Component
 * A themed text component for consistent typography across the application
 *
 * @param {string} size - Text size (xs, sm, base, lg, xl, 2xl)
 * @param {string} color - Text color (primary, secondary, muted, success, warning, error, inherit)
 * @param {string} weight - Font weight (normal, medium, semibold, bold)
 * @param {boolean} truncate - Whether to truncate with ellipsis
 * @param {boolean} inline - Render as span instead of p
 * @param {string} as - Override element type (p, span, div, label)
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Text content
 */
const Text = memo(function Text({
  size = "base",
  color = "primary",
  weight = "normal",
  truncate = false,
  inline = false,
  as,
  className = "",
  children,
  ...props
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize size classes
  const sizeClass = useMemo(() => {
    const sizes = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    };
    return sizes[size] || sizes.base;
  }, [size]);

  // Memoize color classes
  const colorClass = useMemo(() => {
    const colors = {
      primary: getThemeClasses("text-primary"),
      secondary: getThemeClasses("text-secondary"),
      muted: getThemeClasses("text-muted"),
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      danger: "text-red-600",
      info: "text-blue-600",
      inherit: "",
    };
    return colors[color] || colors.primary;
  }, [color, getThemeClasses]);

  // Memoize weight classes
  const weightClass = useMemo(() => {
    const weights = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };
    return weights[weight] || weights.normal;
  }, [weight]);

  // Memoize combined classes
  const combinedClasses = useMemo(() => {
    const classes = [sizeClass, colorClass, weightClass];
    if (truncate) {
      classes.push("truncate");
    }
    if (className) {
      classes.push(className);
    }
    return classes.join(" ");
  }, [sizeClass, colorClass, weightClass, truncate, className]);

  // Determine element type
  const Element = as || (inline ? "span" : "p");

  return (
    <Element className={combinedClasses} {...props}>
      {children}
    </Element>
  );
});

Text.displayName = "Text";

export default Text;

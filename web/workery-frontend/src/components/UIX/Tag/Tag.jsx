// File: src/components/UIX/Tag/Tag.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Tag Component
 * A small inline tag/chip for displaying reference IDs, categories, or labels
 *
 * @param {React.ReactNode} children - Tag content
 * @param {string} variant - Style variant (default, muted, primary, success, warning, info)
 * @param {string} size - Size variant (xs, sm)
 * @param {string} className - Additional CSS classes
 */
const Tag = memo(function Tag({
  children,
  variant = "muted",
  size = "xs",
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize variant classes
  const variantClasses = useMemo(() => {
    const variants = {
      muted: `${getThemeClasses("text-muted")} ${getThemeClasses("bg-disabled")}`,
      default: `${getThemeClasses("text-secondary")} ${getThemeClasses("bg-disabled")}`,
      primary: "text-blue-700 bg-blue-50",
      success: "text-green-700 bg-green-50",
      warning: "text-yellow-700 bg-yellow-50",
      info: "text-cyan-700 bg-cyan-50",
    };
    return variants[variant] || variants.muted;
  }, [variant, getThemeClasses]);

  // Memoize size classes
  const sizeClasses = useMemo(() => {
    const sizes = {
      xs: "text-xs px-2 py-0.5",
      sm: "text-sm px-2.5 py-1",
    };
    return sizes[size] || sizes.xs;
  }, [size]);

  // Memoize combined classes
  const combinedClasses = useMemo(
    () => `inline-block rounded ${sizeClasses} ${variantClasses} ${className}`.trim(),
    [sizeClasses, variantClasses, className],
  );

  return <span className={combinedClasses}>{children}</span>;
});

Tag.displayName = "Tag";

export default Tag;

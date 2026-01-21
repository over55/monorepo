// File: src/components/UIX/UrgencyBadge/UrgencyBadge.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

/**
 * UrgencyBadge Component
 * Displays urgency indicators with color-coded styling and optional icon
 *
 * @param {string} label - The urgency label to display
 * @param {string} variant - Color variant (red, orange, yellow, blue, green, gray)
 * @param {boolean} showIcon - Whether to show the clock icon (default: true)
 * @param {React.ComponentType} icon - Custom icon component (default: ClockIcon)
 * @param {string} size - Size variant (sm, md)
 * @param {string} className - Additional CSS classes
 */
const UrgencyBadge = memo(function UrgencyBadge({
  label,
  variant = "gray",
  showIcon = true,
  icon: Icon = ClockIcon,
  size = "md",
  className = "",
}) {
  // Memoize color classes based on variant
  const colorClasses = useMemo(() => {
    const colors = {
      red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      orange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
      blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    };
    return colors[variant] || colors.gray;
  }, [variant]);

  // Memoize size classes
  const sizeClasses = useMemo(() => {
    const sizes = {
      sm: {
        badge: "text-xs px-2 py-0.5",
        icon: "w-3 h-3",
      },
      md: {
        badge: "text-xs px-2 py-1",
        icon: "w-3 h-3",
      },
    };
    return sizes[size] || sizes.md;
  }, [size]);

  // Memoize combined badge classes
  const badgeClasses = useMemo(
    () =>
      `inline-flex items-center gap-1 font-semibold rounded border ${sizeClasses.badge} ${colorClasses} ${className}`.trim(),
    [sizeClasses.badge, colorClasses, className],
  );

  if (!label) return null;

  return (
    <span className={badgeClasses}>
      {showIcon && Icon && <Icon className={sizeClasses.icon} />}
      {label}
    </span>
  );
});

UrgencyBadge.displayName = "UrgencyBadge";

export default UrgencyBadge;

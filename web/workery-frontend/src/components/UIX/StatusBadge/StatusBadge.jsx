// File Path: src/components/UIX/StatusBadge/StatusBadge.jsx
// UIX Mobile Optimizations Applied
// StatusBadge Component - Theme-aware entity status display

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/**
 * StatusBadge Component
 * Theme-aware badge for displaying entity status (active, archived, banned, pending, etc.)
 *
 * @param {Object} props
 * @param {number} props.status - Entity status code (1=active, 2=archived, etc.)
 * @param {boolean} props.isBanned - Whether entity is banned
 * @param {boolean} props.isPending - Whether entity is pending
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {Object} props.labels - Custom labels for statuses
 * @param {boolean} props.showIcon - Whether to show status icon
 * @param {string} props.className - Additional CSS classes
 */

// Static size classes
const SIZE_CLASSES = Object.freeze({
  sm: "px-2 py-0.5 text-xs",
  md: "px-2 sm:px-2.5 py-0.5 text-xs sm:text-sm",
  lg: "px-3 py-1 text-sm sm:text-base",
});

const ICON_SIZE_CLASSES = Object.freeze({
  sm: "w-3 h-3",
  md: "w-3 sm:w-4 h-3 sm:h-4",
  lg: "w-4 sm:w-5 h-4 sm:h-5",
});

// Default labels
const DEFAULT_LABELS = Object.freeze({
  active: "Active",
  archived: "Archived",
  banned: "Banned",
  pending: "Pending",
  inactive: "Inactive",
  warning: "Warning",
});

// Status icon mapping
const STATUS_ICONS = Object.freeze({
  active: CheckCircleIcon,
  archived: ArchiveBoxIcon,
  banned: XCircleIcon,
  pending: ClockIcon,
  inactive: NoSymbolIcon,
  warning: ExclamationTriangleIcon,
});

const StatusBadge = memo(function StatusBadge({
  status = 1,
  isBanned = false,
  isPending = false,
  size = "md",
  labels = {},
  showIcon = true,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      badgeSuccess: getThemeClasses("badge-success"),
      badgeError: getThemeClasses("badge-error"),
      badgeWarning: getThemeClasses("badge-warning"),
      badgeDefault: getThemeClasses("badge-default"),
      badgeInfo: getThemeClasses("badge-info"),
    }),
    [getThemeClasses],
  );

  // Determine status type and get appropriate styling
  const statusConfig = useMemo(() => {
    const mergedLabels = { ...DEFAULT_LABELS, ...labels };

    // Priority: banned > pending > status code
    if (isBanned) {
      return {
        type: "banned",
        label: mergedLabels.banned,
        icon: STATUS_ICONS.banned,
        themeClass: themeClasses.badgeError || "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    }

    if (isPending) {
      return {
        type: "pending",
        label: mergedLabels.pending,
        icon: STATUS_ICONS.pending,
        themeClass: themeClasses.badgeWarning || "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    }

    // Status code based
    switch (status) {
      case 1: // Active
        return {
          type: "active",
          label: mergedLabels.active,
          icon: STATUS_ICONS.active,
          themeClass: themeClasses.badgeSuccess || "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case 2: // Archived
        return {
          type: "archived",
          label: mergedLabels.archived,
          icon: STATUS_ICONS.archived,
          themeClass: themeClasses.badgeDefault || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        };
      default: // Unknown/Inactive
        return {
          type: "inactive",
          label: mergedLabels.inactive,
          icon: STATUS_ICONS.inactive,
          themeClass: themeClasses.badgeDefault || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        };
    }
  }, [status, isBanned, isPending, labels, themeClasses]);

  // Memoize size classes
  const sizeClass = useMemo(
    () => SIZE_CLASSES[size] || SIZE_CLASSES.md,
    [size],
  );

  const iconSizeClass = useMemo(
    () => ICON_SIZE_CLASSES[size] || ICON_SIZE_CLASSES.md,
    [size],
  );

  // Memoize final badge classes
  const badgeClasses = useMemo(
    () =>
      `inline-flex items-center rounded-full font-medium ${sizeClass} ${statusConfig.themeClass} ${className}`.trim(),
    [sizeClass, statusConfig.themeClass, className],
  );

  const IconComponent = statusConfig.icon;

  return (
    <span className={badgeClasses} role="status" aria-label={statusConfig.label}>
      {showIcon && IconComponent && (
        <IconComponent className={`${iconSizeClass} mr-1`} />
      )}
      {statusConfig.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;

// Export status constants for use in pages
export const STATUS_CODES = Object.freeze({
  ACTIVE: 1,
  ARCHIVED: 2,
});

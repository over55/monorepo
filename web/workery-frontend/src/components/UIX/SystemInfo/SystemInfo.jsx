// File: src/components/UIX/SystemInfo/SystemInfo.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import Card from "../Card/Card.jsx";
import Badge from "../Badge/Badge.jsx";
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

// Move static default value outside component to prevent recreation
const DEFAULT_DATE_TEXT = "Not available";

/**
 * SystemInfo Component - Performance Optimized
 * Displays system metadata like creation and modification information
 * Used in detail pages to show audit trail information
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default value moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized formatDate function with useCallback
 * - Memoized formatted dates
 * - Memoized className strings
 * - Memoized sections (creation details, modification details)
 * - Prevented unnecessary re-renders
 *
 * @param {string} createdAt - Creation date/time
 * @param {string} createdByUserName - User who created the record
 * @param {string} createdFromIpAddress - IP address of creation
 * @param {string} modifiedAt - Last modification date/time
 * @param {string} modifiedByUserName - User who last modified the record
 * @param {string} modifiedFromIpAddress - IP address of last modification
 * @param {string} className - Additional CSS classes
 */
const SystemInfo = memo(function SystemInfo({
  createdAt,
  createdByUserName,
  createdFromIpAddress,
  modifiedAt,
  modifiedByUserName,
  modifiedFromIpAddress,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      cardHeaderBg: getThemeClasses('card-header-bg'),
      cardBorder: getThemeClasses('card-border'),
      cardHeaderText: getThemeClasses('card-header-text'),
      textSecondary: getThemeClasses('text-secondary'),
      textPrimary: getThemeClasses('text-primary'),
    }),
    [getThemeClasses],
  );

  // Memoize date formatting function
  const formatDate = useCallback((dateString) => {
    if (!dateString) return DEFAULT_DATE_TEXT;
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }, []);

  // Memoize formatted dates
  const formattedCreatedAt = useMemo(() => formatDate(createdAt), [createdAt, formatDate]);
  const formattedModifiedAt = useMemo(() => formatDate(modifiedAt), [modifiedAt, formatDate]);

  // Check if modification details exist
  const hasModificationDetails = modifiedAt || modifiedByUserName || modifiedFromIpAddress;

  // Simple text row component for read-only display
  // eslint-disable-next-line no-unused-vars -- Icon is used in JSX
  const TextRow = ({ icon: Icon, label, value }) => (
    <Card padding="p-0" className="flex items-center shadow-none border-0 bg-transparent">
      <Icon className={`w-4 h-4 mr-2 ${themeClasses.textSecondary} flex-shrink-0`} />
      <Badge variant="secondary" size="sm" className="mr-2">{label}:</Badge>
      <Card padding="p-0" className={`${themeClasses.textPrimary} text-sm shadow-none border-0 bg-transparent`}>
        {value}
      </Card>
    </Card>
  );

  return (
    <Card padding="p-0" className={`shadow-none border-0 bg-transparent ${className}`}>
      <Badge variant="secondary" size="lg" className="mt-3 mb-3">
        System Information
      </Badge>

      {/* Two-column grid layout */}
      <Card padding="p-0" className={`grid grid-cols-1 ${hasModificationDetails ? 'md:grid-cols-2' : ''} gap-4 shadow-none border-0 bg-transparent`}>
        {/* Creation Details */}
        <Card className={`${themeClasses.cardHeaderBg} rounded-xl ${themeClasses.cardBorder} border`} padding="p-4">
          <Card padding="p-0" className="flex items-center mb-3 shadow-none border-0 bg-transparent">
            <ClockIcon className={`w-4 h-4 mr-2 ${themeClasses.cardHeaderText}`} />
            <Badge variant="primary" size="sm">Creation Details</Badge>
          </Card>
          <Card padding="p-0" className="space-y-2 shadow-none border-0 bg-transparent">
            <TextRow icon={CalendarIcon} label="Created" value={formattedCreatedAt} />
            {createdByUserName && (
              <TextRow icon={UserIcon} label="By" value={createdByUserName} />
            )}
            {createdFromIpAddress && (
              <TextRow icon={GlobeAltIcon} label="IP" value={createdFromIpAddress} />
            )}
          </Card>
        </Card>

        {/* Modification Details */}
        {hasModificationDetails && (
          <Card className={`${themeClasses.cardHeaderBg} rounded-xl ${themeClasses.cardBorder} border`} padding="p-4">
            <Card padding="p-0" className="flex items-center mb-3 shadow-none border-0 bg-transparent">
              <ClockIcon className={`w-4 h-4 mr-2 ${themeClasses.cardHeaderText}`} />
              <Badge variant="warning" size="sm">Last Modification</Badge>
            </Card>
            <Card padding="p-0" className="space-y-2 shadow-none border-0 bg-transparent">
              {modifiedAt && (
                <TextRow icon={CalendarIcon} label="Modified" value={formattedModifiedAt} />
              )}
              {modifiedByUserName && (
                <TextRow icon={UserIcon} label="By" value={modifiedByUserName} />
              )}
              {modifiedFromIpAddress && (
                <TextRow icon={GlobeAltIcon} label="IP" value={modifiedFromIpAddress} />
              )}
            </Card>
          </Card>
        )}
      </Card>
    </Card>
  );
});

// Set display name for React DevTools
SystemInfo.displayName = 'SystemInfo';

export default SystemInfo;
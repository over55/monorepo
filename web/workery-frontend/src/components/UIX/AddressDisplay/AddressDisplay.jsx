// File Path: src/components/UIX/AddressDisplay/AddressDisplay.jsx
// UIX Mobile Optimizations Applied
// Reusable AddressDisplay component with theme-aware Google Maps link - Performance Optimized

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import {
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// Size configurations moved outside component to prevent recreation
const SIZE_CLASSES = {
  sm: {
    text: "text-xs sm:text-sm",
    icon: "w-3 sm:w-4 h-3 sm:h-4",
    mapIcon: "w-2 sm:w-3 h-2 sm:h-3",
  },
  md: {
    text: "text-sm sm:text-base lg:text-lg",
    icon: "w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6",
    mapIcon: "w-3 sm:w-4 h-3 sm:h-4",
  },
  lg: {
    text: "text-base sm:text-lg lg:text-xl",
    icon: "w-5 sm:w-6 h-5 sm:h-6 lg:w-7 lg:h-7",
    mapIcon: "w-4 sm:w-5 h-4 sm:h-5",
  },
};

// Helper function moved outside to prevent recreation
const formatAddressHelper = (data) => {
  if (!data) return null;
  const parts = [];
  if (data.addressLine1) parts.push(data.addressLine1);
  if (data.addressLine2) parts.push(data.addressLine2);
  if (data.city) parts.push(data.city);
  if (data.region) parts.push(data.region);
  if (data.postalCode) parts.push(data.postalCode);
  if (data.country) parts.push(data.country);
  return parts.length > 0 ? parts.join(", ") : null;
};

// Helper function for Google Maps URL
const getGoogleMapsUrlHelper = (formattedAddress) => {
  if (!formattedAddress) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`;
};

// Static click handler - doesn't need to be recreated
const handleMapsClick = (e) => {
  e.stopPropagation();
};

/**
 * AddressDisplay Component - Performance Optimized
 * Displays address information with theme-aware Google Maps link
 *
 * Features:
 * - Theme-aware Google Maps icon that adapts to blue/red themes
 * - Automatic address formatting from multiple fields
 * - Responsive sizing for mobile and desktop
 * - Optional Google Maps integration
 * - Fallback display for missing address info
 *
 * @param {Object} props
 * @param {Object} props.addressData - Address object with fields
 * @param {string} props.addressData.addressLine1 - Primary address line
 * @param {string} props.addressData.addressLine2 - Secondary address line
 * @param {string} props.addressData.city - City
 * @param {string} props.addressData.region - State/Region
 * @param {string} props.addressData.postalCode - Postal/ZIP code
 * @param {string} props.addressData.country - Country
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.showIcon - Whether to show the map pin icon
 * @param {boolean} props.showMapsLink - Whether to show Google Maps link
 * @param {string} props.fallbackText - Text to show when no address provided
 */
const AddressDisplay = memo(
  function AddressDisplay({
    addressData,
    className = "",
    size = "md",
    showIcon = true,
    showMapsLink = true,
    fallbackText = "No address provided",
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Get size classes
    const sizes = useMemo(() => SIZE_CLASSES[size] || SIZE_CLASSES.md, [size]);

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        linkPrimary: getThemeClasses("link-primary"),
        link: getThemeClasses("link"),
        textMuted: getThemeClasses("text-muted"),
        textSecondary: getThemeClasses("text-secondary"),
      }),
      [getThemeClasses],
    );

    // Extract addressData serialization for stable dependency comparison
    const addressDataKey = addressData ? JSON.stringify(addressData) : null;

    // Memoize formatted address with proper dependency
    const formattedAddress = useMemo(
      () => formatAddressHelper(addressData),
      // addressData is included for the linter, addressDataKey provides deep comparison stability
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [addressData, addressDataKey],
    );

    // Memoize Google Maps URL
    const mapsUrl = useMemo(() => {
      if (!showMapsLink || !formattedAddress) return null;
      return getGoogleMapsUrlHelper(formattedAddress);
    }, [formattedAddress, showMapsLink]);

    // Memoize all classes at once for better efficiency
    const classes = useMemo(() => {
      // Build container classes
      const containerClasses = [
        "flex",
        "items-start",
        sizes.text,
        "justify-center",
        "xl:justify-start",
      ];

      if (className) {
        containerClasses.push(className);
      }

      // Build icon classes
      const iconClasses = [
        sizes.icon,
        "mr-2",
        "mt-0.5",
        "flex-shrink-0",
        themeClasses.textSecondary,
      ];

      // Build map icon classes
      const mapIconClasses = [sizes.mapIcon, themeClasses.linkPrimary];

      // Build link classes with mobile optimizations
      const linkClasses = [
        "ml-2",
        "inline-flex",
        "items-center",
        "min-h-[44px]",
        "min-w-[44px]",
        "touch-manipulation",
        "select-none",
        themeClasses.linkPrimary,
      ];

      return {
        container: containerClasses.join(" "),
        icon: iconClasses.join(" "),
        mapIcon: mapIconClasses.join(" "),
        link: linkClasses.join(" "),
        fallbackText: themeClasses.textMuted,
        addressText: `break-words ${themeClasses.link}`,
      };
    }, [sizes, className, themeClasses.linkPrimary, themeClasses.link, themeClasses.textMuted, themeClasses.textSecondary]);

    // Render empty state
    if (!formattedAddress) {
      return (
        <div className={classes.container}>
          {showIcon && <MapPinIcon className={classes.icon} />}
          <div className="min-w-0 flex-1">
            <span className={classes.fallbackText}>{fallbackText}</span>
          </div>
        </div>
      );
    }

    // Render address with optional maps link
    return (
      <div className={classes.container}>
        {showIcon && <MapPinIcon className={classes.icon} />}
        <div className="min-w-0 flex-1">
          <span className={classes.addressText}>{formattedAddress}</span>
          {showMapsLink && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.link}
              onClick={handleMapsClick}
              aria-label="Open address in Google Maps"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowTopRightOnSquareIcon className={classes.mapIcon} />
            </a>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    // Use JSON.stringify for addressData deep comparison
    return (
      JSON.stringify(prevProps.addressData) ===
        JSON.stringify(nextProps.addressData) &&
      prevProps.className === nextProps.className &&
      prevProps.size === nextProps.size &&
      prevProps.showIcon === nextProps.showIcon &&
      prevProps.showMapsLink === nextProps.showMapsLink &&
      prevProps.fallbackText === nextProps.fallbackText
    );
  },
);

// Set display name for debugging
AddressDisplay.displayName = "AddressDisplay";

export default AddressDisplay;

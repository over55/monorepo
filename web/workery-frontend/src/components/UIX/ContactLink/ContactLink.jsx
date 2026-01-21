// File Path: src/components/UIX/ContactLink/ContactLink.jsx
// UIX Mobile Optimizations Applied
// Reusable ContactLink component for email and phone links with theme-aware styling - Performance Optimized

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

/**
 * ContactLink Component - Performance Optimized
 * Displays email or phone contact information with theme-aware styling and appropriate icons
 *
 * Features:
 * - Theme-aware link colors that adapt to blue/red themes
 * - Automatic icon selection based on contact type
 * - Responsive sizing for mobile and desktop
 * - Accessible link formatting (mailto: and tel:)
 * - Fallback display for missing contact info
 *
 * @param {Object} props
 * @param {string} props.type - Contact type: 'email' or 'phone'
 * @param {string} props.value - Contact value (email address or phone number)
 * @param {string} props.label - Optional label for the contact type
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.showIcon - Whether to show the contact type icon
 * @param {string} props.fallbackText - Text to show when no value provided
 */

// Static configuration moved outside component to prevent recreation
const SIZE_CLASSES = {
  sm: {
    text: "text-xs sm:text-sm",
    icon: "w-3 sm:w-4 h-3 sm:h-4",
  },
  md: {
    text: "text-sm sm:text-base lg:text-lg",
    icon: "w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6",
  },
  lg: {
    text: "text-base sm:text-lg lg:text-xl",
    icon: "w-5 sm:w-6 h-5 sm:h-6 lg:w-7 lg:h-7",
  },
};

// Phone number formatter function (pure function, no need to recreate)
const formatPhoneNumber = (val) => {
  if (!val) return val;
  const cleaned = val.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return val;
};

// Contact configuration (static, no need to recreate)
const CONTACT_CONFIG = {
  email: {
    icon: EnvelopeIcon,
    hrefPrefix: "mailto:",
    formatter: (val) => val, // Email addresses don't need formatting
  },
  phone: {
    icon: PhoneIcon,
    hrefPrefix: "tel:",
    formatter: formatPhoneNumber,
  },
};

const ContactLink = memo(
  ({
    type = "email",
    value,
    label,
    className = "",
    size = "md",
    showIcon = true,
    fallbackText = "Not provided",
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize configuration lookups
    const config = useMemo(() => {
      return CONTACT_CONFIG[type] || CONTACT_CONFIG.email;
    }, [type]);

    const sizes = useMemo(() => {
      return SIZE_CLASSES[size] || SIZE_CLASSES.md;
    }, [size]);

    // Memoize the icon component
    const IconComponent = config.icon;

    // Memoize theme classes
    const linkPrimaryClass = useMemo(() => {
      return getThemeClasses("link-primary");
    }, [getThemeClasses]);

    // Memoize formatted value
    const formattedValue = useMemo(() => {
      if (!value || value.trim() === "") return null;
      return config.formatter(value);
    }, [value, config]);

    // Memoize href
    const href = useMemo(() => {
      if (!value || value.trim() === "") return null;
      return `${config.hrefPrefix}${value}`;
    }, [value, config.hrefPrefix]);

    // Memoize container classes
    const containerClasses = useMemo(() => {
      const classes = [
        "flex",
        "items-center",
        sizes.text,
        "justify-center",
        "xl:justify-start",
      ];

      if (className) {
        classes.push(className);
      }

      return classes.join(" ");
    }, [sizes.text, className]);

    // Memoize theme classes for icons and text
    const textSecondaryClass = useMemo(() => {
      return getThemeClasses("text-secondary");
    }, [getThemeClasses]);

    const textMutedClass = useMemo(() => {
      return getThemeClasses("text-muted");
    }, [getThemeClasses]);

    // Memoize icon classes
    const iconClasses = useMemo(() => {
      const classes = [
        sizes.icon,
        "mr-2",
        "sm:mr-3",
        textSecondaryClass || "text-gray-600 dark:text-gray-400",
        "flex-shrink-0",
      ];

      return classes.join(" ");
    }, [sizes.icon, textSecondaryClass]);

    // Memoize link classes with mobile optimizations
    const linkClasses = useMemo(() => {
      const classes = ["font-medium", "break-all", linkPrimaryClass, "touch-manipulation", "min-h-[44px]", "inline-flex", "items-center"];

      return classes.join(" ");
    }, [linkPrimaryClass]);

    // Handle missing value - render fallback
    if (!value || value.trim() === "") {
      return (
        <div className={containerClasses}>
          {showIcon && <IconComponent className={iconClasses} />}
          <div className="min-w-0 flex-1">
            <span className={textMutedClass || "text-gray-600 dark:text-gray-400"}>{fallbackText}</span>
          </div>
        </div>
      );
    }

    // Render contact link with mobile optimizations
    return (
      <div className={containerClasses}>
        {showIcon && <IconComponent className={iconClasses} />}
        <div className="min-w-0 flex-1">
          {label && <span className={`${textSecondaryClass || "text-gray-600 dark:text-gray-400"} mr-2`}>{label}:</span>}
          <a
            href={href}
            className={linkClasses}
            aria-label={`${type === "email" ? "Email" : "Call"} ${formattedValue}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {formattedValue}
          </a>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo - only re-render when these props actually change
    return (
      prevProps.type === nextProps.type &&
      prevProps.value === nextProps.value &&
      prevProps.label === nextProps.label &&
      prevProps.className === nextProps.className &&
      prevProps.size === nextProps.size &&
      prevProps.showIcon === nextProps.showIcon &&
      prevProps.fallbackText === nextProps.fallbackText
    );
  },
);

// Display name for debugging
ContactLink.displayName = "ContactLink";

export default ContactLink;

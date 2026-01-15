// File Path: src/components/UIX/Avatar/Avatar.jsx
// UIX Mobile Optimizations Applied
// Reusable Avatar component with theme-aware styling - Performance Optimized

import React, { useState, useMemo, useCallback, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import { UserIcon } from "@heroicons/react/24/outline";

// Size configurations moved outside to prevent recreation
const SIZE_CLASSES = {
  sm: "w-12 h-12 sm:w-16 sm:h-16",
  md: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
  lg: "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44",
  xl: "w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56",
  "2xl": "w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64",
};

// Default fallback image path
const DEFAULT_FALLBACK_SRC = "/img/placeholder.png";

// Icon size class is constant - no need to recreate
const ICON_SIZE_CLASS = "w-1/2 h-1/2";

/**
 * Avatar Component - Performance Optimized
 * Displays user profile pictures with theme-aware borders and consistent sizing
 *
 * Features:
 * - Theme-aware borders that adapt to blue/red themes
 * - Multiple size variants (sm, md, lg, xl, 2xl)
 * - Fallback to placeholder image or icon
 * - Responsive sizing for mobile and desktop
 * - Accessible alt text handling
 * - Optimized performance with comprehensive memoization
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl', '2xl'
 * @param {string} props.fallbackSrc - Fallback image URL (defaults to /img/placeholder.png)
 * @param {boolean} props.showFallbackIcon - Whether to show user icon as fallback
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.borderStyle - Border style: 'default', 'thick', 'none'
 * @param {function} props.onLoad - Callback when image loads successfully
 * @param {function} props.onError - Callback when image fails to load
 */
const Avatar = memo(
  function Avatar({
    src,
    alt = "Profile Picture",
    size = "lg",
    fallbackSrc = DEFAULT_FALLBACK_SRC,
    showFallbackIcon = false,
    className = "",
    borderStyle = "default",
    onLoad,
    onError,
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Track image loading state
    const [imageError, setImageError] = useState(false);
    const [fallbackError, setFallbackError] = useState(false);

    // Memoize theme classes to prevent multiple calls
    const themeClasses = useMemo(
      () => ({
        cardBorder: getThemeClasses("card-border"),
        bgDisabled: getThemeClasses("bg-disabled"),
        textMuted: getThemeClasses("text-muted"),
      }),
      [getThemeClasses],
    );

    // Memoize size class
    const sizeClass = useMemo(
      () => SIZE_CLASSES[size] || SIZE_CLASSES.lg,
      [size],
    );

    // Memoize border classes based on style
    const borderClass = useMemo(() => {
      switch (borderStyle) {
        case "none":
          return "";
        case "thick":
          return `border-4 ${themeClasses.cardBorder}`;
        case "default":
        default:
          return `border-2 ${themeClasses.cardBorder}`;
      }
    }, [borderStyle, themeClasses.cardBorder]);

    // Memoize the image source and alt text
    const { imageSrc, imageAlt } = useMemo(() => {
      // If main image has error, try fallback
      if (imageError && fallbackSrc && !fallbackError) {
        return {
          imageSrc: fallbackSrc,
          imageAlt: "No Profile Picture",
        };
      }

      // Use main image if available
      if (src && src !== "") {
        return {
          imageSrc: src,
          imageAlt: alt,
        };
      }

      // Use fallback by default
      return {
        imageSrc: fallbackSrc,
        imageAlt: "No Profile Picture",
      };
    }, [src, alt, fallbackSrc, imageError, fallbackError]);

    // Build all classes once
    const classes = useMemo(() => {
      const baseClasses = [
        sizeClass,
        "rounded-2xl",
        "shadow-sm",
        "mx-auto",
        "xl:mx-0",
      ];

      if (borderClass) {
        baseClasses.push(borderClass);
      }

      const base = baseClasses.join(" ");

      return {
        container: `relative inline-block ${className}`,
        image: `${base} object-cover`,
        iconContainer: `${base} ${themeClasses.bgDisabled} flex items-center justify-center ${themeClasses.textMuted}`,
      };
    }, [
      sizeClass,
      borderClass,
      className,
      themeClasses.bgDisabled,
      themeClasses.textMuted,
    ]);

    // Handle image load error with memoized callback
    const handleImageError = useCallback(
      (e) => {
        const currentSrc = e.target.src;

        // Check if this is the main image or fallback failing
        if (currentSrc === src) {
          setImageError(true);
        } else if (currentSrc === fallbackSrc) {
          setFallbackError(true);
        }

        if (onError) {
          onError(e);
        }
      },
      [src, fallbackSrc, onError],
    );

    // Handle successful image load with memoized callback
    const handleImageLoad = useCallback(
      (e) => {
        const currentSrc = e.target.src;

        // Reset error state if image loads successfully
        if (currentSrc === src) {
          setImageError(false);
        } else if (currentSrc === fallbackSrc) {
          setFallbackError(false);
        }

        if (onLoad) {
          onLoad(e);
        }
      },
      [src, fallbackSrc, onLoad],
    );

    // Determine whether to show icon fallback
    const shouldShowIcon = useMemo(
      () =>
        showFallbackIcon &&
        ((!src && !fallbackSrc) ||
          (imageError && fallbackError) ||
          (imageError && !fallbackSrc)),
      [showFallbackIcon, src, fallbackSrc, imageError, fallbackError],
    );

    // Render icon fallback if needed
    if (shouldShowIcon) {
      return (
        <div className={classes.container}>
          <div
            className={classes.iconContainer}
            role="img"
            aria-label={imageAlt}
          >
            <UserIcon className={ICON_SIZE_CLASS} />
          </div>
        </div>
      );
    }

    // Render image
    return (
      <div className={classes.container}>
        <img
          src={imageSrc}
          alt={imageAlt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={classes.image}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo - only re-render when these props actually change
    return (
      prevProps.src === nextProps.src &&
      prevProps.alt === nextProps.alt &&
      prevProps.size === nextProps.size &&
      prevProps.fallbackSrc === nextProps.fallbackSrc &&
      prevProps.showFallbackIcon === nextProps.showFallbackIcon &&
      prevProps.className === nextProps.className &&
      prevProps.borderStyle === nextProps.borderStyle &&
      prevProps.onLoad === nextProps.onLoad &&
      prevProps.onError === nextProps.onError
    );
  },
);

// Set display name for debugging
Avatar.displayName = "Avatar";

export default Avatar;

// Export for reuse in other components
export { Avatar };

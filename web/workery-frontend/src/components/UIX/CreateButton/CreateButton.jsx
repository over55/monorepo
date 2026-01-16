// File Path: web/frontend/src/components/UIX/CreateButton/CreateButton.jsx
// UIX Mobile Optimizations Applied
// CreateButton Component - Performance Optimized

import React, { memo, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * CreateButton Component - Performance Optimized
 * Green-themed button specifically for creation actions
 *
 * @param {React.ReactNode} children - Button text content
 * @param {Function} onClick - Click handler function
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text to show when loading
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {string} size - Button size (sm, md, lg, xl)
 * @param {React.ComponentType} icon - Icon component (defaults to PlusIcon)
 * @param {boolean} gradient - Whether to use gradient background
 */

// Static size classes - moved outside to prevent recreation with mobile optimizations
const SIZE_CLASSES = Object.freeze({
  sm: "px-3 py-2 min-h-[44px] text-xs sm:text-sm",
  md: "px-4 py-3 min-h-[44px] text-sm sm:text-base",
  lg: "px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] text-sm sm:text-base",
  xl: "px-8 py-4 min-h-[52px] text-base sm:text-lg",
});

// Loading Spinner Component - Separated for better performance
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

const CreateButton = memo(
  function CreateButton({
    children,
    onClick,
    disabled = false,
    type = "button",
    className = "",
    loading = false,
    loadingText,
    fullWidth = false,
    size = "lg",
    icon: Icon = PlusIcon,
    gradient = false,
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Computed disabled state
    const isDisabled = disabled || loading;

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        buttonCreate: getThemeClasses("button-create"),
        inputFocusRing: getThemeClasses("input-focus-ring"),
        bgGradientSecondary: getThemeClasses("bg-gradient-secondary"),
      }),
      [getThemeClasses],
    );

    // Memoize gradient style - uses Tailwind green palette (green-600, green-500)
    const gradientStyle = useMemo(() => {
      if (!gradient) return {};

      return {
        background:
          themeClasses.bgGradientSecondary ||
          "linear-gradient(to right, rgb(5 150 105), rgb(16 185 129))",
      };
    }, [gradient, themeClasses.bgGradientSecondary]);

    // Memoize button classes with mobile optimizations
    const buttonClasses = useMemo(() => {
      const classes = [
        SIZE_CLASSES[size] || SIZE_CLASSES.lg,
        "font-medium",
        "rounded-xl",
        "focus:outline-none",
        "transition-all",
        "duration-200",
        "inline-flex",
        "items-center",
        "justify-center",
        "touch-manipulation",
        "select-none",
      ];

      if (fullWidth) {
        classes.push("w-full");
      }

      // Variant classes
      if (gradient) {
        classes.push(
          "border-transparent",
          "text-white",
          "shadow-lg",
          "hover:shadow-xl",
          themeClasses.inputFocusRing,
          "transform",
          "hover:scale-105",
          "font-bold",
        );
      } else {
        classes.push(themeClasses.buttonCreate);
      }

      // State classes
      if (isDisabled) {
        classes.push("opacity-50", "cursor-not-allowed");
      } else {
        classes.push("cursor-pointer");
      }

      // Custom className
      if (className) {
        classes.push(className);
      }

      return classes.filter(Boolean).join(" ");
    }, [size, fullWidth, gradient, themeClasses, isDisabled, className]);

    // Memoize button content
    const ButtonContent = useMemo(() => {
      if (loading) {
        return (
          <>
            <LoadingSpinner />
            {loadingText || "Creating..."}
          </>
        );
      }

      return (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      );
    }, [loading, loadingText, Icon, children]);

    return (
      <button
        type={type}
        className={buttonClasses}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        style={{ ...gradientStyle, WebkitTapHighlightColor: 'transparent' }}
      >
        {ButtonContent}
      </button>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.children === nextProps.children &&
      prevProps.onClick === nextProps.onClick &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.type === nextProps.type &&
      prevProps.className === nextProps.className &&
      prevProps.loading === nextProps.loading &&
      prevProps.loadingText === nextProps.loadingText &&
      prevProps.fullWidth === nextProps.fullWidth &&
      prevProps.size === nextProps.size &&
      prevProps.icon === nextProps.icon &&
      prevProps.gradient === nextProps.gradient
    );
  },
);

// Display name for debugging
CreateButton.displayName = "CreateButton";

export default CreateButton;

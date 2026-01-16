// File Path: web/frontend/src/components/UIX/CreateFirstButton/CreateFirstButton.jsx
// UIX Mobile Optimizations Applied
// CreateFirstButton Component - Performance Optimized

import React, { memo, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * CreateFirstButton Component - Performance Optimized
 * Green-themed button specifically for "Create First" actions in empty states
 * Larger and more prominent than regular create buttons
 *
 * @param {React.ReactNode} children - Button text content
 * @param {Function} onClick - Click handler function
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text to show when loading
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {React.ComponentType} icon - Icon component (defaults to PlusIcon)
 * @param {boolean} gradient - Whether to use gradient background (default: true)
 */

// Static size classes for large button with mobile optimizations
const SIZE_CLASSES = "px-8 py-4 min-h-[52px] text-base sm:text-lg";

// Gradient styles - static since they don't change
// Uses Tailwind green palette: green-600 (5 150 105), green-500 (16 185 129), green-700 (4 120 87)
const GRADIENT_STYLES = Object.freeze({
  default: "linear-gradient(135deg, rgb(5 150 105) 0%, rgb(16 185 129) 100%)",
  hover: "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(5 150 105) 100%)",
});

// Loading Spinner Component - Separated for better performance
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
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

const CreateFirstButton = memo(
  function CreateFirstButton({
    children,
    onClick,
    disabled = false,
    type = "button",
    className = "",
    loading = false,
    loadingText,
    fullWidth = false,
    icon: Icon = PlusIcon,
    gradient = true,
  }) {
    // Computed disabled state
    const isDisabled = disabled || loading;

    // Memoize button classes with mobile optimizations
    const buttonClasses = useMemo(() => {
      const classes = [
        SIZE_CLASSES,
        "font-bold",
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

      // Variant classes based on gradient
      if (gradient) {
        classes.push(
          "border-transparent",
          "text-white",
          "shadow-lg",
          "hover:shadow-xl",
          "focus:ring-4",
          "focus:ring-green-500/20",
          "transform",
          "hover:scale-105",
          // Use CSS classes for hover effect instead of inline styles
          "hover:brightness-95",
        );
      } else {
        classes.push(
          "bg-green-600",
          "text-white",
          "hover:bg-green-700",
          "focus:ring-4",
          "focus:ring-green-500/20",
          "border",
          "border-transparent",
          "shadow-sm",
          "hover:shadow-md",
        );
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
    }, [fullWidth, gradient, isDisabled, className]);

    // Memoize gradient style
    const gradientStyle = useMemo(() => {
      if (!gradient) return {};

      return {
        background: GRADIENT_STYLES.default,
      };
    }, [gradient]);

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
          {Icon && <Icon className="w-5 h-5 mr-2" />}
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
      prevProps.icon === nextProps.icon &&
      prevProps.gradient === nextProps.gradient
    );
  },
);

// Display name for debugging
CreateFirstButton.displayName = "CreateFirstButton";

export default CreateFirstButton;

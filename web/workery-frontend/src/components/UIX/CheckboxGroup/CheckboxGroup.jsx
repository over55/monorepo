// File: src/components/UIX/CheckboxGroup/CheckboxGroup.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * CheckboxGroup Component - Performance Optimized
 * Group of checkbox options with consistent styling
 */
const CheckboxGroup = memo(
  ({
    label,
    description,
    required = false,
    error,
    options = [],
    value = [],  // Supports both array [] and object {} formats
    onChange,
    disabled = false,
    className = "",
    size = "md",
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Theme classes for consistent styling
    const themeClasses = useMemo(() => ({
      textLabel: getThemeClasses("text-label") || "text-gray-700 dark:text-gray-300",
      textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
      textMuted: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
      textDanger: getThemeClasses("text-danger") || "text-red-600 dark:text-red-400",
      textRequired: getThemeClasses("text-required") || "text-red-500 dark:text-red-400",
      textAccent: getThemeClasses("text-accent") || "text-red-500 dark:text-red-400",
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      bgChecked: getThemeClasses("bg-checked") || "bg-red-50 dark:bg-red-900/20",
      bgCheckbox: getThemeClasses("bg-checkbox") || "bg-gray-100 dark:bg-gray-700",
      borderLight: getThemeClasses("border-light") || "border-gray-200 dark:border-gray-700",
      borderMedium: getThemeClasses("border-medium") || "border-gray-300 dark:border-gray-600",
      borderChecked: getThemeClasses("border-checked") || "border-red-500 dark:border-red-400",
      hoverBorder: getThemeClasses("hover-border") || "hover:border-gray-300 dark:hover:border-gray-500",
      hoverShadow: getThemeClasses("hover-shadow") || "hover:shadow-sm",
      checkboxColor: getThemeClasses("checkbox-color") || "text-red-600 dark:text-red-400",
      checkboxFocus: getThemeClasses("checkbox-focus") || "focus:ring-red-500 dark:focus:ring-red-400",
    }), [getThemeClasses]);
    // Memoize size classes with mobile-friendly touch targets (increased sizes)
    const sizeClasses = useMemo(
      () => ({
        label: {
          sm: "text-sm",
          md: "text-base sm:text-lg",
          lg: "text-lg sm:text-xl",
        }[size],
        checkbox: {
          sm: "w-5 h-5",  // Increased from w-4 h-4 for better touch target
          md: "w-6 h-6",  // Increased from w-5 h-5 for better touch target
          lg: "w-7 h-7",  // Increased from w-6 h-6 for better touch target
        }[size],
        padding: {
          sm: "p-3",
          md: "p-4",
          lg: "p-5",
        }[size],
        text: {
          sm: "text-sm",
          md: "text-base",
          lg: "text-base",
        }[size],
        description: {
          sm: "text-xs",
          md: "text-sm",
          lg: "text-sm",
        }[size],
      }),
      [size],
    );

    // Detect if value is an array (for array-based value format) or object
    const isArrayValue = Array.isArray(value);

    // Helper to check if an option is selected (supports both array and object formats)
    const isOptionChecked = useCallback(
      (optionKey) => {
        if (isArrayValue) {
          return value.includes(optionKey) || value.includes(String(optionKey));
        }
        return !!value[optionKey];
      },
      [value, isArrayValue],
    );

    // Memoize the change handler (supports both array and object formats)
    const handleChange = useCallback(
      (optionKey) => {
        if (disabled || !onChange) return;

        if (isArrayValue) {
          // Array format: add/remove from array
          const isCurrentlyChecked = value.includes(optionKey) || value.includes(String(optionKey));
          if (isCurrentlyChecked) {
            onChange(value.filter(v => v !== optionKey && v !== String(optionKey)));
          } else {
            onChange([...value, optionKey]);
          }
        } else {
          // Object format: toggle boolean
          const newValue = {
            ...value,
            [optionKey]: !value[optionKey],
          };
          onChange(newValue);
        }
      },
      [disabled, onChange, value, isArrayValue],
    );

    // Memoize label classes
    const labelClasses = useMemo(() => {
      return `block ${sizeClasses.label} font-semibold ${themeClasses.textLabel} mb-3 flex items-center`;
    }, [sizeClasses.label, themeClasses.textLabel]);

    // Memoize checkbox input classes with mobile optimizations
    const checkboxInputClasses = useMemo(() => {
      return `mt-1 ${sizeClasses.checkbox} ${themeClasses.checkboxColor} ${themeClasses.bgCheckbox} ${themeClasses.borderMedium} rounded ${themeClasses.checkboxFocus} transition-colors duration-200 touch-manipulation cursor-pointer`;
    }, [sizeClasses.checkbox, themeClasses]);

    // Memoize the error icon component
    const ErrorIcon = useMemo(() => {
      if (!error) return null;

      return (
        <p className={`mb-3 text-sm ${themeClasses.textDanger} flex items-center`}>
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          {error}
        </p>
      );
    }, [error, themeClasses.textDanger]);

    // Memoize the label component
    const LabelComponent = useMemo(() => {
      if (!label) return null;

      return (
        <label className={labelClasses}>
          {label}
          {required && <span className={`${themeClasses.textRequired} ml-1`}>*</span>}
        </label>
      );
    }, [label, required, labelClasses, themeClasses.textRequired]);

    // Memoize the description component
    const DescriptionComponent = useMemo(() => {
      if (!description) return null;

      return <p className={`text-sm ${themeClasses.textMuted} mb-4`}>{description}</p>;
    }, [description, themeClasses.textMuted]);

    // Memoize option rendering function
    const renderOption = useCallback(
      (option) => {
        // Support both 'key' and 'value' properties for option identifier
        const optionKey = option.key !== undefined ? option.key : option.value;
        const isChecked = isOptionChecked(optionKey);

        // Build container classes with mobile optimizations
        const containerClasses = [
          "flex",
          "items-start",
          sizeClasses.padding,
          "rounded-xl",
          "border-2",
          "cursor-pointer",
          "transition-all",
          "duration-200",
          "min-h-[44px]",  // Mobile: ensure touch target height
          "touch-manipulation",  // Mobile: prevent double-tap zoom
          "select-none",  // Mobile: prevent text selection
        ];

        if (isChecked) {
          containerClasses.push(themeClasses.bgChecked, themeClasses.borderChecked, "shadow-md");
        } else {
          containerClasses.push(
            themeClasses.bgCard,
            themeClasses.borderLight,
            themeClasses.hoverBorder,
            themeClasses.hoverShadow,
          );
        }

        if (disabled) {
          containerClasses.push("opacity-50", "cursor-not-allowed");
        }

        return (
          <label key={optionKey} className={containerClasses.join(" ")} style={{ WebkitTapHighlightColor: 'transparent' }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleChange(optionKey)}
              disabled={disabled}
              className={checkboxInputClasses}
              aria-checked={isChecked}
              aria-disabled={disabled}
              aria-describedby={
                option.description ? `${optionKey}-description` : undefined
              }
            />
            <div className="ml-4">
              <div className="flex items-center">
                {option.icon && (
                  <option.icon
                    className={`${sizeClasses.checkbox} mr-2 ${themeClasses.textAccent}`}
                  />
                )}
                <span
                  className={`${sizeClasses.text} font-medium ${themeClasses.textPrimary}`}
                >
                  {option.label}
                </span>
              </div>
              {option.description && (
                <p
                  id={`${optionKey}-description`}
                  className={`${sizeClasses.description} ${themeClasses.textMuted} mt-1`}
                >
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      },
      [isOptionChecked, handleChange, disabled, sizeClasses, checkboxInputClasses, themeClasses],
    );

    // Memoize the options list
    const OptionsList = useMemo(() => {
      if (!options || options.length === 0) {
        return null;
      }

      return <div className="space-y-4">{options.map(renderOption)}</div>;
    }, [options, renderOption]);

    return (
      <div className={className}>
        {LabelComponent}
        {DescriptionComponent}
        {ErrorIcon}
        {OptionsList}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    // Only re-render when these specific props change
    if (
      prevProps.label !== nextProps.label ||
      prevProps.description !== nextProps.description ||
      prevProps.required !== nextProps.required ||
      prevProps.error !== nextProps.error ||
      prevProps.disabled !== nextProps.disabled ||
      prevProps.className !== nextProps.className ||
      prevProps.size !== nextProps.size ||
      prevProps.onChange !== nextProps.onChange ||
      prevProps.options !== nextProps.options ||
      prevProps.options?.length !== nextProps.options?.length
    ) {
      return false;
    }

    // Deep comparison for value (supports both array and object)
    const prevValue = prevProps.value;
    const nextValue = nextProps.value;

    if (prevValue === nextValue) return true;

    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) return false;
      return prevValue.every((v, i) => v === nextValue[i]);
    }

    return false;
  },
);

// Display name for debugging
CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;

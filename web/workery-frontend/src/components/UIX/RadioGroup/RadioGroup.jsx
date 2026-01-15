// File: src/components/UIX/RadioGroup/RadioGroup.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static constant outside component to prevent recreation
const DEFAULT_LAYOUT = "vertical";

/**
 * RadioGroup Component - Performance Optimized
 * Grouped radio buttons with consistent styling and theming
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static constant moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Memoized sections (label, error, options, helper text)
 * - Prevented unnecessary re-renders
 *
 * @param {string} id - Base identifier for generating unique IDs for radio inputs
 * @param {string} label - Group label
 * @param {Array} options - Array of options: [{ value, label, description? }]
 * @param {string} name - Radio group name
 * @param {string|number} value - Selected value
 * @param {function} onChange - Change handler (receives the value)
 * @param {string} error - Error message
 * @param {boolean} required - Whether selection is required
 * @param {boolean} disabled - Whether group is disabled
 * @param {string} layout - Layout: "vertical" | "horizontal"
 * @param {string} className - Additional CSS classes
 * @param {string} helperText - Helper text below the group
 */
const RadioGroup = memo(function RadioGroup({
  id,
  label,
  options = [],
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  layout = DEFAULT_LAYOUT,
  className = "",
  helperText,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textDanger: getThemeClasses("text-danger"),
      textMuted: getThemeClasses("text-muted"),
      inputBorder: getThemeClasses("input-border"),
      inputBorderFocus: getThemeClasses("input-border-focus"),
      inputBorderError: getThemeClasses("input-border-error"),
      bgPrimaryLight: getThemeClasses("bg-primary-light"),
      buttonPrimary: getThemeClasses("button-primary"),
      inputFocusRing: getThemeClasses("input-focus-ring"),
      bgHover: getThemeClasses("bg-hover") || "hover:bg-gray-50",
      borderHover: getThemeClasses("border-hover") || "hover:border-blue-300",
    }),
    [getThemeClasses],
  );

  // Memoize change handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (selectedValue) => {
      if (!disabled && onChange) {
        onChange(selectedValue);
      }
    },
    [disabled, onChange],
  );

  // Memoize label className
  const labelClassName = useMemo(() => {
    return `block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`;
  }, [themeClasses.textPrimary]);

  // Memoize options container className
  const optionsContainerClassName = useMemo(() => {
    return layout === "horizontal"
      ? "space-y-3 sm:flex sm:space-y-0 sm:space-x-6"
      : "space-y-3";
  }, [layout]);

  // Memoize input className with mobile optimizations (increased size for touch targets)
  const inputClassName = useMemo(() => {
    const classes = [
      "h-5",  // Increased from h-4 for better touch target
      "w-5",  // Increased from w-4 for better touch target
      "mt-0.5",
      "flex-shrink-0",
      themeClasses.buttonPrimary,
      "focus:ring-2",
      themeClasses.inputFocusRing,
      "touch-manipulation",  // Mobile: prevent double-tap zoom
    ];

    if (disabled) {
      classes.push("cursor-not-allowed");
    } else {
      classes.push("cursor-pointer");
    }

    return classes.join(" ");
  }, [disabled, themeClasses.buttonPrimary, themeClasses.inputFocusRing]);

  // Memoize label section
  const labelSection = useMemo(() => {
    if (!label) return null;

    return (
      <label className={labelClassName}>
        {label}
        {required && <span className={`ml-1 ${themeClasses.textDanger}`}>*</span>}
      </label>
    );
  }, [label, required, labelClassName, themeClasses.textDanger]);

  // Memoize error section
  const errorSection = useMemo(() => {
    if (!error) return null;

    return (
      <div className={`text-sm ${themeClasses.textDanger} mb-3 flex items-center animate-fade-in`}>
        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
        {error}
      </div>
    );
  }, [error, themeClasses.textDanger]);

  // Memoize helper text section
  const helperTextSection = useMemo(() => {
    if (!helperText || error) return null;

    return (
      <p className={`mt-2 text-sm ${themeClasses.textMuted}`}>
        {helperText}
      </p>
    );
  }, [helperText, error, themeClasses.textMuted]);

  // Create memoized click handler factory
  const createChangeHandler = useCallback(
    (optionValue) => {
      return () => handleChange(optionValue);
    },
    [handleChange],
  );

  // Memoize option label className generator with mobile optimizations
  const getOptionLabelClassName = useCallback(
    (optionValue) => {
      const classes = [
        "flex",
        "items-start",
        "p-4",
        "border-2",
        "rounded-lg",
        "cursor-pointer",
        "transition-all",
        "min-h-[44px]",  // Mobile: ensure touch target height
        "touch-manipulation",  // Mobile: prevent double-tap zoom
        "select-none",  // Mobile: prevent text selection
      ];

      if (disabled) {
        classes.push("opacity-60", "cursor-not-allowed");
      } else {
        classes.push(themeClasses.bgHover, themeClasses.borderHover);
      }

      if (value === optionValue) {
        classes.push(themeClasses.inputBorderFocus, themeClasses.bgPrimaryLight);
      } else if (error) {
        classes.push(themeClasses.inputBorderError);
      } else {
        classes.push(themeClasses.inputBorder);
      }

      return classes.join(" ");
    },
    [disabled, value, error, themeClasses],
  );

  // Memoize options rendering
  const optionsList = useMemo(() => {
    return options.map((option, index) => {
      const radioId = id ? `${id}-option-${index}` : `radio-${name}-${option.value}`;

      return (
        <label
          key={option.value}
          htmlFor={radioId}
          className={getOptionLabelClassName(option.value)}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <input
            id={radioId}
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={createChangeHandler(option.value)}
            disabled={disabled}
            className={inputClassName}
          />
          <div className="ml-3 flex-1">
            <span className={`block text-sm sm:text-base font-medium ${themeClasses.textPrimary}`}>
              {option.label}
            </span>
            {option.description && (
              <span className={`block text-sm ${themeClasses.textMuted} mt-1`}>
                {option.description}
              </span>
            )}
          </div>
        </label>
      );
    });
  }, [
    options,
    id,
    name,
    value,
    disabled,
    inputClassName,
    themeClasses.textPrimary,
    themeClasses.textMuted,
    getOptionLabelClassName,
    createChangeHandler,
  ]);

  return (
    <div className={className}>
      {labelSection}
      {errorSection}
      <div className={optionsContainerClassName}>
        {optionsList}
      </div>
      {helperTextSection}
    </div>
  );
});

// Set display name for React DevTools
RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
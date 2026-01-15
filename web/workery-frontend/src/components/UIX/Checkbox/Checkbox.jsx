// File: src/components/UIX/Checkbox/Checkbox.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo, useId } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Checkbox Component - Performance Optimized
 * Binary choice input element
 *
 * @param {string} id - Unique identifier for the checkbox element
 * @param {string} label - Checkbox label text
 * @param {boolean} checked - Whether checkbox is checked
 * @param {function} onChange - Change handler (receives the checked boolean directly, NOT the event)
 * @param {boolean} disabled - Whether checkbox is disabled
 * @param {string} className - Additional CSS classes
 *
 * IMPORTANT: The onChange prop receives the checked boolean directly, NOT the event object.
 * Correct usage: onChange={(checked) => setIsChecked(checked)}
 * Incorrect usage: onChange={(e) => setIsChecked(e.target.checked)} // This will cause errors!
 */
const Checkbox = memo(
  ({ id, name, label, checked, onChange, disabled = false, className = "" }) => {
    const { getThemeClasses } = useUIXTheme();

    // Use React's useId for stable, hydration-safe unique IDs
    const reactId = useId();

    // Generate a unique id for the checkbox field - use provided id, name, or React's stable useId
    const checkboxId = useMemo(() => {
      return id || name || `checkbox${reactId}`;
    }, [id, name, reactId]);

    // Memoize the change handler to prevent recreation on every render
    const handleChange = useCallback(
      (e) => {
        if (onChange) {
          onChange(e.target.checked);
        }
      },
      [onChange],
    );

    // Memoize theme classes to prevent recalculation on every render
    const themeClasses = useMemo(
      () => ({
        inputBorder: getThemeClasses("input-border"),
        inputFocusRing: getThemeClasses("input-focus-ring"),
        buttonPrimary: getThemeClasses("button-primary"),
        textPrimary: getThemeClasses("text-primary"),
      }),
      [getThemeClasses],
    );

    // Memoize container classes with mobile optimizations
    const containerClasses = useMemo(() => {
      // Mobile-friendly: min-h-[44px] for touch target, touch-manipulation prevents double-tap zoom
      const classes = ["flex", "items-center", "cursor-pointer", "min-h-[44px]", "touch-manipulation", "select-none"];

      if (disabled) {
        classes.push("opacity-60", "cursor-not-allowed");
      }

      if (className) {
        classes.push(className);
      }

      return classes.join(" ");
    }, [disabled, className]);

    // Memoize input classes with mobile-friendly sizing (larger touch target)
    const inputClasses = useMemo(() => {
      return [
        "w-5",  // Increased from w-4 for better touch target
        "h-5",  // Increased from h-4 for better touch target
        themeClasses.inputBorder,
        "rounded",
        "focus:ring-2",
        themeClasses.inputFocusRing,
        themeClasses.buttonPrimary,
        "touch-manipulation",
      ]
        .filter(Boolean)
        .join(" ");
    }, [themeClasses]);

    // Memoize label classes
    const labelClasses = useMemo(() => {
      return `ml-2 text-sm ${themeClasses.textPrimary}`;
    }, [themeClasses.textPrimary]);

    return (
      <label
        htmlFor={checkboxId}
        className={containerClasses}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <input
          id={checkboxId}
          name={name || checkboxId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-checked={checked}
          aria-disabled={disabled}
        />
        {label && <span className={labelClasses}>{label}</span>}
      </label>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo - only re-render when these props actually change
    return (
      prevProps.id === nextProps.id &&
      prevProps.label === nextProps.label &&
      prevProps.checked === nextProps.checked &&
      prevProps.onChange === nextProps.onChange &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.className === nextProps.className
    );
  },
);

// Display name for debugging
Checkbox.displayName = "Checkbox";

// Export alias for backward compatibility
export const CheckBox = Checkbox;

export default Checkbox;

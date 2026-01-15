// File: src/components/UIX/Radio/Radio.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Radio Component - Performance Optimized
 * Single choice from multiple options
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Memoized label section
 * - Prevented unnecessary re-renders
 *
 * @param {string} label - Radio label text
 * @param {string} name - Radio group name
 * @param {string} value - Radio value
 * @param {boolean} checked - Whether radio is checked
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Whether radio is disabled
 * @param {string} size - Size of radio button: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} helperText - Helper text displayed below the label
 * @param {string} className - Additional CSS classes
 */
const Radio = memo(function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  helperText,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      inputBorder: getThemeClasses('input-border'),
      inputFocusRing: getThemeClasses('input-focus-ring'),
      buttonPrimary: getThemeClasses('button-primary'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
    }),
    [getThemeClasses],
  );

  // Size mappings with mobile-friendly sizes (increased for touch targets)
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return { radio: 'w-5 h-5', label: 'text-sm', helper: 'text-xs' };  // Increased from w-4 h-4
      case 'lg':
        return { radio: 'w-7 h-7', label: 'text-lg', helper: 'text-base' };  // Increased from w-6 h-6
      case 'md':
      default:
        return { radio: 'w-6 h-6', label: 'text-base', helper: 'text-sm' };  // Increased from w-5 h-5
    }
  }, [size]);

  // Memoize wrapper className with mobile optimizations
  const wrapperClassName = useMemo(() => {
    // Mobile-friendly: min-h-[44px] for touch target, touch-manipulation prevents double-tap zoom
    const classes = ['flex', 'items-start', 'min-h-[44px]', 'py-2', 'touch-manipulation', 'select-none'];

    if (disabled) {
      classes.push('opacity-60', 'cursor-not-allowed');
    } else {
      classes.push('cursor-pointer');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }, [disabled, className]);

  // Memoize input className with mobile optimizations
  const inputClassName = useMemo(() => {
    return `${sizeClasses.radio} mt-0.5 ${themeClasses.inputBorder} focus:ring-2 ${themeClasses.inputFocusRing} ${themeClasses.buttonPrimary} touch-manipulation`;
  }, [sizeClasses.radio, themeClasses]);

  // Memoize label content section
  const labelContent = useMemo(() => {
    if (!label && !helperText) return null;

    return (
      <div className="ml-3 flex-1">
        {label && (
          <span className={`block font-medium ${sizeClasses.label} ${themeClasses.textPrimary}`}>
            {label}
          </span>
        )}
        {helperText && (
          <span className={`block mt-1 ${sizeClasses.helper} ${themeClasses.textSecondary}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }, [label, helperText, sizeClasses, themeClasses]);

  return (
    <label className={wrapperClassName} style={{ WebkitTapHighlightColor: 'transparent' }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={inputClassName}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      />
      {labelContent}
    </label>
  );
});

// Set display name for React DevTools
Radio.displayName = 'Radio';

// Export alias for backward compatibility
export const RadioButton = Radio;

export default Radio;

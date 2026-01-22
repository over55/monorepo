// File: src/components/UIX/Textarea/Textarea.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_ROWS = 4;

/**
 * Textarea Component - Performance Optimized
 * Multi-line text input field
 *
 * Performance optimizations:
 * - Component memoization with React.memo and custom comparison
 * - Static default value moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings
 * - Memoized event handler with useCallback
 * - Memoized textareaId generation
 * - Prevented unnecessary re-renders
 *
 * @param {boolean} showCharacterCount - Show character counter (requires maxLength)
 * @param {number} characterWarningThreshold - Percentage of maxLength to show warning color (default: 80)
 */
const Textarea = memo(function Textarea({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = DEFAULT_ROWS,
  maxLength,
  helperText,
  showCharacterCount = false,
  characterWarningThreshold = 80,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textDanger: getThemeClasses("text-danger"),
      textMuted: getThemeClasses("text-muted"),
      textWarning: getThemeClasses("text-warning") || "text-amber-600 dark:text-amber-400",
      inputFocusRing: getThemeClasses("input-focus-ring"),
      inputBorder: getThemeClasses("input-border"),
      inputBorderError: getThemeClasses("input-border-error"),
      bgDisabled: getThemeClasses("bg-disabled"),
      bgCard: getThemeClasses("bg-card") || "bg-white",
      placeholderColor: getThemeClasses("placeholder-color") || "placeholder-gray-500",
    }),
    [getThemeClasses],
  );

  // Character count calculations (computed on each render, but doesn't cause parent re-renders)
  const currentLength = value ? value.length : 0;
  const isNearLimit = maxLength && currentLength > (maxLength * characterWarningThreshold) / 100;

  // Generate a stable unique ID if none provided - use useRef for guaranteed stability
  // (useMemo can discard values for optimization, causing focus loss with Math.random())
  const generatedIdRef = useRef(`textarea-${Math.random().toString(36).substr(2, 9)}`);
  const textareaId = id || generatedIdRef.current;

  // Memoize event handler
  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // Memoize className strings
  const labelClassName = useMemo(() => {
    return `block text-lg sm:text-xl font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`;
  }, [themeClasses.textPrimary]);

  const requiredClassName = useMemo(() => {
    return `ml-1 ${themeClasses.textDanger}`;
  }, [themeClasses.textDanger]);

  // Textarea className with mobile optimizations
  const textareaClassName = useMemo(() => {
    const borderClass = error
      ? themeClasses.inputBorderError
      : themeClasses.inputBorder;
    const bgClass = disabled
      ? `${themeClasses.bgDisabled} cursor-not-allowed opacity-60`
      : themeClasses.bgCard;

    // Mobile optimizations: text-base ensures 16px font (prevents iOS zoom), touch-manipulation prevents double-tap zoom, min-h-[44px] for touch target
    return `w-full px-5 py-4 text-lg sm:text-xl border-2 rounded-xl shadow-sm transition-all duration-200 ${themeClasses.placeholderColor} focus:outline-none ${themeClasses.inputFocusRing} resize-y ${borderClass} ${bgClass} touch-manipulation min-h-[44px]`;
  }, [error, disabled, themeClasses]);

  const helperTextClassName = useMemo(() => {
    return `mt-3 text-base sm:text-lg ${themeClasses.textMuted}`;
  }, [themeClasses.textMuted]);

  const errorClassName = useMemo(() => {
    return `mt-3 text-base sm:text-lg ${themeClasses.textDanger} flex items-center animate-fade-in`;
  }, [themeClasses.textDanger]);

  const errorIconClassName = useMemo(() => {
    return `h-5 w-5 mr-1.5 ${themeClasses.textDanger}`;
  }, [themeClasses.textDanger]);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className={labelClassName}>
          {label}
          {required && <span className={requiredClassName}>*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={textareaClassName}
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitAppearance: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      />
      {/* Character count - rendered inside component to avoid parent re-renders */}
      {showCharacterCount && maxLength && (
        <div className="mt-2 text-right">
          <span
            className={`text-base sm:text-lg ${isNearLimit ? themeClasses.textWarning : themeClasses.textMuted}`}
          >
            {currentLength}/{maxLength} characters
          </span>
        </div>
      )}
      {helperText && !error && (
        <p className={helperTextClassName}>{helperText}</p>
      )}
      {error && (
        <p className={errorClassName}>
          <ExclamationTriangleIcon className={errorIconClassName} />
          {error}
        </p>
      )}
    </div>
  );
});

// Set display name for React DevTools
Textarea.displayName = "Textarea";

// Export alias for backward compatibility
export const TextArea = Textarea;

export default Textarea;

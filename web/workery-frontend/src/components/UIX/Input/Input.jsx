// File: src/components/UIX/Input/Input.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Input Component - Performance Optimized
 * Text input field with label, validation, and icon support
 *
 * Performance optimizations:
 * - Component memoization with React.memo and custom comparison
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized event handler with useCallback
 * - Memoized inputId generation
 *
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler (receives the input value directly, NOT the event)
 * @param {string} error - Error message
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} required - Whether input is required
 * @param {boolean} readOnly - Whether input is read-only
 * @param {React.Component} icon - Icon component to display
 * @param {string} prefix - Static text prefix to display before input (e.g., "https://")
 * @param {string} helperText - Helper text below input
 * @param {number} maxLength - Maximum character length
 * @param {boolean} showCharacterCount - Show character counter
 * @param {number} characterWarningThreshold - When to show warning color (percentage of maxLength)
 * @param {string} size - Input size (sm, md, lg)
 * @param {string} className - Additional CSS classes
 *
 * IMPORTANT: The onChange prop receives the input value directly, NOT the event object.
 * Correct usage: onChange={(value) => setMyValue(value)}
 * Incorrect usage: onChange={(e) => setMyValue(e.target.value)} // This will cause errors!
 */
const Input = memo(function Input({
  label,
  type = "text",
  placeholder,
  value = "",
  onChange,
  error,
  disabled = false,
  required = false,
  readOnly = false,
  icon: Icon,
  rightIcon,
  prefix,
  helperText,
  maxLength,
  showCharacterCount = false,
  characterWarningThreshold = 80,
  characterCountWarning,
  size = "lg",
  className = "",
  ...props
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textDanger: getThemeClasses("text-danger"),
      textMuted: getThemeClasses("text-muted"),
      textSecondary: getThemeClasses("text-secondary"),
      textWarning: getThemeClasses("text-warning") || "text-amber-600 dark:text-amber-400",
      inputFocusRing: getThemeClasses("input-focus-ring"),
      inputBorder: getThemeClasses("input-border"),
      inputBorderError: getThemeClasses("input-border-error"),
      bgDisabled: getThemeClasses("bg-disabled"),
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      placeholderColor: getThemeClasses("placeholder-color") || "placeholder-gray-500 dark:placeholder-gray-400",
    }),
    [getThemeClasses],
  );

  // Generate a unique id for the input field - memoized to prevent regeneration on every render
  const inputId = useMemo(() => {
    return (
      props.id ||
      props.name ||
      `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }, [props.id, props.name]);

  // Memoize size classes with mobile-friendly touch targets (min 44px height)
  const sizeClasses = useMemo(() => ({
    sm: "px-3 py-2.5 text-sm min-h-[44px]",
    md: "px-4 py-3 text-base min-h-[44px]",
    lg: "px-5 py-4 text-base sm:text-lg min-h-[48px]",
  }), []);

  const labelSizeClasses = useMemo(() => ({
    sm: "text-sm",
    md: "text-base",
    lg: "text-base sm:text-lg",
  }), []);

  // Memoize event handler
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  const currentLength = value ? value.length : 0;
  const warningThreshold = characterCountWarning || characterWarningThreshold;
  const isNearLimit =
    maxLength && currentLength > (maxLength * warningThreshold) / 100;

  // Memoize input className for prefix mode
  const prefixContainerClassName = useMemo(() => {
    const borderClass = error ? themeClasses.inputBorderError : themeClasses.inputBorder;
    const bgClass = disabled ? `${themeClasses.bgDisabled} cursor-not-allowed` : themeClasses.bgCard;
    return `flex items-center w-full border-2 rounded-xl shadow-sm transition-all duration-200 ${borderClass} ${bgClass} focus-within:outline-none focus-within:${themeClasses.inputFocusRing}`;
  }, [error, disabled, themeClasses]);

  // Memoize input className for regular mode with mobile optimizations
  const inputClassName = useMemo(() => {
    const borderClass = error ? themeClasses.inputBorderError : themeClasses.inputBorder;
    const bgClass = disabled ? `${themeClasses.bgDisabled} cursor-not-allowed` : themeClasses.bgCard;
    const leftPadding = Icon ? "pl-10" : "pl-5";
    const rightPadding = rightIcon ? "pr-12" : "pr-5";
    // Mobile optimizations: text-base ensures 16px font (prevents iOS zoom), touch-manipulation prevents double-tap zoom
    return `w-full ${sizeClasses[size]} ${leftPadding} ${rightPadding} border-2 rounded-xl shadow-sm transition-all duration-200 ${themeClasses.placeholderColor} focus:outline-none ${themeClasses.inputFocusRing} ${borderClass} ${bgClass} text-base touch-manipulation`;
  }, [error, disabled, size, Icon, rightIcon, themeClasses, sizeClasses]);

  // Memoize input styles - includes spinner hiding for number inputs
  // TODO: Uncomment to hide spinner arrows on number inputs globally
  // const inputStyle = useMemo(() => {
  //   const baseStyle = {
  //     WebkitTapHighlightColor: 'transparent',
  //     WebkitAppearance: 'none',
  //   };
  //
  //   // Hide spinner arrows on number inputs
  //   if (type === 'number') {
  //     return {
  //       ...baseStyle,
  //       MozAppearance: 'textfield', // Firefox
  //     };
  //   }
  //
  //   return baseStyle;
  // }, [type]);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block ${labelSizeClasses[size]} font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`}
        >
          {label}
          {required && (
            <span className={`ml-1 ${themeClasses.textDanger}`}>*</span>
          )}
        </label>
      )}
      <div className="relative">
        {prefix ? (
          // Input with prefix
          <div className={prefixContainerClassName}>
            <span className={`${sizeClasses[size]} pr-0 font-medium ${disabled ? themeClasses.textMuted : themeClasses.textSecondary} select-none whitespace-nowrap`}>
              {prefix}
            </span>
            <input
              id={inputId}
              name={props.name || inputId}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              disabled={disabled}
              required={required}
              readOnly={readOnly}
              maxLength={maxLength}
              className={`flex-1 ${sizeClasses[size]} pl-0 bg-transparent border-0 focus:outline-none focus:ring-0 ${themeClasses.placeholderColor} text-base touch-manipulation`}
              style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
              {...props}
            />
          </div>
        ) : (
          // Regular input without prefix
          <>
            {Icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 ${themeClasses.textMuted}`} />
              </div>
            )}
            <input
              id={inputId}
              name={props.name || inputId}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              disabled={disabled}
              required={required}
              readOnly={readOnly}
              maxLength={maxLength}
              className={inputClassName}
              style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
              {...props}
            />
            {rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                {rightIcon}
              </div>
            )}
          </>
        )}
      </div>

      {/* Character count */}
      {showCharacterCount && maxLength && (
        <div className="mt-1 text-right">
          <span
            className={`text-xs ${isNearLimit ? themeClasses.textWarning : themeClasses.textMuted}`}
          >
            {currentLength}/{maxLength} characters
          </span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className={`mt-1 text-xs ${themeClasses.textSecondary}`}>
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          className={`mt-1 text-sm ${themeClasses.textDanger} flex items-center animate-fade-in`}
        >
          <ExclamationTriangleIcon
            className={`h-4 w-4 mr-1 ${themeClasses.textDanger}`}
          />
          {error}
        </p>
      )}
    </div>
  );
});

// Set display name for React DevTools
Input.displayName = "Input";

export default Input;

// File: src/components/UIX/OTPInput/OTPInput.jsx
// UIX Mobile Optimizations Applied
// OTP Input Component for 6-digit verification codes
// Mobile-optimized with iOS/Android specific handling

import React, { forwardRef, useRef } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import useMobileOptimizations from "../hooks/useMobileOptimizations.jsx";

/**
 * OTPInput Component
 *
 * Specialized input field for One-Time Password (OTP) codes.
 * Optimized for 6-digit verification codes with mobile-specific enhancements.
 *
 * Features:
 * - Numeric-only input with proper keyboard on mobile
 * - Auto-complete support for SMS codes
 * - Success state when 6 digits are entered
 * - Error state with theme-aware styling
 * - Mobile-optimized with iOS/Android fixes
 * - Monospace font for better code readability
 * - Center-aligned large text
 *
 * @param {string} label - Label text for the input
 * @param {string} value - Current OTP value
 * @param {function} onChange - Change handler (receives the value directly)
 * @param {function} onKeyDown - Optional keyDown handler
 * @param {string} error - Error message to display
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the input is required
 * @param {number} maxLength - Maximum length (default: 6)
 * @param {string} placeholder - Placeholder text (default: "000000")
 * @param {string} helperText - Helper text below input
 * @param {boolean} autoFocus - Whether to auto-focus on mount
 * @param {string} className - Additional CSS classes
 *
 * @example
 * <OTPInput
 *   label="Enter Verification Code"
 *   value={token}
 *   onChange={setToken}
 *   error={errors.token}
 *   helperText="Enter the 6-digit code from your authenticator app"
 * />
 */
const OTPInput = forwardRef(
  (
    {
      label,
      value = "",
      onChange,
      onKeyDown,
      error,
      disabled = false,
      required = false,
      maxLength = 6,
      placeholder = "000000",
      helperText,
      autoFocus = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const { getThemeClasses } = useUIXTheme();
    const { isMobile, isIOS } = useMobileOptimizations();

    // Theme classes for consistent styling
    const themeClasses = {
      textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
      textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
      textDanger: getThemeClasses("text-danger") || "text-red-600 dark:text-red-400",
      textSuccess: getThemeClasses("text-success") || "text-green-600 dark:text-green-400",
      textMuted: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      bgDisabled: getThemeClasses("bg-disabled") || "bg-gray-50 dark:bg-gray-700",
      bgError: getThemeClasses("bg-error-light") || "bg-red-50 dark:bg-red-900/20",
      bgSuccess: getThemeClasses("bg-success-light") || "bg-green-50 dark:bg-green-900/20",
      borderError: getThemeClasses("border-error") || "border-red-500 dark:border-red-400",
      borderErrorFocus: getThemeClasses("border-error-focus") || "focus:border-red-600 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800",
      borderSuccess: getThemeClasses("border-success") || "border-green-500 dark:border-green-400",
      borderSuccessFocus: getThemeClasses("border-success-focus") || "focus:border-green-600 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-800",
      borderColor: getThemeClasses("border-color") || "border-gray-300 dark:border-gray-600",
      focusRing: getThemeClasses("focus-ring") || "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800",
    };

    // Determine input state
    const hasError = Boolean(error);
    const isComplete = value.length === maxLength;
    const isSuccess = isComplete && !hasError;

    // Generate stable unique ID for the input - use useRef for guaranteed stability
    // (without useRef, a new ID would be generated on every render, causing focus loss)
    const generatedIdRef = useRef(`otp-input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const inputId = props.id || props.name || generatedIdRef.current;

    // Handle change with validation
    const handleChange = (e) => {
      const newValue = e.target.value;

      // Only allow numeric values
      if (!/^\d*$/.test(newValue)) {
        return;
      }

      // Respect maxLength
      if (newValue.length > maxLength) {
        return;
      }

      // Call onChange with the value directly (not the event)
      if (onChange) {
        onChange(newValue);
      }
    };

    // Determine border color based on state
    const getBorderColor = () => {
      if (hasError) {
        return `${themeClasses.borderError} ${themeClasses.borderErrorFocus}`;
      }
      if (isSuccess) {
        return `${themeClasses.borderSuccess} ${themeClasses.borderSuccessFocus}`;
      }
      return `${themeClasses.borderColor} ${themeClasses.focusRing}`;
    };

    // Background color based on state
    const getBackgroundColor = () => {
      if (disabled) {
        return themeClasses.bgDisabled;
      }
      if (hasError) {
        return themeClasses.bgError;
      }
      if (isSuccess) {
        return themeClasses.bgSuccess;
      }
      return themeClasses.bgCard;
    };

    return (
      <div className={className}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3`}
          >
            {label}
            {required && (
              <span className={`ml-1 ${themeClasses.textDanger}`}>
                *
              </span>
            )}
          </label>
        )}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className={`
              w-full text-center text-2xl font-mono tracking-wider
              px-4 py-4 border-2 rounded-xl
              transition-all duration-200
              focus:outline-none focus:ring-2
              ${getBorderColor()}
              ${getBackgroundColor()}
              ${disabled ? "cursor-not-allowed opacity-60" : ""}
              ${isMobile ? "text-3xl" : ""}
              ${isIOS ? "ios-input-fix ios-focus-fix" : ""}
            `}
            style={{
              fontSize: isMobile ? "18px" : undefined, // Prevent iOS zoom
              WebkitAppearance: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            {...props}
          />

          {/* Character Counter */}
          {maxLength && (
            <div className="absolute right-3 bottom-3">
              <span
                className={`text-xs font-medium ${
                  isComplete
                    ? themeClasses.textSuccess
                    : hasError
                      ? themeClasses.textDanger
                      : themeClasses.textMuted
                }`}
              >
                {value.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p className={`mt-2 text-sm ${themeClasses.textSecondary}`}>
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className={`mt-2 text-sm ${themeClasses.textDanger} flex items-start`}>
            <svg
              className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Success Indicator */}
        {isSuccess && (
          <p className={`mt-2 text-sm ${themeClasses.textSuccess} flex items-center`}>
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Code complete
          </p>
        )}
      </div>
    );
  }
);

OTPInput.displayName = "OTPInput";

export default OTPInput;

// File: web/frontend/src/components/UIX/TagInput/TagInput.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_PLACEHOLDER = "Type to search and add...";
const DEFAULT_MAX_SUGGESTIONS = 5;

/**
 * TagInput Component - Performance Optimized
 * A text input that shows selected items as pill-shaped tags
 * and provides autocomplete suggestions as you type
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings
 * - Memoized event handlers with useCallback
 * - Memoized filtered suggestions computation
 * - Memoized selected options computation
 * - Memoized inputId generation
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Type directly in the input field
 * - Autocomplete suggestions appear below as you type
 * - Selected items show as removable pill-shaped tags
 * - Click suggestions to add them
 * - Backspace to remove last tag
 * - Keyboard navigation (up/down arrows, enter to select)
 */
const TagInput = memo(function TagInput({
  id,
  label,
  options = [], // Array of {value, label} objects
  value = [], // Array of selected values
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  error,
  disabled = false,
  required = false,
  helperText,
  className = "",
  maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
}) {
  const { getThemeClasses } = useUIXTheme();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses('text-primary') || 'text-gray-900 dark:text-gray-100',
      textSecondary: getThemeClasses('text-secondary') || 'text-gray-700 dark:text-gray-300',
      textDanger: getThemeClasses('text-danger') || 'text-red-600 dark:text-red-400',
      textMuted: getThemeClasses('text-muted') || 'text-gray-600 dark:text-gray-400',
      bgCard: getThemeClasses('bg-card') || 'bg-white dark:bg-gray-800',
      bgDisabled: getThemeClasses('bg-disabled') || 'bg-gray-50 dark:bg-gray-700',
      borderError: getThemeClasses('border-error') || 'border-red-500 dark:border-red-400',
      borderMedium: getThemeClasses('border-medium') || 'border-gray-300 dark:border-gray-600',
      borderLight: getThemeClasses('border-light') || 'border-gray-200 dark:border-gray-700',
      focusRing: getThemeClasses('focus-ring') || 'focus-within:ring-4 focus-within:ring-red-500/20 focus-within:border-red-500 dark:focus-within:ring-red-400/20 dark:focus-within:border-red-400',
      // Tag pills
      tagBg: getThemeClasses('tag-bg') || 'bg-red-100 dark:bg-red-900/30',
      tagText: getThemeClasses('tag-text') || 'text-red-800 dark:text-red-300',
      tagHover: getThemeClasses('tag-hover') || 'hover:bg-red-200 dark:hover:bg-red-900/50',
      // Suggestions
      suggestionSelected: getThemeClasses('suggestion-selected') || 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      suggestionHover: getThemeClasses('suggestion-hover') || 'hover:bg-gray-50 dark:hover:bg-gray-700',
      placeholderColor: getThemeClasses('placeholder-color') || 'placeholder-gray-500 dark:placeholder-gray-400',
    }),
    [getThemeClasses],
  );

  // Generate a stable unique id for the input field if none provided - use useRef for guaranteed stability
  // (useMemo can discard values for optimization, causing focus loss with Math.random())
  const generatedIdRef = useRef(`tag-input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = id || generatedIdRef.current;

  // Filter options based on input value and exclude already selected
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    return options
      .filter(option =>
        !value.includes(option.value) &&
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, maxSuggestions);
  }, [options, value, inputValue, maxSuggestions]);

  // Get selected option labels for display
  const selectedOptions = useMemo(() => {
    return options.filter(option => value.includes(option.value));
  }, [options, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.trim().length > 0);
    setSelectedSuggestionIndex(-1);
  }, []);

  // Add a tag
  const addTag = useCallback((optionValue) => {
    if (!value.includes(optionValue)) {
      onChange([...value, optionValue]);
      setInputValue("");
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      inputRef.current?.focus();
    }
  }, [value, onChange]);

  // Remove a tag
  const removeTag = useCallback((optionValue) => {
    onChange(value.filter(v => v !== optionValue));
    inputRef.current?.focus();
  }, [value, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addTag(filteredSuggestions[selectedSuggestionIndex].value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedOptions.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(selectedOptions[selectedOptions.length - 1].value);
    }
  }, [filteredSuggestions, selectedSuggestionIndex, addTag, inputValue, selectedOptions, removeTag]);

  // Memoize className strings
  const labelClassName = useMemo(() => {
    return `block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`;
  }, [themeClasses.textPrimary]);

  const requiredClassName = useMemo(() => {
    return `ml-1 ${themeClasses.textDanger}`;
  }, [themeClasses.textDanger]);

  const helperTextClassName = useMemo(() => {
    return `mt-2 text-sm ${themeClasses.textMuted}`;
  }, [themeClasses.textMuted]);

  const errorClassName = useMemo(() => {
    return `mt-2 text-sm ${themeClasses.textDanger} flex items-center animate-fade-in`;
  }, [themeClasses.textDanger]);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
          {required && <span className={requiredClassName}>*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        {/* Main Input Container */}
        <div
          className={`
            w-full px-5 py-4 text-base sm:text-lg
            border-2 rounded-xl shadow-sm
            transition-all duration-200
            ${themeClasses.bgCard}
            min-h-[58px]
            flex flex-wrap items-center gap-2
            touch-manipulation select-none
            ${error ? themeClasses.borderError : themeClasses.borderMedium}
            ${disabled ? `${themeClasses.bgDisabled} cursor-not-allowed opacity-60` : ''}
            ${themeClasses.focusRing}
          `}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Selected Tags */}
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className={`inline-flex items-center gap-1 px-3 py-1 ${themeClasses.tagBg} ${themeClasses.tagText} rounded-full text-sm font-medium`}
            >
              {option.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(option.value)}
                  className={`flex items-center justify-center min-w-[24px] min-h-[24px] rounded-full ${themeClasses.tagHover} transition-colors touch-manipulation`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {/* Input Field */}
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(true)}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            disabled={disabled}
            autoComplete="off"
            className={`flex-1 min-w-[120px] bg-transparent border-none outline-none ${themeClasses.placeholderColor} text-base sm:text-lg touch-manipulation`}
            style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
          />
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
          <div className={`absolute z-50 w-full mt-1 ${themeClasses.bgCard} border-2 ${themeClasses.borderLight} rounded-xl shadow-lg max-h-48 overflow-y-auto`}>
            {filteredSuggestions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => addTag(option.value)}
                className={`
                  px-4 py-3 min-h-[44px] cursor-pointer text-sm transition-colors touch-manipulation select-none
                  ${index === selectedSuggestionIndex
                    ? themeClasses.suggestionSelected
                    : `${themeClasses.suggestionHover} ${themeClasses.textSecondary}`
                  }
                  ${index === 0 ? 'rounded-t-xl' : ''}
                  ${index === filteredSuggestions.length - 1 ? 'rounded-b-xl' : ''}
                `}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className={helperTextClassName}>
          {helperText}
        </p>
      )}
      {error && (
        <p className={errorClassName}>
          {error}
        </p>
      )}
    </div>
  );
});

// Set display name for React DevTools
TagInput.displayName = 'TagInput';

export default TagInput;
// File: src/components/UIX/MultiSelect/MultiSelect.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static values outside component to prevent recreation
const DEFAULT_MAX_HEIGHT = "200px";
const DEFAULT_PLACEHOLDER = "Select options...";

/**
 * MultiSelect Component - Performance Optimized
 * A dropdown that allows selecting multiple options
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Proper cleanup of event listeners
 * - Memoized expensive filtering and mapping operations
 *
 * @param {string} label - Field label
 * @param {Array} options - Array of {value, label} objects
 * @param {Array} value - Array of selected values
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field indicator
 * @param {string} helperText - Helper text
 * @param {string} className - Additional CSS classes
 * @param {string} maxHeight - Maximum dropdown height
 */
const MultiSelect = memo(function MultiSelect({
  label,
  options = [],
  value = [], // Array of selected values
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  error,
  disabled = false,
  required = false,
  helperText,
  className = "",
  maxHeight = DEFAULT_MAX_HEIGHT,
}) {
  const { getThemeClasses } = useUIXTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Debug logging for Tags field (development only)
  useEffect(() => {
    if (import.meta.env.DEV && label === "Tags (Optional)") {
      console.log("MultiSelect (Tags): value prop:", value);
      console.log("MultiSelect (Tags): value type:", typeof value, "isArray:", Array.isArray(value));
      console.log("MultiSelect (Tags): options:", options);
      console.log("MultiSelect (Tags): options count:", options.length);
      if (options.length > 0) {
        console.log("MultiSelect (Tags): First option:", options[0]);
      }
    }
  }, [label, value, options]);

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textDanger: getThemeClasses("text-danger"),
      textMuted: getThemeClasses("text-muted"),
      bgCard: getThemeClasses("bg-card"),
      bgDisabled: getThemeClasses("bg-disabled"),
      borderDanger: getThemeClasses("border-danger"),
      inputBorder: getThemeClasses("input-border"),
      multiselectFocus: getThemeClasses("multiselect-focus"),
      multiselectSelectedChip: getThemeClasses("multiselect-selected-chip"),
      multiselectSelectedChipHover: getThemeClasses("multiselect-selected-chip-hover"),
      multiselectSearchFocus: getThemeClasses("multiselect-search-focus"),
      multiselectOptionSelected: getThemeClasses("multiselect-option-selected"),
      multiselectSelectedText: getThemeClasses("multiselect-selected-text"),
      multiselectOptionCheck: getThemeClasses("multiselect-option-check"),
      hoverBgDisabled: getThemeClasses("hover:bg-disabled"),
      hoverTextPrimary: getThemeClasses("hover:text-primary"),
    }),
    [getThemeClasses],
  );

  // Memoize click outside handler to prevent unnecessary re-subscriptions
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  // Close dropdown when clicking outside - proper cleanup
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Memoize expensive filtering operations
  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Memoize selected labels calculation
  const selectedLabels = useMemo(() => {
    return options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label);
  }, [options, value]);

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const toggleOption = useCallback(
    (optionValue) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    },
    [value, onChange],
  );

  const removeOption = useCallback(
    (optionValue, e) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optionValue));
    },
    [value, onChange],
  );

  const clearAll = useCallback(
    (e) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange],
  );

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className ? `mb-5 ${className}` : "mb-5";
  }, [className]);

  // Memoize label section
  const labelSection = useMemo(() => {
    if (!label) return null;

    return (
      <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}>
        {label}
        {required && <span className={`${themeClasses.textDanger} ml-1`}>*</span>}
      </label>
    );
  }, [label, required, themeClasses.textPrimary, themeClasses.textDanger]);

  // Memoize main input className with mobile optimizations
  const mainInputClassName = useMemo(() => {
    const classes = [
      "min-h-[44px]",  // Mobile: ensure touch target height (was 42px)
      "px-3",
      "py-2",
      "border",
      "rounded-lg",
      "transition-all",
      "duration-200",
      "cursor-pointer",
      "flex",
      "items-center",
      "justify-between",
      "touch-manipulation",  // Mobile: prevent double-tap zoom
      "select-none",  // Mobile: prevent text selection
    ];

    if (disabled) {
      classes.push(themeClasses.bgDisabled, "cursor-not-allowed", "opacity-60");
    } else {
      classes.push(themeClasses.bgCard);
    }

    if (error) {
      classes.push(themeClasses.borderDanger);
    } else {
      classes.push(themeClasses.inputBorder);
    }

    if (isOpen) {
      classes.push(themeClasses.multiselectFocus);
    }

    return classes.join(" ");
  }, [disabled, error, isOpen, themeClasses]);

  // Memoize search input className with mobile optimizations
  const searchInputClassName = useMemo(() => {
    // text-base ensures 16px font (prevents iOS zoom)
    return `w-full px-3 py-2 text-base border ${themeClasses.inputBorder} rounded focus:outline-none ${themeClasses.multiselectSearchFocus} touch-manipulation`;
  }, [themeClasses.inputBorder, themeClasses.multiselectSearchFocus]);

  // Memoize dropdown container className
  const dropdownClassName = useMemo(() => {
    return `absolute z-50 w-full mt-1 ${themeClasses.bgCard} border ${themeClasses.inputBorder} rounded-lg shadow-lg`;
  }, [themeClasses.bgCard, themeClasses.inputBorder]);

  // Memoize search border className
  const searchBorderClassName = useMemo(() => {
    return `p-2 border-b ${themeClasses.inputBorder}`;
  }, [themeClasses.inputBorder]);

  return (
    <div className={containerClassName}>
      {labelSection}

      <div className="relative" ref={dropdownRef}>
        {/* Main Input/Display Area */}
        <div onClick={toggleDropdown} className={mainInputClassName} style={{ WebkitTapHighlightColor: 'transparent' }}>
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => {
                const option = options.find((o) => o.label === label);
                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${themeClasses.multiselectSelectedChip}`}
                  >
                    {label}
                    {!disabled && (
                      <button
                        onClick={(e) => removeOption(option.value, e)}
                        className={`ml-1 min-w-[24px] min-h-[24px] flex items-center justify-center touch-manipulation ${themeClasses.multiselectSelectedChipHover}`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        type="button"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })
            ) : (
              <span className={themeClasses.textMuted}>{placeholder}</span>
            )}
          </div>

          <div className="flex items-center ml-2">
            {selectedLabels.length > 0 && !disabled && (
              <button
                onClick={clearAll}
                className={`mr-2 min-w-[32px] min-h-[32px] flex items-center justify-center touch-manipulation ${themeClasses.textMuted} ${themeClasses.hoverTextPrimary}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                type="button"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 ${themeClasses.textMuted} transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className={dropdownClassName}>
            {/* Search Input */}
            <div className={searchBorderClassName}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={searchInputClassName}
                onClick={stopPropagation}
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={`px-3 py-3 min-h-[44px] cursor-pointer flex items-center justify-between touch-manipulation select-none ${themeClasses.hoverBgDisabled} ${isSelected ? themeClasses.multiselectOptionSelected : ""}`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <span
                        className={`text-sm ${isSelected ? themeClasses.multiselectSelectedText : themeClasses.textPrimary}`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckIcon className={`h-4 w-4 ${themeClasses.multiselectOptionCheck}`} />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={`px-3 py-2 text-sm ${themeClasses.textMuted}`}>
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className={`mt-2 text-sm ${themeClasses.textMuted}`}>{helperText}</p>
      )}
      {error && (
        <p className={`mt-2 text-sm ${themeClasses.textDanger} flex items-center`}>{error}</p>
      )}
    </div>
  );
});

// Set display name for React DevTools
MultiSelect.displayName = "MultiSelect";

export default MultiSelect;

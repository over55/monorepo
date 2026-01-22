// File: src/components/UIX/SkillSetTagPicker/SkillSetTagPicker.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static values outside component to prevent recreation
const DEFAULT_MAX_HEIGHT = "250px";
const DEFAULT_PLACEHOLDER = "Select skillsets...";

/**
 * SkillSetTagPicker Component - Performance Optimized
 * A dropdown that allows selecting multiple options displayed as removable tags
 * Similar to Semantic UI's Multiple Selection dropdown
 *
 * Uses position: fixed to break out of overflow: hidden containers
 *
 * @param {string} id - Unique identifier for the component
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
const SkillSetTagPicker = memo(function SkillSetTagPicker({
  id,
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
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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
      hoverBgDisabled: getThemeClasses("hover:bg-disabled"),
      hoverTextPrimary: getThemeClasses("hover:text-primary"),
    }),
    [getThemeClasses],
  );

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  // Update position when dropdown opens or window scrolls/resizes
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();

      const handleScrollOrResize = () => {
        updateDropdownPosition();
      };

      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);

      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Memoize click outside handler
  const handleClickOutside = useCallback((event) => {
    const isClickInContainer = containerRef.current && containerRef.current.contains(event.target);
    const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);

    if (!isClickInContainer && !isClickInDropdown) {
      setIsOpen(false);
      setSearchTerm("");
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Memoize expensive filtering operations
  const filteredOptions = useMemo(() => {
    const availableOptions = options.filter(
      (option) => !value.includes(option.value)
    );

    if (!searchTerm.trim()) {
      return availableOptions;
    }

    return availableOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, value, searchTerm]);

  // Memoize selected options with labels
  const selectedOptions = useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  // Event handlers
  const selectOption = useCallback(
    (optionValue) => {
      if (!value.includes(optionValue)) {
        onChange([...value, optionValue]);
        setSearchTerm("");
        inputRef.current?.focus();
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

  const openDropdown = useCallback(() => {
    if (!isOpen) {
      updateDropdownPosition();
      setIsOpen(true);
    }
  }, [isOpen, updateDropdownPosition]);

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      if (!isOpen) {
        openDropdown();
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        setIsOpen(false);
      }
    }
  }, [disabled, isOpen, openDropdown]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      openDropdown();
    }
  }, [isOpen, openDropdown]);

  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      openDropdown();
    }
  }, [disabled, openDropdown]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Backspace" && searchTerm === "" && selectedOptions.length > 0) {
      const lastOption = selectedOptions[selectedOptions.length - 1];
      onChange(value.filter((v) => v !== lastOption.value));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      selectOption(filteredOptions[0].value);
    }
  }, [searchTerm, selectedOptions, filteredOptions, value, onChange, selectOption]);

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
      <label className={`block text-lg sm:text-xl font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
        {label}
        {required && <span className={`${themeClasses.textDanger} ml-1`}>*</span>}
      </label>
    );
  }, [label, required, themeClasses.textPrimary, themeClasses.textDanger]);

  // Memoize main input className
  const mainInputClassName = useMemo(() => {
    const classes = [
      "min-h-[68px]",
      "px-5",
      "py-4",
      "border-2",
      "rounded-xl",
      "shadow-sm",
      "transition-all",
      "duration-200",
      "cursor-text",
      "flex",
      "flex-wrap",
      "items-center",
      "gap-2",
      "touch-manipulation",
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

  return (
    <div className={containerClassName}>
      {labelSection}

      <div className="relative" ref={containerRef}>
        {/* Main Input/Display Area */}
        <div onClick={toggleDropdown} className={mainInputClassName} style={{ WebkitTapHighlightColor: 'transparent' }}>
          {/* Selected Tags */}
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-4 py-2 rounded-lg text-lg sm:text-xl bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {option.label}
              {!disabled && (
                <button
                  onClick={(e) => removeOption(option.value, e)}
                  className="ml-2 min-w-[28px] min-h-[28px] flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 rounded touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  type="button"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </span>
          ))}

          {/* Search Input */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            onClick={stopPropagation}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            disabled={disabled}
            className={`flex-1 min-w-[100px] bg-transparent border-none outline-none text-lg sm:text-xl ${themeClasses.textPrimary} placeholder:${themeClasses.textMuted}`}
            autoComplete="off"
          />

          {/* Dropdown Arrow */}
          <div className="flex items-center ml-auto pl-2">
            <ChevronDownIcon
              className={`h-6 w-6 ${themeClasses.textMuted} transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Dropdown Menu - position fixed to break out of overflow:hidden */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className={`${themeClasses.bgCard} border ${themeClasses.inputBorder} rounded-xl shadow-lg`}
            style={dropdownStyle}
          >
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => selectOption(option.value)}
                    className={`px-5 py-4 min-h-[64px] cursor-pointer flex items-center text-lg sm:text-xl ${themeClasses.textPrimary} ${themeClasses.hoverBgDisabled} touch-manipulation select-none`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className={`px-5 py-4 text-lg sm:text-xl ${themeClasses.textMuted}`}>
                  {searchTerm ? "No matching options found" : "No options available"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className={`mt-3 text-base sm:text-lg ${themeClasses.textMuted}`}>{helperText}</p>
      )}
      {error && (
        <p className={`mt-3 text-base sm:text-lg ${themeClasses.textDanger} flex items-center`}>{error}</p>
      )}
    </div>
  );
});

SkillSetTagPicker.displayName = "SkillSetTagPicker";

export default SkillSetTagPicker;

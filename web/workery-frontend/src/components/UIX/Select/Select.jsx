// File: src/components/UIX/Select/Select.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo, useCallback, useId } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values and objects outside component to prevent recreation
const DEFAULT_PLACEHOLDER = "Select an option";
const DEFAULT_SIZE = "lg";

// Size classes with mobile-friendly touch targets (min 44px height)
const SIZE_CLASSES = {
  sm: "px-3 py-2.5 text-sm min-h-[44px]",
  md: "px-4 py-3 text-base min-h-[44px]",
  lg: "px-5 py-4 text-lg sm:text-xl min-h-[56px]",
};

const LABEL_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg sm:text-xl",
};

// Static SVG data URLs
const CHEVRON_DEFAULT = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`;
const CHEVRON_HOVER = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`;

// Static style object
const SELECT_BG_STYLE = {
  backgroundPosition: 'right 0.75rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.2em 1.2em',
};

/**
 * Select Component - Performance Optimized
 * Dropdown selection from list of options
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values and objects moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Memoized sections (label, icon, helper text, error)
 * - Memoized options list rendering
 * - Prevented unnecessary re-renders
 *
 * @param {string} id - Unique identifier for the select element
 * @param {string} label - Select label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler (receives the selected value directly, NOT the event)
 * @param {Array} options - Array of {value, label} objects
 * @param {string} error - Error message
 * @param {boolean} disabled - Whether select is disabled
 * @param {boolean} required - Whether select is required
 * @param {string} placeholder - Placeholder text
 * @param {string} helperText - Helper text below select
 * @param {React.Component} icon - Icon component
 * @param {string} size - Size variant (sm, md, lg)
 * @param {string} className - Additional CSS classes
 *
 * IMPORTANT: The onChange prop receives the selected value directly, NOT the event object.
 * Correct usage: onChange={(value) => setSelectedValue(value)}
 * Incorrect usage: onChange={(e) => setSelectedValue(e.target.value)} // This will cause errors!
 */
const Select = memo(function Select({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  placeholder = DEFAULT_PLACEHOLDER,
  helperText,
  icon: Icon,
  size = DEFAULT_SIZE,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Use React's useId for stable, hydration-safe unique IDs
  const reactId = useId();

  // Generate a unique id for the select field - use provided id, name, or React's stable useId
  const selectId = useMemo(() => {
    return id || name || `select${reactId}`;
  }, [id, name, reactId]);

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses('text-primary'),
      textDanger: getThemeClasses('text-danger'),
      textMuted: getThemeClasses('text-muted'),
      inputFocusRing: getThemeClasses('input-focus-ring'),
      inputBorder: getThemeClasses('input-border'),
      inputBorderError: getThemeClasses('input-border-error'),
      bgDisabled: getThemeClasses('bg-disabled'),
      bgCard: getThemeClasses('bg-card') || 'bg-white',
    }),
    [getThemeClasses],
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleMouseEnter = useCallback(
    (e) => {
      if (!disabled) {
        e.target.style.backgroundImage = CHEVRON_HOVER;
      }
    },
    [disabled],
  );

  const handleMouseLeave = useCallback(
    (e) => {
      if (!disabled) {
        e.target.style.backgroundImage = CHEVRON_DEFAULT;
      }
    },
    [disabled],
  );

  // Memoize className strings
  const labelClassName = useMemo(() => {
    return `block ${LABEL_SIZE_CLASSES[size]} font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`;
  }, [size, themeClasses.textPrimary]);

  const requiredClassName = useMemo(() => {
    return `ml-1 ${themeClasses.textDanger}`;
  }, [themeClasses.textDanger]);

  const iconClassName = useMemo(() => {
    return `h-6 w-6 ${themeClasses.textMuted}`;
  }, [themeClasses.textMuted]);

  // Select className with mobile optimizations
  const selectClassName = useMemo(() => {
    const baseClasses = [
      'w-full',
      SIZE_CLASSES[size],
      Icon ? 'pl-12 pr-12' : 'pr-12',
      'border-2 rounded-xl shadow-sm',
      'transition-all duration-200',
      'focus:outline-none',
      themeClasses.inputFocusRing,
      'appearance-none',
      themeClasses.bgCard,
      'cursor-pointer',
      'touch-manipulation',  // Mobile: prevent double-tap zoom
    ];

    if (error) {
      baseClasses.push(themeClasses.inputBorderError);
    } else {
      baseClasses.push(themeClasses.inputBorder);
    }

    if (disabled) {
      baseClasses.push(themeClasses.bgDisabled, 'cursor-not-allowed', 'opacity-60');
    }

    return baseClasses.join(' ');
  }, [size, Icon, error, disabled, themeClasses]);

  // Select style with mobile optimizations
  const selectStyle = useMemo(() => {
    return {
      ...SELECT_BG_STYLE,
      backgroundImage: CHEVRON_DEFAULT,
      WebkitTapHighlightColor: 'transparent',
      WebkitAppearance: 'none',
    };
  }, []);

  const helperTextClassName = useMemo(() => {
    return `mt-3 text-base sm:text-lg ${themeClasses.textMuted}`;
  }, [themeClasses.textMuted]);

  const errorClassName = useMemo(() => {
    return `mt-3 text-base sm:text-lg ${themeClasses.textDanger} flex items-center animate-fade-in`;
  }, [themeClasses.textDanger]);

  const errorIconClassName = useMemo(() => {
    return `h-5 w-5 mr-1.5 ${themeClasses.textDanger}`;
  }, [themeClasses.textDanger]);

  // Memoize label section
  const labelSection = useMemo(() => {
    if (!label) return null;

    return (
      <label htmlFor={selectId} className={labelClassName}>
        {label}
        {required && <span className={requiredClassName}>*</span>}
      </label>
    );
  }, [label, selectId, labelClassName, required, requiredClassName]);

  // Memoize icon section
  const iconSection = useMemo(() => {
    if (!Icon) return null;

    return (
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className={iconClassName} />
      </div>
    );
  }, [Icon, iconClassName]);

  // Memoize options list
  const optionsList = useMemo(() => {
    return (
      <>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </>
    );
  }, [placeholder, options]);

  // Memoize helper text section
  const helperTextSection = useMemo(() => {
    if (!helperText || error) return null;

    return <p className={helperTextClassName}>{helperText}</p>;
  }, [helperText, error, helperTextClassName]);

  // Memoize error section
  const errorSection = useMemo(() => {
    if (!error) return null;

    return (
      <p className={errorClassName}>
        <ExclamationTriangleIcon className={errorIconClassName} />
        {error}
      </p>
    );
  }, [error, errorClassName, errorIconClassName]);

  return (
    <div className={className}>
      {labelSection}
      <div className="relative">
        {iconSection}
        <select
          id={selectId}
          name={name || selectId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={selectClassName}
          style={selectStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {optionsList}
        </select>
      </div>
      {helperTextSection}
      {errorSection}
    </div>
  );
});

// Set display name for React DevTools
Select.displayName = 'Select';

export default Select;

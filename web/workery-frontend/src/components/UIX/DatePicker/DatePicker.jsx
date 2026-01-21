// File: src/components/UIX/DatePicker/DatePicker.jsx
// Enhanced DatePicker with custom calendar dropdown - Performance Optimized
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move all constants outside component to prevent recreation
// Size classes with mobile-friendly touch targets (min 44px height)
const SIZE_CLASSES = {
  sm: "px-3 py-2.5 text-base min-h-[44px]",
  md: "px-4 py-3 text-base min-h-[44px]",
  lg: "px-5 py-4 text-base sm:text-lg min-h-[48px]",
};

const LABEL_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base sm:text-lg",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Static helper functions outside component
const formatDisplayDate = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatInputDate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

const getCalendarDays = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

/**
 * Enhanced DatePicker Component with Custom Calendar Dropdown
 * Provides a beautiful, customizable date picker that matches our UIX design system
 */
const DatePicker = memo(
  ({
    label,
    value,
    onChange,
    error,
    disabled = false,
    required = false,
    min,
    max,
    helperText,
    className = "",
    placeholder = "Select a date",
    size = "lg",
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(() => ({
      textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
      textSecondary: getThemeClasses("text-secondary") || "text-gray-700 dark:text-gray-300",
      textMuted: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
      textError: getThemeClasses("text-error") || "text-red-600 dark:text-red-400",
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      bgMuted: getThemeClasses("bg-muted") || "bg-gray-50 dark:bg-gray-700",
      borderLight: getThemeClasses("border-light") || "border-gray-200 dark:border-gray-700",
      borderMedium: getThemeClasses("border-medium") || "border-gray-300 dark:border-gray-600",
      borderError: getThemeClasses("border-error") || "border-red-500 dark:border-red-400",
      borderPrimary: getThemeClasses("border-primary") || "border-red-500 dark:border-red-400",
      focusRing: getThemeClasses("focus-ring") || "ring-4 ring-red-500/20 dark:ring-red-400/20",
      hoverBgLight: getThemeClasses("hover-bg-light") || "hover:bg-gray-100 dark:hover:bg-gray-700",
      hoverBorderMedium: getThemeClasses("hover-border-medium") || "hover:border-gray-400 dark:hover:border-gray-500",
      // Calendar specific
      daySelected: getThemeClasses("calendar-day-selected") || "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      dayToday: getThemeClasses("calendar-day-today") || "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50",
      dayDisabled: getThemeClasses("calendar-day-disabled") || "text-gray-300 dark:text-gray-600",
      dayNormal: getThemeClasses("calendar-day-normal") || "text-gray-700 dark:text-gray-300",
      // Buttons
      btnPrimaryText: getThemeClasses("btn-primary-text") || "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
    }), [getThemeClasses]);

    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => {
      if (value) {
        const date = new Date(value);
        return new Date(date.getFullYear(), date.getMonth(), 1);
      }
      return new Date();
    });

    // State for editable year and month
    const [isEditingYear, setIsEditingYear] = useState(false);
    const [yearInputValue, setYearInputValue] = useState("");
    const [isEditingMonth, setIsEditingMonth] = useState(false);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const portalContainerRef = useRef(null);
    const yearInputRef = useRef(null);
    // Ref to track the latest currentMonth for immediate access during blur->click sequences
    const currentMonthRef = useRef(currentMonth);

    // Parse the selected date from value prop
    const selectedDate = useMemo(() => {
      return value ? new Date(value) : null;
    }, [value]);

    // Create portal container on mount, cleanup on unmount
    useEffect(() => {
      if (!portalContainerRef.current) {
        portalContainerRef.current = document.createElement("div");
        portalContainerRef.current.style.position = "absolute";
        portalContainerRef.current.style.zIndex = "9999";
        document.body.appendChild(portalContainerRef.current);
      }

      return () => {
        if (
          portalContainerRef.current &&
          document.body.contains(portalContainerRef.current)
        ) {
          document.body.removeChild(portalContainerRef.current);
          portalContainerRef.current = null;
        }
      };
    }, []);

    // Update dropdown position when opened
    const updateDropdownPosition = useCallback(() => {
      if (inputRef.current && portalContainerRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        portalContainerRef.current.style.top = `${rect.bottom + scrollTop + 8}px`;
        portalContainerRef.current.style.left = `${rect.left + scrollLeft}px`;
      }
    }, []);

    // Handle click outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      // Add small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Update position on scroll or resize when dropdown is open
    useEffect(() => {
      if (!isOpen) return;

      updateDropdownPosition();

      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }, [isOpen, updateDropdownPosition]);

    // Update current month when value changes
    useEffect(() => {
      if (value) {
        const date = new Date(value);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }, [value]);

    // Memoized event handlers
    const handleDateSelect = useCallback(
      (date) => {
        // Use the ref to get the latest month/year in case blur just updated it
        const latestMonth = currentMonthRef.current;
        const correctedDate = new Date(
          latestMonth.getFullYear(),
          latestMonth.getMonth(),
          date.getDate()
        );
        const formattedDate = formatInputDate(correctedDate);
        onChange(formattedDate);
        setIsOpen(false);
      },
      [onChange],
    );

    const handleToggleOpen = useCallback(() => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
      }
    }, [disabled]);

    const navigateMonth = useCallback((direction) => {
      setCurrentMonth((prev) => {
        const newMonth = new Date(prev);
        newMonth.setMonth(prev.getMonth() + direction);
        // Keep ref in sync
        currentMonthRef.current = newMonth;
        return newMonth;
      });
    }, []);

    // Year editing handlers
    const handleYearClick = useCallback(() => {
      setYearInputValue(String(currentMonth.getFullYear()));
      setIsEditingYear(true);
      setIsEditingMonth(false);
      // Focus the input after render
      setTimeout(() => yearInputRef.current?.focus(), 0);
    }, [currentMonth]);

    const handleYearInputChange = useCallback((e) => {
      // Only allow digits
      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
      setYearInputValue(val);
    }, []);

    const handleYearInputBlur = useCallback(() => {
      const year = parseInt(yearInputValue, 10);
      if (year && year >= 1900 && year <= 2100) {
        const newMonth = new Date(year, currentMonth.getMonth(), 1);
        // Update ref immediately so handleDateSelect can access it before re-render
        currentMonthRef.current = newMonth;
        setCurrentMonth(newMonth);
      }
      setIsEditingYear(false);
    }, [yearInputValue, currentMonth]);

    const handleYearInputKeyDown = useCallback((e) => {
      if (e.key === "Enter") {
        handleYearInputBlur();
      } else if (e.key === "Escape") {
        setIsEditingYear(false);
      }
    }, [handleYearInputBlur]);

    // Month editing handlers
    const handleMonthClick = useCallback(() => {
      setIsEditingMonth(true);
      setIsEditingYear(false);
    }, []);

    const handleMonthSelect = useCallback((monthIndex) => {
      setCurrentMonth((prev) => {
        const newMonth = new Date(prev.getFullYear(), monthIndex, 1);
        // Keep ref in sync
        currentMonthRef.current = newMonth;
        return newMonth;
      });
      setIsEditingMonth(false);
    }, []);

    const handleToday = useCallback(() => {
      handleDateSelect(new Date());
    }, [handleDateSelect]);

    const handleClear = useCallback(() => {
      onChange("");
      setIsOpen(false);
    }, [onChange]);

    // Memoize date checking functions
    const isDateDisabled = useCallback(
      (date) => {
        if (!date) return false;
        if (min && date < new Date(min)) return true;
        if (max && date > new Date(max)) return true;
        return false;
      },
      [min, max],
    );

    const isSelected = useCallback(
      (date) => {
        return isSameDate(date, selectedDate);
      },
      [selectedDate],
    );

    // Memoize calendar days
    const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

    // Memoize formatted display value
    const displayValue = useMemo(() => {
      return selectedDate ? formatDisplayDate(selectedDate) : placeholder;
    }, [selectedDate, placeholder]);

    // Memoize classes
    const sizeClass = SIZE_CLASSES[size];
    const labelSizeClass = LABEL_SIZE_CLASSES[size];

    const inputClasses = useMemo(
      () =>
        `
    w-full
    ${sizeClass}
    pl-10 pr-5
    border-2 ${themeClasses.borderLight} rounded-xl shadow-sm
    transition-all duration-200
    cursor-pointer
    flex items-center justify-between
    ${error ? themeClasses.borderError : isOpen ? `${themeClasses.borderPrimary} ${themeClasses.focusRing}` : `${themeClasses.borderMedium} ${themeClasses.hoverBorderMedium}`}
    ${disabled ? `${themeClasses.bgMuted} cursor-not-allowed` : themeClasses.bgCard}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [sizeClass, error, isOpen, disabled, themeClasses],
    );

    const labelClasses = useMemo(
      () =>
        `block ${labelSizeClass} font-semibold ${themeClasses.textSecondary} mb-3 flex items-center`,
      [labelSizeClass, themeClasses],
    );

    return (
      <div className={`${className} relative`}>
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className={`${themeClasses.textError} ml-1`}>*</span>}
          </label>
        )}

        <div className="relative">
          <div
            ref={inputRef}
            onClick={handleToggleOpen}
            className={`${inputClasses} touch-manipulation select-none`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <CalendarDaysIcon className={`absolute left-3 h-5 w-5 ${themeClasses.textMuted}`} />
            <span className={selectedDate ? themeClasses.textPrimary : themeClasses.textMuted}>
              {displayValue}
            </span>
            <CalendarDaysIcon className={`h-4 w-4 ${themeClasses.textMuted}`} />
          </div>
        </div>

        {/* Custom Calendar Dropdown - Rendered as Portal */}
        {isOpen &&
          !disabled &&
          portalContainerRef.current &&
          createPortal(
            <div
              ref={dropdownRef}
              className={`w-80 ${themeClasses.bgCard} border ${themeClasses.borderLight} rounded-xl shadow-2xl p-4`}
              style={{ maxHeight: "400px" }}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${themeClasses.hoverBgLight} rounded-lg transition-colors touch-manipulation`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <ChevronLeftIcon className={`h-5 w-5 ${themeClasses.textSecondary}`} />
                </button>
                <div className="flex items-center gap-1">
                  {/* Clickable Month */}
                  <button
                    type="button"
                    onClick={handleMonthClick}
                    className={`text-lg font-semibold ${themeClasses.textPrimary} hover:underline cursor-pointer px-1`}
                  >
                    {MONTH_NAMES[currentMonth.getMonth()]}
                  </button>
                  {/* Editable Year */}
                  {isEditingYear ? (
                    <input
                      ref={yearInputRef}
                      type="text"
                      inputMode="numeric"
                      value={yearInputValue}
                      onChange={handleYearInputChange}
                      onBlur={handleYearInputBlur}
                      onKeyDown={handleYearInputKeyDown}
                      className={`w-16 text-lg font-semibold ${themeClasses.textPrimary} ${themeClasses.bgCard} border ${themeClasses.borderMedium} rounded px-1 text-center focus:outline-none focus:ring-2 focus:ring-red-500`}
                      maxLength={4}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={handleYearClick}
                      className={`text-lg font-semibold ${themeClasses.textPrimary} hover:underline cursor-pointer px-1`}
                    >
                      {currentMonth.getFullYear()}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${themeClasses.hoverBgLight} rounded-lg transition-colors touch-manipulation`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <ChevronRightIcon className={`h-5 w-5 ${themeClasses.textSecondary}`} />
                </button>
              </div>

              {/* Month Selection Grid (shown when editing month) */}
              {isEditingMonth && (
                <div className="grid grid-cols-3 gap-2 mb-4 p-2 border rounded-lg">
                  {MONTH_NAMES.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`py-2 px-1 text-sm rounded-lg transition-colors touch-manipulation
                        ${currentMonth.getMonth() === index
                          ? themeClasses.daySelected
                          : `${themeClasses.textPrimary} ${themeClasses.hoverBgLight}`
                        }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_HEADERS.map((day) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium ${themeClasses.textMuted} py-2`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  const dateDisabled = !date || isDateDisabled(date);
                  const selected = isSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        date && !dateDisabled && handleDateSelect(date)
                      }
                      disabled={dateDisabled}
                      className={`
                      h-11 w-11 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation
                      ${!date ? "invisible" : ""}
                      ${dateDisabled ? `${themeClasses.dayDisabled} cursor-not-allowed` : `${themeClasses.hoverBgLight} cursor-pointer`}
                      ${selected ? themeClasses.daySelected : today ? themeClasses.dayToday : themeClasses.dayNormal}
                    `
                        .replace(/\s+/g, " ")
                        .trim()}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {date?.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className={`flex justify-between items-center mt-4 pt-4 border-t ${themeClasses.borderLight}`}>
                <button
                  type="button"
                  onClick={handleToday}
                  className={`text-sm ${themeClasses.btnPrimaryText} font-medium`}
                >
                  Today
                </button>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`text-sm ${themeClasses.textMuted} hover:${themeClasses.textSecondary}`}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>,
            portalContainerRef.current,
          )}

        {helperText && !error && (
          <p className={`mt-1 text-xs ${themeClasses.textMuted}`}>{helperText}</p>
        )}
        {error && (
          <p className={`mt-1 text-sm ${themeClasses.textError} flex items-center`}>
            <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

// Add display name for better debugging
DatePicker.displayName = "DatePicker";

export default DatePicker;

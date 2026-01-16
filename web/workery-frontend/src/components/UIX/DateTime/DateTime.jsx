// File: web/frontend/src/components/UI/DateTime/DateTime.jsx
// UIX Mobile Optimizations Applied

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Constants outside component to prevent recreation
const QUICK_TIME_OPTIONS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
];
const QUICK_DURATION_OPTIONS = [1, 2, 4, 6, 8, 12];

// Helper functions outside component
const formatTime12Hour = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const dt = new Date(year, month - 1, day);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatDateLong = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const dt = new Date(year, month - 1, day);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  let durationMinutes = endTotalMinutes - startTotalMinutes;

  // Handle next day scenario
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;

  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
};

const getDateOffset = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * DateTime Component
 * Combined date and time picker with support for start/end times
 */
const DateTime = memo(
  ({
    id,
    label,
    value = { date: "", startTime: "", endTime: "" },
    onChange,
    error,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    minTime = "00:00",
    maxTime = "23:59",
    helperText,
    className = "",
    placeholder = "Select date and time",
    showSeconds = false,
    enableEndTime = true,
    defaultDuration = 60,
  }) => {
    const { getThemeClasses } = useUIXTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [activeTab, setActiveTab] = useState("date");
    const pickerRef = useRef(null);

    // Normalize value to ensure correct structure
    const normalizedValue = useMemo(
      () => ({
        date: value?.date || "",
        startTime: value?.startTime || "",
        endTime: value?.endTime || "",
      }),
      [value?.date, value?.startTime, value?.endTime],
    );

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        textPrimary: getThemeClasses("text-primary") || "text-gray-900",
        textDanger: getThemeClasses("text-danger") || "text-red-600",
        textMuted: getThemeClasses("text-muted") || "text-gray-600",
        textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
        hoverTextPrimary: getThemeClasses("hover:text-primary") || "hover:text-gray-900",
        inputBorder: getThemeClasses("input-border") || "border-gray-300",
        inputBorderError: getThemeClasses("input-border-error") || "border-red-500",
        inputFocusRing: getThemeClasses("input-focus-ring") || "ring-2 ring-red-500/20",
        bgDisabled: getThemeClasses("bg-disabled") || "bg-gray-100",
        bgCard: getThemeClasses("bg-card") || "bg-white",
        bgMuted: getThemeClasses("bg-muted") || "bg-gray-50",
        borderLight: getThemeClasses("border-light") || "border-gray-200",
        // Tab styles
        tabActive: getThemeClasses("tab-active") || "text-red-600 border-b-2 border-red-600",
        tabInactive: getThemeClasses("tab-inactive") || "text-gray-600 hover:text-gray-800",
        // Input focus
        inputFocus: getThemeClasses("input-focus") || "focus:ring-2 focus:ring-red-500",
        // Hover backgrounds
        hoverBgLight: getThemeClasses("hover-bg-light") || "hover:bg-gray-100",
        // Button colors
        btnPrimaryBg: getThemeClasses("btn-primary-bg") || "bg-red-600",
        btnPrimaryHover: getThemeClasses("btn-primary-hover") || "hover:bg-red-700",
        btnGhostHover: getThemeClasses("btn-ghost-hover") || "hover:text-gray-800",
      }),
      [getThemeClasses],
    );

    // Memoize display value
    const displayValue = useMemo(() => {
      const { date, startTime, endTime } = normalizedValue;

      if (!date && !startTime && !endTime) return "";

      let display = "";

      if (date) {
        display = formatDateLong(date);
      }

      if (startTime) {
        display += display ? ", " : "";
        display += formatTime12Hour(startTime);

        if (enableEndTime && endTime) {
          display += ` - ${formatTime12Hour(endTime)}`;
        }
      }

      return display;
    }, [normalizedValue, enableEndTime]);

    // Memoize duration
    const duration = useMemo(() => {
      if (!enableEndTime) return null;
      return calculateDuration(
        normalizedValue.startTime,
        normalizedValue.endTime,
      );
    }, [enableEndTime, normalizedValue.startTime, normalizedValue.endTime]);

    // Memoize time range validation
    const timeRangeError = useMemo(() => {
      if (!enableEndTime) return null;
      const startTime = normalizedValue.startTime;
      const endTime = normalizedValue.endTime;
      if (startTime && endTime && endTime <= startTime) {
        return "End time must be after start time";
      }
      return null;
    }, [enableEndTime, normalizedValue]);

    // Event handlers
    const handleDateChange = useCallback(
      (newDate) => {
        onChange({
          ...normalizedValue,
          date: newDate,
        });
      },
      [onChange, normalizedValue],
    );

    const handleStartTimeChange = useCallback(
      (newStartTime) => {
        let newEndTime = normalizedValue.endTime;

        if (enableEndTime && (!newEndTime || newStartTime >= newEndTime)) {
          newEndTime = calculateEndTime(newStartTime, defaultDuration);
        }

        onChange({
          ...normalizedValue,
          startTime: newStartTime,
          ...(enableEndTime ? { endTime: newEndTime } : {}),
        });
      },
      [onChange, normalizedValue, enableEndTime, defaultDuration],
    );

    const handleEndTimeChange = useCallback(
      (newEndTime) => {
        if (
          normalizedValue.startTime &&
          newEndTime <= normalizedValue.startTime
        ) {
          return;
        }

        onChange({
          ...normalizedValue,
          endTime: newEndTime,
        });
      },
      [onChange, normalizedValue],
    );

    const handleClear = useCallback(
      (e) => {
        e.stopPropagation();
        onChange({ date: "", startTime: "", endTime: "" });
        setShowPicker(false);
      },
      [onChange],
    );

    const togglePicker = useCallback(() => {
      if (!disabled) {
        setShowPicker((prev) => !prev);
      }
    }, [disabled]);

    const handleKeyDown = useCallback(
      (e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          setShowPicker((prev) => !prev);
        }
      },
      [disabled],
    );

    const handleTomorrow = useCallback(() => {
      handleDateChange(getDateOffset(1));
    }, [handleDateChange]);

    const handleNextWeek = useCallback(() => {
      handleDateChange(getDateOffset(7));
    }, [handleDateChange]);

    const handleNextMonth = useCallback(() => {
      handleDateChange(getNextMonth());
    }, [handleDateChange]);

    const handleDone = useCallback(() => {
      setShowPicker(false);
    }, []);

    const handleCancel = useCallback(() => {
      setShowPicker(false);
    }, []);

    // Click outside handler
    useEffect(() => {
      if (!showPicker) return;

      const handleClickOutside = (event) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target)) {
          setShowPicker(false);
        }
      };

      // Delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showPicker]);

    // Memoize quick duration options
    const quickDurationButtons = useMemo(() => {
      if (!normalizedValue.startTime) return null;

      return QUICK_DURATION_OPTIONS.map((hours) => {
        const endTime = calculateEndTime(normalizedValue.startTime, hours * 60);
        const label = `+${hours}h`;

        return { hours, endTime, label };
      });
    }, [normalizedValue.startTime]);

    // Memoize input classes
    const inputClasses = useMemo(
      () =>
        `
    w-full px-4 py-3 pr-10 min-h-[44px]
    border rounded-lg
    transition-all duration-200
    cursor-pointer touch-manipulation select-none
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error || timeRangeError ? themeClasses.inputBorderError : themeClasses.inputBorder}
    ${disabled ? `${themeClasses.bgDisabled} cursor-not-allowed opacity-60` : themeClasses.bgCard}
    ${showPicker ? themeClasses.inputFocusRing : ""}
  `
          .replace(/\s+/g, " ")
          .trim(),
      [error, timeRangeError, disabled, showPicker, themeClasses],
    );

    const labelClasses = useMemo(
      () =>
        `block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`,
      [themeClasses.textPrimary],
    );

    return (
      <div className={`mb-5 ${className}`}>
        {label && (
          <div className={labelClasses}>
            {label}
            {required && (
              <span className={`ml-1 ${themeClasses.textDanger}`}>*</span>
            )}
          </div>
        )}

        <div className="relative" ref={pickerRef}>
          {/* Display Input */}
          <div
            id={id}
            tabIndex={disabled ? -1 : 0}
            role="button"
            onClick={togglePicker}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon
                  className={`h-5 w-5 ${themeClasses.textSecondary} mr-2`}
                />
                <span
                  className={
                    displayValue
                      ? themeClasses.textPrimary
                      : themeClasses.textMuted
                  }
                >
                  {displayValue || placeholder}
                </span>
              </div>
              {duration && (
                <span className={`text-sm ${themeClasses.textSecondary} mr-6`}>
                  ({duration})
                </span>
              )}
            </div>
          </div>

          {/* Clear button */}
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${themeClasses.textSecondary} ${themeClasses.hoverTextPrimary}`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          {/* Picker Dropdown */}
          {showPicker && !disabled && (
            <div
              className={`absolute z-50 mt-1 ${themeClasses.bgCard} border ${themeClasses.inputBorder} rounded-lg shadow-lg w-80`}
            >
              {/* Tab Navigation */}
              <div className={`flex border-b ${themeClasses.borderLight}`}>
                <button
                  type="button"
                  onClick={() => setActiveTab("date")}
                  className={`flex-1 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors touch-manipulation ${
                    activeTab === "date"
                      ? themeClasses.tabActive
                      : themeClasses.tabInactive
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("startTime")}
                  className={`flex-1 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors touch-manipulation ${
                    activeTab === "startTime"
                      ? themeClasses.tabActive
                      : themeClasses.tabInactive
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Start
                </button>
                {enableEndTime && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("endTime")}
                    className={`flex-1 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors touch-manipulation ${
                      activeTab === "endTime"
                        ? themeClasses.tabActive
                        : themeClasses.tabInactive
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    End
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === "date" ? (
                  <div>
                    <input
                      type="date"
                      value={normalizedValue.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={minDate}
                      max={maxDate}
                      className={`w-full px-3 py-3 min-h-[44px] text-base border ${themeClasses.inputBorder} rounded-md focus:outline-none ${themeClasses.inputFocus} touch-manipulation`}
                      style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
                    />

                    {/* Quick date options */}
                    <div className="mt-3 space-y-1">
                      <button
                        type="button"
                        onClick={handleTomorrow}
                        className={`block w-full text-left px-3 py-3 min-h-[44px] text-sm ${themeClasses.textSecondary} ${themeClasses.hoverBgLight} rounded-md touch-manipulation`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={handleNextWeek}
                        className={`block w-full text-left px-3 py-3 min-h-[44px] text-sm ${themeClasses.textSecondary} ${themeClasses.hoverBgLight} rounded-md touch-manipulation`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        Next week
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className={`block w-full text-left px-3 py-3 min-h-[44px] text-sm ${themeClasses.textSecondary} ${themeClasses.hoverBgLight} rounded-md touch-manipulation`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        Next month
                      </button>
                    </div>
                  </div>
                ) : activeTab === "startTime" ? (
                  <div>
                    <label className={`block text-xs ${themeClasses.textSecondary} mb-2`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={normalizedValue.startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      min={minTime}
                      max={maxTime}
                      step={showSeconds ? 1 : 60}
                      className={`w-full px-3 py-3 min-h-[44px] text-base border ${themeClasses.inputBorder} rounded-md focus:outline-none ${themeClasses.inputFocus} touch-manipulation`}
                      style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
                    />

                    {/* Quick time options */}
                    <div className="mt-3 grid grid-cols-3 gap-1">
                      {QUICK_TIME_OPTIONS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleStartTimeChange(time)}
                          className={`px-2 py-2 min-h-[40px] text-sm ${themeClasses.textSecondary} ${themeClasses.hoverBgLight} rounded-md touch-manipulation`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {formatTime12Hour(time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={`block text-xs ${themeClasses.textSecondary} mb-2`}>
                      End Time
                      {normalizedValue.startTime && (
                        <span className={`${themeClasses.textMuted} ml-1`}>
                          (after {formatTime12Hour(normalizedValue.startTime)})
                        </span>
                      )}
                    </label>
                    <input
                      type="time"
                      value={normalizedValue.endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      min={normalizedValue.startTime || minTime}
                      max={maxTime}
                      step={showSeconds ? 1 : 60}
                      className={`w-full px-3 py-3 min-h-[44px] text-base border ${themeClasses.inputBorder} rounded-md focus:outline-none ${themeClasses.inputFocus} touch-manipulation`}
                      style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none' }}
                    />

                    {/* Quick duration options from start time */}
                    {quickDurationButtons && (
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {quickDurationButtons.map(
                          ({ hours, endTime, label }) => (
                            <button
                              key={hours}
                              type="button"
                              onClick={() => handleEndTimeChange(endTime)}
                              className={`px-2 py-2 min-h-[40px] text-sm ${themeClasses.textSecondary} ${themeClasses.hoverBgLight} rounded-md touch-manipulation`}
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                              {label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              {(normalizedValue.date ||
                normalizedValue.startTime ||
                normalizedValue.endTime) && (
                <div className={`px-4 py-2 ${themeClasses.bgMuted} border-t ${themeClasses.borderLight}`}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      {normalizedValue.date && (
                        <span className={themeClasses.textSecondary}>
                          📅 {formatDateShort(normalizedValue.date)}
                        </span>
                      )}
                      {normalizedValue.startTime && (
                        <span className={themeClasses.textSecondary}>
                          ⏰ {formatTime12Hour(normalizedValue.startTime)}
                          {enableEndTime &&
                            normalizedValue.endTime &&
                            ` - ${formatTime12Hour(normalizedValue.endTime)}`}
                        </span>
                      )}
                    </div>
                    {duration && (
                      <span className={`${themeClasses.textMuted} text-xs`}>{duration}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={`px-4 py-3 ${themeClasses.bgMuted} border-t ${themeClasses.borderLight} flex justify-between`}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-4 py-2 min-h-[44px] text-sm ${themeClasses.textSecondary} ${themeClasses.btnGhostHover} touch-manipulation`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className={`px-4 py-2 min-h-[44px] text-sm ${themeClasses.btnPrimaryBg} text-white rounded-md ${themeClasses.btnPrimaryHover} touch-manipulation`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {helperText && !error && !timeRangeError && (
          <p className={`mt-2 text-sm ${themeClasses.textSecondary}`}>
            {helperText}
          </p>
        )}
        {(error || timeRangeError) && (
          <p
            className={`mt-2 text-sm ${themeClasses.textDanger} flex items-center`}
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            {error || timeRangeError}
          </p>
        )}
      </div>
    );
  },
);

// Add display name for better debugging
DateTime.displayName = "DateTime";

// Export with multiple names for flexibility
export default DateTime;
export { DateTime as DateTimePicker };

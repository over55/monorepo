// File: monorepo/web/frontend/src/components/business/selects/ServiceFeeSelect.jsx

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading, useUIXTheme } from "../../UIX";
import { useServiceFeeManager } from "../../../services/Services";

/**
 * Reusable Service Fee Select Component
 *
 * @param {string|number} value - Current selected service fee ID
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {function} onOtherDetected - Callback when "Other" option is selected (receives boolean)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Service Fee")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} placeholder - Custom placeholder (defaults to "Please select")
 */
function ServiceFeeSelect({
  value,
  onChange,
  onOtherDetected,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Service Fee",
  helperText = "",
  onUnauthorized = null,
  placeholder = "Please select",
}) {
  const serviceFeeManager = useServiceFeeManager();
  const { getThemeClasses } = useUIXTheme();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch options only once on mount (serviceFeeManager is stable)
  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch options from the API/cache
        const apiOptions =
          await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          // Format options - The API should return them in {value, label} format
          // but we'll ensure they're formatted correctly
          const formattedOptions = Array.isArray(apiOptions)
            ? apiOptions
            : apiOptions?.results || apiOptions?.data || [];

          // Ensure each option has value and label properties
          const validOptions = formattedOptions
            .filter(
              (opt) => opt && (opt.value !== undefined || opt.id !== undefined),
            )
            .map((opt) => ({
              value: opt.value !== undefined ? opt.value : opt.id,
              label:
                opt.label || opt.title || opt.name || `Service Fee ${opt.id}`,
            }));

          setOptions(validOptions);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching service fee options:", error);
        }
        if (mounted) {
          setFetchError(
            "Failed to load service fee options. Please try again.",
          );
          // Set empty options on error
          setOptions([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, [serviceFeeManager]);

  // Check if current value is "Other" option when value or options change
  useEffect(() => {
    if (value && onOtherDetected && options.length > 0) {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(value),
      );
      if (selectedOption?.label?.toLowerCase() === "other") {
        onOtherDetected(true);
      }
    }
  }, [value, options, onOtherDetected]);

  // Auto-select first option when options are loaded and no value is set
  useEffect(() => {
    if (options.length > 0 && !value && onChange) {
      onChange(String(options[0].value));
    }
  }, [options, value, onChange]);

  // Note: Select component passes the value directly to onChange, NOT the event
  const handleChange = (selectedValue) => {
    // Check if "Other" was selected
    if (options.length > 0 && onOtherDetected) {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(selectedValue),
      );

      // Check if the label is "Other" (case-insensitive)
      const isOther =
        selectedOption &&
        selectedOption.label &&
        selectedOption.label.toLowerCase() === "other";

      onOtherDetected(isOther);
    }

    // Call the original onChange with just the value
    onChange(selectedValue);
  };

  if (isLoading) {
    return (
      <FormGroup label={label} required={required} className={className}>
        <div
          className={`p-2.5 border rounded ${getThemeClasses("border-secondary")} ${getThemeClasses("bg-disabled")} flex items-center justify-center min-h-[42px]`}
        >
          <Loading size="sm" text="Loading service fees..." />
        </div>
      </FormGroup>
    );
  }

  return (
    <Select
      label={label}
      value={value}
      onChange={handleChange}
      options={options}
      error={error || fetchError}
      disabled={disabled}
      required={required}
      placeholder=""
      helperText={helperText}
      className={className}
    />
  );
}

export default ServiceFeeSelect;
